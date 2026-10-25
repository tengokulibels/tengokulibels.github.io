const DATA_URL='https://opensheet.elk.sh/1VkKKLNjLnnLrLEv-0UIUWR8lf47Fcl3RF-Jz-H5STTI/Sheet1';
const FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLSfHbf5EipYGh7fITONY6pl9KqkL9AI_FkzBYBL1deL5CzaesQ/formResponse';
const E={nama:'entry.1800115301',kelas:'entry.1701887564',telp:'entry.1792317139',produk:'entry.757722018',qty:'entry.1840538909',ukuran:'entry.845945161',harga:'entry.1512453420'};
const $=id=>document.getElementById(id);
const rp=n=>'Rp'+Number(n||0).toLocaleString('id-ID');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let products=[],cur=null,mode='libels',size=null;

function imgUrl(v){
  v=String(v||'').trim();if(!/^https?:/i.test(v))return '';
  const m=v.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?.*?id=)([\w-]+)/);
  return m?`https://drive.google.com/thumbnail?id=${m[1]}&sz=w800`:v;
}
function phone(v){let d=String(v||'').replace(/\D/g,'');if(!d)return '';if(d.startsWith('0'))d='62'+d.slice(1);else if(!d.startsWith('62'))d='62'+d;return d}
// Normalisasi nomor user ke 08xxxx, kembalikan '' jika tidak valid
function normHP(v){
  let d=String(v||'').replace(/[\s\-().]/g,'');
  if(!/^\+?\d+$/.test(d))return '';
  d=d.replace('+','');
  if(d.startsWith('62'))d='0'+d.slice(2);else if(d.startsWith('8'))d='0'+d;
  return /^08[1-9]\d{7,10}$/.test(d)?d:'';
}
function status(p){return p.open?{k:'o',t:'Pre-Order'}:{k:'n',t:'Produk Tidak Tersedia'}}

async function load(){
  try{
    const r=await fetch(DATA_URL);
    if(!r.ok)throw new Error(r.status);
    const rows=await r.json();
    if(!Array.isArray(rows))throw new Error('format');
    products=rows.map(o=>{
      const ks=Object.keys(o),v=ks.map(k=>String(o[k]??'').trim());
      const g=i=>v[i]||'';
      const num=x=>parseInt(String(x).replace(/\D/g,''))||0;
      // kolom "Baju" = 1 -> produk apparel; kolom sesudahnya = ukuran beserta harganya
      let bi=ks.findIndex(k=>/^baju$/i.test(k.trim()));if(bi<0)bi=9;
      const sizes=g(bi)==='1'?ks.slice(bi+1).map((k,j)=>({s:k.trim(),p:num(v[bi+1+j])})).filter(x=>x.s&&x.p):[];
      return{img:imgUrl(g(0)),name:g(1),desc:g(2),po:g(3),pick:g(4),place:g(5),
        price:sizes.length?Math.min(...sizes.map(x=>x.p)):num(g(6)),sizes,apparel:sizes.length>0,hp:phone(g(7)),
        open:['1','true','yes','ya'].includes(g(8).toLowerCase())};
    }).filter(p=>p.name);
    render();
  }catch(e){
    $('grid').innerHTML='<div class="msg">Gagal memuat produk. Coba muat ulang halaman.</div>';
  }
}
function render(){
  const q=$('q').value.toLowerCase();
  const list=products.map((p,i)=>({p,i})).filter(({p})=>(p.name+p.desc).toLowerCase().includes(q));
  $('cnt').textContent=`(${list.length} dari ${products.length} produk)`;
  $('grid').innerHTML=list.length?list.map(({p,i})=>{
    const s=status(p);
    return `<div class="card" onclick="openP(${i})"><div class="ph">${p.img?`<img src="${esc(p.img)}" alt="" loading="lazy" onerror="this.replaceWith('🍱')">`:'🍱'}</div>
    <div class="cb"><span class="badge ${s.k}">${s.t}</span><h3>${esc(p.name)}</h3>
    <div class="sub">Diambil ${esc(p.pick||'-')}</div><div class="price">${p.apparel?'Mulai ':''}${rp(p.price)}</div><div class="po">PO ${esc(p.po||'-')}</div></div></div>`}).join(''):'<div class="msg">Produk tidak ditemukan.</div>';
}
$('q').oninput=render;

