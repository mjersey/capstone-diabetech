document.addEventListener("DOMContentLoaded", () => {
  console.log("🏥 Patients page loaded successfully!")

  // Navigation functionality for sidebar
  const navItems = document.querySelectorAll(".nav-item:not(#signOutBtn)")

  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all items
      navItems.forEach((nav) => nav.classList.remove("active"))

      // Add active class to clicked item
      this.classList.add("active")

      // Get the navigation text
      const navText = this.querySelector(".nav-text").textContent

      // Navigate to different pages
      navigateToPage(navText)
    })
  })

  function navigateToPage(section) {
    console.log("Navigating to:", section)

    switch (section) {
      case "Dashboard":
        window.location.href = "/dashboard"
        break
      case "Prescription":
        console.log("Prescription page not yet implemented")
        break
      case "Patients":
        // Already on patients page
        break
      case "Analytics":
        console.log("Analytics page not yet implemented")
        break
      case "Insights":
        console.log("Insights page not yet implemented")
        break
      case "Settings":
        console.log("Settings page not yet implemented")
        break
    }
  }

  // Elements
  const uploadBtn = document.getElementById("uploadBtn")
  const addPatientBtn = document.getElementById("addPatientBtn")
  const searchPatientInput = document.getElementById("searchPatientInput")
  const filterBtn = document.getElementById("filterBtn")
  const patientsTableBody = document.getElementById("patientsTableBody")

  // Sample patient data (in real app, this would come from backend)
  const patientsData = [
    {
      id: 1,
      patientId: "P001",
      age: 37,
      sex: "Male",
      riskLevel: "High Risk",
      checkUpFrequency: "Monthly",
      complications: "Retinopathy / Neuropathy",
      bmi: 38.4,
      glucoseLevel: 160,
      bloodPressure: "145/90",
      retinopathyRisk: "High",
      neuropathyRisk: "High",
      cardiovascularRisk: "High",
    },
    {
      id: 2,
      patientId: "P002",
      age: 41,
      sex: "Female",
      riskLevel: "Moderate Risk",
      checkUpFrequency: "Quarterly",
      complications: "Neuropathy",
      bmi: 32.1,
      glucoseLevel: 140,
      bloodPressure: "130/85",
      retinopathyRisk: "Low",
      neuropathyRisk: "High",
      cardiovascularRisk: "Moderate",
    },
    {
      id: 3,
      patientId: "P003",
      age: 25,
      sex: "Female",
      riskLevel: "Low Risk",
      checkUpFrequency: "Quarterly",
      complications: "None",
      bmi: 24.8,
      glucoseLevel: 95,
      bloodPressure: "110/70",
      retinopathyRisk: "Low",
      neuropathyRisk: "Low",
      cardiovascularRisk: "Low",
    },
    {
      id: 4,
      patientId: "P004",
      age: 56,
      sex: "Male",
      riskLevel: "High Risk",
      checkUpFrequency: "Monthly",
      complications: "Cardiovascular",
      bmi: 42.3,
      glucoseLevel: 185,
      bloodPressure: "160/95",
      retinopathyRisk: "Moderate",
      neuropathyRisk: "Moderate",
      cardiovascularRisk: "High",
    },
  ]

  // Upload button functionality
  uploadBtn.addEventListener("click", () => {
    console.log("📤 Upload button clicked")
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".csv,.xlsx,.xls"
    fileInput.style.display = "none"

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        console.log("📁 File selected:", file.name)
        handleFileUpload(file)
      }
    })

    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  })

  // Add patient button functionality
  addPatientBtn.addEventListener("click", () => {
    console.log("➕ Add Patient button clicked")
    showAddPatientModal()
  })

  // Search functionality
  searchPatientInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim()
    console.log("🔍 Searching for:", searchTerm)
    filterPatients(searchTerm)
  })

  // Filter button functionality
  filterBtn.addEventListener("click", () => {
    console.log("🔧 Filter button clicked")
    showFilterModal()
  })

  // Handle file upload
  function handleFileUpload(file) {
    console.log("📊 Processing file upload:", file.name)
    // Remove: showNotification("Processing file upload...", "info")

    setTimeout(() => {
      console.log("File uploaded successfully! Processing patient data...")
      // Remove: showNotification("File uploaded successfully! Processing patient data...", "success")
      setTimeout(() => {
        console.log("Patient data imported successfully!")
        // Remove: showNotification("Patient data imported successfully!", "success")
        refreshPatientsTable()
      }, 2000)
    }, 1500)
  }

  // Filter patients based on search term
  function filterPatients(searchTerm) {
    const rows = patientsTableBody.querySelectorAll("tr")

    rows.forEach((row) => {
      const patientId = row.cells[1].textContent.toLowerCase()
      const age = row.cells[2].textContent.toLowerCase()
      const sex = row.cells[3].textContent.toLowerCase()
      const complications = row.cells[6].textContent.toLowerCase()

      const matches =
        patientId.includes(searchTerm) ||
        age.includes(searchTerm) ||
        sex.includes(searchTerm) ||
        complications.includes(searchTerm)

      row.style.display = matches ? "" : "none"
    })
  }

  // Show add patient modal
  function showAddPatientModal() {
    const modalHtml = `
      <div class="modal-overlay add-patient-modal" id="addPatientModal">
        <div class="modal" style="max-width: 500px;">
          <div class="modal-content">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3>Add New Patient</h3>
              <button class="close-btn" onclick="window.hideAddPatientModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form id="addPatientForm">
              <div class="form-group" style="margin-bottom: 16px;">
                <label for="newPatientId">Patient ID</label>
                <input type="text" id="newPatientId" name="patientId" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
              </div>
              
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div class="form-group">
                  <label for="newPatientAge">Age</label>
                  <input type="number" id="newPatientAge" name="age" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
                </div>
                
                <div class="form-group">
                  <label for="newPatientSex">Sex</label>
                  <select id="newPatientSex" name="sex" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
                    <option value="">Select Sex</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group" style="margin-bottom: 16px;">
                <label for="newPatientRisk">Risk Level</label>
                <select id="newPatientRisk" name="riskLevel" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
                  <option value="">Select Risk Level</option>
                  <option value="Low Risk">Low Risk</option>
                  <option value="Moderate Risk">Moderate Risk</option>
                  <option value="High Risk">High Risk</option>
                </select>
              </div>
              
              <div class="form-group" style="margin-bottom: 16px;">
                <label for="newPatientFrequency">Check-Up Frequency</label>
                <select id="newPatientFrequency" name="checkUpFrequency" required style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
                  <option value="">Select Frequency</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                </select>
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label for="newPatientComplications">Complications</label>
                <input type="text" id="newPatientComplications" name="complications" placeholder="e.g., Retinopathy, Neuropathy, None" style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: 4px;">
              </div>
              
              <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
                <button type="button" class="btn-cancel" onclick="window.hideAddPatientModal()">Cancel</button>
                <button type="submit" class="btn-confirm">Add Patient</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = document.getElementById("addPatientModal")
    modal.style.display = "flex"

    const form = document.getElementById("addPatientForm")
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      handleAddPatient(new FormData(form))
    })
  }

  // Hide add patient modal
  window.hideAddPatientModal = () => {
    const modal = document.getElementById("addPatientModal")
    if (modal) {
      modal.remove()
    }
  }

  // Handle adding new patient
  function handleAddPatient(formData) {
    const newPatient = {
      id: patientsData.length + 1,
      patientId: formData.get("patientId"),
      age: Number.parseInt(formData.get("age")),
      sex: formData.get("sex"),
      riskLevel: formData.get("riskLevel"),
      checkUpFrequency: formData.get("checkUpFrequency"),
      complications: formData.get("complications") || "None",
      bmi: 25.0,
      glucoseLevel: 120,
      bloodPressure: "120/80",
      retinopathyRisk: "Low",
      neuropathyRisk: "Low",
      cardiovascularRisk: "Low",
    }

    console.log("👤 Adding new patient:", newPatient)
    patientsData.push(newPatient)
    refreshPatientsTable()
    window.hideAddPatientModal()
    // In handleAddPatient function, remove:
    // showNotification("Patient added successfully!", "success")
  }

  // Show filter modal
  function showFilterModal() {
    const modalHtml = `
      <div class="modal-overlay filter-modal" id="filterModal">
        <div class="modal" style="max-width: 400px;">
          <div class="modal-content">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3>Filter Patients</h3>
              <button class="close-btn" onclick="window.hideFilterModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div class="filter-options">
              <div class="form-group" style="margin-bottom: 16px;">
                <label>Risk Level</label>
                <div style="margin-top: 8px;">
                  <label style="display: flex; align-items: center; margin-bottom: 8px;">
                    <input type="checkbox" value="High Risk" style="margin-right: 8px;"> High Risk
                  </label>
                  <label style="display: flex; align-items: center; margin-bottom: 8px;">
                    <input type="checkbox" value="Moderate Risk" style="margin-right: 8px;"> Moderate Risk
                  </label>
                  <label style="display: flex; align-items: center; margin-bottom: 8px;">
                    <input type="checkbox" value="Low Risk" style="margin-right: 8px;"> Low Risk
                  </label>
                </div>
              </div>
              
              <div class="form-group" style="margin-bottom: 16px;">
                <label>Sex</label>
                <div style="margin-top: 8px;">
                  <label style="display: flex; align-items: center; margin-bottom: 8px;">
                    <input type="checkbox" value="Male" style="margin-right: 8px;"> Male
                  </label>
                  <label style="display: flex; align-items: center; margin-bottom: 8px;">
                    <input type="checkbox" value="Female" style="margin-right: 8px;"> Female
                  </label>
                </div>
              </div>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label>Age Range</label>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                  <input type="number" placeholder="Min" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
                  <input type="number" placeholder="Max" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
                </div>
              </div>
            </div>
            
            <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
              <button type="button" class="btn-cancel" onclick="clearFilters()">Clear</button>
              <button type="button" class="btn-confirm" onclick="window.applyFilters()">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = document.getElementById("filterModal")
    modal.style.display = "flex"
  }

  // Hide filter modal
  window.hideFilterModal = () => {
    const modal = document.getElementById("filterModal")
    if (modal) {
      modal.remove()
    }
  }

  // Apply filters
  window.applyFilters = () => {
    console.log("🔧 Applying filters...")
    window.hideFilterModal()
    // In applyFilters function, remove:
    // showNotification("Filters applied successfully!", "success")
  }

  // Clear filters
  window.clearFilters = () => {
    console.log("🧹 Clearing filters...")
    refreshPatientsTable()
    window.hideFilterModal()
    // In clearFilters function, remove:
    // showNotification("Filters cleared!", "info")
  }

  // Refresh patients table
  function refreshPatientsTable() {
    patientsTableBody.innerHTML = ""
    patientsData.forEach((patient, index) => {
      const row = createPatientRow(patient, index + 1)
      patientsTableBody.appendChild(row)
    })
  }

  // Create patient table row
  function createPatientRow(patient, rowNumber) {
    const row = document.createElement("tr")
    const riskClass = patient.riskLevel.toLowerCase().replace(" ", "-")

    row.innerHTML = `
      <td>${rowNumber}</td>
      <td>${patient.patientId}</td>
      <td>${patient.age}</td>
      <td>${patient.sex}</td>
      <td><span class="risk-badge ${riskClass}">${patient.riskLevel}</span></td>
      <td>${patient.checkUpFrequency}</td>
      <td>${patient.complications}</td>
      <td class="actions-cell">
        <button class="view-btn" 
                data-patient-id="${patient.patientId}" 
                data-patient-number="${rowNumber}" 
                data-age="${patient.age}" 
                data-sex="${patient.sex}" 
                data-risk="${patient.riskLevel}" 
                data-frequency="${patient.checkUpFrequency}" 
                data-complications="${patient.complications}" 
                data-bmi="${patient.bmi}" 
                data-glucose="${patient.glucoseLevel}" 
                data-bp="${patient.bloodPressure}" 
                data-retinopathy="${patient.retinopathyRisk}" 
                data-neuropathy="${patient.neuropathyRisk}" 
                data-cardiovascular="${patient.cardiovascularRisk}">
          <span class="material-symbols-outlined">visibility</span>
        </button>
        <button class="action-btn delete-btn" title="Delete Patient" onclick="window.deletePatient('${patient.patientId}')">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>
    `

    return row
  }

  // Delete patient
  window.deletePatient = (patientId) => {
    console.log("🗑️ Deleting patient:", patientId)

    if (confirm("Are you sure you want to delete this patient?")) {
      const index = patientsData.findIndex((p) => p.patientId === patientId)
      if (index > -1) {
        patientsData.splice(index, 1)
        refreshPatientsTable()
        updateStats()
        // In deletePatient function, remove:
        // showNotification("Patient deleted successfully!", "success")
      }
    }
  }

  // Update statistics
  function updateStats() {
    const totalPatients = patientsData.length
    const highRiskCount = patientsData.filter((p) => p.riskLevel === "High Risk").length
    const moderateRiskCount = patientsData.filter((p) => p.riskLevel === "Moderate Risk").length
    const lowRiskCount = patientsData.filter((p) => p.riskLevel === "Low Risk").length

    const statCards = document.querySelectorAll(".stat-value")
    if (statCards.length >= 4) {
      statCards[0].textContent = totalPatients
      statCards[1].textContent = highRiskCount
      statCards[2].textContent = moderateRiskCount
      statCards[3].textContent = lowRiskCount
    }
  }

  // Show prescription success modal
  function showPrescriptionSuccessModal() {
    const modal = document.getElementById("prescriptionSuccessModal")
    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    // Auto close after 3 seconds
    setTimeout(() => {
      closePrescriptionSuccessModal()
    }, 3000)
  }

  function closePrescriptionSuccessModal() {
    const modal = document.getElementById("prescriptionSuccessModal")
    modal.classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Add as global function
  window.closePrescriptionSuccessModal = closePrescriptionSuccessModal

  // ===== PATIENT DETAILS MODAL FUNCTIONALITY =====

  // Patient Details Modal Functionality
  function openPatientDetailsModal(button) {
    console.log("Opening modal...") // Debug log

    // Get data from button attributes
    const patientId = button.getAttribute("data-patient-id")
    const patientNumber = button.getAttribute("data-patient-number")
    const age = button.getAttribute("data-age")
    const sex = button.getAttribute("data-sex")
    const riskLevel = button.getAttribute("data-risk")
    const frequency = button.getAttribute("data-frequency")
    const complications = button.getAttribute("data-complications")
    const bmi = button.getAttribute("data-bmi")
    const glucose = button.getAttribute("data-glucose")
    const bp = button.getAttribute("data-bp")
    const retinopathy = button.getAttribute("data-retinopathy")
    const neuropathy = button.getAttribute("data-neuropathy")
    const cardiovascular = button.getAttribute("data-cardiovascular")

    // Update patient header information
    document.getElementById("patientNumber").textContent = `#${patientNumber}`
    document.getElementById("patientId").textContent = patientId
    document.getElementById("patientComplications").textContent = complications

    // Update risk badge
    const riskBadge = document.getElementById("patientRiskBadge")
    riskBadge.textContent = riskLevel
    riskBadge.className = "risk-badge-header"

    if (riskLevel === "High Risk") {
      riskBadge.classList.add("high-risk")
    } else if (riskLevel === "Moderate Risk") {
      riskBadge.classList.add("moderate-risk")
    } else if (riskLevel === "Low Risk") {
      riskBadge.classList.add("low-risk")
    }

    // Update health metrics
    document.getElementById("patientBMI").textContent = bmi
    document.getElementById("patientGlucose").textContent = `${glucose} mg/dL`
    document.getElementById("patientBP").textContent = bp

    // Update general information
    document.getElementById("patientAge").textContent = `${age} yrs old`
    document.getElementById("patientSex").textContent = sex
    document.getElementById("patientFrequency").textContent = frequency

    // Update risk assessments
    updateRiskBadge("retinopathyRisk", retinopathy)
    updateRiskBadge("neuropathyRisk", neuropathy)
    updateRiskBadge("cardiovascularRisk", cardiovascular)

    // Reset prescription tab to empty state
    document.getElementById("prescriptionEmpty").style.display = "block"
    document.getElementById("prescriptionGenerated").style.display = "none"
    document.getElementById("prescriptionSaved").style.display = "none"

    // Clear doctor notes input
    document.getElementById("doctorNotesInput").value = ""

    // Reset to first tab
    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))
    document.querySelector('[data-tab="patient-info"]').classList.add("active")
    document.getElementById("patient-info").classList.add("active")

    // Show the modal
    const modal = document.getElementById("patientDetailsModal")
    modal.classList.add("show")
    document.body.style.overflow = "hidden"

    console.log("Modal should be visible now") // Debug log
  }

  function updateRiskBadge(elementId, riskLevel) {
    const element = document.getElementById(elementId)
    element.textContent = riskLevel
    element.className = "risk-badge"

    if (riskLevel === "High") {
      element.classList.add("high-risk")
    } else if (riskLevel === "Moderate") {
      element.classList.add("moderate-risk")
    } else if (riskLevel === "Low") {
      element.classList.add("low-risk")
    }
  }

  function closePatientDetailsModal() {
    document.getElementById("patientDetailsModal").classList.remove("show")
    document.body.style.overflow = "auto"
  }

  function generatePrescription() {
    const generateBtn = document.getElementById("generatePrescriptionBtn")
    const loadingOverlay = document.getElementById("prescriptionLoadingOverlay")

    // Disable button and show loading
    generateBtn.disabled = true
    loadingOverlay.classList.add("show")

    // Simulate prescription generation with loading delay
    setTimeout(() => {
      document.getElementById("prescriptionEmpty").style.display = "none"
      document.getElementById("prescriptionGenerated").style.display = "block"
      document.getElementById("prescriptionSaved").style.display = "none"

      // Hide loading and re-enable button
      loadingOverlay.classList.remove("show")
      generateBtn.disabled = false

      // Show prescription success modal instead of banner
      showPrescriptionSuccessModal()
    }, 2000) // 2 second loading delay
  }

  function savePrescription() {
    // Show save confirmation modal instead of direct save
    document.getElementById("saveConfirmationModal").classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function confirmSavePrescription() {
    // Get doctor's notes
    const doctorNotes = document.getElementById("doctorNotesInput").value.trim()

    // Update saved notes display
    const savedNotesText = document.getElementById("savedNotesText")
    if (doctorNotes) {
      savedNotesText.textContent = doctorNotes
    } else {
      savedNotesText.textContent = "No additional notes provided."
    }

    // Hide the generated state and show saved state
    document.getElementById("prescriptionGenerated").style.display = "none"
    document.getElementById("prescriptionSaved").style.display = "block"

    // Close confirmation modal
    closeSaveConfirmationModal()

    // Show success modal
    showSuccessModal("Saved!", "Prescription saved successfully!")
  }

  function deletePrescription() {
    // Show delete confirmation modal instead of browser confirm
    document.getElementById("deleteConfirmationModal").classList.add("show")
    document.body.style.overflow = "hidden"
  }

  function confirmDeletePrescription() {
    document.getElementById("prescriptionSaved").style.display = "none"
    document.getElementById("prescriptionEmpty").style.display = "block"

    // Clear doctor notes
    document.getElementById("doctorNotesInput").value = ""

    // Close confirmation modal
    closeDeleteConfirmationModal()

    // Show success modal
    showSuccessModal("Deleted!", "Prescription deleted successfully!")
  }

  // Modal control functions
  function closeSaveConfirmationModal() {
    document.getElementById("saveConfirmationModal").classList.remove("show")
    document.body.style.overflow = "auto"
  }

  function closeDeleteConfirmationModal() {
    document.getElementById("deleteConfirmationModal").classList.remove("show")
    document.body.style.overflow = "auto"
  }

  function showSuccessModal(message, title) {
    document.getElementById("successMessage").textContent = message
    document.getElementById("successTitle").textContent = title
    document.getElementById("successModal").classList.add("show")
    document.body.style.overflow = "hidden"

    // Auto close after 3 seconds
    setTimeout(() => {
      closeSuccessModal()
    }, 3000)
  }

  function closeSuccessModal() {
    document.getElementById("successModal").classList.remove("show")
    document.body.style.overflow = "auto"
  }

  // Add these as global functions
  window.closeSaveConfirmationModal = closeSaveConfirmationModal
  window.closeDeleteConfirmationModal = closeDeleteConfirmationModal
  window.confirmSavePrescription = confirmSavePrescription
  window.confirmDeletePrescription = confirmDeletePrescription
  window.closeSuccessModal = closeSuccessModal

  // Initialize patient details modal functionality
  function initializePatientDetailsModal() {
    console.log("DOM loaded, initializing patient modal...") // Debug log

    // Add click event listeners to all view buttons
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((button) => {
      button.addEventListener("click", function () {
        console.log("View button clicked") // Debug log
        openPatientDetailsModal(this)
      })
    })

    // Tab functionality
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab")

        // Remove active class from all tabs and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        button.classList.add("active")
        document.getElementById(targetTab).classList.add("active")
      })
    })

    // Generate prescription button
    const generateBtn = document.getElementById("generatePrescriptionBtn")
    if (generateBtn) {
      generateBtn.addEventListener("click", generatePrescription)
    }

    // Cancel prescription button
    const cancelBtn = document.getElementById("cancelPrescriptionBtn")
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        console.log("Cancel prescription button clicked")
        // Handle cancel prescription logic here
      })
    }

    // Save prescription button
    const saveBtn = document.getElementById("savePrescriptionBtn")
    if (saveBtn) {
      saveBtn.addEventListener("click", savePrescription)
    }

    // Close modal when clicking close button
    const closeBtn = document.getElementById("patientDetailsCloseBtn")
    if (closeBtn) {
      closeBtn.addEventListener("click", closePatientDetailsModal)
    }

    // Close modal when clicking outside
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.addEventListener("click", function (e) {
        if (e.target === this) {
          closePatientDetailsModal()
        }
      })
    }

    // Close modal with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && document.getElementById("patientDetailsModal").classList.contains("show")) {
        closePatientDetailsModal()
      }
    })

    // Add event listener for delete button
    const deleteBtn = document.getElementById("deletePrescriptionBtn")
    if (deleteBtn) {
      deleteBtn.addEventListener("click", deletePrescription)
    }

    // Print button functionality
    const printButtons = document.querySelectorAll(".print-btn")
    printButtons.forEach((button) => {
      button.addEventListener("click", () => {
        console.log("🖨️ Print button clicked")
        printPrescription()
      })
    })

    console.log("Patient modal initialized successfully") // Debug log
  }

  // Print prescription function
  function printPrescription() {
    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600")

    // Get prescription content
    const patientId = document.getElementById("patientId").textContent
    const patientComplications = document.getElementById("patientComplications").textContent
    const patientAge = document.getElementById("patientAge").textContent
    const patientSex = document.getElementById("patientSex").textContent

    // Get medications table
    const medicationsTable = document.querySelector(".medications-table").outerHTML

    // Get lifestyle recommendations
    const lifestyleItems = document.querySelectorAll(".lifestyle-item")
    let lifestyleHTML = ""
    lifestyleItems.forEach((item) => {
      const label = item.querySelector(".lifestyle-label").textContent
      const value = item.querySelector(".lifestyle-value").textContent
      lifestyleHTML += `<p><strong>${label}:</strong> ${value}</p>`
    })

    // Get doctor's notes
    const doctorNotes = document.getElementById("savedNotesText")
      ? document.getElementById("savedNotesText").textContent
      : document.getElementById("doctorNotesInput").value || "No additional notes provided."

    // Create print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Prescription - ${patientId}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .patient-info { margin-bottom: 20px; }
          .section { margin-bottom: 25px; }
          .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .notes { background-color: #f9f9f9; padding: 15px; border-radius: 5px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PRESCRIPTION</h1>
          <h2>Diabetech Medical Center</h2>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p><strong>Patient ID:</strong> ${patientId}</p>
          <p><strong>Age:</strong> ${patientAge}</p>
          <p><strong>Sex:</strong> ${patientSex}</p>
          <p><strong>Complications:</strong> ${patientComplications}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="section">
          <h3>Prescribed Medications</h3>
          ${medicationsTable}
        </div>
        
        <div class="section">
          <h3>Lifestyle Recommendations</h3>
          ${lifestyleHTML}
        </div>
        
        <div class="section">
          <h3>Doctor's Additional Notes</h3>
          <div class="notes">
            ${doctorNotes}
          </div>
        </div>
        
        <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
          Generated on ${new Date().toLocaleString()} | Diabetech Medical System
        </div>
      </body>
      </html>
    `

    // Write content to print window
    printWindow.document.write(printContent)
    printWindow.document.close()

    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }

    console.log("✅ Prescription sent to printer")
  }

  // Initialize table with sample data and modal functionality
  refreshPatientsTable()
  initializePatientDetailsModal()

  console.log("✅ Patients page functionality initialized")
})
