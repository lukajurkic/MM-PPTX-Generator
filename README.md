# PPTX Lyrics Presentation Web Maker (PPTX Izrađivač Pjesama)

[![Build & Deploy](https://github.com/ljurkic1/MM-PPTX-Generator/actions/workflows/deploy.yml/badge.svg)](https://github.com/ljurkic1/MM-PPTX-Generator/actions/workflows/deploy.yml)
[![PR Validation](https://github.com/ljurkic1/MM-PPTX-Generator/actions/workflows/pr-check.yml/badge.svg)](https://github.com/ljurkic1/MM-PPTX-Generator/actions/workflows/pr-check.yml)
[![Angular 17](https://img.shields.io/badge/Angular-17.3-DD0031.svg?logo=angular)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, responsive web application for choral groups, worship teams, church communities, and event organizers. Allows users to browse a repository of songs with category and liturgical mass-section filtering, preview lyrics, order a playlist, and generate ready-to-project **PowerPoint (`.pptx`) presentations directly in the browser**.

🌐 **Live Demo:** [https://ljurkic1.github.io/MM-PPTX-Generator/](https://ljurkic1.github.io/MM-PPTX-Generator/)

---

## ✨ Key Features

- **🎨 Professional Presentation Styling (`pptxgenjs`):**
  - **16:9 Widescreen Layout** with solid black background (`#000000`).
  - **Typography:** Bold centered white lyrics in **Verdana** font with auto-fit sizing (32–44pt).
  - **SKAC Logo Watermark:** Semi-transparent white logo positioned in the bottom-right corner of each lyric slide.
  - **Rotated Side Title:** Song title subtly displayed on the right edge, rotated 270° counter-clockwise and vertically centered.
  - **Seamless Transitions:** Solid black blank slide before the first song, between distinct songs, and after the last song.
  - **Date-based Export:** Automatically names downloaded presentations as `YYYY-MM-DD.pptx`.

- **🔍 Two-Panel Interactive Workspace:**
  - **Left Panel (Song Catalog):** Real-time text search (by title or lyrics), live song counters, and multi-filter dropdown chips for **Categories** (e.g. *Slavljenje*, *Zahvala*, *Klanjanje*) and **Mass Sections** (*Ulazna*, *Pričesna*, *Završna*, etc.).
  - **Right Panel (Presentation Queue):** Reorder songs via Move Up / Move Down buttons, remove items, clear playlist, and view live slide metrics (lyric slides vs. total estimated slides).

- **⚙️ Presentation Preferences / Settings Drawer:**
  - Accessible via the **Settings (Postavke)** button in the header.
  - **Aspect Ratio:** Toggle between **16:9 Widescreen** (default) and **4:3 Standard** (for older church projectors).
  - **Slide Transitions:** Independent checkboxes for blank slides between songs and intro/outro blank slides.
  - **Typography & Fonts:** Choose from standard cross-platform fonts (*Verdana*, *Arial*, *Calibri*, *Trebuchet MS*, *Tahoma*, *Georgia*, *Times New Roman*), toggle smart auto-fit (32–44pt) or set a fixed font size slider (32–48pt).
  - **Colors:** Native color pickers and preset chips for slide background and text colors.
  - **Side Title Options:** Toggle on/off, font family, font size (8–18pt), and horizontal offset from right edge in centimeters (0.0–3.0 cm).
  - **SKAC Logo Watermark:** Toggle on/off, size scaling slider (50%–180%), and transparency slider (0%–90%).
  - **Live Preview:** Interactive mini slide preview stage demonstrating layout, colors, typography, side title, and logo in real-time.
  - **Persistent Storage & Repository Defaults:** All choices persist across sessions via `localStorage` with a 1-click **"Reset to Defaults"** action backed by repository defaults in `presentation-settings.constant.ts`.

- **📜 Full Song Lyrics Preview Modal:**
  - Click on any song card in the catalog or in the playlist queue to open an accessible modal dialog.
  - View all stanzas neatly numbered (*Strofa 1*, *Strofa 2*, ...).
  - One-click **"Copy Lyrics"** to clipboard with visual feedback.
  - Quick **"Add to presentation"** button directly from the modal.

- **🌐 Dual-Language Support (HR / EN):**
  - Primary default language: **Croatian (Hrvatski)**.
  - Secondary language: **English**.
  - Persistent language preference saved in `localStorage`.

- **✉️ Song Request System:**
  - Accessible modal dialog allowing users to submit new songs with validation for title and lyrics, optional submitter info, and notes.
  - Email notification forwarded directly to the maintainer via static form endpoint.

- **🚀 100% Client-Side & Zero-Server:**
  - Runs entirely in the browser; works on GitHub Pages without any backend server.

---

## 🛠️ Tech Stack

- **Framework:** Angular 17.3 (Standalone Components, Signals, `inject()`)
- **Presentation Engine:** `pptxgenjs` v4.0.1
- **Icons & Styling:** Native SVG icons, responsive CSS variables, modern dark aesthetic
- **Testing:** Karma + Jasmine with headless Chrome/Firefox test runners (77 unit tests)
- **CI/CD:** GitHub Actions (Automated PR validation, GitHub Pages deployment, SemVer auto-tagging & Releases)

---

## 🚀 Quick Start & Development

### Prerequisites
- [Node.js](https://nodejs.org/) v20+
- npm v10+

### Installation & Local Run
```bash
# 1. Clone the repository
git clone https://github.com/ljurkic1/MM-PPTX-Generator.git
cd pptx_web_maker

# 2. Install dependencies
npm ci

# 3. Start local development server (automatically runs prebuild indexing)
npm start
```
Open [http://localhost:4200/](http://localhost:4200/) in your browser.

---

## 🧪 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Runs prebuild indexing and launches local dev server at `http://localhost:4200` |
| `npm run build` | Compiles production bundle to `dist/my-ui-app` with GitHub Pages base href |
| `npm run prebuild` | Executes `scripts/index-songs.js` to compile `songs/*.json` into `index.json` |
| `npm test` | Runs all 57 unit tests in single-run headless mode |
| `npm run test:watch` | Runs unit tests in watch mode for development |

---

## 📂 Song Library Management

Songs are stored as individual `.json` files in the top-level **`songs/`** directory (the single source of truth):

```text
songs/
├── 10,000 Reasons.json
├── Amazing Grace.json
├── How Great Thou Art.json
└── Way Maker.json
```

### Adding a New Song
Create a `.json` file in `songs/` (e.g. `songs/Divan Si.json`):

```json
{
  "title": "Divan Si",
  "categories": ["Slavljenje", "Zahvala"],
  "massSections": ["Ulazna"],
  "stanzas": [
    "Divan si, Gospodine moj,\nNeka zemlja pjeva Tebi u glas.",
    "Tvoja ljubav obnavlja sve,\nKralj si nad svim kraljevima."
  ]
}
```

Running `npm run prebuild` (or `npm start` / `npm run build`) automatically compiles this into `src/assets/songs/index.json`.

---

## 📖 Additional Documentation

For detailed guides, please refer to:
- 📘 **[PROJECT_GUIDE.md](file:///home/ljurkic/Downloads/pptx%20maker%20v3/pptx_web_maker/PROJECT_GUIDE.md)**: Architecture deep-dive, file map, data flow diagram, and AI assistant onboarding.
- 📋 **[CONTRIBUTING.md](file:///home/ljurkic/Downloads/pptx%20maker%20v3/pptx_web_maker/CONTRIBUTING.md)**: Working rules, commit message format (`feat #<issue> :: <action>`), testing checklist, and PR guidelines.

---

## 📄 License

This project is licensed under the [MIT License](file:///home/ljurkic/Downloads/pptx%20maker%20v3/pptx_web_maker/LICENSE).
