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

if (scrollAnimatedSections.length > 0) {
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
}

const dot = document.querySelector('.scroll-dot');

if (dot) {
  dot.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
