
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
const preview = document.querySelector('.preview');
const previewVideo = document.querySelector('.preview-video');
const imgCloseButton = document.querySelector('.btn-close');
    input.addEventListener('change',readImage);
    
    function readImage() {
        const file = this.files[0];
        selectedFile = file;
      if (file) {
        const url = URL.createObjectURL(file);
        
          if (file.type.startsWith("image/")) {
            preview.src = url;
            preview.style.display = "block";
            imgCloseButton.style.display = "block";
          } else if(file.type.startsWith("video/")) {
            previewVideo.src = url;
            previewVideo.style.display = "block";
            imgCloseButton.style.display = "block";
            previewVideo.play();
          }

      }
    }

imgCloseButton.addEventListener('click', function() {
    preview.src = "";
    previewVideo.src = "";
    preview.style.display = "none";
    previewVideo.style.display = "none";
    imgCloseButton.style.display = "none";
})
//media upload 
document.getElementById('scheduler-form').addEventListener('submit', async function (event) {
  if (selectedFile!= null) {

  event.preventDefault(); 
  

  const form = this;
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", "postpilot");
  postButton.disabled = true;
  console.log("Uploading to Cloudinary...");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/dm340hnd3/auto/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload failed: ${res.status} ${res.statusText}\n${text}`);
    }
    const data = await res.json();
    console.log("Upload success:", data);
    document.querySelector(".file-url").value = data.secure_url;
    form.submit();
    postButton.disabled = false;

  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    alert("Upload failed. Please try again.");
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
}