
if (document.body.id === "scheduler") {

// Client side form validation 
  const postButton = document.getElementById('postButton');
  const captionInput = document.getElementById('caption');
  const imageInput = document.getElementById('image-upload');
  const dateInput = document.getElementById('scheduledDateTime');
  const platformsInput = document.querySelectorAll('input[name="platforms"]');

function togglePostButton(){
  const caption = captionInput.value.trim();
  const hasImage = imageInput.files.length > 0;
  const hasPlatform = Array.from(platformsInput).some(checkbox => checkbox.checked);
  const hasDate = dateInput.value.trim() !== "";

  postButton.disabled = !( (caption || hasImage) && hasPlatform  && hasDate);
}
  captionInput.addEventListener('input', togglePostButton);
  imageInput.addEventListener('change', togglePostButton);
  dateInput.addEventListener('change', togglePostButton);
  platformsInput.forEach(checkbox => {
    checkbox.addEventListener('change', togglePostButton);
  });

  togglePostButton();

document.querySelector(".generate-caption").disabled = true;

// caption script
window.addEventListener('DOMContentLoaded', () => {
      document.getElementById('caption').focus();
    });

const textarea = document.querySelector(".caption-input");
textarea.addEventListener("input", () => {
  textarea.style.height = "auto"; 
  textarea.style.height = textarea.scrollHeight + "px"; // grow with content
});

// Date script
    const scheduledDateTimeInput = document.getElementById('scheduledDateTime');
    scheduledDateTimeInput.addEventListener("click", function () {
  this.showPicker && this.showPicker(); 
});
    
function setDateButton() {
  const value = scheduledDateTimeInput.value;
  const dateView = document.querySelector('.date-view');
  if (value){
       const date = new Date(value);
      const options = { 
        weekday: "short", 
        year: "numeric", 
        month: "long", 
        day: "numeric", 
        hour: "numeric", 
        minute: "2-digit" 
      };
      dateView.textContent = date.toLocaleString(undefined, options);
    }else{
      dateView.textContent = "";
    }
}


document.getElementById('dateModal').addEventListener('show.bs.modal', () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const currentDateTime = `${yyyy}-${mm}-${dd}T${hh}:${min}`;

  // Set current date & time as default value
  scheduledDateTimeInput.value = currentDateTime;

  // Prevent selecting any past date/time
  scheduledDateTimeInput.min = currentDateTime; });

  document.getElementById('saveDate').addEventListener('click', setDateButton)


// image upload script
let selectedFile = null;
const input = document.getElementById('image-upload');
const previewContainer = document.querySelector('.image-container');
const deleteButton = document.createElement('button');
      deleteButton.classList.add('btn-close');
      deleteButton.ariaLabel = "Close";
      deleteButton.type = "button";
let selectedFiles = [];

      input.addEventListener('change', (e) => {
      previewContainer.classList.remove('multipleMedia');
      previewContainer.innerHTML = '';
      selectedFiles = Array.from(e.target.files);
      
      if (selectedFiles.length === 1) {
        const file = selectedFiles[0];
        const fileURL = URL.createObjectURL(file);
        const div = document.createElement('div');
        
        if (file.type.startsWith('image')) {
          div.innerHTML = `<img src="${fileURL}" alt="preview" class="preview">`;
          
        } else if (file.type.startsWith('video')) {
          div.innerHTML = `<video src="${fileURL}" class="preview-video" autoplay></video>`;
        }
         previewContainer.appendChild(div);
         

      } else {
        selectedFiles.forEach((file, index) => {
        const fileURL = URL.createObjectURL(file);
        const div = document.createElement('div');
        div.classList.add('preview-item');
        div.dataset.index = index;
        previewContainer.classList.add('multipleMedia');
        if (file.type.startsWith('image')) {
          div.innerHTML = `<img src="${fileURL}" alt="preview">`;
        } else if (file.type.startsWith('video')) {
          div.innerHTML = `<video src="${fileURL}" muted></video>`;
        }
        previewContainer.appendChild(div);
      });
      }
      previewContainer.appendChild(deleteButton);
    });

deleteButton.addEventListener('click',function () {
  input.value = ""; 
  previewContainer.innerHTML = "";
})


