const sheetURL = "https://docs.google.com/spreadsheets/d/1AOcwC1WhtXLVLZODmPEs9oaN8oCsD68dwvEd4OzhU7c/export?format=csv";

let blocks=[];
let answers={};
let ragu={};
let submitted=false;
let tabCount=0;

window.onload = function() {
    document.getElementById("popupOverlay").style.display = "flex";
};

// ===== START EXAM =====
function startExam() {
    openFullscreen();

    // tutup popup
    document.getElementById("popupOverlay").style.display = "none";
}

// ===== FULLSCREEN =====
function openFullscreen() {
    let elem = document.documentElement;

    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
    }
}

document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !submitted) {
        showPopupfulls();
    }
});

function showPopupfulls(){
	if(submitted) return;
    const div=document.createElement("div");
    div.className="popup-overlay";
    div.innerHTML=`
    <div class="popup-box">
        <p>Harap tetap didalam mode fullscreen!</p>
        <button class="popup-btn" onclick="this.closest('.popup-overlay').remove(); openFullscreen()">Kembali</button>
    </div>`;
    document.body.appendChild(div);
}

/* IMAGE FIX (3 FALLBACK) */
function convertDrive(link){
    if(!link) return "";

    const id = link.match(/[-\w]{25,}/);

    if(!id) return link;

    return `https://lh3.googleusercontent.com/d/${id[0]}`;
}

/* CSV */
function parseCSV(text){
    const rows=[];
    let row=[],cur='',q=false;

    for(let c of text){
        if(c=='"') q=!q;
        else if(c==','&&!q){row.push(cur);cur='';}
        else if((c=='\n'||c=='\r')&&!q){
            if(cur||row.length){row.push(cur);rows.push(row);row=[];cur='';}
        } else cur+=c;
    }
    if(cur||row.length){row.push(cur);rows.push(row);}
    return rows;
}

function clean(t){return (t||"").trim().normalize("NFC");}

/* LOAD */
fetch(sheetURL)
.then(r=>r.text())
.then(data=>build(parseCSV(data)));

function build(rows){
	// HEADER IMAGE (baris ke-2 kolom J)
if(rows[1] && rows[1][9]){
    const id = (rows[1][9].match(/[-\w]{25,}/)||[''])[0];
    const img = document.getElementById("headerImg");

    img.src = `https://drive.google.com/thumbnail?id=${id}&sz=w2000`;
}
    let qIndex=0;
    const container=document.getElementById("content");

    rows.forEach(row=>{
        const kode=clean(row[0]);
        const isi=clean(row[1]);
        const jenis=clean(row[2]);

        if(kode==="INF"){
            let idx=Math.min(...[isi.indexOf("."), isi.indexOf("。")].filter(i=>i!=-1));
            let title=idx!=-1?isi.slice(0,idx+1):isi;
            let desc=idx!=-1?isi.slice(idx+1):"";

            container.innerHTML+=`
            <div class="card">
                <h3>${title}</h3>
                <p>${desc}</p>
                ${row[9]?`<img
    src="${convertDrive(row[9])}"
    loading="lazy"
    referrerpolicy="no-referrer"
    onerror="this.onerror=null;
    this.src='https://drive.google.com/thumbnail?id=${(row[9].match(/[-\\w]{25,}/)||[''])[0]}&sz=w2000';"><br>`:``}
            </div>`;
        }

        else if(!isNaN(parseInt(kode))){
            const pilihan=[row[3],row[4],row[5],row[6]];
            const jawaban=clean(row[7]);
            const poin=parseInt(row[8])||0;

            blocks.push({jenis,jawaban,poin});

            let html=`<div class="card" id="q${qIndex}">
            <div class="question-text"><b>${kode}. ${isi}</b></div>`;

            if(row[9]){
    html+=`<img 
    src="${convertDrive(row[9])}" 
    loading="lazy"
    referrerpolicy="no-referrer"
    onerror="this.onerror=null;
    this.src='https://drive.google.com/thumbnail?id=${(row[9].match(/[-\\w]{25,}/)||[''])[0]}&sz=w2000';">`;
}

// ===== OPSI / INPUT =====
if(jenis==="PG"){
    pilihan.forEach((p,i)=>{
        const val=String.fromCharCode(65+i);
        html+=`
        <div class="option" onclick="selectOption(${qIndex},'${val}',this)">
        <b>${val}.</b> ${p}
        </div>`;
    });
}else{
    html+=`<input type="text" onchange="save(${qIndex},this.value)">`;
}
            html+=`
            <div class="ragu-btn" onclick="toggleRagu(${qIndex},this)">Ragu</div></div>`;
            container.innerHTML+=html;
            numberPanel.innerHTML+=`
            <div class="num-btn" id="num${qIndex}" onclick="scrollToQ(${qIndex})">${qIndex+1}</div>
            `;

            qIndex++;
        }
    });
}

