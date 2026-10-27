# PPTX Maker - Project Rules & Working Guidelines

This document outlines the mandatory rules and development conventions for contributors, developers, and AI assistants working on this repository.

---

## 1. Branching Strategy & Git Flow

1. **Protected Branch:** `main` (and `master`) are production deployment branches. Never commit directly to `main`.
2. **Feature Branches:** Create a feature branch for each issue or milestone:
   ```bash
   git checkout -b feat-<issue_number>
   # Example: git checkout -b feat-6
   ```
3. **Merge via Pull Request:** All code merges into `main` must happen through GitHub Pull Requests.
4. **Automated PR Gate:** Every PR triggers `.github/workflows/pr-check.yml`. Merge is allowed only if:
   - TypeScript type checking passes (`npx tsc --noEmit`).
   - All unit tests pass 100% (`npm test`).
   - Production build compiles successfully (`npm run build`).

---

## 2. Commit Message Conventions (Mandatory)

Commit messages must strictly follow the format:

```text
feat #<issue_number> :: <concise description in lowercase>
fix #<issue_number> :: <concise description in lowercase>
```

### ✅ Examples of Valid Commits:
- `feat #6 :: add leading and trailing blank slides and adjust side text and logo styling`
- `feat #6 :: add song lyrics modal on click from catalog and playlist panels`
- `feat #6 :: add automatic versioning and release on main and pull request validation pipeline`
- `fix #6 :: prevent memory leak in request song modal timer`

### ❌ Prohibited:
- `git commit -m "update"` (missing issue tag and prefix)
- `git commit -m "feat(modal): lyrics"` (wrong delimiter, missing issue reference)

---

## 3. Remote Push Safety Rule

> ⚠️ **CRITICAL:** Never execute `git push` unless explicitly asked and approved by the user. Always keep commits on the local feature branch until user approval to push is given.

---

## 4. Single Source of Truth for Songs

1. **Only One Directory for Song Files:**
   - Raw song files belong exclusively in the top-level **`songs/`** directory.
   - File extension must be `.json` (e.g. `songs/Amazing Grace.json`).
2. **No Duplicates in `src/assets/songs/`:**
   - Do **NOT** manually copy or commit individual song files into `src/assets/songs/`.
   - `src/assets/songs/index.json` is a build artifact generated automatically by `scripts/index-songs.js`.
3. **Song JSON Schema:**
   Every song must adhere to:
   ```json
   {
     "title": "Song Title",
     "categories": ["Slavljenje", "Zahvala"],
     "massSections": ["Ulazna"],
     "stanzas": [
       "Line 1\nLine 2\nLine 3",
       "Chorus Line 1\nChorus Line 2"
     ]
   }
   ```
   - Each item in `stanzas` corresponds to exactly **one PowerPoint slide**.

---

## 5. Dual-Language & Localization Rules

1. **Primary Language:** Croatian (`hr`) is the default and primary application language.
2. **Secondary Language:** English (`en`) is fully supported with real-time toggle.
3. **Adding New Strings:**
   - When introducing any new text, label, tooltip, placeholder, or error message:
     1. Add the key and type signature to `interface Translations` in [`src/app/services/translation.service.ts`](file:///home/ljurkic/Downloads/pptx%20maker%20v3/pptx_web_maker/src/app/services/translation.service.ts).
     2. Add the Croatian translation to `TRANSLATIONS_HR`.
     3. Add the English translation to `TRANSLATIONS_EN`.
   - Never hardcode raw strings in component templates without using `t().<key>`.
4. **Song Content:** Song lyrics remain in their original written language.

---

## 6. Coding Standards & Architectural Patterns

1. **Angular 17 Standalone:**
   - All components must be `standalone: true`.
   - Do not create or use Angular `NgModule`s.
   - Use `inject(...)` instead of constructor parameter injection.
2. **Signals for Reactivity:**
   - Use `signal(...)` for mutable state and `computed(...)` for derived values.
   - Avoid manual RxJS subscriptions in components unless handling asynchronous streams (e.g. `HttpClient`).
3. **Accessibility (a11y):**
   - Modals must include `role="dialog"`, `aria-modal="true"`, an `aria-labelledby` reference, and close on `Escape`.
   - Interactive elements must be focusable via `tabindex="0"` with keyboard handlers (`keydown.enter`, `keydown.space`).
   - Meaningful `aria-label` and `title` attributes on icon-only buttons.
4. **Component Styling:**
   - Prefer component-scoped CSS via the `styles: [...]` property.
   - Use CSS variables defined in [`src/styles.css`](file:///home/ljurkic/Downloads/pptx%20maker%20v3/pptx_web_maker/src/styles.css) (e.g., `var(--bg-surface)`, `var(--accent-primary)`, `var(--radius-md)`).

---

## 7. Pre-Merge Verification Checklist

Before opening a PR or merging any feature branch, verify that all three commands pass cleanly:

```bash
# 1. Verify TypeScript types
npx tsc --noEmit

# 2. Run all unit tests
npm test

# 3. Test indexing and production build
npm run build
```

---

## 8. Automatic Versioning & Deployment

- When code is merged into `main` via PR:
  1. GitHub Actions runs `.github/workflows/deploy.yml`.
  2. Resolves the next SemVer version tag (`vX.Y.Z`):
     - **Default:** increments `patch` (`v1.0.0` $\rightarrow$ `v1.0.1`).
     - **Minor bump:** include `#minor` in the PR title **or description** (`v1.0.1` $\rightarrow$ `v1.1.0`).
     - **Major bump:** include `#major` in the PR title **or description** (`v1.0.1` $\rightarrow$ `v2.0.0`).
  3. Injects the resolved version into the application build (`src/environments/version.ts`) so the active version is displayed in the header badge (`.version-badge`) and footer (`.app-footer`).
  4. Deploys the static bundle to **GitHub Pages**.
  5. Automatically creates the git tag and publishes a **GitHub Release** with generated release notes.
