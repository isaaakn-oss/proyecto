let productos = [
  { id:1, nombre:"Moka Express 3 tazas", marca:"Bialetti", tipo:"Moka", precio:34.99, emoji:"☕" },
  { id:2, nombre:"Moka Express 6 tazas", marca:"Bialetti", tipo:"Moka", precio:44.99, emoji:"☕" },
  { id:3, nombre:"Venus Inducción 4 tazas", marca:"Bialetti", tipo:"Moka", precio:59.99, emoji:"🫖" },
  { id:4, nombre:"EC9155 Dedica Arte", marca:"De'Longhi", tipo:"Espresso", precio:229.99, emoji:"⚙️" },
  { id:5, nombre:"Dinamica Plus ECAM370.95", marca:"De'Longhi", tipo:"Espresso", precio:449.99, emoji:"🤖" },
  { id:6, nombre:"A Modo Mio Jolie", marca:"Lavazza", tipo:"Cápsulas", precio:89.99, emoji:"💊" },
  { id:7, nombre:"Desea Evo", marca:"Lavazza", tipo:"Cápsulas", precio:119.99, emoji:"🔵" },
  { id:8, nombre:"Classic Pro", marca:"Gaggia", tipo:"Espresso", precio:299.99, emoji:"🏆" },
  { id:9, nombre:"Melior 8 tazas", marca:"Bialetti", tipo:"Prensa Francesa", precio:39.99, emoji:"🫙" },
  { id:10, nombre:"Pour Over Dripper", marca:"De'Longhi", tipo:"Drip", precio:64.99, emoji:"💧" },
  { id:11, nombre:"Percolator CFP800", marca:"De'Longhi", tipo:"Drip", precio:79.99, emoji:"🟤" },
  { id:12, nombre:"Baby Class", marca:"Gaggia", tipo:"Espresso", precio:199.99, emoji:"👶" },
];

let carrito = [];
let adminActivo = false;
let nextId = 13;

