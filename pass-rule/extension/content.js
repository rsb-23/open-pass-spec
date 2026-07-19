// Function to extract the rule from the password input (per PassRule.md,
// the attribute lives on the input[type="password"] itself).

function getPasswordRules() {
  const ruleField =
    document.querySelector("input[type='password'][data-pass-rule]") ||
    document.querySelector("[data-pass-rule]");
  if (ruleField) {
    return ruleField.getAttribute("data-pass-rule");
  }
  return null;
}

// Respond to the popup's request for the current page's password rule.
if (chrome?.runtime?.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fetchRules") {
      sendResponse(getPasswordRules());
    }
  });
}

// Function to create and display the password popup
function createPasswordPopup(password) {
  // Remove any existing popup
  let existingPopup = document.querySelector("#password-popup");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create a new popup
  const popup = document.createElement("div");
  popup.id = "password-popup";
  popup.style.position = "absolute";
  popup.style.backgroundColor = "#fff";
  popup.style.border = "1px solid #ccc";
  popup.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
  popup.style.padding = "10px";
  popup.style.borderRadius = "4px";
  popup.style.fontSize = "14px";
  popup.style.width = "200px";
  popup.style.cursor = "pointer"; // Make it clear it's clickable
  popup.innerHTML = `<p><strong>Click to use:</strong><br>${password}</p>`;

  // Append the popup to the body
  document.body.appendChild(popup);

  // Position the popup relative to the password field
  const rect = passwordField.getBoundingClientRect();
  popup.style.top = `${
    rect.top + window.scrollY + passwordField.offsetHeight
  }px`;
  popup.style.left = `${rect.right + window.scrollX - 200}px`;

  // Use "mousedown" + preventDefault instead of "click": clicking the popup
  // would otherwise blur the password field first, and the "blur" handler
  // below removes the popup before a "click" event ever gets to fire on it.
  // preventDefault on mousedown stops that focus change from happening.
  popup.addEventListener("mousedown", (event) => {
    event.preventDefault();
    passwordField.value = password;
    popup.remove();
  });
}

// Listen for focus event on the password field to show the popup
const passwordField = document.querySelector("#password");
if (passwordField) {
  passwordField.addEventListener("focus", () => {
    const rules = getPasswordRules();
    if (rules) {
      const password = generatePassword(rules);
      createPasswordPopup(password);
    }
  });
}

// Hide the popup when the password field loses focus
if (passwordField) {
  passwordField.addEventListener("blur", () => {
    const existingPopup = document.querySelector("#password-popup");
    if (existingPopup) {
      existingPopup.remove();
    }
  });
}
