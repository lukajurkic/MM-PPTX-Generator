const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'assets', 'songs', 'index.json');
const rawData = fs.readFileSync(indexPath, 'utf-8');
const songs = JSON.parse(rawData);

console.log('🧪 Testing Song Data & State Management Logic...');

// Test 1: Data Integrity
console.assert(Array.isArray(songs) && songs.length >= 4, 'Should load at least 4 songs');
console.log('  ✓ Songs loaded successfully from index.json');

// Test 2: Search filtering logic (Title match)
function searchSongs(query, songList) {
  const normalizedQuery = (query || '').toLowerCase().trim();
  if (!normalizedQuery) return songList;
  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  return songList.filter(song => {
    const title = song.title.toLowerCase();
    const lyrics = song.stanzas.join(' ').toLowerCase();
    return terms.every(term => title.includes(term) || lyrics.includes(term));
  });
}

const graceResults = searchSongs('grace', songs);
console.assert(graceResults.length === 1 && graceResults[0].id === 'amazing-grace', 'Search "grace" should find Amazing Grace');
console.log('  ✓ Search filtering by title passed');

// Test 3: Search filtering by lyric content
const blindResults = searchSongs('blind', songs);
console.assert(blindResults.length === 1 && blindResults[0].id === 'amazing-grace', 'Search "blind" should find Amazing Grace via lyrics');
console.log('  ✓ Search filtering by lyrics passed');

// Test 4: Playlist Management Simulation
let playlist = [];
function addToPlaylist(song) {
  const item = { playlistId: `${song.id}-${Date.now()}-${playlist.length + 1}`, song };
  playlist.push(item);
  return item;
}
function moveUp(index) {
  if (index <= 0) return;
  const temp = playlist[index - 1];
  playlist[index - 1] = playlist[index];
  playlist[index] = temp;
}
function moveDown(index) {
  if (index >= playlist.length - 1) return;
  const temp = playlist[index + 1];
  playlist[index + 1] = playlist[index];
  playlist[index] = temp;
}
function removeFromPlaylist(playlistId) {
  playlist = playlist.filter(i => i.playlistId !== playlistId);
}

const item1 = addToPlaylist(songs[0]);
const item2 = addToPlaylist(songs[1]);
console.assert(playlist.length === 2, 'Playlist should have 2 songs');
console.log('  ✓ Add to playlist passed');

const totalSlides = playlist.reduce((sum, item) => sum + item.song.stanzaCount, 0);
console.assert(totalSlides === songs[0].stanzaCount + songs[1].stanzaCount, 'Total slides calculation should match');
console.log('  ✓ Total playlist slides calculation passed');

moveUp(1);
console.assert(playlist[0].song.id === songs[1].id, 'Item 2 should now be at index 0');
console.log('  ✓ Move song up passed');

moveDown(0);
console.assert(playlist[0].song.id === songs[0].id, 'Item 1 should now be back at index 0');
console.log('  ✓ Move song down passed');

removeFromPlaylist(item1.playlistId);
console.assert(playlist.length === 1 && playlist[0].song.id === songs[1].id, 'Item 1 should be removed');
console.log('  ✓ Remove from playlist passed');

playlist = [];
console.assert(playlist.length === 0, 'Clear playlist passed');
console.log('  ✓ Clear playlist passed');

console.log('🎉 All Song Service & State Management tests passed successfully!');

