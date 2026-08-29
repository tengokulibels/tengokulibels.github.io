/* ==========================================================================
   soal-data.js
   ------------------------------------------------------------------------
   INI FILE KHUSUS UNTUK SENSEI/ADMIN MENGEDIT SOAL & POIN NILAI.
   Kamu TIDAK perlu menyentuh quiz.js untuk menambah/mengubah soal — cukup
   edit array di bawah ini, simpan, lalu refresh halaman latihan.html.

   STRUKTUR SETIAP BAB:
   {
     id: "kode-unik-bab",         -> jangan diubah setelah dipakai (dipakai internal)
     babNumber: "1",              -> nomor bab yang tampil di badge bulat
     title: "Judul bab",
     description: "Deskripsi singkat 1 kalimat",
     quizzes: [ ... SATU BAB BOLEH PUNYA BANYAK KUIS, lihat di bawah ... ]
   }

   SETIAP BAB BISA PUNYA BANYAK KUIS (tidak dibatasi jumlahnya). Tiap kuis
   akan muncul sebagai baris aktivitas terpisah di dalam kartu bab tersebut:
   {
     id: "kode-unik-kuis",        -> jangan diubah setelah dipakai
     title: "Judul kuis yang tampil ke siswa",
     estMinutes: 6,               -> estimasi lama pengerjaan (menit), hanya info
     questions: [ ... lihat 3 jenis soal di bawah ... ]
   }

   TIGA JENIS SOAL YANG DIDUKUNG (isi "type"):

   1) "multiple_choice"  (Pilihan Ganda)
      {
        type: "multiple_choice",
        prompt: "Huruf hiragana 「あ」 dibaca...",
        options: ["A", "I", "U", "E"],
        answer: "A",              -> harus SAMA PERSIS dengan salah satu isi options
        points: 10                -> poin jika benar (boleh angka berapa saja)
      }

   2) "text_input"  (Menulis / mengetik romaji — mengganti soal "Menulis Kana")
      {
        type: "text_input",
        prompt: "Tulis cara baca (romaji) dari 「さくら」",
        answer: "sakura",         -> jawaban tidak case-sensitive & spasi di ujung diabaikan
        hint: "Terdiri dari 3 suku kata kana",   -> opsional
        points: 15
      }

   3) "matching"  (menyusun jawaban — versi web pakai dropdown per baris)
      {
        type: "matching",
        prompt: "Cocokkan setiap huruf kana dengan bacaannya.",
        pairs: [
          { kana: "き", options: ["KI","KU","SA"], answer: "KI" },
          { kana: "く", options: ["KI","KU","SA"], answer: "KU" }
        ],
        points: 20                 -> poin dibagi rata per baris yang benar
      }

   Total nilai maksimal per KUIS dihitung OTOMATIS dari jumlah "points" semua
   soal di kuis tersebut — tidak perlu dijumlah manual.

   CONTOH MENAMBAH KUIS BARU DI BAB YANG SUDAH ADA:
   Cukup tambahkan objek kuis baru ke dalam array "quizzes" milik bab yang
   dimaksud, misalnya:

     quizzes: [
       { id: "bab-1-kuis-1", title: "Kuis Dasar", ... , questions: [...] },
       { id: "bab-1-kuis-2", title: "Kuis Tambahan", ... , questions: [...] }, // <-- baru
     ]

   ========================================================================== */

