document.addEventListener("DOMContentLoaded", () => {
    const signinForm = document.getElementById("signinForm")
    const passwordToggle = document.getElementById("passwordToggle")
    const passwordInput = document.getElementById("password")
    const emailInput = document.getElementById("email")
    const emailError = document.getElementById("emailError")
    const passwordError = document.getElementById("passwordError")
  
    // Password toggle functionality
    passwordToggle.addEventListener("click", () => {
      const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
      passwordInput.setAttribute("type", type)
  
      const icon = passwordToggle.querySelector(".material-symbols-outlined")
      icon.textContent = type === "password" ? "visibility" : "visibility_off"
    })
  
    // Form validation functions
    function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return re.test(email)
    }
  
    function showError(input, message) {
      input.classList.add("input-error")
      const errorElement = document.getElementById(input.id + "Error")
      if (errorElement) {
        errorElement.textContent = message
        errorElement.style.display = "block"
      }
    }
  
    function hideError(input) {
      input.classList.remove("input-error")
      const errorElement = document.getElementById(input.id + "Error")
      if (errorElement) {
        errorElement.style.display = "none"
      }
    }
  
    function validateField(input) {
      const value = input.value.trim()
  
      switch (input.id) {
        case "email":
          if (!value) {
            showError(input, "Please enter your email address")
            return false
          } else if (!validateEmail(value)) {
            showError(input, "Please enter a valid email address")
            return false
          }
          break
        case "password":
          if (!value) {
            showError(input, "Please enter your password")
            return false
          }
          break
      }
  
      hideError(input)
      return true
    }
  
    // Form inputs and validation
    const form = document.getElementById("signinForm")
    const inputs = form.querySelectorAll("input[required]")
  
    // Real-time validation with Enter key support
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        validateField(this)
      })
  
      input.addEventListener("input", function () {
        if (this.classList.contains("input-error")) {
          validateField(this)
        }
      })
  
      // Add Enter key support for form inputs
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          form.dispatchEvent(new Event("submit"))
        }
      })
    })
  
    // Form submission handler
    form.addEventListener("submit", (e) => {
      e.preventDefault()
  
      let isValid = true
      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false
        }
      })
  
      if (isValid) {
        const signinBtn = document.querySelector(".signin-btn")
        signinBtn.disabled = true
        signinBtn.style.opacity = "0.7"
        signinBtn.style.position = "relative"
        signinBtn.innerHTML = `
            <span style="opacity: 0.7;">Signing In...</span>
            <div style="
                position: absolute;
                right: 15px;
                top: 50%;
                transform: translateY(-50%);
                width: 20px;
                height: 20px;
                border: 2px solid rgba(255,255,255,0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
        `
  
        // Add CSS animation for spinner if not added yet
        if (!document.getElementById("spinner-style")) {
          const style = document.createElement("style")
          style.id = "spinner-style"
          style.textContent = `
              @keyframes spin {
                  0% { transform: translateY(-50%) rotate(0deg); }
                  100% { transform: translateY(-50%) rotate(360deg); }
              }
          `
          document.head.appendChild(style)
        }
  
        // Prepare form data for POST
        const formData = new FormData()
        formData.append("email", form.email.value.trim())
        formData.append("password", form.password.value)
  
        // Send POST request to backend API
        fetch("/api/sign-in", {
          method: "POST",
          body: formData,
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success) {
              // Redirect to loading page
              window.location.href = "/loading"
            } else {
              alert(data.message || "Login failed")
              // Reset button UI
              signinBtn.disabled = false
              signinBtn.style.opacity = "1"
              signinBtn.textContent = "Sign In"
            }
          })
          .catch((err) => {
            console.error("Error during sign-in:", err)
            alert("An error occurred. Please try again.")
            signinBtn.disabled = false
            signinBtn.style.opacity = "1"
            signinBtn.textContent = "Sign In"
          })
      }
    })
  
    // Forgot password link
    document.getElementById("forgotPasswordLink").addEventListener("click", (e) => {
      e.preventDefault()
      alert("Redirecting to password reset page...")
    })
  
    // Sign up link - Fixed to use Flask route
    document.getElementById("signUpLink").addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "/"
    })
  
    // Button hover animation
    const signinBtn = document.querySelector(".signin-btn")
    signinBtn.addEventListener("mouseenter", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(-2px)"
      }
    })
    signinBtn.addEventListener("mouseleave", function () {
      if (!this.disabled) {
        this.style.transform = "translateY(0)"
      }
    })
  
    // Initialize page
    console.log("Diabetech Sign In Page loaded successfully!")
    document.getElementById("email").focus()
  })
  