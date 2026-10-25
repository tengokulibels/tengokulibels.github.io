const PASS_HASH='e410e110978429a2a4e5685c53907f9b0792dfe4b72e3513bd276b739854025c'; // SHA256 mirai
const ORDERS_URL='https://opensheet.elk.sh/19giMF2CzBPZWpk1NbssKj7r1HXBMJ68uu_eDQDQ3IhU/1'; // tab pertama; bisa ganti nama tab
const PRODUCTS_URL='https://opensheet.elk.sh/1VkKKLNjLnnLrLEv-0UIUWR8lf47Fcl3RF-Jz-H5STTI/Sheet1';
const $=id=>document.getElementById(id);
const rp=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').toLowerCase().replace(/\s+/g,' ').trim();
let orders=[],products=[],claimed={};
try{claimed=JSON.parse(localStorage.getItem('claimed415')||'{}')}catch(e){}

/* ---------- gate ---------- */
async function sha(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
if(sessionStorage.getItem('adm415')==='1')$('gate').classList.add('off');
$('gform').onsubmit=async e=>{e.preventDefault();
  if(await sha($('gpass').value)===PASS_HASH){sessionStorage.setItem('adm415','1');$('gate').classList.add('off')}
  else $('gerr').textContent='Kode akses salah.'};

/* ---------- data ---------- */
const LIB=/^(guru.*|(xii|xi|x)\s*[-–_ ]?\s*[a-z]?\s*[-–_]?\s*\d{0,2}[a-z]?)$/i;
const isLibels=k=>k.length<=12&&LIB.test(k.trim());
function parseTs(s){
  const m=String(s).match(/(\d{1,2})\/(\d{1,2})\/(\d{4})[ ,]+(\d{1,2}):(\d{2}):?(\d{2})?/);if(!m)return 0;
  let a=+m[1],b=+m[2];const y=+m[3];let mo=a,d=b;if(a>12){d=a;mo=b}
  return new Date(y,mo-1,d,+m[4],+m[5],+(m[6]||0)).getTime();
}
async function loadAll(){
  $('upd').textContent='Memuat…';
  try{
    const [or,pr]=await Promise.all([fetch(ORDERS_URL).then(r=>r.json()),fetch(PRODUCTS_URL).then(r=>r.json())]);
    products=pr.map(o=>{const v=Object.values(o).map(x=>String(x??'').trim());return{name:v[1],price:parseInt((v[6]||'').replace(/\D/g,''))||0,pick:v[4],place:v[5],hp:v[7]}}).filter(p=>p.name);
    const pm={};products.forEach(p=>pm[norm(p.name)]=p);
    orders=or.map(o=>{
      const v=Object.values(o).map(x=>String(x??'').trim());
      const sk=Object.keys(o).find(k=>/ukuran/i.test(k));let size=sk?String(o[sk]??'').trim():'';if(/^[-–—]$/.test(size))size='';
      const qty=parseInt(v[5])||1,pd=pm[norm(v[4])];
      const price=parseInt((v[6]||'').replace(/\D/g,''))||(pd?pd.price:0);
      return{ts:v[0],t:parseTs(v[0]),nama:v[1],kelas:v[2],hp:v[3],produk:v[4],size,qty,price,total:price*qty,non:!isLibels(v[2]),pd,key:v[0]+'|'+v[1]+'|'+v[4]};
    }).filter(o=>o.nama&&o.produk).sort((a,b)=>b.t-a.t);
    $('upd').textContent='Diperbarui '+new Date().toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    fillProducts();renderAll();
  }catch(e){$('upd').textContent='Gagal memuat data'}
}
function fillProducts(){
  const cur=$('fp').value;$('fp').innerHTML='<option value="">Semua produk</option>'+[...new Set(orders.map(o=>o.produk))].map(p=>`<option>${esc(p)}</option>`).join('');$('fp').value=cur;
}
const done=o=>!!claimed[o.key];
function save(){localStorage.setItem('claimed415',JSON.stringify(claimed))}
function toggle(i){const o=orders[i];if(done(o))delete claimed[o.key];else claimed[o.key]=new Date().toISOString();save();renderAll();if(lastQ)showResult(lastQ,true)}

/* ---------- render ---------- */
function renderAll(){stats();table();rekap()}
function stats(){
  const n=orders.length,pcs=orders.reduce((s,o)=>s+o.qty,0),rev=orders.reduce((s,o)=>s+o.total,0),dn=orders.filter(done).length,non=orders.filter(o=>o.non).length;
  $('stats').innerHTML=[['Total Pesanan',n],['Total Item',pcs],['Total Omzet',rp(rev)],['Sudah Diambil',dn+' / '+n]].map(([a,b])=>`<div class="st"><span>${a}</span><b>${b}</b></div>`).join('');
}
function filtered(){
  const q=norm($('fq').value),p=$('fp').value,t=$('ft').value,s=$('fs').value;
  return orders.map((o,i)=>({o,i})).filter(({o})=>(!q||norm(o.nama+' '+o.kelas+' '+o.hp).includes(q))&&(!p||o.produk===p)&&(!t||(t==='non')===o.non)&&(!s||(s==='1')===done(o)));
}
function wa(hp){let d=String(hp).replace(/\D/g,'');if(d.startsWith('0'))d='62'+d.slice(1);return d}
function table(){
  const l=filtered();
  $('tbl').innerHTML=l.length?`<tr><th>Waktu</th><th>Nama</th><th>Kelas / Alamat</th><th>HP</th><th>Produk</th><th>Ukuran</th><th class="n">Qty</th><th class="n">Total</th><th>Status</th></tr>`+l.map(({o,i})=>`<tr class="${done(o)?'done':''}"><td>${esc(o.ts)}</td><td><b>${esc(o.nama)}</b></td>
  <td>${o.non?'<span class="badge non">Non-Libels</span><br>':''}${esc(o.kelas)}</td><td><a class="wa" target="_blank" rel="noopener" href="https://wa.me/${wa(o.hp)}">${esc(o.hp)}</a></td>
  <td>${esc(o.produk)}</td><td>${o.size?`<span class="badge t">${esc(o.size)}</span>`:'-'}</td><td class="n">${o.qty}</td><td class="n">${rp(o.total)}</td>
  <td><button class="btn sm ${done(o)?'ok':'o'}" onclick="toggle(${i})">${done(o)?'✓ Diambil':'Tandai'}</button></td></tr>`).join(''):'<tr><td class="empty">Tidak ada pesanan.</td></tr>';
}
function rekap(){
  const m={};
  orders.forEach(o=>{
    const r=m[o.produk]||(m[o.produk]={n:0,q:0,rev:0,dq:0,sz:{}});
    r.n++;r.q+=o.qty;r.rev+=o.total;if(done(o))r.dq+=o.qty;
    if(o.size){const z=r.sz[o.size]||(r.sz[o.size]={q:0,rev:0,dq:0});z.q+=o.qty;z.rev+=o.total;if(done(o))z.dq+=o.qty}
  });
  const ORD=['XS','S','M','L','XL','XXL','2XL','3XL','XXXL'],ix=x=>{const i=ORD.indexOf(x.toUpperCase());return i<0?99:i};
  const k=Object.keys(m);
  $('rk').innerHTML=k.length?'<tr><th>Produk</th><th class="n">Pesanan</th><th class="n">Item</th><th class="n">Omzet</th><th class="n">Sudah diambil</th><th class="n">Belum</th></tr>'+k.map(p=>{
    const r=m[p];
    return `<tr><td><b>${esc(p)}</b></td><td class="n">${r.n}</td><td class="n">${r.q}</td><td class="n">${rp(r.rev)}</td><td class="n">${r.dq}</td><td class="n">${r.q-r.dq}</td></tr>`
    +Object.keys(r.sz).sort((a,b)=>ix(a)-ix(b)||a.localeCompare(b)).map(z=>`<tr style="color:#666"><td>&nbsp;&nbsp;↳ Ukuran <b>${esc(z)}</b></td><td class="n"></td><td class="n">${r.sz[z].q}</td><td class="n">${rp(r.sz[z].rev)}</td><td class="n">${r.sz[z].dq}</td><td class="n">${r.sz[z].q-r.sz[z].dq}</td></tr>`).join('');
  }).join('')
   +`<tr><td><b>Total</b></td><td class="n">${orders.length}</td><td class="n">${orders.reduce((s,o)=>s+o.qty,0)}</td><td class="n"><b>${rp(orders.reduce((s,o)=>s+o.total,0))}</b></td><td class="n"></td><td class="n"></td></tr>`:'<tr><td class="empty">Belum ada data.</td></tr>';
}
['fq','fp','ft','fs'].forEach(id=>$(id).oninput=table);
$('refresh').onclick=loadAll;
$('csv').onclick=()=>{
  const q=s=>'"'+String(s).replace(/"/g,'""')+'"';
  const rows=[['Waktu','Nama','Tipe','Kelas/Alamat','HP','Produk','Ukuran','Qty','Harga','Total','Status']].concat(filtered().map(({o})=>[o.ts,o.nama,o.non?'Non-Libels':'Libels',o.kelas,o.hp,o.produk,o.size||'',o.qty,o.price,o.total,done(o)?'Sudah diambil':'Belum']));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+rows.map(r=>r.map(q).join(',')).join('\n')],{type:'text/csv'}));a.download='pesanan-0415.csv';a.click();
};
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));
  document.querySelectorAll('.pane').forEach(p=>p.classList.toggle('on',p.id==='p-'+b.dataset.t));
  if(b.dataset.t!=='scan')stopCam();
});