/* SELECT */
function selectOption(i,val,el){
    answers[i]=val;
    el.parentElement.querySelectorAll('.option').forEach(o=>o.classList.remove('active'));
    el.classList.add('active');
    updatePanel();
}

function save(i,val){
    answers[i]=clean(val);
    updatePanel();
}

function toggleRagu(i,el){
    ragu[i]=!ragu[i];
    el.classList.toggle("active");
    document.getElementById("q"+i).classList.toggle("ragu-card");
    updatePanel();
    updateRaguPopup();
}

let prevAtas = 0;
let prevBawah = 0;

function updateRaguPopup(){

    let atas=0, bawah=0;

    Object.keys(ragu).forEach(i=>{
        if(!ragu[i]) return;

        const el=document.getElementById("q"+i);
        const rect=el.getBoundingClientRect();

        if(rect.bottom < 0) atas++;
        else if(rect.top > window.innerHeight) bawah++;
    });

    // ===== ATAS =====
    let topEl = document.querySelector(".ragu-top");

    if(atas > 0){
        if(!topEl){
            topEl = document.createElement("div");
            topEl.className="ragu-info ragu-top";
            document.body.appendChild(topEl);

            // force reflow biar animasi pertama muncul
            topEl.offsetHeight;
            requestAnimationFrame(()=>topEl.classList.add("show"));
        }
        topEl.innerHTML = `↑ ${atas} soal ragu di atas`;
    }else if(topEl){
        topEl.classList.remove("show");
        setTimeout(()=>topEl.remove(),250);
    }

    // ===== BAWAH =====
    let botEl = document.querySelector(".ragu-bottom");

    if(bawah > 0){
        if(!botEl){
            botEl = document.createElement("div");
            botEl.className="ragu-info ragu-bottom";
            document.body.appendChild(botEl);

            botEl.offsetHeight;
            requestAnimationFrame(()=>botEl.classList.add("show"));
        }
        botEl.innerHTML = `↓ ${bawah} soal ragu di bawah`;
    }else if(botEl){
        botEl.classList.remove("show");
        setTimeout(()=>botEl.remove(),250);
    }

    prevAtas = atas;
    prevBawah = bawah;
}

window.addEventListener("scroll", updateRaguPopup);

function updatePanel(){
    blocks.forEach((b,i)=>{
        const el=document.getElementById("num"+i);
        el.classList.remove("answered","ragu");

        if(ragu[i]) el.classList.add("ragu");
        else if(answers[i]) el.classList.add("answered");
    });
}

/* SCROLL CENTER PERFECT */
function scrollToQ(i){
    const el = document.getElementById("q"+i);
    const y = el.offsetTop - (window.innerHeight/2) + (el.offsetHeight/2);

    window.scrollTo({top:y, behavior:"smooth"});

    togglePanel();
}

/* PANEL */
function togglePanel(){
    document.getElementById("panelWrap").classList.toggle("open");
}

/* POPUP */
function showPopup(text){
    const div=document.createElement("div");
    div.className="popup-overlay";
    div.innerHTML=`
    <div class="popup-box">
        <p>${text}</p>
        <button class="popup-btn" onclick="this.closest('.popup-overlay').remove()">Kembali</button>
    </div>`;
    document.body.appendChild(div);
}