function openP(i){
  cur=products[i];mode='libels';size=null;const s=status(cur),closed=!cur.open;
  $('md').innerHTML=`<button class="x" onclick="closeM()">×</button>
  <div class="l"><div class="ph">${cur.img?`<img src="${esc(cur.img)}" alt="" onerror="this.replaceWith('🍱')">`:'🍱'}</div>
    <span class="badge ${s.k}">${s.t}</span><h2>${esc(cur.name)}</h2><div class="pr" id="pr">${priceText()}</div><p class="desc">${esc(cur.desc)}</p>
    <div class="info"><div><span>PO</span><b>${esc(cur.po||'-')}</b></div><div><span>Ambil</span><b>${esc(cur.pick||'-')}</b></div><div><span>Lokasi</span><b>${esc(cur.place||'-')}</b></div></div>
    <div class="help">Mau Request atau butuh bantuan?</div>
    <a class="btn cs ${cur.hp?'':'off'}" target="_blank" rel="noopener" href="${cur.hp?waLink('Halo, saya ingin bertanya tentang '+cur.name):'#'}">Kontak CS</a></div>
  <form class="r" id="f" onsubmit="send(event)" novalidate>
    <h2>Form Pembelian</h2>
    <input name="nama" placeholder="Nama" required autocomplete="name">
    <div class="seg"><label><input type="radio" name="tipe" value="libels" checked onchange="setMode('libels')">Siswa / Guru Libels</label>
    <label><input type="radio" name="tipe" value="non" onchange="setMode('non')">Non-Libels</label></div>
    <div id="kw"></div>
    <input name="telp" type="tel" inputmode="tel" placeholder="No HP (08XXXXXXXXXX)" required autocomplete="tel">
    <input value="${esc(cur.name)}" readonly>
    ${cur.apparel?`<div class="szl">Pilih ukuran</div><div class="szs">${cur.sizes.map((x,i)=>`<label><input type="radio" name="ukuran" value="${i}" onchange="pickSize(${i})"><span>${esc(x.s)}<small>${rp(x.p)}</small></span></label>`).join('')}</div>`:''}
    <div class="qty"><button type="button" onclick="chg(-1)">−</button><input id="qty" type="number" min="1" max="99" value="1" oninput="tot()"><button type="button" onclick="chg(1)">+</button></div>
    <div class="tot" id="tt">${totText()}</div>
    <button class="btn" id="sb" ${closed?'disabled':''}>${closed?'Produk Tidak Tersedia':'Kirim Pesanan'}</button>
    <button type="button" class="btn g" onclick="closeM()">Kembali</button>
    <div class="err" id="err"></div></form>`;
  setMode('libels',true);$('ov').classList.add('on');$('md').scrollTop=0;chkSd();
}
function waLink(t){return `https://wa.me/${cur.hp}?text=${encodeURIComponent(t)}`}
function setMode(m,silent){
  mode=m;
  $('kw').innerHTML=m==='non'
    ?'<textarea name="kelas" placeholder="Alamat lengkap pengiriman" required></textarea>'
    :'<input name="kelas" placeholder="Kelas (X-1, XI-A1, XII-A1, Guru)" required>';
  if(m==='non'&&!silent)info();
}
function info(){
  $('dlg').innerHTML=`<h3>Info untuk Non-Libels</h3>
  <p>Setelah pesanan terkirim, <b>download struk</b> pesananmu lalu <b>kirimkan struk tersebut ke kontak CS</b> produk ini via WhatsApp agar pesananmu diproses. Pesanan akan dikirim ke alamat yang kamu isi.</p>
  <button class="btn" onclick="$('ov2').classList.remove('on')">Mengerti</button>`;
  $('ov2').classList.add('on');
}
function closeM(){$('ov').classList.remove('on');$('sd').classList.remove('show')}
function chkSd(){const f=$('f'),m=$('md');if(!f||!$('ov').classList.contains('on')){$('sd').classList.remove('show');return}
  $('sd').classList.toggle('show',f.getBoundingClientRect().top>m.getBoundingClientRect().bottom-140)}
function goForm(){$('f').scrollIntoView({behavior:'smooth',block:'start'})}
$('md').addEventListener('scroll',chkSd);window.addEventListener('resize',chkSd);
$('ov').onclick=e=>{if(e.target.id==='ov')closeM()};
$('ov2').onclick=e=>{if(e.target.id==='ov2')$('ov2').classList.remove('on')};
function qv(){return Math.min(99,Math.max(1,parseInt($('qty').value)||1))}
function chg(d){$('qty').value=qv()+d<1?1:Math.min(99,qv()+d);tot()}
function unit(){return cur.apparel?(size?size.p:0):cur.price}
function priceText(){
  if(!cur.apparel)return rp(cur.price);
  const ps=cur.sizes.map(x=>x.p),mn=Math.min(...ps),mx=Math.max(...ps);
  return mn===mx?rp(mn):rp(mn)+' – '+rp(mx);
}
function totText(){return cur.apparel&&!size?'Total: pilih ukuran dulu':'Total: '+rp(unit()*qv())}
function tot(){$('tt').textContent=totText()}
function pickSize(i){size=cur.sizes[i];$('pr').textContent=rp(size.p);$('err').textContent='';tot()}

