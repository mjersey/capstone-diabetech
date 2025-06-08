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
