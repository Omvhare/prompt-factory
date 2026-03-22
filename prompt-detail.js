const params = new URLSearchParams(window.location.search);
const promptId = params.get("id");
const currentUser = PromptPlatform.getCurrentUser();
const prompt = PromptPlatform.getPromptById(promptId);

const detailLayout = document.getElementById("detailLayout");
const detailEmpty = document.getElementById("detailEmpty");
const detailMedia = document.getElementById("detailMedia");
const detailTitle = document.getElementById("detailTitle");
const detailDescription = document.getElementById("detailDescription");
const detailType = document.getElementById("detailType");
const detailTools = document.getElementById("detailTools");
const detailDifficulty = document.getElementById("detailDifficulty");
const detailGenerationTime = document.getElementById("detailGenerationTime");
const detailMainPrompt = document.getElementById("detailMainPrompt");
const detailNegativePrompt = document.getElementById("detailNegativePrompt");
const detailMotionPrompt = document.getElementById("detailMotionPrompt");
const negativeBlock = document.getElementById("negativeBlock");
const motionBlock = document.getElementById("motionBlock");
const detailAvatar = document.getElementById("detailAvatar");
const detailCreatorName = document.getElementById("detailCreatorName");
const detailCreatorBio = document.getElementById("detailCreatorBio");
const detailProfileLink = document.getElementById("detailProfileLink");
const detailCategories = document.getElementById("detailCategories");
const detailToolList = document.getElementById("detailToolList");
const detailLikes = document.getElementById("detailLikes");
const detailBookmarks = document.getElementById("detailBookmarks");
const detailViews = document.getElementById("detailViews");
const detailCopies = document.getElementById("detailCopies");
const detailCreatedAt = document.getElementById("detailCreatedAt");
const detailLike = document.getElementById("detailLike");
const detailBookmark = document.getElementById("detailBookmark");
const detailCopy = document.getElementById("detailCopy");
const detailCopySecondary = document.getElementById("detailCopySecondary");

function renderDetail() {
  PromptPlatform.updateNav();
  if (!prompt || !PromptPlatform.canUserAccessPrompt(prompt, currentUser)) {
    detailEmpty.hidden = false;
    return;
  }

  detailLayout.hidden = false;
  if (prompt.status === "approved") {
    const updatedPrompt = PromptPlatform.recordView(prompt.id) || prompt;
    Object.assign(prompt, updatedPrompt);
  }

  const creator = PromptPlatform.getPromptCreator(prompt);
  detailTitle.textContent = prompt.title;
  detailDescription.textContent = prompt.description;
  detailType.textContent = prompt.prompt_type;
  detailTools.textContent = prompt.tools.join(", ");
  detailDifficulty.textContent = prompt.difficulty;
  detailGenerationTime.textContent = prompt.generation_time || "Not specified";
  detailMainPrompt.textContent = prompt.main_prompt;
  detailCategories.textContent = prompt.categories.join(", ");
  detailToolList.textContent = prompt.tools.join(", ");
  detailLikes.textContent = String(prompt.likes_count);
  detailBookmarks.textContent = String(prompt.bookmarks_count);
  detailViews.textContent = String(prompt.views);
  detailCopies.textContent = String(prompt.copy_count);
  detailCreatedAt.textContent = PromptPlatform.formatDate(prompt.created_at);
  detailCreatorName.textContent = creator ? creator.username : "Unknown creator";
  detailCreatorBio.textContent = creator?.bio || "No creator bio added yet.";
  detailAvatar.src = creator?.avatar || PromptPlatform.CARTOON_AVATARS[0];
  detailProfileLink.href = creator ? `profile.html?id=${encodeURIComponent(creator.id)}` : "profile.html";

  negativeBlock.hidden = !prompt.negative_prompt;
  detailNegativePrompt.textContent = prompt.negative_prompt || "";
  motionBlock.hidden = !prompt.motion_prompt;
  detailMotionPrompt.textContent = prompt.motion_prompt || "";

  PromptPlatform.hydratePromptMedia(detailMedia, prompt, { controls: true, className: "detail-media-asset" });

  if (currentUser) {
    detailLike.classList.toggle("liked", PromptPlatform.hasLiked(prompt.id, currentUser.id));
    detailBookmark.classList.toggle("bookmarked", PromptPlatform.hasBookmarked(prompt.id, currentUser.id));
    detailBookmark.innerHTML = PromptPlatform.hasBookmarked(prompt.id, currentUser.id) ? "&#9733;" : "&#9734;";
  } else {
    detailLike.classList.remove("liked");
    detailBookmark.classList.remove("bookmarked");
    detailBookmark.innerHTML = "&#9734;";
  }
}

async function copyAndRefresh() {
  const result = await PromptPlatform.copyPrompt(prompt.id);
  if (result.ok) {
    Object.assign(prompt, result.prompt);
    PromptPlatform.showToast("Prompt copied!");
    renderDetail();
  } else {
    PromptPlatform.showToast(result.message || "Copy failed");
  }
}

detailLike.addEventListener("click", () => {
  const result = PromptPlatform.toggleLike(prompt.id);
  if (result.ok) {
    Object.assign(prompt, result.prompt);
    renderDetail();
  }
});

detailBookmark.addEventListener("click", () => {
  const result = PromptPlatform.toggleBookmark(prompt.id);
  if (result.ok) {
    Object.assign(prompt, result.prompt);
    renderDetail();
  }
});

detailCopy.addEventListener("click", copyAndRefresh);
detailCopySecondary.addEventListener("click", copyAndRefresh);

renderDetail();
