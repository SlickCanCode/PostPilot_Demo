
// HOME PAGE 


// See more Caption
document.addEventListener("DOMContentLoaded", () => {
  const captions = document.querySelectorAll(".post-caption");
  const seeMoreButtons = document.querySelectorAll(".see-more");

  captions.forEach((caption, i) => {
    const btn = seeMoreButtons[i];
    // Check if the caption is truncated (scrollHeight > clientHeight)
    if (caption.scrollHeight > caption.clientHeight + 5) {
      btn.style.display = "inline"; // Show "See more"
    } else {
      btn.style.display = "none"; // Hide if it's short
    }

    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const captionElement = document.getElementById(`caption-${id}`);
      const isExpanded = btn.textContent.includes("less");

      if (isExpanded) {
        // Collapse back to 3 lines
        captionElement.style.webkitLineClamp = "3";
        captionElement.style.overflow = "hidden";
        btn.textContent = "See more";
      } else {
        // Expand fully
        captionElement.style.webkitLineClamp = "unset";
        captionElement.style.overflow = "visible";
        btn.textContent = "See less";
      }
    });
  });
});


// Delete Post Modal
  let selectedForm = null;

  // When modal is about to show
  const modal = document.getElementById('modalChoice');
  modal.addEventListener('show.bs.modal', event => {
    const button = event.relatedTarget; // Button that triggered the modal
    const postId = button.getAttribute('data-post-id');
    selectedForm = button.closest('form'); // Find the correct form
  });

  // When user confirms delete
  document.getElementById('confirmDelete').addEventListener('click', () => {
    if (selectedForm) {
      selectedForm.submit();
    }
  });


const allPostMedia = document.querySelectorAll('.post-media');
  let galleryIndex = 0;
  let galleryItems = [];

  allPostMedia.forEach(container => {
    const items = container.querySelectorAll('.media-item');
    const count = items.length;

    container.classList.remove('single','double','grid');
    if (count === 1) container.classList.add('single');
    else if (count === 2) container.classList.add('double');
    else if (count === 3) {
      container.classList.add('grid');
      items[0].classList.add('two-span');
    }
    else container.classList.add("quad");

    // Click listeners for each media
    items.forEach((item, index) => {
      const media = JSON.parse(container.dataset.media);
      item.addEventListener('click', () => openGallery(index, media));
    });
  });
  

// Media Overlay N Gallery
const galleryOverlay = document.getElementById('imageOverlay');
  const mediaContainer = galleryOverlay.querySelector('.gallery-content');
  const ImagecloseBtn = galleryOverlay.querySelector('.close-btn');
  ImagecloseBtn.addEventListener('click', closeGallery);

  function openGallery(index, items) {
    galleryItems = items;
    galleryIndex = index;
    showGalleryMedia();
    galleryOverlay.style.display = 'flex';
  }  
  function closeGallery() {
    galleryOverlay.style.display = 'none';
  }

  let startX = 0;
let isDragging = false;
let currentX = 0;
let diffX = 0;

const videoStates = new Map(); // store {src: currentTime, paused}

// --- TOUCH EVENTS --- //
galleryOverlay.addEventListener('touchstart', e => {
  startX = e.touches[0].clientX;
  isDragging = true;
});

galleryOverlay.addEventListener('touchmove', e => {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
  diffX = currentX - startX;

  const currentMedia = mediaContainer.querySelector('.gallery-media.current');
  const nextMedia = mediaContainer.querySelector('.gallery-media.next');
  const prevMedia = mediaContainer.querySelector('.gallery-media.prev');

  if (currentMedia) currentMedia.style.transform = `translateX(${diffX}px)`;
  if (diffX < 0 && nextMedia) {
    nextMedia.style.transform = `translateX(${diffX + mediaContainer.offsetWidth}px)`;
  } else if (diffX > 0 && prevMedia) {
    prevMedia.style.transform = `translateX(${diffX - mediaContainer.offsetWidth}px)`;
  }
});

galleryOverlay.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;

  const threshold = 80;
  const currentMedia = mediaContainer.querySelector('.gallery-media.current');
  const nextMedia = mediaContainer.querySelector('.gallery-media.next');
  const prevMedia = mediaContainer.querySelector('.gallery-media.prev');

  if (diffX < -threshold && galleryIndex < galleryItems.length - 1) {
    slideTo('next');
  } else if (diffX > threshold && galleryIndex > 0) {
    slideTo('prev');
  } else {
    resetSlide(currentMedia, nextMedia, prevMedia);
  }

  diffX = 0;
});