//media upload 
document.getElementById('scheduler-form').addEventListener('submit', async function (event) {
  if (selectedFiles && selectedFiles.length > 0) {

    event.preventDefault();

    const form = this;
    postButton.disabled = true;
    console.log("Uploading multiple files to Cloudinary (parallel)...");

    try {
      // Map each file to an upload promise
      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "postpilot");

        return fetch("https://api.cloudinary.com/v1_1/dm340hnd3/auto/upload", {
          method: "POST",
          body: formData
        }).then(async res => {
          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload failed: ${res.status} ${res.statusText}\n${text}`);
          }
          return res.json();
        });
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map(r => r.secure_url);

      // Save URLs in hidden field (as JSON)
      document.querySelector(".file-url").value = JSON.stringify(uploadedUrls);
      console.log("All uploads complete:", uploadedUrls);

      form.submit();
      postButton.disabled = false;

    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      alert("One or more uploads failed. Please try again.");
      postButton.disabled = false;
    }
  }
});


// platforms script
document.getElementById("savePlatforms").addEventListener("click", function () {
    const checkboxes = document.querySelectorAll("input[name='platforms']:checked");
    const platformPreview = document.querySelector('.platforms-view');

    if (checkboxes.length > 0) {
      const values = Array.from(checkboxes).map(cb => cb.value);
      platformPreview.textContent = "To be active on " + values.join(", ");
    } else {
      platformPreview.textContent = "";
    }
  });


if (window.visualViewport) {
      const bottomActions = document.getElementById('bottomActions');
      window.visualViewport.addEventListener('resize', () => {
        if (window.innerWidth <= 768) {
          const keyboardHeight = window.innerHeight - window.visualViewport.height;
          bottomActions.style.bottom = keyboardHeight > 0 ? keyboardHeight + 'px' : '0';
        } else {
          bottomActions.style.bottom = '0';
        }
      });
    }


}



// HOME PAGE 


if (document.body.id === "homePage") {

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


// Delete Modal
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


//View video on homePage feed...
const overlay = document.getElementById('videoOverlay');
const overlayVideo = document.getElementById('overlayVideo');
const closeBtn = document.getElementById('closeOverlayBtn');

// Open overlay when a video is clicked
document.querySelectorAll('.posted-video').forEach(video => {
  video.addEventListener('click', () => {
    overlay.classList.add('active');
    overlayVideo.src = video.querySelector('source').src;
    overlayVideo.play();
  });
});

// Close overlay via button
closeBtn.addEventListener('click', closeOverlay);

function closeOverlay() {
  overlay.classList.remove('active');
  overlayVideo.pause();
  overlayVideo.src = '';
}

/* --- Swipe to close functionality --- */
let startY = 0;
let currentY = 0;
let isDragging = false;

overlay.addEventListener('touchstart', (e) => {
  startY = e.touches[0].clientY;
  isDragging = true;
});

overlay.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  currentY = e.touches[0].clientY;
  const diff = currentY - startY;
  
  // Move overlay slightly with the drag
  if (diff > 0) {
    overlay.classList.add('dragging');
    overlay.style.transform = `translateY(${diff}px)`;
    overlay.style.opacity = `${1 - diff / 400}`;
  }
});

overlay.addEventListener('touchend', () => {
  if (!isDragging) return;
  isDragging = false;
  overlay.classList.remove('dragging');

  const diff = currentY - startY;
  // If swipe down is big enough, close
  if (diff > 120) {
    overlay.style.transition = 'transform 0.25s ease, opacity 0.25s ease';
    overlay.style.transform = 'translateY(100%)';
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.style.transform = '';
      overlay.style.opacity = '';
      overlay.style.transition = '';
      closeOverlay();
    }, 250);
  } else {
    // Reset if drag was too small
    overlay.style.transform = '';
    overlay.style.opacity = '';
  }
});

document.querySelectorAll('.post-media').forEach(container => {
  const items = container.querySelectorAll('.media-item');
  const count = items.length;

  container.classList.remove('single', 'double', 'grid');

  if (count === 1) {
    container.classList.add('single');
  } else if (count === 2) {
    container.classList.add('double');
  } else if (count >= 3) {
    container.classList.add('grid');

    // Show only first 4 media
    items.forEach((item, i) => {
      item.style.display = i < 4 ? 'block' : 'none';
    });

    // Add +N overlay
    if (count > 4) { 
      const overlay = document.createElement('div');
      overlay.className = 'more-overlay';
      overlay.textContent = `+${count - 4}`;
      overlay.onclick = () => openGallery(container);
      container.appendChild(overlay);
    }
  }

  // Ensure videos autoplay/mute
  container.querySelectorAll('video').forEach(v => {
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
  });
});

const imageOverlay = document.getElementById('imageOverlay');


/* Image Overlay */
function openImageOverlay(src) {
  const image = imageOverlay.querySelector('img');
  image.src = src;
  overlay.style.display = 'flex';
}

function closeImageOverlay() {
  document.getElementById('imageOverlay').style.display = 'none';
}

/* Open all media in modal (triggered by +N) */
function openGallery(container) {
  const allImages = [...container.querySelectorAll('img')].map(img => img.src);
  const firstImage = allImages[0];
  handleGesture(allImages)
  openImageOverlay(firstImage);
}

}