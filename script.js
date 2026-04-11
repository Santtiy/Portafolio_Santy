const menuLinks = document.querySelectorAll('.menu a');

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
  });
});

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

const dot = document.querySelector('.scroll-dot');

if (dot) {
  dot.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
