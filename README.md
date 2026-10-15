# EduBot P13 — Asisten Belajar Offline & AI Chatbot

Aplikasi web modern (**HTML, CSS, JavaScript Vanilla**) yang berjalan lokal di browser sebagai Asisten Belajar Mandiri offline untuk materi pada folder **Bahan Latihan P13 / Koleksi Modul**.

---

## 🌟 Fitur Utama

### 1. 💬 AI Study Chatbot & Filtrasi Kontekstual
- **Pencarian Semantik & Rujukan Modul**: Menjawab pertanyaan seputar materi pelajaran secara akurat dan berbasis teks dari 10 modul pembelajaran resmi.
- **Badge Rujukan**: Setiap jawaban dari modul disertai penanda visual `[📚 Materi Modul: <Nama Modul>]` dan kotak kutipan sitasi bab.
- **Filtrasi Konteks AI (Guardrail)**:
  - Jika pertanyaan **berhubungan dengan modul**, dijawab secara mendalam berdasarkan isi modul.
  - Jika pertanyaan **di luar materi modul** (misalnya resep masakan, film, pemrograman umum), asisten akan mendeteksi dan memberi badge `[💡 Kontekstual (Di Luar Materi Modul)]`, lalu menjawab secara edukatif dan kontekstual sebelum mengarahkan kembali ke topik belajar.
- **Text-to-Speech (TTS) & Voice Input**: Dengarkan jawaban asisten secara otomatis dan ajukan pertanyaan menggunakan mikrofon suara.

### 2. 📝 Generator Kuis Adaptif & Interaktif
- **Panel Pengaturan Kuis (Sebelum Pembuatan Kuis)**:
  - **Pilih Modul**: Tentukan modul spesifik, beberapa modul, atau seluruh modul aktif.
  - **Bentuk Soal**:
    - *Pilihan Ganda* (4 opsi A, B, C, D dengan kunci jawaban otomatis).
    - *Benar / Salah (True or False)* dengan pernyataan faktual dan penalaran.
    - *Essay / Isian Terbuka* dengan penilaian otomatis berbasis rubrik kata kunci & konsep (*semantic scoring*).
    - *Campuran (Mix)* gabungan ketiga format soal.
  - **Jumlah Soal**: Preset 3, 5, 10, 15 soal atau kustom.
  - **Tingkat Kesulitan**: Mudah (C1-C2 Fakta), Sedang (C3 Pemahaman), Sulit (C4 Analisis).
  - **Timer / Batas Waktu**: Bebas tanpa batas waktu atau hitung mundur 5, 10, 15 menit.
- **Interactive Quiz Runner**: Navigasi soal cepat (*jump-to-question pills*), indikator progres, dan tombol kumpulkan kuis.
- **Evaluasi & Pembahasan Komprehensif**:
  - Skor persentase dan predikat akademik (*Cumlaude / A / B / C*).
  - Pembahasan detail soal demi soal, perbandingan jawaban siswa vs kunci jawaban ideal, rubrik penilaian essay, dan rujukan kutipan dari buku modul.

### 3. 📚 Koleksi Modul & Upload Folder Baru
- **Preloaded 10 Modul Bahan Latihan P13**:
  1. *Sejarah Indonesia* (Peristiwa Rengasdengklok & Teks Proklamasi)
  2. *Biologi* (Sistem Pencernaan & Metabolisme Enzimatik)
  3. *Fisika* (Mekanika Klasik & Hukum-Hukum Gerak Newton)
  4. *Kimia* (Termokimia & Laju Reaksi)
  5. *Matematika* (Kalkulus Diferensial & Integral)
  6. *Sosiologi* (Struktur Sosial & Diferensiasi)
  7. *Geografi* (Litosfer & Dinamika Planet Bumi)
  8. *Ekonomi* (Manajemen Keuangan & Pasar Modal)
  9. *Informatika* (Arsitektur Komputer & Jaringan)
  10. *Bahasa Indonesia* (Kajian Sastra & Teks Akademik)
- **Upload Folder Baru**: Fitur pemilih folder (`webkitdirectory`) untuk mengunggah satu folder baru dari komputer yang berisi materi lain (PDF, TXT, MD, JSON).
- **Upload File Mandiri**: Drag-and-drop atau upload file satuan.
- **Penyimpanan Permanen (IndexedDB)**: Modul yang diunggah dan riwayat kuis tersimpan secara lokal di browser dan tidak hilang saat halaman di-refresh.
- **Toggle On/Off Modul**: Pengguna dapat mengaktifkan atau menonaktifkan modul tertentu sesuai kebutuhan belajar saat itu.

---

## 🚀 Cara Menjalankan

### Cara 1: Menggunakan Launcher (Paling Mudah)
Cukup klik dua kali file:
```
JALANKAN_APLIKASI.bat
```
Browser default Anda akan otomatis terbuka ke `http://localhost:3000`.

### Cara 2: Menjalankan via Terminal
Buka PowerShell atau Command Prompt pada folder ini, lalu jalankan:
```bash
node server.js
```
Kemudian buka browser ke alamat: `http://localhost:3000`.

### Cara 3: Membuka Langsung File HTML
Anda juga dapat membuka file `index.html` secara langsung dengan mengklik ganda file tersebut di Windows Explorer!

---

## 🎨 Teknologi & Desain
- **Core**: HTML5, Vanilla JavaScript ES6+, Vanilla CSS3.
- **Penyimpanan**: Browser IndexedDB & LocalStorage.
- **Parsing PDF Lokal**: `pdf.min.js` (berjalan 100% di browser tanpa koneksi internet).
- **Estetika**: Glassmorphism, palet warna vibrant dark/light mode, tipografi modern (Plus Jakarta Sans & JetBrains Mono), dan animasi transisi halus.