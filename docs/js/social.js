// Shared social UI — likes, comments, follow, modals, theme

const EMOJIS = ['😭', '🔥', '💀', '✨', '🫡', '❤️', '😂', '👀', '💯', '🎓'];
const D = 'div';

const escapeHtml = (text) => {
  const el = document.createElement(D);
  el.textContent = text || '';
  return el.innerHTML;
};

const initTheme = () => {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.textContent = saved === 'dark' ? '☀️' : '🌙';
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      btn.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }
};

const getAuthor = (post) => post.userId || {};

const followButtonHtml = (userId, isFollowing, isSelf) => {
  if (isSelf) return '';
  if (isFollowing) {
    return `<button class="btn-follow following" data-follow="${userId}" data-state="following" title="you’re vibing">${COPY.follow.following}</button>`;
  }
  return `<button class="btn-follow" data-follow="${userId}" data-state="follow" title="${COPY.follow.follow}">${COPY.follow.follow}</button>`;
};

const bindFollowButtons = (root = document) => {
  root.querySelectorAll('[data-follow]').forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = '1';
    btn.addEventListener('click', async () => {
      const userId = btn.dataset.follow;
      const isFollowing = btn.dataset.state === 'following';
      try {
        if (isFollowing) {
          await apiRequest(`/users/${userId}/follow`, { method: 'DELETE' });
          btn.dataset.state = 'follow';
          btn.textContent = COPY.follow.follow;
          btn.classList.remove('following');
        } else {
          await apiRequest(`/users/${userId}/follow`, { method: 'POST' });
          btn.dataset.state = 'following';
          btn.textContent = COPY.follow.following;
          btn.classList.add('following');
        }
      } catch (e) {
        alert(e.message);
      }
    });
  });
};

