(() => {
  'use strict';

  const PRODUCTS = [
    {id:'varillero',name:'Varillero',category:'Construcción',image:'assets/images/product-01.jpg',description:'Herramienta para doblar y cortar varilla con precisión.',features:['Uso para preparación de varilla','Consulta presentación y disponibilidad','Retiro coordinado en tienda']},
    {id:'acero-cemento',name:'Acero y cemento',category:'Construcción',image:'assets/images/product-02.jpg',description:'Materiales para obra con orientación sobre almacenamiento correcto.',features:['Requerimientos por cantidad','Atención a obras y mayoristas','Marca y presentación por confirmar']},
    {id:'pintakreto',name:'PintaKreto',category:'Pintura',image:'assets/images/product-03.jpg',description:'Pintura de caucho profesional para superficies interiores y exteriores.',features:['Uso interior y exterior indicado en el producto','Color y presentación por confirmar','Disponibilidad sujeta a sucursal']},
    {id:'encimeras',name:'Encimeras de granito',category:'Granito',image:'assets/images/product-04.jpg',description:'Opciones de granito para renovar cocinas y superficies de trabajo.',features:['Amplia selección promovida por el negocio','Medidas y acabados por cotizar','Asesoría según el proyecto']},
    {id:'herramientas',name:'Herramientas',category:'Ferretería',image:'assets/images/product-05.jpg',description:'Selección de herramientas para el hogar y la construcción.',features:['Opciones para distintas tareas','Marcas y modelos por confirmar','Compra individual o requerimiento al mayor']},
    {id:'sikadur-32',name:'Sikadur-32 Primer L',category:'Construcción',image:'assets/images/product-06.jpg',description:'Adhesivo estructural promovido para adherir concreto fresco a endurecido.',features:['Producto identificado en material oficial','Aplicación según instrucciones del fabricante','Presentación y disponibilidad por confirmar']}
  ];

  const STORAGE_KEY = 'demichele-demo-quote-v1';
  const state = {cart: loadCart(), category:'Todos', query:'', selectedProduct:null, step:1};
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const productGrid = $('#product-grid');
  const drawer = $('.basket-drawer');
  const overlay = $('.overlay');
  const dialog = $('#product-dialog');

  function loadCart(){
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return Object.fromEntries(Object.entries(parsed).filter(([id,qty]) => PRODUCTS.some(p => p.id === id) && Number.isInteger(qty) && qty > 0 && qty <= 99));
    } catch (_) { return {}; }
  }
  function saveCart(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.cart)); } catch (_) {}
  }
  function escapeHTML(value){
    return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  }
  function cartCount(){ return Object.values(state.cart).reduce((sum, qty) => sum + qty, 0); }
  function filteredProducts(){
    const q = state.query.trim().toLocaleLowerCase('es');
    return PRODUCTS.filter(p => (state.category === 'Todos' || p.category === state.category) && (!q || `${p.name} ${p.category} ${p.description}`.toLocaleLowerCase('es').includes(q)));
  }
  function renderProducts(){
    const products = filteredProducts();
    $('[data-result-count]').textContent = products.length;
    $('#empty-state').hidden = products.length > 0;
    productGrid.hidden = products.length === 0;
    productGrid.innerHTML = products.map((p) => {
      const index = String(PRODUCTS.indexOf(p) + 1).padStart(2,'0');
      const inCart = Boolean(state.cart[p.id]);
      return `<article class="product-card" data-product="${p.id}">
        <div class="product-image" role="button" tabindex="0" aria-label="Ver detalle de ${escapeHTML(p.name)}" data-detail="${p.id}"><span class="product-index">${index}</span><img src="${p.image}" alt="${escapeHTML(p.name)}" width="1080" height="1350" loading="lazy"></div>
        <div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><p>${p.description}</p><div class="product-bottom"><span class="product-price"><small>PRECIO</small><b>COTIZAR</b></span><button class="add-button${inCart?' added':''}" type="button" data-add="${p.id}" aria-label="${inCart?'Agregar otra unidad de':'Agregar'} ${escapeHTML(p.name)} a la cotización">${inCart?'✓':'＋'}</button></div></div>
      </article>`;
    }).join('');
  }
  function updateCartUI(){
    const count = cartCount();
    $$('[data-cart-count]').forEach(el => el.textContent = count);
    const button = $('.basket-button');
    button.setAttribute('aria-label', `Abrir cotización, ${count} ${count === 1 ? 'producto' : 'productos'}`);
    renderProducts();
    renderBasket();
    saveCart();
  }
  function renderBasket(){
    const entries = PRODUCTS.filter(p => state.cart[p.id]);
    $('#basket-empty').hidden = entries.length > 0;
    $('#basket-items').innerHTML = entries.map(p => `<article class="quote-item"><img src="${p.image}" alt="" width="74" height="74"><div><h3>${p.name}</h3><small>Cotizar · retiro en tienda</small><div class="qty-control"><button type="button" data-qty="${p.id}" data-delta="-1" aria-label="Restar una unidad">−</button><span>${state.cart[p.id]}</span><button type="button" data-qty="${p.id}" data-delta="1" aria-label="Sumar una unidad">＋</button></div></div><button class="remove-item" type="button" data-remove="${p.id}">Quitar</button></article>`).join('');
    $('#drawer-foot').hidden = entries.length === 0 || state.step === 3;
    $('#continue-button').textContent = state.step === 1 ? 'CONTINUAR  →' : 'VOLVER A LISTA';
  }
  function addProduct(id){
    state.cart[id] = Math.min(99, (state.cart[id] || 0) + 1);
    updateCartUI();
    const p = PRODUCTS.find(item => item.id === id);
    toast(`${p.name}: agregado a la cotización`);
  }
  function changeQty(id, delta){
    const next = (state.cart[id] || 0) + delta;
    if(next <= 0) delete state.cart[id]; else state.cart[id] = Math.min(99,next);
    if(!cartCount()) showStep(1);
    updateCartUI();
  }
  function openDrawer(){
    overlay.hidden = false; drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false'); document.body.classList.add('ui-open');
    setTimeout(() => $('.icon-button', drawer).focus(), 20);
  }
  function closeDrawer(){
    drawer.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); overlay.hidden = true; document.body.classList.remove('ui-open');
  }
  function showStep(step){
    state.step = step;
    const hasItems = cartCount() > 0;
    $('#basket-items').hidden = step !== 1;
    $('#basket-empty').hidden = hasItems || step !== 1;
    $('#quote-form').hidden = step !== 2;
    $('#confirmation').hidden = step !== 3;
    $$('.drawer-progress span').forEach((el,index) => el.classList.toggle('active', index + 1 === step));
    renderBasket();
  }
  function openDetail(id){
    const p = PRODUCTS.find(item => item.id === id); if(!p) return;
    state.selectedProduct = id;
    $('#detail-image').src = p.image; $('#detail-image').alt = p.name;
    $('#detail-category').textContent = p.category; $('#detail-title').textContent = p.name; $('#detail-description').textContent = p.description;
    $('#detail-features').innerHTML = p.features.map(item => `<li>${escapeHTML(item)}</li>`).join('');
    $('#detail-add').innerHTML = `${state.cart[id] ? 'AGREGAR OTRA UNIDAD' : 'AGREGAR A COTIZACIÓN'} <span>＋</span>`;
    dialog.showModal(); document.body.classList.add('ui-open');
  }
  function closeDetail(){ if(dialog.open) dialog.close(); document.body.classList.remove('ui-open'); }
  let toastTimer;
  function toast(message){
    const el = $('#toast'); el.textContent = message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'),2200);
  }
  function resetFilters(){
    state.category = 'Todos'; state.query = ''; $('#search-input').value = '';
    $$('[data-category]').forEach(btn => btn.classList.toggle('active',btn.dataset.category === 'Todos')); renderProducts();
  }
  function referenceId(){
    const stamp = new Date();
    return `DM-${String(stamp.getFullYear()).slice(-2)}${String(stamp.getMonth()+1).padStart(2,'0')}${String(stamp.getDate()).padStart(2,'0')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
  }

  document.addEventListener('click', event => {
    const add = event.target.closest('[data-add]'); if(add){ addProduct(add.dataset.add); return; }
    const detail = event.target.closest('[data-detail]'); if(detail){ openDetail(detail.dataset.detail); return; }
    if(event.target.closest('[data-open-basket]')){ openDrawer(); return; }
    if(event.target.closest('[data-close-ui]')){ closeDrawer(); return; }
    if(event.target.closest('[data-close-detail]')){ closeDetail(); return; }
    const category = event.target.closest('[data-category]'); if(category){ state.category = category.dataset.category; $$('[data-category]').forEach(btn => btn.classList.toggle('active',btn === category)); renderProducts(); return; }
    if(event.target.closest('[data-reset-filters]')){ resetFilters(); return; }
    const qty = event.target.closest('[data-qty]'); if(qty){ changeQty(qty.dataset.qty,Number(qty.dataset.delta)); return; }
    const remove = event.target.closest('[data-remove]'); if(remove){ delete state.cart[remove.dataset.remove]; updateCartUI(); return; }
    const branch = event.target.closest('[data-branch]'); if(branch){ openDrawer(); if(cartCount()) showStep(2); const radio = $(`input[name="branch"][value="${branch.dataset.branch}"]`); if(radio) radio.checked = true; return; }
    if(event.target.closest('[data-new-quote]')){ state.cart = {}; saveCart(); $('#quote-form').reset(); showStep(1); updateCartUI(); return; }
  });
  productGrid.addEventListener('keydown', event => { const target = event.target.closest('[data-detail]'); if(target && (event.key === 'Enter' || event.key === ' ')){ event.preventDefault(); openDetail(target.dataset.detail); } });
  $('#search-input').addEventListener('input', event => { state.query = event.target.value; renderProducts(); });
  document.addEventListener('keydown', event => {
    if((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'){ event.preventDefault(); $('#search-input').focus(); }
    if(event.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
  $('#continue-button').addEventListener('click', () => { if(!cartCount()) return; showStep(state.step === 1 ? 2 : 1); });
  $('#detail-add').addEventListener('click', () => { if(state.selectedProduct){ addProduct(state.selectedProduct); closeDetail(); openDrawer(); } });
  dialog.addEventListener('click', event => { if(event.target === dialog) closeDetail(); });
  $('#quote-form').addEventListener('submit', event => {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); const valid = form.checkValidity();
    $('.form-error').hidden = valid; if(!valid){ form.reportValidity(); return; }
    const branch = data.get('branch') === 'maracay' ? 'Maracay' : 'Valencia';
    $('#confirmation-id').textContent = referenceId();
    $('#confirmation-summary').className = 'confirmation-summary';
    $('#confirmation-summary').innerHTML = `<p><span>NOMBRE</span><strong>${escapeHTML(data.get('customer'))}</strong></p><p><span>RETIRO</span><strong>${branch}</strong></p><p><span>TOTAL</span><strong>COTIZAR</strong></p><ul>${PRODUCTS.filter(p=>state.cart[p.id]).map(p=>`<li>${state.cart[p.id]} × ${escapeHTML(p.name)}</li>`).join('')}</ul>`;
    showStep(3);
  });

  renderProducts(); updateCartUI(); showStep(1);
})();
