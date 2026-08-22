// Mobilní navigace
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav ul');
if (toggle && menu) {
  toggle.addEventListener('click', () => menu.classList.toggle('open'));
}

// Lightbox galerie
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lbImg = lightbox.querySelector('img');
  document.querySelectorAll('.gallery img').forEach((img) => {
    img.addEventListener('click', () => {
      lbImg.src = img.src;
      lightbox.classList.add('open');
    });
  });
  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));
}
