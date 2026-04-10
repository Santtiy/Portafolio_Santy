const menuLinks = document.querySelectorAll('.menu a');

menuLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    menuLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

const dot = document.querySelector('.scroll-dot');

if (dot) {
  dot.addEventListener('click', () => {
    window.scrollTo({ top: window.innerHeight * 0.65, behavior: 'smooth' });
  });
}