function renderProductos(lista) {
  const grid = document.getElementById('gridProductos');
  const meta = document.getElementById('metaResultados');
  meta.textContent = lista.length === 1 ? '1 producto' : `${lista.length} productos`;
  if (lista.length === 0) {
    grid.innerHTML = `<div class="estado-vacio"><div style="font-size:3rem">🔍</div><p>No se encontraron productos con esos filtros.</p></div>`;
    return;
  }
  grid.innerHTML = lista.map(p => `
    <div class="card" id="card-${p.id}">
      <div class="card-acento"></div>
      <span class="badge-categoria">${p.tipo}</span>
      <div class="card-imagen" style="${p.imagen ? `padding:0;background:var(--crema)` : ''}">
        ${p.imagen
          ? `<img src="${p.imagen}" alt="${p.nombre}" style="width:100%;height:100%;object-fit:cover;display:block;">`
          : p.emoji}
      </div>
      <div class="card-body">
        <div class="card-marca">${p.marca}</div>
        <div class="card-nombre">${p.nombre}</div>
        <div class="card-footer">
          <div class="card-precio">$${p.precio.toFixed(2)} <span>USD</span></div>
          <button class="btn-agregar" onclick="agregarAlCarrito(${p.id})">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Agregar
          </button>
        </div>
        <div class="card-admin-btns ${adminActivo ? 'visible' : ''}" id="adminbtns-${p.id}">
          <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Eliminar producto
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function aplicarFiltros() {
  const busca = document.getElementById('inputBuscar').value.toLowerCase();
  const precioMax = parseInt(document.getElementById('filtroPrecio').value);
  const orden = document.getElementById('ordenSelect').value;

  const tiposCheck = ['Moka','Espresso','Cápsulas','Prensa Francesa','Drip'];
  const marcasCheck = ['Bialetti',"De'Longhi",'Lavazza','Gaggia'];

  const tiposActivos = tiposCheck.filter(t => {
    const mapId = { 'Moka':'f-moka','Espresso':'f-espresso','Cápsulas':'f-capsulas','Prensa Francesa':'f-prensa','Drip':'f-drip' };
    const el = document.getElementById(mapId[t]);
    return el && el.checked;
  });

  const marcasActivas = marcasCheck.filter(m => {
    const mapId = { 'Bialetti':'f-bialetti',"De'Longhi":'f-delonghi','Lavazza':'f-lavazza','Gaggia':'f-gaggia' };
    const el = document.getElementById(mapId[m]);
    return el && el.checked;
  });

  let resultado = productos.filter(p => {
    if (busca && !p.nombre.toLowerCase().includes(busca) && !p.marca.toLowerCase().includes(busca)) return false;
    if (p.precio > precioMax) return false;
    if (tiposActivos.length > 0 && !tiposActivos.includes(p.tipo)) return false;
    if (marcasActivas.length > 0 && !marcasActivas.includes(p.marca)) return false;
    return true;
  });

  if (orden === 'nombre') resultado.sort((a,b) => a.nombre.localeCompare(b.nombre));
  else if (orden === 'precio-asc') resultado.sort((a,b) => a.precio - b.precio);
  else if (orden === 'precio-desc') resultado.sort((a,b) => b.precio - a.precio);

  actualizarContadores();
  renderProductos(resultado);
}

function actualizarContadores() {
  const tipos = { Moka:'cnt-moka', Espresso:'cnt-espresso', 'Cápsulas':'cnt-capsulas', 'Prensa Francesa':'cnt-prensa', Drip:'cnt-drip' };
  for (const [tipo, id] of Object.entries(tipos)) {
    const el = document.getElementById(id);
    if (el) el.textContent = `(${productos.filter(p=>p.tipo===tipo).length})`;
  }
}

function actualizarPrecio() {
  const val = document.getElementById('filtroPrecio').value;
  document.getElementById('precioMax').textContent = `hasta $${val}`;
  aplicarFiltros();
}

function limpiarFiltros() {
  document.getElementById('inputBuscar').value = '';
  document.getElementById('filtroPrecio').value = 500;
  document.getElementById('precioMax').textContent = 'hasta $500';
  ['f-moka','f-espresso','f-capsulas','f-prensa','f-drip','f-bialetti','f-delonghi','f-lavazza','f-gaggia'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.checked = false;
  });
  aplicarFiltros();
}

function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  const idx = carrito.findIndex(i => i.id === id);
  if (idx >= 0) carrito[idx].qty++;
  else carrito.push({ ...prod, qty: 1 });
  actualizarBadge();
  mostrarNotif(`${prod.emoji} ${prod.nombre} agregado al carrito`);
}

function actualizarBadge() {
  const total = carrito.reduce((s,i) => s + i.qty, 0);
  document.getElementById('badgeCarrito').textContent = total;
}

function abrirCarrito() {
  const contenido = document.getElementById('carritoContenido');
  const footer = document.getElementById('carritoFooter');
  if (carrito.length === 0) {
    contenido.innerHTML = `<div class="carrito-vacio">🛒<br>Tu carrito está vacío.<br>¡Agrega alguna cafetera!</div>`;
    footer.style.display = 'none';
  } else {
    contenido.innerHTML = carrito.map(item => `
      <div class="carrito-item">
        <span class="carrito-item-emoji">${item.emoji}</span>
        <div class="carrito-item-info">
          <div class="carrito-item-nombre">${item.nombre}</div>
          <div class="carrito-item-precio">$${item.precio.toFixed(2)} c/u</div>
        </div>
        <div class="carrito-item-qty">
          <button class="qty-btn" onclick="cambiarQty(${item.id},-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="cambiarQty(${item.id},1)">+</button>
        </div>
      </div>
    `).join('');
    const total = carrito.reduce((s,i) => s + i.precio * i.qty, 0);
    document.getElementById('totalCarrito').textContent = `$${total.toFixed(2)}`;
    footer.style.display = 'block';
  }
  document.getElementById('overlayCarrito').classList.add('visible');
}

function cambiarQty(id, delta) {
  const idx = carrito.findIndex(i => i.id === id);
  if (idx < 0) return;
  carrito[idx].qty += delta;
  if (carrito[idx].qty <= 0) carrito.splice(idx, 1);
  actualizarBadge();
  abrirCarrito();
}

function cerrarCarrito(e) { if (e.target === e.currentTarget) cerrarCarritos(); }
function cerrarCarritos() { document.getElementById('overlayCarrito').classList.remove('visible'); }

function toggleAdmin() {
  if (adminActivo) {
    adminActivo = false;
    document.getElementById('btnAdmin').classList.remove('activo');
    document.getElementById('adminLabel').textContent = 'Admin';
    document.getElementById('barraAdmin').classList.remove('visible');
    aplicarFiltros();
  } else {
    document.getElementById('overlayLogin').classList.add('visible');
    document.getElementById('inputUser').value = '';
    document.getElementById('inputPass').value = '';
    document.getElementById('errorMsg').classList.remove('visible');
  }
}

function intentarLogin() {
  const u = document.getElementById('inputUser').value;
  const p = document.getElementById('inputPass').value;
  if (u === 'admin' && p === '1234') {
    adminActivo = true;
    document.getElementById('btnAdmin').classList.add('activo');
    document.getElementById('adminLabel').textContent = 'Salir';
    document.getElementById('barraAdmin').classList.add('visible');
    cerrarLogins();
    aplicarFiltros();
    mostrarNotif('✅ Sesión de administrador iniciada');
  } else {
    document.getElementById('errorMsg').classList.add('visible');
  }
}

function cerrarLogin(e) { if (e.target === e.currentTarget) cerrarLogins(); }
function cerrarLogins() { document.getElementById('overlayLogin').classList.remove('visible'); }

function abrirModalAgregar() {
  document.getElementById('nNombre').value = '';
  document.getElementById('nMarca').value = '';
  document.getElementById('nPrecio').value = '';
  quitarFoto();
  document.getElementById('overlayAgregar').classList.add('visible');
}

function cerrarAgregar(e) { if (e.target === e.currentTarget) cerrarAgregas(); }
function cerrarAgregas() { document.getElementById('overlayAgregar').classList.remove('visible'); }

function previewFoto(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    alert('La imagen es muy grande. El máximo es 5 MB.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('fotoPreview');
    preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    preview.classList.add('con-imagen');
    document.getElementById('btnQuitarFoto').style.display = 'block';
    document.getElementById('fotoUploader').style.borderStyle = 'solid';
    document.getElementById('fotoUploader').style.borderColor = 'var(--verde)';
  };
  reader.readAsDataURL(file);
}

function quitarFoto() {
  document.getElementById('nFoto').value = '';
  const preview = document.getElementById('fotoPreview');
  preview.innerHTML = `
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
    <span>Hacé clic para subir una foto</span>
    <span style="font-size:0.72rem;color:#bbb">JPG, PNG, WEBP — max 5 MB</span>`;
  preview.classList.remove('con-imagen');
  document.getElementById('btnQuitarFoto').style.display = 'none';
  document.getElementById('fotoUploader').style.borderStyle = 'dashed';
  document.getElementById('fotoUploader').style.borderColor = 'var(--borde)';
}

function agregarProducto() {
  const nombre = document.getElementById('nNombre').value.trim();
  const marca = document.getElementById('nMarca').value.trim();
  const tipo = document.getElementById('nTipo').value;
  const precio = parseFloat(document.getElementById('nPrecio').value);
  const imgEl = document.getElementById('fotoPreview').querySelector('img');
  const imagen = imgEl ? imgEl.src : null;
  if (!nombre || !marca || isNaN(precio) || precio <= 0) {
    alert('Por favor completá todos los campos correctamente.');
    return;
  }
  productos.push({ id: nextId++, nombre, marca, tipo, precio, emoji: '☕', imagen });
  cerrarAgregas();
  aplicarFiltros();
  mostrarNotif('✅ Producto agregado correctamente');
}

function eliminarProducto(id) {
  const prod = productos.find(p => p.id === id);
  if (!prod) return;
  if (!confirm(`¿Eliminar "${prod.nombre}"?`)) return;
  productos = productos.filter(p => p.id !== id);
  carrito = carrito.filter(i => i.id !== id);
  actualizarBadge();
  aplicarFiltros();
  mostrarNotif('🗑️ Producto eliminado');
}

function mostrarNotif(msg) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// INIT
aplicarFiltros();
