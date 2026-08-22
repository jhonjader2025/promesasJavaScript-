/**
 * ================================================================
 * SPA TUTORIAL: PROMESAS + API GRATUITA + TAILWIND CSS LOCAL
 * ================================================================
 *
 * Estructura SPA con navegacion por hash (#page)
 * Secciones: 7 patrones de Promesas + Videos + Reportes + Geolocalizacion
 *
 * API usada: JSONPlaceholder (https://jsonplaceholder.typicode.com/)
 * ================================================================
 */

const API = 'https://jsonplaceholder.typicode.com';

const PAGES = {
  home: 'Inicio',
  'promise-basica': 'Promise básica',
  'promise-array': 'Promise + array',
  'promise-all': 'Promise.all',
  'promise-allsettled': 'Promise.allSettled',
  'promise-race': 'Promise.race',
  'promise-any': 'Promise.any',
  'maquina-estados': 'Máquina de Estados',
  videos: 'Videos',
  reportes: 'Reportes',
  geolocalizacion: 'Geolocalización'
};

// ================================================================
// UTILIDADES
// ================================================================

function sanitizeHTML(raw) {
  if (typeof raw !== 'string') return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' };
  return raw.replace(/[&<>"']/g, match => map[match]);
}

function showLoading(containerId, message = 'Cargando...') {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<p class="text-slate-500">${sanitizeHTML(message)}</p>`;
}

function showError(containerId, message) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `<p class="text-red-400">Error: ${sanitizeHTML(message)}</p>`;
}

function getPageFromHash() {
  const hash = window.location.hash.replace('#', '') || 'home';
  return hash;
}

function navigateTo(page) {
  window.location.hash = page;
}

function updateNavActive() {
  const currentPage = getPageFromHash();
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('data-page');
    if (linkPage === currentPage) {
      link.classList.add('bg-slate-800', 'text-emerald-400');
      link.classList.remove('text-slate-400');
    } else {
      link.classList.remove('bg-slate-800', 'text-emerald-400');
      link.classList.add('text-slate-400');
    }
  });
}

function updatePageTitle() {
  const currentPage = getPageFromHash();
  const title = PAGES[currentPage] || currentPage;
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = title;
  }
}

function showPage(pageName) {
  document.querySelectorAll('.page-section').forEach(section => {
    section.classList.add('hidden');
  });
  const target = document.getElementById(`page-${pageName}`);
  if (target) {
    target.classList.remove('hidden');
  }
  updateNavActive();
  updatePageTitle();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ================================================================
// RUTAS SPA
// ================================================================

function handleRoute() {
  const page = getPageFromHash();
  if (!PAGES[page]) {
    navigateTo('home');
    return;
  }
  showPage(page);
  loadPageData(page);
}

function loadPageData(page) {
  switch (page) {
    case 'promise-basica': loadSinglePost(); break;
    case 'promise-array': loadUsersList(); break;
    case 'promise-all': loadCombinedData(); break;
    case 'promise-allsettled': loadSettledPosts(); break;
    case 'promise-race': loadRaceResult(); break;
    case 'promise-any': loadAnyResult(); break;
    case 'maquina-estados': initSearchIfNeeded(); break;
    case 'videos': break;
    case 'reportes': break;
    case 'geolocalizacion': break;
    default: break;
  }
}


// ================================================================
// REPORTES
// ================================================================

let currentReportData = null;

function initReports() {
  const genUsersBtn = document.getElementById('gen-report-users');
  const genPostsBtn = document.getElementById('gen-report-posts');
  const genCombinedBtn = document.getElementById('gen-report-combined');
  const downloadBtn = document.getElementById('download-report');
  const printBtn = document.getElementById('print-report');
  const previewEl = document.getElementById('report-preview');

  if (!genUsersBtn) return;

  function renderReport(title, lines) {
    const timestamp = new Date().toISOString();
    const report = [
      `========================================`,
      `  REPORTE: ${title}`,
      `  Generado: ${timestamp}`,
      `========================================`,
      ``,
      ...lines,
      ``,
      `========================================`,
      `  Fin del reporte`,
      `========================================`
    ].join('\n');

    currentReportData = report;
    previewEl.textContent = report;
    downloadBtn.classList.remove('hidden');
    printBtn.classList.remove('hidden');
  }

  genUsersBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API}/users?_limit=5`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const users = await response.json();

      const lines = users.map((u, i) => [
        `Usuario #${i + 1}:`,
        `  Nombre:     ${u.name}`,
        `  Username:   ${u.username}`,
        `  Email:      ${u.email}`,
        `  Telefono:   ${u.phone}`,
        `  Empresa:    ${u.company.name}`,
        `  Ciudad:     ${u.address.city}`,
        `  Website:    ${u.website}`,
        ``
      ].join('\n')).join('');

      renderReport('Reporte de Usuarios', lines.split('\n'));
    } catch (error) {
      previewEl.innerHTML = `<p class="text-red-400">Error al generar reporte: ${sanitizeHTML(error.message)}</p>`;
    }
  });

  genPostsBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(`${API}/posts?_limit=10`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const posts = await response.json();

      const lines = posts.map(p => [
        `Post #${p.id}:`,
        `  Titulo: ${p.title}`,
        `  Body: ${p.body.substring(0, 80)}...`,
        `  Autor ID: ${p.userId}`,
        ``
      ].join('\n')).join('');

      renderReport('Reporte de Posts', lines.split('\n'));
    } catch (error) {
      previewEl.innerHTML = `<p class="text-red-400">Error al generar reporte: ${sanitizeHTML(error.message)}</p>`;
    }
  });

  genCombinedBtn.addEventListener('click', async () => {
    try {
      const [usersRes, postsRes] = await Promise.all([
        fetch(`${API}/users?_limit=5`),
        fetch(`${API}/posts?_limit=5`)
      ]);
      if (!usersRes.ok || !postsRes.ok) throw new Error('Error al obtener datos');

      const users = await usersRes.json();
      const posts = await postsRes.json();

      const lines = [
        `=== COMBINADO ===`,
        ``,
        `--- Usuarios (${users.length}) ---`,
        ...users.map(u => `  ${u.name} (${u.username}) - ${u.email}`),
        ``,
        `--- Posts (${posts.length}) ---`,
        ...posts.map(p => `  Post #${p.id}: "${p.title.substring(0, 50)}..." (Usuario ${p.userId})`),
        ``,
        `--- Resumen ---`,
        `  Total usuarios: ${users.length}`,
        `  Total posts: ${posts.length}`,
        `  Posts por usuario (promedio): ${(posts.length / users.length).toFixed(1)}`
      ];

      renderReport('Reporte Combinado', lines);
    } catch (error) {
      previewEl.innerHTML = `<p class="text-red-400">Error al generar reporte: ${sanitizeHTML(error.message)}</p>`;
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentReportData) return;
    const blob = new Blob([currentReportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  printBtn.addEventListener('click', () => {
    window.print();
  });
}

// ================================================================
// GEOLOCALIZACION
// ================================================================

function initGeolocation() {
  const getLocationBtn = document.getElementById('get-location');
  const geoInfo = document.getElementById('geo-info');
  const geoError = document.getElementById('geo-error');
  const mapFrame = document.getElementById('map-frame');

  if (!getLocationBtn) return;

  getLocationBtn.addEventListener('click', async () => {
    geoError.classList.add('hidden');
    geoInfo.innerHTML = `<p class="text-yellow-400">Obteniendo ubicación...</p>`;

    if (!navigator.geolocation) {
      geoError.classList.remove('hidden');
      geoError.textContent = '❌ Tu navegador no soporta geolocalización.';
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          geoError.classList.remove('hidden');
          geoError.textContent = '❌ Permiso de ubicación denegado. Haz clic en el ícono de candado 🔒 en la barra de direcciones, selecciona "Sitio no seguro" o "Información del sitio", luego activa "Ubicación" y recarga la página.';
          return;
        }
      } catch (e) {
        // Si el navegador no soporta permissions.query, continuamos de todos modos
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const { timestamp } = position;

        geoInfo.innerHTML = `
          <div class="space-y-1">
            <p><strong>Latitud:</strong> <span class="text-emerald-400">${latitude.toFixed(6)}</span></p>
            <p><strong>Longitud:</strong> <span class="text-emerald-400">${longitude.toFixed(6)}</span></p>
            <p><strong>Precisión:</strong> ±${accuracy.toFixed(1)} metros</p>
            <p><strong>Timestamp:</strong> ${new Date(timestamp).toLocaleString()}</p>
          </div>
        `;

        const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.01},${latitude - 0.01},${longitude + 0.01},${latitude + 0.01}&layer=mapnik&marker=${latitude},${longitude}`;
        mapFrame.src = mapUrl;
      },
      (error) => {
        geoInfo.innerHTML = '';
        geoError.classList.remove('hidden');

        switch (error.code) {
          case error.PERMISSION_DENIED:
            geoError.textContent = '❌ Permiso de ubicación denegado. Haz clic en el ícono de candado 🔒 en la barra de direcciones, selecciona "Sitio no seguro" o "Información del sitio", luego activa "Ubicación" y recarga la página.';
            break;
          case error.POSITION_UNAVAILABLE:
            geoError.textContent = '❌ Ubicación no disponible. Verifica que tu dispositivo tenga GPS o conexión a red.';
            break;
          case error.TIMEOUT:
            geoError.textContent = '❌ La solicitud de ubicación expiró. Inténtalo de nuevo.';
            break;
          default:
            geoError.textContent = `❌ Error desconocido: ${error.message}`;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}

// ================================================================
// SIDEBAR Y NAVEGACION
// ================================================================

function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const toggleBtn = document.getElementById('sidebar-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  function isMobile() {
    return window.matchMedia('(max-width: 1023px)').matches;
  }

  function closeSidebar() {
    sidebar.classList.add('-translate-x-full');
    if (isMobile()) {
      overlay.classList.add('hidden');
    }
    if (!isMobile() && mainContent) {
      mainContent.classList.remove('ml-64');
    }
  }

  function openSidebar() {
    sidebar.classList.remove('-translate-x-full');
    if (isMobile()) {
      overlay.classList.remove('hidden');
    }
    if (!isMobile() && mainContent) {
      mainContent.classList.add('ml-64');
    }
  }

  function handleBreakpointChange() {
    if (isMobile()) {
      closeSidebar();
    } else {
      sidebar.classList.remove('-translate-x-full');
      overlay.classList.add('hidden');
      if (mainContent) {
        mainContent.classList.add('ml-64');
      }
    }
  }

  const mql = window.matchMedia('(max-width: 1023px)');

  function handleBreakpointChangeDebounced() {
    clearTimeout(handleBreakpointChange.timer);
    handleBreakpointChange.timer = setTimeout(handleBreakpointChange, 50);
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = !sidebar.classList.contains('-translate-x-full');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', closeSidebar);
  }

  if (overlay) {
    overlay.addEventListener('click', closeSidebar);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute('data-page');
      navigateTo(page);
      if (isMobile()) {
        closeSidebar();
      }
    });
  });

  window.addEventListener('hashchange', handleRoute);
  mql.addEventListener('change', handleBreakpointChangeDebounced);
  handleBreakpointChange();
}


/// primera promesa .
function loadSinglePost() {
  showLoading('single-post');// Muestra mensaje de carga
  fetch(`${API}/posts/1`)// Realiza la solicitud a la API para obtener el post con ID 1
    .then(response => { // Maneja la respuesta de la API
      if (!response.ok) throw new Error(`HTTP ${response.status}`);// Verifica si la respuesta es correcta
      return response.json();// Convierte la respuesta a JSON
    })
    .then(post => {
      const container = document.getElementById('single-post');
      if (!container) return;// Verifica si el contenedor existe
      container.innerHTML = `
        <h3 class="text-lg font-bold text-emerald-400 mb-2">${sanitizeHTML(post.title)}</h3>
        <p class="text-slate-300 text-sm leading-relaxed">${sanitizeHTML(post.body)}</p>
        <span class="inline-block mt-3 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
          Post ID: ${post.id} | Autor ID: ${post.userId}
        </span>
      `;// Muestra el contenido del post en el contenedor


    })
    .catch(error => {
      showError('single-post', error.message);// Muestra mensaje de error en caso de fallo
    })
    .finally(() => {
      console.log('[Paso 1] Promesa basica completada');// Mensaje de finalización en la consola
    });
  }

// SEGUNDA PROMESA: CARGA DE USUARIOS


function loadUsersList(){
  showLoading('users-list', 'Cargando usuarios...');
//Primeros 5 Usuarios
  fetch(`${API}/users?_limit=5`)
  .then(r => r.json())
  .then(users => {
    const container = document.getElementById('users-list');
    if (!container) return;
     container.innerHTML = users.map(user => `
        <div class="bg-slate-900 rounded-xl p-4 border border-slate-800 hover:border-slate-700 transition-all animate-fade-in">
          <h4 class="font-bold text-white">${sanitizeHTML(user.name)}</h4>
          <p class="text-sm text-slate-400">@${sanitizeHTML(user.username)}</p>
          <p class="text-xs text-slate-500 mt-2">${sanitizeHTML(user.email)}</p>
          <p class="text-xs text-slate-600 mt-1">${sanitizeHTML(user.company.name)}</p>
        </div>`).join('');
  })
  .catch(error => {
    showError('users-list', error.message);// muestra mensaje de error en caso de fallo
  })
  .finally(() => {
    console.log('[Paso 2] Promesa de array completa');// Mensaje de finalización en la consola
  });
}



///TERCERA PROMESA PROMICE ALL 3 perna



function loadCombinedData() {
  // Buscar el contenedor donde vamos a mostrar los datos
  const containerId = 'combined-data';
  showLoading(containerId, 'Ejecutando Promise.all(): Cargando usuario, post y comentarios en paralelo...');

  // Hacemos 3 peticiones a la API (cada una devuelve una promesa)
  const fetchUser = fetch(`${API}/users/1`).then(res => {
    if (!res.ok) throw new Error(`Error en usuario HTTP ${res.status}`);
    return res.json();
  });

  const fetchPost = fetch(`${API}/posts/1`).then(res => {
    if (!res.ok) throw new Error(`Error en post HTTP ${res.status}`);
    return res.json();
  });

  const fetchComments = fetch(`${API}/comments?postId=1`).then(res => {
    if (!res.ok) throw new Error(`Error en comentarios HTTP ${res.status}`);
    return res.json();
  });

  // Ejecutar las 3 promesas al mismo tiempo con Promise.all()
  console.time('[Promise.all] Tiempo de respuesta');
  Promise.all([fetchUser, fetchPost, fetchComments])
    .then(([user, post, comments]) => {
      // Cuando todas terminan bien, mostrar los datos
      console.timeEnd('[Promise.all] Tiempo de respuesta');

      const container = document.getElementById(containerId);
      if (!container) return;

      // Pintar en el HTML los datos obtenidos de las 3 promesas
      container.innerHTML = `
        <div class="space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">
              <span class="w-2 h-2 rounded-full bg-purple-400"></span>
              Peticiones simultáneas completadas con éxito
            </span>
            <span class="text-xs text-slate-500 font-mono">3 / 3 OK</span>
          </div>

          <!-- Usuario -->
          <div class="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">👤 Autor (Petición 1)</h4>
            <p class="text-base font-bold text-emerald-400">${sanitizeHTML(user.name)} (@${sanitizeHTML(user.username)})</p>
            <p class="text-xs text-slate-400 mt-1">📧 ${sanitizeHTML(user.email)} | 🏢 ${sanitizeHTML(user.company.name)}</p>
          </div>

          <!-- Post -->
          <div class="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">📝 Publicación (Petición 2)</h4>
            <h3 class="text-lg font-bold text-white mb-2">${sanitizeHTML(post.title)}</h3>
            <p class="text-sm text-slate-300 leading-relaxed">${sanitizeHTML(post.body)}</p>
          </div>

          <!-- Comentarios -->
          <div class="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">💬 Comentarios (Petición 3 - ${comments.length} recibidos)</h4>
            <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
              ${comments.slice(0, 3).map(comment => `
                <div class="bg-slate-900/80 p-3 rounded border border-slate-800 text-xs">
                  <p class="font-semibold text-purple-300">${sanitizeHTML(comment.name)}</p>
                  <p class="text-slate-400 mt-0.5">${sanitizeHTML(comment.body)}</p>
                  <span class="text-[10px] text-slate-500 mt-1 block">— ${sanitizeHTML(comment.email)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    })
    .catch(error => {
      // Si algo falla, mostrar error
      console.error('[Promise.all] Falló una de las promesas:', error);
      showError(containerId, `Promise.all() rechazó la operación: ${error.message}. Recuerda que si 1 petición falla, todo el bloque se rechaza.`);
    });
}


// TERCERA PROMESA DE Promise.allSettled perna


function loadSettledPosts() {
  const container = document.getElementById('settled-posts');
  container.innerHTML = 'Cargando peticiones...';

  // Lista de peticiones la 3ª tiene URL inválida a propósito para forzar error
  const requests = [
    { name: 'Petición 1', url: `${API}/posts/1` },
    { name: 'Petición 2', url: `${API}/posts/2` },
    { name: 'Petición 3 (Error)', url: `${API}/posts/invalid-999` },
    { name: 'Petición 4', url: `${API}/posts/4` },
    { name: 'Petición 5', url: `${API}/posts/5` }
  ];

  // Creamos un arreglo de promesas a partir de las URLs
  const promises = requests.map(req =>
    fetch(req.url)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => ({ name: req.name, data }))
  );

  // Ejecutamos todas las promesas con allSettled()
  Promise.allSettled(promises)
    .then(results => {
      // results contiene el estado de cada promesa
      const html = results.map((result, index) => {
        const reqInfo = requests[index];

        if (result.status === 'fulfilled') {
          const post = result.value.data;
          return `
            <div style="border:1px solid #28a745; padding:12px; margin:8px 0; border-radius:6px;">
              <strong>${reqInfo.name}</strong> <br>
              <strong>${post.title}</strong><br>
              ${post.body}
            </div>
          `;
        } else {
          // Caso de error
          const errorMsg = result.reason ? result.reason.message : 'Error desconocido';
          return `
            <div style="border:1px solid #dc3545; padding:12px; margin:8px 0; border-radius:6px; background:#fff5f5;">
              <strong>${reqInfo.name}</strong> ❌<br>
              <span style="color:#dc3545;">${errorMsg}</span>
            </div>
          `;
        }
      }).join('');

      container.innerHTML = html;
    })
    .catch(error => {
      // Este catch solo se ejecuta si hay error en la propia ejecución de allSettled que es casi nunca
      container.innerHTML = `Error inesperado: ${error.message}`;
    });
}

// ================================================================
// INICIALIZACION
// ================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('[App] DOM listo. Iniciando SPA...');

  initSidebar();
  initVideos();
  initReports();
  initGeolocation();
  initSearchIfNeeded();

  handleRoute();
});