const path = require('path');
const fs = require('fs');
const assert = require('assert');
const {
  parseSongRequest,
  buildPullRequestBody,
  processSongRequest,
  sanitizeFileName,
  slugify,
  loadKnownMetadata
} = require('./process-song-request');

console.log('🧪 Testing Song Request & Automated Metadata Workflow (Feature 24)...');

// Test 1: Sanitize File Name & Slugify
assert.strictEqual(sanitizeFileName('Milost: (Amazing Grace) / Nova?'), 'Milost (Amazing Grace) Nova');
assert.strictEqual(slugify('Agnus Dei (Međugorska misa)'), 'agnus-dei-medugorska-misa');
console.log('  ✓ File name sanitization and slugification passed');

// Test 2: Load Known Metadata from Static JSON
const staticMeta = loadKnownMetadata();
assert.ok(Array.isArray(staticMeta.categories), 'categories should be an array');
assert.ok(Array.isArray(staticMeta.massSections), 'massSections should be an array');
assert.ok(staticMeta.categories.includes('Slavljenje'), 'Should include Slavljenje');
assert.ok(staticMeta.massSections.includes('Ulazna'), 'Should include Ulazna');
console.log(`  ✓ Loaded static metadata: ${staticMeta.categories.length} categories, ${staticMeta.massSections.length} mass sections`);

// Test 3: Parse Standard GitHub Issue Form
const sampleIssueFormBody = `
### Naziv pjesme (Song Title)

Kralj kraljeva (King of Kings)

### Tekst pjesme / Stihovi (Lyrics)

U tami svjetlo zasja
Nebo šutjelo je dugo
Dok u štalici u Betlehemu
Nije rođen Sin Svevišnjega

Hvaljen budi Oče naš
Slavljen budi Isuse
Uskrsnućem ti pobijedi
Kralju slave vječni

### Dio mise (Mass Section)

Ulazna, Zahvalna

### Drugi dio mise (Other / Custom Mass Section)

_No response_

### Kategorije pjesme (Categories)

Slavljenje

### Druge kategorije (Other / Custom Categories)

_No response_

### Dodatne napomene (Notes / Submitter)

Predložio Luka
`;

const parsed1 = parseSongRequest({
  title: '[Pjesma]: Kralj kraljeva',
  body: sampleIssueFormBody,
  number: 42,
  user: { login: 'lukajurkic' }
});

assert.strictEqual(parsed1.title, 'Kralj kraljeva (King of Kings)');
assert.strictEqual(parsed1.stanzaCount, 2);
assert.strictEqual(parsed1.stanzas.length, 2);
assert.deepStrictEqual(parsed1.massSections, ['Ulazna', 'Zahvalna']);
assert.deepStrictEqual(parsed1.categories, ['Slavljenje']);
assert.strictEqual(parsed1.hasNewMetadata, false);
assert.strictEqual(parsed1.newCategories.length, 0);
assert.strictEqual(parsed1.newMassSections.length, 0);
console.log('  ✓ Standard GitHub Issue Form parsing passed');

// Test 4: Detection of New / Unknown Categories and Mass Sections
const sampleIssueWithNewMetadata = `
### Naziv pjesme (Song Title)

Pjesma susreta

### Tekst pjesme / Stihovi (Lyrics)

Ovo je dan što ga stvori Bog
Kličimo i radujmo se u njemu

### Dio mise (Mass Section)

Ulazna

### Drugi dio mise (Other / Custom Mass Section)

Uvodni obred

### Kategorije pjesme (Categories)

Slavljenje

### Druge kategorije (Other / Custom Categories)

Taize, Susret mladih
`;

const parsed2 = parseSongRequest({
  title: '[Pjesma]: Pjesma susreta',
  body: sampleIssueWithNewMetadata,
  number: 43,
  user: { login: 'marija' }
});

assert.strictEqual(parsed2.title, 'Pjesma susreta');
assert.strictEqual(parsed2.hasNewMetadata, true);
assert.deepStrictEqual(parsed2.newMassSections, ['Uvodni obred']);
assert.deepStrictEqual(parsed2.newCategories, ['Taize', 'Susret mladih']);

const prBody = buildPullRequestBody(parsed2, {
  number: 43,
  user: { login: 'marija' }
});

assert.ok(prBody.includes('Closes #43'), 'PR body should link to and close the issue');
assert.ok(prBody.includes('### ✨ Automatski dodane nove kategorije i dijelovi mise'));
assert.ok(prBody.includes('Uvodni obred'));
assert.ok(prBody.includes('Taize'));
assert.ok(prBody.includes('Susret mladih'));
assert.ok(prBody.includes('metadata-options.json'));
assert.ok(prBody.includes('Ovaj Pull Request možete pregledati i odobriti jednim dodirom'));
console.log('  ✓ New metadata detection and automated PR body formatting passed');

