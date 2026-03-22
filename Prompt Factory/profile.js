const currentUser = PromptPlatform.getCurrentUser();
const requestedUserId = new URLSearchParams(window.location.search).get("id");
const viewedUser = requestedUserId ? PromptPlatform.getUserById(requestedUserId) : currentUser;
const isOwnProfile = !!currentUser && !!viewedUser && currentUser.id === viewedUser.id;

if (!viewedUser) {
  PromptPlatform.requireAuth("profile.html");
} else {

const profileAvatar = document.getElementById("profileAvatar");
const profileUsername = document.getElementById("profileUsername");
const profileBio = document.getElementById("profileBio");
const profilePromptCount = document.getElementById("profilePromptCount");
const profileLikeCount = document.getElementById("profileLikeCount");
const profileBookmarkCount = document.getElementById("profileBookmarkCount");
const profileJoinDate = document.getElementById("profileJoinDate");
const profileEmail = document.getElementById("profileEmail");
const profileCategory = document.getElementById("profileCategory");
const profilePromptsGrid = document.getElementById("profilePromptsGrid");
const profilePromptsEmpty = document.getElementById("profilePromptsEmpty");
const profileBookmarksGrid = document.getElementById("profileBookmarksGrid");
const profileBookmarksEmpty = document.getElementById("profileBookmarksEmpty");
const profileLikedGrid = document.getElementById("profileLikedGrid");
const profileLikedEmpty = document.getElementById("profileLikedEmpty");
const settingsForm = document.getElementById("settingsForm");
const settingsUsername = document.getElementById("settingsUsername");
const settingsBio = document.getElementById("settingsBio");
const settingsAvatar = document.getElementById("settingsAvatar");
const settingsCategory = document.getElementById("settingsCategory");
const settingsMessage = document.getElementById("settingsMessage");
const tabButtons = document.querySelectorAll(".tab-btn");

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function switchTab(tabName) {
  tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tabName;
    panel.classList.toggle("active", panel.dataset.panel === tabName);
  });
}

function fillSettingsOptions() {
  settingsCategory.innerHTML = "";
  for (const category of PromptPlatform.CATEGORIES) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    settingsCategory.append(option);
  }
}

function renderProfile() {
  PromptPlatform.updateNav();
  const user = viewedUser;
  const stats = PromptPlatform.getCreatorStats(user.id);

  profileAvatar.src = user.avatar || PromptPlatform.CARTOON_AVATARS[0];
  profileUsername.textContent = user.username;
  profileBio.textContent = user.bio || "No bio added yet.";
  profilePromptCount.textContent = String(stats.totalPrompts);
  profileLikeCount.textContent = String(stats.totalLikes);
  profileBookmarkCount.textContent = String(stats.totalBookmarks);
  profileJoinDate.textContent = PromptPlatform.formatDate(user.created_at);
  profileEmail.textContent = user.email;
  profileCategory.textContent = user.preferred_category || "-";

  if (isOwnProfile) {
    settingsUsername.value = user.username;
    settingsBio.value = user.bio || "";
    settingsCategory.value = user.preferred_category || PromptPlatform.CATEGORIES[0];
  }

  PromptPlatform.bindPromptGrid(profilePromptsGrid, PromptPlatform.getUserPrompts(user.id), {
    emptyState: profilePromptsEmpty,
    onChange: renderProfile
  });
  if (isOwnProfile) {
    PromptPlatform.bindPromptGrid(profileBookmarksGrid, PromptPlatform.getUserBookmarkedPrompts(user.id), {
      emptyState: profileBookmarksEmpty,
      onChange: renderProfile
    });
    PromptPlatform.bindPromptGrid(profileLikedGrid, PromptPlatform.getUserLikedPrompts(user.id), {
      emptyState: profileLikedEmpty,
      onChange: renderProfile
    });
  }
}

if (isOwnProfile) {
  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    settingsMessage.textContent = "";
    const users = PromptPlatform.getUsers();
    const user = PromptPlatform.getCurrentUser();
    const file = settingsAvatar.files?.[0];
    const avatar = file ? await fileToDataUrl(file) : user.avatar;

    if (users.some((entry) => entry.id !== user.id && entry.username.toLowerCase() === settingsUsername.value.trim().toLowerCase())) {
      settingsMessage.textContent = "Username already exists.";
      return;
    }

    const updated = {
      ...user,
      username: settingsUsername.value.trim(),
      bio: settingsBio.value.trim(),
      avatar,
      preferred_category: settingsCategory.value
    };

    const nextUsers = users.map((entry) => (entry.id === user.id ? updated : entry));
    PromptPlatform.setUsers(nextUsers);
    PromptPlatform.setCurrentUser(updated);
    settingsMessage.textContent = "Settings updated.";
    renderProfile();
  });
}

if (!isOwnProfile) {
  document.querySelector('[data-tab="bookmarks"]')?.setAttribute("hidden", "hidden");
  document.querySelector('[data-tab="liked"]')?.setAttribute("hidden", "hidden");
  document.querySelector('[data-tab="settings"]')?.setAttribute("hidden", "hidden");
  document.querySelector('[data-panel="bookmarks"]')?.setAttribute("hidden", "hidden");
  document.querySelector('[data-panel="liked"]')?.setAttribute("hidden", "hidden");
  document.querySelector('[data-panel="settings"]')?.setAttribute("hidden", "hidden");
}

tabButtons.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));

fillSettingsOptions();
const requestedTab = isOwnProfile ? new URLSearchParams(window.location.search).get("tab") : "prompts";
switchTab(requestedTab || "prompts");
renderProfile();
}
