// API helper — handles JWT token and Fetch requests

// Use API_BASE_URL from config.js for all API requests
const API_BASE = `${API_BASE_URL}/api`;

const go = (path) => {
  window.location.href = typeof window.appPath === 'function' ? window.appPath(path) : path;
};

window.appPath =
  window.appPath ||
  ((p) => {
    const path = p.startsWith('/') ? p : `/${p}`;
    return path.endsWith('/') || path === '/' ? path : `${path}/`;
  });

window.route =
  window.route ||
  ((name, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return `/${name}${q ? `?${q}` : ''}`;
  });

// Get stored JWT token
const getToken = () => localStorage.getItem('token');

// Save JWT token after login/signup
const setToken = (token) => localStorage.setItem('token', token);

// Remove token on logout
const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Save user info for quick access in UI
const setUser = (user) => localStorage.setItem('user', JSON.stringify(user));

const getUser = () => {
  const data = localStorage.getItem('user');
  return data ? JSON.parse(data) : null;
};

// Redirect to login if not authenticated
const requireAuth = () => {
  if (!getToken()) {
    go('/login');
    return false;
  }
  return true;
};

// Redirect away from auth pages if already logged in
const redirectIfAuth = () => {
  if (getToken()) {
    go('/dashboard');
    return true;
  }
  return false;
};

// Generic API request with JWT header
const apiRequest = async (endpoint, options = {}) => {
  if (window.USE_DEMO_BACKEND && typeof window.demoApiRequest === 'function') {
    try {
      return await window.demoApiRequest(endpoint, options);
    } catch (e) {
      if (e.status === 401) {
        removeToken();
        go('/login');
      }
      throw e;
    }
  }

  const headers = { ...options.headers };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      'Cannot reach the server. Run start.bat and open http://localhost:3000 (do not open HTML files directly).'
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const text = await response.text();

  if (!contentType.includes('application/json')) {
    if (text.trimStart().startsWith('<!DOCTYPE') || text.trimStart().startsWith('<html')) {
      throw new Error(
        'Server returned a web page instead of data. Start the app with start.bat and use http://localhost:3000'
      );
    }
    throw new Error('Unexpected server response. Restart the server and try again.');
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Invalid response from server. Restart the server and try again.');
  }

  if (response.status === 401) {
    removeToken();
    go('/login');
    throw new Error(data.message || 'Session expired. Please login again.');
  }

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
};

// showLoading lives in copy.js (rotating messages)

// Show alert message
const showAlert = (elementId, message, type = 'error') => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert-${type} show`;
};

const hideAlert = (elementId) => {
  const el = document.getElementById(elementId);
  if (el) el.classList.remove('show');
};

// Format timestamp for display
const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

// Default avatar when no profile picture
const defaultAvatar = (name = 'U') => {
  const letter = (name || 'U').charAt(0).toUpperCase();
  return `https://ui-avatars.com/api/?name=${letter}&background=636B2F&color=fff&size=128`;
};

// Logout handler
const logout = () => {
  removeToken();
  go('/');
};
