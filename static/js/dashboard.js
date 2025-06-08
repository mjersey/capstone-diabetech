document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const sidebar = document.getElementById("sidebar")
  const signOutBtn = document.getElementById("signOutBtn")
  const modalOverlay = document.getElementById("modalOverlay")
  const modalCancel = document.getElementById("modalCancel")
  const modalConfirm = document.getElementById("modalConfirm")
  const navItems = document.querySelectorAll(".nav-item:not(#signOutBtn)")

  // Profile modal elements
  const userProfile = document.getElementById("userProfile")
  const profileModalOverlay = document.getElementById("profileModalOverlay")
  const profileCloseBtn = document.getElementById("profileCloseBtn")

  // Profile modal functionality
  userProfile.addEventListener("click", () => {
    showProfileModal()
  })

  profileCloseBtn.addEventListener("click", hideProfileModal)

  profileModalOverlay.addEventListener("click", (e) => {
    if (e.target === profileModalOverlay) {
      hideProfileModal()
    }
  })

  function showProfileModal() {
    profileModalOverlay.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function hideProfileModal() {
    profileModalOverlay.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Edit Profile functionality
  const editProfileBtn = document.getElementById("editProfileBtn")

  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", () => {
      toggleEditMode()
    })
  }

  function toggleEditMode() {
    const inputs = document.querySelectorAll('.profile-form input:not([type="password"])')
    const editBtn = document.getElementById("editProfileBtn")
    const isEditing = editBtn.textContent === "Save Changes"

    if (isEditing) {
      // Save mode - collect form data and send to backend
      const formData = {
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        emailAddress: document.getElementById("emailAddress").value,
        contactNumber: document.getElementById("contactNumber").value,
      }

      // Send data to backend
      fetch("/api/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Update UI to read-only mode
            inputs.forEach((input) => {
              input.readOnly = true
              input.style.backgroundColor = "#f3f4f6"
              input.style.color = "#6b7280"
            })
            editBtn.textContent = "Edit Profile"
            editBtn.style.backgroundColor = "#dc2626"

            // Update profile name in header
            const profileName = document.querySelector(".profile-name")
            if (profileName) {
              profileName.textContent = `${formData.firstName} ${formData.lastName}`
            }

            showProfileSuccessNotification("Profile updated successfully!")
          } else {
            showNotification(data.message || "Failed to update profile", "error")
          }
        })
        .catch((error) => {
          console.error("Error updating profile:", error)
          showNotification("An error occurred while updating profile", "error")
        })
    } else {
      // Edit mode
      inputs.forEach((input) => {
        if (input.id !== "emailAddress") {
          // Keep email readonly for security
          input.readOnly = false
          input.style.backgroundColor = "white"
          input.style.color = "#1f2937"
        }
      })
      editBtn.textContent = "Save Changes"
      editBtn.style.backgroundColor = "#059669"
    }
  }

  // Password change functionality
  const changePasswordBtn = document.getElementById("changePasswordBtn")

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      initiatePasswordChange()
    })
  }

  // Password change functionality - separate from existing email modal
  function initiatePasswordChange() {
    const userEmail = document.getElementById("emailAddress").value

    // Send request to initiate password change
    fetch("/api/initiate-password-change", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: userEmail,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Show password change modal (separate from registration email modal)
          showPasswordChangeModal(userEmail, data.token)
          console.log("✅ Password change OTP sent!")
          if (data.development_otp) {
            console.log(`🔐 Development OTP: ${data.development_otp}`)
          }
        } else {
          showNotification(data.message || "Failed to initiate password change", "error")
        }
      })
      .catch((error) => {
        console.error("Error initiating password change:", error)
        showNotification("An error occurred while initiating password change", "error")
      })
  }

  // Create separate password change modal function
  function showPasswordChangeModal(email, token) {
    // Create a simple password change modal instead of reusing the email modal
    const modalHtml = `
    <div class="modal-overlay password-change-modal" id="passwordChangeModal">
      <div class="modal-content" style="max-width: 400px; text-align: center;">
        <button class="modal-close" onclick="hidePasswordChangeModal()">
          <span class="material-symbols-outlined">close</span>
        </button>
        
        <div class="modal-header">
          <h2>Password Change Confirmation</h2>
          <p>Enter the OTP sent to <span style="font-weight: 600;">${email}</span><br>to confirm your password change.</p>
        </div>
        
        <div class="otp-container" style="display: flex; gap: 15px; justify-content: center; margin-bottom: 20px;">
          <input type="text" class="otp-input" maxlength="1" style="width: 60px; height: 60px; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; font-size: 1.5rem; font-weight: 600;">
          <input type="text" class="otp-input" maxlength="1" style="width: 60px; height: 60px; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; font-size: 1.5rem; font-weight: 600;">
          <input type="text" class="otp-input" maxlength="1" style="width: 60px; height: 60px; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; font-size: 1.5rem; font-weight: 600;">
          <input type="text" class="otp-input" maxlength="1" style="width: 60px; height: 60px; border: 2px solid #e5e7eb; border-radius: 12px; text-align: center; font-size: 1.5rem; font-weight: 600;">
        </div>
        
        <div class="error-message" id="passwordChangeError" style="color: #ef4444; font-size: 0.85rem; margin-bottom: 10px; display: none;"></div>
        
        <button class="confirm-btn" onclick="confirmPasswordChangeOTP('${email}', '${token}')" style="width: 100%; background: #dc2626; color: white; border: none; padding: 16px; border-radius: 100px; font-size: 1.1rem; font-weight: 600; cursor: pointer; margin-bottom: 20px;">Confirm</button>
      </div>
    </div>
  `

    // Remove existing password change modal if any
    const existingModal = document.getElementById("passwordChangeModal")
    if (existingModal) {
      existingModal.remove()
    }

    // Add modal to body
    document.body.insertAdjacentHTML("beforeend", modalHtml)

    // Show modal
    const modal = document.getElementById("passwordChangeModal")
    modal.style.display = "flex"

    // Setup OTP input handling
    setupPasswordChangeOTPInputs()
  }

  function hidePasswordChangeModal() {
    const modal = document.getElementById("passwordChangeModal")
    if (modal) {
      modal.remove()
    }
  }

  function setupPasswordChangeOTPInputs() {
    const otpInputs = document.querySelectorAll("#passwordChangeModal .otp-input")

    otpInputs.forEach((input, index) => {
      input.addEventListener("input", (e) => {
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

    // Focus first input
    otpInputs[0].focus()
  }

  function confirmPasswordChangeOTP(email, token) {
    const otpInputs = document.querySelectorAll("#passwordChangeModal .otp-input")
    const otp = Array.from(otpInputs)
      .map((input) => input.value)
      .join("")
    const errorDiv = document.getElementById("passwordChangeError")

    if (otp.length !== 4) {
      errorDiv.textContent = "Please enter all 4 digits"
      errorDiv.style.display = "block"
      return
    }

    fetch("/api/verify-password-change-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        otp: otp,
        token: token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          hidePasswordChangeModal()
          handlePasswordChangeSuccess()
        } else {
          errorDiv.textContent = data.message || "Invalid OTP. Please try again."
          errorDiv.style.display = "block"
        }
      })
      .catch((error) => {
        console.error("Error:", error)
        errorDiv.textContent = "An error occurred. Please try again."
        errorDiv.style.display = "block"
      })
  }

  // Handle password change success
  window.handlePasswordChangeSuccess = () => {
    showProfileSuccessNotification("Password change confirmed! You can now update your password.")

    // Enable password field for editing
    const passwordField = document.getElementById("password")
    const changePasswordBtn = document.getElementById("changePasswordBtn")

    if (passwordField && changePasswordBtn) {
      passwordField.readOnly = false
      passwordField.value = ""
      passwordField.placeholder = "Enter new password"
      passwordField.type = "password"
      passwordField.style.backgroundColor = "white"
      passwordField.style.color = "#1f2937"

      changePasswordBtn.textContent = "Save"
      changePasswordBtn.onclick = saveNewPassword
    }
  }

  function saveNewPassword() {
    const newPassword = document.getElementById("password").value

    if (!newPassword || newPassword.length < 8) {
      showNotification("Password must be at least 8 characters long", "error")
      return
    }

    fetch("/api/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        new_password: newPassword,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          // Reset password field to masked state
          const passwordField = document.getElementById("password")
          const changePasswordBtn = document.getElementById("changePasswordBtn")

          passwordField.readOnly = true
          passwordField.value = "••••••••••••••••••••••••"
          passwordField.type = "password"
          passwordField.style.backgroundColor = "#f3f4f6"
          passwordField.style.color = "#6b7280"

          changePasswordBtn.textContent = "Change"
          changePasswordBtn.onclick = initiatePasswordChange

          showProfileSuccessNotification("Password updated successfully!")
        } else {
          showNotification(data.message || "Failed to update password", "error")
        }
      })
      .catch((error) => {
        console.error("Error updating password:", error)
        showNotification("An error occurred while updating password", "error")
      })
  }

  function showProfileSuccessNotification(message = "Profile updated successfully!") {
    const notification = document.getElementById("profileSuccessNotification")

    if (notification) {
      // Update message if provided
      const messageSpan = notification.querySelector("span")
      if (messageSpan) {
        messageSpan.textContent = message
      }

      // Show notification without affecting layout
      notification.classList.add("show")

      // Hide notification after 4 seconds
      setTimeout(() => {
        hideProfileSuccessNotification()
      }, 4000)
    }
  }

  function hideProfileSuccessNotification() {
    const notification = document.getElementById("profileSuccessNotification")

    if (notification) {
      notification.classList.remove("show")
    }
  }

  function showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification")
    existingNotifications.forEach((notif) => notif.remove())

    const notification = document.createElement("div")
    notification.className = "notification"
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 3000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
    `
    notification.textContent = message
    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)"
    }, 100)

    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 300)
    }, 4000)
  }

  // Navigation
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      navItems.forEach((nav) => nav.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Get the navigation text
      const navText = this.querySelector(".nav-text").textContent

      // Update page content based on navigation
      updatePageContent(navText)
    })
  })

  // Sign out functionality
  signOutBtn.addEventListener("click", () => {
    showModal()
  })

  modalCancel.addEventListener("click", hideModal)
  modalConfirm.addEventListener("click", () => {
    hideModal()
    signOut()
  })

  // Close modal when clicking overlay
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      hideModal()
    }
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (modalOverlay.classList.contains("show")) {
        hideModal()
      }
      if (profileModalOverlay.classList.contains("show")) {
        hideProfileModal()
      }
    }
  })

  // Modal functions
  function showModal() {
    modalOverlay.classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function hideModal() {
    modalOverlay.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Sign out function
  function signOut() {
    fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/sign-in"
        } else {
          console.error("Logout failed:", data.message)
          // Redirect anyway
          window.location.href = "/sign-in"
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error)
        // Redirect anyway
        window.location.href = "/sign-in"
      })
  }

  function updatePageContent(section) {
    console.log("Navigating to:", section)

    // Update page title in header
    document.querySelector(".page-title").textContent = section

    // Here you can implement different content for each section
    switch (section) {
      case "Dashboard":
        // Show dashboard content (already visible)
        break
      case "Prescription":
        // Load prescription management content
        break
      case "Patients":
        // Load patients list content
        break
      case "Analytics":
        // Load analytics content
        break
      case "Insights":
        // Load insights content
        break
      case "Settings":
        // Load settings content
        break
    }
  }

  // Search functionality
  const searchInput = document.querySelector(".search-input")
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()

      if (searchTerm.length > 2) {
        console.log("Searching for:", searchTerm)
        // Implement search functionality here
      }
    })
  }

  // Filter button functionality
  const filterBtn = document.querySelector(".filter-btn")
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      console.log("Filter clicked")
      // Implement filter functionality here
    })
  }

  // Add Patient button functionality
  const addPatientBtn = document.querySelector(".add-patient-btn")
  if (addPatientBtn) {
    addPatientBtn.addEventListener("click", () => {
      console.log("Add Patient clicked")
      // Implement add patient functionality here
    })
  }

  // Prescription item interactions
  const prescriptionItems = document.querySelectorAll(".prescription-item")
  prescriptionItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove selected class from all items
      prescriptionItems.forEach((p) => p.classList.remove("selected"))

      // Add selected class to clicked item
      this.classList.add("selected")

      const patientName = this.querySelector(".patient-name").textContent
      console.log("Selected patient:", patientName)

      // Implement patient details view here
    })
  })

  // Mobile sidebar toggle - only for mobile devices
  if (window.innerWidth <= 768) {
    // Close sidebar when clicking outside on mobile
    document.addEventListener("click", (e) => {
      if (window.innerWidth <= 768 && !sidebar.contains(e.target) && sidebar.classList.contains("open")) {
        sidebar.classList.remove("open")
      }
    })
  }

  // Handle window resize
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("open")
    }
  })

  // Simulate real-time data updates
  function updateStats() {
    const statValues = document.querySelectorAll(".stat-value")

    statValues.forEach((stat) => {
      const currentValue = Number.parseInt(stat.textContent)
      const change = Math.floor(Math.random() * 10) - 5 // -5 to +5
      const newValue = Math.max(0, currentValue + change)

      if (change !== 0) {
        stat.textContent = newValue

        // Add animation
        stat.style.transform = "scale(1.1)"
        setTimeout(() => {
          stat.style.transform = "scale(1)"
        }, 200)
      }
    })
  }

  // Update stats every 30 seconds
  setInterval(updateStats, 30000)

  console.log("Dashboard loaded successfully!")
})

// Add CSS for selected prescription item
const style = document.createElement("style")
style.textContent = `
    .prescription-item.selected {
        box-shadow: 0 0 0 2px #dc2626;
        transform: scale(1.02);
    }
    
    .prescription-item {
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .prescription-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .stat-value {
        transition: transform 0.2s ease;
    }
`
document.head.appendChild(style)
