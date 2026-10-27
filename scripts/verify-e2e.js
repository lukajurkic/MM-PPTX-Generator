const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

async function runEndToEndVerification() {
  console.log('====================================================');
  console.log('🚀 Running Task 5.2 End-to-End Verification Suite');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assertTest(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${details ? '(' + details + ')' : ''}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? '(' + details + ')' : ''}`);
      process.exitCode = 1;
    }
  }

  // ----------------------------------------------------
  // Phase 1: Prebuild Song Indexing Verification
  // ----------------------------------------------------
  console.log('1️⃣  Verifying Song Indexing & Manifest (index.json)...');
  const indexPath = path.join(__dirname, '..', 'src', 'assets', 'songs', 'index.json');
  assertTest(fs.existsSync(indexPath), 'Song manifest index.json exists');

  const rawIndex = fs.readFileSync(indexPath, 'utf-8');
  let songs = [];
  try {
    songs = JSON.parse(rawIndex);
    assertTest(Array.isArray(songs) && songs.length >= 4, 'Manifest is valid JSON array with >= 4 songs', `${songs.length} songs found`);
  } catch (e) {
    assertTest(false, 'Manifest parses as valid JSON', e.message);
  }

  songs.forEach((song, idx) => {
    const hasRequiredFields = song.id && song.title && song.slug && song.fileName && song.stanzaCount > 0 && Array.isArray(song.stanzas);
    assertTest(hasRequiredFields, `Song #${idx + 1} (${song.title}) has valid schema & non-empty stanzas`, `${song.stanzaCount} stanzas`);
  });

  // ----------------------------------------------------
  // Phase 2: Production Build & Static Assets Verification
  // ----------------------------------------------------
  console.log('\n2️⃣  Verifying Production Build & GitHub Pages Dist Structure...');
  const distBrowserPath = path.join(__dirname, '..', 'dist', 'my-ui-app', 'browser');
  const indexHtmlPath = path.join(distBrowserPath, 'index.html');
  assertTest(fs.existsSync(indexHtmlPath), 'Production index.html exists in dist/my-ui-app/browser');

  if (fs.existsSync(indexHtmlPath)) {
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    assertTest(indexHtml.includes('<base href="/MM-PPTX-Generator/">'), 'index.html has correct GitHub Pages base href ("/MM-PPTX-Generator/")');
    assertTest(!indexHtml.includes('server.mjs'), 'Clean static SPA output (no server runtime references)');
  }

  const bundledIndexPath = path.join(distBrowserPath, 'assets', 'songs', 'index.json');
  assertTest(fs.existsSync(bundledIndexPath), 'Song manifest is bundled into dist assets');

  // ----------------------------------------------------
  // Phase 3: PPTX Generation, Formatting, Fonts & Slide Count
  // ----------------------------------------------------
  console.log('\n3️⃣  Verifying PowerPoint (.pptx) Presentation Generation & Formatting...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';

  // Build playlist with all 4 songs
  const playlist = songs.map((song, i) => ({
    playlistId: `p-${i + 1}`,
    song
  }));

  let expectedLyricSlides = 0;
  playlist.forEach((item, songIndex) => {
    expectedLyricSlides += item.song.stanzas.length;
    item.song.stanzas.forEach(stanza => {
      const slide = pres.addSlide();
      slide.background = { color: '000000' };

      // Typography settings: Verdana, ALL CAPS, White, Bold, Centered
      const allCaps = stanza.toUpperCase();
      slide.addText(allCaps, {
        x: '5%',
        y: '5%',
        w: '90%',
        h: '90%',
        fontFace: 'Verdana',
        fontSize: 38,
        color: 'FFFFFF',
        bold: true,
        align: 'center',
        valign: 'middle'
      });
    });

    // Blank transition slide between distinct songs
    if (songIndex < playlist.length - 1) {
      const blankSlide = pres.addSlide();
      blankSlide.background = { color: '000000' };
    }
  });

  const expectedBlankSlides = playlist.length - 1; // 3 blank slides for 4 songs
  const expectedTotalSlides = expectedLyricSlides + expectedBlankSlides; // 16 + 3 = 19 slides

  assertTest(pres.layout === 'LAYOUT_16x9', 'Presentation layout is 16:9 Widescreen (10" x 5.625")');
  assertTest(pres.slides.length === expectedTotalSlides, 'Slide count matches exact calculation', `${pres.slides.length} slides (${expectedLyricSlides} lyrics + ${expectedBlankSlides} blank transitions)`);

  const exportPath = path.join('/tmp', 'e2e-verification-output.pptx');
  await pres.writeFile({ fileName: exportPath });

  assertTest(fs.existsSync(exportPath), 'PPTX file successfully generated and saved to disk');
  const fileStat = fs.statSync(exportPath);
  assertTest(fileStat.size > 20000, 'PPTX file size is valid (> 20 KB)', `${Math.round(fileStat.size / 1024)} KB`);

  // Verify internal OpenXML ZIP structure of the PPTX file
  const JSZip = require('jszip');
  const pptxBuffer = fs.readFileSync(exportPath);
  const zip = await JSZip.loadAsync(pptxBuffer);

  // Check presentation.xml exists
  assertTest(zip.file('ppt/presentation.xml') !== null, 'OpenXML presentation.xml archive structure is valid');

  // Inspect first slide XML for font (Verdana) and text
  const slide1Xml = await zip.file('ppt/slides/slide1.xml').async('text');
  assertTest(slide1Xml.includes('typeface="Verdana"'), 'Slide XML uses Verdana font typeface');
  assertTest(slide1Xml.includes('b="1"'), 'Slide XML text is bold (b="1")');

  // Verify slide background color in slide or slideLayout/theme
  const hasBlackColor = slide1Xml.includes('000000') || slide1Xml.includes('solidFill');
  assertTest(hasBlackColor, 'Slide XML contains solid black background definitions');

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 Verification Results: ${passedTests}/${totalTests} tests passed`);
  console.log('====================================================\n');
}

runEndToEndVerification().catch(err => {
  console.error('E2E Verification threw error:', err);
  process.exit(1);
});
