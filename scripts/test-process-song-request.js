const path = require('path');
const fs = require('fs');
const assert = require('assert');
const {
  parseSongRequest,
  buildPullRequestBody,
  processSongRequest,
  sanitizeFileName,
  slugify,
  KNOWN_CATEGORIES,
  KNOWN_MASS_SECTIONS
} = require('./process-song-request');

console.log('🧪 Testing Song Request to Pull Request Workflow...');

// Test 1: Sanitize File Name & Slugify
assert.strictEqual(sanitizeFileName('Milost: (Amazing Grace) / Nova?'), 'Milost (Amazing Grace) Nova');
assert.strictEqual(slugify('Agnus Dei (Međugorska misa)'), 'agnus-dei-medugorska-misa');
console.log('  ✓ File name sanitization and slugification passed');

// Test 2: Parse Standard GitHub Issue Form
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

// Test 3: Detection of New / Unknown Categories and Mass Sections
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
assert.ok(prBody.includes('### ⚠️ Nove kategorije / dijelovi mise (Manual Attention Required)'));
assert.ok(prBody.includes('Uvodni obred'));
assert.ok(prBody.includes('Taize'));
assert.ok(prBody.includes('Susret mladih'));
assert.ok(prBody.includes('Ovaj Pull Request možete pregledati i odobriti jednim dodirom'));
console.log('  ✓ New metadata detection and PR body formatting passed');

// Test 4: Freeform Issue Body fallback
const parsedFreeform = parseSongRequest({
  title: '[Pjesma]: Gospodin je pastir moj',
  body: 'Gospodin je pastir moj:\nni u čem ja ne oskudijevam;\nna poljanama zelenim\non mi daje odmora.\n\nNa vrutke me tihane vodi\ni krijepi dušu moju.',
  number: 44,
  user: { login: 'petar' }
});

assert.strictEqual(parsedFreeform.title, 'Gospodin je pastir moj');
assert.strictEqual(parsedFreeform.stanzaCount, 2);
console.log('  ✓ Freeform issue fallback parsing passed');

// Test 5: End-to-end Process in temporary sandbox
const tempOutputDir = path.join(__dirname, '..', 'songs');
const testSongTitle = 'Unit Test Song 2026';
const testFileName = `${testSongTitle}.json`;
const testFilePath = path.join(tempOutputDir, testFileName);

try {
  const result = processSongRequest({
    issue: {
      number: 999,
      title: testSongTitle,
      body: sampleIssueFormBody,
      user: { login: 'testbot' }
    }
  });

  assert.strictEqual(result.success, true);
  assert.ok(fs.existsSync(result.filePath), 'Song JSON should be created on disk');

  const createdContent = JSON.parse(fs.readFileSync(result.filePath, 'utf-8'));
  assert.strictEqual(createdContent.title, 'Kralj kraljeva (King of Kings)');
  assert.strictEqual(createdContent.stanzas.length, 2);
  assert.deepStrictEqual(createdContent.categories, ['Slavljenje']);
  assert.deepStrictEqual(createdContent.massSections, ['Ulazna', 'Zahvalna']);
  console.log('  ✓ End-to-end processSongRequest execution and file generation passed');
} finally {
  // Clean up any test song file generated
  const testFiles = [
    testFilePath,
    path.join(tempOutputDir, 'Kralj kraljeva (King of Kings).json')
  ];
  for (const f of testFiles) {
    if (fs.existsSync(f)) {
      fs.unlinkSync(f);
    }
  }
  // Re-run index-songs to restore clean index.json
  require('./index-songs');
}

console.log('🎉 All Song Request to Pull Request workflow tests passed successfully!');

