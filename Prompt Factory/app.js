const STORAGE_KEYS = {
  prompts: "pf_prompts_v3",
  profiles: "pf_profiles_v2",
  currentUser: "pf_current_user_v2"
};

const seedProfiles = [
  {
    id: "profile-rhea",
    name: "Rhea Patel",
    email: "rhea@example.com",
    specialty: "Brand Film Direction",
    styleTag: "Luxe Neon Motion",
    about: "Creative director focused on editorial ad films and beauty visuals.",
    avatarUrl: "avatars/avatar-1.svg"
  },
  {
    id: "profile-aarav",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    specialty: "Automotive Visuals",
    styleTag: "Midnight Velocity",
    about: "Building cinematic automotive launch narratives for global campaigns.",
    avatarUrl: "avatars/avatar-2.svg"
  }
];

const seedPrompts = [
  {
    id: "prompt-1",
    title: "Automotive Launch Film Sequence",
    type: "video",
    engine: "Runway",
    industry: "Advertising",
    description: "Approved premium car spot structure with cinematic lighting and tracking shots.",
    prompt:
      "Create a cinematic 30-second luxury car ad with dusk highway lighting, smooth drone to wheel close-up transitions, soft anamorphic flares, and premium color grading.",
    artistName: "Aarav Mehta",
    styleTag: "Midnight Velocity",
    creatorEmail: "aarav@example.com",
    mediaNames: [],
    mediaAssets: [],
    status: "approved",
    createdAt: new Date().toISOString()
  },
  {
    id: "prompt-2",
    title: "Editorial Beauty Campaign Portrait",
    type: "image",
    engine: "Midjourney",
    industry: "Fashion",
    description: "Approved editorial portrait prompt for premium skincare and fashion campaigns.",
    prompt:
      "Generate an editorial beauty portrait for premium skincare campaign, soft key + rim lighting, realistic pores, neutral backdrop, 85mm lens look, subtle luxury palette.",
    artistName: "Rhea Patel",
    styleTag: "Luxe Neon Motion",
    creatorEmail: "rhea@example.com",
    mediaNames: [],
    mediaAssets: [],
    status: "approved",
    createdAt: new Date().toISOString()
  }
];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let profiles = readJSON(STORAGE_KEYS.profiles, readJSON("pf_profiles_v1", seedProfiles));
let prompts = readJSON(STORAGE_KEYS.prompts, readJSON("pf_prompts_v2", seedPrompts));
let currentUser = readJSON(STORAGE_KEYS.currentUser, readJSON("pf_current_user_v1", null));

if (!localStorage.getItem(STORAGE_KEYS.profiles)) writeJSON(STORAGE_KEYS.profiles, profiles);
if (!localStorage.getItem(STORAGE_KEYS.prompts)) writeJSON(STORAGE_KEYS.prompts, prompts);

function normalizePromptLikes(item) {
  if (!Array.isArray(item.likedByEmails)) {
    item.likedByEmails = [];
  }
  item.likedByEmails = [...new Set(item.likedByEmails.filter((email) => typeof email === "string"))];
  if (!Array.isArray(item.mediaRefs)) {
    item.mediaRefs = [];
  }
  return item;
}

