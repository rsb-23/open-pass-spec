const ALL_SPECIAL_CHARS = "!@#$%^&*()_+-=[]{}|;:,.<>?\"'";
const ALLOWED_CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  special: ALL_SPECIAL_CHARS,
};
const REGEX_PASS_RULE = /^(\d{1,2})-(\d{1,3})::(([LUDS]\d{0,2}){1,4})::(.*)$/;

function validatePassRules(minLength, maxLength, charRule, specialChars) {
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

  // Validate special characters (if provided)
  if (specialChars !== undefined && specialChars !== "") {
    const uniqueChars = new Set(specialChars);
    if (uniqueChars.size !== specialChars.length) {
      throw new Error("Special characters must not contain duplicates.");
    }
    if (![...specialChars].every((char) => ALL_SPECIAL_CHARS.includes(char))) {
      throw new Error(
        "Invalid special characters. Use only from: " + ALL_SPECIAL_CHARS
      );
    }
  }

  return true;
}

function parsePassRule(rule) {
  rule = rule.toUpperCase();

  const matches = rule.match(REGEX_PASS_RULE);
  console.log(matches);

  if (!matches) {
    throw new Error(
      "Invalid rule format. Use MIN-MAX::L#U#D#S#::SPECIAL_CHARS"
    );
  }
  const minLength = parseInt(matches[1]);
  const maxLength = parseInt(matches[2]);
  const charRule = matches[3];
  const specialChars = matches[5];
  validatePassRules(minLength, maxLength, charRule, specialChars);

  const charRequirements = { L: -1, U: -1, D: -1, S: -1 };
  charRule.match(/[LUDS]\d{0,2}/g).forEach((req) => {
    charRequirements[req[0]] = parseInt(req.slice(1)) || 0;
  });
  return {
    minLength: minLength,
    maxLength: maxLength,
    charRequirements: charRequirements,
    specialChars: specialChars || ALL_SPECIAL_CHARS,
  };
}

function generatePassword(rule) {
  const passRule = parsePassRule(rule);
  const length =
    Math.floor(0.75 * (passRule.maxLength - passRule.minLength + 1)) +
    passRule.minLength;

  const charSets = {
    L: ALLOWED_CHARS.lower,
    U: ALLOWED_CHARS.upper,
    D: ALLOWED_CHARS.digits,
    S: passRule.specialChars,
  };

  let password = "";
  let remainingLength = length;

  // Fulfill minimum requirements
  for (const [type, count] of Object.entries(passRule.charRequirements)) {
    if (count > 0) {
      password += Array.from(
        { length: count },
        () => charSets[type][Math.floor(Math.random() * charSets[type].length)]
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
    { length: remainingLength },
    () => allowedChars[Math.floor(Math.random() * allowedChars.length)]
  ).join("");

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
