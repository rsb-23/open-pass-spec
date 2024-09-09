// Function to extract the rules from the div
function getPasswordRules() {
  const ruleDiv = document.querySelector("[data-pass-rule]");
  if (ruleDiv) {
    return ruleDiv.getAttribute("data-pass-rule");
  }
  return null;
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
  popup.style.fontSize = "14";
  popup.style.width = "200px";
  popup.style.cursor = "pointer"; // Make it clear it's clickable
  popup.innerHTML = `<p><strong>Fill Password:</strong><br>${password}</p>`;

  // Append the popup to the body
  document.body.appendChild(popup);

  // Position the popup relative to the password field
  const passwordField = document.getElementById("password");
  const rect = passwordField.getBoundingClientRect();
  popup.style.top = `${
    rect.top + window.scrollY + passwordField.offsetHeight
  }px`;
  popup.style.left = `${rect.right + window.scrollX - 200}px`;
  passwordField.value = password;
  setTimeout(() => {
    popup.addEventListener("click", () => {
      // not working
      console.log("filling password");
      passwordField.value = password;
    });
  }, 0);
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