function dataUrlToFile(dataUrl, fallbackName, fallbackType) {
  if (typeof dataUrl !== "string" || !dataUrl.startsWith("data:")) return null;
  const parts = dataUrl.split(",");
  if (parts.length < 2) return null;
  const meta = parts[0];
  const content = parts[1];
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mime = mimeMatch ? mimeMatch[1] : fallbackType || "application/octet-stream";

  try {
    const binary = atob(content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    return new File([bytes], fallbackName || "upload.bin", { type: mime });
  } catch {
    return null;
  }
}

async function migrateLegacyMediaToRefs() {
  if (!window.MediaStore || typeof window.MediaStore.saveFiles !== "function") return;
  let changed = false;

  for (const item of prompts) {
    normalizePromptLikes(item);
    const hasRefs = Array.isArray(item.mediaRefs) && item.mediaRefs.length > 0;
    const legacyAssets = Array.isArray(item.mediaAssets) ? item.mediaAssets : [];

    if (!hasRefs && legacyAssets.length > 0) {
      const files = [];
      for (const asset of legacyAssets.slice(0, 4)) {
        if (!asset || !asset.dataUrl) continue;
        const file = dataUrlToFile(asset.dataUrl, asset.name || "media", asset.type || "");
        if (file) files.push(file);
      }
      if (files.length > 0) {
        const refs = await window.MediaStore.saveFiles(files);
        if (refs.length > 0) {
          item.mediaRefs = refs;
          changed = true;
        }
      }
    }

    if (Array.isArray(item.mediaRefs) && item.mediaRefs.length > 0 && legacyAssets.length > 0) {
      item.mediaAssets = [];
      changed = true;
    }
  }

  if (changed) {
    savePrompts();
  }
}

prompts = prompts.map((item) => normalizePromptLikes(item));

const promptGrid = document.getElementById("promptGrid");
const emptyState = document.getElementById("emptyState");
const typeFilter = document.getElementById("typeFilter");
const engineFilter = document.getElementById("engineFilter");
const industryFilter = document.getElementById("industryFilter");
const clearFilters = document.getElementById("clearFilters");
const searchPrompt = document.getElementById("searchPrompt");
const toast = document.getElementById("toast");
const quickSubmit = document.getElementById("quickSubmit");

const submitForm = document.getElementById("submitForm");
const submitTitle = document.getElementById("submitTitle");
const submitPrompt = document.getElementById("submitPrompt");
const submitType = document.getElementById("submitType");
const submitEngine = document.getElementById("submitEngine");
const submitIndustry = document.getElementById("submitIndustry");
const submitMedia = document.getElementById("submitMedia");
const submitMessage = document.getElementById("submitMessage");

const previewTitle = document.getElementById("previewTitle");
const previewMeta = document.getElementById("previewMeta");
const previewExcerpt = document.getElementById("previewExcerpt");
const mediaPreview = document.getElementById("mediaPreview");

const adminQueue = document.getElementById("adminQueue");
const adminEmpty = document.getElementById("adminEmpty");
const refreshAdmin = document.getElementById("refreshAdmin");

const approvedCount = document.getElementById("approvedCount");
const artistCount = document.getElementById("artistCount");
const pendingCount = document.getElementById("pendingCount");

const authOverlay = document.getElementById("authOverlay");
const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupSpecialty = document.getElementById("signupSpecialty");
const signupStyleTag = document.getElementById("signupStyleTag");
const closeSignup = document.getElementById("closeSignup");
const activePromptMediaUrls = new Set();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function saveProfiles() {
  writeJSON(STORAGE_KEYS.profiles, profiles);
}

function savePrompts() {
  try {
    writeJSON(STORAGE_KEYS.prompts, prompts);
    return true;
  } catch {
    return false;
  }
}

function saveCurrentUser() {
  writeJSON(STORAGE_KEYS.currentUser, currentUser);
}

function updateFiltersFromApprovedPrompts() {
  const approved = prompts.filter((item) => item.status === "approved");
  const engines = [...new Set(approved.map((item) => item.engine))].sort();
  const industries = [...new Set(approved.map((item) => item.industry))].sort();

  const selectedEngine = engineFilter.value;
  const selectedIndustry = industryFilter.value;

  engineFilter.innerHTML = '<option value="all">All Engines</option>';
  industryFilter.innerHTML = '<option value="all">All Industries</option>';

  for (const engine of engines) {
    const option = document.createElement("option");
    option.value = engine;
    option.textContent = engine;
    engineFilter.append(option);
  }

  for (const industry of industries) {
    const option = document.createElement("option");
    option.value = industry;
    option.textContent = industry;
    industryFilter.append(option);
  }

  if ([...engineFilter.options].some((opt) => opt.value === selectedEngine)) {
    engineFilter.value = selectedEngine;
  }
  if ([...industryFilter.options].some((opt) => opt.value === selectedIndustry)) {
    industryFilter.value = selectedIndustry;
  }
}

function approvedPromptsFiltered() {
  const query = searchPrompt.value.trim().toLowerCase();
  const type = typeFilter.value;
  const engine = engineFilter.value;
  const industry = industryFilter.value;

  return prompts.filter((item) => {
    if (item.status !== "approved") return false;

    const typeMatch = type === "all" || item.type === type;
    const engineMatch = engine === "all" || item.engine === engine;
    const industryMatch = industry === "all" || item.industry === industry;

    const textBlob = [
      item.title,
      item.description,
      item.prompt,
      item.engine,
      item.industry,
      item.artistName,
      item.styleTag
    ]
      .join(" ")
      .toLowerCase();

    const textMatch = !query || textBlob.includes(query);
    return typeMatch && engineMatch && industryMatch && textMatch;
  });
}

function likeCount(item) {
  return Array.isArray(item.likedByEmails) ? item.likedByEmails.length : 0;
}

function isLikedByCurrentUser(item) {
  if (!currentUser || !currentUser.email) return false;
  return Array.isArray(item.likedByEmails) && item.likedByEmails.includes(currentUser.email.toLowerCase());
}

function makePromptCard(item) {
  const liked = isLikedByCurrentUser(item);
  const description =
    item.description === "Approved by PromptFactory admin for public usage." ? "" : item.description || "";

  const card = document.createElement("article");
  card.className = "prompt-card";
  card.dataset.id = item.id;
  card.tabIndex = 0;
  card.innerHTML = `
    <div class="thumb ${item.type}">${item.type === "video" ? "Video Output" : "Image Output"}</div>
    <div class="prompt-body">
      <h3>${item.title}</h3>
      <div class="meta-row">
        <span class="tag">${item.type}</span>
        <span class="tag">${item.engine}</span>
        <span class="tag">${item.industry}</span>
      </div>
      ${description ? `<p>${description}</p>` : ""}
      <p><strong>Artist:</strong> ${item.artistName || "Unknown"}</p>
      <p><strong>Style:</strong> ${item.styleTag || "Unspecified"}</p>
      <div class="prompt-actions">
        <button class="btn btn-primary copy-btn" data-id="${item.id}">Copy Prompt</button>
        <button class="btn btn-ghost like-btn${liked ? " liked" : ""}" data-id="${item.id}">
          &#9829;
        </button>
      </div>
    </div>
  `;
  hydratePromptThumb(card, item);
  return card;
}

function clearPromptMediaUrls() {
  for (const url of activePromptMediaUrls) {
    URL.revokeObjectURL(url);
  }
  activePromptMediaUrls.clear();
}

async function hydratePromptThumb(card, item) {
  const thumb = card.querySelector(".thumb");
  if (!thumb) return;

  const firstRef = Array.isArray(item.mediaRefs) ? item.mediaRefs[0] : null;
  if (firstRef && window.MediaStore && typeof window.MediaStore.getObjectUrl === "function") {
    const url = await window.MediaStore.getObjectUrl(firstRef.id);
    if (url) {
      activePromptMediaUrls.add(url);
      thumb.innerHTML = "";
      if ((firstRef.type || "").startsWith("video/")) {
        const video = document.createElement("video");
        video.src = url;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.className = "thumb-image";
        thumb.append(video);
      } else {
        const image = document.createElement("img");
        image.src = url;
        image.alt = `${item.title} output`;
        image.className = "thumb-image";
        thumb.append(image);
      }
      return;
    }
  }

  const legacyAsset = (item.mediaAssets || []).find(
    (asset) => asset && typeof asset.dataUrl === "string" && asset.dataUrl.startsWith("data:")
  );
  if (legacyAsset) {
    thumb.innerHTML = "";
    if ((legacyAsset.type || "").startsWith("video/")) {
      const video = document.createElement("video");
      video.src = legacyAsset.dataUrl;
      video.muted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.className = "thumb-image";
      thumb.append(video);
    } else {
      const image = document.createElement("img");
      image.src = legacyAsset.dataUrl;
      image.alt = `${item.title} output`;
      image.className = "thumb-image";
      thumb.append(image);
    }
  }
}

function renderPrompts() {
  clearPromptMediaUrls();
  const approved = approvedPromptsFiltered();
  promptGrid.innerHTML = "";

  if (approved.length === 0) {
    emptyState.hidden = false;
    return;
  }

  emptyState.hidden = true;
  for (const item of approved) {
    promptGrid.append(makePromptCard(item));
  }
}

function renderAdminQueue() {
  const queue = prompts.filter((item) => item.status === "pending");
  adminQueue.innerHTML = "";

  if (queue.length === 0) {
    adminEmpty.hidden = false;
    return;
  }

  adminEmpty.hidden = true;
  for (const item of queue) {
    const card = document.createElement("article");
    card.className = "admin-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p><strong>Artist:</strong> ${item.artistName || "Unknown"}</p>
      <p><strong>Type:</strong> ${item.type} | <strong>Engine:</strong> ${item.engine}</p>
      <p><strong>Industry:</strong> ${item.industry}</p>
      <p>${item.prompt.slice(0, 180)}${item.prompt.length > 180 ? "..." : ""}</p>
      <p><strong>Media Files:</strong> ${item.mediaNames.length ? item.mediaNames.join(", ") : "None"}</p>
      <div class="admin-actions">
        <button class="btn btn-primary admin-approve" data-id="${item.id}">Approve</button>
        <button class="btn btn-ghost admin-reject" data-id="${item.id}">Reject</button>
      </div>
    `;
    adminQueue.append(card);
  }
}

function updateDashboardCounts() {
  approvedCount.textContent = String(prompts.filter((item) => item.status === "approved").length);
  artistCount.textContent = String(profiles.length);
  pendingCount.textContent = String(prompts.filter((item) => item.status === "pending").length);
}

function updatePreviewText() {
  const title = submitTitle.value.trim();
  const text = submitPrompt.value.trim();
  const creator = currentUser ? currentUser.name : "Sign up required";

  previewTitle.textContent = `Title: ${title || "-"}`;
  previewMeta.textContent = `Type: ${submitType.value} | Engine: ${submitEngine.value} | Creator: ${creator}`;
  previewExcerpt.textContent = text ? `${text.slice(0, 170)}${text.length > 170 ? "..." : ""}` : "Prompt preview appears here...";
}

function updateMediaPreview() {
  mediaPreview.innerHTML = "";
  const files = Array.from(submitMedia.files || []);

  files.slice(0, 6).forEach((file) => {
    const objectURL = URL.createObjectURL(file);
    let node;

    if (file.type.startsWith("video/")) {
      node = document.createElement("video");
      node.controls = true;
      node.muted = true;
      node.src = objectURL;
      node.addEventListener("loadeddata", () => URL.revokeObjectURL(objectURL), { once: true });
    } else {
      node = document.createElement("img");
      node.alt = file.name;
      node.src = objectURL;
      node.addEventListener("load", () => URL.revokeObjectURL(objectURL), { once: true });
    }

    mediaPreview.append(node);
  });
}

function openSignup() {
  authOverlay.hidden = false;
}

function closeSignupOverlay() {
  authOverlay.hidden = true;
}

function ensureSignedIn() {
  if (currentUser) return true;
  openSignup();
  return false;
}

async function copyPromptById(id) {
  const selected = prompts.find((item) => item.id === id);
  if (!selected) return;

  try {
    await navigator.clipboard.writeText(selected.prompt);
    showToast("Prompt copied to clipboard");
  } catch {
    showToast("Clipboard blocked. Copy manually.");
  }
}

function toggleLike(promptId) {
  if (!currentUser || !currentUser.email) return false;
  const selected = prompts.find((item) => item.id === promptId);
  if (!selected) return false;

  normalizePromptLikes(selected);
  const email = currentUser.email.toLowerCase();
  const likedAlready = selected.likedByEmails.includes(email);

  if (likedAlready) {
    selected.likedByEmails = selected.likedByEmails.filter((value) => value !== email);
  } else {
    selected.likedByEmails.push(email);
  }

  if (!savePrompts()) {
    if (likedAlready) {
      selected.likedByEmails.push(email);
    } else {
      selected.likedByEmails = selected.likedByEmails.filter((value) => value !== email);
    }
    return false;
  }

  return true;
}

function openPromptDetail(promptId) {
  window.location.href = `prompt-detail.html?id=${encodeURIComponent(promptId)}`;
}

async function buildMediaRefs(files) {
  const shortlist = files.slice(0, 4);
  if (window.MediaStore && typeof window.MediaStore.saveFiles === "function") {
    return window.MediaStore.saveFiles(shortlist);
  }
  return shortlist.map((file) => ({ id: "", name: file.name, type: file.type }));
}

function rerenderAll() {
  updateFiltersFromApprovedPrompts();
  renderPrompts();
  renderAdminQueue();
  updateDashboardCounts();
  updatePreviewText();
}

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = signupEmail.value.trim().toLowerCase();
  let profile = profiles.find((item) => item.email.toLowerCase() === email);

  if (!profile) {
    const avatarNumber = (profiles.length % 6) + 1;
    profile = {
      id: `profile-${Date.now()}`,
      name: signupName.value.trim(),
      email,
      specialty: signupSpecialty.value.trim(),
      styleTag: signupStyleTag.value.trim(),
      about: "",
      avatarUrl: `avatars/avatar-${avatarNumber}.svg`
    };
    profiles.unshift(profile);
    saveProfiles();
  }

  currentUser = profile;
  saveCurrentUser();
  signupForm.reset();
  closeSignupOverlay();
  showToast("Signup complete");
  rerenderAll();
  window.location.href = "profile.html";
});

submitForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitMessage.textContent = "";

  if (!ensureSignedIn()) {
    submitMessage.textContent = "Please sign up first to submit prompts.";
    return;
  }

  const files = Array.from(submitMedia.files || []);
  const mediaRefs = await buildMediaRefs(files);

  const newPrompt = {
    id: `prompt-${Date.now()}`,
    title: submitTitle.value.trim(),
    type: submitType.value,
    engine: submitEngine.value,
    industry: submitIndustry.value.trim(),
    description: "Awaiting admin moderation before public listing.",
    prompt: submitPrompt.value.trim(),
    artistName: currentUser.name,
    styleTag: currentUser.styleTag,
    creatorEmail: currentUser.email,
    mediaNames: files.map((file) => file.name),
    mediaRefs,
    mediaAssets: [],
    likedByEmails: [],
    status: "pending",
    createdAt: new Date().toISOString()
  };

  prompts.unshift(newPrompt);
  if (!savePrompts()) {
    newPrompt.mediaRefs = [];
    if (!savePrompts()) {
      prompts.shift();
      submitMessage.textContent = "Submit failed. Storage is full. Remove large files and try again.";
      showToast("Storage full");
      return;
    }
    submitMessage.textContent = "Submitted, but media references could not be stored.";
  }

  submitForm.reset();
  mediaPreview.innerHTML = "";
  if (!submitMessage.textContent) {
    submitMessage.textContent = "Submitted to admin queue. It will go live only after approval.";
  }
  showToast("Added to moderation queue");
  rerenderAll();
});

promptGrid.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const actionButton = target.closest(".copy-btn, .like-btn");
  const card = target.closest(".prompt-card");
  const id = (actionButton && actionButton.dataset.id) || (card && card.dataset.id);
  if (!id) return;

  if (actionButton && actionButton.classList.contains("copy-btn")) {
    if (!ensureSignedIn()) return;
    await copyPromptById(id);
    return;
  }

  if (actionButton && actionButton.classList.contains("like-btn")) {
    if (!ensureSignedIn()) return;
    if (!toggleLike(id)) {
      showToast("Like update failed");
      return;
    }
    renderPrompts();
    showToast("Like updated");
    return;
  }

  if (card) openPromptDetail(id);
});

promptGrid.addEventListener("keydown", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement) || !target.classList.contains("prompt-card")) return;
  if (event.key !== "Enter" && event.key !== " ") return;
  event.preventDefault();
  if (target.dataset.id) openPromptDetail(target.dataset.id);
});

adminQueue.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const id = target.dataset.id;
  if (!id) return;

  const selected = prompts.find((item) => item.id === id);
  if (!selected) return;

  if (target.classList.contains("admin-approve")) {
    selected.status = "approved";
    if (!savePrompts()) {
      selected.status = "pending";
      showToast("Approval failed: storage issue");
      return;
    }
    showToast("Prompt approved and now live");
    rerenderAll();
  }

  if (target.classList.contains("admin-reject")) {
    selected.status = "rejected";
    if (!savePrompts()) {
      selected.status = "pending";
      showToast("Reject failed: storage issue");
      return;
    }
    showToast("Prompt rejected");
    rerenderAll();
  }
});

[typeFilter, engineFilter, industryFilter, searchPrompt].forEach((field) => {
  field.addEventListener("input", renderPrompts);
  field.addEventListener("change", renderPrompts);
});

[submitTitle, submitPrompt, submitType, submitEngine].forEach((field) => {
  field.addEventListener("input", updatePreviewText);
  field.addEventListener("change", updatePreviewText);
});

submitMedia.addEventListener("change", updateMediaPreview);

clearFilters.addEventListener("click", () => {
  typeFilter.value = "all";
  engineFilter.value = "all";
  industryFilter.value = "all";
  searchPrompt.value = "";
  renderPrompts();
});

document.getElementById("filtersForm")?.addEventListener("submit", (event) => {
  event.preventDefault();
  renderPrompts();
});

refreshAdmin.addEventListener("click", renderAdminQueue);

quickSubmit.addEventListener("click", () => {
  if (!ensureSignedIn()) return;
  document.getElementById("submit")?.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const submitLink = target.closest('a[href="#submit"]');
  if (submitLink && !ensureSignedIn()) {
    event.preventDefault();
  }

  const profileLink = target.closest('a[href="artist-dashboard.html"]');
  if (profileLink && !ensureSignedIn()) {
    event.preventDefault();
  }
});

closeSignup.addEventListener("click", closeSignupOverlay);

authOverlay.addEventListener("click", (event) => {
  if (event.target === authOverlay) {
    closeSignupOverlay();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeSignupOverlay();
  }
});

rerenderAll();
migrateLegacyMediaToRefs().then(() => rerenderAll());
