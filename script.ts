// Fuente principal en TypeScript. Este archivo se compila a script.js para el navegador.
type NetworkInfo = {
  saveData?: boolean;
  effectiveType?: string;
};

type NavigatorWithNetworkInfo = Navigator & {
  connection?: NetworkInfo;
  mozConnection?: NetworkInfo;
  webkitConnection?: NetworkInfo;
  deviceMemory?: number;
};

type ReactRootLike = {
  render: (...args: unknown[]) => void;
};

type HobbiesGridWithRoot = HTMLElement & {
  __hobbiesReactRoot?: ReactRootLike;
};

type WindowWithReact = Window & typeof globalThis & {
  React?: {
    createElement: (...args: unknown[]) => unknown;
    Fragment: unknown;
  };
  ReactDOM?: {
    createRoot?: (container: Element | DocumentFragment) => ReactRootLike;
    render?: (...args: unknown[]) => unknown;
    default?: {
      createRoot?: (container: Element | DocumentFragment) => ReactRootLike;
    };
  };
};

type Theme = 'dark' | 'light';
type Lang = 'es' | 'en';
type ContactFeedbackType = '' | 'is-success' | 'is-error';

type FormSubmitErrorItem = {
  message: string;
};

type FormSubmitPayload = {
  errors?: FormSubmitErrorItem[];
  message?: string;
};

type HobbyItem = {
  icon: string;
  iconClass: string;
  title: string;
  description: string;
  extra?: string;
  cardClass?: string;
};

const rootElement = document.documentElement;

const getStoredValue = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStoredValue = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // no-op
  }
};

const getCurrentLang = (): Lang => (rootElement.getAttribute('lang') === 'en' ? 'en' : 'es');
const getCurrentTheme = (): Theme =>
  rootElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

const menuLinks = document.querySelectorAll<HTMLAnchorElement>('.menu a');
const menuToggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const isMobileViewport = window.matchMedia('(max-width: 860px)').matches;

const setActiveMenuLink = (targetId: string): void => {
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
  .map((link) => {
    const href = link.getAttribute('href');
    return href ? document.querySelector<HTMLElement>(href) : null;
  })
  .filter((section): section is HTMLElement => section instanceof HTMLElement);

if (observedSections.length > 0) {
  const getActiveSectionId = (): string | null => {
    const markerY = Math.max(96, window.innerHeight * 0.32);
    let bestSection: HTMLElement | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const section of observedSections) {
      const rect = section.getBoundingClientRect();
      const containsMarker = rect.top <= markerY && rect.bottom >= markerY;
      if (!containsMarker) continue;

      const distance = Math.abs(rect.top - markerY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSection = section;
      }
    }

    if (bestSection) return bestSection.id;

    for (const section of observedSections) {
      const distance = Math.abs(section.getBoundingClientRect().top - markerY);
      if (distance < bestDistance) {
        bestDistance = distance;
        bestSection = section;
      }
    }

    return bestSection ? bestSection.id : null;
  };

  let isTicking = false;
  const syncActiveSection = (): void => {
    if (isTicking) return;
    isTicking = true;

    window.requestAnimationFrame(() => {
      const activeSectionId = getActiveSectionId();
      if (activeSectionId) {
        setActiveMenuLink(activeSectionId);
      }
      isTicking = false;
    });
  };

  window.addEventListener('scroll', syncActiveSection, { passive: true });
  window.addEventListener('resize', syncActiveSection);
  syncActiveSection();
}

const projectCards = Array.from(document.querySelectorAll<HTMLElement>('.project-card'));

