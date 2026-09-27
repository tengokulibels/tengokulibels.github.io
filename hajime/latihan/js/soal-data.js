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

  >>> JANGAN MERUBAH POIN YANG ADA <<<

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
        title: "Kuis Dasar: Barisan A-K",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-1-kuis-2",
        title: "Kuis Dasar: Barisan S-T",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-1-kuis-3",
        title: "Uji Pemahaman: Campuran A-K-S-T",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
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
        title: "Kuis Dasar: Barisan N-H",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-2-kuis-2",
        title: "Kuis Dasar: Barisan M-R",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-2-kuis-3",
        title: "Uji Pemahaman: Campuran N-H-M-R",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
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
        title: "Kuis Dasar: Barisan W-N",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-3-kuis-2",
        title: "Kuis Dasar: Barisan Youon",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-3-kuis-3",
        title: "Uji Pemahaman: Campuran W-N-Youon",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
        ]
      }
    ]
  },
  {
    id: "bab-h-uji-hiragana",
    babNumber: "%",
    title: "Uji Pemahaman",
    description: "",
    quizzes: [
      {
        id: "bab-h-uji",
        title: "Uji Pemahaman: Seluruh Hiragana",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
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
        title: "Kuis Dasar: Barisan A-K",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-4-kuis-2",
        title: "Kuis Dasar: Barisan S-T",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-4-kuis-3",
        title: "Uji Pemahaman: Campuran A-K-S-T",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
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
        title: "Kuis Dasar: Barisan N-H",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-5-kuis-2",
        title: "Kuis Dasar: Barisan M-R",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-5-kuis-3",
        title: "Uji Pemahaman: Campuran N-H-M-R",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
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
        title: "Kuis Dasar: Barisan W-N",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-6-kuis-2",
        title: "Kuis Dasar: Barisan Youon",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-6-kuis-3",
        title: "Uji Pemahaman: Campuran W-N-Youon",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 }
        ]
      },
    ]
  },
  {
    id: "bab-k-uji-katakana",
    babNumber: "%",
    title: "Uji Pemahaman",
    description: "",
    quizzes: [
      {
        id: "bab-k-uji",
        title: "Uji Pemahaman: Hiragana - Katakana",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「く」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 2.5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" },
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" },
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" },
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "と", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "け", options: ["KA","KE","KO"], answer: "KE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 2.5 }
        ]
      }
    ]
  }
];

/* Jangan diubah — dipakai quiz.js untuk membaca data di atas */
if (typeof module !== "undefined") { module.exports = SOAL_DATA; }
