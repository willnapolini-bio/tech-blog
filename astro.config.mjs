// ---------------------------------------------------------------------------
// Astro Configuration — Production-Ready Tech Blog
// ---------------------------------------------------------------------------
// REPLACE 'https://your-username.github.io' with your actual GitHub Pages URL.
// For project pages use: https://your-username.github.io/repo-name
// For user/org pages use: https://your-username.github.io

import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// Detect if this is a project page (sub-path) deployment
// Set REPO_NAME env var in GitHub Actions or hardcode it here.
const REPO_NAME = process.env.REPO_NAME || "";
const siteUrl = REPO_NAME
  ? `https://willnapolini-bio.github.io/${REPO_NAME}`
  : "https://willnapolini-bio.github.io";

export default defineConfig({
  // ── Site URL ─────────────────────────────────────────────────────────────
  // Used for sitemap generation, canonical URLs, and OG meta tags.
  site: siteUrl,

  // ── Output ───────────────────────────────────────────────────────────────
  // 'static' = pre-rendered HTML at build time (required for GitHub Pages).
  output: "static",

  // ── Build ────────────────────────────────────────────────────────────────
  build: {
    // 'directory' format produces clean URLs: /blog/post-slug/ instead of /blog/post-slug.html
    format: "directory",
  },

  // ── Integrations ─────────────────────────────────────────────────────────
  integrations: [
    tailwind(),
    sitemap({
      // Generates /sitemap-index.xml and per-section sitemaps
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      filter: (page) => {
        // Exclude draft pages or non-content paths from sitemap
        return !page.includes("/drafts/");
      },
    }),
  ],

  // ── Base path for project-page deployments ───────────────────────────────
  // When deploying to username.github.io/repo-name, Astro needs to know
  // the base path so all asset URLs are prefixed correctly.
  // This is auto-set via REPO_NAME env var in GitHub Actions.
  base: REPO_NAME ? `/${REPO_NAME}` : "/",

  // ── Vite ─────────────────────────────────────────────────────────────────
  vite: {
    build: {
      // Optimize CSS for Core Web Vitals — reduce render-blocking resources
      cssMinify: true,
    },
  },

  // ── Markdown ─────────────────────────────────────────────────────────────
  markdown: {
    // Enable shiki syntax highlighting with accessible defaults
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});
