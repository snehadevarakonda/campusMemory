// Username helpers

const normalizeUsername = (value) =>
  (value || '')
    .toLowerCase()
    .trim()
    .replace(/^@/, '')
    .replace(/[^a-z0-9_]/g, '');

const isValidUsername = (username) => /^[a-z0-9_]{3,20}$/.test(username);

const usernameFromEmail = (email) => {
  const base = (email || '').split('@')[0];
  return normalizeUsername(base).slice(0, 20) || 'student';
};

module.exports = { normalizeUsername, isValidUsername, usernameFromEmail };
