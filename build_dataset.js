const fs = require('fs');
const path = require('path');

const rawModules = JSON.parse(fs.readFileSync('extracted_modules.json', 'utf8'));

// Subject mapping
const subjectMap = [
  { match: 'sejarah', subject: 'Sejarah Indonesia', icon: '🏛️', color: '#e67e22' },
  { match: 'biologi', subject: 'Biologi', icon: '🧬', color: '#27ae60' },
  { match: 'fisika', subject: 'Fisika', icon: '⚡', color: '#2980b9' },
  { match: 'kimia', subject: 'Kimia', icon: '🧪', color: '#8e44ad' },
  { match: 'matematika', subject: 'Matematika', icon: '📐', color: '#d35400' },
  { match: 'sosiologi', subject: 'Sosiologi', icon: '👥', color: '#16a085' },
  { match: 'geografi', subject: 'Geografi', icon: '🌍', color: '#2c3e50' },
  { match: 'ekonomi', subject: 'Ekonomi', icon: '📈', color: '#f39c12' },
  { match: 'informatika', subject: 'Informatika', icon: '💻', color: '#3498db' },
  { match: 'bahasa_indonesia', subject: 'Bahasa Indonesia', icon: '📖', color: '#c0392b' },
];

function getSubjectInfo(name) {
  const lower = name.toLowerCase();
  for (const s of subjectMap) {
    if (lower.includes(s.match)) return s;
  }
  return { subject: 'Umum', icon: '📚', color: '#3b82f6' };
}

// Clean and extract chapters
function parseSections(text) {
  const sections = [];
  const lines = text.split('\n');
  let currentSection = { title: 'Pengenalan & Konsep Dasar', content: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // Check if line looks like a chapter or heading
    if (/^(BAB \d+:|[0-9]+\.\s+[A-Z]|BAGIAN \d+:)/i.test(trimmed) && trimmed.length < 120) {
      if (currentSection.content.length > 0) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.join('\n')
        });
      }
      currentSection = { title: trimmed, content: [] };
    } else {
      currentSection.content.push(trimmed);
    }
  }

  if (currentSection.content.length > 0) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.join('\n')
    });
  }

  return sections;
}

const processedModules = [];

// Separate into unified subject modules
const groupedBySubject = {};

for (const m of rawModules) {
  const info = getSubjectInfo(m.id);
  const key = info.subject;
  if (!groupedBySubject[key]) {
    groupedBySubject[key] = {
      id: info.match,
      title: info.subject,
      subject: info.subject,
      icon: info.icon,
      color: info.color,
      files: [],
      text: '',
      sections: [],
      wordCount: 0
    };
  }

  groupedBySubject[key].files.push({
    filename: m.filename,
    type: m.type,
    pages: m.pages || 1,
    chars: m.text.length
  });

  // Prefer PDF text as main detailed content, append TXT notes
  if (m.type === 'pdf') {
    groupedBySubject[key].text = m.text + '\n\n' + groupedBySubject[key].text;
  } else {
    groupedBySubject[key].text = groupedBySubject[key].text + '\n\n[Ringkasan TXT]:\n' + m.text;
  }
}

for (const [subj, data] of Object.entries(groupedBySubject)) {
  const cleanedText = data.text.trim();
  const sections = parseSections(cleanedText);
  const words = cleanedText.split(/\s+/).filter(Boolean).length;

  processedModules.push({
    id: 'mod_' + data.id,
    title: `Modul ${data.subject}`,
    subject: data.subject,
    icon: data.icon,
    color: data.color,
    source: 'Bahan Latihan P13',
    files: data.files,
    wordCount: words,
    charCount: cleanedText.length,
    summary: cleanedText.slice(0, 350).replace(/\s+/g, ' ') + '...',
    sections: sections.slice(0, 20), // Top 20 sections
    fullText: cleanedText
  });
}

console.log(`Processed ${processedModules.length} distinct subject modules.`);

const outputJs = `// Dataset Modul Bahan Latihan P13 (Otomatis & Offline-ready)
window.DEFAULT_MODULES = ${JSON.stringify(processedModules, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'js', 'default_modules.js'), outputJs, 'utf8');
console.log('Saved js/default_modules.js successfully!');
