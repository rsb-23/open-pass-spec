const passwordField = document.querySelector("#password");
const toggleButton = document.querySelector("#toggle-password");

toggleButton.addEventListener("click", () => {
  const type = passwordField.type === "password" ? "text" : "password";
  passwordField.type = type;
  toggleButton.textContent = type === "password" ? "👁️" : "🙈"; // Change icon based on visibility
});
