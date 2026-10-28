const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Loads known categories and mass sections from static JSON metadata file.
 * Falls back to default options if static file is not present.
 */
function loadKnownMetadata(rootDir = path.join(__dirname, '..')) {
  const metaPath = path.join(rootDir, 'src', 'assets', 'songs', 'metadata-options.json');
  if (fs.existsSync(metaPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      return {
        categories: Array.isArray(data.categories) ? data.categories : [],
        massSections: Array.isArray(data.massSections) ? data.massSections : []
      };
    } catch (e) {
      // fallback on read error
    }
  }

  return {
    categories: [
      'Božićne',
      'Došašće',
      'Duhu Svetom',
      'Fides',
      'Korizmene',
      'Marijanske',
      'Marijina misa',
      'Meditativne',
      'Međugorska misa',
      'Misa fra Ivan Matić',
      'Misa sv. Andrije',
      'Mladi',
      'Opće',
      'Prigodne',
      'Slavljenje',
      'Uskrsne',
      'Zahvala'
    ],
    massSections: [
      'Aleluja',
      'Gospodine smiluj se',
      'Jaganjče Božji',
      'Klanjanje',
      'Otpjevni psalam',
      'Pričesna',
      'Prinosna',
      'Slava',
      'Svet',
      'Ulazna',
      'Zahvalna',
      'Završna'
    ]
  };
}

/**
 * Extracts a section value from an issue markdown body by trying multiple possible header patterns.
 */
function extractSection(body, possibleHeaders) {
  if (!body) return '';

  for (const header of possibleHeaders) {
    // Matches:
    // ### Header Name
    // Content...
    // (up to next heading or end of file)
    const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`#{1,4}\\s+${escaped}[^\\n]*\\n+([\\s\\S]*?)(?=\\n#{1,4}\\s+|$)`, 'i');
    const match = body.match(regex);
    if (match && match[1]) {
      const val = match[1].trim();
      if (!isIgnoredValue(val)) {
        return val;
      }
    }

    // Matches bold prefix: **Header Name:** Content
    const boldRegex = new RegExp(`\\*\\*${escaped}[:?\\s]*\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*|\\n#{1,4}\\s+|$)`, 'i');
    const boldMatch = body.match(boldRegex);
    if (boldMatch && boldMatch[1]) {
      const val = boldMatch[1].trim();
      if (!isIgnoredValue(val)) {
        return val;
      }
    }
  }

  return '';
}

/**
 * Checks whether the text represents an empty form response
 */
function isIgnoredValue(text) {
  if (!text) return true;
  const lower = text.trim().toLowerCase();
  return (
    lower === '_no response_' ||
    lower === 'no response' ||
    lower === 'none' ||
    lower === 'n/a' ||
    lower === 'na' ||
    lower === 'nema' ||
    lower === '-' ||
    lower === 'null' ||
    lower === 'undefined'
  );
}

/**
 * Parses comma/newline separated tag values into a clean array
 */
