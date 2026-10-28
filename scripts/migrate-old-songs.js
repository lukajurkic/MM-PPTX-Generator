const fs = require('fs');
const path = require('path');

const oldDir = path.join(__dirname, '..', 'songs', 'old');
const songsDir = path.join(__dirname, '..', 'songs');

if (!fs.existsSync(oldDir)) {
  console.error(`[migrate-old-songs] Directory '${oldDir}' does not exist.`);
  process.exit(1);
}

const files = fs.readdirSync(oldDir).filter(f => f.endsWith('.txt')).sort();
console.log(`[migrate-old-songs] Found ${files.length} old songs to migrate.`);

let convertedCount = 0;

for (const file of files) {
  const filePath = path.join(oldDir, file);
  const baseName = path.basename(file, '.txt').trim();
  const rawContent = fs.readFileSync(filePath, 'utf-8')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  const lines = rawContent.split('\n');
  let part = null;
  let type = null;
  let titleLine = null;
  let idx = 0;

  while (idx < lines.length) {
    const l = lines[idx].trim();
    if (l.startsWith('Part:')) {
      part = l.substring(5).trim();
      idx++;
    } else if (l.startsWith('Type:')) {
      type = l.substring(5).trim();
      idx++;
    } else if (l.length > 0) {
      titleLine = l;
      idx++;
      break;
    } else {
      idx++;
    }
  }

  // Determine Title & Output Filename
  let title = titleLine || baseName;

  // Clean merged titles with 'I'
  if (baseName === 'Ljubav s nebaIZapali vatru') {
    title = 'Ljubav s neba / Zapali vatru';
  } else if (baseName === 'Prožmi meITi si slave dostojan') {
    title = 'Prožmi me / Ti si slave dostojan';
  } else if (baseName === 'Svi moji izvoriIPrva ljubav') {
    title = 'Svi moji izvori / Prva ljubav';
  } else if (baseName === 'Kyrie eleison - Međugorska misa') {
    title = 'Kyrie eleison (Međugorska misa)';
  } else if (baseName === 'Agnus dei - Međugorska misa') {
    title = 'Agnus Dei (Međugorska misa)';
  } else if (baseName === 'Sanctus - Međugorska misa') {
    title = 'Sanctus (Međugorska misa)';
  } else if (baseName === 'Gospodine - Fides') {
    title = 'Gospodine, smiluj se (Fides)';
  } else if (baseName === 'Svet - Fides') {
    title = 'Svet (Fides)';
  } else if (baseName === 'Gospodine - Marijina misa') {
    title = 'Gospodine, smiluj se (Marijina misa)';
  } else if (baseName === 'Slava - Marijina misa') {
    title = 'Slava Bogu na visini (Marijina misa)';
  } else if (baseName === 'Aleluja - Marijina misa') {
    title = 'Aleluja (Marijina misa)';
  } else if (baseName === 'Svet - Marijna misa') {
    title = 'Svet (Marijina misa)';
  } else if (baseName === 'Jaganjce Božji - Marijina misa') {
    title = 'Jaganjče Božji (Marijina misa)';
  } else if (baseName === 'Jaganjče Božji - misa sv. Andrije') {
    title = 'Jaganjče Božji (Misa sv. Andrije)';
  } else if (baseName === 'Gospodine - fra Ivan Matić') {
    title = 'Gospodine, smiluj se (Misa fra Ivan Matić)';
  } else if (baseName === 'Jaganjče Božji -fra Ivan Matić') {
    title = 'Jaganjče Božji (Misa fra Ivan Matić)';
  } else if (baseName === 'Agnus dei - veseli') {
    title = 'Agnus Dei (veseli)';
  } else {
    if (!titleLine) {
      title = baseName;
    }
  }

  // Safe file name for saving (replace / with -)
  const safeFileName = `${title.replace(/\//g, '-').trim()}.json`;

  // Parse stanzas
  const bodyLines = lines.slice(idx);
  const stanzas = [];
  let currentLines = [];
  let inQuote = false;

  for (const line of bodyLines) {
    let sline = line.trim();
    if (!sline) {
      if (inQuote) {
        currentLines.push('');
      } else if (currentLines.length > 0) {
        const st = currentLines.join('\n').trim();
        if (st) stanzas.push(st);
        currentLines = [];
      }
      continue;
    }

    if (sline.startsWith("'") && !inQuote) {
      inQuote = true;
      sline = sline.replace(/^'+/, '');
    }

    let endsQuote = false;
    if (sline.endsWith("'")) {
      endsQuote = true;
      sline = sline.replace(/'+$/, '');
    }

    currentLines.push(sline);

    if (endsQuote) {
      inQuote = false;
      const st = currentLines.join('\n').trim();
      if (st) stanzas.push(st);
      currentLines = [];
    }
  }

  if (currentLines.length > 0) {
    const st = currentLines.join('\n').trim();
    if (st) stanzas.push(st);
  }

  if (stanzas.length === 0) {
    console.warn(`[migrate-old-songs] Warning: 0 stanzas for '${file}'`);
  }

  // Determine categories and massSections according to confirmed rules
  let categories = [];
  let massSections = [];

  if (part === 'Psalam') {
    massSections = ['Otpjevni psalam'];
    categories = [];
  } else if (part === 'Klanjanje') {
    massSections = ['Klanjanje'];
    categories = ['Meditativne'];
  } else if (part === 'Gospodine') {
    massSections = ['Gospodine smiluj se'];
    if (type === 'Marijina') {
      categories = ['Marijina misa'];
    } else if (type === 'misa fra Ivan Matić') {
      categories = ['Misa fra Ivan Matić'];
    } else if (type) {
      categories = [type];
    }
  } else if (part === 'Slava Bogu na visini') {
    massSections = ['Slava'];
    categories = ['Marijina misa'];
  } else if (part === 'Aleluja') {
    massSections = ['Aleluja'];
    if (type) {
      categories = [type];
    }
  } else if (part === 'Svet') {
    massSections = ['Svet'];
    if (type === 'Marijna misa' || type === 'Marijina misa') {
      categories = ['Marijina misa'];
    } else if (type) {
      categories = [type];
    }
  } else if (part === 'Jaganjce' || part === 'Jaganjče') {
    massSections = ['Jaganjče Božji'];
    if (type === 'misa fra Ivan Matić') {
      categories = ['Misa fra Ivan Matić'];
    } else if (type) {
      categories = [type];
    }
  } else if (part === 'Došašće') {
    categories = ['Došašće'];
    massSections = [];
  } else if (part === 'Korizmene pjesme') {
    categories = ['Korizmene'];
    massSections = [];
  } else if (part === 'Uskrsne pjesme') {
    categories = ['Uskrsne'];
    massSections = [];
  } else if (part === 'Ulazne pjesme') {
    massSections = ['Ulazna'];
    categories = ['Slavljenje'];
    if (baseName.includes('Duše Sveti')) {
      categories.push('Duhu Svetom');
    }
  } else if (part === 'Prikazne pjesme') {
    massSections = ['Prinosna'];
    categories = [];
  } else if (part === 'Pričesne pjesme') {
    massSections = ['Pričesna'];
    categories = [];
  } else if (part === 'Završne pjesme') {
    massSections = ['Završna'];
    const isMarian = /marij|djevo|majko|moli za nas|jedina|žena/i.test(baseName);
    if (isMarian) {
      categories = ['Marijanske'];
    } else {
      categories = [];
    }
  } else if (part === 'Prigodne pjesme') {
    categories = ['Prigodne'];
    massSections = [];
  } else if (part === 'Slavljenje' || type === 'Slavljenje') {
    categories = ['Slavljenje'];
    massSections = [];
  } else {
    categories = [];
    massSections = [];
  }

  const songData = {
    title,
    categories,
    massSections,
    stanzas
  };

  const targetPath = path.join(songsDir, safeFileName);
  fs.writeFileSync(targetPath, JSON.stringify(songData, null, 2) + '\n', 'utf-8');
  convertedCount++;
}

console.log(`[migrate-old-songs] Successfully converted ${convertedCount} songs to JSON in '${songsDir}'.`);
