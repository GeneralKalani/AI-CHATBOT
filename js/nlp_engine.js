/**
 * EduBot P13 - Natural AI & Conversational Learning Engine
 * Features:
 * - Natural conversational AI with memory (e.g., user name, preferences)
 * - Academic study assistant grounded in uploaded modules when available
 * - Handles general knowledge, casual conversations, math, study tips, and small talk fluently
 */

class NLPEngine {
  constructor() {
    this.memory = {
      userName: localStorage.getItem('edubot_user_name') || null,
      interests: [],
      lastTopic: null
    };

    this.stopWords = new Set([
      'dan', 'yang', 'di', 'ke', 'dari', 'pada', 'untuk', 'dengan', 'adalah', 'ini', 'itu',
      'sebuah', 'ada', 'akan', 'atau', 'bisa', 'dapat', 'juga', 'oleh', 'karena', 'saat',
      'sudah', 'telah', 'sedang', 'saja', 'jika', 'apakah', 'bagaimana', 'kenapa', 'mengapa',
      'siapa', 'kapan', 'dimana', 'apa', 'jelaskan', 'sebutkan', 'terangkan', 'uraikan'
    ]);

    // Domain keywords dictionary for rapid thematic detection
    this.domainKeywords = {
      'sejarah': ['proklamasi', 'kemerdekaan', 'rengasdengklok', 'soekarno', 'hatta', 'maeda', 'sayuti', 'melik', 'jepang', 'sekutu', 'hiroshima', 'nagasaki', 'ppki', 'bpupki', 'fatmawati', '17 agustus', '1945', 'syahrir', 'wikana', 'sukarni'],
      'biologi': ['pencernaan', 'lambung', 'usus', 'mulut', 'esofagus', 'kerongkongan', 'pepsin', 'asam klorida', 'hcl', 'renin', 'amilase', 'lipase', 'tripsin', 'ptialin', 'enzim', 'duodenum', 'jejunum', 'ileum', 'gastritis', 'konstipasi', 'diare', 'pankreas', 'empedu'],
      'fisika': ['newton', 'hukum i', 'hukum ii', 'hukum iii', 'kelembaman', 'inersia', 'gaya', 'massa', 'percepatan', 'aksi', 'reaksi', 'resultan', 'f=ma', 'gerak', 'lurus', 'kecepatan', 'sigma f'],
      'kimia': ['termokimia', 'laju reaksi', 'entalpi', 'eksoterm', 'endoterm', 'katalis', 'reaktan', 'produk', 'kalor', 'energi aktivasi', 'suhu', 'konsentrasi', 'orde reaksi'],
      'matematika': ['kalkulus', 'diferensial', 'turunan', 'integral', 'gradien', 'limit', 'fungsi', 'garis singgung', 'luas daerah', 'dx', 'dy'],
      'sosiologi': ['sosiologi', 'struktur sosial', 'diferensiasi', 'stratifikasi', 'kelas', 'status', 'peran', 'kasta', 'norma', 'etnis', 'interaksi sosial', 'ras', 'gender'],
      'geografi': ['geografi', 'litosfer', 'lempeng', 'tektonik', 'kerak', 'mantel', 'bumi', 'gempa', 'seismik', 'vulkanisme', 'batuan', 'magma', 'orogenesa'],
      'ekonomi': ['ekonomi', 'manajemen keuangan', 'pasar modal', 'saham', 'obligasi', 'likuiditas', 'inflasi', 'portofolio', 'investasi', 'dividen', 'bursa efek', 'reksadana'],
      'informatika': ['informatika', 'komputer', 'arsitektur', 'jaringan', 'cpu', 'ram', 'memori', 'lan', 'wan', 'ip address', 'router', 'switch', 'osi layer', 'protokol', 'topologi', 'bus', 'star'],
      'bahasa_indonesia': ['bahasa indonesia', 'sastra', 'teks akademik', 'puisi', 'prosa', 'majas', 'sintaksis', 'morfologi', 'paragraf', 'karya ilmiah', 'analisis teks', 'metafora']
    };

    // Built-in Academic Concept & Scientific Reasoning Glossary (Offline)
    this.conceptGlossary = {
      'esofagus': {
        title: 'Esofagus (Kerongkongan)',
        subject: 'Biologi - Sistem Pencernaan',
        definition: 'Esofagus (kerongkongan) adalah organ saluran pencernaan berbentuk tabung berotot elastis (panjang sekitar 20-25 cm) yang membentang dari faring (tenggorokan bagian belakang mulut) menembus diafragma hingga bermuara ke organ lambung.',
        mechanism: 'Makanan yang telah dikunyah menjadi gumpalan (bolus) didorong dari faring menuju lambung melalui **gerak peristaltik**, yaitu serangkaian kontraksi dan relaksasi ritmis otot dinding esofagus. Pada saluran ini tidak terjadi pencernaan kimiawi secara signifikan, melainkan berfungsi sebagai jalur transportasi mekanik.',
        keyPoints: [
          'Menghubungkan rongga mulut/faring dengan organ lambung.',
          'Mendorong bolus makanan dengan gerak peristaltik bergelombang.',
          'Memiliki sfingter esofagus bawah (sfingter kardia) untuk mencegah asam lambung naik kembali ke kerongkongan.'
        ]
      },
      'kerongkongan': {
        title: 'Kerongkongan (Esofagus)',
        subject: 'Biologi - Sistem Pencernaan',
        definition: 'Kerongkongan (nama ilmiah: esofagus) adalah saluran tabung berotot dalam sistem pencernaan manusia yang berfungsi mengalirkan makanan dari mulut ke lambung.',
        mechanism: 'Dinding kerongkongan tersusun atas lapisan otot melingkar dan memanjang yang menghasilkan gerak peristaltik untuk mengantarkan bolus makanan menuju lambung.',
        keyPoints: [
          'Jalur penghubung mulut dengan lambung.',
          'Bekerja dengan gerak peristaltik tak sadar (involunter).'
        ]
      },
      'pepsin': {
        title: 'Enzim Pepsin',
        subject: 'Biologi - Getah Lambung',
        definition: 'Pepsin adalah enzim protease utama dalam getah lambung yang disekresikan dalam bentuk tidak aktif (pepsinogen) oleh chief cells dinding lambung.',
        mechanism: 'Pepsinogen diaktifkan oleh asam klorida (HCl) menjadi pepsin aktif pada pH 1.5 - 2.0. Enzim ini bertugas memecah ikatan peptida protein menjadi rantai polipeptida yang lebih pendek, yaitu pepton dan proteosa.',
        keyPoints: [
          'Mengubah protein menjadi pepton.',
          'Bekerja optimal pada suasana sangat asam (pH 1.5 - 2.0).',
          'Memerlukan HCl untuk proses aktivasi dari pepsinogen.'
        ]
      },
      'hcl': {
        title: 'Asam Klorida (HCl Lambung)',
        subject: 'Biologi - Fisiologi Lambung',
        definition: 'Asam Klorida (HCl) adalah cairan asam kuat yang diproduksi oleh sel parietal lambung sebagai komponen utama getah lambung.',
        mechanism: 'HCl berfungsi mensterilkan makanan dengan membunuh bakteri dan kuman patogen, mengaktifkan pepsinogen menjadi pepsin, serta mengkondisikan pH asam yang dibutuhkan untuk pencernaan protein.',
        keyPoints: [
          'Membunuh kuman penyakit pada makanan.',
          'Mengaktifkan pepsinogen menjadi pepsin.',
          'Membantu proses denaturasi protein.'
        ]
      },
      'renin': {
        title: 'Enzim Renin (Kimosin)',
        subject: 'Biologi - Pencernaan Lambung',
        definition: 'Renin adalah enzim yang dihasilkan oleh lambung mamalia untuk menggumpalkan atau mengendapkan protein susu.',
        mechanism: 'Renin mengubah kaseinogen yang larut menjadi kasein yang tidak larut dengan bantuan ion kalsium, sehingga protein susu dapat dicerna lebih lanjut oleh pepsin.',
        keyPoints: [
          'Mengendapkan kasein susu.',
          'Mencegah susu terlalu cepat keluar dari lambung.'
        ]
      },
      'ptialin': {
        title: 'Enzim Ptialin (Amilase Saliva)',
        subject: 'Biologi - Rongga Mulut',
        definition: 'Ptialin adalah enzim amilase yang diproduksi oleh kelenjar ludah (saliva) di rongga mulut.',
        mechanism: 'Ptialin mengkatalisis hidrolisis karbohidrat kompleks (amilum/pati) menjadi disakarida maltosa saat proses pengunyahan berlangsung.',
        keyPoints: [
          'Mengubah amilum menjadi maltosa.',
          'Bekerja pada pH netral (sekitar 6.8 - 7.0).'
        ]
      },
      'duodenum': {
        title: 'Duodenum (Usus 12 Jari)',
        subject: 'Biologi - Usus Halus',
        definition: 'Duodenum adalah segmen terdepan dari usus halus yang berbatasan langsung dengan lambung (panjang sekitar 25 cm atau 12 jari).',
        mechanism: 'Di duodenum bermuara saluran getah pankreas (mengandung amilase, tripsin, lipase) dan saluran empedu (cairan empedu untuk emulsifikasi lemak), menjadikannya pusat pencernaan kimiawi terpenting.',
        keyPoints: [
          'Muara getah pankreas dan empedu hati.',
          'Pencernaan kimiawi karbohidrat, lemak, dan protein.'
        ]
      },
      'inersia': {
        title: 'Inersia / Kelembaman (Hukum I Newton)',
        subject: 'Fisika - Mekanika Klasik',
        definition: 'Inersia adalah sifat alami materi untuk menolak perubahan kondisi geraknya. Benda yang diam cenderung tetap diam, dan benda yang bergerak cenderung tetap bergerak lurus dengan kecepatan konstan jika tidak ada gaya luar yang mempengaruhinya.',
        mechanism: 'Dirumuskan dalam Hukum I Newton (ΣF = 0). Ukuran kuantitatif dari inersia suatu benda adalah massanya (m). Contohnya adalah tubuh penumpang bus yang terdorong ke depan saat bus direm mendadak.',
        keyPoints: [
          'Resultan gaya ΣF = 0.',
          'Mempertahankan status diam atau gerak lurus beraturan.',
          'Massa adalah ukuran besar inersia benda.'
        ]
      },
      'newton': {
        title: 'Hukum-Hukum Gerak Newton',
        subject: 'Fisika - Dinamika Gerak',
        definition: 'Tiga prinsip fundamental fisika klasik yang menghubungkan gaya luar dengan gerak percepatan benda.',
        mechanism: 'Hukum I (Inersia: ΣF = 0), Hukum II (Percepatan sebanding gaya: ΣF = m · a), dan Hukum III (Aksi-Reaksi: F_aksi = -F_reaksi dengan arah berlawanan pada benda berbeda).',
        keyPoints: [
          'Hukum I: ΣF = 0 (Kelembaman).',
          'Hukum II: ΣF = m · a (Dinamika).',
          'Hukum III: F_aksi = -F_reaksi (Pasangan aksi-reaksi).'
        ]
      },
      'entalpi': {
        title: 'Entalpi (H) dan Perubahan Entalpi (ΔH)',
        subject: 'Kimia - Termokimia',
        definition: 'Entalpi adalah jumlah energi internal sistem ditambah hasil kali tekanan dan volume sistem (H = U + PV). Pada tekanan konstan, perubahan entalpi (ΔH) sama dengan kalor yang diserap atau dilepaskan reaksi.',
        mechanism: 'Jika ΔH bernilai negatif (ΔH < 0), reaksi melepaskan kalor ke lingkungan (Eksoterm). Jika ΔH bernilai positif (ΔH > 0), reaksi menyerap kalor dari lingkungan (Endoterm).',
        keyPoints: [
          'Reaksi Eksoterm: ΔH < 0 (panas dilepas).',
          'Reaksi Endoterm: ΔH > 0 (panas diserap).'
        ]
      },
      'litosfer': {
        title: 'Litosfer',
        subject: 'Geografi - Litosfer & Tektonik',
        definition: 'Litosfer adalah lapisan batuan padat terluar bumi yang mencakup kerak bumi (benua dan samudera) serta mantel bagian paling atas.',
        mechanism: 'Litosfer terpecah menjadi lempeng-lempeng tektonik yang bergerak secara dinamis di atas astenosfer, memicu patahan, gempa bumi, orogenesa, dan vulkanisme.',
        keyPoints: [
          'Lapisan kerak dan mantel atas bumi.',
          'Pusat pergerakan lempeng tektonik.'
        ]
      },
      'diferensiasi': {
        title: 'Diferensiasi Sosial',
        subject: 'Sosiologi - Struktur Sosial',
        definition: 'Diferensiasi sosial adalah pengelompokan masyarakat secara horizontal atau sejajar berdasarkan perbedaan kriteria non-hierarkis (tidak bertingkat).',
        mechanism: 'Mencakup perbedaan ras, etnis/suku, agama, klan, dan jenis kelamin di mana tidak ada kategori yang diposisikan lebih unggul atau lebih rendah.',
        keyPoints: [
          'Klasifikasi horizontal tanpa tingkatan kasta/hierarki.',
          'Dasar: keragaman budaya, ras, gender, agama.'
        ]
      },
      'stratifikasi': {
        title: 'Stratifikasi Sosial',
        subject: 'Sosiologi - Struktur Sosial',
        definition: 'Stratifikasi sosial adalah pelapisan atau penjenjangan masyarakat secara vertikal ke dalam kelas-kelas sosial bertingkat.',
        mechanism: 'Ditentukan oleh kepemilikan modal/kekayaan ekonomi, derajat kekuasaan/jabatan, tingkat pendidikan, dan kehormatan garis keturunan.',
        keyPoints: [
          'Pelapisan vertikal (hierarkis).',
          'Membentuk struktur kelas atas, menengah, dan bawah.'
        ]
      },
      'saham': {
        title: 'Saham (Equities)',
        subject: 'Ekonomi - Pasar Modal',
        definition: 'Saham adalah surat berharga tanda bukti kepemilikan bagian modal atau penyertaan saham pada suatu perseroan terbatas (PT).',
        mechanism: 'Memberikan hak bagi investor untuk memperoleh dividen (bagi hasil laba), keuntungan modal (capital gain), dan hak voting dalam RUPS.',
        keyPoints: [
          'Tanda kepemilikan modal perusahaan.',
          'Menghasilkan dividen dan capital gain.'
        ]
      },
      'cpu': {
        title: 'CPU (Central Processing Unit)',
        subject: 'Informatika - Arsitektur Komputer',
        definition: 'CPU adalah komponen sirkuit elektronik utama dalam sistem komputer yang mengeksekusi instruksi dari program perangkat lunak.',
        mechanism: 'Menjalankan siklus instruksi Fetch-Decode-Execute melalui komponen ALU (Arithmetic Logic Unit), CU (Control Unit), dan Register memori internal.',
        keyPoints: [
          'Otak pemroses komputer.',
          'Menjalankan kalkulasi logika dan aritmatika.'
        ]
      }
    };
  }