// LOCKEXAM
function lockExam(){
    document.body.innerHTML = `
    <div style="
        display:flex;
        height:100vh;
        justify-content:center;
        align-items:center;
        background:#000;
        color:#fff;
        font-size:22px;">
        UJIAN DIHENTIKAN (TERDETEKSI CURANG)
    </div>`;
}

/* TAB COUNT */
document.addEventListener("visibilitychange",()=>{
    if(document.hidden && !submitted){
        tabCount++;
        document.body.style.filter="blur(8px)";
        showPopup("Jangan pindah tab!");
        
        if(tabCount > 3){
    		lockExam();
		}
    }else{
        document.body.style.filter="none";
    }
});

/* SECURITY */

// disable klik kanan
document.addEventListener("contextmenu", e => e.preventDefault());

// disable shortcut inspect & devtools
document.addEventListener("keydown", e => {
    if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I","J","C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
    ){
        e.preventDefault();
    }
});

// disable copy paste dll
["copy","cut","paste","selectstart","dragstart"].forEach(ev=>{
    document.addEventListener(ev, e => e.preventDefault());
});


/* SUBMIT */
quizForm.addEventListener("submit", e => {
    e.preventDefault();

    showConfirmPopup();
});

function showConfirmPopup(){
    const div = document.createElement("div");
    div.className = "popup-overlay";

    div.innerHTML = `
    <div class="popup-box">
        <p><b>Yakin ingin mengumpulkan?</b></p>
        <p style="font-size:14px;color:#555;">Pastikan semua jawaban sudah terisi.</p>
        
        <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
            <button class="popup-btn" style="background:#9e9e9e; font-family: 'Nunito', sans-serif; font-weight: 600;"
                onclick="this.closest('.popup-overlay').remove()">
                Kembali
            </button>

            <button class="popup-btn" style="background:#00c853; font-family: 'Nunito', sans-serif; font-weight: 600;"
                onclick="submitQuiz(this)">
                Ya, Kirim
            </button>
        </div>
    </div>`;

    document.body.appendChild(div);
}

function submitQuiz(btn){
    if(submitted) return;

    btn.closest('.popup-overlay').remove();

    const submitBtn = document.querySelector(".submit-btn");
    submitBtn.disabled = true;
    submitBtn.innerText = "Mengirim...";
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";

    let nilai=0,pg=[],is=[];

    blocks.forEach((b,i)=>{
        let ans=answers[i]||"";
        if(b.jenis==="PG"){
            pg.push(ans);
            if(ans===b.jawaban) nilai+=b.poin;
        }else{
            is.push(ans);
            if(ans===b.jawaban) nilai+=b.poin;
        }

        document.querySelectorAll(".option, .ragu-btn, input").forEach(el=>{
            el.style.pointerEvents="none";
            el.style.opacity="0.6";
        });
    });

    const status = tabCount>0 ? `Buka APP ${tabCount}x` : "Aman";

    const fd=new FormData();
    fd.append("entry.1478007969", nama.value);
    fd.append("entry.666362765", kelas.value);
    fd.append("entry.2147240970", kode.value);
    fd.append("entry.361579512", pg.join(","));
    fd.append("entry.181864295", is.join(","));
    fd.append("entry.206293474", nilai);
    fd.append("entry.42561335", status);

    fetch("https://docs.google.com/forms/d/e/1FAIpQLSfdyyLTBaRID0-C-Xx2gndHA2e-pCBNiH4PWgJJOtQnyV1gfA/formResponse",{
        method:"POST",
        mode:"no-cors",
        body:fd
    }).then(()=>{
        submitted=true;
        submitBtn.innerText = "Terkirim ✔";
  		submitBtn.classList.add('no-shadow');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        showPopup("Jawaban berhasil dikirim!");
    });
}

window.addEventListener("load", () => {
    const sticky = document.querySelector(".header-sticky");
    const trigger = 200; // titik muncul sticky (lebih kecil dari 260 biar smooth)

    let ticking = false;

    window.addEventListener("scroll", () => {
        if(!ticking){
            requestAnimationFrame(() => {
                if(window.scrollY > trigger){
                    sticky.classList.add("show");
                }else{
                    sticky.classList.remove("show");
                }
                ticking = false;
            });
            ticking = true;
        }
    });
});