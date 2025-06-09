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
        // Add prescription route when available
        console.log("Prescription page not yet implemented")
        break
      case "Patients":
        // Already on patients page
        break
      case "Analytics":
        // Add analytics route when available
        console.log("Analytics page not yet implemented")
        break
      case "Insights":
        // Add insights route when available
        console.log("Insights page not yet implemented")
        break
      case "Settings":
        // Add settings route when available
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
      age: 45,
      sex: "Male",
      riskLevel: "High Risk",
      checkUpFrequency: "Monthly",
      complications: "Retinopathy & Neuropathy",
      bmi: 28.5,
      glucoseLevel: 180,
      bloodPressure: "140/90",
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
      bmi: 25.2,
      glucoseLevel: 145,
      bloodPressure: "130/85",
      retinopathyRisk: "Moderate",
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
      bmi: 22.1,
      glucoseLevel: 110,
      bloodPressure: "120/80",
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
      bmi: 30.1,
      glucoseLevel: 195,
      bloodPressure: "150/95",
      retinopathyRisk: "High",
      neuropathyRisk: "Moderate",
      cardiovascularRisk: "High",
    },
  ]

  // Upload button functionality
  uploadBtn.addEventListener("click", () => {
    console.log("📤 Upload button clicked")
    // Create file input for CSV upload
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

    // Show loading state
    showNotification("Processing file upload...", "info")

    // Simulate file processing
    setTimeout(() => {
      showNotification("File uploaded successfully! Processing patient data...", "success")

      // In real app, send file to backend for processing
      // fetch('/api/upload-patients', { method: 'POST', body: formData })

      // Simulate adding new patients
      setTimeout(() => {
        showNotification("Patient data imported successfully!", "success")
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
              <button class="close-btn" onclick="hideAddPatientModal()">
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
                <button type="button" class="btn-cancel" onclick="hideAddPatientModal()">Cancel</button>
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

    // Handle form submission
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

    // In real app, send to backend
    // fetch('/api/add-patient', { method: 'POST', body: JSON.stringify(newPatient) })

    // Add to local data and refresh table
    patientsData.push(newPatient)
    refreshPatientsTable()
    hideAddPatientModal()
    showNotification("Patient added successfully!", "success")
    updateStats()
  }

  // Show filter modal
  function showFilterModal() {
    const modalHtml = `
      <div class="modal-overlay filter-modal" id="filterModal">
        <div class="modal" style="max-width: 400px;">
          <div class="modal-content">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3>Filter Patients</h3>
              <button class="close-btn" onclick="hideFilterModal()">
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
              <button type="button" class="btn-confirm" onclick="applyFilters()">Apply Filters</button>
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
    // Implementation for filtering logic
    hideFilterModal()
    showNotification("Filters applied successfully!", "success")
  }

  // Clear filters
  window.clearFilters = () => {
    console.log("🧹 Clearing filters...")
    refreshPatientsTable()
    hideFilterModal()
    showNotification("Filters cleared!", "info")
  }

  // Refresh patients table
  function refreshPatientsTable() {
    // Clear existing rows
    patientsTableBody.innerHTML = ""

    // Add updated data
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
        <button class="action-btn view-btn" title="View Patient" onclick="viewPatient('${patient.patientId}')">
          <span class="material-symbols-outlined">visibility</span>
        </button>
        <button class="action-btn delete-btn" title="Delete Patient" onclick="deletePatient('${patient.patientId}')">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </td>
    `

    return row
  }

  // View patient details - NEW ENHANCED MODAL
  window.viewPatient = (patientId) => {
    console.log("👁️ Viewing patient:", patientId)
    const patient = patientsData.find((p) => p.patientId === patientId)
    if (patient) {
      showPatientDetailsModal(patient)
    }
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
        showNotification("Patient deleted successfully!", "success")
      }
    }
  }

  // Show enhanced patient details modal with tabs
  function showPatientDetailsModal(patient) {
    const riskClass = patient.riskLevel.toLowerCase().replace(" ", "-")

    const modalHtml = `
      <div class="modal-overlay patient-details-modal" id="patientDetailsModal">
        <div class="modal">
          <div class="modal-content">
            <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
              <h3>Patient Details</h3>
              <button class="close-btn" onclick="hidePatientDetailsModal()">
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <!-- Patient Header -->
            <div class="patient-header">
              <div class="patient-number">#${patient.id}</div>
              <div class="patient-info">
                <h3>${patient.patientId}</h3>
                <p>Complications: ${patient.complications}</p>
              </div>
              <div class="risk-badge-header ${riskClass}">${patient.riskLevel}</div>
            </div>
            
            <!-- Tabs -->
            <div class="modal-tabs">
              <button class="tab-button active" onclick="switchTab('patient-info')">Patient Information</button>
              <button class="tab-button" onclick="switchTab('complication-risk')">Complication Risk</button>
              <button class="tab-button" onclick="switchTab('prescription')">Prescription</button>
            </div>
            
            <!-- Tab Content -->
            <div class="tab-content active" id="patient-info-content">
              <h4>Health</h4>
              <div class="health-metrics">
                <div class="health-metric">
                  <div class="metric-icon">
                    <span class="material-symbols-outlined">monitor_weight</span>
                  </div>
                  <div class="metric-label">BMI</div>
                  <div class="metric-value">${patient.bmi}</div>
                </div>
                <div class="health-metric">
                  <div class="metric-icon">
                    <span class="material-symbols-outlined">glucose</span>
                  </div>
                  <div class="metric-label">Glucose Level</div>
                  <div class="metric-value">${patient.glucoseLevel}</div>
                </div>
                <div class="health-metric">
                  <div class="metric-icon">
                    <span class="material-symbols-outlined">favorite</span>
                  </div>
                  <div class="metric-label">Blood Pressure</div>
                  <div class="metric-value">${patient.bloodPressure}</div>
                </div>
              </div>
              
              <h4>General</h4>
              <div class="general-info">
                <div class="info-item">
                  <span class="info-label">Sex</span>
                  <span class="info-value">${patient.sex}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Check-Up Frequency</span>
                  <span class="info-value">${patient.checkUpFrequency}</span>
                </div>
              </div>
            </div>
            
            <div class="tab-content" id="complication-risk-content">
              <div class="risk-assessment">
                <div class="risk-item">
                  <span class="info-label">Retinopathy Risk</span>
                  <span class="risk-badge ${patient.retinopathyRisk.toLowerCase()}-risk">${patient.retinopathyRisk}</span>
                </div>
                <div class="risk-item">
                  <span class="info-label">Neuropathy Risk</span>
                  <span class="risk-badge ${patient.neuropathyRisk.toLowerCase()}-risk">${patient.neuropathyRisk}</span>
                </div>
                <div class="risk-item">
                  <span class="info-label">Cardiovascular Risk</span>
                  <span class="risk-badge ${patient.cardiovascularRisk.toLowerCase()}-risk">${patient.cardiovascularRisk}</span>
                </div>
              </div>
              
              ${
                patient.riskLevel === "High Risk"
                  ? `
                <div class="risk-warning">
                  <span class="warning-icon material-symbols-outlined">warning</span>
                  <span class="warning-text">Multiple risk factors detected including elevated glucose and blood pressure.</span>
                </div>
              `
                  : ""
              }
            </div>
            
            <div class="tab-content" id="prescription-content">
              <div class="prescription-empty" id="prescriptionEmpty">
                <p>Click here to generate prescription</p>
                <button class="generate-prescription-btn" onclick="generatePrescription('${patient.patientId}')">Generate Prescription</button>
              </div>
              
              <div class="prescription-content" id="prescriptionGenerated">
                <h4>Prescribed Medications</h4>
                <table class="prescription-table">
                  <thead>
                    <tr>
                      <th>Medication</th>
                      <th>Dosage</th>
                      <th>Frequency</th>
                      <th>Duration</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Metformin</td>
                      <td>500mg</td>
                      <td>2x daily</td>
                      <td>3 months</td>
                      <td>Take with meals</td>
                    </tr>
                    <tr>
                      <td>Lisinopril</td>
                      <td>10mg</td>
                      <td>1x daily</td>
                      <td>3 months</td>
                      <td>Monitor blood pressure</td>
                    </tr>
                    <tr>
                      <td>Atorvastatin</td>
                      <td>20mg</td>
                      <td>1x daily</td>
                      <td>3 months</td>
                      <td>Take in evening</td>
                    </tr>
                  </tbody>
                </table>
                
                <div class="lifestyle-recommendations">
                  <h4>Lifestyle Recommendations</h4>
                  <ul>
                    <li>Exercise: Low-impact activities</li>
                    <li>Diet: Minimize carbohydrates</li>
                    <li>Hydration: Minimum 8 glasses</li>
                    <li>Stress: Meditation or light music</li>
                  </ul>
                </div>
                
                <div class="doctor-notes">
                  <h4>Doctor's Additional Notes</h4>
                  <p>⚠️ Suggestion: Consider insulin dosage reassessment in 2 weeks based on testing blood sugar patterns.</p>
                </div>
                
                <div class="prescription-actions">
                  <button class="btn-cancel" onclick="hidePatientDetailsModal()">Cancel</button>
                  <button class="btn-save">Save Prescription</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    document.body.insertAdjacentHTML("beforeend", modalHtml)

    const modal = document.getElementById("patientDetailsModal")
    modal.style.display = "flex"
  }

  // Switch tabs in patient details modal
  window.switchTab = (tabName) => {
    // Remove active class from all tabs and content
    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    // Add active class to clicked tab
    event.target.classList.add("active")

    // Show corresponding content
    const contentMap = {
      "patient-info": "patient-info-content",
      "complication-risk": "complication-risk-content",
      prescription: "prescription-content",
    }

    document.getElementById(contentMap[tabName]).classList.add("active")
  }

  // Generate prescription
  window.generatePrescription = (patientId) => {
    console.log("💊 Generating prescription for:", patientId)

    // Hide empty state and show prescription content
    document.getElementById("prescriptionEmpty").style.display = "none"
    document.getElementById("prescriptionGenerated").classList.add("show")

    showNotification("Prescription generated successfully!", "success")
  }

  // Hide patient details modal
  window.hidePatientDetailsModal = () => {
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.remove()
    }
  }

  // Update statistics
  function updateStats() {
    const totalPatients = patientsData.length
    const highRiskCount = patientsData.filter((p) => p.riskLevel === "High Risk").length
    const moderateRiskCount = patientsData.filter((p) => p.riskLevel === "Moderate Risk").length
    const lowRiskCount = patientsData.filter((p) => p.riskLevel === "Low Risk").length

    // Update stat cards (if elements exist)
    const statCards = document.querySelectorAll(".stat-value")
    if (statCards.length >= 4) {
      statCards[0].textContent = totalPatients
      statCards[1].textContent = highRiskCount
      statCards[2].textContent = moderateRiskCount
      statCards[3].textContent = lowRiskCount
    }
  }

  // Show notification
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

  // Initialize table with sample data
  refreshPatientsTable()

  console.log("✅ Patients page functionality initialized")
})
