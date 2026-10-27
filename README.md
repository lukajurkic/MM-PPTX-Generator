# PPTX Lyrics Presentation Web Maker

A web application deployed on **GitHub Pages** that allows users to select songs from a lyric repository and generate a formatted PowerPoint (`.pptx`) presentation ready for church, worship, karaoke, or event projection. Also provides a song request form that forwards new song requests to the maintainer via email.

---

## 📐 System Architecture & Design Specification

### 1. Song Storage & Slide Parsing
* **Location:** Dedicated `songs/` directory in the repository.
* **Format:** Plain text (`.txt`) files where the filename is the song title (e.g., `Amazing Grace.txt`).
* **Slide Splitting:** Stanzas are separated by empty/blank lines. Each stanza becomes an individual slide.
* **Song Manifest:** A pre-build indexing script (`scripts/index-songs.js`) automatically scans `songs/`, parses the stanzas, and generates `src/assets/songs/index.json` so the client-side app can instantly search and load songs.

### 2. PowerPoint (`.pptx`) Settings
* **Generation Engine:** In-browser client-side generator via `pptxgenjs` (no server needed, 100% static GitHub Pages compatible).
* **Aspect Ratio:** 16:9 Widescreen.
* **Background:** Solid Black (`#000000`).
* **Typography:** Verdana font, bold, **ALL CAPS**, White (`#FFFFFF`), with auto-fit sizing (36–44pt).
* **Alignment:** Centered both vertically and horizontally.
* **Flow:** Direct lyrics only (stanzas), with a clean black blank slide between distinct songs.
* **File Naming:** Date-based filename generated on download (e.g., `YYYY-MM-DD.pptx` based on the date the presentation is created).

### 3. User Interface (UI/UX)
* **Theme:** Sleek, modern slate/dark UI matching the presentation aesthetic.
* **Two-Panel Layout:**
  * **Left Panel:** Catalog of all available songs with instant search and filter, showing stanza counts and a quick-add button.
  * **Right Panel:** Selected playlist queue displaying song order, reorder buttons (Move Up / Move Down), remove button, and a prominent **"Generate & Download Presentation"** button.
* **Request Song Modal:** Accessible from the top navigation bar.

### 4. "Request New Song" Email Service
* **Mechanism:** Free static form service (Web3Forms / Formspree) requiring zero server backend.
* **Form Fields:**
  * Song Title *(required)*
  * Lyrics *(required, multiline)*
  * Submitter Name / Email *(optional)*
  * Notes / Comments *(optional)*
* **Config:** Configurable access key in app config, with clear inline instructions on how to set it to your email address.

### 5. GitHub Pages & CI/CD
* **Static SPA Configuration:** Configured for client-side single-page app deployment on GitHub Pages.
* **GitHub Actions Workflow:** `.github/workflows/deploy.yml` that runs on every push:
  1. Scans `songs/` and generates the song manifest.
  2. Builds the Angular production bundle with proper base href.
  3. Automatically deploys to GitHub Pages.
  *(Adding a new song in the future is as simple as dropping a `.txt` file into `songs/` and pushing to GitHub!)*

---

## 🚀 Development & Workflow

### Prerequisites
- Node.js (v18+)
- npm

### Local Development
```bash
# Install dependencies
npm install

# Run song indexing script and start development server
npm run prebuild
npm start
```
Navigate to `http://localhost:4200/`.

### Adding Songs Manually
1. Add a new `.txt` file into the `songs/` folder (e.g., `songs/How Great Thou Art.txt`).
2. Separate stanzas by empty lines.
3. Commit and push to GitHub — GitHub Actions will automatically index the song, re-build, and deploy the updated app to GitHub Pages.
