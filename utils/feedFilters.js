// Privacy filters for feeds

const { universityFilter, sameUniversity } = require('./university');

const getClassFilter = (user) => ({
  ...universityFilter(user.university),
  year: user.year,
  section: user.section,
});

// Recent / explore: same university, optionally same year
const getUniversityFilter = (user, scope = 'university') => {
  const filter = { ...universityFilter(user.university) };
  if (scope === 'year') {
    filter.year = user.year;
  }
  return filter;
};

const canInteractWithUniversity = (viewer, post) =>
  sameUniversity(viewer.university, post.university);

module.exports = { getClassFilter, getUniversityFilter, canInteractWithUniversity };
