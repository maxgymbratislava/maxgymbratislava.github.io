// Mobilní navigace
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav ul');
if (toggle && menu) {
  if (!menu.id) menu.id = 'site-menu';
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menu.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });
}

// Lightbox galerie
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  const closeButton = lightbox.querySelector('.lightbox-close');
  let previousFocus = null;

  const openLightbox = (img) => {
    previousFocus = img;
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    if (closeButton) closeButton.focus();
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    lbImg.removeAttribute('src');
    if (previousFocus) previousFocus.focus();
  };

  document.querySelectorAll('.gallery img').forEach((img) => {
    img.setAttribute('role', 'button');
    img.setAttribute('tabindex', '0');
    img.addEventListener('click', () => openLightbox(img));
    img.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openLightbox(img);
      }
    });
  });

  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  if (closeButton) closeButton.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
}