if (projectCards.length > 0) {
  const syncProjectState = (card: HTMLElement, expanded: boolean): void => {
    card.classList.toggle('is-expanded', expanded);
    const trigger = card.querySelector('.project-main-toggle');
    if (trigger instanceof HTMLElement) {
      trigger.setAttribute('aria-expanded', String(expanded));
    }
  };

  projectCards.forEach((card) => {
    const trigger = card.querySelector('.project-main-toggle');
    if (!(trigger instanceof HTMLElement)) return;

    syncProjectState(card, false);

    const toggleCard = () => {
      const willExpand = !card.classList.contains('is-expanded');

      // Comportamiento tipo acordeon: abre uno y cierra los demas.
      projectCards.forEach((item) => {
        if (item !== card) {
          syncProjectState(item, false);
        }
      });

      syncProjectState(card, willExpand);
    };

    trigger.addEventListener('click', toggleCard);
    trigger.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleCard();
    });
  });
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

// Contact form: envio real con FormSubmit (sin backend propio), validacion basica y feedback al usuario.
const contactForm = document.querySelector('.contact-form');

if (contactForm instanceof HTMLFormElement) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const feedback = contactForm.querySelector('.contact-form-feedback');

  const setFeedback = (type: ContactFeedbackType, message: string): void => {
    if (!(feedback instanceof HTMLElement)) return;
    feedback.textContent = message;
    feedback.classList.remove('is-success', 'is-error');
    if (type) {
      feedback.classList.add(type);
    }
  };

  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const isEnglish = getCurrentLang() === 'en';
    const messages = isEnglish
      ? {
          invalid: 'Please complete all fields correctly.',
          sending: 'Sending message...',
          success: 'Message sent successfully. Thank you!',
          error: 'We could not send your message. Please try again.',
        }
      : {
          invalid: 'Completa correctamente todos los campos.',
          sending: 'Enviando mensaje...',
          success: 'Mensaje enviado correctamente. Gracias!',
          error: 'No pudimos enviar tu mensaje. Intentalo de nuevo.',
        };

    const formData = new FormData(contactForm);
    const honey = String(formData.get('_honey') || '').trim();
    if (honey) {
      // Honeypot para bots: simulamos envio exitoso y no hacemos request.
      contactForm.reset();
      setFeedback('is-success', messages.success);
      return;
    }

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      setFeedback('is-error', messages.invalid);
      return;
    }

    const endpoint = contactForm.getAttribute('action') || '';
    if (!endpoint) {
      setFeedback('is-error', messages.error);
      return;
    }

    const previousLabel =
      submitButton instanceof HTMLButtonElement ? submitButton.textContent : '';

    if (submitButton instanceof HTMLButtonElement) {
      submitButton.disabled = true;
      submitButton.textContent = messages.sending;
    }

    setFeedback('', messages.sending);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const payload: FormSubmitPayload | null = await response.json().catch(() => null);

      if (response.ok) {
        contactForm.reset();
        setFeedback('is-success', messages.success);
      } else {
        const apiError =
          payload && Array.isArray(payload.errors) && payload.errors.length > 0
            ? payload.errors.map((item: FormSubmitErrorItem) => item.message).join(' ')
            : payload && payload.message
            ? payload.message
            : messages.error;
        setFeedback('is-error', apiError);
      }
    } catch {
      setFeedback('is-error', messages.error);
    } finally {
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
        submitButton.textContent = previousLabel || (isEnglish ? 'Send message' : 'Enviar mensaje');
      }
    }
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
const lazyImages = Array.from(document.querySelectorAll<HTMLImageElement>('img[loading="lazy"]'));

