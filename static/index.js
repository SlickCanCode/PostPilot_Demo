
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

  function openGallery(index, items) {
    galleryItems = items;
    galleryIndex = index;
    showGalleryMedia();
    galleryOverlay.style.display = 'flex';
  }

  function showGalleryMedia() {
    mediaContainer.innerHTML = '';
    const src = galleryItems[galleryIndex];
    let ext; 
    let element;
    if (typeof src === "string") {
       ext = src.split('.').pop().toLowerCase();   
        if (['mp4', 'webm', 'ogg'].includes(ext)) {
        element = document.createElement('video');
        element.src = src;
        element.playsInline
        element.controls = true;
        element.autoplay = true;
      } else {
        element = document.createElement('img');
        element.src = src;
      }

    }else {
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
    mediaContainer.appendChild(element);
  }

  function closeGallery() {
    galleryOverlay.style.display = 'none';
  }

  ImagecloseBtn.addEventListener('click', closeGallery);

  // Swipe navigation
  let startX = 0;
  galleryOverlay.addEventListener('touchstart', e => startX = e.touches[0].clientX);
  galleryOverlay.addEventListener('touchend', e => {
    const diffX = e.changedTouches[0].clientX - startX;
    if (Math.abs(diffX) > 50) {
      if (diffX < 0 && galleryIndex < galleryItems.length - 1) {
        galleryIndex++;
        showGalleryMedia();
      } else if (diffX > 0 && galleryIndex > 0) {
        galleryIndex--;
        showGalleryMedia();
      }
    }
  });

