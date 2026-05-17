// Case-insensitive university matching

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeUniversity = (value) => (value || '').trim();

const universityFilter = (university) => {
  const name = normalizeUniversity(university);
  if (!name) return {};
  return { university: new RegExp(`^${escapeRegex(name)}$`, 'i') };
};

const getUniversityName = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.university || '';
};

const sameUniversity = (a, b) =>
  normalizeUniversity(getUniversityName(a)).toLowerCase() ===
  normalizeUniversity(getUniversityName(b)).toLowerCase();

module.exports = { normalizeUniversity, universityFilter, sameUniversity };
