
if (document.body.id === "scheduler") {

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
  const dateButton = document.getElementById('SelectDatebtn');
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
      dateButton.textContent = date.toLocaleString(undefined, options);
    }else{
      dateButton.textContent = "Select Date";
    }
}

setDateButton();

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
//video upload 
document.getElementById('scheduler-form').addEventListener('submit', function() {
  console.log("What's up");
  let formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("upload_preset", "postpilot"); 

  fetch("https://api.cloudinary.com/v1_1/dm340hnd3/auto/upload", {
    method: "POST",
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    document.querySelector('.file-url').value = data.secure_url;
  });

  })
    
  

// platforms script
document.getElementById("savePlatforms").addEventListener("click", function () {
    const checkboxes = document.querySelectorAll("input[name='platforms']:checked");
    const btn = document.getElementById("platformBtn");

    if (checkboxes.length > 0) {
      const values = Array.from(checkboxes).map(cb => cb.value);
      btn.textContent = values.join(", ");
    } else {
      btn.textContent = "Select Platforms";
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