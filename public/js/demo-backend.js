// In-browser demo API for GitHub Pages (localStorage — no server)
(() => {
  if (!window.USE_DEMO_BACKEND) return;

  const DB_KEY = 'cm_demo_v1';
  const TOKEN_PREFIX = 'demo-token-';

  const uid = () => `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const loadDb = () => {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return seedDb();
  };

  const saveDb = (db) => localStorage.setItem(DB_KEY, JSON.stringify(db));

  const seedDb = () => {
    const mkUser = (u) => ({
      _id: u._id,
      fullName: u.fullName,
      username: u.username,
      email: u.email,
      password: 'password123',
      university: 'BIET',
      department: 'CSE',
      year: u.year,
      section: u.section,
      profilePic: '',
      followers: [],
      following: [],
    });

    const users = [
      mkUser({ _id: 'u_vignesh', fullName: 'Vignesh', username: 'vignesh', email: 'vignesh@campus.edu', year: '3rd Year', section: 'A' }),
      mkUser({ _id: 'u_kavya', fullName: 'Kavya', username: 'kavya', email: 'kavya@campus.edu', year: '3rd Year', section: 'A' }),
      mkUser({ _id: 'u_varsha', fullName: 'Varsha', username: 'varsha', email: 'varsha@campus.edu', year: '4th Year', section: 'B' }),
      mkUser({ _id: 'u_pranay', fullName: 'Pranay', username: 'pranay', email: 'pranay@campus.edu', year: '4th Year', section: 'B' }),
    ];

    const img = (seed) => `https://picsum.photos/seed/${seed}/640/640`;

    const posts = [
      {
        _id: 'p1',
        userId: 'u_vignesh',
        image: img('fest1'),
        caption: 'fest arc unlocked 🔥',
        likes: ['u_kavya'],
        university: 'BIET',
        year: '3rd Year',
        section: 'A',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        _id: 'p2',
        userId: 'u_kavya',
        image: img('batch2'),
        caption: 'batch lore hits different',
        likes: ['u_vignesh', 'u_varsha'],
        university: 'BIET',
        year: '3rd Year',
        section: 'A',
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        _id: 'p3',
        userId: 'u_varsha',
        image: img('campus3'),
        caption: 'senior week vibes ✨',
        likes: [],
        university: 'BIET',
        year: '4th Year',
        section: 'B',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    const comments = [
      { _id: 'c1', postId: 'p1', userId: 'u_kavya', text: 'peak fest fr 😭', createdAt: new Date().toISOString() },
    ];

    users[0].following = ['u_kavya', 'u_varsha'];
    users[1].followers = ['u_vignesh'];
    users[2].followers = ['u_vignesh'];

    const db = { users, posts, comments, stories: [] };
    saveDb(db);
    return db;
  };

  const getTokenUserId = () => {
    const token = localStorage.getItem('token') || '';
    if (!token.startsWith(TOKEN_PREFIX)) return null;
    return token.slice(TOKEN_PREFIX.length);
  };

  const publicUser = (u) => ({
    id: u._id,
    _id: u._id,
    fullName: u.fullName,
    username: u.username,
    email: u.email,
    university: u.university,
    department: u.department,
    year: u.year,
    section: u.section,
    profilePic: u.profilePic,
    followersCount: u.followers.length,
    followingCount: u.following.length,
  });

  const enrichPost = (post, db, meId) => {
    const author = db.users.find((u) => u._id === post.userId);
    const postComments = db.comments.filter((c) => c.postId === post._id);
    const populatedComments = postComments.map((c) => ({
      ...c,
      userId: db.users.find((u) => u._id === c.userId),
    }));

    return {
      ...post,
      userId: author
        ? { _id: author._id, fullName: author.fullName, profilePic: author.profilePic, university: author.university, year: author.year, section: author.section }
        : post.userId,
      comments: populatedComments,
      commentCount: postComments.length,
      likeCount: (post.likes || []).length,
      isLiked: meId ? (post.likes || []).includes(meId) : false,
      isFollowing: meId && author ? (db.users.find((u) => u._id === meId)?.following || []).includes(author._id) : false,
      isSelf: meId === post.userId,
    };
  };

  const delay = (data) => new Promise((r) => setTimeout(() => r(data), 120));

  window.demoApiRequest = async (endpoint, options = {}) => {
    const db = loadDb();
    const method = (options.method || 'GET').toUpperCase();
    const meId = getTokenUserId();
    const me = meId ? db.users.find((u) => u._id === meId) : null;

    // —— Auth ——
    if (endpoint === '/auth/login' && method === 'POST') {
      const { email, password } = JSON.parse(options.body || '{}');
      const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || user.password !== password) throw new Error('Invalid email or password.');
      const token = TOKEN_PREFIX + user._id;
      return delay({
        success: true,
        token,
        user: { ...publicUser(user), id: user._id },
        message: 'you’re back',
      });
    }

    if (endpoint === '/auth/signup' && method === 'POST') {
      const fd = options.body;
      const email = (fd.get('email') || '').toLowerCase();
      if (db.users.some((u) => u.email === email)) throw new Error('Email already registered.');
      const newUser = {
        _id: uid(),
        fullName: fd.get('fullName'),
        username: (fd.get('username') || '').toLowerCase(),
        email,
        password: fd.get('password'),
        university: fd.get('university'),
        department: fd.get('department'),
        year: fd.get('year'),
        section: fd.get('section'),
        profilePic: '',
        followers: [],
        following: [],
      };
      db.users.push(newUser);
      saveDb(db);
      const token = TOKEN_PREFIX + newUser._id;
      return delay({
        success: true,
        token,
        user: { ...publicUser(newUser), id: newUser._id },
        message: 'welcome to the batch ✨',
      });
    }

    if (endpoint === '/auth/me' && method === 'GET') {
      if (!me) throw new Error('Not authenticated');
      return delay({
        success: true,
        user: {
          ...publicUser(me),
          id: me._id,
          followersCount: me.followers.length,
          followingCount: me.following.length,
        },
      });
    }

    if (!me) {
      const err = new Error('Session expired. Please login again.');
      err.status = 401;
      throw err;
    }

    // —— Posts feed (class) ——
    if (endpoint === '/posts/feed' && method === 'GET') {
      const posts = db.posts
        .filter((p) => p.university === me.university && p.year === me.year && p.section === me.section)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map((p) => enrichPost(p, db, meId));
      return delay({ success: true, posts });
    }

    // —— Recent / explore ——
    if (endpoint.startsWith('/posts/recent') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const scope = params.get('scope') === 'year' ? 'year' : 'university';
      const page = Math.max(1, parseInt(params.get('page') || '1', 10));
      const limit = parseInt(params.get('limit') || '12', 10);
      let list = db.posts.filter((p) => p.university === me.university);
      if (scope === 'year') list = list.filter((p) => p.year === me.year);
      list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const start = (page - 1) * limit;
      const slice = list.slice(start, start + limit);
      return delay({
        success: true,
        posts: slice.map((p) => enrichPost(p, db, meId)),
        hasMore: start + limit < list.length,
        page,
      });
    }

    // —— Following feed ——
    if (endpoint.startsWith('/posts/following-feed') && method === 'GET') {
      const params = new URLSearchParams(endpoint.split('?')[1] || '');
      const page = Math.max(1, parseInt(params.get('page') || '1', 10));
      const limit = parseInt(params.get('limit') || '12', 10);
      const following = me.following || [];
      let list = db.posts.filter((p) => following.includes(p.userId));
      list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const start = (page - 1) * limit;
      const slice = list.slice(start, start + limit);
      return delay({
        success: true,
        posts: slice.map((p) => enrichPost(p, db, meId)),
        hasMore: start + limit < list.length,
        page,
      });
    }

    if (endpoint === '/posts/my' && method === 'GET') {
      const posts = db.posts
        .filter((p) => p.userId === meId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return delay({ success: true, posts, totalPosts: posts.length });
    }

    if (endpoint.match(/^\/posts\/user\/[^/]+$/) && method === 'GET') {
      const targetId = endpoint.split('/').pop();
      const posts = db.posts
        .filter((p) => p.userId === targetId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return delay({ success: true, posts, totalPosts: posts.length });
    }

    if (endpoint === '/posts' && method === 'POST') {
      const fd = options.body;
      const caption = fd.get('caption') || '';
      const file = fd.get('image');
      const image = file
        ? `https://picsum.photos/seed/${Date.now()}/640/640`
        : `https://picsum.photos/seed/${uid()}/640/640`;
      const post = {
        _id: uid(),
        userId: meId,
        image,
        caption,
        likes: [],
        university: me.university,
        year: me.year,
        section: me.section,
        createdAt: new Date().toISOString(),
      };
      db.posts.unshift(post);
      saveDb(db);
      return delay({ success: true, message: 'memory dropped ✨', post });
    }

    if (endpoint.match(/^\/posts\/[^/]+\/like$/) && method === 'PUT') {
      const postId = endpoint.split('/')[2];
      const post = db.posts.find((p) => p._id === postId);
      if (!post) throw new Error('Post not found.');
      const likes = post.likes || [];
      const idx = likes.indexOf(meId);
      if (idx >= 0) likes.splice(idx, 1);
      else likes.push(meId);
      post.likes = likes;
      saveDb(db);
      return delay({
        success: true,
        likeCount: likes.length,
        isLiked: likes.includes(meId),
      });
    }

    // —— Comments ——
    if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'GET') {
      const postId = endpoint.split('/')[2];
      const comments = db.comments
        .filter((c) => c.postId === postId)
        .map((c) => ({ ...c, userId: db.users.find((u) => u._id === c.userId) }));
      return delay({ success: true, comments });
    }

    if (endpoint.match(/^\/comments\/[^/]+$/) && method === 'POST') {
      const postId = endpoint.split('/')[2];
      const { text } = JSON.parse(options.body || '{}');
      const comment = {
        _id: uid(),
        postId,
        userId: meId,
        text,
        createdAt: new Date().toISOString(),
      };
      db.comments.push(comment);
      saveDb(db);
      const count = db.comments.filter((c) => c.postId === postId).length;
      return delay({
        success: true,
        message: 'lore posted',
        comment: { ...comment, userId: me },
        commentCount: count,
      });
    }

    // —— Users ——
    if (endpoint.startsWith('/users/search') && method === 'GET') {
      const q = new URLSearchParams(endpoint.split('?')[1] || '').get('q') || '';
      const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const users = db.users
        .filter((u) => u._id !== meId && (regex.test(u.fullName) || regex.test(u.email) || regex.test(u.username)))
        .slice(0, 15)
        .map((u) => ({
          ...publicUser(u),
          isFollowing: me.following.includes(u._id),
          canFollow: u.university === me.university,
        }));
      return delay({ success: true, users });
    }

    if (endpoint.match(/^\/users\/[^/]+$/) && method === 'GET' && !endpoint.includes('/follow')) {
      const id = endpoint.split('/').pop();
      const user = db.users.find((u) => u._id === id);
      if (!user) throw new Error('User not found.');
      return delay({
        success: true,
        user: {
          ...publicUser(user),
          id: user._id,
          isSelf: user._id === meId,
          isFollowing: me.following.includes(user._id),
          canFollow: user.university === me.university && user._id !== meId,
        },
      });
    }

    if (endpoint.match(/^\/users\/[^/]+\/follow$/) && method === 'POST') {
      const targetId = endpoint.split('/')[2];
      const target = db.users.find((u) => u._id === targetId);
      if (!target) throw new Error('User not found.');
      if (target.university !== me.university) throw new Error('You can only follow students at your university.');
      if (!me.following.includes(targetId)) {
        me.following.push(targetId);
        target.followers.push(meId);
        saveDb(db);
      }
      return delay({ success: true, message: 'Follow the chaos — you’re in!', isFollowing: true });
    }

    if (endpoint.match(/^\/users\/[^/]+\/follow$/) && method === 'DELETE') {
      const targetId = endpoint.split('/')[2];
      const target = db.users.find((u) => u._id === targetId);
      me.following = me.following.filter((id) => id !== targetId);
      if (target) target.followers = target.followers.filter((id) => id !== meId);
      saveDb(db);
      return delay({ success: true, message: 'left the vibe circle', isFollowing: false });
    }

    if (endpoint.startsWith('/stories') && method === 'GET') {
      return delay({ success: true, stories: [] });
    }

    throw new Error(`Demo API: route not found ${method} ${endpoint}`);
  };
})();
