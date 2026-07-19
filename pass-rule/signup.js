const passwordField = document.querySelector("#password");
const toggleButton = document.querySelector("#toggle-password");
var rule = ["", "", ""];
toggleButton.addEventListener("click", () => {
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
  toggleButton.textContent = type === "password" ? "👁️" : "🙈"; // Change icon based on visibility
});

function updateRange(element, type) {
  let minInput = document.getElementById("min-size");
  let maxInput = document.getElementById("max-size");
  let minValue = parseInt(minInput.value);
  let maxValue = parseInt(maxInput.value);
  let track = document.querySelector(".slider-track-inner");

  if (minValue > maxValue) {
    if (type === "min") {
      element.value = maxValue;
      minValue = maxValue;
    } else {
      element.value = minValue;
      maxValue = minValue;
    }
  }

  // Update the colored track
  const percent1 = (minValue / 40) * 100;
  const percent2 = (maxValue / 40) * 100;
  track.style.left = percent1 + "%";
  track.style.width = percent2 - percent1 + "%";

  // Update display
  document.getElementById("size-display").textContent = `${minValue}-${maxValue}`;
  updateRule("p1");
}

function toggleInput(checkbox, inputId) {
  const input = document.getElementById(inputId);
  input.disabled = !checkbox.checked;
  if (!checkbox.checked) {
    input.value = 0;
  }
}
function removeDuplicate(str) {
  let charArray = str.split("");
  let uniqueChars = [...new Set(charArray)];
  return uniqueChars.join("");
}

function updateRule(part) {
  if (part == "p1" || part == "all") {
    rule[0] = document.getElementById("size-display").textContent;
  }
  if (part == "p2" || part == "all") {
    const charRule = [];
    for (const ch of "LUDS") {
      if (document.getElementById(ch).checked) {
        charRule.push(ch);
        const chCount = document.getElementById(`${ch}Count`).value;
        if (chCount > 0) {
          charRule.push(chCount);
        }
      }
    }
    rule[1] = charRule.join("");
  }
  if (part == "p3" || part == "all") {
    const symbols = document.getElementById("symbols");
    rule[2] = removeDuplicate(symbols.value);
    symbols.value = rule[2];
  }
  const rule_ = rule.join("::");
  document.getElementById("prule").value = rule_;
  // Write the built rule back onto the input tools actually read, per PassRule.md.
  passwordField.setAttribute("data-pass-rule", rule_);
}

// Initialize the range display
document.addEventListener("DOMContentLoaded", function () {
  let track = document.querySelector(".slider-track-inner");
  const percent1 = (8 / 40) * 100;
  const percent2 = (16 / 40) * 100;
  track.style.left = percent1 + "%";
  track.style.width = percent2 - percent1 + "%";
});
updateRange();
updateRule("all");