if (lazyImages.length > 0) {
  const nav = navigator as NavigatorWithNetworkInfo;
  const networkInfo = nav.connection || nav.mozConnection || nav.webkitConnection;
  const saveDataEnabled = Boolean(networkInfo && networkInfo.saveData);
  const effectiveType = (networkInfo && networkInfo.effectiveType) || '';
  const slowNetwork = /2g|3g/i.test(effectiveType);
  const lowPowerDevice =
    (typeof nav.deviceMemory === 'number' && nav.deviceMemory <= 4) ||
    (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4);

  const preloadBySectionFactor = {
    top: 0.9,
    'sobre-mi': 1.05,
    proyectos: 1.25,
    proceso: 1.2,
    testimonios: 1.15,
    contacto: 1.15,
  } as const;

  type SectionId = keyof typeof preloadBySectionFactor | 'default';

  const getImageSectionId = (img: HTMLImageElement): SectionId => {
    const section = img.closest('section.container[id], main.container.hero-grid, footer.container.site-footer');
    if (!section) return 'default';
    if (section.id && section.id in preloadBySectionFactor) {
      return section.id as keyof typeof preloadBySectionFactor;
    }
    if (section.matches('main.container.hero-grid')) return 'top';
    if (section.matches('footer.container.site-footer')) return 'contacto';
    return 'default';
  };

  const getPreloadDistance = (sectionId: SectionId): number => {
    const viewportHeight = window.innerHeight || 800;
    const baseDistance = isMobileViewport
      ? Math.round(viewportHeight * (saveDataEnabled || slowNetwork ? 1.9 : 1.45))
      : Math.round(viewportHeight * 0.85);

    const sectionFactor = sectionId === 'default' ? 1 : preloadBySectionFactor[sectionId];
    const deviceFactor = lowPowerDevice ? 1.22 : 1;
    return Math.round(baseDistance * sectionFactor * deviceFactor);
  };

  if ('IntersectionObserver' in window) {
    const observerByMargin = new Map<number, IntersectionObserver>();

    const handleImageWarmup = (entries: IntersectionObserverEntry[], observer: IntersectionObserver): void => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        if (!(img instanceof HTMLImageElement)) return;
        img.loading = 'eager';
        img.decoding = 'async';
        observer.unobserve(img);
      });
    };

    const getObserverForMargin = (marginPx: number): IntersectionObserver => {
      if (!observerByMargin.has(marginPx)) {
        observerByMargin.set(
          marginPx,
          new IntersectionObserver(handleImageWarmup, {
            rootMargin: `${marginPx}px 0px`,
            threshold: 0.01,
          })
        );
      }

      return observerByMargin.get(marginPx) as IntersectionObserver;
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

  const applyTheme = (theme: Theme): void => {
    rootElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    // Actualiza icono
    toggle.innerHTML = isDark
      ? '<i class="fa-solid fa-moon" aria-hidden="true"></i>'
      : '<i class="fa-solid fa-sun" aria-hidden="true"></i>';
  };

  const initialTheme = rootElement.getAttribute('data-theme');
  if (initialTheme === 'light' || initialTheme === 'dark') {
    applyTheme(initialTheme);
  } else {
    const saved = getStoredValue(THEME_KEY);
    applyTheme(saved === 'light' || saved === 'dark' ? saved : 'dark');
  }

  toggle.addEventListener('click', () => {
    const currentTheme = getCurrentTheme();
    const next: Theme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredValue(THEME_KEY, next);
  });
})();

