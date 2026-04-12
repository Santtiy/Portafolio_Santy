const menuLinks = document.querySelectorAll('.menu a');
const menuToggle = document.querySelector('.menu-toggle');

const setActiveMenuLink = (targetId) => {
  menuLinks.forEach((item) => {
    const href = item.getAttribute('href');
    item.classList.toggle('active', href === `#${targetId}`);
  });
};

menuLinks.forEach((link) => {
  link.addEventListener('click', () => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    setActiveMenuLink(href.slice(1));

    if (document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

const observedSections = Array.from(menuLinks)
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter((section) => section instanceof HTMLElement);

if (observedSections.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveMenuLink(entry.target.id);
        }
      });
    },
    {
      threshold: 0.45,
      rootMargin: '-25% 0px -45% 0px',
    }
  );

  observedSections.forEach((section) => observer.observe(section));
}

const scrollAnimatedSections = Array.from(
  document.querySelectorAll('main.container.hero-grid, section.container, footer.container.site-footer')
);

const canUseSectionAnimations = window.matchMedia(
  '(min-width: 861px) and (prefers-reduced-motion: no-preference)'
).matches;

if (scrollAnimatedSections.length > 0 && canUseSectionAnimations) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('section-in-view', entry.isIntersecting);
      });
    },
    {
      threshold: 0.22,
      rootMargin: '0px 0px -8% 0px',
    }
  );

  scrollAnimatedSections.forEach((section) => {
    section.classList.add('scroll-reveal', 'section-in-view');
    sectionObserver.observe(section);
  });

  document.body.classList.add('scroll-animate-enabled');
} else {
  document.body.classList.remove('scroll-animate-enabled');
}

const dot = document.querySelector('.scroll-dot');

if (dot) {
  dot.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Sticky navbar effect on scroll
const topbar = document.querySelector('.topbar');
if (topbar) {
  const updateTopbar = () => {
    topbar.classList.toggle('is-scrolled', window.scrollY > 6);
  };

  updateTopbar();
  window.addEventListener('scroll', updateTopbar, { passive: true });
}

/* Theme toggle: alterna entre 'dark' y 'light' y persiste la preferencia */
(function () {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const THEME_KEY = 'site-theme';

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    // Actualiza icono
    toggle.innerHTML = isDark
      ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
  };

  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') {
    applyTheme(saved);
  } else {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  toggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      // no-op
    }
  });
})();

