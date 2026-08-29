/* ==========================================================================
   quiz.js — mesin latihan soal.
   Membaca data dari soal-data.js (SOAL_DATA). Jangan taruh soal di file ini,
   edit soal-data.js saja. Satu bab boleh punya banyak kuis (lihat "quizzes").
   ========================================================================== */

(function () {
  const listEl = document.getElementById("topic-list");
  const quizShell = document.getElementById("quiz-shell");
  const quizBody = document.getElementById("quiz-body");
  const resultWrap = document.getElementById("result-wrap");
  const listWrap = document.getElementById("list-wrap");

  if (!listEl) return; // halaman ini bukan latihan.html

  let currentBab = null;
  let currentQuiz = null;
  let currentIndex = 0;
  let answers = []; // { given, correct, points, earned }

  function maxPoints(quiz) {
    return quiz.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  }

  function babTotalPoints(bab) {
    return bab.quizzes.reduce((sum, q) => sum + maxPoints(q), 0);
  }

  function typeLabel(type) {
    if (type === "multiple_choice") return "Pilihan Ganda";
    if (type === "text_input") return "Menulis Romaji";
    if (type === "matching") return "menyusun jawaban (Dropdown)";
    return type;
  }

  /* ---------------- render daftar bab, tiap bab bisa punya banyak baris kuis ---------------- */
  function renderList() {
    listEl.innerHTML = "";
    SOAL_DATA.forEach((bab) => {
      const block = document.createElement("div");
      block.className = "topic-block";

      const rowsHtml = bab.quizzes.map((quiz) => `
        <div class="activity-row">
          <div class="activity-icon">📝</div>
          <div class="activity-info">
            <strong>${quiz.title}</strong>
            <span>${quiz.questions.length} soal campuran &middot; ±${quiz.estMinutes} menit &middot; Maks. ${maxPoints(quiz)} poin</span>
          </div>
          <button class="btn btn-primary btn-sm" data-bab="${bab.id}" data-quiz="${quiz.id}">Mulai Kuis</button>
        </div>
      `).join("");

      block.innerHTML = `
        <div class="topic-head">
          <div class="bab-num">${bab.babNumber}</div>
          <div>
            <h3>Bab ${bab.babNumber} — ${bab.title}</h3>
            <p class="small-note" style="margin-top:2px;">${bab.description}</p>
          </div>
          <div class="meta">${bab.quizzes.length} kuis &middot; Maks. ${babTotalPoints(bab)} poin</div>
        </div>
        <div class="activity-list">${rowsHtml}</div>
      `;
      listEl.appendChild(block);
    });

    listEl.querySelectorAll("[data-quiz]").forEach((btn) => {
      btn.addEventListener("click", () => startQuiz(btn.getAttribute("data-bab"), btn.getAttribute("data-quiz")));
    });
  }

  /* ---------------- mulai kuis ---------------- */
  function startQuiz(babId, quizId) {
    currentBab = SOAL_DATA.find((b) => b.id === babId);
    if (!currentBab) return;
    currentQuiz = currentBab.quizzes.find((q) => q.id === quizId);
    if (!currentQuiz) return;

    currentIndex = 0;
    answers = new Array(currentQuiz.questions.length).fill(null);

    listWrap.style.display = "none";
    resultWrap.classList.remove("active");
    quizShell.classList.add("active");
    renderQuestion();
    quizShell.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------------- render 1 soal ---------------- */
  function renderQuestion() {
    const q = currentQuiz.questions[currentIndex];
    const total = currentQuiz.questions.length;
    const pct = Math.round((currentIndex / total) * 100);

    let bodyHtml = `
      <div class="quiz-progress">
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="count">Soal ${currentIndex + 1} / ${total}</div>
      </div>
      <span class="q-type-tag">${typeLabel(q.type)}</span>
      <div class="q-prompt">${q.prompt}</div>
    `;

    if (q.type === "multiple_choice") {
      bodyHtml += `<div class="option-list" data-kind="mc">`;
      q.options.forEach((opt) => {
        const checked = answers[currentIndex] === opt ? "selected" : "";
        bodyHtml += `
          <label class="option-item ${checked}">
            <input type="radio" name="mc" value="${escapeAttr(opt)}" ${answers[currentIndex] === opt ? "checked" : ""}>
            <span>${opt}</span>
          </label>`;
      });
      bodyHtml += `</div>`;
    } else if (q.type === "text_input") {
      const val = answers[currentIndex] || "";
      bodyHtml += `
        <div class="text-input-row">
          <input type="text" id="text-answer" placeholder="Ketik jawabanmu di sini..." value="${escapeAttr(val)}" autocomplete="off">
          ${q.hint ? `<div class="hint-text">💡 Petunjuk: ${q.hint}</div>` : ""}
        </div>`;
    } else if (q.type === "matching") {
      const saved = answers[currentIndex] || {};
      bodyHtml += `<div class="match-list" data-kind="match">`;
      q.pairs.forEach((pair, i) => {
        bodyHtml += `
          <div class="match-row">
            <div class="kana-tile">${pair.kana}</div>
            <select data-pair="${i}">
              <option value="">— pilih bacaan —</option>
              ${pair.options.map(o => `<option value="${escapeAttr(o)}" ${saved[i] === o ? "selected" : ""}>${o}</option>`).join("")}
            </select>
          </div>`;
      });
      bodyHtml += `</div>`;
    }

    bodyHtml += `
      <div class="quiz-nav">
        <button class="btn btn-outline" id="btn-prev" ${currentIndex === 0 ? "disabled" : ""}>&larr; Sebelumnya</button>
        <button class="btn btn-primary" id="btn-next">${currentIndex === total - 1 ? "Selesai & Lihat Nilai" : "Lanjut →"}</button>
      </div>
    `;

    quizBody.innerHTML = bodyHtml;

    // interactions
    if (q.type === "multiple_choice") {
      quizBody.querySelectorAll(".option-item").forEach((el) => {
        el.addEventListener("click", () => {
          quizBody.querySelectorAll(".option-item").forEach((o) => o.classList.remove("selected"));
          el.classList.add("selected");
        });
      });
    }

    document.getElementById("btn-prev")?.addEventListener("click", () => {
      captureAnswer();
      currentIndex--;
      renderQuestion();
    });
    document.getElementById("btn-next").addEventListener("click", () => {
      captureAnswer();
      if (currentIndex < total - 1) {
        currentIndex++;
        renderQuestion();
      } else {
        finishQuiz();
      }
    });
  }

  function captureAnswer() {
    const q = currentQuiz.questions[currentIndex];
    if (q.type === "multiple_choice") {
      const checked = quizBody.querySelector('input[name="mc"]:checked');
      answers[currentIndex] = checked ? checked.value : null;
    } else if (q.type === "text_input") {
      const input = document.getElementById("text-answer");
      answers[currentIndex] = input ? input.value : "";
    } else if (q.type === "matching") {
      const selects = quizBody.querySelectorAll('select[data-pair]');
      const obj = {};
      selects.forEach((s) => { obj[s.getAttribute("data-pair")] = s.value; });
      answers[currentIndex] = obj;
    }
  }

  function normalize(str) {
    return (str || "").toString().trim().toLowerCase();
  }

  /* ---------------- selesai: hitung nilai & tampilkan sekali ---------------- */
  function finishQuiz() {
    let earned = 0;
    const total = maxPoints(currentQuiz);
    const reviewRows = [];

    currentQuiz.questions.forEach((q, i) => {
      const given = answers[i];
      if (q.type === "multiple_choice") {
        const correct = given === q.answer;
        if (correct) earned += q.points;
        reviewRows.push({
          correct,
          prompt: q.prompt,
          detail: correct ? `Benar (+${q.points} poin)` : `Jawabanmu: ${given ?? "(kosong)"} • Kunci: ${q.answer}`
        });
      } else if (q.type === "text_input") {
        const correct = normalize(given) === normalize(q.answer);
        if (correct) earned += q.points;
        reviewRows.push({
          correct,
          prompt: q.prompt,
          detail: correct ? `Benar (+${q.points} poin)` : `Jawabanmu: "${given || "(kosong)"}" • Kunci: "${q.answer}"`
        });
      } else if (q.type === "matching") {
        const obj = given || {};
        const n = q.pairs.length;
        const perPair = q.points / n;
        let rowEarned = 0;
        let correctCount = 0;
        q.pairs.forEach((pair, idx) => {
          if (obj[idx] === pair.answer) { rowEarned += perPair; correctCount++; }
        });
        rowEarned = Math.round(rowEarned);
        earned += rowEarned;
        reviewRows.push({
          correct: correctCount === n,
          prompt: q.prompt,
          detail: `${correctCount}/${n} pasangan benar (+${rowEarned} poin)`
        });
      }
    });

    renderResult(earned, total, reviewRows);
  }

  function renderResult(earned, total, rows) {
    quizShell.classList.remove("active");
    resultWrap.classList.add("active");

    const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
    let title = "Perlu latihan lagi";
    if (pct >= 90) title = "Sugoi! Hasil luar biasa 🎉";
    else if (pct >= 70) title = "Bagus sekali, hampir sempurna!";
    else if (pct >= 50) title = "Sudah lumayan, ayo diulang lagi!";

    resultWrap.innerHTML = `
      <div class="quiz-card">
        <div class="result-score" style="--pct:${pct}"><span>${pct}%</span></div>
        <h3 class="result-title">${title}</h3>
        <p class="result-sub">${currentQuiz.title} (Bab ${currentBab.babNumber}): kamu mendapat <strong>${earned}</strong> dari <strong>${total}</strong> poin.</p>
        <div class="result-review">
          ${rows.map(r => `
            <div class="review-row ${r.correct ? "correct" : "incorrect"}">
              <div class="mark">${r.correct ? "✓" : "✕"}</div>
              <div class="txt"><strong>${r.prompt}</strong><span>${r.detail}</span></div>
            </div>
          `).join("")}
        </div>
        <div class="result-actions">
          <button class="btn btn-primary" id="btn-retry">Ulangi Kuis Ini</button>
          <button class="btn btn-outline" id="btn-back">Kembali ke Daftar Bab</button>
        </div>
        <div class="result-note">ℹ️ Nilai ini hanya ditampilkan sekali dan tidak disimpan di sistem. Catat sendiri jika ingin melapor ke Sensei.</div>
      </div>
    `;

    document.getElementById("btn-retry").addEventListener("click", () => startQuiz(currentBab.id, currentQuiz.id));
    document.getElementById("btn-back").addEventListener("click", () => {
      resultWrap.classList.remove("active");
      listWrap.style.display = "block";
      listWrap.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  renderList();
})();
