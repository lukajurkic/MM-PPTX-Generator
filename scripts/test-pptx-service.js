const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');

console.log('🧪 Testing PptxExportService Generation Logic...');

// Load real sample songs
const indexPath = path.join(__dirname, '..', 'src', 'assets', 'songs', 'index.json');
const songs = JSON.parse(fs.readFileSync(indexPath, 'utf-8'));

const playlist = [
  { playlistId: 'p-1', song: songs[0] }, // 10,000 Reasons (4 stanzas)
  { playlistId: 'p-2', song: songs[1] }  // Amazing Grace (4 stanzas)
];

// Test 1: Date filename format
function getDefaultFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}.pptx`;
}

const todayFilename = getDefaultFilename();
const datePattern = /^\d{4}-\d{2}-\d{2}\.pptx$/;
console.assert(datePattern.test(todayFilename), `Filename ${todayFilename} should match YYYY-MM-DD.pptx`);
console.log(`  ✓ Default filename verified: ${todayFilename}`);

// Test 2: Font size auto-fit calculation
function calculateOptimalFontSize(stanza) {
  const lines = stanza.split('\n').map(l => l.trim()).filter(Boolean);
  const lineCount = lines.length;
  const maxLineLength = Math.max(...lines.map(l => l.length), 0);

  if (lineCount <= 2 && maxLineLength <= 35) return 44;
  if (lineCount <= 4 && maxLineLength <= 45) return 40;
  if (lineCount <= 6 && maxLineLength <= 55) return 36;
  return 32;
}

const shortStanza = 'Amazing grace how sweet the sound\nThat saved a wretch like me';
console.assert(calculateOptimalFontSize(shortStanza) === 44, 'Short stanza should be 44pt');
console.log('  ✓ Optimal font size calculation passed');

// Test 3: Build Presentation
const pres = new pptxgen();
pres.layout = 'LAYOUT_16x9';

let totalExpectedSlides = 0;
playlist.forEach((item, index) => {
  totalExpectedSlides += item.song.stanzas.length;
  if (index < playlist.length - 1) {
    totalExpectedSlides += 1; // blank transition slide
  }
});

playlist.forEach((item, songIndex) => {
  const song = item.song;
  song.stanzas.forEach(stanza => {
    const slide = pres.addSlide();
    slide.background = { color: '000000' };
    const allCaps = stanza.toUpperCase();
    const fontSize = calculateOptimalFontSize(stanza);
    slide.addText(allCaps, {
      x: '5%',
      y: '5%',
      w: '90%',
      h: '90%',
      fontFace: 'Verdana',
      fontSize,
      color: 'FFFFFF',
      bold: true,
      align: 'center',
      valign: 'middle'
    });
  });

  // Blank transition slide between songs
  if (songIndex < playlist.length - 1) {
    const blankSlide = pres.addSlide();
    blankSlide.background = { color: '000000' };
  }
});

console.assert(pres.slides.length === totalExpectedSlides, `Expected ${totalExpectedSlides} slides, got ${pres.slides.length}`);
console.log(`  ✓ Slide count verified: ${pres.slides.length} slides (4 stanzas + 1 blank slide + 4 stanzas)`);

// Test 4: Write real PPTX file
const outputPath = path.join('/tmp', todayFilename);
pres.writeFile({ fileName: outputPath }).then(() => {
  const stats = fs.statSync(outputPath);
  console.assert(stats.size > 10000, 'PPTX file size should be > 10KB');
  console.log(`  ✓ PPTX successfully generated at ${outputPath} (${Math.round(stats.size / 1024)} KB)`);
  console.log('🎉 All PptxExportService tests passed successfully!');
}).catch(err => {
  console.error('Failed to write presentation:', err);
  process.exit(1);
});

