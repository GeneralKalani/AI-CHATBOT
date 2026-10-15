/**
 * EduBot P13 - Intelligent Quiz Generation & Evaluation Engine
 * Generates custom quizzes based on selected modules with pre-quiz customization:
 * - Module selection
 * - Question counts (3, 5, 10, 15, 20, custom)
 * - Question formats (Pilihan Ganda, Benar/Salah, Essay, Campuran)
 * - Difficulty levels (Mudah, Sedang, Sulit)
 */

class QuizEngine {
  constructor() {
    // Curated high-yield academic question bank from Bahan Latihan P13 modules
    this.coreQuestionBank = {
      'sejarah': [
        {
          id: 'q_sej_1',
          type: 'mc',
          subject: 'Sejarah Indonesia',
          stem: 'Peristiwa pengamanan Ir. Soekarno dan Drs. Moh. Hatta oleh golongan muda ke suatu daerah pada 16 Agustus 1945 dini hari dikenal sebagai peristiwa...',
          options: [
            'Peristiwa Rengasdengklok',
            'Bandung Lautan Api',
            'Serangan Umum 1 Maret',
            'Pertempuran Lima Hari di Semarang'
          ],
          correctAnswer: 'Peristiwa Rengasdengklok',
          explanation: 'Golongan pemuda (Wikana, Sukarni, Chaerul Saleh) membawa Soekarno-Hatta ke Rengasdengklok, Karawang untuk mengamankan mereka dari pengaruh tentara Jepang dan mendesak proklamasi.',
          difficulty: 'easy'
        },
        {
          id: 'q_sej_2',
          type: 'mc',
          subject: 'Sejarah Indonesia',
          stem: 'Naskah Proklamasi Kemerdekaan Indonesia diketik oleh seorang tokoh pemuda bernama...',
          options: [
            'Sayuti Melik',
            'Ahmad Soebardjo',
            'Sukarni Kartodiwirjo',
            'B.M. Diah'
          ],
          correctAnswer: 'Sayuti Melik',
          explanation: 'Sayuti Melik mengetik naskah proklamasi di kediaman Laksamana Tadashi Maeda dengan sedikit perubahan redaksional kata dan tanggal.',
          difficulty: 'easy'
        },
        {
          id: 'q_sej_3',
          type: 'tf',
          subject: 'Sejarah Indonesia',
          stem: 'Naskah teks proklamasi kemerdekaan Indonesia dirumuskan di kediaman resmi Laksamana Tadashi Maeda di Jalan Imam Bonjol No. 1 Jakarta.',
          correctAnswer: true,
          explanation: 'Benar. Laksamana Maeda memberikan jaminan keamanan di kediamannya untuk perumusan naskah proklamasi oleh para tokoh bangsa.',
          difficulty: 'easy'
        },
        {
          id: 'q_sej_4',
          type: 'essay',
          subject: 'Sejarah Indonesia',
          stem: 'Jelaskan perbedaan sudut pandang antara golongan tua dan golongan muda menjelang pembacaan proklamasi kemerdekaan 17 Agustus 1945!',
          idealAnswer: 'Golongan tua menginginkan kemerdekaan dibicarakan melalui sidang PPKI agar tidak memicu bentrokan dengan Jepang, sedangkan golongan muda mendesak proklamasi dilakukan secepatnya oleh kekuatan bangsa sendiri tanpa campur tangan badan bentukan Jepang (PPKI).',
          keywords: ['golongan tua', 'golongan muda', 'ppki', 'jepang', 'kemerdekaan', 'bentrokan', 'rengasdengklok'],
          explanation: 'Perbedaan ini bermula dari berita kekalahan Jepang pada 14 Agustus 1945 yang memicu desakan pemuda.',
          difficulty: 'medium'
        }
      ],
      'biologi': [
        {
          id: 'q_bio_1',
          type: 'mc',
          subject: 'Biologi',
          stem: 'Enzim yang dihasilkan oleh getah lambung dan berfungsi memecah molekul protein menjadi pepton adalah...',
          options: [
            'Pepsin',
            'Ptialin',
            'Lipase',
            'Tripsin'
          ],
          correctAnswer: 'Pepsin',
          explanation: 'Di lambung, pepsinogen diaktifkan oleh asam klorida (HCl) menjadi pepsin aktif yang bertugas mencerna protein menjadi pepton.',
          difficulty: 'easy'
        },
        {
          id: 'q_bio_2',
          type: 'mc',
          subject: 'Biologi',
          stem: 'Bagian dari usus halus yang menjadi muara dari saluran getah pankreas dan kantung empedu adalah...',
          options: [
            'Duodenum (Usus 12 Jari)',
            'Jejunum (Usus Kosong)',
            'Ileum (Usus Penyerapan)',
            'Sekum (Usus Buntu)'
          ],
          correctAnswer: 'Duodenum (Usus 12 Jari)',
          explanation: 'Duodenum merupakan segmen pertama usus halus tempat terjadinya pencernaan kimiawi intensif dari enzim pankreas dan cairan empedu.',
          difficulty: 'medium'
        },
        {
          id: 'q_bio_3',
          type: 'tf',
          subject: 'Biologi',
          stem: 'Asam Klorida (HCl) di dalam lambung berfungsi untuk membunuh mikroorganisme patogen dan mengaktifkan pepsinogen menjadi pepsin.',
          correctAnswer: true,
          explanation: 'Benar. HCl menciptakan pH asam (1-2) yang steril serta penting untuk aktivasi enzim lambung.',
          difficulty: 'easy'
        },
        {
          id: 'q_bio_4',
          type: 'essay',
          subject: 'Biologi',
          stem: 'Uraikan perbedaan proses pencernaan mekanik dan kimiawi yang terjadi di dalam rongga mulut manusia!',
          idealAnswer: 'Pencernaan mekanik di mulut dilakukan oleh gigi yang mengunyah dan meremukkan makanan menjadi bolus, sedangkan pencernaan kimiawi dilakukan oleh enzim ptialin (amilase) dalam air liur yang memecah amilum menjadi maltosa.',
          keywords: ['mekanik', 'kimiawi', 'gigi', 'ptialin', 'amilase', 'amilum', 'maltosa', 'air liur'],
          explanation: 'Mulut adalah gerbang utama saluran pencernaan yang memadukan aksi mekanik gigi dan aksi enzimatik ptialin.',
          difficulty: 'medium'
        }
      ],
      'fisika': [
        {
          id: 'q_fis_1',
          type: 'mc',
          subject: 'Fisika',
          stem: 'Hukum Newton yang menyatakan bahwa jika resultan gaya yang bekerja pada benda sama dengan nol maka benda diam akan tetap diam atau bergerak lurus beraturan adalah...',
          options: [
            'Hukum I Newton (Inersia)',
            'Hukum II Newton',
            'Hukum III Newton (Aksi-Reaksi)',
            'Hukum Gravitasi Universal'
          ],
          correctAnswer: 'Hukum I Newton (Inersia)',
          explanation: 'Hukum I Newton (Sigma F = 0) menyatakan sifat kelembaman atau inersia benda untuk mempertahankan keadaan geraknya.',
          difficulty: 'easy'
        },
        {
          id: 'q_fis_2',
          type: 'mc',
          subject: 'Fisika',
          stem: 'Sebuah balok bermassa 4 kg didorong dengan gaya horizontal 20 N di atas permukaan licin. Berapakah percepatan balok tersebut?',
          options: [
            '5 m/s²',
            '4 m/s²',
            '80 m/s²',
            '0.2 m/s²'
          ],
          correctAnswer: '5 m/s²',
          explanation: 'Berdasarkan Hukum II Newton: a = F / m = 20 N / 4 kg = 5 m/s².',
          difficulty: 'medium'
        },
        {
          id: 'q_fis_3',
          type: 'tf',
          subject: 'Fisika',
          stem: 'Gaya aksi dan gaya reaksi pada Hukum III Newton selalu bekerja pada satu benda yang sama sehingga keduanya saling meniadakan.',
          correctAnswer: false,
          explanation: 'Salah. Pasangan gaya aksi dan reaksi selalu bekerja pada dua benda yang berbeda (F_aksi = -F_reaksi), sehingga tidak saling meniadakan.',
          difficulty: 'medium'
        },
        {
          id: 'q_fis_4',
          type: 'essay',
          subject: 'Fisika',
          stem: 'Jelaskan mengapa tubuh penumpang bus terdorong ke depan saat bus yang sedang melaju kencang tiba-tiba direm mendadak!',
          idealAnswer: 'Hal tersebut terjadi akibat sifat kelembaman atau inersia (Hukum I Newton). Tubuh penumpang cenderung mempertahankan kecepatan awalnya yang bergerak ke depan ketika bus mengalami perlambatan mendadak akibat pengereman.',
          keywords: ['inersia', 'kelembaman', 'hukum i newton', 'mempertahankan', 'rem', 'kecepatan'],
          explanation: 'Kelembaman adalah kecenderungan alami setiap benda bermassa untuk mempertahankan status geraknya.',
          difficulty: 'medium'
        }
      ],
      'kimia': [
        {
          id: 'q_kim_1',
          type: 'mc',
          subject: 'Kimia',
          stem: 'Reaksi kimia yang melepaskan kalor dari sistem ke lingkungan dan memiliki perubahan entalpi bernilai negatif (ΔH < 0) disebut reaksi...',
          options: [
            'Eksoterm',
            'Endoterm',
            'Sublimasi',
            'Adsorpsi'
          ],
          correctAnswer: 'Eksoterm',
          explanation: 'Reaksi eksoterm membebaskan kalor ke lingkungan sehingga suhu lingkungan meningkat dan ΔH berharga negatif.',
          difficulty: 'easy'
        },
        {
          id: 'q_kim_2',
          type: 'tf',
          subject: 'Kimia',
          stem: 'Penambahan katalis pada suatu reaksi kimia dapat mempercepat laju reaksi dengan cara menurunkan energi aktivasi (Ea).',
          correctAnswer: true,
          explanation: 'Benar. Katalis menyediakan mekanisme reaksi alternatif dengan energi aktivasi yang lebih rendah tanpa terkonsumsi secara permanen.',
          difficulty: 'easy'
        },
        {
          id: 'q_kim_3',
          type: 'essay',
          subject: 'Kimia',
          stem: 'Sebutkan dan jelaskan minimal 3 faktor yang dapat mempengaruhi laju reaksi kimia!',
          idealAnswer: 'Faktor yang mempengaruhi laju reaksi antara lain: 1) Konsentrasi reaktan (semakin pekat semakin sering tumbukan partikel), 2) Suhu (suhu tinggi meningkatkan energi kinetik partikel), 3) Luas permukaan sentuh (semakin halus ukuran bidang semakin luas area tumbukan), dan 4) Katalis (menurunkan energi aktivasi).',
          keywords: ['konsentrasi', 'suhu', 'luas permukaan', 'katalis', 'tumbukan', 'energi kinetik', 'energi aktivasi'],
          explanation: 'Teori tumbukan menjelaskan bahwa laju reaksi sebanding dengan frekuensi tumbukan efektif antar partikel reaktan.',
          difficulty: 'medium'
        }
      ],
      'matematika': [
        {
          id: 'q_mat_1',
          type: 'mc',
          subject: 'Matematika',
          stem: 'Turunan pertama dari fungsi f(x) = 3x² + 5x - 7 terhadap variabel x adalah...',
          options: [
            '6x + 5',
            '3x + 5',
            '6x - 7',
            '3x² + 5'
          ],
          correctAnswer: '6x + 5',
          explanation: 'Turunan dari a*x^n adalah a*n*x^(n-1). Maka d/dx (3x² + 5x - 7) = 2*3x + 5 = 6x + 5.',
          difficulty: 'easy'
        },
        {
          id: 'q_mat_2',
          type: 'tf',
          subject: 'Matematika',
          stem: 'Integral tak tentu secara geometris merepresentasikan keluarga fungsi antiturunan yang perbedaannya ditentukan oleh suatu konstanta C.',
          correctAnswer: true,
          explanation: 'Benar. Karena turunan dari konstanta adalah nol, hasil integral tak tentu selalu menyertakan konstanta integrasi + C.',
          difficulty: 'easy'
        },
        {
          id: 'q_mat_3',
          type: 'essay',
          subject: 'Matematika',
          stem: 'Jelaskan makna geometris dari turunan pertama suatu fungsi f(x) pada titik x = a!',
          idealAnswer: 'Makna geometris dari turunan pertama f\'(a) adalah gradien (kemiringan) dari garis singgung kurva fungsi f(x) tepat pada titik (a, f(a)).',
          keywords: ['gradien', 'kemiringan', 'garis singgung', 'kurva', 'titik'],
          explanation: 'Secara diferensial, turunan mengukur laju perubahan sesaat fungsi pada titik tersebut.',
          difficulty: 'medium'
        }
      ],
      'sosiologi': [
        {
          id: 'q_sos_1',
          type: 'mc',
          subject: 'Sosiologi',
          stem: 'Pembedaan anggota masyarakat ke dalam lapisan-lapisan sosial secara vertikal atau bertingkat (hierarki) dinamakan...',
          options: [
            'Stratifikasi Sosial',
            'Diferensiasi Sosial',
            'Mobilitas Sosial',
            'Asimilasi Budaya'
          ],
          correctAnswer: 'Stratifikasi Sosial',
          explanation: 'Stratifikasi sosial membagi masyarakat secara bertingkat berdasarkan kekayaan, kekuasaan, atau kehormatan, sedangkan diferensiasi bersifat horizontal.',
          difficulty: 'easy'
        },
        {
          id: 'q_sos_2',
          type: 'tf',
          subject: 'Sosiologi',
          stem: 'Diferensiasi sosial membagi masyarakat berdasarkan perbedaan horizontal yang tidak mengimplikasikan tingkatan derajat atau hierarki kekuasaan.',
          correctAnswer: true,
          explanation: 'Benar. Diferensiasi mencakup keragaman suku, ras, agama, dan gender tanpa ada yang lebih tinggi atau lebih rendah.',
          difficulty: 'easy'
        }
      ],
      'geografi': [
        {
          id: 'q_geo_1',
          type: 'mc',
          subject: 'Geografi',
          stem: 'Lapisan terluar dari struktur internal bumi yang bersifat padat, terdiri atas kerak benua dan kerak samudera disebut...',
          options: [
            'Litosfer',
            'Astenosfer',
            'Barisfer',
            'Mesosfer'
          ],
          correctAnswer: 'Litosfer',
          explanation: 'Litosfer (dari kata lithos = batuan) adalah lapisan kulit bumi padat paling luar tempat berlangsungnya aktivitas tektonik dan kehidupan manusia.',
          difficulty: 'easy'
        },
        {
          id: 'q_geo_2',
          type: 'tf',
          subject: 'Geografi',
          stem: 'Pergerakan dua lempeng tektonik yang saling bertumbukan dan menyebabkan penunjaman kerak samudera ke bawah kerak benua dinamakan batas konvergen.',
          correctAnswer: true,
          explanation: 'Benar. Batas konvergen menghasilkan zona subduksi, palung laut, serta deretan gunung berapi aktif.',
          difficulty: 'medium'
        }
      ],
      'ekonomi': [
        {
          id: 'q_eko_1',
          type: 'mc',
          subject: 'Ekonomi',
          stem: 'Surat berharga yang menunjukkan bukti kepemilikan modal atau penyertaan saham pada suatu perseroan terbatas disebut...',
          options: [
            'Saham',
            'Obligasi',
            'Reksadana Pasar Uang',
            'Waran'
          ],
          correctAnswer: 'Saham',
          explanation: 'Saham merupakan tanda bukti kepemilikan bagian modal perusahaan yang memberikan hak atas dividen dan rapat umum pemegang saham (RUPS).',
          difficulty: 'easy'
        },
        {
          id: 'q_eko_2',
          type: 'tf',
          subject: 'Ekonomi',
          stem: 'Obligasi merupakan surat pernyataan utang dari penerbit kepada pemegang obligasi yang menjanjikan imbalan bunga berkala (kupon) dan pengembalian pokok pinjaman.',
          correctAnswer: true,
          explanation: 'Benar. Obligasi adalah instrumen utang jangka menengah hingga panjang yang diterbitkan oleh pemerintah maupun korporasi.',
          difficulty: 'easy'
        }
      ],
      'informatika': [
        {
          id: 'q_inf_1',
          type: 'mc',
          subject: 'Informatika',
          stem: 'Komponen perangkat keras komputer yang berfungsi sebagai otak utama dalam mengeksekusi instruksi aritmatika dan logika adalah...',
          options: [
            'CPU (Central Processing Unit)',
            'RAM (Random Access Memory)',
            'Motherboard',
            'GPU (Graphics Processing Unit)'
          ],
          correctAnswer: 'CPU (Central Processing Unit)',
          explanation: 'CPU bertugas mengendalikan seluruh operasi komputer, menjalankan perhitungan ALU, dan mengoordinasikan transfer data.',
          difficulty: 'easy'
        },
        {
          id: 'q_inf_2',
          type: 'mc',
          subject: 'Informatika',
          stem: 'Perangkat jaringan yang bekerja pada Layer 3 (Network Layer) dalam model OSI dan bertugas meneruskan paket data antar jaringan yang berbeda adalah...',
          options: [
            'Router',
            'Switch',
            'Hub',
            'Repeater'
          ],
          correctAnswer: 'Router',
          explanation: 'Router menggunakan IP address untuk menentukan rute terbaik (routing) dan menghubungkan subnet jaringan yang berbeda.',
          difficulty: 'medium'
        },
        {
          id: 'q_inf_3',
          type: 'tf',
          subject: 'Informatika',
          stem: 'Topologi jaringan bentuk Bintang (Star) memiliki keunggulan: jika satu kabel node putus, seluruh jaringan tetap dapat berfungsi secara normal.',
          correctAnswer: true,
          explanation: 'Benar. Kerusakan pada satu kabel klien tidak melumpuhkan hub/switch pusat sehingga klien lain tidak terganggu.',
          difficulty: 'medium'
        }
      ],
      'bahasa_indonesia': [
        {
          id: 'q_ind_1',
          type: 'mc',
          subject: 'Bahasa Indonesia',
          stem: 'Gaya bahasa (majas) yang membandingkan dua hal yang berbeda secara langsung tanpa kata penghubung komparasi (contoh: "Dewi malam menyinari bumi") disebut...',
          options: [
            'Majas Metafora',
            'Majas Simile',
            'Majas Personifikasi',
            'Majas Hiperbola'
          ],
          correctAnswer: 'Majas Metafora',
          explanation: 'Metafora merupakan analogi langsung tanpa perantara kata "seperti" atau "bagai", berbeda dengan majas simile.',
          difficulty: 'easy'
        },
        {
          id: 'q_ind_2',
          type: 'tf',
          subject: 'Bahasa Indonesia',
          stem: 'Teks karya ilmiah akademik mensyaratkan penggunaan ragam bahasa baku, lugas, denotatif, dan memuat referensi sitasi yang dapat dipertanggungjawabkan.',
          correctAnswer: true,
          explanation: 'Benar. Karya ilmiah harus objektif, tidak ambigu, dan berbasis bukti rujukan empiris.',
          difficulty: 'easy'
        }
      ]
    };
  }