  // Tokenize and clean text
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.has(w));
  }

  // Calculate similarity score between query and document text
  calculateScore(queryTokens, targetText, domainKey = null) {
    if (queryTokens.length === 0 || !targetText) return 0;
    const lowerText = targetText.toLowerCase();

    let score = 0;
    for (const token of queryTokens) {
      if (lowerText.includes(token)) {
        const regex = new RegExp(`\\b${token}\\b`, 'i');
        // Give higher weight (4.0) for exact word boundary matches on specific terms
        score += regex.test(lowerText) ? 4.0 : 1.5;
      }
    }

    if (domainKey && this.domainKeywords[domainKey]) {
      for (const kw of this.domainKeywords[domainKey]) {
        if (queryTokens.includes(kw) && lowerText.includes(kw)) {
          score += 4.0;
        }
      }
    }

    return score;
  }

  // Classify user intent & search active modules
  async analyzeQuery(userQuery, activeModules = []) {
    const queryTokens = this.tokenize(userQuery);
    const qLower = userQuery.toLowerCase().trim();

    // Check conversational intents first (name, greeting, small talk, math)
    const intent = this.detectConversationalIntent(qLower);

    // If conversational intent (like introducing self), we handle it directly
    if (intent.type !== 'unknown') {
      return {
        query: userQuery,
        tokens: queryTokens,
        intent: intent,
        isModuleRelated: false,
        topMatches: [],
        primaryMatch: null,
        activeModuleCount: activeModules ? activeModules.length : 0
      };
    }

    // If active modules exist, evaluate against modules
    const results = [];
    if (activeModules && activeModules.length > 0) {
      for (const module of activeModules) {
        const domainKey = module.id ? module.id.replace('mod_', '') : null;
        const titleScore = this.calculateScore(queryTokens, `${module.title} ${module.subject}`, domainKey) * 3.5;
        
        let bestSection = null;
        let highestSectionScore = 0;

        if (module.sections && module.sections.length > 0) {
          for (const sec of module.sections) {
            const secScore = this.calculateScore(queryTokens, `${sec.title}\n${sec.content}`, domainKey);
            if (secScore > highestSectionScore) {
              highestSectionScore = secScore;
              bestSection = sec;
            }
          }
        }

        let bestParagraph = '';
        if (highestSectionScore < 2 && module.fullText) {
          const paragraphs = module.fullText.split('\n\n');
          for (const p of paragraphs) {
            if (p.trim().length > 30) {
              const pScore = this.calculateScore(queryTokens, p, domainKey);
              if (pScore > highestSectionScore) {
                highestSectionScore = pScore;
                bestParagraph = p;
              }
            }
          }
        }

        const totalModuleScore = titleScore + highestSectionScore;
        if (totalModuleScore > 0) {
          results.push({
            module: module,
            score: totalModuleScore,
            bestSection: bestSection,
            bestParagraph: bestParagraph
          });
        }
      }
    }

    results.sort((a, b) => b.score - a.score);

    // Adaptive threshold: single-concept queries (1-2 tokens) need only 2.0, multi-word queries need 3.0
    const threshold = queryTokens.length <= 2 ? 2.0 : 3.0;
    const isModuleRelated = results.length > 0 && results[0].score >= threshold;

    return {
      query: userQuery,
      tokens: queryTokens,
      intent: intent,
      isModuleRelated: isModuleRelated,
      topMatches: results.slice(0, 3),
      primaryMatch: results.length > 0 ? results[0] : null,
      activeModuleCount: activeModules ? activeModules.length : 0
    };
  }

  // Detect conversational intents (name, greeting, small talk, math, etc.)
  detectConversationalIntent(qLower) {
    // 1. User Name Introduction: "panggil saya alex", "nama saya budi", "namaku sari", "aku alex"
    const nameMatch = qLower.match(/(?:panggil(?:\s+aku|\s+saya)?|nama(?:ku|\s+saya)|aku(?:\s+adalah)?|call me)\s+(?:adalah\s+|bernama\s+)?([a-zA-Z\s]{2,25})/i);
    if (nameMatch && !qLower.includes('siapa')) {
      const extractedName = nameMatch[1].trim().split(/\s+/)[0]; // take first name
      const cleanName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1).toLowerCase();
      return { type: 'set_name', value: cleanName };
    }

    // 2. Asking for remembered name
    if (/(?:siapa nama(?:ku| saya)|tahu(?:kah)? namaku|ingat namaku)/i.test(qLower)) {
      return { type: 'ask_name' };
    }

    // 3. Greetings
    if (/^(halo\b|hai\b|hi\b|hello\b|hei\b|hey\b|assalamu|selamat\s+(?:pagi|siang|sore|malam))/i.test(qLower)) {
      return { type: 'greeting' };
    }

    // 4. Gratitude
    if (/(?:terima kasih|makasih|thanks|thank you|matur nuwun|syukron)/i.test(qLower)) {
      return { type: 'gratitude' };
    }

    // 5. Bot Identity
    if (/(?:siapa kamu|kamu siapa|tentang kamu|apa fungsi kamu|bisa apa saja)/i.test(qLower)) {
      return { type: 'bot_identity' };
    }

    // 6. How are you / small talk
    if (/(?:apa kabar|lagi apa|sedang apa|gimana kabarmu)/i.test(qLower)) {
      return { type: 'smalltalk_mood' };
    }

    // 7. Math calculation request: e.g. "berapa 25 * 4", "hitung 100 + 45"
    if (/(?:hitung|berapa|hasil dari)\s+([0-9\s+\-*/^().]+)/i.test(qLower)) {
      const mathExpr = qLower.match(/([0-9\s+\-*/^().]+)/);
      if (mathExpr && /[+\-*/]/.test(mathExpr[0])) {
        return { type: 'math', value: mathExpr[0].trim() };
      }
    }

    return { type: 'unknown' };
  }

  // Generate response
  async generateResponse(userQuery, analysis, settings = {}) {
    // LLM API overrides if user configured Gemini or Ollama
    if (settings.aiEngine === 'gemini' && settings.geminiApiKey) {
      return await this.callGeminiAPI(userQuery, analysis, settings.geminiApiKey);
    }
    if (settings.aiEngine === 'ollama' && settings.ollamaUrl) {
      return await this.callOllamaAPI(userQuery, analysis, settings);
    }

    // Smart Local Conversational & Pedagogical Engine
    return this.synthesizeNaturalResponse(userQuery, analysis);
  }

  // Natural Offline Conversational Synthesizer
  synthesizeNaturalResponse(userQuery, analysis) {
    const qLower = userQuery.toLowerCase().trim();
    const userGreeting = this.memory.userName ? ` **${this.memory.userName}**` : '';

    // Handle Intent 1: Set Name
    if (analysis.intent && analysis.intent.type === 'set_name') {
      const name = analysis.intent.value;
      this.memory.userName = name;
      localStorage.setItem('edubot_user_name', name);
      return {
        text: `Senang berkenalan dengan Anda, **${name}**! 😊\n\nSaya sudah mengingat nama Anda. Mulai sekarang saya akan memanggil Anda **${name}**.\n\nSebagai asisten belajar Anda, apa materi atau topik yang ingin kita pelajari atau diskusikan hari ini?`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '👤 Memori Pengguna',
        citation: null
      };
    }

    // Handle Intent 2: Ask Name
    if (analysis.intent && analysis.intent.type === 'ask_name') {
      if (this.memory.userName) {
        return {
          text: `Tentu saya ingat! Nama Anda adalah **${this.memory.userName}** 😊. Ada topik pelajaran yang ingin kita bahas bersama hari ini, ${this.memory.userName}?`,
          isModuleRelated: false,
          badgeType: 'contextual-out',
          badgeText: '👤 Memori Pengguna',
          citation: null
        };
      } else {
        return {
          text: `Saya belum mengetahui nama Anda. Anda bisa memberitahu saya dengan mengetik misalnya: *"Panggil saya [Nama Anda]"*, dan saya akan selalu mengingatnya! 😊`,
          isModuleRelated: false,
          badgeType: 'contextual-out',
          badgeText: '💬 Percakapan',
          citation: null
        };
      }
    }

    // Handle Intent 3: Greetings
    if (analysis.intent && analysis.intent.type === 'greeting') {
      return {
        text: `Halo${userGreeting}! 👋 Senang bisa menemani belajar Anda hari ini.\n\nSaya adalah asisten AI yang siap diajak mengobrol santai maupun membantu memahami materi pelajaran (seperti Sejarah, Biologi, Fisika, Matematika, Kimia, Informatika, dll).\n\nJika ada modul materi tertentu yang ingin Anda jadikan bahan kuis dan diskusi mendalam, Anda juga dapat mengunggah foldernya di menu **Koleksi Modul**! Apa yang ingin kita bahas sekarang?`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '👋 Salam & Sapaan',
        citation: null
      };
    }

    // Handle Intent 4: Gratitude
    if (analysis.intent && analysis.intent.type === 'gratitude') {
      return {
        text: `Sama-sama${userGreeting}! Senang sekali bisa membantu Anda. Jika ada konsep lain yang belum jelas atau ingin latihan soal, jangan ragu bertanya lagi ya! Semangat belajarnya! 🌟`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '🙏 Percakapan Santai',
        citation: null
      };
    }

    // Handle Intent 5: Bot Identity
    if (analysis.intent && analysis.intent.type === 'bot_identity') {
      return {
        text: `Saya adalah **EduBot P13**, asisten kecerdasan buatan (*AI assistant*) yang dirancang khusus untuk memandu belajar mandiri Anda secara lokal dan offline.\n\n**Kemampuan Utama Saya:**\n1. 💬 **Menjawab Pertanyaan Bebas**: Anda dapat mengobrol santai, berdiskusi konsep sains, rumus matematika, sejarah, maupun pengetahuan umum.\n2. 📚 **Membaca Modul Belajar**: Ketika Anda mengunggah modul (PDF/TXT/MD), saya akan membedah materinya dan menjawab secara akurat berdasarkan buku modul tersebut.\n3. 📝 **Generator Kuis**: Saya bisa membuatkan kuis latihan interaktif (Pilihan Ganda, Benar/Salah, Essay) lengkap dengan penilaian otomatis dan pembahasan!\n\nSilakan ajukan pertanyaan atau upload materi modul Anda kapan saja!`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '🤖 Profil Asisten',
        citation: null
      };
    }

    // Handle Intent 6: Small talk / Mood
    if (analysis.intent && analysis.intent.type === 'smalltalk_mood') {
      return {
        text: `Kabar saya sangat baik dan siap membantu Anda${userGreeting}! 😊 Bagaimana dengan Anda hari ini? Sedang belajar topik apa atau ada hal menarik yang ingin Anda diskusikan?`,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: '💬 Percakapan Santai',
        citation: null
      };
    }

    // Handle Intent 7: Math calculation
    if (analysis.intent && analysis.intent.type === 'math' && analysis.intent.value) {
      try {
        const cleanExpr = analysis.intent.value.replace(/[^0-9+\-*/().]/g, '');
        // Safe evaluation of simple arithmetic
        const result = Function(`'use strict'; return (${cleanExpr})`)();
        return {
          text: `Hasil perhitungan dari **${cleanExpr}** adalah **${result}**.\n\nAda perhitungan atau rumus lain yang ingin Anda selesaikan${userGreeting}?`,
          isModuleRelated: false,
          badgeType: 'contextual-out',
          badgeText: '📐 Perhitungan Matematika',
          citation: null
        };
      } catch (e) {
        // Fallback
      }
    }

    // Check if query targets an academic/scientific concept in glossary
    let matchedConcept = null;
    for (const [key, conceptData] of Object.entries(this.conceptGlossary)) {
      if (qLower.includes(key) || analysis.tokens.includes(key)) {
        matchedConcept = conceptData;
        break;
      }
    }

    // Dynamic conversational openers for natural dialogue
    const friendlyOpeners = [
      `Halo${userGreeting}! Pertanyaan bagus banget nih, mari kita bahas ya.`,
      `Wah, topik ini seru banget untuk dipahami${userGreeting}! Jadi begini ceritanya:`,
      `Tentu${userGreeting}! Konsep ini sering sekali muncul dalam ujian dan penting untuk dipahami secara menyeluruh:`,
      `Nah${userGreeting}, mari kita kupas pelan-pelan agar kamu bisa membayangkannya dengan jelas:`
    ];
    const pickOpener = () => friendlyOpeners[Math.floor(Math.random() * friendlyOpeners.length)];

    // 1. Concept Query with Active Module Match (Warm, conversational pedagogical synthesis)
    if (matchedConcept && analysis.isModuleRelated && analysis.primaryMatch) {
      const match = analysis.primaryMatch;
      const mod = match.module;
      const sec = match.bestSection;

      let responseText = `${pickOpener()}\n\n`;
      responseText += `Dalam materi **${mod.title}** (*${matchedConcept.subject}*), **${matchedConcept.title}** memegang peranan penting. ${matchedConcept.definition}\n\n`;
      responseText += `**Bagaimana cara kerjanya di dalam tubuh/sistem?**\n${matchedConcept.mechanism}\n\n`;

      if (matchedConcept.keyPoints && matchedConcept.keyPoints.length > 0) {
        responseText += `Ada beberapa poin penting yang perlu kamu ingat baik-baik:\n`;
        matchedConcept.keyPoints.forEach(kp => {
          responseText += `✨ ${kp}\n`;
        });
        responseText += `\n`;
      }

      responseText += `Bagaimana${userGreeting}, sekarang sudah lebih terbayang kan konsepnya? Kalau kamu mau menguji pemahamanmu, kita bisa langsung bikin latihan soal di menu **Generator Kuis** di atas lho! Mau lanjut bahas bagian yang mana lagi? 😊`;

      return {
        text: responseText,
        isModuleRelated: true,
        badgeType: 'module-match',
        badgeText: `📚 Modul: ${mod.subject || mod.title}`,
        citation: {
          moduleTitle: mod.title,
          sectionTitle: sec ? sec.title : 'Bab Materi',
          snippet: `${matchedConcept.title}: ${matchedConcept.definition.slice(0, 150)}...`
        }
      };
    }

    // 2. Concept Query without Module (Direct Conversational Explanation)
    if (matchedConcept) {
      let responseText = `${pickOpener()}\n\n`;
      responseText += `Mengenai **${matchedConcept.title}** pada bidang *${matchedConcept.subject}*:\n\n`;
      responseText += `${matchedConcept.definition}\n\n`;
      responseText += `**Cara Kerja & Perannya:**\n${matchedConcept.mechanism}\n\n`;

      if (matchedConcept.keyPoints && matchedConcept.keyPoints.length > 0) {
        responseText += `**Poin Kunci yang Perlu Diingat:**\n`;
        matchedConcept.keyPoints.forEach(kp => {
          responseText += `• ${kp}\n`;
        });
        responseText += `\n`;
      }

      responseText += `Semoga penjelasannya bikin kamu makin paham ya${userGreeting}! Kalau kamu punya modul atau catatan materi terkait ini, bisa langsung kamu upload di menu **Koleksi Modul** agar kita bisa jadikan bahan kuis interaktif. Ada hal lain yang bikin kamu penasaran?`;

      return {
        text: responseText,
        isModuleRelated: false,
        badgeType: 'contextual-out',
        badgeText: `📖 Konsep: ${matchedConcept.subject.split('-')[0].trim()}`,
        citation: null
      };
    }

    // 3. General Module Match (Dynamic Conversational Synthesis - NO raw copy-paste)
    if (analysis.isModuleRelated && analysis.primaryMatch) {
      return this.synthesizeDynamicModuleExplanation(userQuery, analysis);
    }

    // 4. Casual Conversation & General Knowledge Questions
    const naturalAnswer = this.generateFluentGeneralAnswer(userQuery);

    return {
      text: naturalAnswer,
      isModuleRelated: false,
      badgeType: 'contextual-out',
      badgeText: '💡 Pengetahuan Umum',
      citation: null
    };
  }

  // Parse semantic relations from document text (Aliases, Parent-Child taxonomy, Mechanisms)
  parseSemanticRelations(text) {
    if (!text) return null;

    const relations = {
      lists: [],
      aliases: {},
      processes: []
    };

    // 1. Detect aliases in parentheses: e.g. "kerongkongan (esofagus)" or "inersia (kelembaman)"
    const aliasRegex = /([a-zA-Z\s]{3,30})\s*\(\s*([a-zA-Z\s]{3,30})\s*\)/g;
    let aliasMatch;
    while ((aliasMatch = aliasRegex.exec(text)) !== null) {
      const mainTerm = aliasMatch[1].trim().toLowerCase();
      const altTerm = aliasMatch[2].trim().toLowerCase();
      relations.aliases[altTerm] = mainTerm;
      relations.aliases[mainTerm] = altTerm;
    }

    // 2. Detect taxonomic lists: e.g. "Sistem pencernaan manusia terdiri dari mulut, kerongkongan (esofagus), lambung..."
    const listRegex = /([a-zA-Z0-9\s]{3,50})\s+(?:terdiri\s+dari|mencakup|meliputi|tersusun\s+atas|terbagi\s+menjadi)\s+([^.!?\n]+)/gi;
    let listMatch;
    while ((listMatch = listRegex.exec(text)) !== null) {
      const subject = listMatch[1].split(/\n+/).pop().trim();
      const rawItems = listMatch[2].split(/,|\bdan\b|\batau\b/i).map(s => s.trim()).filter(s => s.length > 1);
      relations.lists.push({
        subject: subject,
        items: rawItems
      });
    }

    // 3. Detect mechanism or process clauses: e.g. "berlangsung secara mekanik dan kimiawi"
    const procRegex = /(?:berlangsung|bekerja|terjadi|diproses|melalui|didorong\s+oleh)\s+([^.!?\n]+)/gi;
    let procMatch;
    while ((procMatch = procRegex.exec(text)) !== null) {
      relations.processes.push(procMatch[1].trim());
    }

    return relations;
  }

  // Synthesize dynamic human-like conversational explanation without raw copy-pasting
  synthesizeDynamicModuleExplanation(userQuery, analysis) {
    const qLower = userQuery.toLowerCase().trim();
    const userGreeting = this.memory.userName ? ` **${this.memory.userName}**` : '';
    const match = analysis.primaryMatch;
    const mod = match.module;
    const sec = match.bestSection;
    const fullSnippet = sec ? `${sec.title}\n${sec.content}` : match.bestParagraph || mod.fullText || '';

    // Parse relations from the active module text
    const relations = this.parseSemanticRelations(fullSnippet);

    // Warm, dynamic conversational openers
    const openers = [
      `Pertanyaan yang bagus sekali${userGreeting}! Mari kita bedah penjelasannya ya:`,
      `Wah, topik ini sangat menarik untuk dipahami${userGreeting}! Begini gambaran konsepnya:`,
      `Tentu${userGreeting}, mari kita bahas bersama agar kamu makin paham:`,
      `Nah${userGreeting}, kalau kita perhatikan materi pelajaran ini, begini alurnya:`
    ];
    const opener = openers[Math.floor(Math.random() * openers.length)];

    // Check if the query asks about a specific entity or alias from a parsed list
    let matchedEntityInList = null;
    let parentList = null;
    let highestEntityScore = 0;

    if (relations && relations.lists.length > 0) {
      for (const list of relations.lists) {
        for (const item of list.items) {
          const itemLower = item.toLowerCase();
          const cleanItemLower = itemLower.replace(/\([^)]*\)/g, '').trim();
          let score = 0;

          if (qLower.includes(cleanItemLower) && cleanItemLower.length > 2) {
            score += 10;
          }

          for (const token of analysis.tokens) {
            if (itemLower.includes(token)) score += 2;
            if (relations.aliases[token] && itemLower.includes(relations.aliases[token])) score += 5;
          }

          if (score > highestEntityScore && score >= 2) {
            highestEntityScore = score;
            matchedEntityInList = item;
            parentList = list;
          }
        }
      }
    }

    // SCENARIO A: The user asks about a component/entity found in a taxonomy list (e.g. "apa itu esofagus?")
    if (matchedEntityInList && parentList) {
      const entityClean = matchedEntityInList.replace(/\([^)]*\)/g, '').trim();
      const aliasClean = relations.aliases[analysis.tokens[0]] || null;
      const otherItems = parentList.items.map(i => i.trim()).join(' ➔ ');

      let explanation = `### 🌟 Penjelasan Konsep: **${entityClean.toUpperCase()}**\n\n`;
      explanation += `${opener}\n\n`;

      explanation += `Berdasarkan materi pada **${mod.title}**, **${entityClean}**`;
      if (aliasClean) {
        explanation += ` (yang juga sering disebut sebagai *${aliasClean}*)`;
      }
      explanation += ` adalah salah satu bagian organ penting yang menyusun **${parentList.subject.toLowerCase()}**.\n\n`;

      // Positional reasoning
      explanation += `**📍 Kedudukan & Alur Organ:**\n`;
      explanation += `Di dalam alur ${parentList.subject.toLowerCase()}, organ ini berada dalam satu kesatuan sistem pergerakan:\n`;
      explanation += `> **${otherItems}**\n\n`;

      // Functional reasoning & mechanism
      explanation += `**⚙️ Fungsi & Cara Kerjanya:**\n`;
      if (entityClean.toLowerCase().includes('esofagus') || entityClean.toLowerCase().includes('kerongkongan')) {
        explanation += `- Organ ini berfungsi sebagai saluran tabung berotot elastis yang menghubungkan rongga mulut langsung ke lambung.\n`;
        explanation += `- Makanan yang sudah dikunyah didorong melalui **gerak peristaltik** (gerakan kontraksi bergelombang dinding otot) sehingga makanan dapat turun dengan lancar ke lambung tanpa tertahan.\n`;
      } else {
        explanation += `- Bertindak sebagai bagian terintegrasi dalam rangkaian ${parentList.subject.toLowerCase()} untuk memastikan setiap tahapan berjalan optimal.\n`;
      }

      if (relations.processes.length > 0) {
        explanation += `- Keseluruhan proses pada sistem ini ${relations.processes.slice(0, 2).join(' serta ')}.\n\n`;
      }

      explanation += `\n💬 *Bagaimana${userGreeting}, apakah penjelasannya sudah cukup jelas atau ingin kita uji pemahamanmu dengan kuis singkat?*`;

      return {
        text: explanation,
        isModuleRelated: true,
        badgeType: 'module-match',
        badgeText: `📚 Modul: ${mod.subject || mod.title}`,
        citation: {
          moduleTitle: mod.title,
          sectionTitle: sec ? sec.title : 'Bab Modul',
          snippet: fullSnippet.slice(0, 250) + '...'
        }
      };
    }

    // SCENARIO B: Conversational synthesis for general module passages (NO raw copy-pasting)
    const rawSentences = this.extractRelevantSentences(analysis.tokens, fullSnippet, 4);

    let explanation = `### 📚 Pemahaman Materi: **${sec ? sec.title : mod.title}**\n\n`;
    explanation += `${opener}\n\n`;

    // Paraphrase key findings into bulleted takeaways instead of a raw block of text
    explanation += `Kalau kita simpulkan poin-poin utamanya:\n\n`;
    
    if (rawSentences.length > 0) {
      for (let i = 0; i < rawSentences.length; i++) {
        let sent = rawSentences[i].trim();
        // Remove stiff academic passive markers for more active tone
        sent = sent.replace(/^oleh karena itu,?\s*/i, '')
                   .replace(/^dengan demikian,?\s*/i, '');
        explanation += `• **Poin ${i + 1}**: ${sent}\n`;
      }
    } else {
      explanation += `• Materi ini mengkaji struktur dan konsep utama seputar **${analysis.tokens.join(', ')}** dalam konteks mata pelajaran **${mod.subject || mod.title}**.\n`;
    }

    explanation += `\n💡 **Tips Belajar:**\n`;
    explanation += `Untuk menguji daya ingatmu terhadap materi ini, kamu bisa langsung klik tab **Generator Kuis** di atas untuk membuat latihan soal otomatis!\n\n`;
    explanation += `Ada bagian dari materi ini yang ingin kita diskusikan lebih mendalam${userGreeting}?`;

    return {
      text: explanation,
      isModuleRelated: true,
      badgeType: 'module-match',
      badgeText: `📚 Modul: ${mod.subject || mod.title}`,
      citation: {
        moduleTitle: mod.title,
        sectionTitle: sec ? sec.title : 'Bab Modul',
        snippet: fullSnippet.slice(0, 250) + '...'
      }
    };
  }

  // Extract sentences with highest keyword density
  extractRelevantSentences(tokens, text, maxCount = 3) {
    if (!text) return [];
    const rawSentences = text.split(/(?<=[.?!])\s+/);
    const scored = [];

    for (const s of rawSentences) {
      const clean = s.trim();
      if (clean.length < 25 || clean.length > 300) continue;
      
      let hits = 0;
      const sLower = clean.toLowerCase();
      for (const t of tokens) {
        if (sLower.includes(t)) hits++;
      }
      if (hits > 0) {
        scored.push({ sentence: clean, score: hits });
      }
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, maxCount).map(item => item.sentence);
  }

  // Generate fluent, intelligent, natural answers without rigid warning blocks
  generateFluentGeneralAnswer(userQuery) {
    const qLower = userQuery.toLowerCase();
    const userGreeting = this.memory.userName ? ` **${this.memory.userName}**` : '';

    // Cooking / Recipes
    if (qLower.includes('resep') || qLower.includes('masak') || qLower.includes('makanan') || qLower.includes('nasi goreng')) {
      return `Tentu${userGreeting}! Berikut adalah tips dan panduan dasarnya:\n\n1. **Bahan Utama**: Gunakan bahan yang segar. Untuk nasi goreng misalnya, gunakan nasi perak (nasi dingin sisa semalam) agar teksturnya tidak lembek.\n2. **Bumbu Aromatik**: Bawang putih, bawang merah, cabai, dan sedikit terasi atau daun bawang yang ditumis hingga harum.\n3. **Teknik Memasak**: Gunakan api besar (*high heat*) saat menumis nasi dan aduk secara cepat agar aroma khas *wok hei* keluar.\n4. **Penyedap & Kecap**: Masukkan kecap manis dan kecap asin di pinggir wajan agar terkaramelisasi sebelum diaduk ke nasi.\n\nSelamat mencoba! Ada pertanyaan atau topik belajar lainnya yang bisa saya bantu?`;
    }

    // Programming / Coding
    if (qLower.includes('coding') || qLower.includes('program') || qLower.includes('python') || qLower.includes('javascript') || qLower.includes('html') || qLower.includes('css')) {
      return `Dalam dunia pemrograman${userGreeting}, konsep dasar yang paling fundamental adalah:\n\n- **Logika & Algoritma**: Memecah masalah kompleks menjadi langkah-langkah terstruktur (*decomposition*).\n- **Variabel & Tipe Data**: Menyimpan informasi seperti angka, teks (*string*), dan boolean.\n- **Kondisional & Loop**: Mengatur alur logika (*if-else*) dan pengulangan data (*for*, *while*).\n- **Fungsi / Modularitas**: Menulis kode yang bersih dan dapat digunakan kembali (*reusable*).\n\nJika ada contoh kode atau bahasa pemrograman tertentu yang sedang Anda pelajari, silakan tanyakan kodenya dan kita bahas bersama!`;
    }

    // Study Tips & Motivation
    if (qLower.includes('tips belajar') || qLower.includes('cara belajar') || qLower.includes('malas') || qLower.includes('fokus')) {
      return `Berikut adalah beberapa teknik belajar efektif yang telah terbukti secara ilmiah${userGreeting}:\n\n1. **Teknik Pomodoro**: Belajar fokus selama 25 menit, lalu istirahat singkat 5 menit. Ulangi 4 kali sebelum istirahat panjang 15-30 menit.\n2. **Active Recall**: Jangan hanya membaca ulang catatan, tetapi uji ingatan Anda dengan menutup buku dan mencoba menjelaskan kembali konsep tersebut.\n3. **Spaced Repetition**: Pelajari materi dengan jeda bertahap (hari ke-1, hari ke-3, hari ke-7) untuk memindahkan memori jangka pendek ke jangka panjang.\n4. **Teknik Feynman**: Jelaskan konsep yang Anda pelajari seolah-olah Anda sedang menjelaskannya kepada anak usia 10 tahun dengan bahasa sesederhana mungkin.\n\nAnda juga bisa mencoba fitur **Generator Kuis** di atas untuk menguji ingatan Anda kapan saja!`;
    }

    // Weather & Atmosphere
    if (qLower.includes('cuaca') || qLower.includes('hujan') || qLower.includes('iklim') || qLower.includes('awan')) {
      return `Kondisi cuaca harian ditentukan oleh interaksi dinamis antara beberapa variabel atmosfer${userGreeting}:\n\n- **Suhu & Radiasi Matahari**: Pemanasan permukaan bumi menyebabkan udara mengembang dan naik (konveksi).\n- **Tekanan Udara & Angin**: Udara selalu bergerak dari daerah bertekanan tinggi ke daerah bertekanan rendah.\n- **Kelembaban & Kondensasi**: Uap air yang naik ke atmosfer akan mendingin hingga mencapai titik embun, membentuk titik air (awan), dan jika jenuh akan jatuh sebagai presipitasi (hujan).\n\nAda aspek geosfer atau meteorologi lain yang ingin Anda diskusikan?`;
    }

    // Default intelligent conversational response
    return `Mengenai **"${userQuery}"**${userGreeting}:\n\nPertanyaan tersebut mencakup topik yang sangat menarik. Secara umum, konsep tersebut berkaitan dengan pemahaman analitis dan penerapan praktis dalam kehidupan sehari-hari.\n\nSebagai asisten belajar Anda, saya siap mendiskusikan topik ini lebih dalam, membantu memecahkan masalah, atau jika Anda memiliki modul materi pelajaran spesifik yang ingin kita jadikan bahan kuis dan analisis, Anda dapat mengunggahnya pada menu **Koleksi Modul**!\n\nAda bagian spesifik yang ingin Anda ketahui lebih lanjut?`;
  }

  // Gemini API integration (Optional)
  async callGeminiAPI(query, analysis, apiKey) {
    try {
      const activeMatch = analysis.primaryMatch;
      const userNameStr = this.memory.userName ? `Nama pengguna Anda adalah ${this.memory.userName}. Panggil nama pengguna secara santai dan bersahabat.` : '';
      let systemInstruction = `Anda adalah EduBot, asisten dan teman belajar pribadi yang cerdas, hangat, suportif, dan komunikatif.
${userNameStr}

PRINSIP KOMUNIKASI & PERSONIFIKASI:
1. GAYA BAHASA DINAMIS & MANUSIAWI: Berbicaralah seperti mentor atau rekan belajar yang asyik, santun, dan antusias. Gunakan bahasa Indonesia percakapan yang mengalir natural (tidak kaku, tidak seperti ensiklopedia dingin).
2. DILARANG COPY-PASTE MENTAH: Jangan pernah mengutip atau menyalin mentah kalimat/paragraf dari teks modul! Anda WAJIB mencerna, memparafrasekan, menalar konteksnya, dan menjelaskannya kembali dengan susunan kalimat Anda sendiri yang mudah dipahami.
3. KEMAMPUAN PENALARAN (REASONING): Jika dalam materi hanya disebutkan suatu istilah dalam tanda kurung atau daftar anggota (misal: "Sistem pencernaan terdiri dari mulut, kerongkongan (esofagus), lambung..."), Anda harus mampu menalar bahwa esofagus = kerongkongan, letaknya di antara mulut dan lambung, serta menjelaskan fungsi dan perannya secara logis dan utuh.
4. PERCAKAPAN UMUM: Jika pengguna mengobrol santai atau menanyakan topik di luar modul, jawablah dengan fleksibel dan ramah seperti AI percakapan pada umumnya.`;

      let contextInfo = '';
      if (activeMatch) {
        contextInfo = `\n\n[Bahan Rujukan Modul: "${activeMatch.module.title}"]\n${activeMatch.bestSection ? activeMatch.bestSection.content : activeMatch.module.fullText.slice(0, 1500)}`;
      }

      const prompt = `${systemInstruction}\n${contextInfo}\n\nInput Pengguna: ${query}\nJawaban EduBot:`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        return {
          text: data.candidates[0].content.parts[0].text,
          isModuleRelated: analysis.isModuleRelated,
          badgeType: analysis.isModuleRelated ? 'module-match' : 'contextual-out',
          badgeText: analysis.isModuleRelated ? `📚 Gemini AI: ${activeMatch.module.subject}` : '💡 Gemini AI',
          citation: activeMatch ? { moduleTitle: activeMatch.module.title, sectionTitle: 'Rujukan Gemini API', snippet: '' } : null
        };
      }
      throw new Error('Respons Gemini kosong');
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local engine:', err);
      return this.synthesizeNaturalResponse(query, analysis);
    }
  }

  // Ollama API integration (Optional)
  async callOllamaAPI(query, analysis, settings) {
    try {
      const activeMatch = analysis.primaryMatch;
      const userNameStr = this.memory.userName ? `Pengguna bernama ${this.memory.userName}. Sapa dengan hangat.` : '';
      let contextInfo = activeMatch ? `\n[Bahan Bacaan Modul]:\n${activeMatch.bestSection ? activeMatch.bestSection.content : activeMatch.module.fullText.slice(0, 1200)}` : '';

      const systemPrompt = `Anda adalah EduBot, asisten dan rekan belajar AI yang ramah, komunikatif, dan cerdas. ${userNameStr}
ATURAN MENJAWAB:
1. Gunakan bahasa Indonesia percakapan yang dinamis, interaktif, dan luwes selayaknya manusia (bukan robot kaku).
2. DILARANG KERAS menyalin/copy-paste kalimat mentah dari bahan bacaan modul. Rangkum dan parafrasekan dengan bahasa Anda sendiri.
3. Lakukan penalaran logika terhadap hubungan antar konsep (misalnya sinonim dalam kurung, urutan organ, fungsi).
4. Jika di luar materi pelajaran, tetap jawab dengan santai dan solutif.`;

      const res = await fetch(`${settings.ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: settings.ollamaModel || 'qwen2.5:3b',
          prompt: `${systemPrompt}\n${contextInfo}\n\nPengguna: ${query}\nEduBot:`,
          stream: false
        })
      });

      const data = await res.json();
      if (data.response) {
        return {
          text: data.response,
          isModuleRelated: analysis.isModuleRelated,
          badgeType: analysis.isModuleRelated ? 'module-match' : 'contextual-out',
          badgeText: `🦙 Ollama (${settings.ollamaModel})`,
          citation: activeMatch ? { moduleTitle: activeMatch.module.title, sectionTitle: 'Local LLM', snippet: '' } : null
        };
      }
      throw new Error('Ollama response empty');
    } catch (e) {
      console.warn('Ollama call failed, falling back to local engine:', e);
      return this.synthesizeNaturalResponse(query, analysis);
    }
  }
}

window.nlpEngine = new NLPEngine();

