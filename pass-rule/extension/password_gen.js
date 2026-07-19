// Must match the canonical symbol set defined in PassRule.md exactly.
const ALL_SYMBOLS = `!\`"#$%&'()*+,-./:;<=>?@[\\]^_{|}~`;
const ALLOWED_CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: ALL_SYMBOLS,
};
// Order must match L, U, D, S. Each code is optional but, if present, must appear
// in this fixed order and at most once — duplicates/out-of-order input simply won't match.
// "i" flag replaces a separate rule.toUpperCase() call (one less string allocation per parse).
const REGEX_PASS_RULE =
  /^(\d{1,2})-(\d{1,3})::(?:L(\d{0,2}))?(?:U(\d{0,2}))?(?:D(\d{0,2}))?(?:S(\d{0,2}))?::(.*)$/;

function validatePassRules(minLength, maxLength, charRule, symbols) {
  if (minLength > maxLength) {
    throw new Error("Minimum length cannot be greater than maximum length.");
  }

  // Per spec: sum of all minimum counts (L#+U#+D#+S#) must not exceed maxLength.
  const {L, U, D, S} = charRule;
  const sumMins = Math.max(L, 0) + Math.max(U, 0) + Math.max(D, 0) + Math.max(S, 0);
  if (sumMins > maxLength) {
    throw new Error(
      `Sum of minimum character counts (${sumMins}) exceeds maximum length (${maxLength}).`
    );
  }

  // Validate symbols (if provided)
  if (symbols !== undefined && symbols !== "") {
    const uniqueChars = new Set(symbols);
    if (uniqueChars.size !== symbols.length) {
      throw new Error("Symbols must not contain duplicates.");
    }
    if (![...symbols].every((char) => ALL_SYMBOLS.includes(char))) {
      throw new Error(
        "Invalid symbols. Use only from: " + ALL_SYMBOLS
      );
    }
  }

  return true;
}

function parsePassRule(rule) {
  rule = rule.toUpperCase();
  const matches = rule.match(REGEX_PASS_RULE);

  if (!matches) {
    throw new Error(
      "Invalid rule format. Use MIN-MAX::L#U#D#S#::SPECIAL_CHARS (codes must appear in L, U, D, S order, each at most once)"
    );
  }
  const minLength = parseInt(matches[1]);
  const maxLength = parseInt(matches[2]);
  const specialChars = matches[7];

  // matches[3..6] are the L, U, D, S digit captures: undefined = code absent,
  // "" = code present with no minimum, "N" = code present with minimum N.
  const toCount = (digits) =>
    digits === undefined ? -1 : digits === "" ? 0 : parseInt(digits, 10);
  const charRequirements = {
    L: toCount(matches[3]),
    U: toCount(matches[4]),
    D: toCount(matches[5]),
    S: toCount(matches[6]),
  };

  validatePassRules(minLength, maxLength, charRequirements, symbols);

  return {
    minLength: minLength,
    maxLength: maxLength,
    charRequirements: charRequirements,
    symbols: symbols || ALL_SYMBOLS,
  };
}

function generatePassword(rule) {
  const passRule = parsePassRule(rule);
  const minRequired = Object.values(passRule.charRequirements).reduce(
    (total, count) => total + Math.max(count, 0),
    0
  );
  let length =
    Math.floor(0.75 * (passRule.maxLength - passRule.minLength + 1)) +
    passRule.minLength;
  // Never fall below the mandatory minimum count, and never exceed maxLength
  // (validatePassRules guarantees minRequired <= maxLength, so this is safe).
  length = Math.min(passRule.maxLength, Math.max(length, minRequired));

  const charSets = {
    L: ALLOWED_CHARS.lower,
    U: ALLOWED_CHARS.upper,
    D: ALLOWED_CHARS.digits,
    S: passRule.symbols,
  };

  let password = "";
  let remainingLength = length;

  // Fulfill minimum requirements
  for (const [type, count] of Object.entries(passRule.charRequirements)) {
    if (count > 0) {
      password += Array.from(
        {length: count},
        () => charSets[type][Math.floor(crypto.getRandomValues() * charSets[type].length)]
      ).join("");
      remainingLength -= count;
    }
  }

  // Create a string of all allowed characters
  const allowedChars = Object.entries(passRule.charRequirements)
    .filter(([_, count]) => count > -1)
    .map(([type, _]) => charSets[type])
    .join("");

  // Fill the rest with random allowed characters
  password += Array.from(
    {length: remainingLength},
    () => allowedChars[Math.floor(crypto.getRandomValues() * allowedChars.length)]
  ).join("");

  // Shuffle the password
  return password
    .split("")
    .sort(() => crypto.getRandomValues() - 0.5)
    .join("");
}