  // Generate dynamic questions from custom uploaded modules
  generateQuestionsFromText(module, requestedCount = 3, format = 'mix') {
    const questions = [];
    const text = module.fullText || '';
    const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 40 && s.trim().length < 200);

    for (let i = 0; i < sentences.length && questions.length < requestedCount; i++) {
      const sentence = sentences[i].trim();
      
      // Look for definitional structures ("adalah", "merupakan", "berfungsi", "terdiri dari")
      if (/(adalah|merupakan|berfungsi untuk|terdiri dari|disebut)/i.test(sentence)) {
        const parts = sentence.split(/(adalah|merupakan|berfungsi untuk|terdiri dari|disebut)/i);
        if (parts.length >= 3) {
          const subjectPart = parts[0].trim();
          const predicatePart = parts.slice(1).join(' ').trim();

          if (format === 'tf' || (format === 'mix' && questions.length % 2 === 1)) {
            // True / False
            questions.push({
              id: `dyn_tf_${Date.now()}_${questions.length}`,
              type: 'tf',
              subject: module.subject || module.title,
              stem: `Berdasarkan materi "${module.title}": ${sentence}`,
              correctAnswer: true,
              explanation: `Pernyataan ini tepat sesuai isi teks materi: "${sentence}"`,
              difficulty: 'easy'
            });
          } else if (format === 'essay' || (format === 'mix' && questions.length % 3 === 2)) {
            // Essay
            questions.push({
              id: `dyn_es_${Date.now()}_${questions.length}`,
              type: 'essay',
              subject: module.subject || module.title,
              stem: `Berdasarkan teks materi "${module.title}", jelaskan konsep mengenai: ${subjectPart}!`,
              idealAnswer: sentence,
              keywords: subjectPart.toLowerCase().split(/\s+/).filter(w => w.length > 3),
              explanation: `Konsep ini diuraikan dalam modul sebagai: "${sentence}"`,
              difficulty: 'medium'
            });
          } else {
            // Multiple Choice
            questions.push({
              id: `dyn_mc_${Date.now()}_${questions.length}`,
              type: 'mc',
              subject: module.subject || module.title,
              stem: `Pernyataan: "... ${predicatePart}." merujuk pada konsep...`,
              options: [
                subjectPart,
                'Konsep Terkait A',
                'Konsep Alternatif B',
                'Analisis Pendukung C'
              ],
              correctAnswer: subjectPart,
              explanation: `Berdasarkan teks modul: "${sentence}"`,
              difficulty: 'medium'
            });
          }
        }
      }
    }