const handleLike = async (postId, btn) => {
  try {
    const data = await apiRequest(`/posts/${postId}/like`, { method: 'PUT' });
    if (btn) {
      btn.classList.add('like-pop');
      setTimeout(() => btn.classList.remove('like-pop'), 400);
      btn.textContent = data.isLiked ? '❤️' : '🤍';
      btn.classList.toggle('liked', data.isLiked);
    }
    document.querySelectorAll(`[data-like-count="${postId}"]`).forEach((el) => {
      el.textContent = COPY.likes.count(data.likeCount);
    });
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

const bindLikeButtons = (root = document) => {
  root.querySelectorAll('[data-like]').forEach((btn) => {
    if (btn.dataset.likeBound) return;
    btn.dataset.likeBound = '1';
    btn.addEventListener('click', () => handleLike(btn.dataset.like, btn));
  });
};

const openCommentModal = async (post) => {
  let modal = document.getElementById('commentModal');
  if (!modal) {
    modal = document.createElement(D);
    modal.id = 'commentModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card">
        <button class="modal-close" id="closeCommentModal">&times;</button>
        <img id="modalPostImg" class="modal-post-img" alt="" />
        <div id="modalCommentsList" class="modal-comments"></div>
        <div class="emoji-bar" id="emojiBar"></div>
        <form id="modalCommentForm" class="comment-form">
          <input type="text" id="modalCommentInput" placeholder="${COPY.comments.placeholder}" required />
          <button type="submit" class="btn btn-primary btn-sm">${COPY.comments.submit}</button>
        </form>
      </div>`;
    document.body.appendChild(modal);
    document.getElementById('closeCommentModal').onclick = () => modal.classList.remove('show');
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('show');
    });
    const bar = document.getElementById('emojiBar');
    EMOJIS.forEach((em) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'emoji-btn';
      b.textContent = em;
      b.onclick = () => {
        const input = document.getElementById('modalCommentInput');
        input.value += em;
        input.focus();
      };
      bar.appendChild(b);
    });
  }

  const postId = post._id;
  modal.dataset.postId = postId;
  document.getElementById('modalPostImg').src = post.image;
  const list = document.getElementById('modalCommentsList');
  list.innerHTML = `<p class="loading-text">${COPY.comments.loading}</p>`;

  modal.classList.add('show');

  try {
    const data = await apiRequest(`/comments/${postId}`);
    list.innerHTML =
      data.comments.length === 0
        ? `<p class="empty-hint">${COPY.comments.empty}</p>`
        : data.comments
            .map(
              (c) => `
        <div class="comment">
          <img src="${c.userId?.profilePic || defaultAvatar(c.userId?.fullName)}" class="avatar avatar-sm" alt="" />
          <div><span class="comment-author">${escapeHtml(c.userId?.fullName)}</span> ${escapeHtml(c.text)}</div>
        </div>`
            )
            .join('');
  } catch (e) {
    list.innerHTML = `<p class="empty-hint">${escapeHtml(e.message)}</p>`;
  }

  const form = document.getElementById('modalCommentForm');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const input = document.getElementById('modalCommentInput');
    const text = input.value.trim();
    if (!text) return;
    try {
      const res = await apiRequest(`/comments/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      const c = res.comment;
      const row = document.createElement(D);
      row.className = 'comment';
      row.innerHTML = `
        <img src="${c.userId?.profilePic || defaultAvatar(c.userId?.fullName)}" class="avatar avatar-sm" alt="" />
        <div><span class="comment-author">${escapeHtml(c.userId?.fullName)}</span> ${escapeHtml(c.text)}</div>`;
      list.appendChild(row);
      input.value = '';
      document.querySelectorAll(`[data-comment-count="${postId}"]`).forEach((el) => {
        el.textContent = res.commentCount;
      });
    } catch (err) {
      alert(err.message);
    }
  };
};

const bindCommentOpens = (root = document, postsMap) => {
  root.querySelectorAll('[data-open-comments]').forEach((el) => {
    if (el.dataset.commentBound) return;
    el.dataset.commentBound = '1';
    el.addEventListener('click', () => {
      const id = el.dataset.openComments;
      const post = postsMap?.get(id) || { _id: id, image: el.dataset.postImage || '' };
      openCommentModal(post);
    });
  });
};

const renderExploreCard = (post, options = {}) => {
  const author = getAuthor(post);
  const uid = author._id || author.id;
  const isFollowing = post.isFollowing || false;
  const isSelf =
    post.isSelf ||
    (options.currentUserId && uid && uid.toString() === options.currentUserId.toString());

  return `
    <article class="explore-card" data-post-id="${post._id}">
      <div class="explore-card-header">
        <a href="${route('profile', { id: uid })}" class="explore-user">
          <img src="${author.profilePic || defaultAvatar(author.fullName)}" class="avatar" alt="" />
          <span class="explore-username">${escapeHtml(author.fullName)}</span>
        </a>
        ${followButtonHtml(uid, isFollowing, isSelf)}
      </div>
      <div class="explore-img-wrap" data-open-comments="${post._id}" data-post-image="${post.image}">
        <img src="${post.image}" alt="${escapeHtml(post.caption)}" loading="lazy" class="explore-img" />
        <div class="explore-overlay">
          <p>${escapeHtml(post.caption)}</p>
        </div>
      </div>
      <div class="explore-card-footer">
        <button class="like-btn ${post.isLiked ? 'liked' : ''}" data-like="${post._id}" title="${COPY.likes.aria}" aria-label="${COPY.likes.aria}">${post.isLiked ? '❤️' : '🤍'}</button>
        <span class="like-count" data-like-count="${post._id}">${COPY.likes.count(post.likeCount || 0)}</span>
        <button class="btn-ghost-comment" data-open-comments="${post._id}" data-post-image="${post.image}" title="${COPY.comments.openBtn}">💬 <span data-comment-count="${post._id}">${post.commentCount || 0}</span> <span class="comment-btn-label">${COPY.comments.openBtn}</span></button>
        <span class="explore-time">${formatTime(post.createdAt)}</span>
      </div>
    </article>`;
};

const renderStories = (stories, container) => {
  if (!container) return;
  if (!stories?.length) {
    container.innerHTML = `<p class="stories-empty">${COPY.stories.empty}</p>`;
    container.style.display = 'flex';
    container.classList.add('stories-empty-bar');
    return;
  }
  container.classList.remove('stories-empty-bar');
  container.style.display = 'flex';
  container.innerHTML = stories
    .map((s) => {
      const u = s.userId || {};
      return `
      <a href="${route('profile', { id: u._id })}" class="story-ring">
        <img src="${u.profilePic || defaultAvatar(u.fullName)}" alt="" />
        <span>${escapeHtml((u.fullName || '').split(' ')[0])}</span>
      </a>`;
    })
    .join('');
};

const setupInfiniteScroll = (loadMoreFn) => {
  const sentinel = document.getElementById('scrollSentinel');
  if (!sentinel) return;
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) loadMoreFn();
    },
    { rootMargin: '200px' }
  );
  observer.observe(sentinel);
};

