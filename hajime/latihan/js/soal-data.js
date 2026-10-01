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

  >>> JANGAN MENGUBAH POIN YANG ADA <<<

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
          { type: "multiple_choice", prompt: "Huruf 「あ」 dibaca...", options: ["A","I","U","E"], answer: "A", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「き」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「か」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「お」 dibaca...", options: ["A","E","U","O"], answer: "O", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「け」 dibaca...", options: ["KA","KE","KI","KO"], answer: "KE", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ぐ", options: ["GI","GU","GA"], answer: "GU" },
              { kana: "い", options: ["A","I","E"], answer: "I" },
              { kana: "ご", options: ["GA","GE","GO"], answer: "GO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "え", options: ["E","A","O"], answer: "E" },
              { kana: "う", options: ["E","I","U"], answer: "U" },
              { kana: "げ", options: ["GE","GO","GA"], answer: "GE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「がっこう」 (sekolah)", answer: "gakkou", hint: "Barisan K + A", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「かお」 (wajah)", answer: "kao", hint: "Barisan K + A", points: 10 }
        ]
      },
      {
        id: "bab-1-kuis-2",
        title: "Kuis Dasar: Barisan S-T",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「せ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「す」 dibaca...", options: ["SA","SHI","SU","SE"], answer: "SU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「さ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ち」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "CHI", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "し", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "そ", options: ["SA","SO","SHI"], answer: "SO" },
              { kana: "て", options: ["TA","TE","TO"], answer: "TE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "じ", options: ["JI","ZU","ZA"], answer: "JI" },
              { kana: "だ", options: ["DA","DO","DE"], answer: "DA" },
              { kana: "ど", options: ["DO","DI","DA"], answer: "DO" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "Barisan S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「とし」 (tahun)", answer: "toshi", hint: "Barisan T + S", points: 10 }
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
          { type: "multiple_choice", prompt: "Huruf 「え」 dibaca...", options: ["A","I","E","O"], answer: "E", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ち」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "CHI", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「す」 dibaca...", options: ["SA","SHI","SU","SE"], answer: "SU", points: 5 },
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
              { kana: "ぜ", options: ["JI","ZE","ZA"], answer: "ZE" },
              { kana: "ご", options: ["GA","GO","GI"], answer: "GO" },
              { kana: "で", options: ["DA","DO","DE"], answer: "DE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "じ", options: ["JI","ZU","ZA"], answer: "JI" },
              { kana: "ぐ", options: ["GA","GO","GU"], answer: "GU" },
              { kana: "だ", options: ["DA","DO","DE"], answer: "DA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「すし」 (sushi)", answer: "sushi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「かさ」 (payung)", answer: "kasa", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「たこ」 (gurita/layangan)", answer: "tako", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「くつ」 (sepatu)", answer: "kutsu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「あつい」 (panas)", answer: "atsui", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「ね」 dibaca...", options: ["NA","NI","NE","NO"], answer: "NE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ぬ」 dibaca...", options: ["NA","NI","NU","NO"], answer: "NU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ふ」 dibaca...", options: ["HA","HI","FU","HE"], answer: "FU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「へ」 dibaca...", options: ["HA","HI","HE","HO"], answer: "HE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ほ」 dibaca...", options: ["HA","HI","FU","HO"], answer: "HO", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ひ", options: ["HI","HU","HA"], answer: "HI" },
              { kana: "の", options: ["NA","NO","NI"], answer: "NO" },
            { kana: "な", options: ["NA","NE","NO"], answer: "NA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ぶ", options: ["BI","BU","BA"], answer: "BU" },
              { kana: "ぺ", options: ["PA","PO","PE"], answer: "PE" },
              { kana: "ば", options: ["BA","BE","BO"], answer: "BA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「はなび」 (kembang api)", answer: "hanabi", hint: "Barisan H + N", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「かばん」 (tas)", answer: "kaban", hint: "Barisan K + H", points: 10 }
        ]
      },
      {
        id: "bab-2-kuis-2",
        title: "Kuis Dasar: Barisan M-R",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「め」 dibaca...", options: ["MA","MI","ME","MO"], answer: "ME", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「む」 dibaca...", options: ["MA","MI","MU","MO"], answer: "MU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「る」 dibaca...", options: ["RA","RI","RU","RE"], answer: "RU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「れ」 dibaca...", options: ["RA","RI","RE","RO"], answer: "RE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「も」 dibaca...", options: ["MA","MI","MU","MO"], answer: "MO", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "み", options: ["MI","MU","MA"], answer: "MI" },
              { kana: "ろ", options: ["RA","RO","RI"], answer: "RO" },
              { kana: "り", options: ["RA","RI","RO"], answer: "RI" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ら", options: ["RI","RU","RA"], answer: "RA" },
              { kana: "ま", options: ["MA","MO","MI"], answer: "MA" },
              { kana: "め", options: ["MA","ME","MO"], answer: "ME" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「みどり」 (hijau)", answer: "midori", hint: "Barisan M + T + R", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「まめ」 (kacang)", answer: "mame", hint: "Barisan M", points: 10 }
        ]
      },
      // coba check arsy, dibawah ini programnya bener ta gak 
      {
        id: "bab-2-kuis-3",
        title: "Uji Pemahaman: Campuran N-H-M-R",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「め」 dibaca...", options: ["NO","HE","ME","RA"], answer: "ME", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「な」 dibaca...", options: ["RO","HE","NI","NA"], answer: "NA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ひ」 dibaca...", options: ["NE","HI","RE","MO"], answer: "HI", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ろ」 dibaca...", options: ["MA","RO","BE","PA"], answer: "RO", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「る」 dibaca...", options: ["BI","NI","PO","RU"], answer: "RU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ぼ」 dibaca...", options: ["BO","ME","NU","HU"], answer: "BO", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "み", options: ["NI","MO","MI"], answer: "MI" },
              { kana: "ぶ", options: ["BU","MU","NA"], answer: "BU" },
              { kana: "の", options: ["NO","BA","NU"], answer: "NO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "べ", options: ["BI","BU","BE"], answer: "BE" },
              { kana: "も", options: ["HA","MO","MI"], answer: "MO" },
              { kana: "ぴ", options: ["PA","PE","PI"], answer: "PI" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ぱ", options: ["BA","MO","PA"], answer: "PA" },
              { kana: "ぷ", options: ["PU","PI","PO"], answer: "PU" },
              { kana: "ま", options: ["MA","HA","MO"], answer: "MA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「まくら」 (bantal)", answer: "makura", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「はぶらし」 (sikat gigi)", answer: "haburashi", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「なべ」 (panci)", answer: "nabe", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「くるま」 (mobil)", answer: "kuruma", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「のみます」 (minum)", answer: "nomimasu", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「わ」 dibaca...", options: ["HA","WO","N","WA"], answer: "WA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ん」 dibaca...", options: ["PI","YO","KA","N"], answer: "N", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「や」 dibaca...", options: ["HA","KA","WA","YA"], answer: "YA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「そ」 dibaca...", options: ["GA","SO","TSU","TA"], answer: "SO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「じ」 dibaca...", options: ["PE","BU","ZI","GO"], answer: "ZI", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "を", options: ["WO","GA","N"], answer: "WO" },
              { kana: "と", options: ["TO","MA","CHI"], answer: "TO" },
              { kana: "け", options: ["KE","ME","GI"], answer: "KE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ゆ", options: ["ME","NU","YU"], answer: "YU" },
              { kana: "み", options: ["MI","TE","NI"], answer: "MI" },
              { kana: "よ", options: ["SHI","YO","MA"], answer: "YO" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「りょうり」 (masakan)", answer: "ryouri", hint: "Barisan R + A", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「ごはん」 (nasi)", answer: "gohan", hint: "Barisan K + H", points: 10 }
        ]
      },
      // ingat bang, yang text gwh gak buat
      {
        id: "bab-3-kuis-2",
        title: "Kuis Dasar: Barisan Youon",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「きゃ」 dibaca...", options: ["PYO","HYA","KYA","KYO"], answer: "KYA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ちゅ」 dibaca...", options: ["BYA","SHO","GYO","CHA"], answer: "CHU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「みょ」 dibaca...", options: ["CHO","MYO","RYU","RYA"], answer: "MYO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ぴょ」 dibaca...", options: ["MYA","KYU","GYA","RYO"], answer: "PYO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「みゅ」 dibaca...", options: ["PYA","BYA","NYO","NYU"], answer: "NYU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ひゅ", options: ["PYA","HYU","BYA"], answer: "HYU" },
              { kana: "ちゃ", options: ["CHO","CHU","CHA"], answer: "CHA" },
              { kana: "しゃ", options: ["SHO","SHU","SHA"], answer: "SHA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "みゃ", options: ["MYA","MYO","MYU"], answer: "MYA" },
              { kana: "ぎゅ", options: ["GYA","GYU","GYO"], answer: "GYU" },
              { kana: "にゃ", options: ["NYA","NYO","NYU"], answer: "NYA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「たんじょうび」 (ulang tahun)", answer: "tanjoubi", hint: "Barisan T + S + H", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「ちゅうがっこう」 (SMP)", answer: "chuugakkou", hint: "Barisan T + K", points: 10 }
        ]
      },
      {
        id: "bab-3-kuis-3",
        title: "Uji Pemahaman: Campuran W-N-Youon",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ん」 dibaca...", options: ["GYO","N","KYU","WA"], answer: "N", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「を」 dibaca...", options: ["PYO","MYA","NYA","WO"], answer: "WO", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「きゃ」 dibaca...", options: ["NYA","KYA","GYO","WA"], answer: "KYA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「びゅ」 dibaca...", options: ["BYU","MYU","NYO","GYA"], answer: "BYU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ぴょ」 dibaca...", options: ["HYU","HYO","GYO","PYO"], answer: "PYO", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ちゃ」 dibaca...", options: ["NYU","JA","MYO","CHO"], answer: "CHA", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "じゃ", options: ["KYU","JA","RYO"], answer: "JA" },
              { kana: "りょ", options: ["GYU","RYO","MYA"], answer: "RYO" },
              { kana: "にゃ", options: ["CHU","NYA","HYA"], answer: "NYA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "わ", options: ["N","WA","KYO"], answer: "WA" },
              { kana: "じゅ", options: ["RYA","PYO","JU"], answer: "JU" },
              { kana: "にょ", options: ["PYU","BYU","NYO"], answer: "NYO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "きゅ", options: ["KYU","PYA","GYU"], answer: "KYU" },
              { kana: "みゃ", options: ["MYA","HYU","MYO"], answer: "MYA" },
              { kana: "しゅ", options: ["SHU","HYO","MYU"], answer: "SHU" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「ゆき」 (salju)", answer: "yuki", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「やま」 (gunung)", answer: "yama", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「しゅくだい」 (PR)", answer: "shukudai", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「りょこう」 (perjalanan)", answer: "ryokou", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ちゅうごく」 (Cina)", answer: "chuugoku", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「ぶ」 dibaca...", options: ["BA","PI","PU","BU"], answer: "BU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「れ」 dibaca...", options: ["RA","RE","RU","RO"], answer: "RE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「よ」 dibaca...", options: ["YA","RI","YU","YO"], answer: "YO", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "しゃ", options: ["SHI","SU","SHA"], answer: "SHA" },
              { kana: "ぎゃ", options: ["GYA","GO","GI"], answer: "GYA" },
              { kana: "りょ", options: ["RA","RYO","RYA"], answer: "RYO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "みょ", options: ["MI","MYO","MYA"], answer: "MYO" },
              { kana: "りゅ", options: ["RI","RYO","RYU"], answer: "RYU" },
              { kana: "にゅ", options: ["NYA","NI","NYU"], answer: "NYU" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan hiragana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ちゅ", options: ["SHI","CHU","SA"], answer: "CHU" },
              { kana: "ひゃ", options: ["TA","HYA","CHI"], answer: "HYA" },
              { kana: "しょ", options: ["JA","SHI","SHO"], answer: "SHO" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「とうきょう」 (Tokyo)", answer: "toukyou", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ふゆ」 (musim dingin)", answer: "fuyu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「やきゅう」 (baseball)", answer: "yakyuu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ゆき」 (salju)", answer: "yuki", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「せかい」 (dunia)", answer: "sekai", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「カ」 dibaca...", options: ["I","KA","KO","A"], answer: "KA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ゲ」 dibaca...", options: ["GO","O","GE","KE"], answer: "GE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ク」 dibaca...", options: ["GA","GI","KU","E"], answer: "KU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ギ」 dibaca...", options: ["KO","KI","E","GI"], answer: "GI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ア」 dibaca...", options: ["A","I","KI","GI"], answer: "A", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "キ", options: ["GI","GA","KI"], answer: "KI" },
              { kana: "オ", options: ["O","A","I"], answer: "O" },
              { kana: "コ", options: ["GA","GE","KO"], answer: "KO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "エ", options: ["GE","KO","E"], answer: "E" },
              { kana: "イ", options: ["A","I","KE"], answer: "I" },
              { kana: "ウ", options: ["KO","GO","U"], answer: "U" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「ケーキ」 (kue)", answer: "keeki", hint: "Barisan K, Menggunakan pemanjangan vokal.", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「コイ」 (cinta)", answer: "koi", hint: "Barisan K + A", points: 10 }
        ]
      },
      {
        id: "bab-4-kuis-2",
        title: "Kuis Dasar: Barisan S-T",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「セ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ツ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「サ」 dibaca...", options: ["SHI","TE","TO","SA"], answer: "SA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ソ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「チ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "CHI", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "シ", options: ["SHI","SU","SA"], answer: "SHI" },
              { kana: "ト", options: ["TA","TO","CHI"], answer: "TO" },
              { kana: "デ", options: ["SHI","TA","DE"], answer: "DE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ザ", options: ["ZI","ZU","ZA"], answer: "ZA" },
              { kana: "テ", options: ["TE","TO","SA"], answer: "TE" },
              { kana: "ヅ", options: ["TSU","SHI","DU"], answer: "DU" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「テスト」 (tes)", answer: "tesuto", hint: "Barisan T + S", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「サーカス」 (sirkus)", answer: "saakasu", hint: "Barisan S + K", points: 10 }
        ]
      },
      {
        id: "bab-4-kuis-3",
        title: "Uji Pemahaman: Campuran A-K-S-T",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「セ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "SE", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ツ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ク」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「エ」 dibaca...", options: ["E","A","I","O"], answer: "E", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「カ」 dibaca...", options: ["GA","CHI","TSU","KA"], answer: "KA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「グ」 dibaca...", options: ["GA","GI","GU","GE"], answer: "GU", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ダ", options: ["SHI","TSU","DA"], answer: "DA" },
              { kana: "ガ", options: ["GA","KU","TE"], answer: "GA" },
              { kana: "ゾ", options: ["A","ZO","O"], answer: "ZO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "イ", options: ["U","I","A"], answer: "I" },
              { kana: "ゴ", options: ["O","GO","CHI"], answer: "GO" },
              { kana: "コ", options: ["KA","KE","KO"], answer: "KO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ク", options: ["KU","U","A"], answer: "KU" },
              { kana: "タ", options: ["TA","TO","CHI"], answer: "TA" },
              { kana: "キ", options: ["KA","KE","KO"], answer: "KI" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「スカート」 (rok)", answer: "sukaato", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「アイス」 (es krim)", answer: "aisu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ガス」 (gas)", answer: "gasu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「タクシー」 (taksi)", answer: "takushii", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「トースト」 (roti panggang)", answer: "toosuto", hint: "-", points: 5 }
        ]
      }
    ]
  },
  // checkpoint arsy, checkpoint galih
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
          { type: "multiple_choice", prompt: "Huruf 「ナ」 dibaca...", options: ["NA","NI","NU","NO"], answer: "NA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ニ」  dibaca...", options: ["HI","NE","NI","HA"], answer: "NI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ヌ」 dibaca...", options: ["NO","NU","HE","NA"], answer: "NU", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ハ」 dibaca...", options: ["HO","HA","NE","NU"], answer: "HA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ヒ」 dibaca...", options: ["HI","NA","HO","NI"], answer: "HI", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ネ", options: ["NE","NU","HE"], answer: "NE" },
              { kana: "フ", options: ["HI","FU","HO"], answer: "FU" },
              { kana: "ノ", options: ["NO","HA","HO"], answer: "NO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ヘ", options: ["HE","HE","NU"], answer: "HE" },
              { kana: "ベ", options: ["BE","HE","BO"], answer: "BE" },
              { kana: "パ", options: ["HA","PA","PI"], answer: "PA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「ベッド」 (kasur)", answer: "beddo", hint: "Barisan H + T", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「ナイフ」 (pisau)", answer: "naifu", hint: "Barisan N + H", points: 10 }
        ]
      },
      {
        id: "bab-5-kuis-2",
        title: "Kuis Dasar: Barisan M-R",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「マ」 dibaca...", options: ["MA","MI","ME","RO"], answer: "MA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「リ」 dibaca...", options: ["RE","RI","MO","RU"], answer: "RI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「メ」 dibaca...", options: ["RE","MO","ME","RU"], answer: "ME", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ロ」 dibaca...", options: ["RO","RA","MI","RE"], answer: "RO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ム」 dibaca...", options: ["ME","MU","MA","LE"], answer: "MU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ミ", options: ["MI","RE","MO"], answer: "MI" },
              { kana: "ラ", options: ["RA","RU","ME"], answer: "RA" },
              { kana: "モ", options: ["MO","MA","RI"], answer: "MO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ル", options: ["RU","RO","MA"], answer: "RU" },
              { kana: "レ", options: ["RE","MI","MU"], answer: "RE" },
              { kana: "リ", options: ["RI","RO","ME"], answer: "RI" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「メール」 (surat)", answer: "meeru", hint: "Barisan M + R", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「ドラマ」 (drama)", answer: "dorama", hint: "Barisan T + R + M", points: 10 }
        ]
      },
      {
        id: "bab-5-kuis-3",
        title: "Uji Pemahaman: Campuran N-H-M-R",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ナ」 dibaca...", options: ["NA","HO","MI","RE"], answer: "NA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「フ」 dibaca...", options: ["HE","FU","MA","NO"], answer: "FU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「メ」 dibaca...", options: ["MO","ME","RA","HI"], answer: "ME", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「リ」 dibaca...", options: ["RU","NI","RI","HA"], answer: "RI", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ホ」 dibaca...", options: ["HO","NE","MU","RO"], answer: "HO", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「レ」 dibaca...", options: ["NI","RI","RE","HO"], answer: "RE", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ニ", options: ["NI","MA","HE"], answer: "NI" },
              { kana: "ハ", options: ["HI","HA","NO"], answer: "HA" },
              { kana: "ミ", options: ["MI","FU","RE"], answer: "MI" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ヌ", options: ["NU","MO","RI"], answer: "NU" },
              { kana: "ラ", options: ["RA","NE","HO"], answer: "RA" },
              { kana: "ヘ", options: ["KA","KE","KO"], answer: "HE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ネ", options: ["NE","MI","RO"], answer: "NE" },
              { kana: "ム", options: ["HA","MU","RI"], answer: "MU" },
              { kana: "ロ", options: ["RO","NA","HE"], answer: "RO" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「クリスマス」 (natal)", answer: "kurisumasu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「アルバイト」 (kerja paruh waktu)", answer: "arubaito", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「クラス」 (kelas)", answer: "kurasu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ネクタイ」 (dasi)", answer: "nekutai", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「サイコロ」 (dadu)", answer: "saikoro", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「ン」 dibaca...", options: ["TSU","SHI","SO","N"], answer: "N", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ヤ」 dibaca...", options: ["YA","KA","YU","YO"], answer: "YA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ヲ」 dibaca...", options: ["HE","FU","WO","RE"], answer: "WO", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「カ」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "KA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「グ」 dibaca...", options: ["RE","FU","KU","GU"], answer: "GU", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ユ", options: ["SHI","SU","SA"], answer: "YU" },
              { kana: "シ", options: ["N","TSU","SHI"], answer: "SHI" },
              { kana: "ソ", options: ["SHI","N","SO"], answer: "SO" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ヨ", options: ["RO","YO","WO"], answer: "YO" },
              { kana: "ワ", options: ["TA","TO","CHI"], answer: "WA" },
              { kana: "レ", options: ["RE","FU","HE"], answer: "RE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「コンサート」 (konser)", answer: "konsaato", hint: "Barisan K + S + T", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「プリン」 (pudding)", answer: "purin", hint: "Barisan H + R", points: 10 }
        ]
      },
      {
        id: "bab-6-kuis-2",
        title: "Kuis Dasar: Barisan Youon",
        estMinutes: 5,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ファ」 dibaca...", options: ["FO","FI","FA","FU"], answer: "FA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「フィ」 dibaca...", options: ["FI","FU","FE","FO"], answer: "FI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「ヴァ」 dibaca...", options: ["VA","VI","VU","VE"], answer: "VA", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「チィ」 dibaca...", options: ["TA","TI","DI","TE"], answer: "TI", points: 10 },
          { type: "multiple_choice", prompt: "Huruf 「クァ」 dibaca...", options: ["KWA","KWE","KWO","FO"], answer: "KWA", points: 10 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "キォ", options: ["KWO","KWE","KWA"], answer: "KWO" },
              { kana: "トゥ", options: ["DU","TU","TI"], answer: "TU" },
              { kana: "ツァ", options: ["TSA","JE","SHE"], answer: "TSA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ヴ", options: ["VI","VA","VU"], answer: "VU" },
              { kana: "フェ", options: ["FA","FE","FO"], answer: "FE" },
              { kana: "チェ", options: ["CHE","SHE","JE"], answer: "CHE" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「キャンプ」 (kamp)", answer: "kyanpu", hint: "Barisan K + H", points: 10 },
          { type: "text_input", prompt: "Tulis romaji dari 「ニュース」 (berita)", answer: "nyuusu", hint: "Barisan N + S", points: 10 }
        ]
      },
      {
        id: "bab-6-kuis-3",
        title: "Uji Pemahaman: Campuran W-N-Youon",
        estMinutes: 8,
        questions: [
          { type: "multiple_choice", prompt: "Huruf 「ビャ」 dibaca...", options: ["BYO","BYU","BYA","BI"], answer: "BYA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ワ」 dibaca...", options: ["WA","WO","FU","TO"], answer: "WA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「キャ」 dibaca...", options: ["KYU","KYO","KYA","KI"], answer: "KYA", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「チュ」 dibaca...", options: ["CHU","SHI","CHA","CHO"], answer: "CHU", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ン」 dibaca...", options: ["SHI","SO","TSU","N"], answer: "N", points: 5 },
          { type: "multiple_choice", prompt: "Huruf 「ヨ」 dibaca...", options: ["YO","RO","YA","YU"], answer: "YO", points: 5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "シャ", options: ["SHI","SO","SHA"], answer: "SHA" },
              { kana: "ニャ", options: ["NI","NYO","NYA"], answer: "NYA" },
              { kana: "ヒャ", options: ["HYO","HYA","HI"], answer: "HYA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "リュ", options: ["RYO","RYU","RI"], answer: "RYU" },
              { kana: "ニョ", options: ["NI","NYO","NYA"], answer: "NYO" },
              { kana: "ジャ", options: ["SHI","JA","SHA"], answer: "JA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ピュ", options: ["PYA","PYU","PI"], answer: "PYU" },
              { kana: "キュ", options: ["KI","KYU","KYO"], answer: "KYU" },
              { kana: "ピャ", options: ["PYU","PYA","PI"], answer: "PYA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「コンピューター」 (komputer)", answer: "konpyuutaa", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「キャベツ」 (kubis)", answer: "kyabetsu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「シャンプー」 (shampo)", answer: "shanpuu", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「パン」 (roti)", answer: "pan", hint: "-", points: 5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ワクチン」 (vaksin)", answer: "wakuchin", hint: "-", points: 5 }
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
          { type: "multiple_choice", prompt: "Huruf 「あ」 dibaca...", options: ["A","I","E","O"], answer: "A", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「つ」 dibaca...", options: ["TA","CHI","TSU","TO"], answer: "TSU", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「こ」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KO", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「ち」 dibaca...", options: ["SA","SHI","SE","SO"], answer: "CHI", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「ん」 dibaca...", options: ["O","N","WO","MA"], answer: "N", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「ワ」 dibaca...", options: ["HE","RE","FA","WA"], answer: "WA", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「か」 dibaca...", options: ["KA","KI","KE","KO"], answer: "KA", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「め」 dibaca...", options: ["MA","ME","MU","MO"], answer: "ME", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「ヲ」 dibaca...", options: ["WA","WO","FU","RE"], answer: "WO", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「ン」 dibaca...", options: ["TSU","SHI","SO","N"], answer: "N", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「シ」 dibaca...", options: ["TSU","N","SHI","SO"], answer: "SHI", points: 2.5 },
          { type: "multiple_choice", prompt: "Huruf 「カ」 dibaca...", options: ["KA","KI","KU","KE"], answer: "KA", points: 2.5 },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "じ", options: ["SHI","JI","SA"], answer: "JI" },
              { kana: "きょ", options: ["KYU","KYA","KYO"], answer: "KYO" },
              { kana: "みょ", options: ["MI","MYA","MYO"], answer: "MYO" },
              { kana: "ギョ", options: ["GYO","GI","GYA"], answer: "GYO" },
              { kana: "キャ", options: ["KI","KYA","KE"], answer: "KYA" },
              { kana: "ファ", options: ["FO","FU","FA"], answer: "FA" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "フォ", options: ["FA","FU","FO"], answer: "FO" },
              { kana: "ふ", options: ["FU","FA","PU"], answer: "FU" },
              { kana: "ガ", options: ["KA","GA","KE"], answer: "GA" },
              { kana: "ベ", options: ["BE","PE","HE"], answer: "BE" },
              { kana: "びょ", options: ["BYO","BI","BYA"], answer: "BYO" },
              { kana: "げ", options: ["GA","GE","KE"], answer: "GE" }
            ],
            points: 15
          },
          {
            type: "matching",
            prompt: "Cocokkan katakana campuran dengan bacaan romajinya.",
            pairs: [
              { kana: "ボ", options: ["BO","SU","SA"], answer: "BO" },
              { kana: "デ", options: ["TE","CHI","DE"], answer: "DE" },
              { kana: "れ", options: ["RE","FU","HE"], answer: "RE" },
              { kana: "ル", options: ["RO","RI","RU"], answer: "RU" },
              { kana: "ど", options: ["TO","DO","TA"], answer: "DO" },
              { kana: "ジャ", options: ["SHA","JA","JI"], answer: "JA" }
            ],
            points: 15
          },
          { type: "text_input", prompt: "Tulis romaji dari 「あつい」 (panas)", answer: "atsui", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「タコ」 (gurita)", answer: "tako", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ネクタイ」 (dasi)", answer: "nakutai", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「まつり」 (festival)", answer: "matsuri", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「チョコレエト」 (cokelat)", answer: "chokoreeto", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「コーヒー」 (kopi)", answer: "koohii", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ばんごはん」 (makan malam)", answer: "bangohan", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「いしゃ」 (dokter)", answer: "isha", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「にほんじん」 (orang Jepang)", answer: "nihonjin", hint: "-", points: 2.5 },
          { type: "text_input", prompt: "Tulis romaji dari 「ぎんこう」 (bank)", answer: "ginkou", hint: "-", points: 2.5 }
        ]
      }
    ]
  }
];

/* Jangan diubah — dipakai quiz.js untuk membaca data di atas */
if (typeof module !== "undefined") { module.exports = SOAL_DATA; }
