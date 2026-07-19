// Fetch rules from the content script
function fetchRules(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: "fetchRules" },
      (response) => {
        callback(response);
      }
    );
  });
}

// Button event listener for password generation
document.getElementById("generate-btn").addEventListener("click", () => {
  fetchRules((rules) => {
    if (rules) {
      const password = generatePassword(rules);
      document.getElementById("password").textContent = password;
    } else {
      document.getElementById("password").textContent =
        "No password rules found";
    }
  });
});