// --- SLIDE ANIMATIONS --- //
function slideTo(direction) {
  const currentMedia = mediaContainer.querySelector('.gallery-media.current');
  const nextMedia = mediaContainer.querySelector('.gallery-media.next');
  const prevMedia = mediaContainer.querySelector('.gallery-media.prev');

  [currentMedia, nextMedia, prevMedia].forEach(m => {
    if (m) m.style.transition = 'transform 0.3s ease';
  });

  if (direction === 'next' && nextMedia) {
    saveVideoState(currentMedia);
    currentMedia.style.transform = `translateX(-100%)`;
    nextMedia.style.transform = `translateX(0)`;
    setTimeout(() => {
      galleryIndex++;
      showGalleryMedia(); // reload adjacent items but keep current video state
    }, 300);
  } else if (direction === 'prev' && prevMedia) {
    saveVideoState(currentMedia);
    currentMedia.style.transform = `translateX(100%)`;
    prevMedia.style.transform = `translateX(0)`;
    setTimeout(() => {
      galleryIndex--;
      showGalleryMedia();
    }, 300);
  }
}

function resetSlide(currentMedia, nextMedia, prevMedia) {
  [currentMedia, nextMedia, prevMedia].forEach(m => {
    if (m) {
      m.style.transition = 'transform 0.3s ease';
    }
  });
  if (currentMedia) currentMedia.style.transform = 'translateX(0)';
  if (nextMedia) nextMedia.style.transform = 'translateX(100%)';
  if (prevMedia) prevMedia.style.transform = 'translateX(-100%)';
}

// --- STATE SAVING FOR VIDEOS --- //
function saveVideoState(media) {
  if (media && media.tagName === 'VIDEO') {
    videoStates.set(media.src, {
      time: media.currentTime,
      paused: media.paused
    });
  }
}

function restoreVideoState(video) {
  const state = videoStates.get(video.src);
  if (state) {
    video.currentTime = state.time;
    if (!state.paused) video.play();
  }
}

// --- SHOW MEDIA --- //
function showGalleryMedia() {
  mediaContainer.innerHTML = '';

  const currentSrc = galleryItems[galleryIndex];
  const currentEl = createMediaElement(currentSrc);
  currentEl.classList.add('current');
  currentEl.style.transform = 'translateX(0)';
  mediaContainer.appendChild(currentEl);

  if (galleryIndex < galleryItems.length - 1) {
    const nextSrc = galleryItems[galleryIndex + 1];
    const nextEl = createMediaElement(nextSrc);
    nextEl.classList.add('next');
    nextEl.style.transform = 'translateX(100%)';
    mediaContainer.appendChild(nextEl);
  }

  if (galleryIndex > 0) {
    const prevSrc = galleryItems[galleryIndex - 1];
    const prevEl = createMediaElement(prevSrc);
    prevEl.classList.add('prev');
    prevEl.style.transform = 'translateX(-100%)';
    mediaContainer.appendChild(prevEl);
  }

  // Restore video state if applicable
  if (currentEl.tagName === 'VIDEO') restoreVideoState(currentEl);
}

// --- ELEMENT CREATION --- //
function createMediaElement(src) {
  let element, ext;
  if (typeof src === "string") {
    ext = src.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg'].includes(ext)) {
      element = document.createElement('video');
      element.src = src;
      element.controls = true;
      element.autoplay = true;
    } else {
      element = document.createElement('img');
      element.src = src;
    }
  } else {
    ext = src.type;
    if (ext.startsWith('video/')) {
      element = document.createElement('video');
      element.src = src.url;
      element.controls = true;
      element.autoplay = true;
    } else {
      element = document.createElement('img');
      element.src = src.url;
    }
  }

  element.className = 'gallery-media';
  Object.assign(element.style, {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    transition: 'transform 0.3s ease',
  });

  // Save play state changes
  if (element.tagName === 'VIDEO') {
    element.addEventListener('pause', () => saveVideoState(element));
    element.addEventListener('play', () => saveVideoState(element));
    element.addEventListener('timeupdate', () => saveVideoState(element));
  }

  return element;
}
