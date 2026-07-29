const drawer = document.getElementById('drawer');
    const launcher = document.getElementById('launcher');
    const closeBtn = document.getElementById('closeBtn');
    const chat = document.getElementById('chat');
    const input = document.getElementById('input');
    const sendBtn = document.getElementById('sendBtn');
    const clearBtn = document.getElementById('clearBtn');
    const demoBtn = document.getElementById('demoBtn');
    const typing = document.getElementById('typing');
    const typingText = document.getElementById('typingText');
    const profileToggle = document.getElementById('profileToggle');
    const profileInfo = document.getElementById('profileInfo');
    const profileCloseBtn = document.getElementById('profileCloseBtn');
    const suggestionButtons = [...document.querySelectorAll('.suggestion')];

    // Chatbot ini memanggil proxy (Cloudflare Worker), BUKAN Groq langsung.
    // API key Groq disimpan aman sebagai secret di Cloudflare — tidak pernah ada di file ini
    // atau di repo GitHub. Lihat folder groq-proxy-worker/ untuk cara deploy proxy-nya.
    // Setelah deploy, ganti URL di bawah ini dengan URL worker kamu.
    const API_URL = "https://airi-groq-proxy.raditya-alfarezah12.workers.dev";
    const MODELS_TO_TRY = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
    const REQUEST_TIMEOUT_MS = 15000;
    const RETRY_DELAY_MS = 700;
    const MAX_ATTEMPTS_PER_MODEL = 2;

    const SYSTEM_PROMPT = `
Kamu adalah "Hoshizora Airi", asisten AI yang ceroboh, tsundere, lucu, dan tetap sopan.
Gaya bicara:
- kamu itu bagian dari klub bahasa dan budaya jepang SMAN 15 Surabaya yang namanya "TENGOKU". Lebih detail tentang tengoku di tengokulibels.github.io/about.
- Bahasa Indonesia ala ala anak muda gaul, santai, natural, singkat, dan jelas.
- Gaya bahasa mu itu "Aku, hehe, Hah?, owh baru tau, eh..., hmm?, ya..., yey, kamu" (jangan terlalu sering dipakai dan jangan terlalu banyak digunakan dalam 1 chat bersamaan, karena akan menimbulkan kesan lebay) memang gaul tapi tidak sampai bilang "lo, gue" gaul ala ala anak jepang cuman kamu pake bahasa indo.
- Jangan ada narasi adegan, ungkapkan ekspresimu hanya dengan kata katamu, tanpa perlu kalimat narasi miring.
- jangan terlalu sering pake awalan kata yang diulang, coba kamu cari sendiri gaya berbicaramu, sesuai sama anak perempuan ngomong.
- Kalau mau lebih detail, Kamu itu mirip kayak Serika dari Blue Archive, Komari Chika dari Anime Makeine, dan Atsuko Kagari digabung jadi satu.
- Kadang ngambek kalau dipuji, tapi tetap mau bantu.
- Tidak terlalu formal kecuali user meminta formal.
- kalau emang perlu, kasih langkah langkah yang jelas.
- gaul boleh, kasar dikit gk papa, asal tidak boleh membawa hinaan rasis.
- anggaplah dirimu seorang perempuan yang agak baperan.
- Kalau jawaban butuh kepastian, coba sok tau dikit, tapi setelah itu kasih tau user kalau itu candaan.
- Kalau memang jawaban tidak ada atau tidak tersedia di database, bilang saja kamu belum mempelajari hal itu di sekolah.
- chat tidak perlu terlalu panjang, tapi menggambarkan identitas mu. chat bisa panjang hanya ketika user meminta penjelasan detail.
Persona:
- Ceroboh tapi sedikit cerdas.
- Tsundere ringan: "ya gk bermaksud ngebantu sih..."
- Ramah, aman, dan helpful, kadang ceria, kadang mood-mood an.

Format jawaban:
- Jawaban ditampilkan dalam Markdown, jadi kamu BOLEH dan SEBAIKNYA pakai format berikut kalau relevan:
  - Link: [teks](https://url) — jangan cuma tulis url mentah kalau bisa dikasih teks yang jelas.
  - **bold**, *italic*, code inline pakai backtick, dan blok code pakai tiga backtick + nama bahasa (misal \`\`\`js).
  - List (- atau 1.) buat langkah-langkah atau poin-poin.
  - Tabel markdown kalau data cocok ditabelkan.
  - Rumus matematika pakai LaTeX: $...$ untuk inline (contoh: $x^2+y^2=r^2$) dan $$...$$ untuk rumus besar/terpisah baris.
  - Aksara asing (Jepang, Arab, Korea, Mandarin, dll) boleh ditulis langsung apa adanya, tidak perlu format khusus.
  - ketika user meminta menulis aksara jepang, seperti hiragana, katakana, kanji, tulis sesuai permintaan user dan tambahkan romaji dibawah tulisan tersebut
seperti contoh: あいり [enter kebawah barisan baru] *airi*.
- Tetap ringkas dan santai sesuai persona, jangan bikin jawaban jadi kaku cuma karena pakai markdown.
`.trim();

    const STORAGE_KEY = "airi-chat-history-v1";

    let messages = loadHistory();
    if (!messages.length) {
      messages = [
        {
          role: "assistant",
          content: "Aku Airi, coba tanya apa aja, asal sopan sama aku yah."
        }
      ];
    }

    function showProfileInfo() {
      profileInfo.classList.remove('hidden');
      profileToggle.setAttribute('aria-expanded', 'true');
    }

    function hideProfileInfo() {
      profileInfo.classList.add('hidden');
      profileToggle.setAttribute('aria-expanded', 'false');
    }

    function openDrawer() {
      drawer.classList.add('open');
      launcher.classList.add('hidden');
      hideProfileInfo();
      setTimeout(() => input.focus(), 120);
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      launcher.classList.remove('hidden');
      hideProfileInfo();
    }

    function autosize(el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }

    function saveHistory() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }

    function loadHistory() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }

    function esc(text) {
      return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
    }

    // Setup markdown parser: gfm biar dukung tabel/list, breaks biar newline tunggal jadi <br>.
    if (typeof marked !== 'undefined') {
      marked.setOptions({ gfm: true, breaks: true });
    }

    // Link hasil markdown dibuka di tab baru & aman (noopener/noreferrer).
    if (typeof DOMPurify !== 'undefined') {
      DOMPurify.addHook('afterSanitizeAttributes', (node) => {
        if (node.tagName === 'A') {
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener noreferrer');
        }
      });
    }

    function renderMarkdown(text) {
      if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        return esc(text); // fallback kalau CDN gagal dimuat (misal offline)
      }
      const rawHtml = marked.parse(String(text ?? ""));
      return DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
    }

    function render() {
      chat.innerHTML = messages.map((m) => `
        <div class="msg ${m.role === 'user' ? 'user' : 'bot'}">
          <div class="bubble">
            ${m.role === 'assistant' ? '<span class="small">Airi</span>' : ''}
            ${m.role === 'assistant'
              ? `<div class="md">${renderMarkdown(m.content)}</div>`
              : esc(m.content)}
          </div>
        </div>
      `).join('');
      chat.scrollTop = chat.scrollHeight;
      saveHistory();

      // Render rumus LaTeX ($...$, $$...$$, \(...\), \[...\]) jadi tampilan matematika.
      if (typeof renderMathInElement === 'function') {
        renderMathInElement(chat, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false }
          ],
          throwOnError: false
        });
      }
    }

    function setBusy(isBusy, statusText = "") {
      typing.classList.toggle('show', isBusy);
      if (typeof typingText !== "undefined" && typingText) {
        typingText.textContent = statusText || "Airi masih mikir... jangan ganggu ya.";
      }
      sendBtn.disabled = isBusy;
      input.disabled = isBusy;
      demoBtn.disabled = isBusy;
      clearBtn.disabled = isBusy;
      suggestionButtons.forEach(btn => btn.disabled = isBusy);
    }

    function fallbackReply(userText) {
      const t = userText.toLowerCase();
      if (t.includes("html") || t.includes("web") || t.includes("responsive")) {
        return "Bisa aja sih... cuman mau mu yang kayak gimana? jelasin detail dong.";
      }
      if (t.includes("nama") || t.includes("ide")) {
        return "Nama ya? coba ini: Airi, Hoshi, Yume, Nami, atau Kaze. Kalau mau, aku bisa bikin yang lebih lucu. hehe.";
      }
      if (t.includes("perkenalan")) {
        return "Contoh: 'Halo, nama saya ... Senang bertemu dengan kalian. Saya tertarik belajar dan ingin berkembang bersama.' Gampang kan? iya.. kan?";
      }
      if (t.includes("jepang") || t.includes("japanese") || t.includes("nihongo")) {
        return "Kalau bahas Jepang, aku bisa bantu hiragana, katakana, kanji, dan kalimat sederhana. Terserah kamu sih mau bahas apa dulu.";
      }
      return "Hmm... coba jelasih lagi sih... gk paham akunya, jujur.";
    }

    function sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function fetchWithTimeout(url, options, timeoutMs) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(new DOMException("Request timeout", "AbortError")), timeoutMs);
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timer));
    }

    function buildHeaders() {
      return {
        "Content-Type": "application/json"
      };
    }

    async function tryModel(userText, model) {
      const history = [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.slice(-10).map(m => ({
          role: m.role,
          content: m.content
        })),
        { role: "user", content: userText }
      ];

      const body = {
        model,
        messages: history,
        temperature: 0.8,
        max_tokens: 450
      };

      const res = await fetchWithTimeout(API_URL, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(body)
      }, REQUEST_TIMEOUT_MS);

      if (!res.ok) {
        throw new Error(`API error ${res.status}`);
      }

      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content?.trim();
      if (!text) {
        throw new Error("Empty response");
      }
      return text;
    }

    async function askAiri(userText) {
      let lastErr = null;

      for (const model of MODELS_TO_TRY) {
        for (let i = 0; i < MAX_ATTEMPTS_PER_MODEL; i++) {
          try {
            return await tryModel(userText, model);
          } catch (err) {
            lastErr = err;
            if (i < MAX_ATTEMPTS_PER_MODEL - 1) {
              await sleep(RETRY_DELAY_MS);
            }
          }
        }
      }

      throw lastErr || new Error("No response from AI");
    }

    async function send(text) {
      const userText = (text ?? input.value).trim();
      if (!userText) return;

      messages.push({ role: "user", content: userText });
      input.value = "";
      autosize(input);
      render();
      setBusy(true, "Airi lagi mikir... bentar ya.");

      try {
        const reply = await askAiri(userText);
        messages.push({ role: "assistant", content: reply });
      } catch (err) {
        console.error("Airi request failed:", err);
        messages.push({
          role: "assistant",
          content: fallbackReply(userText)
        });
      } finally {
        setBusy(false);
        render();
      }
    }

    launcher.addEventListener('click', openDrawer);
    closeBtn.addEventListener('click', closeDrawer);

    profileToggle.addEventListener('click', () => {
      if (profileInfo.classList.contains('hidden')) {
        showProfileInfo();
      } else {
        hideProfileInfo();
      }
    });

    profileCloseBtn.addEventListener('click', hideProfileInfo);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (!profileInfo.classList.contains('hidden')) {
          hideProfileInfo();
        } else {
          closeDrawer();
        }
      }
    });

    sendBtn.addEventListener('click', () => send());
    input.addEventListener('input', () => autosize(input));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        send();
      }
    });

    clearBtn.addEventListener('click', () => {
      messages = [{
        role: "assistant",
        content: "Udah bersih nih, Chat lagi coba."
      }];
      render();
    });

    demoBtn.addEventListener('click', () => {
      input.value = "Bantu aku bikin desain chatbot yang keren.";
      autosize(input);
      input.focus();
    });

    suggestionButtons.forEach(btn => {
      btn.addEventListener('click', () => send(btn.dataset.prompt));
    });

    // Start collapsed on desktop and mobile, like a floating assistant.
    render();
    autosize(input);
    closeDrawer();