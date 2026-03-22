const typeCardGrid = document.getElementById("typeCardGrid");
const categoryOptions = document.getElementById("categoryOptions");
const toolOptions = document.getElementById("toolOptions");
const submitWizard = document.getElementById("submitWizard");
const motionPromptWrap = document.getElementById("motionPromptWrap");
const uploadPreview = document.getElementById("uploadPreview");
const previewUpload = document.getElementById("previewUpload");
const submitPreviewCard = document.getElementById("submitPreviewCard");
const submitStatus = document.getElementById("submitStatus");
const promptTitle = document.getElementById("promptTitle");
const promptDescription = document.getElementById("promptDescription");
const mainPrompt = document.getElementById("mainPrompt");
const negativePrompt = document.getElementById("negativePrompt");
const motionPrompt = document.getElementById("motionPrompt");
const difficultySelect = document.getElementById("difficultySelect");
const generationTime = document.getElementById("generationTime");
const toStep2 = document.getElementById("toStep2");
const toStep3 = document.getElementById("toStep3");
const backTo1 = document.getElementById("backTo1");
const backTo2 = document.getElementById("backTo2");

const wizardState = {
  step: 1,
  promptType: "image"
};

const promptTypes = [
  { id: "image", icon: "▣", title: "Image Prompt", text: "Prompt structure for image generation tools." },
  { id: "video", icon: "▶", title: "Video Prompt", text: "Motion-focused prompts with preview and movement logic." },
  { id: "text", icon: "✎", title: "Text Prompt", text: "Prompt systems for scripts, copy, and structured text output." }
];

function renderTypeCards() {
  typeCardGrid.innerHTML = "";
  for (const item of promptTypes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `type-card${wizardState.promptType === item.id ? " active" : ""}`;
    button.dataset.type = item.id;
    button.innerHTML = `<span class="type-icon">${item.icon}</span><h3>${item.title}</h3><p>${item.text}</p>`;
    typeCardGrid.append(button);
  }
}

function renderOptionChips(container, items, name) {
  container.innerHTML = "";
  for (const item of items) {
    const label = document.createElement("label");
    label.className = "choice-chip";
    label.innerHTML = `<input type="checkbox" name="${name}" value="${item}" /><span>${item}</span>`;
    container.append(label);
  }
}

function goToStep(step) {
  wizardState.step = step;
  document.querySelectorAll(".wizard-stage").forEach((panel) => {
    panel.hidden = panel.dataset.step !== String(step);
  });
  document.querySelectorAll(".wizard-step").forEach((indicator) => {
    indicator.classList.toggle("active", indicator.dataset.stepIndicator === String(step));
  });
  motionPromptWrap.hidden = wizardState.promptType !== "video";
  renderPreviewCard();
}

function selectedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map((input) => input.value);
}

function renderUploadPreview() {
  uploadPreview.innerHTML = "";
  const files = [...(previewUpload.files || [])];
  for (const file of files.slice(0, 4)) {
    const url = URL.createObjectURL(file);
    const frame = document.createElement(file.type.startsWith("video/") ? "video" : "img");
    frame.src = url;
    frame.className = "preview-thumb";
    if (frame.tagName === "VIDEO") {
      frame.controls = true;
      frame.muted = true;
    }
    uploadPreview.append(frame);
  }
}

function renderPreviewCard() {
  submitPreviewCard.innerHTML = `
    <p class="eyebrow">Preview Card</p>
    <h3>${promptTitle.value || "Prompt title"}</h3>
    <p>${promptDescription.value || "Short description will appear here."}</p>
    <div class="meta-row">
      <span class="tag">${wizardState.promptType}</span>
      ${selectedValues("tools").slice(0, 2).map((tool) => `<span class="tag">${tool}</span>`).join("")}
      ${selectedValues("categories").slice(0, 2).map((category) => `<span class="tag">${category}</span>`).join("")}
      <span class="tag">${difficultySelect.value}</span>
    </div>
    <p><strong>Generation time:</strong> ${generationTime.value || "Not specified"}</p>
  `;
}

function validateStep2() {
  if (!promptTitle.value.trim()) return "Prompt title is required.";
  if (!promptDescription.value.trim()) return "Short description is required.";
  if (mainPrompt.value.trim().length < 20) return "Main prompt must be at least 20 characters.";
  return "";
}

function redirectForAuth() {
  const user = PromptPlatform.getCurrentUser();
  if (user) return user;
  PromptPlatform.requireAuth("submit.html");
  return null;
}

typeCardGrid.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  const card = target.closest(".type-card");
  if (!card) return;
  wizardState.promptType = card.dataset.type || "image";
  renderTypeCards();
  goToStep(wizardState.step);
});

previewUpload.addEventListener("change", renderUploadPreview);
[promptTitle, promptDescription, mainPrompt, negativePrompt, motionPrompt, difficultySelect, generationTime].forEach((field) => {
  field.addEventListener("input", renderPreviewCard);
  field.addEventListener("change", renderPreviewCard);
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.name === "categories" || target.name === "tools") renderPreviewCard();
});

toStep2.addEventListener("click", () => {
  if (!redirectForAuth()) return;
  goToStep(2);
});

toStep3.addEventListener("click", () => {
  const error = validateStep2();
  submitStatus.textContent = error;
  if (error) return;
  goToStep(3);
});

backTo1.addEventListener("click", () => goToStep(1));
backTo2.addEventListener("click", () => goToStep(2));

submitWizard.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitStatus.textContent = "";
  if (!redirectForAuth()) return;

  const error = validateStep2();
  if (error) {
    submitStatus.textContent = error;
    goToStep(2);
    return;
  }

  const categories = selectedValues("categories");
  const tools = selectedValues("tools");
  if (!categories.length) {
    submitStatus.textContent = "Select at least one category.";
    return;
  }
  if (!tools.length) {
    submitStatus.textContent = "Select at least one tool.";
    return;
  }

  const mediaRefs = await PromptPlatform.savePreviewMedia([...(previewUpload.files || [])]);
  const result = await PromptPlatform.submitPrompt({
    prompt_type: wizardState.promptType,
    title: promptTitle.value,
    description: promptDescription.value,
    main_prompt: mainPrompt.value,
    negative_prompt: negativePrompt.value,
    motion_prompt: motionPrompt.value,
    preview_media: mediaRefs,
    categories,
    tools,
    difficulty: difficultySelect.value,
    generation_time: generationTime.value
  });

  if (!result.ok) {
    submitStatus.textContent = result.message;
    return;
  }

  submitStatus.textContent = "Your prompt has been submitted for review.";
  PromptPlatform.showToast("Submission saved");
  window.setTimeout(() => {
    window.location.href = "profile.html?tab=prompts";
  }, 900);
});

PromptPlatform.updateNav();
renderTypeCards();
renderOptionChips(categoryOptions, PromptPlatform.CATEGORIES, "categories");
renderOptionChips(toolOptions, PromptPlatform.TOOLS, "tools");
goToStep(1);
