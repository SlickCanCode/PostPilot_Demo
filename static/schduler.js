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
const previewContainer = document.querySelector('.post-media');
const deleteButton = document.createElement('button');
      deleteButton.classList.add('btn-close');
      deleteButton.ariaLabel = "Close";
      deleteButton.type = "button";
let selectedFiles = [];
const MAX_FILES = 4;
const uploadAlert = document.querySelector(".upload-alert");
// For Existing Posts 
if (previewContainer.hasAttribute('data-media')) { 
  
  const mediaItems = previewContainer.querySelectorAll('.media-item');
  const mediaCount = mediaItems.length;
  previewContainer.classList.remove('single', 'double', 'grid');
  setLayout(previewContainer, mediaItems[0], mediaCount);

      // Click listeners for each media
      mediaItems.forEach((item, index) => {
        const media = JSON.parse(previewContainer.dataset.media);
        item.addEventListener('click', () => openGallery(index, media));
      });
      previewContainer.appendChild(deleteButton);

} 
  input.addEventListener('change', (e) => {
    uploadAlert.textContent = ''
        previewContainer.innerHTML = '';
        selectedFiles = Array.from(e.target.files);
        
        if (selectedFiles.length > MAX_FILES) {
          uploadAlert.textContent = "select maximum 4 files"
          uploadAlert.style.color = "red"
      // Clear the input to cancel the selection
      input.value = "";
      return;
    }
        const mediaFiles = selectedFiles.map(file => ({
          url: URL.createObjectURL(file),
          type: file.type,
        }));
        


    // Store them in the same format as real posts
    previewContainer.dataset.media = JSON.stringify(mediaFiles);

    // Set layout style dynamically
    previewContainer.className = 'post-media';
    const count = mediaFiles.length;
    let firstGridItem;

    // Create media items
    mediaFiles.forEach((file, index) => {
      const div = document.createElement('div');
      div.classList.add('media-item');
      div.dataset.index = index;
        if (index === 0) {
          firstGridItem = div;
        }

        if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = file.url;
        video.className = 'post-video post-image';
        video.muted = true;
        video.loop = true;
        video.autoplay = true;
        video.playsInline = true;
        div.appendChild(video);
        
      } else if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = file.url;
        img.alt = 'preview';
        img.className = 'post-image';
        div.appendChild(img);
      }
      
      previewContainer.appendChild(div);
    });

      setLayout(previewContainer,firstGridItem, count);

    // Add click listeners to open gallery overlay
    const allItems = previewContainer.querySelectorAll('.media-item');
    allItems.forEach((item, index) => {
      const media = JSON.parse(previewContainer.dataset.media);
      item.addEventListener('click', () => openGallery(index, media));
    });

    previewContainer.appendChild(deleteButton);
  });




deleteButton.addEventListener('click',function () {
  input.value = ""; 
  previewContainer.innerHTML = "";
})

function setLayout(container, firstItem, count) {
  if (count === 1) container.classList.add('single');
    else if (count === 2) container.classList.add('double');
    else if (count === 3) {
      container.classList.add('grid');
      firstItem.classList.add('two-span');
    }
    else container.classList.add("quad");
}


//Upload Media to Cloud
document.getElementById('scheduler-form').addEventListener('submit', async function (event) {
  if (selectedFiles && selectedFiles.length > 0) {

    event.preventDefault();

    const form = this;    
    scheduleLoading();


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

    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      alert("One or more uploads failed. Please try again.");
      postButton.disabled = false;
    }
  }
});

function scheduleLoading() {
  postButton.disabled = true;
    postButton.innerHTML = "";
    postButton.innerHTML = "Scheduling "
    // spinner
    let span1 = document.createElement('span');
    span1.classList.add('spinner-border','spinner-border-sm');
    span1.ariaHidden = "true";
    postButton.appendChild(span1);
}


// platforms script
document.getElementById("savePlatforms").addEventListener("click", savePlatforms)
function savePlatforms() {
    const checkboxes = document.querySelectorAll("input[name='platforms']:checked");
    const platformPreview = document.querySelector('.platforms-view');

    if (checkboxes.length > 0) {
      const values = Array.from(checkboxes).map(cb => cb.value);
      platformPreview.textContent = "To be active on " + values.join(", ");
    } else {
      platformPreview.textContent = "";
    }
  }
savePlatforms();


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

    // Media gallery
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