// Email Modal functionality
const emailModal = document.getElementById("emailModal")
const closeModal = document.getElementById("closeModal")
const confirmBtn = document.getElementById("confirmBtn")
const resendBtn = document.getElementById("resendBtn")
const otpInputs = document.querySelectorAll(".otp-input")
const timerElement = document.getElementById("timer")
const userEmailSpan = document.getElementById("userEmail")
const otpError = document.getElementById("otpError")
const otpNotification = document.getElementById("otpNotification")

let countdown = 300 // 5 minutes in seconds
let timerInterval
let currentToken = null // Store the token for OTP verification
let currentPurpose = "verification" // Track the purpose: 'verification' or 'password_change'

// Show/hide OTP error
function showOtpError(message) {
  if (otpError) {
    otpError.textContent = message
    otpError.style.display = "block"
  }
}

function hideOtpError() {
  if (otpError) {
    otpError.style.display = "none"
  }
}

// Show OTP resent notification
function showOtpResentNotification() {
  if (otpNotification) {
    const modalContent = document.querySelector(".modal-content")
    modalContent.classList.add("notification-active")
    otpNotification.classList.add("show")

    // Hide notification after 3 seconds
    setTimeout(() => {
      hideOtpResentNotification()
    }, 3000)
  }
}

function hideOtpResentNotification() {
  if (otpNotification) {
    const modalContent = document.querySelector(".modal-content")
    modalContent.classList.remove("notification-active")
    otpNotification.classList.remove("show")
  }
}

// Show modal function - only for registration and password reset
function showEmailModal(email, token = null, purpose = "verification") {
  // Only handle verification and password_reset, not password_change
  if (purpose !== "verification" && purpose !== "password_reset") {
    console.warn("Email modal only supports 'verification' and 'password_reset' purposes")
    return
  }

  userEmailSpan.textContent = email
  currentToken = token
  currentPurpose = purpose
  emailModal.classList.add("active")
  hideOtpError()
  hideOtpResentNotification()
  startTimer()
  otpInputs[0].focus()

  // Update modal header based on purpose
  const modalHeader = document.querySelector(".modal-header h2")
  const modalDescription = document.querySelector(".modal-header p")

  if (purpose === "password_reset") {
    modalHeader.textContent = "Password Reset Confirmation"
    modalDescription.innerHTML = `Enter the OTP sent to <span id="userEmail">${email}</span><br>to confirm your password reset.`
  } else {
    modalHeader.textContent = "Email Confirmation"
    modalDescription.innerHTML = `Enter the OTP sent to <span id="userEmail">${email}</span><br>to confirm your identity.`
  }
}

// Close modal
closeModal.addEventListener("click", () => {
  emailModal.classList.remove("active")
  resetModal()
})

// Close modal when clicking outside
emailModal.addEventListener("click", (e) => {
  if (e.target === emailModal) {
    emailModal.classList.remove("active")
    resetModal()
  }
})

// OTP input handling
otpInputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, "")

    // Hide OTP error when user starts typing
    hideOtpError()

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
    // Add Enter key support for OTP confirmation
    if (e.key === "Enter") {
      e.preventDefault()
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

// Reset modal
function resetModal() {
  otpInputs.forEach((input) => (input.value = ""))
  hideOtpError()
  hideOtpResentNotification()
  clearInterval(timerInterval)
  countdown = 300
  timerElement.style.color = "#8B0000"
  timerElement.textContent = "5:00"
  currentToken = null // Clear the token
  currentPurpose = "verification" // Reset purpose
}

// Confirm OTP function - only for registration and password reset
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

  // Only use verify-otp endpoint for registration and password reset
  fetch("/api/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email,
      otp: otp,
      token: currentToken,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      confirmBtn.textContent = "Confirm"
      confirmBtn.disabled = false

      if (data.success) {
        emailModal.classList.remove("active")
        resetModal()

        if (currentPurpose === "password_reset") {
          // Handle password reset success
          if (window.handlePasswordResetSuccess) {
            window.handlePasswordResetSuccess()
          }
        } else {
          // Handle registration success
          if (window.showSuccessModal) {
            window.showSuccessModal()
          } else {
            alert("Account created successfully!")
            window.location.href = "/sign-in"
          }
        }
      } else {
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

// Confirm OTP
confirmBtn.addEventListener("click", confirmOTP)

// Resend OTP with notification
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
      purpose: currentPurpose,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      resetModal()
      startTimer()
      resendBtn.textContent = "Resend"
      resendBtn.disabled = false

      if (data.success) {
        // Show the green notification
        showOtpResentNotification()
        console.log("✅ OTP Resent successfully!")
        if (data.development_otp) {
          console.log(`🔐 Development OTP: ${data.development_otp}`)
        }
        if (data.token) {
          currentToken = data.token
        }
      } else {
        showOtpError(data.message || "Failed to resend OTP. Please try again.")
      }

      setTimeout(() => {
        otpInputs[0].focus()
      }, 100)
    })
    .catch((error) => {
      console.error("Error:", error)
      resendBtn.textContent = "Resend"
      resendBtn.disabled = false
      showOtpError("Failed to resend OTP. Please try again.")
    })
})

// Export function for use in other files
window.showEmailModal = showEmailModal
