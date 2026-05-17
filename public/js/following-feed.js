// Following feed — posts from people you follow

let page = 1;
let hasMore = true;
let loading = false;
const postsCache = new Map();

const initFollowingFeed = async () => {
  initTheme();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  const nav = document.getElementById('mainNav');
  if (nav) nav.innerHTML = buildNav('/following-feed');
  initUserSearch();

  setupInfiniteScroll(() => {
    if (hasMore && !loading) loadFollowing(false);
  });

  await loadFollowing(true);
};

const loadFollowing = async (reset = false) => {
  if (loading || (!hasMore && !reset)) return;
  loading = true;

  const grid = document.getElementById('exploreGrid');
  const loader = document.getElementById('gridLoader');
  if (loader) setInlineLoader(loader, true);

  try {
    const data = await apiRequest(`/posts/following-feed?page=${page}&limit=12`);
    hasMore = data.hasMore;

    if (reset && data.posts.length === 0) {
      grid.innerHTML = `
        <div class="empty-state full-width">
          <div class="emoji">👀</div>
          <p>${COPY.empty.following}</p>
          <a href="/recent" class="btn btn-primary btn-sm" style="margin-top:12px;">${COPY.empty.followingCta}</a>
        </div>`;
    } else {
      const me = getUser();
      data.posts.forEach((p) => {
        postsCache.set(p._id, p);
        grid.insertAdjacentHTML(
          'beforeend',
          renderExploreCard(p, { currentUserId: me?.id })
        );
      });
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
