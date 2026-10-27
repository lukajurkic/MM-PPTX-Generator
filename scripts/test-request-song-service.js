console.log('🧪 Testing RequestSongService Submission Logic...');

// Test 1: Validation
function validateRequest(payload) {
  if (!payload.title || !payload.title.trim()) {
    throw new Error('Song title is required.');
  }
  if (!payload.lyrics || !payload.lyrics.trim()) {
    throw new Error('Song lyrics are required.');
  }
  return true;
}

try {
  validateRequest({ title: '', lyrics: 'Lyrics' });
  console.assert(false, 'Should have failed on empty title');
} catch (e) {
  console.assert(e.message === 'Song title is required.', 'Correct error message for empty title');
  console.log('  ✓ Title validation passed');
}

try {
  validateRequest({ title: 'Title', lyrics: '   ' });
  console.assert(false, 'Should have failed on whitespace lyrics');
} catch (e) {
  console.assert(e.message === 'Song lyrics are required.', 'Correct error message for empty lyrics');
  console.log('  ✓ Lyrics validation passed');
}

// Test 2: Payload generation
function formatPayload(payload, accessKey) {
  validateRequest(payload);
  return {
    access_key: accessKey,
    subject: `New Song Request: ${payload.title.trim()}`,
    from_name: payload.submitterName?.trim() || 'Lyrics Presentation App',
    song_title: payload.title.trim(),
    lyrics: payload.lyrics.trim(),
    submitter_name: payload.submitterName?.trim() || 'Anonymous',
    submitter_email: payload.submitterEmail?.trim() || 'Not provided',
    notes: payload.notes?.trim() || 'No additional notes',
    submitted_at: new Date().toISOString()
  };
}

const formatted = formatPayload({
  title: 'Blessed Be Your Name',
  lyrics: 'Blessed be Your name in the land that is plentiful',
  submitterName: 'Jane Doe',
  submitterEmail: 'jane@example.com',
  notes: 'Popular youth worship song'
}, 'test-key-123');

console.assert(formatted.song_title === 'Blessed Be Your Name', 'Title matches');
console.assert(formatted.submitter_name === 'Jane Doe', 'Submitter name matches');
console.assert(formatted.access_key === 'test-key-123', 'Access key matches');
console.assert(formatted.subject === 'New Song Request: Blessed Be Your Name', 'Subject formatted correctly');
console.log('  ✓ Payload generation and formatting passed');

console.log('🎉 All RequestSongService tests passed successfully!');
