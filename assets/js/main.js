// Mobilní navigace
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav ul');

// Centrální telefonní kontakt MAXGYM
const phoneLabel = '+421 948 681 068';
const phoneHref = 'tel:+421948681068';

const createPhoneLink = () => {
  const link = document.createElement('a');
  link.href = phoneHref;
  link.textContent = phoneLabel;
  return link;
};

document.querySelectorAll('.contact').forEach((contact) => {
  if (contact.querySelector(`a[href="${phoneHref}"]`)) return;

  const emailRow = contact.querySelector('a[href^="mailto:"]')?.closest('p');
  if (!emailRow) return;

  const phoneRow = document.createElement('p');
  phoneRow.style.marginTop = '10px';
  phoneRow.append(createPhoneLink());
  emailRow.insertAdjacentElement('afterend', phoneRow);
});

document.querySelectorAll('.legal-contact').forEach((contact) => {
  if (!contact.querySelector(`a[href="${phoneHref}"]`)) {
    contact.append(createPhoneLink());
  }
});

document.querySelectorAll('address').forEach((address) => {
  if (address.querySelector(`a[href="${phoneHref}"]`)) return;

  address.append(document.createElement('br'));
  address.append(document.createTextNode('Telefón: '));
  address.append(createPhoneLink());
});

document.querySelectorAll('p').forEach((paragraph) => {
  if (paragraph.textContent.includes('Núdzové telefónne číslo doplníme pred otvorením.')) {
    paragraph.innerHTML = '<strong>Riešenie problémov:</strong> Ak narazíš na problém so zámkom alebo vybavením, napíš nám na <a href="mailto:maxgym@maxgym.sk">maxgym@maxgym.sk</a> alebo zavolaj na <a href="tel:+421948681068">+421 948 681 068</a>.';
  }
});

if (document.documentElement.lang === 'en' && window.location.pathname.includes('/en/uzitocne-info/')) {
  const trainingBlock = [...document.querySelectorAll('.info-block')]
    .find((block) => block.querySelector('h2')?.textContent.trim() === 'TRAINING');

  if (trainingBlock && !trainingBlock.querySelector(`a[href="${phoneHref}"]`)) {
    const paragraph = document.createElement('p');
    paragraph.innerHTML = '<strong>Troubleshooting:</strong> If you have a problem with the lock or equipment, email us at <a href="mailto:maxgym@maxgym.sk">maxgym@maxgym.sk</a> or call <a href="tel:+421948681068">+421 948 681 068</a>.';
    trainingBlock.append(paragraph);
  }
}

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
