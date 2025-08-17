(function(){
  const WA_NUMBER = '087758387905';
  const KARAT_ORDER = ['24','23','22','21','20','19','18','17','16','15','14','13','12','11','10','9','8','7','6'];
  const heroVideo = document.getElementById('heroVideo');
  const pricesContainer = document.getElementById('pricesContainer');
  const lastUpdatedEl = document.getElementById('lastUpdated');
  const currentYear = document.getElementById('currentYear');

  if(currentYear) currentYear.textContent = new Date().getFullYear();

  // Hero video (respect mobile / reduced motion)
  (function initHero(){
    try{
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if(!heroVideo) return;
      if(isMobile || prefersReduced){ heroVideo.style.display='none'; return; }
      heroVideo.addEventListener('canplay', ()=>{ heroVideo.style.opacity='1'; });
      heroVideo.play().catch(()=>{ heroVideo.style.opacity='1'; });
    }catch(e){}
  })();

  // WA
  function buildWaLink(msg){
    let n = WA_NUMBER.trim();
    if(n.startsWith('0')) n = '62' + n.slice(1);
    if(n.startsWith('+')) n = n.replace('+','');
    return 'https://wa.me/'+n+'?text='+encodeURIComponent(msg||'Halo Solusi Emas, saya ingin menanyakan harga emas hari ini.');
  }
  const ctaChat = document.getElementById('ctaChat');
  if(ctaChat) ctaChat.href = buildWaLink('Halo Solusi Emas, saya mau tanya harga emas hari ini.');

  // Price
  async function fetchPrice(){
    try{
      const res = await fetch('data/price.json', { cache: 'no-store' });
      if(!res.ok) throw new Error('HTTP '+res.status);
      return await res.json();
    }catch(e){
      console.error('Fetch price error:', e);
      return null;
    }
  }
  function formatIDR(n){ return (typeof n==='number' && isFinite(n)) ? ('Rp ' + n.toLocaleString('id-ID')) : '-'; }
  function safeNumber(v){ const n=Number(v); return isNaN(n)?0:n; }

  function animateNumber(el, from, to, duration){
    from = Number(from||0); to = Number(to||0);
    if(from === to){ el.textContent = formatIDR(to); return; }
    const start = performance.now();
    function step(now){
      const t = Math.min(1,(now-start)/duration);
      const val = Math.round(from + (to-from)*t);
      el.textContent = formatIDR(val);
      if(t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function renderPriceStrip(data){
    if(!pricesContainer) return;
    pricesContainer.innerHTML = '';
    if(!data || !data.prices){
      if(lastUpdatedEl) lastUpdatedEl.textContent = 'Belum ada data harga';
      return;
    }
    const prev = (window.__PRICE_CACHE__ && window.__PRICE_CACHE__.prices) ? window.__PRICE_CACHE__.prices : {};
    const prices = data.prices;

    KARAT_ORDER.forEach(k=>{
      if(!(k in prices)) return;
      const val = safeNumber(prices[k]);
      const prevVal = safeNumber(prev[k] || val);
      const card = document.createElement('div');
      card.className = 'price-card fade-in';
      card.innerHTML = `<h4>K${k}</h4><p class="value">${formatIDR(prevVal)}</p>`;
      pricesContainer.appendChild(card);
      animateNumber(card.querySelector('.value'), prevVal, val, 700);
    });

    if(lastUpdatedEl){
      if(data.lastUpdated){
        const d = new Date(data.lastUpdated);
        lastUpdatedEl.textContent = 'Terakhir: ' + (isNaN(d.getTime()) ? data.lastUpdated : d.toLocaleString('id-ID'));
      } else {
        lastUpdatedEl.textContent = 'Terakhir: -';
      }
    }
    window.__PRICE_CACHE__ = data;
    try{ localStorage.setItem('solusiemas_price', JSON.stringify(data)); }catch(e){}
  }

  async function initPrices(){
    try{
      const cached = JSON.parse(localStorage.getItem('solusiemas_price')||'null');
      if(cached) renderPriceStrip(cached);
    }catch(e){}
    const data = await fetchPrice();
    if(data) renderPriceStrip(data);
  }

  // reveal on scroll
  function initReveal(){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
    },{threshold:0.12});
    document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));
  }

  // lightbox
  function initLightbox(){
    const grid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    const lbImg = document.getElementById('lbImg');
    const lbCap = document.getElementById('lbCaption');
    const lbClose = document.getElementById('lbClose');
    if(!grid || !lightbox) return;
    grid.querySelectorAll('img').forEach(img=>{
      img.addEventListener('click', ()=>{
        lbImg.src = img.src;
        lbCap.textContent = img.dataset.caption || img.alt || '';
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });
    function hide(){ lightbox.style.display='none'; lbImg.src=''; document.body.style.overflow=''; }
    lbClose.addEventListener('click', hide);
    lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) hide(); });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') hide(); });
  }

  // run
  function init(){
    initReveal();
    initLightbox();
    initPrices();
    setInterval(initPrices, 5*60*1000);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
