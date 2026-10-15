/**
 * EduBot P13 - File & Folder Loader
 * Supports uploading entire folders (via webkitdirectory), multi-file uploads,
 * and extracting text locally from TXT, MD, JSON, CSV, and PDF files.
 */

class FileLoader {
  constructor() {
    // Set pdf.js worker src to local vendor path
    if (window.pdfjsLib) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'js/vendor/pdf.worker.min.js';
    }
  }

  // Read a single file
  async readFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') {
      return await this.extractPdfText(file);
    } else if (['txt', 'md', 'markdown', 'json', 'csv', 'log'].includes(ext)) {
      return await this.readTextFile(file);
    } else {
      throw new Error(`Format file .${ext} belum didukung. Gunakan PDF, TXT, MD, atau JSON.`);
    }
  }

  // Extract plain text from TXT/MD/JSON
  readTextFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve({
          name: file.name,
          text: e.target.result,
          pages: 1,
          size: file.size,
          type: file.name.split('.').pop().toLowerCase()
        });
      };
      reader.onerror = () => reject(new Error(`Gagal membaca ${file.name}`));
      reader.readAsText(file, 'utf-8');
    });
  }

  // Extract text from PDF in browser using PDF.js
  async extractPdfText(file) {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js library tidak ditemukan. Pastikan js/vendor/pdf.min.js terpasang.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    let fullText = '';

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageString = textContent.items.map(item => item.str).join(' ');
      fullText += `\n--- Halaman ${pageNum} ---\n` + pageString + '\n';
    }

    return {
      name: file.name,
      text: fullText.trim(),
      pages: numPages,
      size: file.size,
      type: 'pdf'
    };
  }

  // Process folder upload list (FileList from <input webkitdirectory>)
  async processFolderUpload(fileList, progressCallback = null) {
    const files = Array.from(fileList).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'txt', 'md', 'json', 'csv'].includes(ext);
    });

    if (files.length === 0) {
      throw new Error('Tidak ada file materi yang didukung (PDF, TXT, MD) di dalam folder yang dipilih.');
    }

    // Determine folder name from path
    let folderName = 'Folder Baru';
    if (files[0].webkitRelativePath) {
      folderName = files[0].webkitRelativePath.split('/')[0] || folderName;
    }

    const processedFiles = [];
    let combinedText = '';
    let totalPages = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: files.length,
          fileName: file.name
        });
      }

      try {
        const extracted = await this.readFile(file);
        processedFiles.push({
          filename: extracted.name,
          type: extracted.type,
          pages: extracted.pages,
          chars: extracted.text.length
        });
        combinedText += `\n\n=== [File: ${extracted.name}] ===\n` + extracted.text;
        totalPages += extracted.pages;
      } catch (err) {
        console.warn(`Gagal memproses file ${file.name}:`, err);
      }
    }

    if (processedFiles.length === 0) {
      throw new Error('Gagal mengekstrak materi dari folder yang dipilih.');
    }

    // Generate module object
    const moduleId = 'mod_upload_' + Date.now();
    const sections = this.extractSectionsFromText(combinedText);
    const words = combinedText.split(/\s+/).filter(Boolean).length;

    const newModule = {
      id: moduleId,
      title: `Koleksi: ${folderName}`,
      subject: folderName,
      icon: '📁',
      color: '#06b6d4',
      source: `Upload Folder: ${folderName}`,
      files: processedFiles,
      wordCount: words,
      charCount: combinedText.length,
      pages: totalPages,
      summary: combinedText.slice(0, 350).replace(/\s+/g, ' ') + '...',
      sections: sections.slice(0, 25),
      fullText: combinedText,
      isActive: true,
      isDefault: false,
      createdAt: Date.now()
    };

    return newModule;
  }

  // Process single or multiple file upload
  async processFilesUpload(fileList, progressCallback = null) {
    const files = Array.from(fileList);
    const newModules = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (progressCallback) {
        progressCallback({
          current: i + 1,
          total: files.length,
          fileName: file.name
        });
      }

      try {
        const extracted = await this.readFile(file);
        const title = extracted.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        const sections = this.extractSectionsFromText(extracted.text);
        const words = extracted.text.split(/\s+/).filter(Boolean).length;

        newModules.push({
          id: 'mod_file_' + Date.now() + '_' + i,
          title: title,
          subject: title,
          icon: extracted.type === 'pdf' ? '📕' : '📄',
          color: extracted.type === 'pdf' ? '#ef4444' : '#3b82f6',
          source: `File: ${extracted.name}`,
          files: [{
            filename: extracted.name,
            type: extracted.type,
            pages: extracted.pages,
            chars: extracted.text.length
          }],
          wordCount: words,
          charCount: extracted.text.length,
          pages: extracted.pages,
          summary: extracted.text.slice(0, 350).replace(/\s+/g, ' ') + '...',
          sections: sections.slice(0, 25),
          fullText: extracted.text,
          isActive: true,
          isDefault: false,
          createdAt: Date.now()
        });
      } catch (err) {
        console.error(`Error loading ${file.name}:`, err);
      }
    }

    return newModules;
  }

  // Extract sections from text
  extractSectionsFromText(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = { title: 'Pendahuluan & Konsep Utama', content: [] };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^(BAB \d+:|[0-9]+\.\s+[A-Z]|BAGIAN \d+:|Halaman \d+|=== File:)/i.test(trimmed) && trimmed.length < 120) {
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
}

window.fileLoader = new FileLoader();
