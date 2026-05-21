# Campus Memories

Private college memory-sharing app — class feeds, explore, following, profiles, and stories.

## Run locally

1. Install [MongoDB](https://www.mongodb.com/try/download/community) (or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
2. Copy `.env.example` to `.env` and fill in values
3. `npm install`
4. `npm start` or double-click `start.bat`
5. Open **http://localhost:3000**

> If port `3000` is occupied, set `PORT=3001` before starting.

## Demo

Campus Memories includes these main screens:

- **Landing page preview**: hero copy, batch invite, and feature highlights for a private college memory-sharing experience.
- **Profile view**: user card with batch details, memory drops, gang count, and a core memories section.
- **Class chaos feed**: search for people, post new memories, and browse your section's shared batch posts.

## Live on GitHub Pages (no Render)

**URL:** https://snehadevarakonda.github.io/campusMemory/

The app runs entirely in the browser on GitHub Pages (demo data in localStorage). Push to `main` and GitHub Actions deploys automatically.

**Demo login:** `vignesh@campus.edu` / `password123` (also Kavya, Varsha, Pranay)

Enable Pages: repo **Settings → Pages → Source: GitHub Actions**

Local build: `npm run build:pages` (outputs to `docs/`)

---

## Deploy with server (optional — Render + MongoDB Atlas)

### 1. MongoDB Atlas (free)

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Database Access → add a user with password
3. Network Access → allow `0.0.0.0/0` (for cloud hosting)
4. Connect → copy the connection string → set as `MONGODB_URI`

### 2. Cloudinary (recommended for production images)

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Copy Cloud name, API Key, API Secret into env vars

Without Cloudinary, uploads use local disk and **may be lost** when the server restarts on Render.

### 3. GitHub

```bash
git init
git add .
git commit -m "Initial commit: Campus Memories"
```

Create a new repo on GitHub (empty, no README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/campus-memories.git
git branch -M main
git push -u origin main
```

### 4. Render

1. [render.com](https://render.com) → New → **Blueprint** (or Web Service)
2. Connect your GitHub repo
3. Use `render.yaml` or set:
   - **Build:** `npm install`
   - **Start:** `npm start`
4. Environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `JWT_SECRET` — long random string
   - `CLOUDINARY_*` — optional but recommended
5. Deploy → open your `*.onrender.com` URL

## Demo users

```bash
node scripts/seed-users.js
```

Default password: `password123`
