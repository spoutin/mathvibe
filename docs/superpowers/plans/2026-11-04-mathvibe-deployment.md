# MathVibe Cloudflare Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the application to "MathVibe", create a public GitHub repository named `mathvibe`, push the code, and add a Cloudflare Pages `wrangler.toml` build configuration.

**Architecture:** Pure project configuration updates. The `wrangler.toml` file explicitly defines the build environment for Cloudflare Pages (Vite framework building to `dist/`). The `gh` CLI pushes local history to the new GitHub remote.

**Tech Stack:** `wrangler`, GitHub CLI (`gh`), Vite, Svelte.

**Spec:** `docs/superpowers/specs/2026-11-04-mathvibe-deployment-design.md`

## Global Constraints

- Rebrand project name to `mathvibe`.
- Pure frontend app, no backend configuration required.
- Do not automate domain purchasing or Cloudflare API tokens (hand off to human for the final UI connection).

## Review Focus

1. **Build Configuration Match:** The `wrangler.toml` must match Vite's default output directory (`dist`) and build command. (Tested in Task 1).

---

### Task 1: Rebrand to MathVibe & Cloudflare Pages Configuration

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Modify: `src/App.svelte`
- Create: `wrangler.toml`

**Interfaces:**
- Produces: Updated application strings and valid `wrangler.toml`.

- [ ] **Step 1: Update Application Names**
In `package.json`, set `"name": "mathvibe"`.
In `index.html`, set `<title>MathVibe | Grade 9 Step-by-Step Solver</title>`.
In `src/App.svelte`, change the header title from "Grade 9 Math Quest" to "MathVibe".

- [ ] **Step 2: Create `wrangler.toml`**
Create `wrangler.toml` with settings for Cloudflare Pages (name: `mathvibe`, output dir: `dist`).

- [ ] **Step 3: Verification**
Run: `npm run build`
Expected: Build passes with no errors, creating `dist` folder.

- [ ] **Step 4: Commit**
```bash
git add package.json index.html src/App.svelte wrangler.toml
git commit -m "chore: rebrand to MathVibe and add Cloudflare Pages configuration"
```

---

### Task 2: Create GitHub Repository and Push Code

**Files:**
- No file changes, entirely CLI driven.

**Interfaces:**
- Connects local `main` branch to new `origin` remote.

- [ ] **Step 1: Create repository via GitHub CLI**
Run: `gh repo create mathvibe --public --source=. --remote=origin`
Expected: Repository created and local remote configured.

- [ ] **Step 2: Push local branch to remote**
Run: `git push -u origin HEAD`
Expected: Code successfully pushed to GitHub.
