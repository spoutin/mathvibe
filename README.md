# ⚡ MathVibe

An interactive, gamified High School Grade 9 Math Step-by-Step Solver and Practice App built with **Svelte 5** and **Vite**.

![MathVibe](https://img.shields.io/badge/MathVibe-Grade%209%20Math-indigo?style=for-the-badge)
![Svelte 5](https://img.shields.io/badge/Svelte-5-FF3E00?style=for-the-badge&logo=svelte)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages-F38020?style=for-the-badge&logo=cloudflare)

---

## ✨ Features

- **Interactive Practice Mode:** Students can type their next algebraic step and have it validated in real time against curriculum expectations.
- **Skipped-Step Intelligence:** Recognizes when students perform mental math and jump ahead to valid future steps, displaying an informative notice highlighting what was bypassed.
- **Multiple Legitimate Solving Paths:** Accepts alternative strategies (e.g., *Substitution First* vs *Algebra First*, or *Distribute First* vs *Divide First*) and dynamically adapts the step sequence.
- **Friendly Pedagogical Tutor Voice:** Step explanations and on-demand hints are written in approachable high school language (*"Rainbow rule!"*, *"Fraction buster!"*, *"Balance scale!"*).
- **Full Scientific Calculator Modal:** Ad-hoc scratchpad calculator supporting trigonometry (with DEG/RAD mode), logarithms, powers, roots, factorials, constants ($\pi$, $e$), and direct *"Insert into Step ↵"* action.
- **Multi-Variable & Polynomial Factoring:** Handles GCF factoring (e.g., $6x^2y - 4xy^3 = 2xy(3x - 2y^2)$), FOIL expansion ($(x + 3)(x + 5)$), and simple trinomial factoring ($x^2 + 5x + 6$).
- **Variable Value Assignment:** Automatically detects variable letters and provides inputs to evaluate expressions step-by-step.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Test Suite
```bash
npm test
```

### 4. Build for Production
```bash
npm run build
```

---

## ☁️ Cloudflare Pages Deployment

This project includes a `wrangler.toml` configured for Cloudflare Pages:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Svelte / Vite