// Language toggle: alterna entre 'es' y 'en' (solo atributo lang y etiqueta)
(function () {
  const langToggle = document.getElementById('lang-toggle');
  if (!langToggle) return;

  const LANG_KEY = 'site-lang';
  const hobbiesByLang: Record<Lang, HobbyItem[]> = {
    es: [
      {
        icon: 'fa-solid fa-music',
        iconClass: 'hobby-icon--music',
        title: 'M&uacute;sica',
        description: 'Me gusta mucho escuchar m&uacute;sica en mis tiempos libres.',
        extra: 'Lo-fi • Rock • Instrumental',
      },
      {
        icon: 'fa-solid fa-shoe-prints',
        iconClass: 'hobby-icon--walk',
        title: 'Caminar',
        description: 'Me gusta salir a caminar a veces para despejar mi cabeza.',
        extra: 'Ideal para despejar la mente',
      },
      {
        icon: 'fa-solid fa-gamepad',
        iconClass: 'hobby-icon--games',
        cardClass: 'hobby-card--glow',
        title: 'Videojuegos',
        description: 'Estoy muy interesado en los videojuegos y mundos interactivos.',
        extra: 'RPG • Exploracion • Souls-like',
      },
      {
        icon: 'fa-solid fa-dumbbell',
        iconClass: 'hobby-icon--gym',
        title: 'Gym',
        description: 'Me gusta hacer ejercicio de vez en cuando para mantenerme activo.',
        extra: 'Entrenamiento ocasional',
      },
      {
        icon: 'fa-solid fa-bicycle',
        iconClass: 'hobby-icon--bike',
        title: 'Bicicleta',
        description: 'Me gusta salir a dar paseos en bicicleta.',
        extra: 'Paseos y exploracion',
      },
      {
        icon: 'fa-solid fa-basketball',
        iconClass: 'hobby-icon--basket',
        title: 'B&aacute;squet',
        description: 'Me gusta jugar basketball en mis tiempos libres.',
        extra: 'Deporte recreativo',
      },
      {
        icon: 'fa-solid fa-film',
        iconClass: 'hobby-icon--cinema',
        title: 'Pel&iacute;culas y Anime',
        description: 'Me gusta mucho ver todo tipo de pel&iacute;culas y animaci&oacute;n japonesa.',
        extra: 'Cine • Anime • Sci-fi',
      },
      {
        icon: 'fa-solid fa-camera-retro',
        iconClass: 'hobby-icon--photo',
        title: 'Fotograf&iacute;a',
        description: 'Me encanta tomar fotograf&iacute;as de atardeceres.',
        extra: 'Atardeceres • Luz natural • Paisajes',
      },
    ],
    en: [
      {
        icon: 'fa-solid fa-music',
        iconClass: 'hobby-icon--music',
        title: 'Music',
        description: 'I really enjoy listening to music in my free time.',
        extra: 'Lo-fi • Rock • Instrumental',
      },
      {
        icon: 'fa-solid fa-shoe-prints',
        iconClass: 'hobby-icon--walk',
        title: 'Walking',
        description: 'I like going for walks to clear my mind.',
        extra: 'Ideal to clear the mind',
      },
      {
        icon: 'fa-solid fa-gamepad',
        iconClass: 'hobby-icon--games',
        cardClass: 'hobby-card--glow',
        title: 'Video Games',
        description: 'I am very interested in video games and interactive worlds.',
        extra: 'RPG • Exploration • Souls-like',
      },
      {
        icon: 'fa-solid fa-dumbbell',
        iconClass: 'hobby-icon--gym',
        title: 'Gym',
        description: 'I like exercising from time to time to stay active.',
        extra: 'Occasional training',
      },
      {
        icon: 'fa-solid fa-bicycle',
        iconClass: 'hobby-icon--bike',
        title: 'Cycling',
        description: 'I enjoy going on bike rides.',
        extra: 'Rides and exploration',
      },
      {
        icon: 'fa-solid fa-basketball',
        iconClass: 'hobby-icon--basket',
        title: 'Basketball',
        description: 'I like playing basketball in my free time.',
        extra: 'Recreational sport',
      },
      {
        icon: 'fa-solid fa-film',
        iconClass: 'hobby-icon--cinema',
        title: 'Movies and Anime',
        description: 'I really enjoy watching all kinds of movies and Japanese animation.',
        extra: 'Cinema • Anime • Sci-fi',
      },
      {
        icon: 'fa-solid fa-camera-retro',
        iconClass: 'hobby-icon--photo',
        title: 'Photography',
        description: 'I love taking sunset photographs.',
        extra: 'Sunsets • Natural light • Landscapes',
      },
    ],
  };

  const renderHobbiesWithTemplate = (hobbiesGrid: HobbiesGridWithRoot, hobbies: HobbyItem[]): void => {
    hobbiesGrid.innerHTML = hobbies
      .map(
        (hobby: HobbyItem) => `
          <article class="hobby-card card ${hobby.cardClass || ''}">
            <span class="hobby-icon ${hobby.iconClass || ''}" aria-hidden="true">
              <i class="${hobby.icon}"></i>
            </span>
            <h4>${hobby.title}</h4>
            <p class="hobby-main">${hobby.description}</p>
            <p class="hobby-extra">${hobby.extra || ''}</p>
          </article>
        `
      )
      .join('');
  };

  const renderHobbiesWithReact = (hobbiesGrid: HobbiesGridWithRoot, hobbies: HobbyItem[]): boolean => {
    const typedWindow = window as WindowWithReact;
    const ReactRef = typedWindow.React;
    const ReactDOMRef = typedWindow.ReactDOM;
    if (!ReactRef || !ReactDOMRef) return false;

    const h = ReactRef.createElement;
    const html = (value: string | undefined) => ({ __html: value || '' });

    const cards = hobbies.map((hobby: HobbyItem, index: number) =>
      h(
        'article',
        {
          className: `hobby-card card ${hobby.cardClass || ''}`,
          key: `${hobby.title}-${index}`,
        },
        h(
          'span',
          {
            className: `hobby-icon ${hobby.iconClass || ''}`,
            'aria-hidden': 'true',
          },
          h('i', { className: hobby.icon })
        ),
        h('h4', { dangerouslySetInnerHTML: html(hobby.title) }),
        h('p', {
          className: 'hobby-main',
          dangerouslySetInnerHTML: html(hobby.description),
        }),
        h('p', {
          className: 'hobby-extra',
          dangerouslySetInnerHTML: html(hobby.extra),
        })
      )
    );

    const createRoot =
      ReactDOMRef.createRoot || (ReactDOMRef.default && ReactDOMRef.default.createRoot);

    if (typeof createRoot === 'function') {
      if (!hobbiesGrid.__hobbiesReactRoot) {
        hobbiesGrid.__hobbiesReactRoot = createRoot(hobbiesGrid);
      }

      hobbiesGrid.__hobbiesReactRoot.render(h(ReactRef.Fragment, null, ...cards));
      return true;
    }

    if (typeof ReactDOMRef.render === 'function') {
      ReactDOMRef.render(h(ReactRef.Fragment, null, ...cards), hobbiesGrid);
      return true;
    }

    return false;
  };

  const HobbiesSection = (lang: Lang = 'es'): void => {
    const hobbiesGrid = document.getElementById('hobbies-grid') as HobbiesGridWithRoot | null;
    if (!hobbiesGrid) return;

    const hobbies = hobbiesByLang[lang];
    const didRenderWithReact = renderHobbiesWithReact(hobbiesGrid, hobbies);
    if (!didRenderWithReact) {
      renderHobbiesWithTemplate(hobbiesGrid, hobbies);
    }
  };

  const translations: Record<Lang, Record<string, string>> = {
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
      'hero.trait1.title': 'Especialidad',
      'hero.trait1.body': 'Backend con Python/Django y desarrollo interactivo en Unreal Engine',
      'hero.trait2.title': 'Enfoque',
      'hero.trait2.body': 'Aprendizaje practico y resolucion de problemas mediante proyectos reales',
      'hero.trait3.title': 'Intereses',
      'hero.trait3.body': 'Backend, desarrollo web, videojuegos, simulaciones y nuevas tecnologias',
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
      'projects.subtitle': '4 casos de estudio',
      'projects.type.fullstack': 'Full-Stack',
      'projects.type.webapp': 'Aplicacion Web',
      'projects.stack.api': 'API REST',
      'projects.stack.crud': 'CRUD Estructurado',
      'projects.toggleImage': 'Mostrar imagen del proyecto',
      'projects.problem': 'Problema',
      'projects.role': 'Mi rol',
      'projects.decision': 'Decision clave',
      'projects.number1': 'Proyecto #1',
      'projects.number2': 'Proyecto #2',
      'projects.number3': 'Proyecto #3',
      'projects.number4': 'Proyecto #4',
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
      'testimonials.quote1': 'Es una gran persona en formacion, con una personalidad excepcional. Se desempena de manera sobresaliente en cualquier tipo de trabajo y destaca por su capacidad para trabajar bajo presion. Ademas, respeta el presupuesto acordado sin generar sobrecostos, lo que demuestra compromiso, responsabilidad y enfoque en resultados. Sin duda, 100% recomendado para futuros proyectos.',
      'testimonials.role1': 'Ingeniero de software',
      'testimonials.quote2': 'Buena capacidad para resolver problemas bajo presion y de aprendizaje rapido, con ideas innovadoras y una actitud proactiva. Aporta soluciones practicas, se adapta con facilidad a nuevos retos y mantiene una comunicacion clara para avanzar en equipo.',
      'testimonials.role2': 'Ingeniero en sistemas',
      'testimonials.quote3': 'Trabajar con Santiago fue una experiencia muy positiva. Tiene una gran capacidad para organizar el proyecto, proponer soluciones claras y mantener una comunicacion constante durante todo el desarrollo. Cumple con los tiempos y cuida mucho la calidad final.',
      'testimonials.role3': 'Desarrollador full-stack',
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
      'footer.copy': 'Copyright <time datetime="2026">2026</time> Santiago Bustos Lopez.',
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
      'hero.trait1.title': 'Specialty',
      'hero.trait1.body': 'Backend with Python/Django and interactive development in Unreal Engine',
      'hero.trait2.title': 'Focus',
      'hero.trait2.body': 'Hands-on learning and problem solving through real-world projects',
      'hero.trait3.title': 'Interests',
      'hero.trait3.body': 'Backend, web development, video games, simulations, and emerging technologies',
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
      'projects.subtitle': '4 case studies',
      'projects.type.fullstack': 'Full-Stack',
      'projects.type.webapp': 'Web App',
      'projects.stack.api': 'REST API',
      'projects.stack.crud': 'Structured CRUD',
      'projects.toggleImage': 'Show project image',
      'projects.problem': 'Problem',
      'projects.role': 'My role',
      'projects.decision': 'Key decision',
      'projects.number1': 'Project #1',
      'projects.number2': 'Project #2',
      'projects.number3': 'Project #3',
      'projects.number4': 'Project #4',
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
      'testimonials.quote1': 'He is a great person in training with an exceptional personality. He performs outstandingly in all kinds of work and stands out for his ability to work under pressure. He also respects the agreed budget without generating extra costs, showing strong commitment, responsibility, and a clear results-oriented mindset. Without a doubt, 100% recommended for future projects.',
      'testimonials.role1': 'Software Engineer',
      'testimonials.quote2': 'Strong ability to solve problems under pressure and learn quickly, with innovative ideas and a proactive attitude. He contributes practical solutions, adapts easily to new challenges, and keeps clear communication to move teamwork forward effectively.',
      'testimonials.role2': 'Systems Engineer',
      'testimonials.quote3': 'Working with Santiago was a very positive experience. He has a great ability to organize projects, propose clear solutions, and keep communication constant throughout development. He meets deadlines and takes great care of final quality.',
      'testimonials.role3': 'Full-Stack Developer',
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
      'footer.copy': 'Copyright <time datetime="2026">2026</time> Santiago Bustos Lopez.',
      'footer.backTop': 'Back to top',
    },
  };

  const updateI18n = (lang: Lang): void => {
    const dict = translations[lang];
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key && dict[key]) {
        el.innerHTML = dict[key];
      }
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria');
      if (key && dict[key]) {
        el.setAttribute('aria-label', dict[key]);
      }
    });
  };
  const applyLang = (lang: Lang): void => {
    rootElement.setAttribute('lang', lang);
    const label = langToggle.querySelector('.lang-label');
    if (label) label.textContent = lang === 'en' ? 'EN' : 'ES';
    updateI18n(lang);
    HobbiesSection(lang);
  };

  const savedLang = getStoredValue(LANG_KEY);
  if (savedLang === 'en' || savedLang === 'es') {
    applyLang(savedLang);
  } else {
    applyLang(getCurrentLang());
  }

  langToggle.addEventListener('click', () => {
    const current = getCurrentLang();
    const next: Lang = current === 'es' ? 'en' : 'es';
    applyLang(next);
    setStoredValue(LANG_KEY, next);
  });
})();
