(function () {
  const DATA_URL = '/images/gallery/gallery-data.json';
  const IMAGE_BASE = '/images/gallery/';
  const INITIAL_COUNT = 6;

  let images = [];
  let currentIndex = 0;
  let startX = null;

  function renderCard(image, index) {
    const button = document.createElement('button');
    button.className =
      'w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] overflow-hidden rounded-3xl shadow-lg transition-transform duration-300 hover:scale-105';
    button.onclick = () => openLightbox(index);

    const img = document.createElement('img');
    img.src = image.src;
    img.alt = image.caption;
    img.loading = 'lazy';
    img.className = 'w-full h-64 object-cover';

    button.appendChild(img);
    return button;
  }

  function renderGallery(showAll) {
    const grid = document.getElementById('galleryGrid');
    grid.innerHTML = '';
    const count = showAll ? images.length : Math.min(INITIAL_COUNT, images.length);
    for (let i = 0; i < count; i++) {
      grid.appendChild(renderCard(images[i], i));
    }
  }

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    document.getElementById('lightboxModal').classList.remove('hidden');
  }

  function closeLightbox() {
    document.getElementById('lightboxModal').classList.add('hidden');
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    updateLightbox(true);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateLightbox(true);
  }

  function updateLightbox(animate) {
    const imageEl = document.getElementById('lightboxImage');
    const image = images[currentIndex];

    const apply = () => {
      imageEl.src = image.src;
      imageEl.alt = image.caption;
      document.getElementById('lightboxCaption').innerText = image.caption;
      document.getElementById('imageCounter').innerText = `${currentIndex + 1} of ${images.length}`;
    };

    if (animate) {
      imageEl.classList.remove('opacity-100');
      imageEl.classList.add('opacity-0');
      setTimeout(() => {
        apply();
        imageEl.onload = () => {
          imageEl.classList.remove('opacity-0');
          imageEl.classList.add('opacity-100');
        };
      }, 150);
    } else {
      apply();
      imageEl.classList.add('opacity-100');
    }
  }

  // Exposed for the inline onclick handlers in the lightbox modal markup
  window.openLightbox = openLightbox;
  window.closeLightbox = closeLightbox;
  window.nextImage = nextImage;
  window.prevImage = prevImage;

  document.addEventListener('DOMContentLoaded', function () {
    fetch(DATA_URL)
      .then((res) => res.json())
      .then((data) => {
        images = data.map((item) => ({
          src: IMAGE_BASE + item.file,
          caption: item.description || ''
        }));

        renderGallery(false);

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (!loadMoreBtn) return;

        if (images.length <= INITIAL_COUNT) {
          loadMoreBtn.classList.add('hidden');
          return;
        }

        loadMoreBtn.addEventListener('click', function () {
          renderGallery(true);
          loadMoreBtn.classList.add('hidden');
        });
      })
      .catch((err) => console.error('Failed to load gallery images:', err));

    const lightboxImage = document.getElementById('lightboxImage');
    lightboxImage.addEventListener('click', nextImage);

    document.addEventListener('keydown', function (event) {
      const modal = document.getElementById('lightboxModal');
      if (!modal.classList.contains('hidden')) {
        if (event.key === 'ArrowRight') nextImage();
        if (event.key === 'ArrowLeft') prevImage();
        if (event.key === 'Escape') closeLightbox();
      }
    });

    const modal = document.getElementById('lightboxModal');
    modal.addEventListener('touchstart', (e) => (startX = e.touches[0].clientX));
    modal.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      if (startX - endX > 50) nextImage();
      else if (endX - startX > 50) prevImage();
      startX = null;
    });
  });
})();
