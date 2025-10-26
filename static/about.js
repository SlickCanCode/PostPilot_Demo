document.querySelector(".about-contact").addEventListener("submit", async function (e) {
  e.preventDefault(); 

  const name = document.querySelector(".name-input").value;
  const email = document.querySelector(".email-input").value;
  const message = document.querySelector(".message-input").value;
  const messageDiv = document.querySelector(".response-message");
  messageDiv.textContent=''
  const submitButton = document.querySelector(".submit-message");
  if (name != '' && email!='' && message !='') {
    
  document.querySelector(".about-contact").reset();
  messageDiv.textContent = "Sending...";
  submitButton.disabled = true;
  
  try {
    const response = await fetch("/contactMe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, message }),
    });

    const result = await response.json();

    if (response.ok) {
      messageDiv.textContent = "Message sent successfully!";
      messageDiv.style.color = "green";
      
      submitButton.disabled = false;
      this.reset();

    } else {
      messageDiv.textContent =  (result.error || "Something went wrong.");
      messageDiv.style.color = "red";
    }
  } catch (err) {
    console.log(err)
    messageDiv.textContent =
      " Failed to send message. Check your connection.";
    messageDiv.style.color = "red";
  }
  }

});
