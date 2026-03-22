const categoryTitle = document.getElementById("categoryTitle");
const categorySubtitle = document.getElementById("categorySubtitle");
const categoryHeading = document.getElementById("categoryHeading");
const categoryGrid = document.getElementById("categoryGrid");
const categoryEmpty = document.getElementById("categoryEmpty");

function renderCategory() {
  PromptPlatform.updateNav();
  const params = new URLSearchParams(window.location.search);
  const name = params.get("name") || "Cinematic";
  categoryTitle.textContent = `${name} prompts`;
  categoryHeading.textContent = `${name} prompt modules`;
  categorySubtitle.textContent = `Browse prompt cards tagged under ${name}.`;

  const prompts = PromptPlatform.getPublicPrompts().filter((prompt) => prompt.categories.includes(name));
  PromptPlatform.bindPromptGrid(categoryGrid, PromptPlatform.sortPrompts(prompts, "trending"), {
    emptyState: categoryEmpty,
    onChange: renderCategory
  });
}

renderCategory();