const SOAL_DATA = [
  {
    id: "bab-1",
    babNumber: "1",
    title: "Hiragana A-K-S-T",
    description: "",
    quizzes: [
      {
        id: "bab-1-kuis-1",
        title: "Kuis Dasar: Barisan A & K",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「あ」 dibaca...", options: ["A","I","U","E"], answer: "A", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「き」 dibaca...", options: ["KA","KI","KU","KO"], answer: "KI", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「かき」 (kaki/kesempatan)", answer: "kaki", hint: "2 suku kata, barisan K", points: 15 },
          {type: "matching", prompt: "Cocokkan hiragana barisan A-K dengan bacaan romajinya.",
            pairs: [
              { kana: "こ", options: ["KA","KO","SO"], answer: "KO" },
              { kana: "く", options: ["KI","KU","SA"], answer: "KU" }
            ],points: 20
          }
        ]
      },
      {
        id: "bab-1-kuis-2",
        title: "Kuis Dasar: Barisan S & T",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「す」 dibaca...", options: ["SA","SHI","SU","SE"], answer: "SU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「て」 dibaca...", options: ["TA","CHI","TSU","TE"], answer: "TE", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「あさ」 (pagi)", answer: "asa", hint: "2 suku kata, barisan A + S", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana barisan S-T dengan bacaan romajinya.",
            pairs: [
              { kana: "そ", options: ["SA","SO","TO"], answer: "SO" },
              { kana: "ち", options: ["CHI","SHI","TA"], answer: "CHI" }
            ],
            points: 20
          }
        ]
      },
      {
        id: "bab-1-kuis-3",
        title: "Uji Pemahaman: Campuran AKST",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 30
          }
        ]
      }
    ]
  },
  {
    id: "bab-2",
    babNumber: "2",
    title: "Hiragana N-H-M-R",
    description: "",
    quizzes: [
      {
        id: "bab-2-kuis-1",
        title: "Kuis Hiragana Barisan NHMR",
        estMinutes: 6,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ぬ」 dibaca...", options: ["NA","NI","NU","NE"], answer: "NU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ほ」 dibaca...", options: ["HA","HI","FU","HO"], answer: "HO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「む」 dibaca...", options: ["MA","MI","MU","ME"], answer: "MU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「り」 dibaca...", options: ["RA","RI","RU","RE"], answer: "RI", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「はな」 (bunga)", answer: "hana", hint: "Barisan H + N", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「もり」 (hutan)", answer: "mori", hint: "Barisan M + R", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana dakuon dengan bacaan romajinya.",
            pairs: [
              { kana: "ば", options: ["BA","PA","HA"], answer: "BA" },
              { kana: "ぷ", options: ["FU","PU","BU"], answer: "PU" },
              { kana: "べ", options: ["HE","BE","PE"], answer: "BE" }
            ],
            points: 30
          }
        ]
      },
      {
        id: "bab-2-kuis-2",
        title: "Kuis Hiragana Barisan NHMR",
        estMinutes: 6,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ぬ」 dibaca...", options: ["NA","NI","NU","NE"], answer: "NU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ほ」 dibaca...", options: ["HA","HI","FU","HO"], answer: "HO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「む」 dibaca...", options: ["MA","MI","MU","ME"], answer: "MU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「り」 dibaca...", options: ["RA","RI","RU","RE"], answer: "RI", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「はな」 (bunga)", answer: "hana", hint: "Barisan H + N", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「もり」 (hutan)", answer: "mori", hint: "Barisan M + R", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana dakuon dengan bacaan romajinya.",
            pairs: [
              { kana: "ば", options: ["BA","PA","HA"], answer: "BA" },
              { kana: "ぷ", options: ["FU","PU","BU"], answer: "PU" },
              { kana: "べ", options: ["HE","BE","PE"], answer: "BE" }
            ],
            points: 30
          }
        ]
      }
    ]
  },
  {
    id: "bab-3",
    babNumber: "3",
    title: "Hiragana W-N-Youon",
    description: "",
    quizzes: [
      {
        id: "bab-3-kuis-1",
        title: "Kuis Hiragana Barisan W-N, Youon",
        estMinutes: 6,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「や」 dibaca...", options: ["YA","YU","YO","WA"], answer: "YA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「を」 dibaca...", options: ["WA","WO","N","O"], answer: "WO", points: 10 },
          { type: "multiple_choice", prompt: "Gabungan 「きゃ」 (youon) dibaca...", options: ["KYA","KIA","KA","KYU"], answer: "KYA", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「しゃしん」 (foto)", answer: "shashin", hint: "Mengandung youon しゃ", points: 20 },
          { type: "text_input", prompt: "Tulis romaji dari 「べんきょう」 (belajar)", answer: "benkyou", hint: "Mengandung youon きょ + bunyi panjang", points: 20 },
          {
            type: "matching",
            prompt: "Cocokkan huruf youon dengan bacaannya.",
            pairs: [
              { kana: "りゃ", options: ["RYA","RIA","RA"], answer: "RYA" },
              { kana: "しゅ", options: ["SHU","SU","SHO"], answer: "SHU" },
              { kana: "ちょ", options: ["CHO","TO","CHA"], answer: "CHO" }
            ],
            points: 25
          }
        ]
      }
    ]
  },
  {
    id: "bab-4",
    babNumber: "4",
    title: "Katakana A-K-S-T",
    description: "",
    quizzes: [
      {
        id: "bab-4-kuis-1",
        title: "Kuis Katakana Barisan A-K, S-T",
        estMinutes: 6,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ウ」 dibaca...", options: ["A","I","U","E"], answer: "U", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ケ」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ソ」 dibaca...", options: ["SA","SHI","SU","SO"], answer: "SO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ツ」 dibaca...", options: ["TA","CHI","TSU","TE"], answer: "TSU", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「カサ」 (payung, kata serapan)", answer: "kasa", hint: "Barisan K + S", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「テスト」 (test)", answer: "tesuto", hint: "Kata serapan bahasa Inggris", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan katakana dengan bacaan romajinya.",
            pairs: [
              { kana: "キ", options: ["KA","KI","KU"], answer: "KI" },
              { kana: "チ", options: ["CHI","SHI","TA"], answer: "CHI" },
              { kana: "セ", options: ["SA","SE","SO"], answer: "SE" }
            ],
            points: 30
          }
        ]
      }
    ]
  },
  {
    id: "bab-5",
    babNumber: "5",
    title: "Katakana N-H-M-R",
    description: "",
    quizzes: [
      {
        id: "bab-5-kuis-1",
        title: "Kuis Katakana Barisan N-H, M-R",
        estMinutes: 6,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ノ」 dibaca...", options: ["NA","NI","NU","NO"], answer: "NO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「フ」 dibaca...", options: ["HA","HI","FU","HO"], answer: "FU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「モ」 dibaca...", options: ["MA","MI","MU","MO"], answer: "MO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ル」 dibaca...", options: ["RA","RI","RU","RE"], answer: "RU", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「パン」 (roti)", answer: "pan", hint: "Diawali handakuon パ", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「カメラ」 (kamera)", answer: "kamera", hint: "Barisan K + M + R", points: 15 },
          {
            type: "matching",
            prompt: "Cocokkan katakana dengan bacaan romajinya.",
            pairs: [
              { kana: "ビ", options: ["BI","PI","HI"], answer: "BI" },
              { kana: "ポ", options: ["HO","BO","PO"], answer: "PO" },
              { kana: "ネ", options: ["NA","NE","NO"], answer: "NE" }
            ],
            points: 30
          }
        ]
      }
    ]
  },
  {
    id: "bab-6",
    babNumber: "6",
    title: "Katakana W-N-Youon",
    description: "",
    quizzes: [
      {
        id: "bab-6-kuis-1",
        title: "Kuis Katakana Barisan W-N, Youon",
        estMinutes: 7,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ヨ」 dibaca...", options: ["YA","YU","YO","WA"], answer: "YO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ン」 dibaca...", options: ["N","WO","WA","O"], answer: "N", points: 10 },
          { type: "multiple_choice", prompt: "Ejaan asing 「ファ」 dibaca...", options: ["FA","HA","FU","WA"], answer: "FA", points: 15 },
          { type: "text_input", prompt: "Tulis romaji dari 「コーヒー」 (kopi)", answer: "koohii", hint: "Perhatikan tanda bunyi panjang ー", points: 20 },
          { type: "text_input", prompt: "Tulis romaji dari 「シャワー」 (shower)", answer: "shawaa", hint: "Mengandung youon シャ + bunyi panjang", points: 20 },
          {
            type: "matching",
            prompt: "Cocokkan ejaan katakana asing dengan bacaannya.",
            pairs: [
              { kana: "ティ", options: ["TI","CHI","TE"], answer: "TI" },
              { kana: "ヴォ", options: ["VO","BO","WO"], answer: "VO" },
              { kana: "ウィ", options: ["WI","UI","VI"], answer: "WI" }
            ],
            points: 25
          }
        ]
      }
    ]
  }
];

/* Jangan diubah — dipakai quiz.js untuk membaca data di atas */
if (typeof module !== "undefined") { module.exports = SOAL_DATA; }
