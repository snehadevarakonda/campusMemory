// Dashboard feed — class-only posts, likes, comments

let currentUser = null;

const initDashboard = async () => {
  currentUser = getUser();

  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Refresh user data from server
  try {
    const data = await apiRequest('/auth/me');
    currentUser = data.user;
    setUser(currentUser);
  } catch (error) {
    console.error(error);
  }

  if (currentUser) {
    document.getElementById('classBadge').textContent =
      `${currentUser.university} · ${currentUser.year} · Section ${currentUser.section}`;
  }

  // Image preview before posting
  document.getElementById('postImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    const preview = document.getElementById('postPreview');
    const label = document.getElementById('uploadLabel');
    if (file) {
      preview.src = URL.createObjectURL(file);
      preview.classList.add('visible');
      label.textContent = COPY.post.uploadHasFile;
    }
  });

  document.getElementById('createPostForm').addEventListener('submit', handleCreatePost);

  await loadFeed();
};

const loadFeed = async () => {
  const container = document.getElementById('feedContainer');
  showLoading(true);

  try {
    const data = await apiRequest('/posts/feed');
    renderFeed(data.posts, container);
  } catch (error) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">⚠️</div>
        <p>${error.message}</p>
      </div>`;
  } finally {
    showLoading(false);
  }
};

const renderFeed = (posts, container) => {
  if (!posts || posts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="emoji">📷</div>
        <p>${COPY.empty.classFeed}</p>
      </div>`;
    return;
  }

  container.innerHTML = posts.map((post) => renderPostCard(post)).join('');

  // Attach event listeners after rendering
  posts.forEach((post) => {
    const likeBtn = document.querySelector(`[data-like="${post._id}"]`);
    if (likeBtn) likeBtn.addEventListener('click', () => handleLike(post._id));

    const commentForm = document.querySelector(`[data-comment-form="${post._id}"]`);
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => handleComment(e, post._id));
    }
  });
};

const renderPostCard = (post) => {
  const author = post.userId || {};
  const avatar = author.profilePic || defaultAvatar(author.fullName);
  const name = author.fullName || 'Student';
  const liked = post.isLiked ? 'liked' : '';
  const heart = post.isLiked ? '❤️' : '🤍';

  const commentsHtml = (post.comments || [])
    .map(
      (c) => `
      <div class="comment">
        <img src="${c.userId?.profilePic || defaultAvatar(c.userId?.fullName)}" class="avatar avatar-sm" alt="" />
        <div>
          <span class="comment-author">${escapeHtml(c.userId?.fullName || 'User')}</span>
          ${escapeHtml(c.text)}
        </div>
      </div>`
    )
    .join('');

  return `
    <article class="post-card" data-post="${post._id}">
      <div class="post-header">
        <img src="${avatar}" class="avatar" alt="${escapeHtml(name)}" />
        <div>
          <div class="name">${escapeHtml(name)}</div>
          <div class="time">${formatTime(post.createdAt)}</div>
        </div>
      </div>
      <img src="${post.image}" class="post-image" alt="Memory" loading="lazy" />
      <div class="post-body">
        <div class="post-actions">
          <button class="like-btn ${liked}" data-like="${post._id}" title="${COPY.likes.aria}" aria-label="${COPY.likes.aria}">${heart}</button>
          <span class="like-count" data-like-count="${post._id}">${COPY.likes.count(post.likeCount || 0)}</span>
        </div>
        <p class="post-caption"><strong>${escapeHtml(name)}</strong> ${escapeHtml(post.caption)}</p>
        <div class="comments-section" data-comments="${post._id}">
          ${commentsHtml}
        </div>
        <form class="comment-form" data-comment-form="${post._id}">
          <input type="text" placeholder="${COPY.comments.inlinePlaceholder}" required />
          <button type="submit" class="btn btn-ghost btn-sm">${COPY.comments.submit}</button>
        </form>
      </div>
    </article>`;
};

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text || '';
  return div.innerHTML;
};

const handleCreatePost = async (e) => {
  e.preventDefault();
  hideAlert('postAlert');
  showLoading(true);

  const formData = new FormData();
  formData.append('caption', document.getElementById('caption').value.trim());
  formData.append('image', document.getElementById('postImage').files[0]);

  try {
    await apiRequest('/posts', { method: 'POST', body: formData });
    document.getElementById('createPostForm').reset();
    document.getElementById('postPreview').classList.remove('visible');
    document.getElementById('uploadLabel').textContent = COPY.post.uploadLabel;
    showAlert('postAlert', COPY.post.success, 'success');
    await loadFeed();
  } catch (error) {
    showAlert('postAlert', error.message);
  } finally {
    showLoading(false);
  }
};

const handleLike = async (postId) => {
  try {
    const data = await apiRequest(`/posts/${postId}/like`, { method: 'PUT' });
    const btn = document.querySelector(`[data-like="${postId}"]`);
    const countEl = document.querySelector(`[data-like-count="${postId}"]`);
    if (btn) {
      btn.textContent = data.isLiked ? '❤️' : '🤍';
      btn.classList.toggle('liked', data.isLiked);
    }
    if (countEl) countEl.textContent = COPY.likes.count(data.likeCount);
  } catch (error) {
    console.error(error);
  }
};

const handleComment = async (e, postId) => {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const text = input.value.trim();
  if (!text) return;

  try {
    const data = await apiRequest(`/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });

    const section = document.querySelector(`[data-comments="${postId}"]`);
    const author = data.comment.userId || {};
    const commentEl = document.createElement('div');
    commentEl.className = 'comment';
    commentEl.innerHTML = `
      <img src="${author.profilePic || defaultAvatar(author.fullName)}" class="avatar avatar-sm" alt="" />
      <div>
        <span class="comment-author">${escapeHtml(author.fullName)}</span>
        ${escapeHtml(data.comment.text)}
      </div>`;
    section.appendChild(commentEl);
    input.value = '';
  } catch (error) {
    alert(error.message);
  }
};
