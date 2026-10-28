const fs = require('fs');
const path = require('path');

// Ensure version.ts is generated before indexing or building
try {
  require('./generate-version');
} catch (e) {
  // If generate-version fails or is already run, continue
}

const songsDir = path.join(__dirname, '..', 'songs');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'songs');
const outputFile = path.join(outputDir, 'index.json');
const metadataOptionsFile = path.join(outputDir, 'metadata-options.json');
const categoriesFile = path.join(outputDir, 'categories.json');
const massSectionsFile = path.join(outputDir, 'mass-sections.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
} else {
  // Clean up any stale individual song files from assets/songs
  const allowedFiles = new Set(['index.json', 'metadata-options.json', 'categories.json', 'mass-sections.json']);
  const existingAssetFiles = fs.readdirSync(outputDir);
  for (const assetFile of existingAssetFiles) {
    if (!allowedFiles.has(assetFile)) {
      const fullPath = path.join(outputDir, assetFile);
      if (fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
      }
    }
  }
}

if (!fs.existsSync(songsDir)) {
  console.warn(`[index-songs] Warning: '${songsDir}' directory not found. Creating empty directory.`);
  fs.mkdirSync(songsDir, { recursive: true });
}

// Read all .json and .txt files
const allFiles = fs.readdirSync(songsDir);
const jsonFiles = allFiles.filter(file => file.endsWith('.json'));
const txtFiles = allFiles.filter(file => file.endsWith('.txt'));

const songs = [];
let totalSlides = 0;
const uniqueCategories = new Set();
const uniqueMassSections = new Set();

// Seed from existing metadata-options.json so unassigned preset options are preserved
if (fs.existsSync(metadataOptionsFile)) {
  try {
    const existingMeta = JSON.parse(fs.readFileSync(metadataOptionsFile, 'utf-8'));
    if (Array.isArray(existingMeta.categories)) {
      existingMeta.categories.forEach(c => c && uniqueCategories.add(String(c).trim()));
    }
    if (Array.isArray(existingMeta.massSections)) {
      existingMeta.massSections.forEach(m => m && uniqueMassSections.add(String(m).trim()));
    }
  } catch (e) {
    // ignore parse error on seeding
  }
}

// Process JSON song files (primary format)
for (const file of jsonFiles) {
  const filePath = path.join(songsDir, file);
  try {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(rawContent);

    const title = (data.title || path.basename(file, '.json')).trim();

    let stanzas = [];
    if (Array.isArray(data.stanzas)) {
      stanzas = data.stanzas
        .map(s => (typeof s === 'string' ? s.trim() : ''))
        .filter(s => s.length > 0);
    } else if (typeof data.lyrics === 'string') {
      stanzas = data.lyrics
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .split(/\n\s*\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }

    if (stanzas.length === 0) {
      console.warn(`[index-songs] Warning: No stanzas found in '${file}'. Skipping.`);
      continue;
    }

    const categories = Array.isArray(data.categories)
      ? data.categories.map(c => String(c).trim()).filter(Boolean)
      : (data.category ? [String(data.category).trim()] : []);

    const massSections = Array.isArray(data.massSections)
      ? data.massSections.map(m => String(m).trim()).filter(Boolean)
      : (Array.isArray(data.massSection)
          ? data.massSection.map(m => String(m).trim()).filter(Boolean)
          : (data.massSection ? [String(data.massSection).trim()] : []));

    categories.forEach(c => uniqueCategories.add(c));
    massSections.forEach(m => uniqueMassSections.add(m));

    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || `song-${songs.length + 1}`;

    const firstStanzaLines = stanzas[0].split('\n').map(l => l.trim()).filter(Boolean);
    const preview = firstStanzaLines.slice(0, 2).join(' / ');

    totalSlides += stanzas.length;

    songs.push({
      id: slug,
      title,
      slug,
      fileName: file,
      stanzaCount: stanzas.length,
      preview,
      categories,
      massSections,
      stanzas
    });
  } catch (err) {
    console.error(`[index-songs] Error parsing '${file}':`, err.message);
  }
}

// Fallback process for any legacy TXT files
for (const file of txtFiles) {
  const filePath = path.join(songsDir, file);
  const title = path.basename(file, '.txt').trim();
  const rawContent = fs.readFileSync(filePath, 'utf-8');

  const normalized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const stanzas = normalized
    .split(/\n\s*\n/)
    .map(stanza => stanza.trim())
    .filter(stanza => stanza.length > 0);

  if (stanzas.length === 0) continue;

  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `song-${songs.length + 1}`;

  const firstStanzaLines = stanzas[0].split('\n').map(l => l.trim()).filter(Boolean);
  const preview = firstStanzaLines.slice(0, 2).join(' / ');

  totalSlides += stanzas.length;

  songs.push({
    id: slug,
    title,
    slug,
    fileName: file,
    stanzaCount: stanzas.length,
    preview,
    categories: [],
    massSections: [],
    stanzas
  });
}

// Sort alphabetically by song title
songs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

// Write output JSON
fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');

// Sort alphabetically with Croatian locale sensitivity
const sortedCategories = Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b, 'hr'));
const sortedMassSections = Array.from(uniqueMassSections).sort((a, b) => a.localeCompare(b, 'hr'));

// Also write metadata options summary for easy consumption in static JSON files
const metadataSummary = {
  categories: sortedCategories,
  massSections: sortedMassSections
};
fs.writeFileSync(metadataOptionsFile, JSON.stringify(metadataSummary, null, 2) + '\n', 'utf-8');
fs.writeFileSync(categoriesFile, JSON.stringify(sortedCategories, null, 2) + '\n', 'utf-8');
fs.writeFileSync(massSectionsFile, JSON.stringify(sortedMassSections, null, 2) + '\n', 'utf-8');

console.log(`[index-songs] Successfully indexed ${songs.length} song(s) (${totalSlides} total slides) into ${path.relative(process.cwd(), outputFile)}`);
