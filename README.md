# Hae Eun Lee — Portfolio

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Motion for React · GSAP + ScrollTrigger · React Three Fiber + Drei · Lucide · Lenis

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export -> ./out
npx serve out      # preview the production build
```

## Deploy free on GitHub Pages

1. Push this repo to GitHub (branch `main`).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. `.github/workflows/deploy.yml` builds and publishes on every push. It sets `BASE_PATH` to `/<repo>` automatically (empty for `<user>.github.io` repos).

## Editing content

All copy lives in `lib/content.ts`. Project links are `undefined` on purpose (shown as "Link coming soon");
add `href` to a link there once real URLs exist. Replace the SVG placeholder in `components/ProjectVisual.tsx`
with real screenshots when available.

## Structure

```
app/            layout, global styles, page
components/     Nav, Hero, HeroScene (R3F), About, Experience, Projects, Skills, Contact + primitives (Reveal, Magnetic, Button)
lib/content.ts  single source of truth for résumé content
```
