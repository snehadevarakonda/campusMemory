// GitHub Pages — base path + routing helpers
(() => {
  const IS_GITHUB_PAGES =
    location.hostname.endsWith('github.io') &&
    location.pathname.startsWith('/campusMemory');

  const BASE_PATH = IS_GITHUB_PAGES ? '/campusMemory' : '';

  const appPath = (route = '/') => {
    let path = route.startsWith('/') ? route : `/${route}`;
    if (path !== '/' && !path.endsWith('/')) path += '/';
    return `${BASE_PATH}${path}`;
  };

  const route = (name, params = {}) => {
    const base = IS_GITHUB_PAGES ? appPath(`/${name}`) : `/${name}`;
    const q = new URLSearchParams(params).toString();
    return q ? `${base}?${q}` : base;
  };

  window.IS_GITHUB_PAGES = IS_GITHUB_PAGES;
  window.BASE_PATH = BASE_PATH;
  window.USE_DEMO_BACKEND = IS_GITHUB_PAGES;
  window.appPath = appPath;
  window.route = route;

  if (IS_GITHUB_PAGES) {
    document.documentElement.classList.add('github-pages-demo');
  }
})();
