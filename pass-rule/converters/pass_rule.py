import re
from dataclasses import dataclass

# One regex for the whole string, rather than splitting on "::".
# 1. length range,
# 2. L/U/D/S codes (fixed order, each optional), and
# 3. an optional trailing "::symbols" segment. matching the tail with (.*)

_RULE_RE = re.compile(r"^(\d+)-(\d+)::(?:L(\d*))?(?:U(\d*))?(?:D(\d*))?(?:S(\d*))?(?:::(.*))?$")

_COUNT_FIELDS = (
    ("L", "min_lower_chars"),
    ("U", "min_upper_chars"),
    ("D", "min_digits"),
    ("S", "min_symbols"),
)


@dataclass
class PassRule:
    min_chars: int
    max_chars: int
    min_lower_chars: int = -1
    min_upper_chars: int = -1
    min_digits: int = -1
    min_symbols: int = -1
    symbols: str = ""

    def __post_init__(self):
        if self.min_chars > self.max_chars:
            raise ValueError(f"min_chars ({self.min_chars}) cannot exceed max_chars ({self.max_chars})")
        total = sum(value for _, attr in _COUNT_FIELDS if (value := getattr(self, attr)) > 0)
        if total > self.max_chars:
            raise ValueError(f"Sum of minimum character counts ({total}) exceeds max_chars ({self.max_chars})")

    def __repr__(self):
        counts = "".join(f"{code}{value or ''}" for code, attr in _COUNT_FIELDS if (value := getattr(self, attr)) >= 0)
        parts = [f"{self.min_chars}-{self.max_chars}", counts]

        if self.min_symbols >= 0 and self.symbols:
            parts.append(self.symbols)
        return "::".join(parts)

    @classmethod
    def from_str(cls, rule: str):
        def _get_count(x: str | None) -> int:
            return -1 if x is None else int(x or "0")

        match = _RULE_RE.fullmatch(rule)
        if not match:
            raise ValueError(
                f"Invalid PassRule string (expected MIN-MAX::L#U#D#S#::SYMBOLS, codes in L, U, D, S order): {rule!r}"
            )
        min_chars, max_chars, L, U, D, S, symbols = match.groups()

        return cls(
            int(min_chars),
            int(max_chars),
            min_lower_chars=_get_count(L),
            min_upper_chars=_get_count(U),
            min_digits=_get_count(D),
            min_symbols=_get_count(S),
            symbols=symbols or "",
        )

    def validate(self, password: str) -> bool:
        if not password.isascii():
            raise ValueError("Password must contain only ASCII characters")

        n = len(password)
        if n < self.min_chars or n > self.max_chars:
            raise ValueError("Password length out of range")

        count = [0] * 4
        for char in password:
            if not char.isalnum():
                if char not in (self.symbols or char):
                    raise ValueError(f"Invalid symbol {char!r}")
                count[3] += 1
            elif char.isdigit():
                count[2] += 1
            elif char.isupper():
                count[1] += 1
            else:
                count[0] += 1

        for cnt, rule in zip(count, _COUNT_FIELDS):
            min_count = getattr(self, rule[1])
            if min_count < 0 < cnt:
                raise ValueError(f"Invalid character of type {rule[0]}")
            if cnt < min_count:
                raise ValueError(f"Password should have atleast {min_count} {rule[1]} ")

        return True


def tests():
    # valid passwords
    for pwd in ("abcDEf", "abcDEfgh#$"):
        assert pass_rule.validate(pwd)
    print("Tests passed for valid passwords")

    invalid_pwds = (
        ("asgd", "out of range"),
        ("abcdefghijklm", "out of range"),
        ("abcdef", "min_upper"),
        ("abcDE1", "Invalid char"),
        ("abc@DE1", "Invalid symbol"),
    )
    for pwd, msg in invalid_pwds:
        try:
            pass_rule.validate(pwd)
            assert False, "Expected a ValueError"
        except ValueError as e:
            assert msg in e.args[0]

    print("Tests passed for invalid passwords")


if __name__ == "__main__":
    pass_rule = PassRule(6, 12, min_lower_chars=1, min_upper_chars=2, min_symbols=0, symbols="#$%")
    pass_rule_text = str(pass_rule)
    print(pass_rule, pass_rule == PassRule.from_str(pass_rule_text))
    tests()
