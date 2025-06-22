document.addEventListener("DOMContentLoaded", () => {
    // Common Elements (reused from dashboard.js)
    const sidebar = document.getElementById("sidebar")
    const signOutBtn = document.getElementById("signOutBtn")
    const modalOverlay = document.getElementById("modalOverlay")
    const modalCancel = document.getElementById("modalCancel")
    const modalConfirm = document.getElementById("modalConfirm")
    const navItems = document.querySelectorAll(".sidebar-nav .nav-item") // Select all nav items in sidebar
  
    // Settings Page Specific Elements
    const settingsNavItems = document.querySelectorAll(".settings-nav-item")
    const settingsContentSections = document.querySelectorAll(".settings-details > .settings-card")
  
    const editPersonalInfoBtn = document.getElementById("editPersonalInfoBtn")
    const savePersonalInfoBtn = document.getElementById("savePersonalInfoBtn")
    const firstNameInput = document.getElementById("firstName")
    const lastNameInput = document.getElementById("lastName")
    const emailAddressInput = document.getElementById("emailAddress")
    const specializationInput = document.getElementById("specialization")
    const medicalLicenseInput = document.getElementById("medicalLicense")
  
    const changePasswordBtn = document.getElementById("changePasswordBtn")
    const savePasswordBtn = document.getElementById("savePasswordBtn")
    const currentPasswordInput = document.getElementById("currentPassword")
    const newPasswordInput = document.getElementById("newPassword")
    const confirmNewPasswordInput = document.getElementById("confirmNewPassword")
  
    const deleteAccountBtn = document.getElementById("deleteAccountBtn")
    const deleteAccountModalOverlay = document.getElementById("deleteAccountModalOverlay")
    const deleteAccountCancelBtn = document.getElementById("deleteAccountCancelBtn")
    const deleteAccountConfirmBtn = document.getElementById("deleteAccountConfirmBtn")
  
    // Profile Picture Upload Elements
    const profileAvatarContainer = document.getElementById("profileAvatarContainer")
    const profileAvatar = document.getElementById("profileAvatar")
    const profilePictureInput = document.getElementById("profilePictureInput")
  
    // Password Change OTP Modal Elements
    const passwordChangeModal = document.getElementById("passwordChangeModal")
    const passwordChangeModalCloseBtn = document.getElementById("passwordChangeModalCloseBtn")
    const otpEmailDisplay = document.getElementById("otpEmailDisplay")
    const otpInputs = passwordChangeModal ? passwordChangeModal.querySelectorAll(".otp-input") : []
    const passwordChangeError = document.getElementById("passwordChangeError")
    const confirmPasswordChangeOTPBtn = document.getElementById("confirmPasswordChangeOTPBtn")
    const resendPasswordChangeOTPBtn = document.getElementById("resendPasswordChangeOTPBtn")
  
    let currentPasswordChangeEmail = "" // To store email for password change flow
    let currentPasswordChangeToken = "" // To store token for password change flow
  
    // --- Common Functionality (adapted from dashboard.js) ---
  
    // Settings Page Specific Navigation (for the left sidebar within settings.html)
    settingsNavItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Remove active class from all settings nav items
        settingsNavItems.forEach((nav) => nav.classList.remove("active"))
        // Add active class to the clicked item
        this.classList.add("active")
  
        const sectionName = this.textContent.trim()
        updateSettingsContent(sectionName)
      })
    })
  
    // Function to update the content based on the selected settings section
    function updateSettingsContent(sectionName) {
      // Update the main page title with breadcrumb
      const pageTitle = document.querySelector("#pageTitle")
      if (pageTitle) {
        switch (sectionName) {
          case "My Profile":
            pageTitle.textContent = "Settings - My Profile"
            break
          case "Account Security":
            pageTitle.textContent = "Settings - Security"
            break
          case "Clinical Settings":
            pageTitle.textContent = "Settings - Clinical Settings"
            break
          case "E-Prescription":
            pageTitle.textContent = "Settings - E-Prescription"
            break
          case "Notification":
            pageTitle.textContent = "Settings - Notification"
            break
          case "Support":
            pageTitle.textContent = "Settings - Support"
            break
          default:
            pageTitle.textContent = "Settings - My Profile"
            break
        }
      }
  
      // Hide all content sections first
      settingsContentSections.forEach((section) => {
        section.style.display = "none"
      })
  
      // Show the relevant section based on the clicked item
      switch (sectionName) {
        case "My Profile":
          document.getElementById("personalInfoSection").style.display = "block"
          document.getElementById("passwordSection").style.display = "block"
          document.getElementById("deleteAccountSection").style.display = "block"
          break
        case "Account Security":
          document.getElementById("accountSecuritySection").style.display = "block"
          break
        case "Clinical Settings":
          // Add logic to show Clinical Settings section
          break
        case "E-Prescription":
          // Add logic to show E-Prescription section
          break
        case "Notification":
          // Add logic to show Notification section
          break
        case "Support":
          // Add logic to show Support section
          break
        default:
          // Default to My Profile if no match
          document.getElementById("personalInfoSection").style.display = "block"
          document.getElementById("passwordSection").style.display = "block"
          document.getElementById("deleteAccountSection").style.display = "block"
          break
      }
    }
  
    // Set 'Settings' as active in the main sidebar on load (for consistency across pages)
    const currentPath = window.location.pathname
    navItems.forEach((item) => {
      const link = item.querySelector("a")
      if (link && link.getAttribute("href") === currentPath) {
        item.classList.add("active")
      }
    })
  
    // Activate "My Profile" and show its content on settings page load
    const myProfileNavItem = document.querySelector(".settings-nav-item.active")
    if (myProfileNavItem) {
      updateSettingsContent(myProfileNavItem.textContent.trim())
    } else if (settingsNavItems.length > 0) {
      // Fallback: if no active class, activate the first item ("My Profile")
      settingsNavItems[0].classList.add("active")
      updateSettingsContent(settingsNavItems[0].textContent.trim())
    }
  
    // Sign out functionality
    signOutBtn.addEventListener("click", () => {
      showModal(modalOverlay)
    })
  
    modalCancel.addEventListener("click", () => hideModal(modalOverlay))
    modalConfirm.addEventListener("click", () => {
      hideModal(modalOverlay)
      signOut()
    })
  
    // Close modal when clicking overlay
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) {
        hideModal(modalOverlay)
      }
    })
  
    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (modalOverlay.classList.contains("show")) {
          hideModal(modalOverlay)
        }
        if (passwordChangeModal && passwordChangeModal.classList.contains("show")) {
          hidePasswordChangeModal()
        }
        if (deleteAccountModalOverlay && deleteAccountModalOverlay.classList.contains("show")) {
          hideModal(deleteAccountModalOverlay)
        }
      }
    })
  
    // Generic Modal functions
    function showModal(overlayElement) {
      overlayElement.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  
    function hideModal(overlayElement) {
      overlayElement.classList.remove("show")
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
            window.location.href = "/sign-in" // Redirect anyway
          }
        })
        .catch((error) => {
          console.error("Error during logout:", error)
          window.location.href = "/sign-in" // Redirect anyway
        })
    }
  
    // --- Settings Page Specific Functionality ---
  
    // Personal Information Edit/Save
    if (editPersonalInfoBtn && savePersonalInfoBtn) {
      editPersonalInfoBtn.addEventListener("click", () => togglePersonalInfoEditMode(true))
      savePersonalInfoBtn.addEventListener("click", () => togglePersonalInfoEditMode(false))
    }
  
    function togglePersonalInfoEditMode(isEditing) {
      const inputs = [firstNameInput, lastNameInput, specializationInput, medicalLicenseInput]
  
      if (isEditing) {
        inputs.forEach((input) => {
          if (input) {
            input.readOnly = false
            input.style.backgroundColor = "white"
            input.style.color = "#1f2937"
          }
        })
        editPersonalInfoBtn.style.display = "none"
        savePersonalInfoBtn.style.display = "block"
      } else {
        // Save changes
        const formData = {
          firstName: firstNameInput.value,
          lastName: lastNameInput.value,
          specialization: specializationInput.value,
          medicalLicense: medicalLicenseInput.value,
        }
  
        fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showNotification("Profile updated successfully!", "success")
              // Update UI to read-only mode
              inputs.forEach((input) => {
                if (input) {
                  input.readOnly = true
                  input.style.backgroundColor = "#f3f4f6"
                  input.style.color = "#6b7280"
                }
              })
              editPersonalInfoBtn.style.display = "block"
              savePersonalInfoBtn.style.display = "none"
  
              // Update user name in header if applicable (assuming userProfile is still there)
              const userProfileName = document.querySelector("#userProfile + .user-name")
              if (userProfileName) {
                userProfileName.textContent = `${formData.firstName} ${formData.lastName}`
              }
            } else {
              showNotification(data.message || "Failed to update profile", "error")
            }
          })
          .catch((error) => {
            console.error("Error updating profile:", error)
            showNotification("An error occurred while updating profile", "error")
          })
      }
    }
  
    // Profile Picture Upload
    if (profileAvatarContainer && profilePictureInput && profileAvatar) {
      profileAvatarContainer.addEventListener("click", () => {
        profilePictureInput.click()
      })
  
      profilePictureInput.addEventListener("change", (event) => {
        const file = event.target.files[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            profileAvatar.src = e.target.result
          }
          reader.readAsDataURL(file)
  
          // Simulate upload to backend
          const formData = new FormData()
          formData.append("profile_picture", file)
  
          fetch("/api/upload-profile-picture", {
            method: "POST",
            body: formData,
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                showNotification("Profile picture uploaded (simulated)!", "success")
                // In a real app, you'd update profileAvatar.src with data.imageUrl
              } else {
                showNotification(data.message || "Failed to upload picture", "error")
              }
            })
            .catch((error) => {
              console.error("Error uploading profile picture:", error)
              showNotification("An error occurred during picture upload", "error")
            })
        }
      })
    }
  
    // Password Change Flow
    if (changePasswordBtn && savePasswordBtn) {
      changePasswordBtn.addEventListener("click", initiatePasswordChange)
      savePasswordBtn.addEventListener("click", saveNewPassword)
    }
  
    function initiatePasswordChange() {
      const userEmail = emailAddressInput.value // Get email from the profile section
  
      fetch("/api/initiate-password-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            currentPasswordChangeEmail = userEmail
            currentPasswordChangeToken = data.token
            showPasswordChangeOTPModal(userEmail)
            showNotification(data.message, "success")
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
  
    function showPasswordChangeOTPModal(email) {
      otpEmailDisplay.textContent = email
      otpInputs.forEach((input) => (input.value = "")) // Clear previous OTP
      passwordChangeError.style.display = "none" // Hide error
      showModal(passwordChangeModal)
      if (otpInputs.length > 0) otpInputs[0].focus()
    }
  
    function hidePasswordChangeModal() {
      hideModal(passwordChangeModal)
    }
  
    if (passwordChangeModalCloseBtn) {
      passwordChangeModalCloseBtn.addEventListener("click", hidePasswordChangeModal)
    }
  
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
  
    if (confirmPasswordChangeOTPBtn) {
      confirmPasswordChangeOTPBtn.addEventListener("click", () => {
        const otp = Array.from(otpInputs)
          .map((input) => input.value)
          .join("")
        if (otp.length !== 4) {
          passwordChangeError.textContent = "Please enter all 4 digits."
          passwordChangeError.style.display = "block"
          return
        }
  
        fetch("/api/verify-password-change-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentPasswordChangeEmail,
            otp: otp,
            token: currentPasswordChangeToken,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              hidePasswordChangeModal()
              handlePasswordChangeSuccess()
              showNotification("OTP verified. You can now set your new password.", "success")
            } else {
              passwordChangeError.textContent = data.message || "Invalid OTP. Please try again."
              passwordChangeError.style.display = "block"
            }
          })
          .catch((error) => {
            console.error("Error verifying OTP:", error)
            passwordChangeError.textContent = "An error occurred. Please try again."
            passwordChangeError.style.display = "block"
          })
      })
    }
  
    if (resendPasswordChangeOTPBtn) {
      resendPasswordChangeOTPBtn.addEventListener("click", () => {
        fetch("/api/resend-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: currentPasswordChangeEmail }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showNotification("New OTP sent!", "success")
              if (data.development_otp) {
                console.log(`🔐 Development OTP: ${data.development_otp}`)
              }
              // Update token if a new one is sent
              if (data.token) {
                currentPasswordChangeToken = data.token
              }
              otpInputs.forEach((input) => (input.value = "")) // Clear inputs
              if (otpInputs.length > 0) otpInputs[0].focus()
              passwordChangeError.style.display = "none"
            } else {
              showNotification(data.message || "Failed to resend OTP", "error")
            }
          })
          .catch((error) => {
            console.error("Error resending OTP:", error)
            showNotification("An error occurred while resending OTP", "error")
          })
      })
    }
  
    function handlePasswordChangeSuccess() {
      // Enable new password fields
      newPasswordInput.disabled = false
      confirmNewPasswordInput.disabled = false
      newPasswordInput.value = "" // Clear placeholder
      confirmNewPasswordInput.value = "" // Clear placeholder
      newPasswordInput.style.backgroundColor = "white"
      confirmNewPasswordInput.style.backgroundColor = "white"
      newPasswordInput.style.color = "#1f2937"
      confirmNewPasswordInput.style.color = "#1f2937"
  
      // Hide change button, show save button
      changePasswordBtn.style.display = "none"
      savePasswordBtn.style.display = "block"
    }
  
    function saveNewPassword() {
      const newPass = newPasswordInput.value
      const confirmNewPass = confirmNewPasswordInput.value
  
      if (newPass.length < 8) {
        showNotification("Password must be at least 8 characters long.", "error")
        return
      }
      if (newPass !== confirmNewPass) {
        showNotification("New passwords do not match.", "error")
        return
      }
  
      fetch("/api/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentPasswordChangeEmail, // Use the email from the OTP flow
          new_password: newPass,
          token: currentPasswordChangeToken, // Pass token if backend requires it for final update
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            showNotification("Password updated successfully!", "success")
            // Reset password fields to read-only/masked state
            currentPasswordInput.value = "••••••••••••••••••••••••"
            newPasswordInput.value = ""
            confirmNewPasswordInput.value = ""
            newPasswordInput.disabled = true
            confirmNewPasswordInput.disabled = true
            newPasswordInput.style.backgroundColor = "#f3f4f6"
            confirmNewPasswordInput.style.backgroundColor = "#f3f4f6"
            newPasswordInput.style.color = "#6b7280"
            confirmNewPasswordInput.style.color = "#6b7280"
  
            // Show change button, hide save button
            changePasswordBtn.style.display = "block"
            savePasswordBtn.style.display = "none"
  
            // Clear stored email and token
            currentPasswordChangeEmail = ""
            currentPasswordChangeToken = ""
          } else {
            showNotification(data.message || "Failed to update password", "error")
          }
        })
        .catch((error) => {
          console.error("Error updating password:", error)
          showNotification("An error occurred while updating password", "error")
        })
    }
  
    // Delete Account
    if (deleteAccountBtn) {
      deleteAccountBtn.addEventListener("click", () => {
        showModal(deleteAccountModalOverlay)
      })
    }
  
    if (deleteAccountCancelBtn) {
      deleteAccountCancelBtn.addEventListener("click", () => hideModal(deleteAccountModalOverlay))
    }
  
    if (deleteAccountConfirmBtn) {
      deleteAccountConfirmBtn.addEventListener("click", () => {
        hideModal(deleteAccountModalOverlay)
        fetch("/api/delete-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showNotification("Account deleted successfully. Redirecting...", "success")
              setTimeout(() => {
                window.location.href = "/sign-up" // Redirect to sign-up or home page
              }, 2000)
            } else {
              showNotification(data.message || "Failed to delete account", "error")
            }
          })
          .catch((error) => {
            console.error("Error deleting account:", error)
            showNotification("An error occurred while deleting account", "error")
          })
      })
    }
  
    // Generic Notification Function (adapted from dashboard.js)
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
  
    // --- Account Security Functionality ---
    const resendEmailBtn = document.getElementById("resendEmailBtn")
    const disableTfaBtn = document.getElementById("disableTfaBtn")
    const signOutAllBtn = document.getElementById("signOutAllBtn")
    const sessionSignOutBtns = document.querySelectorAll(".btn-sign-out[data-session]")
  
    if (resendEmailBtn) {
      resendEmailBtn.addEventListener("click", () => {
        fetch("/api/resend-email-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.success) {
              showNotification("Email verification sent successfully!", "success")
            } else {
              showNotification(data.message || "Failed to send verification email", "error")
            }
          })
          .catch((error) => {
            console.error("Error sending verification email:", error)
            showNotification("An error occurred while sending verification email", "error")
          })
      })
    }
  
    if (disableTfaBtn) {
      disableTfaBtn.addEventListener("click", () => {
        if (
          confirm("Are you sure you want to disable Two-Factor Authentication? This will make your account less secure.")
        ) {
          fetch("/api/disable-2fa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                showNotification("Two-Factor Authentication disabled", "success")
                // Update UI to show disabled state
                const tfaBadge = document.querySelector(".tfa-badge")
                if (tfaBadge) {
                  tfaBadge.textContent = "Disabled"
                  tfaBadge.className = "tfa-badge disabled"
                  tfaBadge.style.background = "#fee2e2"
                  tfaBadge.style.color = "#dc2626"
                }
                disableTfaBtn.textContent = "Enable"
                disableTfaBtn.id = "enableTfaBtn"
              } else {
                showNotification(data.message || "Failed to disable 2FA", "error")
              }
            })
            .catch((error) => {
              console.error("Error disabling 2FA:", error)
              showNotification("An error occurred while disabling 2FA", "error")
            })
        }
      })
    }
  
    if (signOutAllBtn) {
      signOutAllBtn.addEventListener("click", () => {
        if (
          confirm("Are you sure you want to sign out all devices? You will need to sign in again on all your devices.")
        ) {
          fetch("/api/sign-out-all-devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                showNotification("Signed out from all devices successfully", "success")
                // Redirect to sign-in page after a delay
                setTimeout(() => {
                  window.location.href = "/sign-in"
                }, 2000)
              } else {
                showNotification(data.message || "Failed to sign out all devices", "error")
              }
            })
            .catch((error) => {
              console.error("Error signing out all devices:", error)
              showNotification("An error occurred while signing out all devices", "error")
            })
        }
      })
    }
  
    sessionSignOutBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const sessionId = btn.getAttribute("data-session")
        if (confirm("Are you sure you want to sign out this session?")) {
          fetch("/api/sign-out-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          })
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                showNotification("Session signed out successfully", "success")
                // Remove the session item from UI
                btn.closest(".session-item").remove()
                // Update sessions count
                const remainingSessions = document.querySelectorAll(".btn-sign-out[data-session]").length
                const sessionsHeader = document.querySelector(".sessions-count")
                if (sessionsHeader) {
                  sessionsHeader.textContent = `${remainingSessions} other session${remainingSessions !== 1 ? "s" : ""}`
                }
              } else {
                showNotification(data.message || "Failed to sign out session", "error")
              }
            })
            .catch((error) => {
              console.error("Error signing out session:", error)
              showNotification("An error occurred while signing out session", "error")
            })
        }
      })
    })
  
    console.log("Settings page loaded successfully!")
  })
  