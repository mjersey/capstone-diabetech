document.addEventListener("DOMContentLoaded", () => {
  console.log("Diabetech Sign Up Page loaded successfully!")

  const signupForm = document.getElementById("signupForm")
  const emailModal = document.getElementById("emailModal")
  const successModal = document.getElementById("successModal")
  const resendModal = document.getElementById("resendModal")
  const closeModal = document.getElementById("closeModal")
  const confirmBtn = document.getElementById("confirmBtn")
  const resendBtn = document.getElementById("resendBtn")
  const successBtn = document.getElementById("successBtn")
  const resendOkBtn = document.getElementById("resendOkBtn")
  const passwordToggle = document.getElementById("passwordToggle")
  const passwordInput = document.getElementById("password")
  const timerElement = document.getElementById("timer")
  const userEmailSpan = document.getElementById("userEmail")
  const otpError = document.getElementById("otpError")

  let countdown = 300 // 5 minutes in seconds
  let timerInterval

  // Password toggle functionality
  passwordToggle.addEventListener("click", () => {
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
    passwordInput.setAttribute("type", type)

    // Update the icon
    const icon = passwordToggle.querySelector(".material-symbols-outlined")
    icon.textContent = type === "password" ? "visibility" : "visibility_off"
  })

  // Form validation
  const inputs = signupForm.querySelectorAll("input[required]")

  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  // Strong password validation
  function validatePassword(password) {
    const minLength = 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    }
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

  // Show/hide OTP error
  function showOtpError(message) {
    otpError.textContent = message
    otpError.style.display = "block"
  }

  function hideOtpError() {
    otpError.style.display = "none"
  }

  // Real-time validation
  inputs.forEach((input) => {
    input.addEventListener("blur", function () {
      validateField(this)
    })

    input.addEventListener("input", function () {
      if (this.classList.contains("input-error")) {
        validateField(this)
      }

      // Real-time password validation
      if (this.id === "password") {
        updatePasswordStrength(this.value)
      }
    })

    // Add Enter key support for form inputs
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        signupForm.dispatchEvent(new Event("submit"))
      }
    })
  })

  function validateField(input) {
    const value = input.value.trim()

    switch (input.id) {
      case "firstName":
      case "lastName":
        if (!value) {
          showError(input, `Please enter your ${input.id === "firstName" ? "first" : "last"} name`)
          return false
        }
        break
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
          showError(input, "Please enter a password")
          return false
        } else {
          const passwordCheck = validatePassword(value)
          if (!passwordCheck.isValid) {
            const errorMsg = "Password must contain: "
            const requirements = []
            if (!passwordCheck.minLength) requirements.push("8+ characters")
            if (!passwordCheck.hasUpperCase) requirements.push("uppercase letter")
            if (!passwordCheck.hasLowerCase) requirements.push("lowercase letter")
            if (!passwordCheck.hasNumbers) requirements.push("number")
            if (!passwordCheck.hasSpecialChar) requirements.push("special character")

            showError(input, errorMsg + requirements.join(", "))
            return false
          }
        }
        break
    }

    hideError(input)
    return true
  }

  // Password strength indicator
  function updatePasswordStrength(password) {
    const passwordCheck = validatePassword(password)
    const strengthIndicator = document.getElementById("passwordStrength")

    if (!strengthIndicator) {
      // Create password strength indicator if it doesn't exist
      const indicator = document.createElement("div")
      indicator.id = "passwordStrength"
      indicator.className = "password-strength"
      passwordInput.parentNode.appendChild(indicator)
    }

    const indicator = document.getElementById("passwordStrength")

    if (password.length === 0) {
      indicator.style.display = "none"
      return
    }

    indicator.style.display = "block"

    let strength = 0
    let strengthText = ""
    let strengthClass = ""

    if (passwordCheck.minLength) strength++
    if (passwordCheck.hasUpperCase) strength++
    if (passwordCheck.hasLowerCase) strength++
    if (passwordCheck.hasNumbers) strength++
    if (passwordCheck.hasSpecialChar) strength++

    switch (strength) {
      case 0:
      case 1:
        strengthText = "Very Weak"
        strengthClass = "very-weak"
        break
      case 2:
        strengthText = "Weak"
        strengthClass = "weak"
        break
      case 3:
        strengthText = "Fair"
        strengthClass = "fair"
        break
      case 4:
        strengthText = "Good"
        strengthClass = "good"
        break
      case 5:
        strengthText = "Strong"
        strengthClass = "strong"
        break
    }

    indicator.innerHTML = `
      <div class="strength-bar">
        <div class="strength-fill ${strengthClass}" style="width: ${(strength / 5) * 100}%"></div>
      </div>
      <span class="strength-text ${strengthClass}">${strengthText}</span>
    `
  }

  // Modal functions
  function showEmailModal(email) {
    userEmailSpan.textContent = email
    emailModal.classList.add("active")
    hideOtpError() // Hide any previous OTP errors
    startTimer()
    otpInputs[0].focus()
  }

  function showSuccessModal() {
    successModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function hideSuccessModal() {
    successModal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  function showResendModal() {
    resendModal.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function hideResendModal() {
    resendModal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Success modal event listeners
  successBtn.addEventListener("click", () => {
    hideSuccessModal()
    setTimeout(() => {
      window.location.href = "/sign-in"
    }, 300)
  })

  // Resend modal event listeners
  resendOkBtn.addEventListener("click", () => {
    hideResendModal()
    setTimeout(() => {
      otpInputs[0].focus()
    }, 300)
  })

  // Modal close handlers
  closeModal.addEventListener("click", () => {
    emailModal.classList.remove("active")
    resetModal()
  })

  emailModal.addEventListener("click", (e) => {
    if (e.target === emailModal) {
      emailModal.classList.remove("active")
      resetModal()
    }
  })

  successModal.addEventListener("click", (e) => {
    if (e.target === successModal) {
      hideSuccessModal()
      setTimeout(() => {
        window.location.href = "/sign-in"
      }, 300)
    }
  })

  resendModal.addEventListener("click", (e) => {
    if (e.target === resendModal) {
      hideResendModal()
      setTimeout(() => {
        otpInputs[0].focus()
      }, 300)
    }
  })

  // OTP input handling
  const otpInputs = document.querySelectorAll(".otp-input")
  otpInputs.forEach((input, index) => {
    input.addEventListener("input", (e) => {
      e.target.value = e.target.value.replace(/[^0-9]/g, "")

      // Hide OTP error when user starts typing
      hideOtpError()

      if (e.target.value.length === 1 && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus()
      }
    })

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && e.target.value === "" && index > 0) {
        otpInputs[index - 1].focus()
      }
      // Add Enter key support for OTP confirmation
      if (e.key === "Enter") {
        e.preventDefault()
        confirmOTP()
      }
    })
  })

  // Timer function
  function startTimer() {
    clearInterval(timerInterval)
    countdown = 300

    timerInterval = setInterval(() => {
      const minutes = Math.floor(countdown / 60)
      const seconds = countdown % 60
      timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`

      if (countdown <= 0) {
        clearInterval(timerInterval)
        timerElement.textContent = "0:00"
        timerElement.style.color = "#EF4444"
        showOtpError("OTP has expired. Please request a new one.")
      }
      countdown--
    }, 1000)
  }

  function resetModal() {
    otpInputs.forEach((input) => (input.value = ""))
    hideOtpError()
    clearInterval(timerInterval)
    countdown = 300
    timerElement.style.color = "#8B0000"
    timerElement.textContent = "5:00"
  }

  // Confirm OTP function
  function confirmOTP() {
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("")

    if (otp.length !== 4) {
      showOtpError("Please enter all 4 digits")
      otpInputs.forEach((input) => {
        if (!input.value) {
          input.style.borderColor = "#ef4444"
        }
      })

      setTimeout(() => {
        otpInputs.forEach((input) => {
          input.style.borderColor = ""
        })
      }, 2000)

      otpInputs[0].focus()
      return
    }

    confirmBtn.textContent = "Verifying..."
    confirmBtn.disabled = true

    const email = userEmailSpan.textContent

    fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false

        if (data.success) {
          emailModal.classList.remove("active")
          resetModal()
          showSuccessModal()
          signupForm.reset()
          // Clear password strength indicator
          const strengthIndicator = document.getElementById("passwordStrength")
          if (strengthIndicator) {
            strengthIndicator.style.display = "none"
          }
        } else {
          // Show error below OTP inputs instead of alert
          showOtpError(data.message || "Invalid OTP. Please try again.")
          otpInputs[0].focus()
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false
        showOtpError("An error occurred. Please try again.")
      })
  }

  confirmBtn.addEventListener("click", confirmOTP)

  // Resend OTP
  resendBtn.addEventListener("click", () => {
    resendBtn.textContent = "Sending..."
    resendBtn.disabled = true

    const email = userEmailSpan.textContent

    fetch("/api/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        resetModal()
        startTimer()
        resendBtn.textContent = "Resend"
        resendBtn.disabled = false
        showResendModal()
      })
      .catch((error) => {
        console.error("Error:", error)
        resendBtn.textContent = "Resend"
        resendBtn.disabled = false
        showOtpError("Failed to resend OTP. Please try again.")
      })
  })

  // Form submission - FIXED
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault()

    // Clear any existing email error first
    hideError(document.getElementById("email"))

    let isValid = true
    inputs.forEach((input) => {
      if (!validateField(input)) {
        isValid = false
      }
    })

    if (isValid) {
      const submitBtn = signupForm.querySelector(".signup-btn")
      const originalText = submitBtn.textContent
      submitBtn.textContent = "Sending OTP..."
      submitBtn.disabled = true

      const formData = new FormData(signupForm)
      const userData = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        password: formData.get("password"),
      }

      fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })
        .then((response) => response.json())
        .then((data) => {
          submitBtn.textContent = originalText
          submitBtn.disabled = false

          if (data.success) {
            // Show OTP modal for verification
            const email = document.getElementById("email").value
            showEmailModal(email)
          } else {
            // Show error below email field instead of popup
            if (
              data.message.toLowerCase().includes("email already exists") ||
              data.message.toLowerCase().includes("email exists")
            ) {
              showError(document.getElementById("email"), "This email is already registered")
            } else {
              // For other errors, show a general message
              alert(data.message || "Registration failed. Please try again.")
            }
          }
        })
        .catch((error) => {
          console.error("Error:", error)
          submitBtn.textContent = originalText
          submitBtn.disabled = false
          alert("An error occurred. Please try again.")
        })
    }
  })

  // Global Enter key support for modals
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      // Success modal - Continue button
      if (successModal.classList.contains("show")) {
        e.preventDefault()
        successBtn.click()
      }
      // Resend modal - OK button
      else if (resendModal.classList.contains("show")) {
        e.preventDefault()
        resendOkBtn.click()
      }
    }

    if (e.key === "Escape") {
      if (successModal.classList.contains("show")) {
        hideSuccessModal()
        setTimeout(() => {
          window.location.href = "/sign-in"
        }, 300)
      }
      if (resendModal.classList.contains("show")) {
        hideResendModal()
        setTimeout(() => {
          otpInputs[0].focus()
        }, 300)
      }
    }
  })

  // Add focus to first input
  document.getElementById("firstName").focus()
})
