const promptGrid = document.getElementById("promptGrid");
const promptEmpty = document.getElementById("promptEmpty");
const searchPrompt = document.getElementById("searchPrompt");
const typeFilter = document.getElementById("typeFilter");
const toolFilter = document.getElementById("toolFilter");
const categoryFilter = document.getElementById("categoryFilter");
const difficultyFilter = document.getElementById("difficultyFilter");
const sortFilter = document.getElementById("sortFilter");
const clearFilters = document.getElementById("clearFilters");

function fillOptions(select, items, allLabel) {
  const selected = select.value || "all";
  select.innerHTML = `<option value="all">${allLabel}</option>`;
  for (const item of items) {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    select.append(option);
  }
  if ([...select.options].some((option) => option.value === selected)) {
    select.value = selected;
  }
}

function renderBrowser() {
  PromptPlatform.updateNav();

  const filters = {
    query: searchPrompt.value,
    type: typeFilter.value,
    tool: toolFilter.value,
    category: categoryFilter.value,
    difficulty: difficultyFilter.value
  };

  const filtered = PromptPlatform.filterPrompts(PromptPlatform.getPublicPrompts(), filters);
  const sorted = PromptPlatform.sortPrompts(filtered, sortFilter.value);
  PromptPlatform.bindPromptGrid(promptGrid, sorted, { emptyState: promptEmpty, onChange: renderBrowser });
}

[searchPrompt, typeFilter, toolFilter, categoryFilter, difficultyFilter, sortFilter].forEach((field) => {
  field.addEventListener("input", renderBrowser);
  field.addEventListener("change", renderBrowser);
});

clearFilters.addEventListener("click", () => {
  searchPrompt.value = "";
  typeFilter.value = "all";
  toolFilter.value = "all";
  categoryFilter.value = "all";
  difficultyFilter.value = "all";
  sortFilter.value = "trending";
  renderBrowser();
});

fillOptions(toolFilter, PromptPlatform.TOOLS, "All Tools");
fillOptions(categoryFilter, PromptPlatform.CATEGORIES, "All Categories");
renderBrowser();
