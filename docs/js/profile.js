// Profile — own or other user (Instagram-style)

const getProfileUserId = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
};

const initProfile = async () => {
  initTheme();
  document.getElementById('logoutBtn')?.addEventListener('click', logout);

  const nav = document.getElementById('mainNav');
  if (nav) nav.innerHTML = buildNav('/profile');
  initUserSearch();

  showLoading(true);
  const targetId = getProfileUserId();

  try {
    let profileUser;
    let postsData;

    if (targetId) {
      const prof = await apiRequest(`/users/${targetId}`);
      profileUser = prof.user;
      postsData = await apiRequest(`/posts/user/${targetId}`);
    } else {
      const me = await apiRequest('/auth/me');
      profileUser = {
        ...me.user,
        isSelf: true,
        isFollowing: false,
        followersCount: me.user.followersCount || 0,
        followingCount: me.user.followingCount || 0,
      };
      postsData = await apiRequest('/posts/my');
    }

    document.getElementById('profileAvatar').src =
      profileUser.profilePic || defaultAvatar(profileUser.fullName);
    document.getElementById('profileName').textContent = profileUser.fullName;
    const usernameEl = document.getElementById('profileUsername');
    if (usernameEl) {
      usernameEl.textContent = profileUser.username ? `@${profileUser.username}` : '';
    }
    document.getElementById('profileClass').textContent =
      `${profileUser.university} · ${profileUser.year} · Section ${profileUser.section}`;
    document.getElementById('profileDept').textContent = `${COPY.profile.deptPrefix}: ${profileUser.department}`;

    document.getElementById('postCount').textContent = postsData.totalPosts ?? postsData.posts?.length ?? 0;
    document.getElementById('followersCount').textContent = profileUser.followersCount ?? 0;
    document.getElementById('followingCount').textContent = profileUser.followingCount ?? 0;

    const actions = document.getElementById('profileActions');
    if (profileUser.isSelf) {
      actions.innerHTML = `<a href="${appPath('/dashboard')}" class="btn btn-primary btn-sm">${COPY.profile.shareCta}</a>`;
    } else if (profileUser.canFollow) {
      actions.innerHTML = followButtonHtml(
        profileUser.id,
        profileUser.isFollowing,
        false
      );
      bindFollowButtons(actions);
    } else {
      actions.innerHTML = `<span class="profile-note">View only — follow is for your university</span>`;
    }

    renderProfileGrid(postsData.posts || []);
  } catch (error) {
    document.getElementById('profileGrid').innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <p>${escapeHtml(error.message)}</p>
      </div>`;
  } finally {
    showLoading(false);
  }
};

const renderProfileGrid = (posts) => {
  const grid = document.getElementById('profileGrid');

  if (!posts || posts.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <div class="emoji">📷</div>
        <p>${COPY.empty.profilePosts}</p>
        <p class="empty-hint">${COPY.empty.profilePostsHint}</p>
      </div>`;
    return;
  }

  grid.innerHTML = posts
    .map(
      (post) => `
      <a href="${appPath('/recent')}" class="profile-grid-item" title="${escapeHtml(post.caption)}">
        <img src="${post.image}" alt="${escapeHtml(post.caption)}" loading="lazy" />
      </a>`
    )
    .join('');
};