async function send(ev){
  ev.preventDefault();const f=ev.target,b=$('sb'),err=$('err');err.textContent='';
  const hp=normHP(f.telp.value),nama=f.nama.value.trim(),kelas=f.kelas.value.trim();
  if(!nama||!kelas){err.textContent=mode==='non'?'Nama dan alamat wajib diisi.':'Nama dan kelas wajib diisi.';return}
  if(!hp){err.textContent='Nomor HP tidak valid. Gunakan format 08XXXXXXXXXX (10–13 digit).';f.telp.focus();return}
  if(cur.apparel&&!size){err.textContent='Pilih ukuran baju dulu.';return}
  if(mode==='non'&&kelas.length<10){err.textContent='Alamat terlalu pendek, tulis alamat selengkapnya.';return}
  const o={nama,kelas,telp:hp,qty:qv(),non:mode==='non',size:size?size.s:'',price:unit()},total=o.price*o.qty,date=new Date();
  b.disabled=true;b.textContent='Mengirim…';
  const body=new URLSearchParams();
  body.append(E.nama,nama);body.append(E.kelas,kelas);body.append(E.telp,hp);body.append(E.produk,cur.name);body.append(E.ukuran,o.size||'-');body.append(E.qty,o.qty);body.append(E.harga,o.price);
  try{await fetch(FORM_URL,{method:'POST',mode:'no-cors',body})}
  catch(e){b.disabled=false;b.textContent='Kirim Pesanan';err.textContent='Gagal mengirim, periksa koneksi lalu coba lagi.';return}
  showReceipt(o,total,date);
}
function wrap(c,t,x,y,w,lh){let l='';for(const wd of String(t).split(/\s+/)){const n=l?l+' '+wd:wd;if(c.measureText(n).width>w&&l){c.fillText(l,x,y);y+=lh;l=wd}else l=n}c.fillText(l,x,y);return y+lh}
function showReceipt(o,total,date){
  const W=600,cv=document.createElement('canvas');cv.width=W;cv.height=1600;const c=cv.getContext('2d');
  c.fillStyle='#fff';c.fillRect(0,0,W,1600);c.fillStyle='#ff9c07';c.fillRect(0,0,W,110);
  c.fillStyle='#fff';c.font='800 34px Nunito, sans-serif';c.textAlign='center';c.fillText('Project 04:15 AM',W/2,52);
  c.font='700 18px Nunito, sans-serif';c.fillText('Bukti Pemesanan · Part of TENGOKU',W/2,84);
  c.textAlign='left';let y=160;
  const row=(k,v)=>{c.fillStyle='#888';c.font='600 17px Nunito, sans-serif';c.fillText(k,40,y);c.fillStyle='#222';c.font='700 20px Nunito, sans-serif';y=wrap(c,v,40,y+26,520,26)+14};
  row('Nama',o.nama);row(o.non?'Alamat':'Kelas / Guru',o.kelas);row('Produk',cur.name);if(o.size)row('Ukuran',o.size);
  row('Harga satuan',rp(o.price)+' × '+o.qty);
  row('Tanggal pemesanan',date.toLocaleString('id-ID',{dateStyle:'long',timeStyle:'short'}));
  if(!o.non)row('Diambil',cur.pick+' · '+cur.place);
  c.strokeStyle='#ff9c07';c.setLineDash([8,6]);c.lineWidth=2;c.beginPath();c.moveTo(40,y);c.lineTo(560,y);c.stroke();c.setLineDash([]);
  y+=40;c.fillStyle='#222';c.font='700 20px Nunito, sans-serif';c.fillText('TOTAL',40,y);
  c.textAlign='right';c.fillStyle='#e8590c';c.font='800 32px Nunito, sans-serif';c.fillText(rp(total),560,y);c.textAlign='left';
  const qr=qrcode(0,'M');qr.addData(`Nama: ${o.nama} | Produk: ${cur.name}${o.size?' | Ukuran: '+o.size:''} | Jumlah: ${o.qty} | Total: ${rp(total)}`);qr.make();
  const n=qr.getModuleCount(),sz=Math.floor(240/n),qs=sz*n,qx=(W-qs)/2;y+=30;
  c.fillStyle='#000';for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(qr.isDark(r,k))c.fillRect(qx+k*sz,y+r*sz,sz,sz);
  y+=qs+30;c.fillStyle='#888';c.font='600 15px Nunito, sans-serif';c.textAlign='center';
  c.fillText(o.non?'Kirim struk ini ke CS untuk memproses pesananmu':'Tunjukkan struk ini saat pengambilan pesanan',W/2,y);
  const H=y+30,img=c.getImageData(0,0,W,H);cv.height=H;c.putImageData(img,0,0);
  const fn=`struk-${o.nama.replace(/\W+/g,'-')}.png`;
  $('md').innerHTML=`<button class="x" onclick="closeM()">×</button><div class="rc"><h2>✅ Pesanan terkirim!</h2><div id="cvh"></div>
  ${o.non?`<div class="notice">Kamu Non-Libels: <b>download struk</b>, lalu kirim ke CS produk ini lewat WhatsApp.</div>`:''}
  <a class="btn" id="dl" download="${esc(fn)}">Download Struk (PNG)</a>
  ${o.non&&cur.hp?`<a class="btn wa" target="_blank" rel="noopener" href="${waLink('Halo, saya '+o.nama+' (Non-Libels) sudah memesan '+cur.name+(o.size?' ukuran '+o.size:'')+' x'+o.qty+'. Berikut struk pemesanan saya.')}">Kirim Struk ke CS</a>`:''}
  <button class="btn g" onclick="closeM()">Tutup</button></div>`;
  $('md').scrollTop=0;chkSd();$('cvh').appendChild(cv);$('dl').href=cv.toDataURL('image/png');
  if(o.non)info();
}
load();
