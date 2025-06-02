document.addEventListener("DOMContentLoaded", () => {
  console.log("Diabetech Dashboard loaded successfully!")

  const sidebarToggle = document.getElementById("sidebarToggle")
  const sidebar = document.getElementById("sidebar")
  const mainContent = document.getElementById("mainContent")
  const signOutBtn = document.getElementById("signOutBtn")
  const modalOverlay = document.getElementById("modalOverlay")
  const modalYes = document.getElementById("modalYes")
  const modalNo = document.getElementById("modalNo")

  // Sidebar toggle functionality
  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed")
    mainContent.classList.toggle("expanded")

    // Save state to localStorage
    const collapsed = sidebar.classList.contains("collapsed")
    localStorage.setItem("sidebarCollapsed", collapsed)

    // Update toggle icon
    const icon = this.querySelector(".material-symbols-outlined")
    if (collapsed) {
      icon.textContent = "menu_open"
    } else {
      icon.textContent = "menu"
    }
  })

  // Check if sidebar should be collapsed from localStorage
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true"
  if (isCollapsed) {
    sidebar.classList.add("collapsed")
  }

  // Sign out functionality
  signOutBtn.addEventListener("click", (e) => {
    e.preventDefault()
    showModal()
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

  // Modal button handlers
  modalYes.addEventListener("click", () => {
    hideModal()
    // Add loading state to sign out button
    const navText = signOutBtn.querySelector(".nav-text")
    const originalText = navText.textContent
    navText.textContent = "Signing Out..."

    // Simulate sign out delay
    setTimeout(() => {
      window.location.href = "/sign-in" // Changed from "sign-in.html" to Flask route
    }, 1000)
  })

  modalNo.addEventListener("click", hideModal)

  // Close modal when clicking overlay
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      hideModal()
    }
  })

  // Close modal with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("show")) {
      hideModal()
    }
  })

  // Navigation item click handlers
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item, index) => {
    const navText = item.querySelector(".nav-text")
    if (navText) {
      item.setAttribute("data-tooltip", navText.textContent)
    }
  })

  navItems.forEach((item) => {
    const navLink = item.querySelector(".nav-link")
    if (navLink && !navLink.id) {
      // Exclude sign out button
      navLink.addEventListener("click", function (e) {
        // Remove active class from all items
        document.querySelectorAll(".nav-item").forEach((nav) => {
          nav.classList.remove("active")
        })

        // Add active class to clicked item
        item.classList.add("active")

        // Update page content based on navigation
        const linkText = this.querySelector(".nav-text").textContent
        updatePageContent(linkText)
      })
    }
  })

  // Search functionality
  const searchInput = document.querySelector('input[placeholder="Search..."]')
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      const searchTerm = this.value.toLowerCase()

      if (searchTerm.length > 2) {
        // Simulate search functionality
        console.log("Searching for:", searchTerm)
        // You can implement actual search logic here
      }
    })
  }

  // Filter button functionality
  const filterBtn = document.querySelector(".btn-outline-secondary")
  if (filterBtn) {
    filterBtn.addEventListener("click", () => {
      // Toggle filter options
      console.log("Filter clicked")
      // You can implement filter modal or dropdown here
    })
  }

  // Prescription item interactions
  const prescriptionItems = document.querySelectorAll(".prescription-item")
  prescriptionItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Highlight selected item
      prescriptionItems.forEach((p) => p.classList.remove("selected"))
      this.classList.add("selected")

      // You can implement prescription details view here
      const patientName = this.querySelector(".fw-medium").textContent
      console.log("Selected patient:", patientName)
    })
  })

  // More options buttons
  const moreButtons = document.querySelectorAll(".btn-link")
  moreButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation()
      // Show dropdown menu or modal
      console.log("More options clicked")
    })
  })

  // Notification bell
  const notificationBtn = document.querySelector(".btn-link")
  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => {
      // Show notifications
      console.log("Notifications clicked")
      // You can implement notifications dropdown here
    })
  }

  // Update page content function
  function updatePageContent(section) {
    const mainContent = document.querySelector("main .row")

    switch (section) {
      case "Dashboard":
        // Already showing dashboard content
        break
      case "Prescription":
        // Update to show prescription management
        console.log("Loading Prescription page...")
        break
      case "Patients":
        // Update to show patients list
        console.log("Loading Patients page...")
        break
      case "Analytics":
        // Update to show detailed analytics
        console.log("Loading Analytics page...")
        break
      case "Insights":
        // Update to show insights
        console.log("Loading Insights page...")
        break
      case "Settings":
        // Update to show settings
        console.log("Loading Settings page...")
        break
      default:
        console.log("Unknown section:", section)
    }
  }

  // Auto-refresh data every 30 seconds
  setInterval(() => {
    // Simulate data refresh
    console.log("Refreshing dashboard data...")
    // You can implement actual data fetching here
  }, 30000)

  // Add loading states for cards
  const cards = document.querySelectorAll(".card")
  cards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-2px)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
    })
  })

  // Simulate real-time updates
  function simulateRealTimeUpdates() {
    // Update patient count randomly
    const totalPatientsEl = document.querySelector(".col-md-4:first-child .h2")
    if (totalPatientsEl) {
      const currentCount = Number.parseInt(totalPatientsEl.textContent)
      const newCount = currentCount + Math.floor(Math.random() * 3) - 1 // -1 to +1
      if (newCount > 0) {
        totalPatientsEl.textContent = newCount
      }
    }
  }

  // Run real-time updates every 10 seconds
  setInterval(simulateRealTimeUpdates, 10000)

  // Handle window resize for responsive behavior
  window.addEventListener("resize", () => {
    if (window.innerWidth <= 768) {
      // On mobile, ensure sidebar is hidden by default
      if (!sidebar.classList.contains("show")) {
        sidebar.style.display = "none"
      }
    } else {
      // On desktop, show sidebar
      sidebar.style.display = "block"
    }
  })

  // Mobile sidebar toggle
  if (window.innerWidth <= 768) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("show")
    })
  }
})

// Add CSS for selected prescription item
const style = document.createElement("style")
style.textContent = `
    .prescription-item.selected {
        box-shadow: 0 0 0 2px #dc2626;
        transform: scale(1.02);
    }

    .card {
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
`
document.head.appendChild(style)
