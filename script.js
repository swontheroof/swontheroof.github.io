const menuToggle = document.querySelector('.menu-toggle');
const siteNav = document.querySelector('.site-nav');
const worksView = document.querySelector('.works-view');
const aboutView = document.querySelector('.about-view');
const projects = [...document.querySelectorAll('[data-project]')];
const projectLinks = [...document.querySelectorAll('[data-project-link]')];
const navLinks = [...document.querySelectorAll('.nav-link:not(.external-link)')];
const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('.lightbox-caption');
let activeImages = [];
let activeImageIndex = 0;

function closeMenu() {
  menuToggle.setAttribute('aria-expanded', 'false');
  siteNav.classList.remove('is-open');
}

function showRoute() {
  const route = window.location.hash.slice(1) || 'works';
  const isAbout = route === 'about';

  worksView.classList.toggle('is-hidden', isAbout);
  aboutView.classList.toggle('is-hidden', !isAbout);
  navLinks.forEach((link) => {
    const target = link.getAttribute('href').slice(1);
    link.classList.toggle('is-active', isAbout ? target === 'about' : target === 'works');
  });

  if (!isAbout) {
    const requestedSlug = route.startsWith('works/') ? route.split('/')[1] : '';
    const selected = projects.find((project) => project.dataset.project === requestedSlug) || projects[0];

    projects.forEach((project) => project.classList.toggle('is-hidden', project !== selected));
    projectLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.projectLink === selected?.dataset.project));
    document.title = selected ? `${selected.querySelector('h1').textContent} — Sangwoo Photography` : 'Sangwoo Photography';
  } else {
    document.title = 'About — Sangwoo Photography';
  }

  closeMenu();
  window.scrollTo(0, 0);
}

function getVisibleImages() {
  const visibleProject = projects.find((project) => !project.classList.contains('is-hidden'));
  return visibleProject ? [...visibleProject.querySelectorAll('.gallery img')] : [];
}

function renderLightbox(index) {
  if (!activeImages.length) return;
  activeImageIndex = (index + activeImages.length) % activeImages.length;
  const image = activeImages[activeImageIndex];
  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;
  lightboxCaption.textContent = image.alt;
}

document.addEventListener('click', (event) => {
  const imageButton = event.target.closest('.image-button');
  if (!imageButton) return;

  activeImages = getVisibleImages();
  activeImageIndex = activeImages.indexOf(imageButton.querySelector('img'));
  renderLightbox(activeImageIndex);
  lightbox.showModal();
});

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  siteNav.classList.toggle('is-open', !isOpen);
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => renderLightbox(activeImageIndex - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => renderLightbox(activeImageIndex + 1));

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') renderLightbox(activeImageIndex - 1);
  if (event.key === 'ArrowRight') renderLightbox(activeImageIndex + 1);
});

window.addEventListener('hashchange', showRoute);
showRoute();