// Test 5: Freeform Issue Body fallback
const parsedFreeform = parseSongRequest({
  title: '[Pjesma]: Gospodin je pastir moj',
  body: 'Gospodin je pastir moj:\nni u čem ja ne oskudijevam;\nna poljanama zelenim\non mi daje odmora.\n\nNa vrutke me tihane vodi\ni krijepi dušu moju.',
  number: 44,
  user: { login: 'petar' }
});

assert.strictEqual(parsedFreeform.title, 'Gospodin je pastir moj');
assert.strictEqual(parsedFreeform.stanzaCount, 2);
console.log('  ✓ Freeform issue fallback parsing passed');

// Test 6: End-to-end Process with Automated Metadata Addition in static JSON
const songsDir = path.join(__dirname, '..', 'songs');
const metaDir = path.join(__dirname, '..', 'src', 'assets', 'songs');
const metaOptionsPath = path.join(metaDir, 'metadata-options.json');
const categoriesPath = path.join(metaDir, 'categories.json');
const massSectionsPath = path.join(metaDir, 'mass-sections.json');

const testSongTitle = 'Pjesma s novim kategorijama';
const testFileName = `${testSongTitle}.json`;
const testFilePath = path.join(songsDir, testFileName);

try {
  const result = processSongRequest({
    issue: {
      number: 999,
      title: testSongTitle,
      body: sampleIssueWithNewMetadata,
      user: { login: 'testbot' }
    }
  });

  assert.strictEqual(result.success, true);
  assert.ok(fs.existsSync(result.filePath), 'Song JSON should be created on disk');

  // Verify created song content
  const createdContent = JSON.parse(fs.readFileSync(result.filePath, 'utf-8'));
  assert.strictEqual(createdContent.title, 'Pjesma susreta');
  assert.ok(createdContent.categories.includes('Taize'));
  assert.ok(createdContent.massSections.includes('Uvodni obred'));

  // Verify static JSON files were automatically updated with the new metadata
  const updatedMetaOptions = JSON.parse(fs.readFileSync(metaOptionsPath, 'utf-8'));
  const updatedCategories = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));
  const updatedMassSections = JSON.parse(fs.readFileSync(massSectionsPath, 'utf-8'));

  assert.ok(updatedMetaOptions.categories.includes('Taize'), 'metadata-options.json must include new category Taize');
  assert.ok(updatedMetaOptions.categories.includes('Susret mladih'), 'metadata-options.json must include Susret mladih');
  assert.ok(updatedMetaOptions.massSections.includes('Uvodni obred'), 'metadata-options.json must include Uvodni obred');

  assert.ok(updatedCategories.includes('Taize'), 'categories.json must include new category Taize');
  assert.ok(updatedMassSections.includes('Uvodni obred'), 'mass-sections.json must include new mass section Uvodni obred');

  console.log('  ✓ Automated categories and mass sections creation in static JSON passed');
} finally {
  // Clean up test song file
  const testFiles = [
    testFilePath,
    path.join(songsDir, 'Pjesma susreta.json')
  ];
  for (const f of testFiles) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
    }
  }

  // Restore clean static metadata files and index
  const cleanCategories = [
    'Božićne', 'Došašće', 'Duhu Svetom', 'Fides', 'Korizmene', 'Marijanske',
    'Marijina misa', 'Meditativne', 'Međugorska misa', 'Misa fra Ivan Matić',
    'Misa sv. Andrije', 'Mladi', 'Opće', 'Prigodne', 'Slavljenje', 'Uskrsne', 'Zahvala'
  ];
  const cleanMassSections = [
    'Aleluja', 'Gospodine smiluj se', 'Jaganjče Božji', 'Klanjanje', 'Otpjevni psalam',
    'Pričesna', 'Prinosna', 'Slava', 'Svet', 'Ulazna', 'Zahvalna', 'Završna'
  ];
  fs.writeFileSync(metaOptionsPath, JSON.stringify({ categories: cleanCategories, massSections: cleanMassSections }, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(categoriesPath, JSON.stringify(cleanCategories, null, 2) + '\n', 'utf-8');
  fs.writeFileSync(massSectionsPath, JSON.stringify(cleanMassSections, null, 2) + '\n', 'utf-8');

  require('./index-songs');
}

console.log('🎉 All Automated Categories and MassSections creation tests passed successfully!');
