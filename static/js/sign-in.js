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

  // Modal notification
  const modalNotification = document.getElementById("modalNotification")

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
  const otpError = document.getElementById("otpError")

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

  let countdown = 300 // 5 minutes in seconds
  let timerInterval
  let currentUserEmail = ""
  let currentOtpToken = ""

  // Modal notification function
  function showModalNotification(message, type = 'success') {
    const notification = document.getElementById('modalNotification')
    const messageElement = notification.querySelector('.notification-message')
    const iconElement = notification.querySelector('.notification-icon')
    
    messageElement.textContent = message
    
    if (type === 'success') {
      iconElement.textContent = 'check'
      notification.className = 'modal-notification notification-success'
    } else if (type === 'error') {
      iconElement.textContent = 'error'
      notification.className = 'modal-notification notification-error'
    }
    
    notification.style.display = 'block'
    
    setTimeout(() => {
      notification.style.display = 'none'
    }, 3000)
  }

  // OTP Error functions
  function showOtpError(message) {
    if (otpError) {
      otpError.textContent = message
      otpError.style.display = 'block'
    }
  }

  function hideOtpError() {
    if (otpError) {
      otpError.style.display = 'none'
    }
  }

  // Password toggle functionality
  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    const icon = passwordToggle.querySelector(".material-symbols-outlined")
    icon.textContent = type === "password" ? "visibility" : "visibility_off"
  })

  // Password toggle for change password modal
  if (newPasswordToggle) {
    newPasswordToggle.addEventListener("click", () => {
      const type = newPasswordInput.getAttribute("type") === "password" ? "text" : "password"
      newPasswordInput.setAttribute("type", type)
      const icon = newPasswordToggle.querySelector(".material-symbols-outlined")
      icon.textContent = type === "password" ? "visibility" : "visibility_off"
    })
  }

  if (confirmPasswordToggle) {
    confirmPasswordToggle.addEventListener("click", () => {
      const type = confirmPasswordInput.getAttribute("type") === "password" ? "text" : "password"
      confirmPasswordInput.setAttribute("type", type)
      const icon = confirmPasswordToggle.querySelector(".material-symbols-outlined")
      icon.textContent = type === "password" ? "visibility" : "visibility_off"
    })
  }

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
    if (modal) {
      modal.classList.add("active")
    }
  }

  function hideModal(modal) {
    if (modal) {
      modal.classList.remove("active")
    }
  }

  function hideAllModals() {
    hideModal(forgotPasswordModal)
    hideModal(emailModal)
    hideModal(changePasswordModal)
    hideModal(successModal)
    resetOTPModal()
    // Hide modal notification when closing modals
    if (modalNotification) {
      modalNotification.style.display = 'none'
    }
    // Hide OTP error when closing modals
    hideOtpError()
  }

  // Timer function - Updated for 5 minutes
  function startTimer() {
    clearInterval(timerInterval)
    countdown = 300 // 5 minutes in seconds

    timerInterval = setInterval(() => {
      const minutes = Math.floor(countdown / 60)
      const seconds = countdown % 60
      if (timerElement) {
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

        if (countdown <= 0) {
          clearInterval(timerInterval)
          timerElement.textContent = "0:00"
          timerElement.style.color = "#EF4444"
        }
      }
      countdown--
    }, 1000)
  }

  // Reset OTP modal
  function resetOTPModal() {
    if (otpInputs.length > 0) {
      otpInputs.forEach((input) => (input.value = ""))
    }
    clearInterval(timerInterval)
    countdown = 300 // 5 minutes
    if (timerElement) {
      timerElement.style.color = "#8B0000"
      timerElement.textContent = "5:00"
    }
    hideOtpError()
  }

  // Show email modal function
  function showEmailModal(email) {
    if (userEmailSpan) {
      userEmailSpan.textContent = email
    }
    hideModal(forgotPasswordModal)
    showModal(emailModal)
    startTimer()
    if (otpInputs.length > 0) {
      otpInputs[0].focus()
    }
  }

  // Forgot Password Link Click
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", (e) => {
      e.preventDefault()
      showModal(forgotPasswordModal)
      if (forgotEmailInput) {
        forgotEmailInput.focus()
      }
    })
  }

  // Close modal handlers
  if (closeForgotModal) {
    closeForgotModal.addEventListener("click", () => hideAllModals())
  }
  if (closeModal) {
    closeModal.addEventListener("click", () => hideAllModals())
  }
  if (closeChangeModal) {
    closeChangeModal.addEventListener("click", () => hideAllModals())
  }
  if (closeSuccessModal) {
    closeSuccessModal.addEventListener("click", () => hideAllModals())
  }
  // Close modal when clicking outside
  ;[forgotPasswordModal, emailModal, changePasswordModal, successModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          hideAllModals()
        }
      })
    }
  })

  // Forgot Password Confirm
  if (confirmForgotBtn) {
    confirmForgotBtn.addEventListener("click", async () => {
      if (validateField(forgotEmailInput)) {
        currentUserEmail = forgotEmailInput.value.trim()
        confirmForgotBtn.textContent = "Sending..."
        confirmForgotBtn.disabled = true

        try {
          console.log("Sending OTP to:", currentUserEmail)

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
          console.log("Send OTP response:", data)

          if (data.success) {
            currentOtpToken = data.token
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
  }

  // OTP input handling
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "")
      
      // Hide OTP error when user starts typing
      hideOtpError()

      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }

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

      const nextIndex = Math.min(index + pastedData.length, otpInputs.length - 1)
      otpInputs[nextIndex].focus()
    })
  })

  // Confirm OTP function
  async function confirmOTP() {
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("")

    console.log("OTP entered:", otp)
    console.log("Current email:", currentUserEmail)
    console.log("Current token:", currentOtpToken)

    if (otp.length !== 4) {
      showOtpError("Please enter the complete 4-digit OTP code.")
      if (otpInputs.length > 0) {
        otpInputs[0].focus()
      }
      return
    }

    if (!currentUserEmail || !currentOtpToken) {
      showOtpError("Session expired. Please try again.")
      setTimeout(() => hideAllModals(), 2000)
      return
    }

    if (confirmBtn) {
      confirmBtn.textContent = "Verifying..."
      confirmBtn.disabled = true
    }

    try {
      const requestBody = {
        email: currentUserEmail,
        otp: otp,
        token: currentOtpToken,
      }

      console.log("Sending verification request:", requestBody)

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
        if (newPasswordInput) {
          newPasswordInput.focus()
        }
        if (confirmBtn) {
          confirmBtn.textContent = "Confirm"
          confirmBtn.disabled = false
        }
        resetOTPModal()
      } else {
        showOtpError(data.message || "Invalid OTP. Please try again.")
        if (confirmBtn) {
          confirmBtn.textContent = "Confirm"
          confirmBtn.disabled = false
        }
        if (otpInputs.length > 0) {
          otpInputs[0].focus()
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      showOtpError("Network error. Please check your connection and try again.")
      if (confirmBtn) {
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false
      }
    }
  }

  // Confirm OTP button
  if (confirmBtn) {
    confirmBtn.addEventListener("click", confirmOTP)
  }

  // Resend OTP - Updated with modal notification
  if (resendBtn) {
    resendBtn.addEventListener("click", async () => {
      resendBtn.textContent = "Sending..."
      resendBtn.disabled = true

      try {
        const endpoint = "/api/send-otp"
        const requestBody = {
          email: currentUserEmail,
        }

        console.log("Resending OTP:", requestBody)

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        const data = await response.json()
        console.log("Resend OTP response:", data)

        if (data.success) {
          if (data.token) {
            currentOtpToken = data.token
          }
          resetOTPModal()
          startTimer()
          resendBtn.textContent = "Resend"
          resendBtn.disabled = false
          showModalNotification("OTP Resent!", 'success') // Show modal notification
          if (otpInputs.length > 0) {
            otpInputs[0].focus()
          }
        } else {
          showOtpError(data.message || "Failed to resend OTP. Please try again.")
          resendBtn.textContent = "Resend"
          resendBtn.disabled = false
        }
      } catch (error) {
        console.error("Error resending OTP:", error)
        showOtpError("Network error. Please check your connection and try again.")
        resendBtn.textContent = "Resend"
        resendBtn.disabled = false
      }
    })
  }

  // Change Password
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", async () => {
      let isValid = true

      if (!validateField(newPasswordInput)) isValid = false
      if (!validateField(confirmPasswordInput)) isValid = false

      if (isValid) {
        changePasswordBtn.textContent = "Changing..."
        changePasswordBtn.disabled = true

        try {
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
  }

  // Back to Sign In
  if (backToSignInBtn) {
    backToSignInBtn.addEventListener("click", () => {
      hideAllModals()
      emailInput.focus()
    })
  }
  // Add Enter key support for modal inputs
  ;[forgotEmailInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault()
          if (input === forgotEmailInput && confirmForgotBtn) {
            confirmForgotBtn.click()
          } else if ((input === newPasswordInput || input === confirmPasswordInput) && changePasswordBtn) {
            changePasswordBtn.click()
          }
        }
      })
    }
  })

  // Real-time validation for modal inputs
  ;[forgotEmailInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
    if (input) {
      input.addEventListener("blur", function () {
        validateField(this)
      })

      input.addEventListener("input", function () {
        if (this.classList.contains("input-error")) {
          validateField(this)
        }
      })
    }
  })

  // Form inputs and validation for main form
  const form = document.getElementById("signinForm")
  const inputs = form ? form.querySelectorAll("input[required]") : []

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

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        if (form) {
          form.dispatchEvent(new Event("submit"))
        }
      }
    })
  })

  // Form submission handler - IMPROVED WITH BETTER ERROR HANDLING
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault()

      console.log("=== SIGN-IN ATTEMPT ===")

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
        const originalText = signinBtn ? signinBtn.textContent : "Sign In"

        if (signinBtn) {
          // Disable button and show loading state
          signinBtn.disabled = true
          signinBtn.style.opacity = "0.7"
          signinBtn.textContent = "Signing In..."
        }

        try {
          // Prepare form data for POST
          const formData = new FormData()
          const email = form.email.value.trim().toLowerCase()
          const password = form.password.value

          formData.append("email", email)
          formData.append("password", password)

          console.log("Sending sign-in request for email:", email)

          // Send POST request to backend API
          const response = await fetch("/api/sign-in", {
            method: "POST",
            body: formData,
          })

          console.log("Response status:", response.status)
          console.log("Response headers:", response.headers)

          // Check if response is JSON
          const contentType = response.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Server returned non-JSON response")
          }

          const data = await response.json()
          console.log("Sign-in response:", data)

          if (data.success) {
            console.log("Sign-in successful, redirecting...")
            window.location.href = "/dashboard"
          } else {
            console.error("Sign-in failed:", data.message)

            // Show specific error message based on the response
            if (data.message.toLowerCase().includes("email") || data.message.toLowerCase().includes("not found")) {
              showError(emailInput, data.message)
            } else {
              showError(passwordInput, data.message)
            }
          }
        } catch (err) {
          console.error("Network error during sign-in:", err)

          // Show more specific error messages
          if (err.message.includes("Failed to fetch")) {
            showError(passwordInput, "Cannot connect to server. Please check your internet connection.")
          } else if (err.message.includes("non-JSON")) {
            showError(passwordInput, "Server error. Please try again later.")
          } else {
            showError(passwordInput, "An unexpected error occurred. Please try again.")
          }
        } finally {
          // Reset button UI
          if (signinBtn) {
            signinBtn.disabled = false
            signinBtn.style.opacity = "1"
            signinBtn.textContent = originalText
          }
        }
      }
    })
  }

  // Sign up link
  const signUpLink = document.getElementById("signUpLink")
  if (signUpLink) {
    signUpLink.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "/sign-up"
    })
  }

  // Button hover animation
  const signinBtn = document.querySelector(".signin-btn")
  if (signinBtn) {
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
  }

  // Initialize page
  console.log("DiabeTech Sign In Page loaded successfully!")
  if (emailInput) {
    emailInput.focus()
  }
})