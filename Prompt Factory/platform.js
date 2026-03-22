const PromptPlatform = (() => {
  const STORAGE_KEYS = {
    users: "pp_users_v1",
    prompts: "pp_prompts_v1",
    likes: "pp_prompt_likes_v1",
    bookmarks: "pp_prompt_bookmarks_v1",
    views: "pp_prompt_views_v1",
    copies: "pp_prompt_copies_v1",
    currentUser: "pp_current_user_v1"
  };

  const LEGACY_KEYS = {
    profiles: "pf_profiles_v2",
    prompts: "pf_prompts_v3",
    currentUser: "pf_current_user_v2"
  };

  const CARTOON_AVATARS = [
    "avatars/avatar-1.svg",
    "avatars/avatar-2.svg",
    "avatars/avatar-3.svg",
    "avatars/avatar-4.svg",
    "avatars/avatar-5.svg",
    "avatars/avatar-6.svg"
  ];

  const CATEGORIES = ["Cinematic", "Fantasy", "Ads", "Motion", "Corporate", "Cute", "Reels", "Storytelling"];
  const TOOLS = ["ChatGPT", "Midjourney", "Runway", "Stable Diffusion", "Pika", "Sora"];
  const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

  const seedUsers = [
    {
      id: "user-rhea",
      username: "rheapatel",
      email: "rhea@example.com",
      password_hash: hashPassword("prompt123"),
      avatar: "avatars/avatar-1.svg",
      bio: "Creative director building editorial visuals and beauty-first AI campaigns.",
      preferred_category: "Cinematic",
      created_at: "2026-02-08T10:00:00.000Z"
    },
    {
      id: "user-aarav",
      username: "aaravmehta",
      email: "aarav@example.com",
      password_hash: hashPassword("prompt123"),
      avatar: "avatars/avatar-2.svg",
      bio: "Specialist in automotive launch films, motion prompts, and premium ad storytelling.",
      preferred_category: "Motion",
      created_at: "2026-02-17T10:00:00.000Z"
    }
  ];

  const seedPrompts = [
    {
      id: "prompt-1",
      title: "Epic City Launch Sequence",
      description: "High-end cinematic city reveal for ads, trailers, and launch films.",
      main_prompt:
        "Epic cinematic shot of a futuristic city at sunset, neon reflections on glass towers, dramatic lighting, ultra realistic skyline, premium ad-film atmosphere, volumetric haze, precise detail, 35mm lens feeling.",
      negative_prompt: "blurry, distorted faces, oversaturated colors, low detail",
      motion_prompt: "slow cinematic drone push through skyline, soft parallax movement, gentle light flicker",
      preview_media: [],
      prompt_type: "video",
      categories: ["Cinematic", "Ads", "Storytelling"],
      tools: ["Runway", "ChatGPT"],
      difficulty: "Advanced",
      generation_time: "5-8 seconds video generation",
      creator_id: "user-aarav",
      likes_count: 0,
      bookmarks_count: 0,
      views: 0,
      copy_count: 0,
      status: "approved",
      created_at: "2026-03-01T12:00:00.000Z"
    },
    {
      id: "prompt-2",
      title: "Luxury Skincare Portrait Prompt",
      description: "Clean editorial portrait prompt for premium beauty campaigns.",
      main_prompt:
        "Studio beauty portrait of a confident female model for luxury skincare campaign, soft key light, subtle rim light, realistic skin texture, premium neutral palette, magazine editorial quality, shallow depth of field.",
      negative_prompt: "extra fingers, plastic skin, low detail, noisy background",
      motion_prompt: "",
      preview_media: [],
      prompt_type: "image",
      categories: ["Cinematic", "Corporate", "Ads"],
      tools: ["Midjourney"],
      difficulty: "Intermediate",
      generation_time: "Under 30 seconds",
      creator_id: "user-rhea",
      likes_count: 0,
      bookmarks_count: 0,
      views: 0,
      copy_count: 0,
      status: "approved",
      created_at: "2026-03-04T15:00:00.000Z"
    },
    {
      id: "prompt-3",
      title: "Brand Story Script Starter",
      description: "Text prompt to draft a concise brand story script with emotional clarity.",
      main_prompt:
        "Write a 45-second brand film voiceover for a modern creative studio. Tone should feel human, warm, ambitious, and quietly premium. Include a clear opening hook, a transformation arc, and a final memorable line.",
      negative_prompt: "generic phrases, corporate jargon, robotic tone",
      motion_prompt: "",
      preview_media: [],
      prompt_type: "text",
      categories: ["Corporate", "Storytelling"],
      tools: ["ChatGPT"],
      difficulty: "Beginner",
      generation_time: "Instant",
      creator_id: "user-rhea",
      likes_count: 0,
      bookmarks_count: 0,
      views: 0,
      copy_count: 0,
      status: "approved",
      created_at: "2026-03-08T11:00:00.000Z"
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

  function uid(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function hashPassword(password) {
    return `hash_${btoa(password).replace(/=/g, "")}`;
  }

  function getUsers() {
    return readJSON(STORAGE_KEYS.users, []);
  }

  function getPrompts() {
    return readJSON(STORAGE_KEYS.prompts, []).map(normalizePrompt);
  }

  function getPromptLikes() {
    return readJSON(STORAGE_KEYS.likes, []);
  }

  function getPromptBookmarks() {
    return readJSON(STORAGE_KEYS.bookmarks, []);
  }

  function getPromptViews() {
    return readJSON(STORAGE_KEYS.views, []);
  }

  function getPromptCopies() {
    return readJSON(STORAGE_KEYS.copies, []);
  }

  function getCurrentUser() {
    return readJSON(STORAGE_KEYS.currentUser, null);
  }

  function setUsers(users) {
    writeJSON(STORAGE_KEYS.users, users);
  }

  function setPrompts(prompts) {
    writeJSON(STORAGE_KEYS.prompts, prompts.map(normalizePrompt));
  }

  function setPromptLikes(entries) {
    writeJSON(STORAGE_KEYS.likes, entries);
  }

  function setPromptBookmarks(entries) {
    writeJSON(STORAGE_KEYS.bookmarks, entries);
  }

  function setPromptViews(entries) {
    writeJSON(STORAGE_KEYS.views, entries);
  }

  function setPromptCopies(entries) {
    writeJSON(STORAGE_KEYS.copies, entries);
  }

  function setCurrentUser(user) {
    writeJSON(STORAGE_KEYS.currentUser, user);
  }

  function normalizePrompt(prompt) {
    const normalized = { ...prompt };
    if (!Array.isArray(normalized.categories)) normalized.categories = [];
    if (!Array.isArray(normalized.tools)) normalized.tools = [];
    if (!Array.isArray(normalized.preview_media)) normalized.preview_media = [];
    if (typeof normalized.likes_count !== "number") normalized.likes_count = 0;
    if (typeof normalized.bookmarks_count !== "number") normalized.bookmarks_count = 0;
    if (typeof normalized.views !== "number") normalized.views = 0;
    if (typeof normalized.copy_count !== "number") normalized.copy_count = 0;
    if (!normalized.status) normalized.status = "approved";
    if (!normalized.prompt_type) normalized.prompt_type = normalized.type || "image";
    if (!normalized.main_prompt) normalized.main_prompt = normalized.prompt || "";
    if (!normalized.created_at) normalized.created_at = new Date().toISOString();
    return normalized;
  }

  function migrateLegacy() {
    if (localStorage.getItem(STORAGE_KEYS.users) && localStorage.getItem(STORAGE_KEYS.prompts)) return;

    const legacyProfiles = readJSON(LEGACY_KEYS.profiles, []);
    const legacyPrompts = readJSON(LEGACY_KEYS.prompts, []);
    const legacyCurrentUser = readJSON(LEGACY_KEYS.currentUser, null);

    const users = legacyProfiles.length
      ? legacyProfiles.map((profile, index) => ({
          id: profile.id || uid("user"),
          username: (profile.name || `creator${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, ""),
          email: profile.email,
          password_hash: hashPassword("prompt123"),
          avatar: profile.avatarUrl || CARTOON_AVATARS[index % CARTOON_AVATARS.length],
          bio: profile.about || "",
          preferred_category: profile.specialty || "Cinematic",
          created_at: new Date().toISOString()
        }))
      : seedUsers;

    const emailToId = new Map(users.map((user) => [user.email.toLowerCase(), user.id]));
    const prompts = legacyPrompts.length
      ? legacyPrompts.map((prompt) =>
          normalizePrompt({
            id: prompt.id || uid("prompt"),
            title: prompt.title || "Untitled Prompt",
            description: prompt.description || "",
            main_prompt: prompt.prompt || prompt.main_prompt || "",
            negative_prompt: prompt.negative_prompt || "",
            motion_prompt: prompt.motion_prompt || "",
            preview_media: Array.isArray(prompt.mediaRefs) ? prompt.mediaRefs : Array.isArray(prompt.preview_media) ? prompt.preview_media : [],
            prompt_type: prompt.prompt_type || prompt.type || "image",
            categories: Array.isArray(prompt.categories)
              ? prompt.categories
              : prompt.industry
                ? [prompt.industry]
                : [],
            tools: Array.isArray(prompt.tools)
              ? prompt.tools
              : prompt.engine
                ? [prompt.engine]
                : [],
            difficulty: prompt.difficulty || "Intermediate",
            generation_time: prompt.generation_time || "Not specified",
            creator_id: emailToId.get((prompt.creatorEmail || "").toLowerCase()) || users[0]?.id || "",
            likes_count: 0,
            bookmarks_count: 0,
            views: typeof prompt.views === "number" ? prompt.views : 0,
            copy_count: typeof prompt.copy_count === "number" ? prompt.copy_count : 0,
            status: prompt.status || "approved",
            created_at: prompt.createdAt || prompt.created_at || new Date().toISOString()
          })
        )
      : seedPrompts;

    const likes = [];
    for (const prompt of legacyPrompts) {
      if (!Array.isArray(prompt.likedByEmails)) continue;
      for (const email of prompt.likedByEmails) {
        const userId = emailToId.get((email || "").toLowerCase());
        if (!userId) continue;
        likes.push({ id: uid("like"), user_id: userId, prompt_id: prompt.id, created_at: new Date().toISOString() });
      }
    }

    setUsers(users);
    setPrompts(prompts);
    setPromptLikes(likes);
    setPromptBookmarks([]);
    setPromptViews([]);
    setPromptCopies([]);

    if (legacyCurrentUser && legacyCurrentUser.email) {
      const migratedUser = users.find((user) => user.email.toLowerCase() === legacyCurrentUser.email.toLowerCase()) || null;
      setCurrentUser(migratedUser);
    } else {
      setCurrentUser(null);
    }
  }

  function seedIfNeeded() {
    migrateLegacy();

    if (!localStorage.getItem(STORAGE_KEYS.users)) setUsers(seedUsers);
    if (!localStorage.getItem(STORAGE_KEYS.prompts)) setPrompts(seedPrompts);
    if (!localStorage.getItem(STORAGE_KEYS.likes)) setPromptLikes([]);
    if (!localStorage.getItem(STORAGE_KEYS.bookmarks)) setPromptBookmarks([]);
    if (!localStorage.getItem(STORAGE_KEYS.views)) setPromptViews([]);
    if (!localStorage.getItem(STORAGE_KEYS.copies)) setPromptCopies([]);
    if (!localStorage.getItem(STORAGE_KEYS.currentUser)) setCurrentUser(null);
    recalculateCounts();
  }

  function recalculateCounts() {
    const prompts = getPrompts();
    const likes = getPromptLikes();
    const bookmarks = getPromptBookmarks();
    const views = getPromptViews();
    const copies = getPromptCopies();

    const likeMap = countByPrompt(likes);
    const bookmarkMap = countByPrompt(bookmarks);
    const viewMap = countByPrompt(views);
    const copyMap = countByPrompt(copies);

    const next = prompts.map((prompt) => ({
      ...prompt,
      likes_count: likeMap.get(prompt.id) || 0,
      bookmarks_count: bookmarkMap.get(prompt.id) || 0,
      views: viewMap.get(prompt.id) || prompt.views || 0,
      copy_count: copyMap.get(prompt.id) || prompt.copy_count || 0
    }));

    setPrompts(next);
    return next;
  }

  function countByPrompt(entries) {
    const map = new Map();
    for (const entry of entries) {
      map.set(entry.prompt_id, (map.get(entry.prompt_id) || 0) + 1);
    }
    return map;
  }

  function getPromptById(promptId) {
    return getPrompts().find((prompt) => prompt.id === promptId) || null;
  }

  function getUserById(userId) {
    return getUsers().find((user) => user.id === userId) || null;
  }

  function getPromptCreator(prompt) {
    return getUserById(prompt.creator_id);
  }

  function getPublicPrompts() {
    return getPrompts().filter((prompt) => prompt.status === "approved");
  }

  function getVisiblePromptsForUser(user) {
    return getPrompts().filter((prompt) => prompt.status === "approved" || (user && prompt.creator_id === user.id));
  }

  function getBookmarkedPromptIds(userId) {
    return new Set(getPromptBookmarks().filter((entry) => entry.user_id === userId).map((entry) => entry.prompt_id));
  }

  function getLikedPromptIds(userId) {
    return new Set(getPromptLikes().filter((entry) => entry.user_id === userId).map((entry) => entry.prompt_id));
  }

  function getUserPrompts(userId) {
    return getPrompts().filter((prompt) => prompt.creator_id === userId).sort(byNewest);
  }

  function getUserBookmarkedPrompts(userId) {
    const ids = getBookmarkedPromptIds(userId);
    return getPublicPrompts().filter((prompt) => ids.has(prompt.id)).sort(byNewest);
  }

  function getUserLikedPrompts(userId) {
    const ids = getLikedPromptIds(userId);
    return getPublicPrompts().filter((prompt) => ids.has(prompt.id)).sort(byNewest);
  }

  function byNewest(a, b) {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }

  function getTrendingScore(prompt) {
    let score = prompt.likes_count * 2 + prompt.views + prompt.copy_count;
    const createdAt = new Date(prompt.created_at).getTime();
    if (Date.now() - createdAt <= 48 * 60 * 60 * 1000) score += 20;
    return score;
  }

  function sortPrompts(list, sortBy) {
    const prompts = [...list];
    if (sortBy === "most-liked") return prompts.sort((a, b) => b.likes_count - a.likes_count || byNewest(a, b));
    if (sortBy === "most-viewed") return prompts.sort((a, b) => b.views - a.views || byNewest(a, b));
    if (sortBy === "most-copied") return prompts.sort((a, b) => b.copy_count - a.copy_count || byNewest(a, b));
    if (sortBy === "trending") return prompts.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
    return prompts.sort(byNewest);
  }

  function filterPrompts(list, filters) {
    const query = (filters.query || "").trim().toLowerCase();
    return list.filter((prompt) => {
      const typeMatch = !filters.type || filters.type === "all" || prompt.prompt_type === filters.type;
      const difficultyMatch = !filters.difficulty || filters.difficulty === "all" || prompt.difficulty === filters.difficulty;
      const toolMatch = !filters.tool || filters.tool === "all" || prompt.tools.includes(filters.tool);
      const categoryMatch = !filters.category || filters.category === "all" || prompt.categories.includes(filters.category);
      const searchBlob = [
        prompt.title,
        prompt.description,
        prompt.main_prompt,
        prompt.negative_prompt,
        prompt.motion_prompt,
        prompt.categories.join(" "),
        prompt.tools.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      const queryMatch = !query || searchBlob.includes(query);
      return typeMatch && difficultyMatch && toolMatch && categoryMatch && queryMatch;
    });
  }

  function requireAuth(returnTo) {
    const currentUser = getCurrentUser();
    if (currentUser) return currentUser;
    const target = returnTo || `${window.location.pathname.split("/").pop()}${window.location.search || ""}`;
    window.location.href = `auth.html?return=${encodeURIComponent(target)}`;
    return null;
  }

  function signup(payload) {
    const users = getUsers();
    const username = payload.username.trim();
    const email = payload.email.trim().toLowerCase();

    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
      return { ok: false, message: "Username already exists." };
    }
    if (users.some((user) => user.email.toLowerCase() === email)) {
      return { ok: false, message: "Email already exists." };
    }

    const user = {
      id: uid("user"),
      username,
      email,
      password_hash: hashPassword(payload.password),
      avatar: payload.avatar || CARTOON_AVATARS[users.length % CARTOON_AVATARS.length],
      bio: payload.bio || "",
      preferred_category: payload.preferred_category || "Cinematic",
      created_at: new Date().toISOString()
    };

    users.unshift(user);
    setUsers(users);
    setCurrentUser(user);
    return { ok: true, user };
  }

  function login(payload) {
    const users = getUsers();
    const email = payload.email.trim().toLowerCase();
    const passwordHash = hashPassword(payload.password);
    const user = users.find((entry) => entry.email.toLowerCase() === email && entry.password_hash === passwordHash);
    if (!user) return { ok: false, message: "Invalid email or password." };
    setCurrentUser(user);
    return { ok: true, user };
  }

  function logout() {
    setCurrentUser(null);
  }

  async function savePreviewMedia(files) {
    const shortlist = files.slice(0, 4);
    if (window.MediaStore && typeof window.MediaStore.saveFiles === "function") {
      return window.MediaStore.saveFiles(shortlist);
    }
    return shortlist.map((file) => ({ id: "", name: file.name, type: file.type }));
  }

  async function submitPrompt(payload) {
    const user = getCurrentUser();
    if (!user) return { ok: false, message: "Login required." };

    const prompts = getPrompts();
    const prompt = normalizePrompt({
      id: uid("prompt"),
      title: payload.title.trim(),
      description: payload.description.trim(),
      main_prompt: payload.main_prompt.trim(),
      negative_prompt: (payload.negative_prompt || "").trim(),
      motion_prompt: (payload.motion_prompt || "").trim(),
      preview_media: payload.preview_media || [],
      prompt_type: payload.prompt_type,
      categories: payload.categories || [],
      tools: payload.tools || [],
      difficulty: payload.difficulty || "Intermediate",
      generation_time: payload.generation_time || "Not specified",
      creator_id: user.id,
      likes_count: 0,
      bookmarks_count: 0,
      views: 0,
      copy_count: 0,
      status: "pending",
      created_at: new Date().toISOString()
    });

    prompts.unshift(prompt);
    setPrompts(prompts);
    return { ok: true, prompt };
  }

  function updatePrompt(promptId, updates) {
    const prompts = getPrompts();
    const index = prompts.findIndex((prompt) => prompt.id === promptId);
    if (index === -1) return { ok: false, message: "Prompt not found." };
    prompts[index] = normalizePrompt({ ...prompts[index], ...updates });
    setPrompts(prompts);
    return { ok: true, prompt: prompts[index] };
  }

  function canUserAccessPrompt(prompt, user) {
    if (!prompt) return false;
    return prompt.status === "approved" || (user && prompt.creator_id === user.id);
  }

  function hasLiked(promptId, userId) {
    return getPromptLikes().some((entry) => entry.prompt_id === promptId && entry.user_id === userId);
  }

  function hasBookmarked(promptId, userId) {
    return getPromptBookmarks().some((entry) => entry.prompt_id === promptId && entry.user_id === userId);
  }

  function toggleLike(promptId) {
    const user = requireAuth();
    if (!user) return { ok: false, auth: true };

    let likes = getPromptLikes();
    const existing = likes.find((entry) => entry.prompt_id === promptId && entry.user_id === user.id);
    if (existing) {
      likes = likes.filter((entry) => entry.id !== existing.id);
    } else {
      likes.push({ id: uid("like"), prompt_id: promptId, user_id: user.id, created_at: new Date().toISOString() });
    }
    setPromptLikes(likes);
    const prompts = recalculateCounts();
    return { ok: true, liked: !existing, prompt: prompts.find((prompt) => prompt.id === promptId) || null };
  }

  function toggleBookmark(promptId) {
    const user = requireAuth();
    if (!user) return { ok: false, auth: true };

    let bookmarks = getPromptBookmarks();
    const existing = bookmarks.find((entry) => entry.prompt_id === promptId && entry.user_id === user.id);
    if (existing) {
      bookmarks = bookmarks.filter((entry) => entry.id !== existing.id);
    } else {
      bookmarks.push({ id: uid("bookmark"), prompt_id: promptId, user_id: user.id, created_at: new Date().toISOString() });
    }
    setPromptBookmarks(bookmarks);
    const prompts = recalculateCounts();
    return { ok: true, bookmarked: !existing, prompt: prompts.find((prompt) => prompt.id === promptId) || null };
  }

  async function copyPrompt(promptId) {
    const prompt = getPromptById(promptId);
    if (!prompt) return { ok: false, message: "Prompt not found." };

    try {
      await navigator.clipboard.writeText(prompt.main_prompt || "");
    } catch {
      return { ok: false, message: "Clipboard access blocked." };
    }

    const user = getCurrentUser();
    const copies = getPromptCopies();
    copies.push({
      id: uid("copy"),
      prompt_id: promptId,
      user_id: user ? user.id : null,
      created_at: new Date().toISOString()
    });
    setPromptCopies(copies);
    const prompts = recalculateCounts();
    return { ok: true, prompt: prompts.find((entry) => entry.id === promptId) || prompt };
  }

  function recordView(promptId) {
    const key = `pp_view_${promptId}`;
    if (sessionStorage.getItem(key)) return getPromptById(promptId);

    const prompt = getPromptById(promptId);
    if (!prompt) return null;

    const user = getCurrentUser();
    const views = getPromptViews();
    views.push({
      id: uid("view"),
      prompt_id: promptId,
      user_id: user ? user.id : null,
      created_at: new Date().toISOString()
    });
    setPromptViews(views);
    sessionStorage.setItem(key, "1");
    const prompts = recalculateCounts();
    return prompts.find((entry) => entry.id === promptId) || null;
  }

  function getHomepageSavedPrompts() {
    const user = getCurrentUser();
    if (!user) return [];
    return getUserBookmarkedPrompts(user.id).slice(0, 4);
  }

  function getHomepageFeaturedPrompts() {
    return sortPrompts(getPublicPrompts(), "trending").slice(0, 6);
  }

  function getCreatorStats(userId) {
    const prompts = getUserPrompts(userId);
    return {
      totalPrompts: prompts.length,
      totalLikes: prompts.reduce((sum, prompt) => sum + prompt.likes_count, 0),
      totalBookmarks: prompts.reduce((sum, prompt) => sum + prompt.bookmarks_count, 0)
    };
  }

  function formatDate(value) {
    if (!value) return "-";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function updateNav() {
    const user = getCurrentUser();
    document.querySelectorAll("[data-auth-label]").forEach((node) => {
      node.textContent = user ? user.username : "Login / Sign Up";
    });
    document.querySelectorAll("[data-auth-href]").forEach((node) => {
      node.setAttribute("href", user ? "profile.html" : "auth.html");
    });
    document.querySelectorAll("[data-logout]").forEach((node) => {
      node.hidden = !user;
      node.onclick = (event) => {
        event.preventDefault();
        logout();
        window.location.href = "index.html";
      };
    });
  }

  function showToast(message) {
    let toast = document.getElementById("globalToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "globalToast";
      toast.className = "toast";
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
  }

  async function hydratePromptMedia(container, prompt, options = {}) {
    if (!container) return;
    container.innerHTML = "";
    const refs = Array.isArray(prompt.preview_media) ? prompt.preview_media : [];
    const firstRef = refs[0] || null;

    if (firstRef && window.MediaStore && typeof window.MediaStore.getObjectUrl === "function") {
      const url = await window.MediaStore.getObjectUrl(firstRef.id);
      if (url) {
        if ((firstRef.type || "").startsWith("video/")) {
          const video = document.createElement("video");
          video.src = url;
          video.playsInline = true;
          video.className = options.className || "thumb-image";
          if (options.controls) {
            video.controls = true;
          } else {
            video.muted = true;
            video.autoplay = true;
            video.loop = true;
          }
          container.append(video);
        } else {
          const image = document.createElement("img");
          image.src = url;
          image.alt = `${prompt.title} preview`;
          image.className = options.className || "thumb-image";
          container.append(image);
        }
        return;
      }
    }

    const fallback = document.createElement("div");
    fallback.className = `thumb-fallback ${prompt.prompt_type}`;
    fallback.textContent = prompt.prompt_type === "video" ? "Video Preview" : prompt.prompt_type === "text" ? "Text Prompt" : "Image Preview";
    container.append(fallback);
  }

  function buildPromptCard(prompt, options = {}) {
    const user = getCurrentUser();
    const creator = getPromptCreator(prompt);
    const liked = user ? hasLiked(prompt.id, user.id) : false;
    const bookmarked = user ? hasBookmarked(prompt.id, user.id) : false;
    const creatorLink = creator ? `profile.html?id=${encodeURIComponent(creator.id)}` : "#";
    const card = document.createElement("article");
    card.className = "prompt-card";
    card.innerHTML = `
      <a class="card-thumb-link" href="prompt-detail.html?id=${encodeURIComponent(prompt.id)}">
        <div class="thumb card-thumb"></div>
      </a>
      <div class="prompt-body">
        <div class="card-topline">
          <div class="meta-row">
            ${(prompt.categories || []).slice(0, 1).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            ${(prompt.tools || []).slice(0, 1).map((tag) => `<span class="tag">${tag}</span>`).join("")}
            <span class="tag">${prompt.difficulty}</span>
          </div>
        </div>
        <h3><a href="prompt-detail.html?id=${encodeURIComponent(prompt.id)}">${prompt.title}</a></h3>
        <p>${prompt.description}</p>
        <div class="creator-row">
          <a href="${creatorLink}" class="creator-link">${creator ? creator.username : "Unknown creator"}</a>
          <span>${prompt.likes_count} likes</span>
          <span>${prompt.views} views</span>
        </div>
        <div class="prompt-actions">
          <button class="btn btn-icon like-btn${liked ? " liked" : ""}" data-action="like" data-id="${prompt.id}" type="button">&#9829;</button>
          <button class="btn btn-icon bookmark-btn${bookmarked ? " bookmarked" : ""}" data-action="bookmark" data-id="${prompt.id}" type="button">${bookmarked ? "&#9733;" : "&#9734;"}</button>
          <button class="btn btn-ghost copy-btn" data-action="copy" data-id="${prompt.id}" type="button">Copy Prompt</button>
          <a class="btn btn-primary" href="prompt-detail.html?id=${encodeURIComponent(prompt.id)}">View Details</a>
        </div>
      </div>
    `;
    hydratePromptMedia(card.querySelector(".card-thumb"), prompt);
    return card;
  }

  function bindPromptGrid(container, prompts, options = {}) {
    if (!container) return;
    container.innerHTML = "";
    if (!prompts.length) {
      if (options.emptyState) options.emptyState.hidden = false;
      return;
    }
    if (options.emptyState) options.emptyState.hidden = true;
    for (const prompt of prompts) {
      container.append(buildPromptCard(prompt, options));
    }

    container.onclick = async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      const action = target.closest("[data-action]");
      if (!action) return;
      const promptId = action.getAttribute("data-id");
      const actionName = action.getAttribute("data-action");
      if (!promptId || !actionName) return;
      event.preventDefault();

      if (actionName === "like") {
        const result = toggleLike(promptId);
        if (result.ok) {
          showToast(result.liked ? "Prompt liked" : "Like removed");
          if (typeof options.onChange === "function") options.onChange();
        }
      }

      if (actionName === "bookmark") {
        const result = toggleBookmark(promptId);
        if (result.ok) {
          showToast(result.bookmarked ? "Prompt saved" : "Prompt removed");
          if (typeof options.onChange === "function") options.onChange();
        }
      }

      if (actionName === "copy") {
        const result = await copyPrompt(promptId);
        showToast(result.ok ? "Prompt copied!" : result.message || "Copy failed");
        if (result.ok && typeof options.onChange === "function") options.onChange();
      }
    };
  }

  seedIfNeeded();

  return {
    STORAGE_KEYS,
    CARTOON_AVATARS,
    CATEGORIES,
    TOOLS,
    DIFFICULTIES,
    getUsers,
    getPrompts,
    getCurrentUser,
    getPromptById,
    getPromptCreator,
    getPublicPrompts,
    getVisiblePromptsForUser,
    getUserPrompts,
    getUserBookmarkedPrompts,
    getUserLikedPrompts,
    getHomepageFeaturedPrompts,
    getHomepageSavedPrompts,
    getCreatorStats,
    sortPrompts,
    filterPrompts,
    signup,
    login,
    logout,
    requireAuth,
    updateNav,
    savePreviewMedia,
    submitPrompt,
    updatePrompt,
    toggleLike,
    toggleBookmark,
    copyPrompt,
    recordView,
    hasLiked,
    hasBookmarked,
    canUserAccessPrompt,
    formatDate,
    slugify,
    showToast,
    hydratePromptMedia,
    buildPromptCard,
    bindPromptGrid,
    recalculateCounts,
    getPromptLikes,
    getPromptBookmarks,
    getPromptViews,
    getPromptCopies,
    getUserById,
    setCurrentUser,
    setUsers,
    hashPassword
  };
})();

window.PromptPlatform = PromptPlatform;
