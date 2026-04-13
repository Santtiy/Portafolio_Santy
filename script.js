const menuLinks = document.querySelectorAll('.menu a');
const menuToggle = document.querySelector('.menu-toggle');
const isMobileViewport = window.matchMedia('(max-width: 860px)').matches;

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
  if (isMobileViewport) {
    topbar.classList.remove('is-scrolled');
  } else {
    const updateTopbar = () => {
      topbar.classList.toggle('is-scrolled', window.scrollY > 6);
    };

    updateTopbar();
    window.addEventListener('scroll', updateTopbar, { passive: true });
  }
}

// Pre-carga imagenes lazy antes de entrar al viewport para evitar retraso visual al hacer scroll.
const lazyImages = Array.from(document.querySelectorAll('img[loading="lazy"]'));

if (lazyImages.length > 0) {
  const networkInfo = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveDataEnabled = Boolean(networkInfo && networkInfo.saveData);
  const effectiveType = (networkInfo && networkInfo.effectiveType) || '';
  const slowNetwork = /2g|3g/i.test(effectiveType);
  const lowPowerDevice =
    (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);

  const preloadBySectionFactor = {
    top: 0.9,
    'sobre-mi': 1.05,
    proyectos: 1.25,
    proceso: 1.2,
    testimonios: 1.15,
    contacto: 1.15,
  };

  const getImageSectionId = (img) => {
    const section = img.closest('section.container[id], main.container.hero-grid, footer.container.site-footer');
    if (!section) return 'default';
    if (section.id) return section.id;
    if (section.matches('main.container.hero-grid')) return 'top';
    if (section.matches('footer.container.site-footer')) return 'contacto';
    return 'default';
  };

  const getPreloadDistance = (sectionId) => {
    const viewportHeight = window.innerHeight || 800;
    const baseDistance = isMobileViewport
      ? Math.round(viewportHeight * (saveDataEnabled || slowNetwork ? 1.9 : 1.45))
      : Math.round(viewportHeight * 0.85);

    const sectionFactor = preloadBySectionFactor[sectionId] || 1;
    const deviceFactor = lowPowerDevice ? 1.22 : 1;
    return Math.round(baseDistance * sectionFactor * deviceFactor);
  };

  if ('IntersectionObserver' in window) {
    const observerByMargin = new Map();

    const handleImageWarmup = (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        img.loading = 'eager';
        img.decoding = 'async';
        observer.unobserve(img);
      });
    };

    const getObserverForMargin = (marginPx) => {
      if (!observerByMargin.has(marginPx)) {
        observerByMargin.set(
          marginPx,
          new IntersectionObserver(handleImageWarmup, {
            rootMargin: `${marginPx}px 0px`,
            threshold: 0.01,
          })
        );
      }

      return observerByMargin.get(marginPx);
    };

    lazyImages.forEach((img) => {
      const sectionId = getImageSectionId(img);
      const preloadDistance = getPreloadDistance(sectionId);
      const observer = getObserverForMargin(preloadDistance);
      observer.observe(img);
    });
  } else {
    lazyImages.forEach((img) => {
      img.decoding = 'async';
      if (isMobileViewport) {
        img.loading = 'eager';
      }
    });
  }
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
  const hobbiesByLang = {
    es: [
      {
        icon: 'fa-solid fa-music',
        title: 'M&uacute;sica',
        description: 'Me gusta mucho escuchar m&uacute;sica en mis tiempos libres.',
      },
      {
        icon: 'fa-solid fa-shoe-prints',
        title: 'Caminar',
        description: 'Me gusta salir a caminar a veces para despejar mi cabeza.',
      },
      {
        icon: 'fa-solid fa-gamepad',
        title: 'Videojuegos',
        description: 'Estoy muy interesado en los videojuegos y mundos interactivos.',
      },
      {
        icon: 'fa-solid fa-dumbbell',
        title: 'Gym',
        description: 'Me gusta hacer ejercicio de vez en cuando para mantenerme activo.',
      },
      {
        icon: 'fa-solid fa-bicycle',
        title: 'Bicicleta',
        description: 'Me gusta salir a dar paseos en bicicleta.',
      },
      {
        icon: 'fa-solid fa-basketball',
        title: 'B&aacute;squet',
        description: 'Me gusta jugar basketball en mis tiempos libres.',
      },
      {
        icon: 'fa-solid fa-film',
        title: 'Pel&iacute;culas y Anime',
        description: 'Me gusta mucho ver todo tipo de pel&iacute;culas y animaci&oacute;n japonesa.',
      },
    ],
    en: [
      {
        icon: 'fa-solid fa-music',
        title: 'Music',
        description: 'I really enjoy listening to music in my free time.',
      },
      {
        icon: 'fa-solid fa-shoe-prints',
        title: 'Walking',
        description: 'I like going for walks to clear my mind.',
      },
      {
        icon: 'fa-solid fa-gamepad',
        title: 'Video Games',
        description: 'I am very interested in video games and interactive worlds.',
      },
      {
        icon: 'fa-solid fa-dumbbell',
        title: 'Gym',
        description: 'I like exercising from time to time to stay active.',
      },
      {
        icon: 'fa-solid fa-bicycle',
        title: 'Cycling',
        description: 'I enjoy going on bike rides.',
      },
      {
        icon: 'fa-solid fa-basketball',
        title: 'Basketball',
        description: 'I like playing basketball in my free time.',
      },
      {
        icon: 'fa-solid fa-film',
        title: 'Movies and Anime',
        description: 'I really enjoy watching all kinds of movies and Japanese animation.',
      },
    ],
  };

  const HobbiesSection = (lang = 'es') => {
    const hobbiesGrid = document.getElementById('hobbies-grid');
    if (!hobbiesGrid) return;

    const hobbies = hobbiesByLang[lang] || hobbiesByLang.es;
    hobbiesGrid.innerHTML = hobbies
      .map(
        (hobby) => `
          <article class="hobby-card card">
            <span class="hobby-icon" aria-hidden="true">
              <i class="${hobby.icon}"></i>
            </span>
            <h4>${hobby.title}</h4>
            <p>${hobby.description}</p>
          </article>
        `
      )
      .join('');
  };

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
      'hobbies.title': 'Hobbies e Intereses',
      'hobbies.subtitle': 'M&aacute;s all&aacute; del c&oacute;digo: mis pasiones y &aacute;reas de inter&eacute;s',
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
      'process.section': '04 - MI PROCESO',
      'process.title': 'Metodologia de Desarrollo',
      'process.stepsLabel': 'Pasos del proceso de trabajo',
      'process.step1.title': 'Analisis de Requisitos',
      'process.step1.body': 'Identificacion de necesidades, definicion de funcionalidades y alcance del proyecto.',
      'process.step2.title': 'Arquitectura del Sistema',
      'process.step2.body': 'Diseno de estructura frontend-backend, definicion de APIs y flujo de datos.',
      'process.step3.title': 'Desarrollo Frontend',
      'process.step3.body': 'Implementacion de interfaces interactivas y experiencia de usuario.',
      'process.step4.title': 'Integracion Backend',
      'process.step4.body': 'Conexion con APIs REST, gestion de datos y logica de negocio.',
      'process.step5.title': 'Validacion',
      'process.step5.body': 'Pruebas de funcionalidad, validacion de inputs y correccion de errores.',
      'process.principles.title': 'Principios',
      'process.principles.item1': 'Modularidad',
      'process.principles.item2': 'Escalabilidad',
      'process.principles.item3': 'Usabilidad',
      'process.principles.item4': 'Mantenibilidad',
      'testimonials.section': '05 - TESTIMONIOS',
      'testimonials.stars': 'Cinco estrellas',
      'testimonials.quote1': 'Trabajar con este desarrollador fue una experiencia excepcional. Entrego el proyecto antes del plazo y supero todas nuestras expectativas. Su atencion al detalle y comunicacion fueron impecables.',
      'testimonials.role1': 'CEO, TechStartup',
      'testimonials.quote2': 'Un profesional altamente competente que entiende tanto los aspectos tecnicos como las necesidades del negocio. Su codigo es limpio, bien documentado y facil de mantener.',
      'testimonials.role2': 'CTO, Digital Solutions',
      'testimonials.quote3': 'Increible capacidad para resolver problemas complejos con soluciones elegantes. Siempre dispuesto a ir mas alla para asegurar que el producto final sea de la mas alta calidad.',
      'testimonials.role3': 'Product Manager, InnovateTech',
      'testimonials.quote4': 'Su experiencia en React y Next.js nos ayudo a modernizar completamente nuestra plataforma. El resultado fue un aumento del 50% en la satisfaccion del usuario.',
      'testimonials.role4': 'Director de Desarrollo, CloudApp',
      'contact.section': '06 - CONTACTO',
      'contact.title': 'Enviame un mensaje',
      'contact.fullname': 'Nombre completo',
      'contact.email': 'Email',
      'contact.subject': 'Asunto',
      'contact.message': 'Mensaje',
      'contact.send': 'Enviar mensaje',
      'contact.info': 'Informacion',
      'contact.institutional': 'Correo institucional',
      'contact.github': 'GitHub',
      'contact.linkedin': 'LinkedIn',
      'contact.location': 'Ubicacion',
      'contact.locationValue': 'Colombia',
      'contact.cv': 'Curriculum Vitae',
      'contact.download': 'Descargar CV',
      'contact.status': 'Estado actual',
      'contact.statusBody': 'Abierto a oportunidades de colaboracion y proyectos freelance.',
      'footer.title': 'Pie del sitio',
      'footer.name': 'Santiago Bustos Lopez',
      'footer.summary': 'Desarrollador Full-Stack enfocado en arquitectura limpia, integracion de sistemas y experiencias web modernas.',
      'footer.social': 'Redes sociales',
      'footer.github': 'GitHub',
      'footer.email': 'Correo',
      'footer.nav': 'Navegacion del sitio',
      'footer.navTitle': 'Navegacion',
      'footer.home': 'Inicio',
      'footer.about': 'Sobre mi',
      'footer.projects': 'Proyectos',
      'footer.experience': 'Experiencia',
      'footer.contact': 'Enlaces de contacto',
      'footer.contactTitle': 'Contacto',
      'footer.testimonials': 'Testimonios',
      'footer.contactLink': 'Contacto',
      'footer.cv': 'CV',
      'footer.copy': 'Copyright <time datetime="2026">2026</time> Santiago Bustos Lopez. Hecho con dedicacion usando HTML, CSS y JavaScript.',
      'footer.backTop': 'Volver arriba',
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
      'hobbies.title': 'Hobbies and Interests',
      'hobbies.subtitle': 'Beyond code: my passions and areas of interest',
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
      'process.section': '04 - MY PROCESS',
      'process.title': 'Development Methodology',
      'process.stepsLabel': 'Workflow steps',
      'process.step1.title': 'Requirements Analysis',
      'process.step1.body': 'Identify needs, define features, and scope the project.',
      'process.step2.title': 'System Architecture',
      'process.step2.body': 'Design frontend-backend structure, define APIs, and data flow.',
      'process.step3.title': 'Frontend Development',
      'process.step3.body': 'Build interactive interfaces and user experience.',
      'process.step4.title': 'Backend Integration',
      'process.step4.body': 'Connect REST APIs, manage data, and business logic.',
      'process.step5.title': 'Validation',
      'process.step5.body': 'Functional testing, input validation, and bug fixes.',
      'process.principles.title': 'Principles',
      'process.principles.item1': 'Modularity',
      'process.principles.item2': 'Scalability',
      'process.principles.item3': 'Usability',
      'process.principles.item4': 'Maintainability',
      'testimonials.section': '05 - TESTIMONIALS',
      'testimonials.stars': 'Five stars',
      'testimonials.quote1': 'Working with this developer was exceptional. They delivered ahead of schedule and exceeded expectations. Attention to detail and communication were flawless.',
      'testimonials.role1': 'CEO, TechStartup',
      'testimonials.quote2': 'A highly competent professional who understands both technical aspects and business needs. Their code is clean, well-documented, and easy to maintain.',
      'testimonials.role2': 'CTO, Digital Solutions',
      'testimonials.quote3': 'Incredible ability to solve complex problems with elegant solutions. Always willing to go further to ensure a top-quality final product.',
      'testimonials.role3': 'Product Manager, InnovateTech',
      'testimonials.quote4': 'Their React and Next.js expertise helped modernize our platform. The result was a 50% increase in user satisfaction.',
      'testimonials.role4': 'Director of Development, CloudApp',
      'contact.section': '06 - CONTACT',
      'contact.title': 'Send me a message',
      'contact.fullname': 'Full name',
      'contact.email': 'Email',
      'contact.subject': 'Subject',
      'contact.message': 'Message',
      'contact.send': 'Send message',
      'contact.info': 'Information',
      'contact.institutional': 'Institutional email',
      'contact.github': 'GitHub',
      'contact.linkedin': 'LinkedIn',
      'contact.location': 'Location',
      'contact.locationValue': 'Colombia',
      'contact.cv': 'Resume',
      'contact.download': 'Download CV',
      'contact.status': 'Current status',
      'contact.statusBody': 'Open to collaboration opportunities and freelance projects.',
      'footer.title': 'Site footer',
      'footer.name': 'Santiago Bustos Lopez',
      'footer.summary': 'Full-Stack developer focused on clean architecture, systems integration, and modern web experiences.',
      'footer.social': 'Social links',
      'footer.github': 'GitHub',
      'footer.email': 'Email',
      'footer.nav': 'Site navigation',
      'footer.navTitle': 'Navigation',
      'footer.home': 'Home',
      'footer.about': 'About',
      'footer.projects': 'Projects',
      'footer.experience': 'Experience',
      'footer.contact': 'Contact links',
      'footer.contactTitle': 'Contact',
      'footer.testimonials': 'Testimonials',
      'footer.contactLink': 'Contact',
      'footer.cv': 'CV',
      'footer.copy': 'Copyright <time datetime="2026">2026</time> Santiago Bustos Lopez. Made with dedication using HTML, CSS, and JavaScript.',
      'footer.backTop': 'Back to top',
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
    HobbiesSection(lang);
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
