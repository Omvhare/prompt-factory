const featuredGrid = document.getElementById("featuredGrid");
const featuredEmpty = document.getElementById("featuredEmpty");
const savedGrid = document.getElementById("savedGrid");
const savedEmpty = document.getElementById("savedEmpty");
const savedSection = document.getElementById("savedSection");
const statPrompts = document.getElementById("statPrompts");
const statCreators = document.getElementById("statCreators");
const statBookmarks = document.getElementById("statBookmarks");

function renderHome() {
  PromptPlatform.updateNav();
  const prompts = PromptPlatform.getPublicPrompts();
  const users = PromptPlatform.getUsers();
  const bookmarks = PromptPlatform.getPromptBookmarks();

  statPrompts.textContent = String(prompts.length);
  statCreators.textContent = String(users.length);
  statBookmarks.textContent = String(bookmarks.length);

  PromptPlatform.bindPromptGrid(featuredGrid, PromptPlatform.getHomepageFeaturedPrompts(), {
    emptyState: featuredEmpty,
    onChange: renderHome
  });

  const currentUser = PromptPlatform.getCurrentUser();
  savedSection.hidden = !currentUser;
  if (currentUser) {
    PromptPlatform.bindPromptGrid(savedGrid, PromptPlatform.getHomepageSavedPrompts(), {
      emptyState: savedEmpty,
      onChange: renderHome
    });
  }
}

renderHome();
