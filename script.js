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
const justifiedGap = 12;
const panoramicRatioThreshold = 16 / 9;
const mobileGalleryQuery = window.matchMedia('(max-width: 720px)');

function isPanorama(project) {
  return project?.dataset.project.toLowerCase() === 'panorama';
}

function clearJustifiedLayout(gallery) {
  gallery.classList.remove('is-justified');
  gallery.querySelectorAll('.gallery-item').forEach((item) => {
    item.style.removeProperty('width');
    item.style.removeProperty('height');
  });
}

function applyJustifiedRow(row, galleryWidth, targetHeight, isLastRow) {
  const ratioTotal = row.reduce((total, entry) => total + entry.ratio, 0);
  const availableWidth = galleryWidth - justifiedGap * (row.length - 1);
  const justifiedHeight = availableWidth / ratioTotal;
  const isPanoramicRow = row.length === 1 && row[0].ratio > panoramicRatioThreshold;
  const shouldFillRow = isPanoramicRow
    || (row.length > 1 && (!isLastRow || justifiedHeight <= targetHeight * 1.2));
  const rowHeight = shouldFillRow ? justifiedHeight : Math.min(targetHeight, justifiedHeight);
  let usedWidth = 0;

  row.forEach((entry, index) => {
    const isLastItem = index === row.length - 1;
    const calculatedWidth = entry.ratio * rowHeight;
    const itemWidth = shouldFillRow && isLastItem
      ? availableWidth - usedWidth
      : calculatedWidth;

    entry.item.style.width = `${itemWidth}px`;
    entry.item.style.height = `${rowHeight}px`;
    usedWidth += itemWidth;
  });
}

function layoutJustifiedGallery(project) {
  const gallery = project?.querySelector('.gallery');
  if (!gallery || isPanorama(project) || project.classList.contains('is-hidden')) return;

  if (mobileGalleryQuery.matches) {
    clearJustifiedLayout(gallery);
    return;
  }

  const items = [...gallery.querySelectorAll('.gallery-item')];
  const entries = items.map((item) => {
    const image = item.querySelector('img');
    return {
      item,
      ratio: image?.naturalWidth && image?.naturalHeight
        ? image.naturalWidth / image.naturalHeight
        : 0,
    };
  });

  if (!entries.length || entries.some((entry) => !entry.ratio)) return;

  gallery.classList.add('is-justified');
  const galleryWidth = gallery.clientWidth;
  if (!galleryWidth) return;
  const targetHeight = Math.min(460, Math.max(280, galleryWidth * 0.38));
  const rows = [];
  let row = [];
  let ratioTotal = 0;

  entries.forEach((entry) => {
    if (entry.ratio > panoramicRatioThreshold) {
      if (row.length) rows.push(row);
      rows.push([entry]);
      row = [];
      ratioTotal = 0;
      return;
    }

    const candidateRatioTotal = ratioTotal + entry.ratio;
    const currentWidth = row.length
      ? ratioTotal * targetHeight + justifiedGap * (row.length - 1)
      : 0;
    const candidateWidth = candidateRatioTotal * targetHeight + justifiedGap * row.length;

    if (
      row.length
      && candidateWidth >= galleryWidth
      && Math.abs(galleryWidth - currentWidth) <= Math.abs(candidateWidth - galleryWidth)
    ) {
      rows.push(row);
      row = [entry];
      ratioTotal = entry.ratio;
    } else {
      row.push(entry);
      ratioTotal = candidateRatioTotal;
      if (candidateWidth >= galleryWidth) {
        rows.push(row);
        row = [];
        ratioTotal = 0;
      }
    }
  });

  if (row.length) rows.push(row);
  rows.forEach((entriesInRow, index) => {
    applyJustifiedRow(entriesInRow, galleryWidth, targetHeight, index === rows.length - 1);
  });
}

function prepareJustifiedGallery(project) {
  if (isPanorama(project)) return;
  const gallery = project.querySelector('.gallery');
  if (!gallery) return;

  gallery.querySelectorAll('img').forEach((image) => {
    if (!image.complete) image.addEventListener('load', () => layoutJustifiedGallery(project), { once: true });
  });
}

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
    const selected = projects.find((project) => project.dataset.project.toLowerCase() === requestedSlug.toLowerCase()) || projects[0];

    projects.forEach((project) => project.classList.toggle('is-hidden', project !== selected));
    projectLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.projectLink.toLowerCase() === selected?.dataset.project.toLowerCase()));
    document.title = selected ? `${selected.querySelector('h1').textContent} â Sangwoo Photography` : 'Sangwoo Photography';
    requestAnimationFrame(() => layoutJustifiedGallery(selected));
  } else {
    document.title = 'About â Sangwoo Photography';
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
window.addEventListener('resize', () => {
  const visibleProject = projects.find((project) => !project.classList.contains('is-hidden'));
  requestAnimationFrame(() => layoutJustifiedGallery(visibleProject));
});
projects.forEach(prepareJustifiedGallery);
showRoute();
