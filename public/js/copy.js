// Gen Z microcopy — shared across Campus Memories

const COPY = {
  nav: {
    class: 'class chaos',
    explore: 'fresh chaos',
    following: 'your people',
    profile: 'you',
  },
  feeds: {
    classTitle: 'class chaos',
    classSub: 'your section’s memory dump',
    exploreTitle: 'fresh chaos',
    exploreSub: 'campus lore from your college — scroll the vibe',
    followingTitle: 'inner circle',
    followingSub: 'memories from people you actually vibe with',
    scopeUniversity: 'whole campus',
    scopeYear: 'your year only',
  },
  stories: {
    empty: 'no daily chaos yet',
    barLabel: 'batch moments',
  },
  post: {
    createTitle: 'drop a memory',
    captionPlaceholder: 'what’s the lore here 👀',
    uploadLabel: 'tap to add the pic',
    uploadHasFile: 'locked in ✓',
    submit: 'drop it',
    success: 'memory dropped — the batch can see it now ✨',
  },
  follow: {
    follow: 'vibe with them',
    following: 'vibing',
    unfollow: 'vibe with them',
    viewOnly: 'view only — same uni to vibe',
  },
  comments: {
    placeholder: 'say something unhinged…',
    submit: 'post',
    loading: 'loading comments…',
    empty: 'no lore in the comments yet',
    inlinePlaceholder: 'continue the drama…',
    openBtn: 'add lore',
  },
  likes: {
    count: (n) => (n === 1 ? '1 vibe' : `${n} vibes`),
    aria: 'send a vibe',
  },
  search: {
    placeholder: 'find your people…',
    empty: 'nobody matched that',
    searching: 'searching the batch…',
  },
  empty: {
    classFeed: 'this class is too quiet fr 😭<br><small>be the first to start the chaos</small>',
    explore: 'nobody posted yet — campus is quiet 👀',
    following: 'follow some people to unlock the vibes',
    followingCta: 'find your people',
    profilePosts: 'no memory drops yet',
    profilePostsHint: 'their lore archive is empty (for now)',
  },
  profile: {
    posts: 'memory drops',
    followers: 'the gang',
    following: 'vibe circle',
    gridTitle: 'core memories',
    shareCta: 'drop a memory',
    loading: 'loading profile…',
    deptPrefix: 'branch',
  },
  loading: [
    'loading the vibes…',
    'fetching campus chaos…',
    'summoning memories…',
    'cooking your feed…',
    'pulling batch lore…',
  ],
  inlineLoad: [
    'fetching the vibes…',
    'loading more chaos…',
    'summoning posts…',
  ],
  auth: {
    loginTitle: 'welcome back',
    loginSub: 'your batch missed you',
    signupTitle: 'join your batch',
    signupSub: 'private memories, zero randos',
    loginBtn: 'let’s go',
    signupBtn: 'join the chaos',
    emailPlaceholder: 'college email',
    passwordPlaceholder: 'your secret password',
    usernameHint: 'friends search you with @username',
  },
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const randomLoadingLine = () => randomFrom(COPY.loading);

const randomInlineLoad = () => randomFrom(COPY.inlineLoad);

let loadingRotateTimer = null;

const showLoading = (show = true) => {
  const overlay = document.getElementById('loading');
  if (!overlay) return;

  const label = overlay.querySelector('.loading-label');

  if (show) {
    overlay.classList.add('show');
    if (label) {
      label.textContent = randomLoadingLine();
      clearInterval(loadingRotateTimer);
      loadingRotateTimer = setInterval(() => {
        label.textContent = randomLoadingLine();
      }, 2400);
    }
  } else {
    overlay.classList.remove('show');
    clearInterval(loadingRotateTimer);
    loadingRotateTimer = null;
  }
};

const setInlineLoader = (el, show) => {
  if (!el) return;
  if (show) {
    el.textContent = randomInlineLoad();
    el.classList.add('show');
  } else {
    el.classList.remove('show');
  }
};

const initLoadingOverlays = () => {
  document.querySelectorAll('#loading').forEach((overlay) => {
    if (!overlay.querySelector('.loading-label')) {
      const label = document.createElement('p');
      label.className = 'loading-label';
      label.textContent = randomLoadingLine();
      overlay.appendChild(label);
    }
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLoadingOverlays);
} else {
  initLoadingOverlays();
}
