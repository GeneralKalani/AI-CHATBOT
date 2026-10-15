const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const dir = path.join(__dirname, 'Koleksi_Modul_P13', 'Koleksi_Modul_P13');
const files = fs.readdirSync(dir);

async function run() {
  const modules = [];

  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(fullPath);
      const parser = new PDFParse({ data: dataBuffer });
      await parser.load();
      const res = await parser.getText();
      const text = typeof res === 'string' ? res : (res.text || '');
      const baseName = file.replace('.pdf', '');
      modules.push({
        id: baseName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        title: baseName.replace(/_/g, ' '),
        filename: file,
        type: 'pdf',
        pages: res.total || 1,
        text: text.trim()
      });
      console.log(`Extracted PDF: ${file} (${text.length} chars)`);
    } else if (file.endsWith('.txt')) {
      const text = fs.readFileSync(fullPath, 'utf8');
      const baseName = file.replace('.txt', '');
      modules.push({
        id: baseName.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_txt',
        title: baseName.replace(/_/g, ' '),
        filename: file,
        type: 'txt',
        pages: 1,
        text: text.trim()
      });
      console.log(`Read TXT: ${file} (${text.length} chars)`);
    }
  }

  fs.writeFileSync('extracted_modules.json', JSON.stringify(modules, null, 2), 'utf8');
  console.log(`Successfully extracted ${modules.length} modules to extracted_modules.json`);
}

run().catch(console.error);
