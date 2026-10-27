const fs = require('fs');
const path = require('path');

const songsDir = path.join(__dirname, '..', 'songs');
const outputDir = path.join(__dirname, '..', 'src', 'assets', 'songs');
const outputFile = path.join(outputDir, 'index.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

if (!fs.existsSync(songsDir)) {
  console.warn(`[index-songs] Warning: '${songsDir}' directory not found. Creating empty directory.`);
  fs.mkdirSync(songsDir, { recursive: true });
}

// Read all .txt files
const files = fs.readdirSync(songsDir).filter(file => file.endsWith('.txt'));

const songs = [];
let totalSlides = 0;

for (const file of files) {
  const filePath = path.join(songsDir, file);
  const title = path.basename(file, '.txt').trim();
  const rawContent = fs.readFileSync(filePath, 'utf-8');

  // Normalize Windows/Unix line breaks to \n
  const normalized = rawContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into stanzas by double newlines (\n\s*\n)
  const stanzas = normalized
    .split(/\n\s*\n/)
    .map(stanza => stanza.trim())
    .filter(stanza => stanza.length > 0);

  if (stanzas.length === 0) {
    console.warn(`[index-songs] Skipping empty song file: ${file}`);
    continue;
  }

  // Generate URL-friendly slug
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || `song-${songs.length + 1}`;

  // First 1-2 lines of the first stanza for UI preview
  const firstStanzaLines = stanzas[0].split('\n').map(l => l.trim()).filter(Boolean);
  const preview = firstStanzaLines.slice(0, 2).join(' / ');

  // Copy raw file into assets folder for direct serving if needed
  const targetAssetFile = path.join(outputDir, file);
  fs.copyFileSync(filePath, targetAssetFile);

  totalSlides += stanzas.length;

  songs.push({
    id: slug,
    title,
    slug,
    fileName: file,
    stanzaCount: stanzas.length,
    preview,
    stanzas
  });
}

// Sort alphabetically by song title
songs.sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }));

// Write output JSON
fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');

console.log(`[index-songs] Successfully indexed ${songs.length} song(s) (${totalSlides} total slides) into ${path.relative(process.cwd(), outputFile)}`);

