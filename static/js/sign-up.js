// Password toggle functionality
const passwordToggle = document.getElementById("passwordToggle")
const passwordInput = document.getElementById("password")

passwordToggle.addEventListener("click", () => {
  const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
  passwordInput.setAttribute("type", type)

  // Update the icon
  const icon = passwordToggle.querySelector(".material-symbols-outlined")
  icon.textContent = type === "password" ? "visibility" : "visibility_off"
})

// Form validation
const form = document.getElementById("signupForm")
const inputs = form.querySelectorAll("input[required]")

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

function validatePassword(password) {
  return password.length >= 8
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

// Real-time validation
inputs.forEach((input) => {
  input.addEventListener("blur", function () {
    validateField(this)
  })

  input.addEventListener("input", function () {
    if (this.classList.contains("input-error")) {
      validateField(this)
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
      } else if (!validatePassword(value)) {
        showError(input, "Password must be at least 8 characters")
        return false
      }
      break
  }

  hideError(input)
  return true
}

// Email Modal functionality
const emailModal = document.getElementById("emailModal")
const closeModal = document.getElementById("closeModal")
const confirmBtn = document.getElementById("confirmBtn")
const resendBtn = document.getElementById("resendBtn")
const otpInputs = document.querySelectorAll(".otp-input")
const timerElement = document.getElementById("timer")
const userEmailSpan = document.getElementById("userEmail")

// Success Modal functionality
const successModal = document.getElementById("successModal")
const successBtn = document.getElementById("successBtn")

// Resend Modal functionality
const resendModal = document.getElementById("resendModal")
const resendOkBtn = document.getElementById("resendOkBtn")

let countdown = 300 // 5 minutes in seconds
let timerInterval

// Show email modal function
function showEmailModal(email) {
  userEmailSpan.textContent = email
  emailModal.classList.add("active")
  startTimer()
  otpInputs[0].focus()
}

// Show success modal function
function showSuccessModal() {
  successModal.classList.add("show")
  document.body.style.overflow = "hidden"
}

// Hide success modal function
function hideSuccessModal() {
  successModal.classList.remove("show")
  document.body.style.overflow = "auto"
}

// Show resend modal function
function showResendModal() {
  resendModal.classList.add("show")
  document.body.style.overflow = "hidden"
}

// Hide resend modal function
function hideResendModal() {
  resendModal.classList.remove("show")
  document.body.style.overflow = "auto"
}

// Success modal event listeners
successBtn.addEventListener("click", () => {
  hideSuccessModal()
  // Redirect to sign-in page
  setTimeout(() => {
    window.location.href = "sign-in.html"
  }, 300)
})

// Resend modal event listeners
resendOkBtn.addEventListener("click", () => {
  hideResendModal()
  // Focus back to first OTP input
  setTimeout(() => {
    otpInputs[0].focus()
  }, 300)
})

// Close resend modal when clicking overlay
resendModal.addEventListener("click", (e) => {
  if (e.target === resendModal) {
    hideResendModal()
    setTimeout(() => {
      otpInputs[0].focus()
    }, 300)
  }
})

// Close modal when clicking overlay
successModal.addEventListener("click", (e) => {
  if (e.target === successModal) {
    hideSuccessModal()
    setTimeout(() => {
      window.location.href = "sign-in.html"
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

// Close email modal
closeModal.addEventListener("click", () => {
  emailModal.classList.remove("active")
  resetModal()
})

// Close email modal when clicking outside
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

    if (e.target.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus()
    }
  })

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && e.target.value === "" && index > 0) {
      otpInputs[index - 1].focus()
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
    }
    countdown--
  }, 1000)
}

// Reset modal
function resetModal() {
  otpInputs.forEach((input) => (input.value = ""))
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
  if (otp.length === 4) {
    confirmBtn.textContent = "Verifying..."
    confirmBtn.disabled = true

    // Send OTP verification request to server
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
        // Hide email modal
        emailModal.classList.remove("active")
        resetModal()
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false

        if (data.success) {
          // Show success modal
          showSuccessModal()
          // Reset form
          form.reset()
        } else {
          alert(data.message || "Invalid OTP. Please try again.")
          otpInputs[0].focus()
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        confirmBtn.textContent = "Confirm"
        confirmBtn.disabled = false
        alert("An error occurred. Please try again.")
      })
  } else {
    // Show error for incomplete OTP
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
  }
}

// Confirm OTP
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

      // Show resend success modal
      showResendModal()
    })
    .catch((error) => {
      console.error("Error:", error)
      resendBtn.textContent = "Resend"
      resendBtn.disabled = false
      alert("An error occurred. Please try again.")
    })
})

// Form submission
form.addEventListener("submit", (e) => {
  e.preventDefault()

  let isValid = true
  inputs.forEach((input) => {
    if (!validateField(input)) {
      isValid = false
    }
  })

  if (isValid) {
    const formData = new FormData(form)
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
        if (data.success) {
          const email = document.getElementById("email").value
          showEmailModal(email)
        } else {
          alert(data.message || "Registration failed. Please try again.")
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        alert("An error occurred. Please try again.")
      })
  }
})

// Close modals with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (successModal.classList.contains("show")) {
      hideSuccessModal()
      setTimeout(() => {
        window.location.href = "sign-in.html"
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

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  console.log("Diabetech Sign Up Page loaded successfully!")

  // Add focus to first input
  document.getElementById("firstName").focus()
})