/* ---------- scan ---------- */
let stream=null,scanning=false,lastQ=null;
const vid=$('vid'),cv=$('cv'),ctx=cv.getContext('2d',{willReadFrequently:true});
let det=null;
// Baca QR dari canvas: pakai BarcodeDetector bawaan browser bila ada, lalu jsQR sebagai cadangan
async function decodeCanvas(deep){
  if('BarcodeDetector' in window){
    try{det=det||new BarcodeDetector({formats:['qr_code']});const r=await det.detect(cv);if(r.length&&r[0].rawValue)return r[0].rawValue}catch(e){}
  }
  if(typeof jsQR==='function'){
    const d=ctx.getImageData(0,0,cv.width,cv.height),r=jsQR(d.data,d.width,d.height,{inversionAttempts:deep?'attemptBoth':'dontInvert'});
    return r&&r.data?r.data:null;
  }
  return undefined; // tidak ada pembaca QR sama sekali
}
async function startCam(){
  $('scanErr').textContent='';
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){$('scanErr').textContent='Browser tidak mendukung kamera / halaman belum https.';return}
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
    vid.srcObject=stream;await vid.play();
  }catch(e){$('scanErr').textContent='Kamera tidak bisa dibuka ('+(e.name||'error')+'). Izinkan akses kamera di browser, lalu coba lagi.';return}
  $('cam').classList.add('on');$('camBtn').textContent='Tutup Kamera';scanning=true;tick();
}
function stopCam(){scanning=false;if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;vid.srcObject=null;$('cam').classList.remove('on');$('camBtn').textContent='Buka Kamera'}
$('camBtn').onclick=()=>stream?stopCam():startCam();
async function tick(){
  if(!scanning)return;
  if(vid.readyState>=2&&vid.videoWidth){
    const sc=Math.min(1,800/vid.videoWidth);cv.width=Math.round(vid.videoWidth*sc);cv.height=Math.round(vid.videoHeight*sc);
    ctx.drawImage(vid,0,0,cv.width,cv.height);
    const r=await decodeCanvas(false);
    if(r===undefined){stopCam();$('scanErr').textContent='Pustaka pembaca QR gagal dimuat. Cek koneksi internet lalu muat ulang halaman.';return}
    if(r){stopCam();if(navigator.vibrate)navigator.vibrate(80);handle(r);return}
  }
  setTimeout(()=>requestAnimationFrame(tick),150);
}
$('imgIn').onchange=e=>{
  const f=e.target.files[0];if(!f)return;const img=new Image();$('scanErr').textContent='Membaca gambar…';
  img.onload=async()=>{
    let res=null;
    for(const max of [1200,800,500,1800]){
      const sc=Math.min(1,max/Math.max(img.width,img.height));cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
      ctx.fillStyle='#fff';ctx.fillRect(0,0,cv.width,cv.height);ctx.drawImage(img,0,0,cv.width,cv.height);
      res=await decodeCanvas(true);if(res===undefined)break;if(res)break;
    }
    if(res===undefined)$('scanErr').textContent='Pustaka pembaca QR gagal dimuat. Cek koneksi internet lalu muat ulang halaman.';
    else if(res){$('scanErr').textContent='';handle(res)}
    else $('scanErr').textContent='QR tidak terbaca dari gambar ini. Pastikan seluruh QR terlihat jelas dan tidak terpotong.';
    e.target.value='';
  };
  img.onerror=()=>{$('scanErr').textContent='Gambar tidak bisa dibuka.'};
  img.src=URL.createObjectURL(f);
};
$('manBtn').onclick=()=>handle($('manual').value);
function parseQR(t){
  const o={};String(t).split(/\s*\|\s*|\n/).forEach(p=>{const m=p.match(/^\s*(nama|produk|ukuran|jumlah|total)\s*:\s*(.*)$/i);if(m)o[m[1].toLowerCase()]=m[2].trim()});
  if(o.produk){const m=o.produk.match(/^(.*?)\s+x(\d+)$/i);if(m&&!o.jumlah){o.produk=m[1];o.jumlah=m[2]}} // format lama
  return o;
}
function handle(text){
  $('scanErr').textContent='';const q=parseQR(text);
  if(!q.nama||!q.produk){lastQ=null;$('result').innerHTML=`<div class="res nf"><h4>QR tidak dikenali</h4><p>Bukan QR struk 04:15 AM.</p><small>${esc(String(text).slice(0,200))}</small></div>`;return}
  lastQ=q;showResult(q);
}
function showResult(q,keep){
  const qt=parseInt(String(q.total||'').replace(/\D/g,''))||0,qj=parseInt(q.jumlah)||0;
  let m=orders.map((o,i)=>({o,i})).filter(({o})=>norm(o.nama)===norm(q.nama)&&norm(o.produk)===norm(q.produk)&&(!qj||o.qty===qj));
  const qu=norm(q.ukuran||'');if(qu){const ms=m.filter(({o})=>norm(o.size)===qu);if(ms.length)m=ms}
  const mt=m.filter(({o})=>!qt||o.total===qt);if(mt.length)m=mt;
  if(!m.length){$('result').innerHTML=`<div class="res nf"><h4>Pesanan tidak ditemukan</h4><div class="kv"><span>Nama</span><b>${esc(q.nama)}</b><span>Produk</span><b>${esc(q.produk)}</b>${q.ukuran?`<span>Ukuran</span><b>${esc(q.ukuran)}</b>`:''}<span>Jumlah</span><b>${esc(q.jumlah||'-')}</b><span>Total</span><b>${esc(q.total||'-')}</b></div><p>Coba "Muat Ulang" bila pesanan baru masuk, atau cek tab Pesanan.</p><button class="btn" onclick="loadAll().then(()=>lastQ&&showResult(lastQ))">⟳ Muat Ulang & Cari Lagi</button></div>`;return}
  $('result').innerHTML=(m.length>1?`<div class="warn">Ditemukan ${m.length} pesanan dengan data sama. Pilih yang sesuai.</div>`:'')+m.map(({o,i})=>{
    const d=done(o);
    return `<div class="res ${d?'done':'todo'}"><span class="badge ${d?'':'t'}">${d?'SUDAH DIAMBIL':'BELUM DIAMBIL'}</span> ${o.non?'<span class="badge non">Non-Libels</span>':''}
    <h4>${esc(o.nama)}</h4><div class="big">${esc(o.produk)}${o.size?' ('+esc(o.size)+')':''} × ${o.qty}</div>
    <div class="kv">${o.size?`<span>Ukuran</span><b>${esc(o.size)}</b>`:''}<span>Total</span><b>${rp(o.total)}</b><span>${o.non?'Alamat':'Kelas / Guru'}</span><b>${esc(o.kelas)}</b><span>HP</span><b><a class="wa" target="_blank" rel="noopener" href="https://wa.me/${wa(o.hp)}">${esc(o.hp)}</a></b><span>Dipesan</span><b>${esc(o.ts)}</b>
    ${!o.non&&o.pd?`<span>Ambil</span><b>${esc(o.pd.pick||'-')} · ${esc(o.pd.place||'-')}</b>`:''}${d?`<span>Diambil pada</span><b>${new Date(claimed[o.key]).toLocaleString('id-ID')}</b>`:''}</div>
    ${qu&&norm(o.size)!==qu?`<div class="warn">⚠ Ukuran di QR (${esc(q.ukuran)}) berbeda dengan data (${esc(o.size||'-')}).</div>`:''}
    ${qt&&o.total!==qt?`<div class="warn">⚠ Total di QR (${rp(qt)}) berbeda dengan data (${rp(o.total)}).</div>`:''}
    ${d?'<div class="warn">Pesanan ini sudah ditandai diambil sebelumnya.</div>':''}
    <button class="btn ${d?'g':'ok'}" style="width:100%" onclick="toggle(${i})">${d?'Batalkan tanda diambil':(o.non?'✓ Tandai Sudah Dikirim/Diambil':'✓ Tandai Sudah Diambil')}</button></div>`}).join('')
   +`<button class="btn o" style="width:100%" onclick="$('result').innerHTML='';lastQ=null;startCam()">Scan lagi</button>`;
  if(!keep)$('result').scrollIntoView({behavior:'smooth'});
}
loadAll();
