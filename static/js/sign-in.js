document.addEventListener("DOMContentLoaded", () => {
  const signinForm = document.getElementById("signinForm")
  const passwordToggle = document.getElementById("passwordToggle")
  const passwordInput = document.getElementById("password")
  const emailInput = document.getElementById("email")
  const emailError = document.getElementById("emailError")
  const passwordError = document.getElementById("passwordError")

  // Modal elements
  const forgotPasswordModal = document.getElementById("forgotPasswordModal")
  const emailModal = document.getElementById("emailModal")
  const changePasswordModal = document.getElementById("changePasswordModal")
  const successModal = document.getElementById("successModal")

  // Forgot Password Modal elements
  const forgotPasswordLink = document.getElementById("forgotPasswordLink")
  const closeForgotModal = document.getElementById("closeForgotModal")
  const forgotEmailInput = document.getElementById("forgotEmail")
  const confirmForgotBtn = document.getElementById("confirmForgotBtn")
  const forgotEmailError = document.getElementById("forgotEmailError")

  // OTP Modal elements
  const closeModal = document.getElementById("closeModal")
  const confirmBtn = document.getElementById("confirmBtn")
  const resendBtn = document.getElementById("resendBtn")
  const otpInputs = document.querySelectorAll(".otp-input")
  const timerElement = document.getElementById("timer")
  const userEmailSpan = document.getElementById("userEmail")

  // Change Password Modal elements
  const closeChangeModal = document.getElementById("closeChangeModal")
  const newPasswordInput = document.getElementById("newPassword")
  const confirmPasswordInput = document.getElementById("confirmPassword")
  const newPasswordToggle = document.getElementById("newPasswordToggle")
  const confirmPasswordToggle = document.getElementById("confirmPasswordToggle")
  const changePasswordBtn = document.getElementById("changePasswordBtn")
  const newPasswordError = document.getElementById("newPasswordError")
  const confirmPasswordError = document.getElementById("confirmPasswordError")

  // Success Modal elements
  const closeSuccessModal = document.getElementById("closeSuccessModal")
  const backToSignInBtn = document.getElementById("backToSignInBtn")

  let countdown = 600 // 10 minutes in seconds (changed from 5 minutes)
  let timerInterval
  let currentUserEmail = ""
  let currentOtpToken = "" // Store the OTP token for verification

  // Password toggle functionality
  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    const icon = passwordToggle.querySelector(".material-symbols-outlined")
    icon.textContent = type === "password" ? "visibility" : "visibility_off"
  })

  // Password toggle for change password modal
  newPasswordToggle.addEventListener("click", () => {
    const type = newPasswordInput.getAttribute("type") === "password" ? "text" : "password"
    newPasswordInput.setAttribute("type", type)
    const icon = newPasswordToggle.querySelector(".material-symbols-outlined")
    icon.textContent = type === "password" ? "visibility" : "visibility_off"
  })

  confirmPasswordToggle.addEventListener("click", () => {
    const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password"
    confirmPasswordInput.setAttribute("type", type)
    const icon = confirmPasswordToggle.querySelector(".material-symbols-outlined")
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
      case "forgotEmail":
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
      case "newPassword":
        if (!value) {
          showError(input, "Please enter a new password")
          return false
        } else if (value.length < 8) {
          showError(input, "Password must be at least 8 characters long")
          return false
        }
        break
      case "confirmPassword":
        if (!value) {
          showError(input, "Please confirm your password")
          return false
        } else if (value !== newPasswordInput.value) {
          showError(input, "Passwords do not match")
          return false
        }
        break
    }

    hideError(input)
    return true
  }

  // Modal functions
  function showModal(modal) {
    modal.classList.add("active")
  }

  function hideModal(modal) {
    modal.classList.remove("active")
  }

  function hideAllModals() {
    hideModal(forgotPasswordModal)
    hideModal(emailModal)
    hideModal(changePasswordModal)
    hideModal(successModal)
    resetOTPModal()
  }

  // Timer function
  function startTimer() {
    clearInterval(timerInterval)
    countdown = 600 // 10 minutes (was probably 300 before)

    timerInterval = setInterval(() => {
      const minutes = Math.floor(countdown / 60)
      const seconds = countdown % 60
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

      if (countdown <= 0) {
        clearInterval(timerInterval)
        timerElement.textContent = "0:00"
        timerElement.style.color = "#EF4444"
      }
      countdown--
    }, 1000)
  }

  // Reset OTP modal
  function resetOTPModal() {
    otpInputs.forEach((input) => (input.value = ""))
    clearInterval(timerInterval)
    countdown = 600 // 10 minutes
    timerElement.style.color = "#8B0000"
    timerElement.textContent = "10:00" // Show 10:00 instead of 5:00
  }

  // Show email modal function
  function showEmailModal(email) {
    userEmailSpan.textContent = email
    hideModal(forgotPasswordModal)
    showModal(emailModal)
    startTimer()
    otpInputs[0].focus()
  }

  // Forgot Password Link Click
  forgotPasswordLink.addEventListener("click", (e) => {
    e.preventDefault()
    showModal(forgotPasswordModal)
    forgotEmailInput.focus()
  })

  // Close modal handlers
  closeForgotModal.addEventListener("click", () => hideAllModals())
  closeModal.addEventListener("click", () => hideAllModals())
  closeChangeModal.addEventListener("click", () => hideAllModals())
  closeSuccessModal.addEventListener("click", () => hideAllModals())

  // Close modal when clicking outside
  ;[forgotPasswordModal, emailModal, changePasswordModal, successModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        hideAllModals()
      }
    })
  })

  // Forgot Password Confirm - UPDATED WITH REAL EMAIL SENDING
  confirmForgotBtn.addEventListener("click", async () => {
    if (validateField(forgotEmailInput)) {
      currentUserEmail = forgotEmailInput.value.trim()
      confirmForgotBtn.textContent = "Sending..."
      confirmForgotBtn.disabled = true

      try {
        // Send request to backend to send OTP email
        const response = await fetch("/api/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: currentUserEmail,
          }),
        })

        const data = await response.json()

        if (data.success) {
          currentOtpToken = data.token // Store the token for verification
          showEmailModal(currentUserEmail)
          confirmForgotBtn.textContent = "Confirm"
          confirmForgotBtn.disabled = false
          forgotEmailInput.value = ""
          hideError(forgotEmailInput)
        } else {
          showError(forgotEmailInput, data.message || "Failed to send OTP. Please try again.")
          confirmForgotBtn.textContent = "Confirm"
          confirmForgotBtn.disabled = false
        }
      } catch (error) {
        console.error("Error sending OTP:", error)
        showError(forgotEmailInput, "Network error. Please check your connection and try again.")
        confirmForgotBtn.textContent = "Confirm"
        confirmForgotBtn.disabled = false
      }
    }
  })

  // OTP input handling
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, "")

      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }

      // Auto-submit when all fields are filled
      if (index === otpInputs.length - 1 && e.target.value.length === 1) {
        const allFilled = Array.from(otpInputs).every((input) => input.value.length === 1)
        if (allFilled) {
          setTimeout(() => confirmOTP(), 500)
        }
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        otpInputs[index - 1].focus()
      }
      if (e.key === "Enter") {
        confirmOTP()
      }
    })

    input.addEventListener("paste", (e) => {
      e.preventDefault()
      const pastedData = e.clipboardData.getData("text").replace(/[^0-9]/g, "")

      for (let i = 0; i < Math.min(pastedData.length, otpInputs.length - index); i++) {
        if (otpInputs[index + i]) {
          otpInputs[index + i].value = pastedData[i]
        }
      }

      // Focus on the next empty input or the last one
      const nextIndex = Math.min(index + pastedData.length, otpInputs.length - 1)
      otpInputs[nextIndex].focus()
    })
  })

  // Confirm OTP function - UPDATED WITH PROPER FIELD HANDLING
  async function confirmOTP() {
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("")

    console.log("OTP entered:", otp)
    console.log("Current email:", currentUserEmail)
    console.log("Current token:", currentOtpToken)

    if (otp.length !== 4) {
      alert("Please enter the complete 4-digit OTP code.")
      otpInputs[0].focus()
      return
    }

    if (!currentUserEmail || !currentOtpToken) {
      alert("Session expired. Please try again.")
      hideAllModals()
      return
    }

    confirmBtn.textContent = "Verifying..."
    confirmBtn.disabled = true

    try {
      const requestBody = {
        email: currentUserEmail,
        otp: otp,
        token: currentOtpToken,
      }

      console.log("Sending verification request:", requestBody)

      // Send OTP verification request to backend
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("Verification response:", data)

      if (data.success) {
        hideModal(emailModal)
        showModal(changePasswordModal)
        newPasswordInput.focus()
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false
        resetOTPModal()
      } else {
        alert(data.message || "Invalid OTP. Please try again.")
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false
        otpInputs[0].focus()
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      alert("Network error. Please check your connection and try again.")
      confirmBtn.textContent = "Confirm"
      confirmBtn.disabled = false
    }
  }

  // Confirm OTP button
  confirmBtn.addEventListener("click", confirmOTP)

  // Resend OTP - UPDATED TO HANDLE BOTH REGISTRATION AND PASSWORD RESET
  resendBtn.addEventListener("click", async () => {
    resendBtn.textContent = "Sending..."
    resendBtn.disabled = true

    try {
      // Determine if this is registration or password reset
      const isPasswordReset = window.location.pathname === "/sign-in" || currentUserEmail

      let endpoint, requestBody

      if (isPasswordReset) {
        // Password reset resend
        endpoint = "/api/send-otp"
        requestBody = {
          email: currentUserEmail,
        }
      } else {
        // Registration resend
        endpoint = "/api/resend-registration-otp"
        requestBody = {
          email: currentUserEmail,
          token: currentOtpToken,
        }
      }

      console.log("Resending OTP:", requestBody) // Debug log

      // Send request to backend to resend OTP email
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      console.log("Resend OTP response:", data) // Debug log

      if (data.success) {
        if (data.token) {
          currentOtpToken = data.token // Update the token if provided
        }
        resetOTPModal()
        startTimer()
        resendBtn.textContent = "Resend"
        resendBtn.disabled = false
        alert("OTP resent successfully!")
        otpInputs[0].focus()
      } else {
        alert(data.message || "Failed to resend OTP. Please try again.")
        resendBtn.textContent = "Resend"
        resendBtn.disabled = false
      }
    } catch (error) {
      console.error("Error resending OTP:", error)
      alert("Network error. Please check your connection and try again.")
      resendBtn.textContent = "Resend"
      resendBtn.disabled = false
    }
  })

  // Change Password - UPDATED WITH REAL PASSWORD RESET
  changePasswordBtn.addEventListener("click", async () => {
    let isValid = true

    if (!validateField(newPasswordInput)) isValid = false
    if (!validateField(confirmPasswordInput)) isValid = false

    if (isValid) {
      changePasswordBtn.textContent = "Changing..."
      changePasswordBtn.disabled = true

      try {
        // Send password reset request to backend
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: currentUserEmail,
            new_password: newPasswordInput.value,
            token: currentOtpToken,
          }),
        })

        const data = await response.json()

        if (data.success) {
          hideModal(changePasswordModal)
          showModal(successModal)
          changePasswordBtn.textContent = "Change Password"
          changePasswordBtn.disabled = false
          newPasswordInput.value = ""
          confirmPasswordInput.value = ""
          hideError(newPasswordInput)
          hideError(confirmPasswordInput)
        } else {
          alert(data.message || "Failed to reset password. Please try again.")
          changePasswordBtn.textContent = "Change Password"
          changePasswordBtn.disabled = false
        }
      } catch (error) {
        console.error("Error resetting password:", error)
        alert("Network error. Please check your connection and try again.")
        changePasswordBtn.textContent = "Change Password"
        changePasswordBtn.disabled = false
      }
    }
  })

  // Back to Sign In
  backToSignInBtn.addEventListener("click", () => {
    hideAllModals()
    emailInput.focus()
  })

  // Add Enter key support for modal inputs
  ;[forgotEmailInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (input === forgotEmailInput) {
          confirmForgotBtn.click()
        } else if (input === newPasswordInput || input === confirmPasswordInput) {
          changePasswordBtn.click()
        }
      }
    })
  })

  // Real-time validation for modal inputs
  ;[forgotEmailInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this)
    })

    input.addEventListener("input", function () {
      if (this.classList.contains("input-error")) {
        validateField(this)
      }
    })
  })

  // Form inputs and validation for main form
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

  // Form submission handler - IMPROVED VERSION
  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Clear any previous login errors
    hideError(emailInput)
    hideError(passwordInput)

    let isValid = true
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false
      }
    })

    if (isValid) {
      const signinBtn = document.querySelector(".signin-btn")
      const originalText = signinBtn.textContent

      // Disable button and show loading state
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

      try {
        // Prepare form data for POST
        const formData = new FormData()
        formData.append("email", form.email.value.trim().toLowerCase())
        formData.append("password", form.password.value)

        console.log("Sending sign-in request...")

        // Send POST request to backend API
        const response = await fetch("/api/sign-in", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()
        console.log("Sign-in response:", data)

        if (data.success) {
          // Success - redirect to loading page
          console.log("Sign-in successful, redirecting...")
          window.location.href = "/loading"
        } else {
          // Show specific error message
          console.error("Sign-in failed:", data.message)
          showError(passwordInput, data.message || "Invalid email or password")
        }
      } catch (err) {
        console.error("Network error during sign-in:", err)
        showError(passwordInput, "Network error. Please check your connection and try again.")
      } finally {
        // Reset button UI
        signinBtn.disabled = false
        signinBtn.style.opacity = "1"
        signinBtn.style.position = "static"
        signinBtn.textContent = originalText
      }
    }
  })

  // Sign up link - Fixed to use Flask route
  document.getElementById("signUpLink").addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "/sign-up"
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
