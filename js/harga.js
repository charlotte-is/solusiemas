(function(){
  const KARAT_ORDER = ['24','23','22','21','20','19','18','17','16','15','14','13','12','11','10','9','8','7','6'];
  const tbody = document.getElementById('hargaTbody');
  const info = document.getElementById('hargaUpdated');
  const y = document.getElementById('currentYearHarga');
  if(y) y.textContent = new Date().getFullYear();

  function formatIDR(n){ return (typeof n==='number' && isFinite(n)) ? ('Rp ' + n.toLocaleString('id-ID')) : '-'; }

  async function load(){
    try{
      const res = await fetch('data/price.json', {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      render(data);
    }catch(e){
      if(info) info.textContent = 'Gagal memuat harga.';
      console.error(e);
    }
  }

  function render(data){
    if(!tbody) return;
    const prices = (data && data.prices) ? data.prices : {};
    tbody.innerHTML = '';
    KARAT_ORDER.forEach(k=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>K${k}</td><td>${formatIDR(Number(prices[k]||0))}</td>`;
      tbody.appendChild(tr);
    });
    if(info){
      if(data && data.lastUpdated){
        const d = new Date(data.lastUpdated);
        info.textContent = 'Terakhir: ' + (isNaN(d.getTime()) ? data.lastUpdated : d.toLocaleString('id-ID'));
      }else{
        info.textContent = 'Terakhir: -';
      }
    }
  }

  document.getElementById('btnRefreshHarga')?.addEventListener('click', load);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
