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
    case 'videos': initVideos(); break;
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


/// PRIMERA PROMESA.
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



///TERCERA PROMESA PROMICE ALL 3 JHON JADER



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


// CUARTA PROMESA DE Promise.allSettled JHON JADER


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


// QUINTA PROMESA DE Promise.race JHON JADER

/**
 * ================================================================
 *  Promise.race() - El primero en terminar gana
 * ================================================================
 *  Promise.race() ejecuta varias promesas y devuelve el resultado
 *  de la PRIMERA que se complete (resuelta o rechazada).
 *
 *  En este ejemplo hacemos competir:
 *    - Una petición HTTP a JSONPlaceholder
 *    - Un temporizador de 3 segundos (timeout)
 *
 *  Si la petición llega antes de 3s → muestra los datos.
 *  Si pasan 3s sin respuesta → muestra mensaje de timeout.
 * ================================================================
 */

function loadRaceResult() {
  // 1. Buscar el contenedor en el HTML
  const container = document.getElementById('race-result');

  // 2. Mostrar mensaje de "cargando..."
  container.innerHTML = ' Esperando respuesta... (máximo 3 segundos)';

  // 3. Promesa que hace la petición HTTP
  const fetchPromise = fetch('https://jsonplaceholder.typicode.com/posts/1')
    .then(res => {
      if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
      return res.json(); // Convertir respuesta a objeto
    })
    .then(data => ({
      status: 'success',
      mensaje: 'Respuesta recibida correctamente.',
      data: data
    }));

  // 4. Promesa de timeout (3 segundos)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Tiempo de espera agotado (3 segundos)'));
    }, 3000);
  });

  // 5. Promise.race() - compiten ambas promesas
  Promise.race([fetchPromise, timeoutPromise])
    .then(result => {
      // Caso: ganó la petición HTTP (llegó antes de 3s)
      container.innerHTML = `
        <h3>✅ ${result.mensaje}</h3>
        <p><strong>Título:</strong> ${result.data.title}</p>
        <p><strong>Cuerpo:</strong> ${result.data.body}</p>
        <p><small>La petición llegó antes de los 3 segundos.</small></p>
      `;
      console.log('Ganó la API:', result.data);
    })
    .catch(error => {
      // Caso: ganó el timeout (pasaron 3s sin respuesta)
      container.innerHTML = `
        <h3 style="color: #d9534f;">❌ ${error.message}</h3>
        <p>No se recibió respuesta a tiempo. La petición fue cancelada simbólicamente.</p>
        <p><small>El timeout de 3 segundos fue más rápido.</small></p>
      `;
      console.warn('Ganó el timeout:', error.message);
    });
}




// SEXTA PROMESA: PROMISE.ANY ALEJANDRO
/**
 * ================================================================
 *  Promise.any() - El primer éxito importa
 * ================================================================
 *  Promise.any() toma un arreglo de promesas y se resuelve tan pronto
 *  como CUALQUIERA de las promesas se cumpla (éxito).
 *  Ignora las promesas que se rechazan a menos que TODAS fallen,
 *  en cuyo caso lanza un AggregateError.
 * ================================================================
 */
function loadAnyResult() {
  const containerId = 'any-result';
  showLoading(containerId, 'Buscando el primer servidor que responda con éxito (Promise.any)...');

  // Definimos 3 peticiones a endpoints diferentes (incluyendo endpoints con error y demoras simuladas)
  const req1 = fetch(`${API}/posts/invalid-endpoint-999`)
    .then(res => {
      if (!res.ok) throw new Error(`Servidor 1 falló con HTTP ${res.status}`);
      return res.json();
    })
    .then(data => ({ server: 'Servidor 1 (Con Error)', data }));

  const req2 = new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch(`${API}/posts/1`)
        .then(res => {
          if (!res.ok) throw new Error(`Servidor 2 falló con HTTP ${res.status}`);
          return res.json();
        })
        .then(data => resolve({ server: 'Servidor 2 (Principal - 500ms)', data }))
        .catch(reject);
    }, 500);
  });

  const req3 = new Promise((resolve, reject) => {
    setTimeout(() => {
      fetch(`${API}/users/1`)
        .then(res => {
          if (!res.ok) throw new Error(`Servidor 3 falló con HTTP ${res.status}`);
          return res.json();
        })
        .then(data => resolve({ server: 'Servidor 3 (Respaldos - 1200ms)', data }))
        .catch(reject);
    }, 1200);
  });

  console.time('[Promise.any] Tiempo de respuesta');
  Promise.any([req1, req2, req3])
    .then(result => {
      console.timeEnd('[Promise.any] Tiempo de respuesta');
      const container = document.getElementById(containerId);
      if (!container) return;

      const isPost = result.data.title !== undefined;

      container.innerHTML = `
        <div class="space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <span class="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs font-semibold rounded-full border border-cyan-500/20">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              🥇 Primer éxito capturado: ${sanitizeHTML(result.server)}
            </span>
            <span class="text-xs text-slate-500 font-mono">Promise.any() OK</span>
          </div>

          <div class="bg-slate-800/60 p-4 rounded-lg border border-slate-700/60">
            ${isPost ? `
              <h3 class="text-lg font-bold text-white mb-2">${sanitizeHTML(result.data.title)}</h3>
              <p class="text-sm text-slate-300 leading-relaxed">${sanitizeHTML(result.data.body)}</p>
              <span class="inline-block mt-3 text-xs text-slate-500 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                Post ID: ${result.data.id} | Autor ID: ${result.data.userId}
              </span>
            ` : `
              <h3 class="text-lg font-bold text-emerald-400 mb-2">${sanitizeHTML(result.data.name)} (@${sanitizeHTML(result.data.username)})</h3>
              <p class="text-sm text-slate-300">📧 ${sanitizeHTML(result.data.email)}</p>
              <p class="text-xs text-slate-400 mt-1">🏢 ${sanitizeHTML(result.data.company?.name || '')}</p>
            `}
          </div>

          <p class="text-xs text-slate-400 bg-slate-950/40 p-3 rounded border border-slate-800">
            ℹ️ <strong>Nota:</strong> A diferencia de <code class="text-cyan-300">Promise.race()</code> (que se interrumpe si la primera petición falla), <code class="text-cyan-300">Promise.any()</code> ignoró el error del Servidor 1 y esperó al primer servidor que respondió exitosamente.
          </p>
        </div>
      `;
    })
    .catch(error => {
      console.error('[Promise.any] Todas las promesas fueron rechazadas:', error);
      let errorDetails = error.message;
      if (error.errors) {
        errorDetails = error.errors.map(e => e.message).join(' | ');
      }
      showError(containerId, `Promise.any() rechazó la operación (todas las peticiones fallaron): ${errorDetails}`);
    });
}