const buildNav = (active) => {
  const links = [
    { href: '/dashboard', label: COPY.nav.class },
    { href: '/recent', label: COPY.nav.explore },
    { href: '/following-feed', label: COPY.nav.following },
    { href: '/profile', label: COPY.nav.profile },
  ];
  return links
    .map(
      (l) =>
        `<a href="${l.href}" class="nav-pill ${active === l.href ? 'active' : ''}">${l.label}</a>`
    )
    .join('');
};

let searchTimer = null;

const initUserSearch = () => {
  const mount = document.getElementById('userSearchMount');
  if (!mount || mount.dataset.ready) return;
  mount.dataset.ready = '1';

  mount.innerHTML = `
    <div class="user-search-wrap">
      <input type="search" id="userSearchInput" class="user-search-input" placeholder="${COPY.search.placeholder}" autocomplete="off" />
      <div id="userSearchResults" class="user-search-results hidden"></div>
    </div>`;

  const input = document.getElementById('userSearchInput');
  const results = document.getElementById('userSearchResults');

  const hideResults = () => {
    results.classList.add('hidden');
    results.innerHTML = '';
  };

  const renderResults = (users, message) => {
    if (!users.length) {
      results.innerHTML = `<p class="user-search-empty">${escapeHtml(message || COPY.search.empty)}</p>`;
      results.classList.remove('hidden');
      return;
    }

    results.innerHTML = users
      .map((u) => {
        const pic = u.profilePic || defaultAvatar(u.fullName);
        const handle = u.username ? `@${escapeHtml(u.username)}` : '';
        const meta = `${escapeHtml(u.university || '')} · ${escapeHtml(u.year || '')} · Sec ${escapeHtml(u.section || '')}`;
        const followBtn = u.canFollow ? followButtonHtml(u.id, u.isFollowing, false) : '';
        return `
          <div class="user-search-item">
            <a href="${route('profile', { id: u.id })}" class="user-search-link">
              <img src="${pic}" alt="" class="avatar avatar-sm" />
              <span class="user-search-info">
                <strong>${escapeHtml(u.fullName)}</strong>
                ${handle ? `<span class="user-search-handle">${handle}</span>` : ''}
                <span class="user-search-meta">${meta}</span>
              </span>
            </a>
            ${followBtn}
          </div>`;
      })
      .join('');

    bindFollowButtons(results);
    results.classList.remove('hidden');
  };

  const runSearch = async (q) => {
    if (q.length < 1) {
      hideResults();
      return;
    }
    try {
      const data = await apiRequest(`/users/search?q=${encodeURIComponent(q)}`);
      const emptyMsg = data.users?.length ? '' : COPY.search.empty;
      renderResults(data.users || [], emptyMsg);
    } catch (err) {
      renderResults([], err.message || COPY.search.empty);
    }
  };

  input.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = input.value.trim().replace(/^@/, '');
    searchTimer = setTimeout(() => runSearch(q), 300);
  });

  input.addEventListener('focus', () => {
    const q = input.value.trim().replace(/^@/, '');
    if (q.length >= 1) runSearch(q);
  });

  document.addEventListener('click', (e) => {
    if (!mount.contains(e.target)) hideResults();
  });
};
