const user = PromptPlatform.getCurrentUser();
if (!user) {
  PromptPlatform.requireAuth("bookmarks.html");
} else {
  const bookmarksGrid = document.getElementById("bookmarksGrid");
  const bookmarksEmpty = document.getElementById("bookmarksEmpty");

  function renderBookmarks() {
    PromptPlatform.updateNav();
    PromptPlatform.bindPromptGrid(bookmarksGrid, PromptPlatform.getUserBookmarkedPrompts(user.id), {
      emptyState: bookmarksEmpty,
      onChange: renderBookmarks
    });
  }

  renderBookmarks();
}