// SEPTIMA PROMESA: MAQUINA DE ESTADOS ALEJANDRO
/**
 * ================================================================
 *  Máquina de Estados — UI Reactiva
 * ================================================================
 *  Gestión de estados: IDLE -> PENDING -> FULFILLED / REJECTED
 * ================================================================
 */

let isSearchInitialized = false;

function initSearchIfNeeded() {
  const searchBtn = document.getElementById('search-btn');
  const userIdInput = document.getElementById('user-id-input');

  if (!searchBtn || !userIdInput) return;

  if (!isSearchInitialized) {
    isSearchInitialized = true;

    searchBtn.addEventListener('click', performStateSearch);
    userIdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performStateSearch();
      }
    });
  }
}

function updateSearchState(state, payload = {}) {
  const searchBtn = document.getElementById('search-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const searchStatus = document.getElementById('search-status');
  const searchResults = document.getElementById('search-results');

  if (!searchBtn || !btnText || !btnSpinner || !searchStatus || !searchResults) return;

  switch (state) {
    case 'PENDING':
      searchBtn.disabled = true;
      searchBtn.classList.add('opacity-75', 'cursor-not-allowed');
      btnText.textContent = 'Buscando...';
      btnSpinner.classList.remove('hidden');

      searchStatus.className = 'mb-3 p-3 rounded-lg text-sm font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      searchStatus.innerHTML = `⏳ <strong>PENDING:</strong> Consultando publicaciones para el usuario ID ${payload.userId || ''}...`;
      searchStatus.classList.remove('hidden');

      searchResults.innerHTML = '';
      break;

    case 'FULFILLED':
      searchBtn.disabled = false;
      searchBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      btnText.textContent = 'Buscar';
      btnSpinner.classList.add('hidden');

      searchStatus.className = 'mb-3 p-3 rounded-lg text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      searchStatus.innerHTML = `✅ <strong>FULFILLED:</strong> Se encontraron ${payload.posts.length} publicaciones del usuario <strong>${sanitizeHTML(payload.user.name)}</strong> (@${sanitizeHTML(payload.user.username)})`;
      searchStatus.classList.remove('hidden');

      searchResults.innerHTML = payload.posts.map(post => `
        <div class="bg-slate-800/80 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-all">
          <h4 class="font-bold text-white text-base mb-1">${sanitizeHTML(post.title)}</h4>
          <p class="text-slate-300 text-sm leading-relaxed">${sanitizeHTML(post.body)}</p>
          <span class="inline-block mt-2 text-xs text-slate-500">Post #${post.id}</span>
        </div>
      `).join('');
      break;

    case 'REJECTED':
      searchBtn.disabled = false;
      searchBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      btnText.textContent = 'Buscar';
      btnSpinner.classList.add('hidden');

      searchStatus.className = 'mb-3 p-3 rounded-lg text-sm font-medium bg-red-500/10 text-red-400 border border-red-500/20';
      searchStatus.innerHTML = `❌ <strong>REJECTED:</strong> ${sanitizeHTML(payload.error)}`;
      searchStatus.classList.remove('hidden');

      searchResults.innerHTML = '';
      break;

    case 'IDLE':
    default:
      searchBtn.disabled = false;
      searchBtn.classList.remove('opacity-75', 'cursor-not-allowed');
      btnText.textContent = 'Buscar';
      btnSpinner.classList.add('hidden');
      searchStatus.classList.add('hidden');
      searchResults.innerHTML = '';
      break;
  }
}

async function performStateSearch() {
  const userIdInput = document.getElementById('user-id-input');
  if (!userIdInput) return;

  const rawValue = userIdInput.value.trim();
  const userId = parseInt(rawValue, 10);

  if (!rawValue || isNaN(userId) || userId < 1 || userId > 10) {
    updateSearchState('REJECTED', { error: 'Por favor ingresa un ID de usuario válido entre 1 y 10.' });
    return;
  }

  // Transición a estado PENDING
  updateSearchState('PENDING', { userId });

  try {
    // Latencia simulada para apreciar la transición de la máquina de estados
    await new Promise(resolve => setTimeout(resolve, 600));

    const [userRes, postsRes] = await Promise.all([
      fetch(`${API}/users/${userId}`),
      fetch(`${API}/posts?userId=${userId}`)
    ]);

    if (!userRes.ok || !postsRes.ok) {
      throw new Error(`No se pudo obtener la información (HTTP ${userRes.status}/${postsRes.status})`);
    }

    const user = await userRes.json();
    const posts = await postsRes.json();

    if (!posts || posts.length === 0) {
      throw new Error(`El usuario ID ${userId} no tiene publicaciones asociadas.`);
    }

    // Transición a estado FULFILLED
    updateSearchState('FULFILLED', { user, posts });
  } catch (error) {
    // Transición a estado REJECTED
    updateSearchState('REJECTED', { error: error.message });
  }
}


// ================================================================
// VIDEOS - MEDIASTREAM ALEJANRO
// ================================================================

let activeVideoStream = null;
let isVideosInitialized = false;

function initVideos() {
  const startBtn = document.getElementById('start-camera');
  const stopBtn = document.getElementById('stop-camera');
  const captureBtn = document.getElementById('capture-photo');
  const videoPreview = document.getElementById('video-preview');
  const photoCanvas = document.getElementById('photo-canvas');
  const photoStatus = document.getElementById('photo-status');
  const videoInfo = document.getElementById('video-info');

  if (!startBtn || isVideosInitialized) return;
  isVideosInitialized = true;

  // Iniciar cámara
  startBtn.addEventListener('click', async () => {
    photoStatus.className = 'text-yellow-400 text-sm';
    photoStatus.textContent = 'Solicitando acceso a la cámara...';

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Tu navegador o entorno no soporta la API getUserMedia().');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      activeVideoStream = stream;
      videoPreview.srcObject = stream;
      await videoPreview.play();

      startBtn.classList.add('hidden');
      stopBtn.classList.remove('hidden');
      captureBtn.classList.remove('hidden');

      photoStatus.className = 'text-emerald-400 text-sm';
      photoStatus.textContent = '📷 Cámara activa y transmitiendo.';

      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings();
        videoInfo.innerHTML = `
          <p><strong>Dispositivo:</strong> ${sanitizeHTML(track.label || 'Cámara web')}</p>
          <p><strong>Resolución:</strong> ${settings.width || 640}x${settings.height || 480} px</p>
          <p><strong>Frecuencia:</strong> ${settings.frameRate ? settings.frameRate.toFixed(0) + ' fps' : 'N/A'}</p>
        `;
      }
    } catch (error) {
      console.error('[Videos] Error al iniciar cámara:', error);
      photoStatus.className = 'text-red-400 text-sm';
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        photoStatus.textContent = '❌ Permiso denegado para acceder a la cámara. Por favor habilita el permiso en tu navegador.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        photoStatus.textContent = '❌ No se encontró ninguna cámara conectada en tu dispositivo.';
      } else {
        photoStatus.textContent = `❌ Error al acceder a la cámara: ${error.message}`;
      }
    }
  });

  // Detener cámara
  stopBtn.addEventListener('click', () => {
    if (activeVideoStream) {
      activeVideoStream.getTracks().forEach(track => track.stop());
      activeVideoStream = null;
    }
    videoPreview.srcObject = null;

    startBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    captureBtn.classList.add('hidden');

    photoStatus.className = 'text-slate-500 text-sm';
    photoStatus.textContent = 'Cámara detenida.';
    videoInfo.innerHTML = '';
  });

  // Capturar foto
  captureBtn.addEventListener('click', () => {
    if (!videoPreview || !videoPreview.videoWidth) {
      photoStatus.className = 'text-red-400 text-sm';
      photoStatus.textContent = '❌ El video no está listo para capturar fotos.';
      return;
    }

    const width = videoPreview.videoWidth;
    const height = videoPreview.videoHeight;

    photoCanvas.width = width;
    photoCanvas.height = height;

    const ctx = photoCanvas.getContext('2d');
    ctx.drawImage(videoPreview, 0, 0, width, height);

    photoCanvas.classList.remove('hidden');
    photoStatus.className = 'text-emerald-400 text-sm font-semibold';
    photoStatus.textContent = `📸 Foto capturada con éxito a las ${new Date().toLocaleTimeString()} (${width}x${height} px)`;
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