    return questions;
  }

  // Create customized quiz according to user parameters
  createQuiz(activeModules = [], options = {}) {
    const {
      selectedModuleIds = [],
      count = 5,
      type = 'mix', // 'mc' | 'tf' | 'essay' | 'mix'
      difficulty = 'medium',
      timeLimitMinutes = 0
    } = options;

    if (!activeModules || activeModules.length === 0) {
      return {
        id: 'quiz_' + Date.now(),
        title: 'Kuis Evaluasi (Belum Ada Modul)',
        createdAt: Date.now(),
        timeLimitMinutes: 0,
        totalQuestions: 0,
        questions: [],
        userAnswers: {},
        result: null
      };
    }

    // Filter target modules
    const targetModules = selectedModuleIds.length > 0
      ? activeModules.filter(m => selectedModuleIds.includes(m.id))
      : activeModules;

    if (targetModules.length === 0) {
      return {
        id: 'quiz_' + Date.now(),
        title: 'Kuis Evaluasi (Belum Ada Modul Terpilih)',
        createdAt: Date.now(),
        timeLimitMinutes: 0,
        totalQuestions: 0,
        questions: [],
        userAnswers: {},
        result: null
      };
    }

    let pool = [];

    // 1. Collect questions strictly matching target modules
    for (const mod of targetModules) {
      const subjKey = (mod.id || '').replace('mod_', '').toLowerCase();
      let matchedKey = null;

      for (const k of Object.keys(this.coreQuestionBank)) {
        if (subjKey.includes(k) || (mod.subject || '').toLowerCase().includes(k)) {
          matchedKey = k;
          break;
        }
      }

      if (matchedKey && this.coreQuestionBank[matchedKey]) {
        pool.push(...this.coreQuestionBank[matchedKey]);
      } else {
        // Dynamic question generation from uploaded folder/file
        const dynamicQs = this.generateQuestionsFromText(mod, 6, type);
        pool.push(...dynamicQs);
      }
    }

    // 2. Filter by question type if not 'mix'
    if (type !== 'mix') {
      pool = pool.filter(q => q.type === type);
    }

    // Fallback if pool is empty: try generating dynamic questions from target modules
    if (pool.length === 0) {
      for (const mod of targetModules) {
        const dynamicQs = this.generateQuestionsFromText(mod, count, type);
        pool.push(...dynamicQs);
      }
    }

    // 3. Shuffle pool randomly
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const finalQuestions = shuffled.slice(0, Math.min(count, shuffled.length));

    return {
      id: 'quiz_' + Date.now(),
      title: `Kuis Evaluasi Belajar (${finalQuestions.length} Soal)`,
      createdAt: Date.now(),
      timeLimitMinutes: timeLimitMinutes,
      totalQuestions: finalQuestions.length,
      questions: finalQuestions,
      userAnswers: {},
      result: null
    };
  }

  // Evaluate single essay question using keyword rubrics and concept density
  evaluateEssayAnswer(userAnswer, question) {
    if (!userAnswer || userAnswer.trim().length === 0) {
      return {
        score: 0,
        feedback: 'Jawaban belum diisi.',
        modelAnswer: question.idealAnswer
      };
    }

    const cleanUser = userAnswer.toLowerCase();
    const keywords = question.keywords || [];
    let matchedKeywords = 0;

    for (const kw of keywords) {
      if (cleanUser.includes(kw.toLowerCase())) {
        matchedKeywords++;
      }
    }

    // Calculate score percentage
    const wordCount = userAnswer.trim().split(/\s+/).length;
    let score = 0;

    if (keywords.length > 0) {
      const keywordRatio = matchedKeywords / keywords.length;
      score = Math.round(keywordRatio * 75); // up to 75 points for concepts
      if (wordCount >= 10) score += 15; // 15 points for elaboration
      if (wordCount >= 20) score += 10; // 10 points for depth
    } else {
      score = wordCount >= 15 ? 85 : 60;
    }

    score = Math.min(100, Math.max(20, score));

    let feedback = '';
    if (score >= 85) {
      feedback = 'Sangat Baik! Pemahaman Anda terhadap konsep ini sangat komprehensif dan mencakup poin-poin utama.';
    } else if (score >= 65) {
      feedback = 'Cukup Baik. Anda telah menyebutkan beberapa poin kunci, namun dapat diperdalam dengan penjelasan kausalitas atau mekanisme detailnya.';
    } else {
      feedback = 'Perlu Pendalaman. Jawaban Anda masih cukup singkat atau melewatkan beberapa kata kunci inti materi.';
    }

    return {
      score: score,
      feedback: feedback,
      matchedKeywords: matchedKeywords,
      totalKeywords: keywords.length,
      modelAnswer: question.idealAnswer
    };
  }

  // Evaluate entire completed quiz
  evaluateQuiz(quiz, userAnswers) {
    let totalScore = 0;
    const evaluations = [];

    for (let i = 0; i < quiz.questions.length; i++) {
      const q = quiz.questions[i];
      const ans = userAnswers[q.id];

      if (q.type === 'mc') {
        const isCorrect = ans === q.correctAnswer;
        const qScore = isCorrect ? 100 : 0;
        totalScore += qScore;
        evaluations.push({
          questionId: q.id,
          question: q,
          userAnswer: ans || 'Tidak dijawab',
          correctAnswer: q.correctAnswer,
          isCorrect: isCorrect,
          score: qScore,
          explanation: q.explanation
        });
      } else if (q.type === 'tf') {
        const isCorrect = ans === q.correctAnswer;
        const qScore = isCorrect ? 100 : 0;
        totalScore += qScore;
        evaluations.push({
          questionId: q.id,
          question: q,
          userAnswer: ans !== undefined ? (ans ? 'Benar' : 'Salah') : 'Tidak dijawab',
          correctAnswer: q.correctAnswer ? 'Benar' : 'Salah',
          isCorrect: isCorrect,
          score: qScore,
          explanation: q.explanation
        });
      } else if (q.type === 'essay') {
        const essayEval = this.evaluateEssayAnswer(ans, q);
        totalScore += essayEval.score;
        evaluations.push({
          questionId: q.id,
          question: q,
          userAnswer: ans || 'Tidak dijawab',
          correctAnswer: essayEval.modelAnswer,
          isCorrect: essayEval.score >= 65,
          score: essayEval.score,
          feedback: essayEval.feedback,
          explanation: q.explanation
        });
      }
    }

    const finalPercent = Math.round(totalScore / quiz.questions.length);
    let grade = 'D';
    let statusText = 'Perlu Belajar Lebih Giat';

    if (finalPercent >= 85) {
      grade = 'A';
      statusText = 'Luar Biasa / Cumlaude! Pemahaman Sangat Mendalam';
    } else if (finalPercent >= 75) {
      grade = 'B';
      statusText = 'Sangat Baik! Menguasai Sebagian Besar Materi';
    } else if (finalPercent >= 60) {
      grade = 'C';
      statusText = 'Cukup / Lulus Standar. Disarankan Mengulang Bab Tertentu';
    }

    return {
      quizId: quiz.id,
      timestamp: Date.now(),
      finalPercent: finalPercent,
      grade: grade,
      statusText: statusText,
      totalQuestions: quiz.questions.length,
      evaluations: evaluations
    };
  }
}

window.quizEngine = new QuizEngine();
