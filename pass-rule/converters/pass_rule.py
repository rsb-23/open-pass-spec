import re
from dataclasses import dataclass

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
    def from_str(cls, s: str):
        range_part, counts_part, *rest = s.split("::", 2)
        min_chars, max_chars = map(int, range_part.split("-"))

        seen = set()
        values = {}
        for code, num in re.findall(r"([LUDSluds])(\d*)", counts_part.upper()):
            if code in seen:
                raise ValueError(f"Duplicate rule: {code}")
            seen.add(code)
            values[code] = int(num) if num else 0

        kwargs = {attr: values.get(code, -1) for code, attr in _COUNT_FIELDS}
        if rest:
            kwargs["symbols"] = rest[0]

        return cls(min_chars, max_chars, **kwargs)


if __name__ == "__main__":
    pass_rule = PassRule(8, 16, min_lower_chars=3, min_upper_chars=0, min_digits=1, min_symbols=0)
    pass_rule_text = str(pass_rule)
    print(pass_rule)
    print(pass_rule == PassRule.from_str(pass_rule_text))
