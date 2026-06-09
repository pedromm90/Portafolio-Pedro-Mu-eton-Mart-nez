/**
 * ENRUTADOR DE PÁGINAS DE PROYECTOS
 */

// Mapeo de rutas amigables a archivos con plantillas
const routes = {
  "/": "pages/inicio.html",

  // Proyectos Web
  "/proyecto-egresados": "pages/egresados-intep.html",
};

/**
 * Navega a una ruta específica y actualiza el historial
 * @param {string} path - Ruta de destino (ej. '/about')
 */
const navigateTo = (path) => {
  window.history.pushState(null, null, path);
  router();
};

/**
 * Actualiza la clase activa de los enlaces en la barra de navegación
 * @param {string} path - Ruta activa actual
 */
const updateActiveLinks = (path) => {
  const links = document.querySelectorAll(".card-link");
  links.forEach((link) => {
    // Obtener el path relativo del enlace
    const href = link.getAttribute("href");
    if (href === path || (path === "/" && href === "/")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
};

/**
 * Función principal del enrutador
 */
const router = async () => {
  const appContainer = document.getElementById("app");
  let path = window.location.pathname;

  // Si la ruta termina en index.html, se normaliza a '/'
  if (path.endsWith("index.html")) {
    path = "/";
  }

  // Busca el archivo HTML de plantilla correspondiente a la ruta actual
  const templatePath = routes[path];

  // Actualizar los enlaces activos en la navegación
  updateActiveLinks(path);

  if (templatePath) {
    try {
      // Carga asíncrona de la plantilla HTML
      const response = await fetch(templatePath);

      if (!response.ok) {
        throw new Error(`No se pudo cargar la página: ${response.statusText}`);
      }

      const html = await response.text();

      // Inyección del contenido tras una breve pausa de transición
      setTimeout(() => {
        appContainer.innerHTML = html;
        appContainer.style.opacity = 1;
      }, 150);
    } catch (error) {
      console.error(error);
      appContainer.innerHTML = `
      <div class="page-enter hero-section" style="border-color: rgba(239, 68, 68, 0.3);">
          <span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">Error</span>
          <h1 class="title-gradient" style="background: linear-gradient(135deg, #fff, #ef4444);">Error al cargar</h1>
          <p class="subtitle">Lo sentimos, no pudimos cargar la página solicitada.</p>
          <a href="/" class="btn btn-primary" data-link>Volver al Inicio</a>
        </div>
    `;
      appContainer.style.opacity = 1;
    }
  } else {
    // Ruta no definida (404)
    appContainer.innerHTML = `
    <div class="page-enter hero-section" style="border-color: rgba(239, 68, 68, 0.3);">
        <span class="badge" style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border-color: rgba(239, 68, 68, 0.2);">404</span>
        <h1 class="title-gradient" style="background: linear-gradient(135deg, #fff, #ef4444);">Página no encontrada</h1>
        <p class="subtitle">La sección que estás buscando no existe.</p>
        <a href="/" class="btn btn-primary" data-link>Volver al Inicio</a>
      </div>
  `;
    appContainer.style.opacity = 1;
  }
};

// Escucha del evento 'popstate' para la navegación con los botones del navegador (atrás/adelante)
window.addEventListener('popstate', router);

// Intercepción de clics en el documento para enlaces con el atributo 'data-link'
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', (e) => {
    const targetLink = e.target.closest('[data-link]');

    if (targetLink) {
      e.preventDefault();
      const href = targetLink.getAttribute('href');
      navigateTo(href);
    }
  });

  // Carga inicial
  router();
});