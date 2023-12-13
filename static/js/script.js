function register() {
    const regEmail = document.getElementById("regEmail").value;
    const regPassword = document.getElementById("regPassword").value;

    fetch('https://system.saludeskimdev1.repl.co/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: regEmail, password: regPassword }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("regMessage").innerText = data.message;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function login() {
  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  fetch('https://system.saludeskimdev1.repl.co/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: loginEmail, password: loginPassword }),
  })
  .then(response => response.json())
  .then(data => {
      if (data.message === "Login failed. Incorrect password or email." || data.message === "Login failed. Email not found.") {
         var messageElement = document.getElementById("loginMessage");
         messageElement.innerText = data.message;
         messageElement.style.color = "red";
      }

      document.getElementById("loginMessage").innerText = data.message;

      // Redirect to homepage if login was successful
      if (data.message.includes('successful')) {
          window.location.href = '/home';
      }
  })
  .catch(error => {
      console.error('Error:', error);
  });
}

function showLoginForm() {
    document.getElementById("registrationForm").classList.remove("active");
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("regMessage").classList.remove("active");
    document.getElementById("loginMessage").classList.add("active");
}

function showRegistrationForm() {
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("registrationForm").classList.add("active");
    document.getElementById("loginMessage").classList.remove("active");
    document.getElementById("regMessage").classList.add("active");
}