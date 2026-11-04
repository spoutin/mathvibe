# Design Document: MathVibe GitHub & Cloudflare Pages Deployment

**Date:** 2026-11-04  
**Author:** AI Agent & Dylan  
**Status:** In Review / Ready for Plan

---

## 1. Intent and Why
The Grade 9 math solver is fully functional locally. To share it with students and the world, it needs a reliable, fast, and continuous deployment pipeline. We have named the project **MathVibe**. 

By pushing the code to a GitHub repository and configuring it for Cloudflare Pages (part of the Cloudflare Workers ecosystem for frontend apps), every future commit to the `main` branch will automatically build and deploy the app to a live, globally distributed edge network.

---

## 2. Goals, Non-Goals, and Anti-Goals

### Goals
- **GitHub Initialization:** 
  - Create a new public GitHub repository named `mathvibe` using the `gh` CLI.
  - Push the existing local `main` branch with all git history to the new remote.
- **Cloudflare Pages Configuration:**
  - Create a `wrangler.toml` file at the project root to explicitly define the build configuration for Cloudflare Pages (framework: Vite/Svelte, build command: `npm run build`, output directory: `dist`).
  - Update `package.json` name to `mathvibe`.
  - Update HTML title tags to reflect the new "MathVibe" brand.

### Non-Goals
- Programmatic Cloudflare API token creation or automated domain purchasing (the user will complete the final OAuth connection click in the Cloudflare dashboard).
- Setting up a backend server or database (the app remains 100% pure client-side).

### Anti-Goals
- Pushing broken or un-built code to the remote.
- Overcomplicating the CI/CD pipeline with GitHub Actions when Cloudflare Pages has native, zero-config Git integration.

---

## 3. Architecture & Technical Design

### 3.1 App Rebranding
- `package.json`: `"name": "mathvibe"`
- `index.html`: `<title>MathVibe | Grade 9 Step-by-Step Solver</title>`
- `src/App.svelte`: `Grade 9 Math Quest` ➔ `MathVibe`

### 3.2 Cloudflare Pages Configuration (`wrangler.toml`)
Cloudflare Pages auto-detects Vite/Svelte projects, but adding a `wrangler.toml` provides explicit, version-controlled instructions for the build environment.

```toml
name = "mathvibe"
pages_build_output_dir = "dist"
compatibility_date = "2024-01-01"

[env.production]
# Production specific settings if needed
```

### 3.3 GitHub CLI Workflow
```bash
# Rename the local repo if needed, but primarily create the remote
gh repo create mathvibe --public --source=. --remote=origin --push
```

---

## 4. Decisions & Calls
- **Platform:** Cloudflare Pages (not Workers specifically) because this is a static Single Page Application (SPA) built with Vite, which is exactly what Pages is optimized for.
- **Access:** Public GitHub repository, allowing Cloudflare free tier access to connect and deploy seamlessly.
