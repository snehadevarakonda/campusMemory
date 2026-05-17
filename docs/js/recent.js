// Recent Memories / Explore — masonry feed + infinite scroll

let page = 1;
let hasMore = true;
let loading = false;
let postsCache = new Map();
let scope = localStorage.getItem('feedScope') || 'university';

const initRecent = async () => {
  initTheme();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  const nav = document.getElementById('mainNav');
  if (nav) nav.innerHTML = buildNav('/recent');
  initUserSearch();

  const scopeSelect = document.getElementById('scopeSelect');
  if (scopeSelect) {
    scopeSelect.value = scope;
    scopeSelect.addEventListener('change', () => {
      scope = scopeSelect.value;
      localStorage.setItem('feedScope', scope);
      resetAndLoad();
    });
  }

  setupInfiniteScroll(() => {
    if (hasMore && !loading) loadRecent(false);
  });

  await loadStories();
  await loadRecent(true);
};

const resetAndLoad = () => {
  page = 1;
  hasMore = true;
  loading = false;
  postsCache.clear();
  document.getElementById('exploreGrid').innerHTML = '';
  loadStories();
  loadRecent(true);
};

const loadStories = async () => {
  try {
    const data = await apiRequest(`/stories?scope=${scope}`);
    renderStories(data.stories, document.getElementById('storiesBar'));
  } catch (e) {
    console.error(e);
  }
};

const loadRecent = async (reset = false) => {
  if (loading || (!hasMore && !reset)) return;
  loading = true;

  const grid = document.getElementById('exploreGrid');
  const loader = document.getElementById('gridLoader');
    if (loader) setInlineLoader(loader, true);

  try {
    const data = await apiRequest(`/posts/recent?page=${page}&limit=12&scope=${scope}`);
    hasMore = data.hasMore;

    if (reset && data.posts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state full-width">
          <div class="emoji">😭</div>
          <p>${COPY.empty.explore}</p>
        </div>`;
    } else {
      const me = getUser();
      data.posts.forEach((p) => {
        postsCache.set(p._id, p);
        grid.insertAdjacentHTML(
          'beforeend',
          renderExploreCard(p, {
            currentUserId: me?.id,
            followingSet: null,
          })
        );
      });
      bindFollowButtons(grid);
      bindLikeButtons(grid);
      bindCommentOpens(grid, postsCache);
    }

    page += 1;
  } catch (e) {
    if (page === 1) {
      grid.innerHTML = `<div class="empty-state full-width"><p>${escapeHtml(e.message)}</p></div>`;
    }
  } finally {
    loading = false;
    if (loader) setInlineLoader(loader, false);
  }
};