function parseTags(rawString) {
  if (!rawString || isIgnoredValue(rawString)) return [];
  return rawString
    .split(/[,;\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !isIgnoredValue(s));
}

/**
 * Sanitizes a title for use as a filesystem file name
 */
function sanitizeFileName(title) {
  return title
    .replace(/[<>:"/\\|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Generates a clean URL slug from title
 */
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'song';
}

/**
 * Main parser function that transforms issue data into song JSON metadata
 */
function parseSongRequest(issue, options = {}) {
  const issueTitle = (issue.title || '').trim();
  const issueBody = issue.body || '';

  // 1. Extract Title
  let title = extractSection(issueBody, [
    'Naziv pjesme (Song Title)',
    'Naziv pjesme',
    'Song Title',
    'Title',
    'Naslov pjesme',
    'Naslov'
  ]);

  if (!title) {
    // Fall back to issue title, stripping standard prefixes like "[Pjesma]:" or "[Song Request]:"
    title = issueTitle.replace(/^\[(pjesma|song\s*request|song)\]\s*:?\s*/i, '').trim();
  }

  if (!title) {
    throw new Error('Song title could not be determined from the issue.');
  }

  // 2. Extract Lyrics
  let lyrics = extractSection(issueBody, [
    'Tekst pjesme / Stihovi (Lyrics)',
    'Tekst pjesme (Lyrics)',
    'Tekst pjesme / Stihovi',
    'Tekst pjesme',
    'Stihovi',
    'Lyrics',
    'Tekst'
  ]);

  if (!lyrics) {
    // If no explicit section was matched, check if body itself is lyrics
    lyrics = issueBody.trim();
  }

  // Split into stanzas by double newline
  const stanzas = lyrics
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (stanzas.length === 0) {
    throw new Error('No song lyrics or stanzas found in the request.');
  }

  // 3. Extract Mass Sections
  const rawMassSections = extractSection(issueBody, [
    'Dio mise (Mass Section)',
    'Dio mise',
    'Mass Section',
    'Mass Sections'
  ]);
  const rawCustomMassSections = extractSection(issueBody, [
    'Drugi dio mise (Other / Custom Mass Section)',
    'Drugi dio mise',
    'Other / Custom Mass Section',
    'Custom Mass Section'
  ]);
  const massSections = Array.from(
    new Set([...parseTags(rawMassSections), ...parseTags(rawCustomMassSections)])
  );

  // 4. Extract Categories
  const rawCategories = extractSection(issueBody, [
    'Kategorije pjesme (Categories)',
    'Kategorije pjesme',
    'Categories',
    'Kategorije',
    'Kategorija'
  ]);
  const rawCustomCategories = extractSection(issueBody, [
    'Druge kategorije (Other / Custom Categories)',
    'Druge kategorije',
    'Other / Custom Categories',
    'Custom Categories'
  ]);
  const categories = Array.from(
    new Set([...parseTags(rawCategories), ...parseTags(rawCustomCategories)])
  );

  // 5. Notes / Submitter
  const notes = extractSection(issueBody, [
    'Dodatne napomene (Notes / Submitter)',
    'Dodatne napomene',
    'Notes / Submitter',
    'Notes',
    'Napomene'
  ]);

  // Check for unknown/new categories and mass sections against static metadata
  const known = options.knownMetadata || loadKnownMetadata(options.rootDir);
  const newMassSections = massSections.filter(m => !known.massSections.includes(m));
  const newCategories = categories.filter(c => !known.categories.includes(c));

  return {
    title,
    stanzas,
    stanzaCount: stanzas.length,
    massSections,
    categories,
    notes,
    newMassSections,
    newCategories,
    hasNewMetadata: newMassSections.length > 0 || newCategories.length > 0
  };
}

/**
 * Builds the Pull Request body markdown
 */
function buildPullRequestBody(parsed, issue) {
  const issueNumber = issue.number;
  const userLogin = issue.user ? issue.user.login : 'user';
  const preview = parsed.stanzas.slice(0, 2).map((s, idx) => `> **Slajd ${idx + 1}:**\n> ${s.replace(/\n/g, '\n> ')}`).join('\n>\n');

  let body = `## 🎵 Novi prijedlog pjesme: "${parsed.title}"

Automatski generiran Pull Request na temelju zahtjeva za pjesmu u issue-u #${issueNumber}.

Closes #${issueNumber}

### 📋 Detalji pjesme
| Svojstvo | Vrijednost |
| :--- | :--- |
| **Naziv pjesme** | **${parsed.title}** |
| **Broj slajdova / strofa** | **${parsed.stanzaCount}** |
| **Dijelovi mise** | ${parsed.massSections.length > 0 ? parsed.massSections.join(', ') : '*(Nije navedeno)*'} |
| **Kategorije** | ${parsed.categories.length > 0 ? parsed.categories.join(', ') : '*(Nije navedeno)*'} |
| **Predložio/la** | @${userLogin}${parsed.notes ? ` (${parsed.notes})` : ''} |
`;

  if (parsed.hasNewMetadata) {
    body += `
### ✨ Automatski dodane nove kategorije i dijelovi mise
Zahtjev za pjesmu sadrži nove oznake koje su automatski dodane u biblioteku:
`;
    if (parsed.newCategories.length > 0) {
      body += `- **Nove kategorije:** \`${parsed.newCategories.join('`, `')}\`\n`;
    }
    if (parsed.newMassSections.length > 0) {
      body += `- **Novi dijelovi mise:** \`${parsed.newMassSections.join('`, `')}\`\n`;
    }
    body += `
> *Automatski su ažurirane datoteke \`src/assets/songs/metadata-options.json\`, \`categories.json\` i \`mass-sections.json\`.*\n`;
  }

  body += `
### 👁️ Pregled početnih stihova
${preview}

---
📱 *Ovaj Pull Request možete pregledati i odobriti jednim dodirom u mobilnoj aplikaciji GitHub.*
`;

  return body;
}

/**
 * Process a song request payload from file or environment
 */
function processSongRequest(options = {}) {
  const rootDir = options.rootDir || path.join(__dirname, '..');
  const songsDir = path.join(rootDir, 'songs');

  let issue = options.issue;

  if (!issue) {
    let payloadPath = process.argv[2] || process.env.GITHUB_EVENT_PATH;
    if (!payloadPath) {
      throw new Error('No GitHub event payload provided (specify as argument or GITHUB_EVENT_PATH).');
    }
    if (!fs.existsSync(payloadPath)) {
      throw new Error(`Payload file not found at: ${payloadPath}`);
    }
    const rawPayload = fs.readFileSync(payloadPath, 'utf-8');
    const event = JSON.parse(rawPayload);
    issue = event.issue;
  }

  if (!issue) {
    throw new Error('Payload does not contain an "issue" object.');
  }

  console.log(`[process-song-request] Processing Issue #${issue.number}: "${issue.title}"`);

  const parsed = parseSongRequest(issue);
  console.log(`[process-song-request] Parsed song: "${parsed.title}" (${parsed.stanzaCount} slides)`);
  if (parsed.hasNewMetadata) {
    console.log(`[process-song-request] ⚠️  New metadata detected: categories=[${parsed.newCategories.join(', ')}], massSections=[${parsed.newMassSections.join(', ')}]`);
  }

  // Ensure songs/ directory exists
  if (!fs.existsSync(songsDir)) {
    fs.mkdirSync(songsDir, { recursive: true });
  }

  // Target song JSON
  const fileName = `${sanitizeFileName(parsed.title)}.json`;
  const filePath = path.join(songsDir, fileName);

  const songData = {
    title: parsed.title,
    categories: parsed.categories,
    massSections: parsed.massSections,
    stanzas: parsed.stanzas
  };

  fs.writeFileSync(filePath, JSON.stringify(songData, null, 2) + '\n', 'utf-8');
  console.log(`[process-song-request] Saved song JSON to: ${filePath}`);

  // Re-run indexing script to keep assets/songs/index.json updated
  const indexScript = path.join(__dirname, 'index-songs.js');
  if (fs.existsSync(indexScript)) {
    console.log('[process-song-request] Running songs indexer...');
    execSync(`node "${indexScript}"`, { cwd: rootDir, stdio: 'inherit' });
  }

  // Build PR metadata
  const branchName = `song-request/issue-${issue.number}-${slugify(parsed.title)}`;
  const prTitle = `feat(songs): add "${parsed.title}"`;
  const prBody = buildPullRequestBody(parsed, issue);

  // Set GitHub Action step outputs if GITHUB_OUTPUT environment variable is present
  if (process.env.GITHUB_OUTPUT) {
    const outputPath = process.env.GITHUB_OUTPUT;
    const delimiter = `DELIMITER_${Date.now()}`;
    const outputs = [
      `success=true`,
      `song_title=${parsed.title}`,
      `file_name=songs/${fileName}`,
      `stanza_count=${parsed.stanzaCount}`,
      `branch_name=${branchName}`,
      `pr_title=${prTitle}`,
      `has_new_metadata=${parsed.hasNewMetadata}`,
      `pr_body<<${delimiter}\n${prBody}\n${delimiter}`
    ].join('\n') + '\n';

    fs.appendFileSync(outputPath, outputs, 'utf-8');
    console.log('[process-song-request] Successfully wrote outputs to GITHUB_OUTPUT');
  }

  return {
    success: true,
    parsed,
    fileName,
    filePath,
    branchName,
    prTitle,
    prBody
  };
}

if (require.main === module) {
  try {
    processSongRequest();
  } catch (err) {
    console.error('[process-song-request] Error:', err.message);
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `success=false\nerror=${err.message}\n`, 'utf-8');
    }
    process.exit(1);
  }
}

module.exports = {
  parseSongRequest,
  buildPullRequestBody,
  processSongRequest,
  sanitizeFileName,
  slugify,
  loadKnownMetadata
};
