/**
 * Build static site for GitHub Pages → /docs
 * Live URL: https://snehadevarakonda.github.io/campusMemory/
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS = path.join(ROOT, 'docs');
const BASE = '/campusMemory';

const ROUTES = [
  { file: 'index.html', out: 'index.html' },
  { file: 'login.html', out: 'login/index.html' },
  { file: 'signup.html', out: 'signup/index.html' },
  { file: 'dashboard.html', out: 'dashboard/index.html' },
  { file: 'recent.html', out: 'recent/index.html' },
  { file: 'following-feed.html', out: 'following-feed/index.html' },
  { file: 'profile.html', out: 'profile/index.html' },
];

const rewriteHtml = (html) => {
  let out = html;

  // Absolute asset paths
  out = out.replace(/href="\/css\//g, `href="${BASE}/css/`);
  out = out.replace(/src="\/css\//g, `src="${BASE}/css/`);
  out = out.replace(/href="\/js\//g, `href="${BASE}/js/`);
  out = out.replace(/src="\/js\//g, `src="${BASE}/js/`);

  // App routes → folder URLs
  const routes = ['login', 'signup', 'dashboard', 'recent', 'following-feed', 'profile'];
  routes.forEach((r) => {
    const re = new RegExp(`href="/${r}"`, 'g');
    out = out.replace(re, `href="${BASE}/${r}/"`);
  });
  out = out.replace(/href="\/(?!campusMemory)/g, `href="${BASE}/`);
  out = out.replace(/src="\/(?!campusMemory)/g, `src="${BASE}/`);

  // Inject GitHub Pages + demo backend (before copy.js)
  const inject = `  <script src="${BASE}/js/github-pages.js"></script>\n  <script src="${BASE}/js/demo-backend.js"></script>\n`;
  if (!out.includes('github-pages.js')) {
    out = out.replace(
      /(\s*)<script src="[^"]*\/js\/copy\.js/,
      `${inject}$1<script src="${BASE}/js/copy.js`
    );
  }

  return out;
};

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
};

const rmDir = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) rmDir(p);
    else fs.unlinkSync(p);
  }
  fs.rmdirSync(dir);
};

// Clean docs (keep .git if any — shouldn't)
if (fs.existsSync(DOCS)) rmDir(DOCS);
fs.mkdirSync(DOCS, { recursive: true });

// Copy public assets
copyDir(path.join(ROOT, 'public', 'css'), path.join(DOCS, 'css'));
copyDir(path.join(ROOT, 'public', 'js'), path.join(DOCS, 'js'));

// Build HTML pages from views
for (const { file, out } of ROUTES) {
  const src = path.join(ROOT, 'views', file);
  const dest = path.join(DOCS, out);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const html = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(dest, rewriteHtml(html));
}

// GitHub Pages
fs.writeFileSync(path.join(DOCS, '.nojekyll'), '');

// 404 → home
fs.writeFileSync(
  path.join(DOCS, '404.html'),
  `<!DOCTYPE html><html><head><meta charset="utf-8"><script>location.replace("${BASE}/");</script></head><body></body></html>`
);

console.log('GitHub Pages build complete → docs/');
console.log(`Deploy: https://snehadevarakonda.github.io${BASE}/`);
