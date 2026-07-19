// Must match the canonical symbol set defined in PassRule.md exactly.
const ALL_SYMBOLS = `!\`"#$%&'()*+,-./:;<=>?@[\\]^_{|}~`;
const ALLOWED_CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: ALL_SYMBOLS,
};
const REGEX_PASS_RULE = /^(\d{1,2})-(\d{1,3})::(([LUDS]\d{0,2}){1,4})::(.*)$/;

function validatePassRules(minLength, maxLength, charRule, symbols) {
  if (minLength > maxLength) {
    throw new Error("Minimum length cannot be greater than maximum length.");
  }

  // Validate character rule
  const charTypes = new Set(charRule.match(/[LUDS]/g) || []);
  if (charTypes.size !== charRule.match(/[LUDS]/g)?.length) {
    throw new Error(
      "Each character type (L, U, D, S) should appear at most once in the rule."
    );
  }

  // Per spec: sum of all minimum counts (L#+U#+D#+S#) must not exceed maxLength.
  const sumMins = (charRule.match(/\d+/g) || []).reduce(
    (total, n) => total + parseInt(n, 10),
    0
  );
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
      "Invalid rule format. Use MIN-MAX::L#U#D#S#::SYMBOLS"
    );
  }
  const minLength = parseInt(matches[1]);
  const maxLength = parseInt(matches[2]);
  const charRule = matches[3];
  const symbols = matches[5];
  validatePassRules(minLength, maxLength, charRule, symbols);

  const charRequirements = {L: -1, U: -1, D: -1, S: -1};
  charRule.match(/[LUDS]\d{0,2}/g).forEach((req) => {
    charRequirements[req[0]] = parseInt(req.slice(1)) || 0;
  });
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
