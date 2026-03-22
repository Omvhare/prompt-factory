const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const signupCategory = document.getElementById("signupCategory");
const signupAvatar = document.getElementById("signupAvatar");
const tabs = document.querySelectorAll(".auth-tab");

const params = new URLSearchParams(window.location.search);
const returnTo = params.get("return") || "profile.html";

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function switchTab(tabName) {
  tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.tab === tabName));
  document.querySelectorAll("[data-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tabName;
  });
}

tabs.forEach((tab) => tab.addEventListener("click", () => switchTab(tab.dataset.tab)));

for (const category of PromptPlatform.CATEGORIES) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  signupCategory.append(option);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginMessage.textContent = "";
  const result = PromptPlatform.login({
    email: document.getElementById("loginEmail").value,
    password: document.getElementById("loginPassword").value
  });
  if (!result.ok) {
    loginMessage.textContent = result.message;
    return;
  }
  window.location.href = returnTo;
});

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  signupMessage.textContent = "";
  const file = signupAvatar.files?.[0];
  const avatar = file ? await fileToDataUrl(file) : "";
  const result = PromptPlatform.signup({
    username: document.getElementById("signupUsername").value,
    email: document.getElementById("signupEmail").value,
    password: document.getElementById("signupPassword").value,
    avatar,
    bio: document.getElementById("signupBio").value,
    preferred_category: signupCategory.value
  });
  if (!result.ok) {
    signupMessage.textContent = result.message;
    return;
  }
  window.location.href = returnTo;
});

if (PromptPlatform.getCurrentUser()) {
  window.location.href = returnTo;
}