// Language toggle: alterna entre 'es' y 'en' (solo atributo lang y etiqueta)
(function () {
  const langToggle = document.getElementById('lang-toggle');
  if (!langToggle) return;

  const LANG_KEY = 'site-lang';
  const translations = {
    es: {
      'nav.menuToggle': 'Abrir menu de navegacion',
      'nav.primary': 'Principal',
      'nav.about': 'Sobre mi',
      'nav.projects': 'Proyectos',
      'nav.process': 'Proceso',
      'nav.testimonials': 'Testimonios',
      'nav.contact': 'Contacto',
      'nav.lang': 'Cambiar idioma',
      'hero.role': 'Desarrollador Backend',
      'hero.name': 'Santiago<br />Bustos Lopez',
      'hero.summary': 'Desarrollo soluciones digitales que conectan personas y procesos, desde plataformas de gestion educativa hasta aplicaciones que facilitan la comunicacion en el sector agricola. Me gusta la arquitectura de software y la planeacion tecnica para construir sistemas claros y escalables.',
      'hero.cta': 'Explorar proyectos',
      'sidebar.location.title': 'Ubicacion',
      'sidebar.location.value': 'Colombia',
      'sidebar.degree.title': 'Carrera',
      'sidebar.degree.value': 'Ing. Software',
      'sidebar.university.title': 'Universidad',
      'sidebar.university.value': 'Universidad Cooperativa de Colombia',
      'sidebar.status.title': 'Estado',
      'sidebar.status.value': 'Abierto a oportunidades',
      'sidebar.links.title': 'Enlaces',
      'about.section': '02 - SOBRE MI',
      'about.title': 'Perfil Profesional',
      'about.p1': 'Soy <strong>Santiago Bustos Lopez</strong>, estudiante de Ingenieria de Software en la Universidad Cooperativa de Colombia, con enfoque en el desarrollo de soluciones practicas a traves de proyectos reales. Tengo experiencia en el desarrollo web utilizando Python y Django, asi como en la creacion de entornos interactivos con Unreal Engine.',
      'about.p2': 'Me especializo en la construccion de aplicaciones que integran backend y logica de negocio, priorizando la claridad en la arquitectura, el desacoplamiento entre frontend y backend, y la escalabilidad de los sistemas. He trabajado en proyectos que incluyen plataformas tipo red profesional, simulaciones fisicas y sistemas interactivos, fortaleciendo tanto mis habilidades tecnicas como mi capacidad de resolucion de problemas.',
      'about.p3': 'Ademas de la tecnologia, soy amante de los videojuegos, disfruto jugar basquetbol, ver peliculas y salir a caminar para despejar la mente y encontrar nuevas ideas.',
      'about.feature1.title': 'Desarrollo Backend',
      'about.feature1.body': 'Desarrollo aplicaciones web integrando backend con Python y Django, creando APIs REST y gestionando la comunicacion entre servicios. Me enfoco en la logica del sistema y en construir bases solidas para aplicaciones escalables.',
      'about.feature2.title': 'Integracion de Sistemas',
      'about.feature2.body': 'Diseno soluciones que conectan diferentes tipos de usuarios dentro de una misma plataforma, facilitando la interaccion y el flujo de informacion. Me enfoco en estructurar sistemas claros y funcionales.',
      'about.feature3.title': 'Resolucion de Problemas y Automatizacion',
      'about.feature3.body': 'Implemento soluciones para automatizar procesos y resolver problemas tecnicos, desde calculos y simulaciones hasta la optimizacion de flujos dentro de una aplicacion.',
      'about.metrics': 'Metricas profesionales',
      'about.metrics.projects': 'Proyectos completados',
      'about.metrics.level': 'Nivel de desarrollo',
      'about.metrics.api': 'Arquitectura API',
      'about.metrics.crud': 'Operaciones implementadas',
      'projects.section': '03 - PROYECTOS DESTACADOS',
      'projects.subtitle': '3 casos de estudio',
      'projects.type.fullstack': 'Full-Stack',
      'projects.type.webapp': 'Aplicacion Web',
      'projects.stack.api': 'API REST',
      'projects.stack.crud': 'CRUD Estructurado',
      'projects.problem': 'Problema',
      'projects.role': 'Mi rol',
      'projects.decision': 'Decision clave',
      'projects.number1': 'Proyecto #1',
      'projects.number2': 'Proyecto #2',
      'projects.number3': 'Proyecto #3',
      'projects.code': 'Ver codigo',
      'projects.demo': 'Ver demo',
    },
    en: {
      'nav.menuToggle': 'Open navigation menu',
      'nav.primary': 'Primary',
      'nav.about': 'About',
      'nav.projects': 'Projects',
      'nav.process': 'Process',
      'nav.testimonials': 'Testimonials',
      'nav.contact': 'Contact',
      'nav.lang': 'Change language',
      'hero.role': 'Backend Developer',
      'hero.name': 'Santiago<br />Bustos Lopez',
      'hero.summary': 'I build digital solutions that connect people and processes, from education management platforms to applications that improve communication in the agricultural sector. I enjoy software architecture and technical planning to build clear and scalable systems.',
      'hero.cta': 'Explore projects',
      'sidebar.location.title': 'Location',
      'sidebar.location.value': 'Colombia',
      'sidebar.degree.title': 'Degree',
      'sidebar.degree.value': 'Software Eng.',
      'sidebar.university.title': 'University',
      'sidebar.university.value': 'Universidad Cooperativa de Colombia',
      'sidebar.status.title': 'Status',
      'sidebar.status.value': 'Open to opportunities',
      'sidebar.links.title': 'Links',
      'about.section': '02 - ABOUT ME',
      'about.title': 'Professional Profile',
      'about.p1': 'I am <strong>Santiago Bustos Lopez</strong>, a Software Engineering student at Universidad Cooperativa de Colombia, focused on building practical solutions through real projects. I have experience in web development with Python and Django, as well as creating interactive environments with Unreal Engine.',
      'about.p2': 'I specialize in building applications that integrate backend and business logic, prioritizing clear architecture, frontend-backend decoupling, and system scalability. I have worked on projects including professional network platforms, physics simulations, and interactive systems, strengthening both my technical skills and my problem-solving ability.',
      'about.p3': 'Beyond technology, I am a video game enthusiast, enjoy playing basketball, watching movies, and going for walks to clear my mind and find new ideas.',
      'about.feature1.title': 'Backend Development',
      'about.feature1.body': 'I build web applications integrating backend with Python and Django, creating REST APIs and managing communication between services. I focus on system logic and building solid foundations for scalable applications.',
      'about.feature2.title': 'Systems Integration',
      'about.feature2.body': 'I design solutions that connect different user types within a single platform, facilitating interaction and information flow. I focus on structuring clear and functional systems.',
      'about.feature3.title': 'Problem Solving and Automation',
      'about.feature3.body': 'I implement solutions to automate processes and solve technical problems, from calculations and simulations to optimizing flows within an application.',
      'about.metrics': 'Professional metrics',
      'about.metrics.projects': 'Projects completed',
      'about.metrics.level': 'Development level',
      'about.metrics.api': 'API architecture',
      'about.metrics.crud': 'CRUD operations',
      'projects.section': '03 - FEATURED PROJECTS',
      'projects.subtitle': '3 case studies',
      'projects.type.fullstack': 'Full-Stack',
      'projects.type.webapp': 'Web App',
      'projects.stack.api': 'REST API',
      'projects.stack.crud': 'Structured CRUD',
      'projects.problem': 'Problem',
      'projects.role': 'My role',
      'projects.decision': 'Key decision',
      'projects.number1': 'Project #1',
      'projects.number2': 'Project #2',
      'projects.number3': 'Project #3',
      'projects.code': 'View code',
      'projects.demo': 'View demo',
    },
  };

  const updateI18n = (lang) => {
    const dict = translations[lang] || translations.es;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.innerHTML = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (dict[key]) {
        el.setAttribute('aria-label', dict[key]);
      }
    });
  };
  const applyLang = (lang) => {
    document.documentElement.setAttribute('lang', lang);
    const label = langToggle.querySelector('.lang-label');
    if (label) label.textContent = lang === 'en' ? 'EN' : 'ES';
    updateI18n(lang);
  };

  const savedLang = localStorage.getItem(LANG_KEY);
  if (savedLang === 'en' || savedLang === 'es') {
    applyLang(savedLang);
  } else {
    applyLang(document.documentElement.getAttribute('lang') || 'es');
  }

  langToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('lang') || 'es';
    const next = current === 'es' ? 'en' : 'es';
    applyLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch (e) {
      // no-op
    }
  });
})();
