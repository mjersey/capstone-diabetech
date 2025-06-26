// Patient Table/List Management System
class PatientTableManager {
  constructor() {
    this.storageKey = "diabetech_patients"
    this.init()
  }

  init() {
    this.initializePatientTable()
    this.loadSavedPatients()
    this.updateStats()
    this.initializeConfirmationModals()
    console.log("🏥 Patient Table Manager initialized")
  }

  // ===== PATIENT TABLE MANAGEMENT FUNCTIONS =====

  // Initialize patient table functionality
  initializePatientTable() {
    this.initializeSearch()
    this.initializeFilters()
    this.initializePatientDetailsModal()
  }

  // Initialize confirmation modals
  initializeConfirmationModals() {
    // Make functions globally available
    window.closeSaveConfirmationModal = () => this.closeSaveConfirmationModal()
    window.confirmSavePrescription = () => this.confirmSavePrescription()
    window.closeDeleteConfirmationModal = () => this.closeDeleteConfirmationModal()
    window.confirmDeletePrescription = () => this.confirmDeletePrescription()
    window.closeSuccessModal = () => this.closeSuccessModal()
    window.closePrescriptionSuccessModal = () => this.closePrescriptionSuccessModal()
  }

  // Initialize search functionality
  initializeSearch() {
    const searchInput = document.getElementById("searchPatientInput")
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim()
        this.filterPatients(searchTerm)
      })
    }
  }

  // Initialize filter functionality
  initializeFilters() {
    const filterBtn = document.getElementById("filterBtn")
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        this.showFilterModal()
      })
    }

    const uploadBtn = document.getElementById("uploadBtn")
    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        this.handleFileUpload()
      })
    }
  }

  // Filter patients based on search term
  filterPatients(searchTerm) {
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
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

  // Handle file upload
  handleFileUpload() {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = ".csv,.xlsx,.xls"
    fileInput.style.display = "none"

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        console.log("📁 File selected:", file.name)
        // Simulate file processing
        setTimeout(() => {
          console.log("File uploaded successfully! Processing patient data...")
          this.loadSavedPatients()
          this.updateStats()
        }, 2000)
      }
    })

    document.body.appendChild(fileInput)
    fileInput.click()
    document.body.removeChild(fileInput)
  }

  // Show filter modal
  showFilterModal() {
    const modalHtml = `
    <div class="modal-overlay filter-modal" id="filterModal">
      <div class="modal" style="max-width: 400px; background: white; border-radius: 16px; padding: 24px;">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Filter Patients</h3>
            <button class="close-btn" onclick="window.patientTableManager.hideFilterModal()" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px;">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="filter-options">
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="font-weight: 500; margin-bottom: 8px; display: block;">Risk Level</label>
              <div style="margin-top: 8px;">
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="High Risk" style="margin-right: 8px;"> High Risk
                </label>
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="Moderate Risk" style="margin-right: 8px;"> Moderate Risk
                </label>
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="Low Risk" style="margin-right: 8px;"> Low Risk
                </label>
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label style="font-weight: 500; margin-bottom: 8px; display: block;">Sex</label>
              <div style="margin-top: 8px;">
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="Male" style="margin-right: 8px;"> Male
                </label>
                <label style="display: flex; align-items: center; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="Female" style="margin-right: 8px;"> Female
                </label>
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 20px;">
              <label style="font-weight: 500; margin-bottom: 8px; display: block;">Age Range</label>
              <div style="display: flex; gap: 8px; margin-top: 8px;">
                <input type="number" placeholder="Min" id="minAge" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
                <input type="number" placeholder="Max" id="maxAge" style="flex: 1; padding: 8px; border: 1px solid #e2e8f0; border-radius: 4px;">
              </div>
            </div>
          </div>
          
          <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end;">
            <button type="button" class="btn-secondary" onclick="window.patientTableManager.clearFilters()">Clear</button>
            <button type="button" class="btn-primary" onclick="window.patientTableManager.applyFilters()">Apply Filters</button>
          </div>
        </div>
      </div>
    </div>
  `

    document.body.insertAdjacentHTML("beforeend", modalHtml)
    const modal = document.getElementById("filterModal")
    modal.style.display = "flex"
    modal.style.position = "fixed"
    modal.style.top = "0"
    modal.style.left = "0"
    modal.style.width = "100%"
    modal.style.height = "100%"
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    modal.style.alignItems = "center"
    modal.style.justifyContent = "center"
    modal.style.zIndex = "1000"
  }

  // Hide filter modal
  hideFilterModal() {
    const modal = document.getElementById("filterModal")
    if (modal) {
      modal.remove()
    }
  }

  // Apply filters
  applyFilters() {
    const modal = document.getElementById("filterModal")
    if (!modal) return

    const riskCheckboxes = modal.querySelectorAll('input[value*="Risk"]:checked')
    const sexCheckboxes = modal.querySelectorAll('input[value="Male"]:checked, input[value="Female"]:checked')
    const minAge = modal.querySelector("#minAge").value
    const maxAge = modal.querySelector("#maxAge").value

    const selectedRisks = Array.from(riskCheckboxes).map((cb) => cb.value)
    const selectedSexes = Array.from(sexCheckboxes).map((cb) => cb.value)

    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
    rows.forEach((row) => {
      const riskBadge = row.querySelector(".risk-badge")
      const riskLevel = riskBadge ? riskBadge.textContent : ""
      const sex = row.cells[3].textContent
      const age = Number.parseInt(row.cells[2].textContent)

      let showRow = true

      // Filter by risk level
      if (selectedRisks.length > 0 && !selectedRisks.includes(riskLevel)) {
        showRow = false
      }

      // Filter by sex
      if (selectedSexes.length > 0 && !selectedSexes.includes(sex)) {
        showRow = false
      }

      // Filter by age range
      if (minAge && age < Number.parseInt(minAge)) {
        showRow = false
      }
      if (maxAge && age > Number.parseInt(maxAge)) {
        showRow = false
      }

      row.style.display = showRow ? "" : "none"
    })

    this.hideFilterModal()
    console.log("🔧 Filters applied")
  }

  // Clear filters
  clearFilters() {
    const tableBody = document.getElementById("patientsTableBody")
    if (tableBody) {
      const rows = tableBody.querySelectorAll("tr")
      rows.forEach((row) => {
        row.style.display = ""
      })
    }
    this.hideFilterModal()
    console.log("🧹 Filters cleared")
  }

  // Load saved patients from localStorage
  loadSavedPatients() {
    try {
      const savedPatients = localStorage.getItem(this.storageKey)
      if (savedPatients) {
        const patients = JSON.parse(savedPatients)
        console.log(`📋 Loading ${patients.length} saved patients`)

        // Clear existing table first
        const tableBody = document.getElementById("patientsTableBody")
        if (tableBody) {
          tableBody.innerHTML = ""
        }

        // Add each patient to the table with sequential numbering
        patients.forEach((patient, index) => {
          this.addPatientToTableFromStorage(patient, index + 1)
        })

        // Attach view button listeners to newly loaded patients
        this.attachViewButtonListeners()
      }
    } catch (error) {
      console.error("Error loading saved patients:", error)
    }
  }

  // Add patient to table from storage (for page refresh)
  addPatientToTableFromStorage(patientData, rowNumber) {
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const riskLevel = this.calculateRiskLevel(patientData)
    const riskClass = riskLevel.toLowerCase().replace(" ", "-")

    // Get complications from stored data or calculate them
    const complications = patientData.complications || this.calculateComplications(patientData)
    const complicationsText =
      complications.length > 0 && complications[0] !== "None detected" ? complications.join(", ") : "None"

    const newRow = document.createElement("tr")
    newRow.innerHTML = `
            <td>${rowNumber}</td>
            <td>${patientData.patientId}</td>
            <td>${patientData.basicInfo.age}</td>
            <td>${patientData.basicInfo.sex}</td>
            <td><span class="risk-badge ${riskClass}">${riskLevel}</span></td>
            <td>${patientData.notes.monitoringFrequency || "Not Set"}</td>
            <td class="complications-cell">${complicationsText}</td>
            <td class="actions-cell">
                <button class="view-btn" data-patient-id="${patientData.patientId}">
                    <span class="material-symbols-outlined">visibility</span>
                </button>
                <button class="action-btn delete-btn" title="Delete Patient" onclick="window.deletePatient('${patientData.patientId}')">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </td>
        `

    tableBody.appendChild(newRow)
  }

  // Calculate risk level
  calculateRiskLevel(patientData) {
    let riskScore = 0

    // Age factor
    const age = patientData.basicInfo.age || 0
    if (age > 65) riskScore += 20
    else if (age > 45) riskScore += 10

    // Health factors
    const fastingGlucose = patientData.health.fastingGlucose || 0
    const hba1c = patientData.health.hba1c || 0

    if (fastingGlucose > 126) riskScore += 30
    else if (fastingGlucose > 100) riskScore += 15

    if (hba1c > 7) riskScore += 25
    else if (hba1c > 6.5) riskScore += 15

    // BMI factor
    const bmi = patientData.health.bmi || 0
    if (bmi > 30) riskScore += 15
    else if (bmi > 25) riskScore += 8

    // Lifestyle factors
    if (patientData.basicInfo.smokingStatus === "Smoker") riskScore += 15
    if (patientData.lifestyle.physicalActivity === "Sedentary") riskScore += 10

    if (riskScore >= 50) return "High Risk"
    else if (riskScore >= 25) return "Moderate Risk"
    else return "Low Risk"
  }

  // Calculate complications
  calculateComplications(patientData) {
    const complications = []

    // Extract data
    const age = patientData.basicInfo.age || 0
    const hba1c = patientData.health.hba1c || 0
    const fastingGlucose = patientData.health.fastingGlucose || 0
    const bloodPressure = patientData.health.bloodPressure || ""
    const cholesterol = patientData.health.cholesterolLevel || 0
    const smoking = patientData.basicInfo.smokingStatus || ""
    const activity = patientData.lifestyle.physicalActivity || ""
    const bmi = patientData.health.bmi || 0

    // Parse blood pressure
    let systolic = 0,
      diastolic = 0
    if (bloodPressure.includes("/")) {
      const bpParts = bloodPressure.split("/")
      systolic = Number.parseInt(bpParts[0]) || 0
      diastolic = Number.parseInt(bpParts[1]) || 0
    }

    // Retinopathy risk
    if (hba1c > 9) {
      complications.push("Retinopathy")
    } else if (hba1c > 7 && age > 50) {
      complications.push("Retinopathy")
    }

    // Neuropathy risk
    if ((hba1c > 8 && age > 40) || (fastingGlucose > 140 && age > 50)) {
      complications.push("Neuropathy")
    }

    // Cardiovascular risk
    if (
      systolic > 140 ||
      diastolic > 90 ||
      cholesterol > 240 ||
      smoking === "Smoker" ||
      (systolic > 130 && (age > 45 || bmi > 25)) ||
      (activity === "Sedentary" && age > 50)
    ) {
      complications.push("Cardiovascular Risk")
    }

    return complications.length > 0 ? complications : ["None detected"]
  }

  // Update statistics
  updateStats() {
    try {
      const savedPatients = localStorage.getItem(this.storageKey)
      if (!savedPatients) return

      const patients = JSON.parse(savedPatients)
      const totalPatients = patients.length
      const highRiskCount = patients.filter((p) => {
        const riskLevel = this.calculateRiskLevel(p)
        return riskLevel === "High Risk"
      }).length
      const moderateRiskCount = patients.filter((p) => {
        const riskLevel = this.calculateRiskLevel(p)
        return riskLevel === "Moderate Risk"
      }).length
      const lowRiskCount = patients.filter((p) => {
        const riskLevel = this.calculateRiskLevel(p)
        return riskLevel === "Low Risk"
      }).length

      const statCards = document.querySelectorAll(".stat-value")
      if (statCards.length >= 4) {
        statCards[0].textContent = totalPatients
        statCards[1].textContent = highRiskCount
        statCards[2].textContent = moderateRiskCount
        statCards[3].textContent = lowRiskCount
      }
    } catch (error) {
      console.error("Error updating stats:", error)
    }
  }

  // ===== PATIENT DETAILS MODAL FUNCTIONALITY =====

  // Initialize patient details modal functionality
  initializePatientDetailsModal() {
    // Tab functionality
    const tabButtons = document.querySelectorAll(".tab-button")
    const tabContents = document.querySelectorAll(".tab-content")

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab")
        if (!targetTab) return

        // Remove active class from all tabs and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        // Add active class to clicked tab and corresponding content
        button.classList.add("active")
        const targetContent = document.getElementById(targetTab)
        if (targetContent) {
          targetContent.classList.add("active")
        }
      })
    })

    // Generate prescription button
    const generateBtn = document.getElementById("generatePrescriptionBtn")
    if (generateBtn) {
      generateBtn.addEventListener("click", () => this.generatePrescription())
    }

    // Save prescription button
    const saveBtn = document.getElementById("savePrescriptionBtn")
    if (saveBtn) {
      saveBtn.addEventListener("click", () => this.savePrescription())
    }

    // Delete prescription button
    const deleteBtn = document.getElementById("deletePrescriptionBtn")
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => this.deletePrescription())
    }

    // Close modal buttons
    const closeBtn = document.getElementById("patientDetailsCloseBtn")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closePatientDetailsModal())
    }

    // Close modal when clicking outside
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closePatientDetailsModal()
        }
      })
    }

    // Print button functionality
    const printButtons = document.querySelectorAll(".print-btn")
    printButtons.forEach((button) => {
      button.addEventListener("click", () => this.printPrescription())
    })

    // Add click event listeners to view buttons (will be called after table refresh)
    this.attachViewButtonListeners()
  }

  // Attach view button listeners
  attachViewButtonListeners() {
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((button) => {
      // Remove existing listeners to prevent duplicates
      button.replaceWith(button.cloneNode(true))
    })

    // Re-select buttons after cloning and add listeners
    const newViewButtons = document.querySelectorAll(".view-btn")
    newViewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault()
        this.openPatientDetailsModal(button)
      })
    })
  }

  // Open patient details modal
  openPatientDetailsModal(button) {
    // Get data from button attributes or from stored patient data
    const patientId = button.getAttribute("data-patient-id")

    // Find patient data from localStorage
    const savedPatients = localStorage.getItem(this.storageKey)
    let patientData = null

    if (savedPatients) {
      const patients = JSON.parse(savedPatients)
      patientData = patients.find((p) => p.patientId === patientId)
    }

    if (!patientData) {
      console.error("Patient data not found for ID:", patientId)
      return
    }

    // Get row number from table
    const tableBody = document.getElementById("patientsTableBody")
    const rows = Array.from(tableBody.children)
    const patientRow = rows.find((row) => row.cells[1].textContent === patientId)
    const patientNumber = patientRow ? patientRow.cells[0].textContent : "1"

    // Calculate additional data
    const riskLevel = this.calculateRiskLevel(patientData)
    const complications = patientData.complications || this.calculateComplications(patientData)
    const complicationsText =
      complications.length > 0 && complications[0] !== "None detected" ? complications.join(", ") : "None"

    // Update patient header information
    const patientNumberEl = document.getElementById("patientNumber")
    const patientIdEl = document.getElementById("patientId")
    const patientComplicationsEl = document.getElementById("patientComplications")

    if (patientNumberEl) patientNumberEl.textContent = `#${patientNumber}`
    if (patientIdEl) patientIdEl.textContent = patientId
    if (patientComplicationsEl) patientComplicationsEl.textContent = complicationsText

    // Update risk badge
    const riskBadge = document.getElementById("patientRiskBadge")
    if (riskBadge) {
      riskBadge.textContent = riskLevel
      riskBadge.className = "risk-badge-header"

      if (riskLevel === "High Risk") {
        riskBadge.classList.add("high-risk")
      } else if (riskLevel === "Moderate Risk") {
        riskBadge.classList.add("moderate-risk")
      } else if (riskLevel === "Low Risk") {
        riskBadge.classList.add("low-risk")
      }
    }

    // Update health metrics
    const bmi = patientData.health?.bmi || "N/A"
    const glucose = patientData.health?.fastingGlucose || "N/A"
    const bp = patientData.health?.bloodPressure || "N/A"

    const patientBMI = document.getElementById("patientBMI")
    const patientGlucose = document.getElementById("patientGlucose")
    const patientBP = document.getElementById("patientBP")

    if (patientBMI) patientBMI.textContent = bmi
    if (patientGlucose) patientGlucose.textContent = `${glucose} mg/dL`
    if (patientBP) patientBP.textContent = bp

    // Update general information
    const patientAge = document.getElementById("patientAge")
    const patientSex = document.getElementById("patientSex")
    const patientFrequency = document.getElementById("patientFrequency")

    if (patientAge) patientAge.textContent = `${patientData.basicInfo?.age || "N/A"} yrs old`
    if (patientSex) patientSex.textContent = patientData.basicInfo?.sex || "N/A"
    if (patientFrequency) patientFrequency.textContent = patientData.notes?.monitoringFrequency || "Not Set"

    // Load saved prescription if exists
    this.loadSavedPrescription(patientId)

    // Update risk assessments (simplified for now)
    this.updateRiskBadge("retinopathyRisk", complications.includes("Retinopathy") ? "High" : "Low")
    this.updateRiskBadge("neuropathyRisk", complications.includes("Neuropathy") ? "High" : "Low")
    this.updateRiskBadge("cardiovascularRisk", complications.includes("Cardiovascular Risk") ? "High" : "Low")

    // Reset to first tab
    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    const firstTab = document.querySelector('[data-tab="patient-info"]')
    const firstContent = document.getElementById("patient-info")

    if (firstTab) firstTab.classList.add("active")
    if (firstContent) firstContent.classList.add("active")

    // Show the modal
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  // Load saved prescription for patient
  loadSavedPrescription(patientId) {
    try {
      const savedPrescriptions = localStorage.getItem("diabetech_prescriptions")
      if (savedPrescriptions) {
        const prescriptions = JSON.parse(savedPrescriptions)
        const patientPrescription = prescriptions.find((p) => p.patientId === patientId)

        if (patientPrescription) {
          // Show saved prescription state
          const prescriptionEmpty = document.getElementById("prescriptionEmpty")
          const prescriptionGenerated = document.getElementById("prescriptionGenerated")
          const prescriptionSaved = document.getElementById("prescriptionSaved")

          if (prescriptionEmpty) prescriptionEmpty.style.display = "none"
          if (prescriptionGenerated) prescriptionGenerated.style.display = "none"
          if (prescriptionSaved) prescriptionSaved.style.display = "block"

          // Load saved doctor notes
          const savedNotesText = document.getElementById("savedNotesText")
          if (savedNotesText) {
            savedNotesText.textContent = patientPrescription.doctorNotes || "No additional notes provided."
          }

          // Load medications into table if available
          if (patientPrescription.medications && patientPrescription.medications.length > 0) {
            this.loadMedicationsIntoTable(patientPrescription.medications)
          }

          console.log(`💊 Loaded saved prescription for patient ${patientId}`)
        } else {
          // No saved prescription, show empty state
          const prescriptionEmpty = document.getElementById("prescriptionEmpty")
          const prescriptionGenerated = document.getElementById("prescriptionGenerated")
          const prescriptionSaved = document.getElementById("prescriptionSaved")

          if (prescriptionEmpty) prescriptionEmpty.style.display = "block"
          if (prescriptionGenerated) prescriptionGenerated.style.display = "none"
          if (prescriptionSaved) prescriptionSaved.style.display = "none"

          // Clear doctor notes input
          const doctorNotesInput = document.getElementById("doctorNotesInput")
          if (doctorNotesInput) doctorNotesInput.value = ""
        }
      }
    } catch (error) {
      console.error("Error loading saved prescription:", error)
    }
  }

  // Load medications into the medications table
  loadMedicationsIntoTable(medications) {
    const medicationsTableBody = document.querySelector(".medications-table tbody")
    if (!medicationsTableBody) return

    // Clear existing rows
    medicationsTableBody.innerHTML = ""

    // Add medication rows
    medications.forEach((med) => {
      const row = document.createElement("tr")
      row.innerHTML = `
      <td>${med.medication}</td>
      <td>${med.dosage}</td>
      <td>${med.frequency}</td>
      <td>${med.duration}</td>
      <td>${med.notes || ""}</td>
    `
      medicationsTableBody.appendChild(row)
    })
  }

  // Update risk badge helper
  updateRiskBadge(elementId, riskLevel) {
    const element = document.getElementById(elementId)
    if (!element) return

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

  // Close patient details modal
  closePatientDetailsModal() {
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  // Generate prescription
  generatePrescription() {
    const generateBtn = document.getElementById("generatePrescriptionBtn")
    const loadingOverlay = document.getElementById("prescriptionLoadingOverlay")
    const prescriptionEmpty = document.getElementById("prescriptionEmpty")
    const prescriptionGenerated = document.getElementById("prescriptionGenerated")

    if (generateBtn) generateBtn.disabled = true
    if (loadingOverlay) loadingOverlay.classList.add("show")

    // Simulate prescription generation with loading delay
    setTimeout(() => {
      if (prescriptionEmpty) prescriptionEmpty.style.display = "none"
      if (prescriptionGenerated) prescriptionGenerated.style.display = "block"

      // Hide loading and re-enable button
      if (loadingOverlay) loadingOverlay.classList.remove("show")
      if (generateBtn) generateBtn.disabled = false

      // Show prescription generated success modal
      this.showPrescriptionGeneratedModal()
    }, 2000)
  }

  // Show prescription generated success modal
  showPrescriptionGeneratedModal() {
    const modal = document.getElementById("prescriptionSuccessModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"

      // Auto close after 3 seconds
      setTimeout(() => {
        this.closePrescriptionSuccessModal()
      }, 3000)
    }
  }

  // Close prescription success modal
  closePrescriptionSuccessModal() {
    const modal = document.getElementById("prescriptionSuccessModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  // Save prescription
  savePrescription() {
    const modal = document.getElementById("saveConfirmationModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  // Close save confirmation modal
  closeSaveConfirmationModal() {
    const modal = document.getElementById("saveConfirmationModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  // Confirm prescription save
  confirmSavePrescription() {
    this.closeSaveConfirmationModal()
    this.executePrescriptionSave()
  }

  // Execute prescription save
  executePrescriptionSave() {
    const saveBtn = document.getElementById("savePrescriptionBtn")
    const prescriptionGenerated = document.getElementById("prescriptionGenerated")
    const prescriptionSaved = document.getElementById("prescriptionSaved")
    const doctorNotesInput = document.getElementById("doctorNotesInput")

    if (saveBtn) saveBtn.disabled = true

    // Simulate saving process
    setTimeout(() => {
      // Hide generated state, show saved state
      if (prescriptionGenerated) prescriptionGenerated.style.display = "none"
      if (prescriptionSaved) prescriptionSaved.style.display = "block"

      // Save doctor's notes to the saved state
      const doctorNotes = doctorNotesInput ? doctorNotesInput.value : ""
      const savedNotesText = document.getElementById("savedNotesText")
      if (savedNotesText) {
        savedNotesText.textContent = doctorNotes || "No additional notes provided."
      }

      // Save prescription data to localStorage
      this.savePrescriptionToStorage()

      // Re-enable button
      if (saveBtn) saveBtn.disabled = false

      // Show success modal
      this.showSuccessModal("Saved!", "Prescription saved successfully!")
    }, 1000)
  }

  // Save prescription to localStorage
  savePrescriptionToStorage() {
    try {
      const patientId = document.getElementById("patientId")?.textContent
      if (!patientId) return

      const prescriptionData = {
        patientId: patientId,
        medications: this.getCurrentMedications(),
        doctorNotes: document.getElementById("doctorNotesInput")?.value || "",
        savedAt: new Date().toISOString(),
        prescriptionId: `RX${Date.now()}`,
      }

      // Get existing prescriptions
      let savedPrescriptions = []
      const existingData = localStorage.getItem("diabetech_prescriptions")
      if (existingData) {
        savedPrescriptions = JSON.parse(existingData)
      }

      // Remove any existing prescription for this patient
      savedPrescriptions = savedPrescriptions.filter((p) => p.patientId !== patientId)

      // Add new prescription
      savedPrescriptions.push(prescriptionData)

      localStorage.setItem("diabetech_prescriptions", JSON.stringify(savedPrescriptions))
      console.log(`💊 Prescription saved for patient ${patientId}`)
    } catch (error) {
      console.error("Error saving prescription:", error)
    }
  }

  // Get current medications from the table
  getCurrentMedications() {
    const medicationsTable = document.querySelector(".medications-table tbody")
    const medications = []

    if (medicationsTable) {
      const rows = medicationsTable.querySelectorAll("tr")
      rows.forEach((row) => {
        const cells = row.querySelectorAll("td")
        if (cells.length >= 5) {
          medications.push({
            medication: cells[0].textContent.trim(),
            dosage: cells[1].textContent.trim(),
            frequency: cells[2].textContent.trim(),
            duration: cells[3].textContent.trim(),
            notes: cells[4].textContent.trim(),
          })
        }
      })
    }

    return medications
  }

  // Delete prescription
  deletePrescription() {
    const modal = document.getElementById("deleteConfirmationModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  // Close delete confirmation modal
  closeDeleteConfirmationModal() {
    const modal = document.getElementById("deleteConfirmationModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  // Confirm prescription delete
  confirmDeletePrescription() {
    this.closeDeleteConfirmationModal()
    this.executePrescriptionDelete()
  }

  // Execute prescription delete
  executePrescriptionDelete() {
    const patientId = document.getElementById("patientId")?.textContent
    if (!patientId) return

    try {
      // Remove from localStorage
      const savedPrescriptions = localStorage.getItem("diabetech_prescriptions")
      if (savedPrescriptions) {
        let prescriptions = JSON.parse(savedPrescriptions)
        prescriptions = prescriptions.filter((p) => p.patientId !== patientId)
        localStorage.setItem("diabetech_prescriptions", JSON.stringify(prescriptions))
      }

      // Reset to empty state
      const prescriptionEmpty = document.getElementById("prescriptionEmpty")
      const prescriptionGenerated = document.getElementById("prescriptionGenerated")
      const prescriptionSaved = document.getElementById("prescriptionSaved")

      if (prescriptionEmpty) prescriptionEmpty.style.display = "block"
      if (prescriptionGenerated) prescriptionGenerated.style.display = "none"
      if (prescriptionSaved) prescriptionSaved.style.display = "none"

      // Clear doctor notes input
      const doctorNotesInput = document.getElementById("doctorNotesInput")
      if (doctorNotesInput) doctorNotesInput.value = ""

      console.log(`🗑️ Prescription deleted for patient ${patientId}`)

      // Show success modal
      this.showSuccessModal("Deleted!", "Prescription deleted successfully!")
    } catch (error) {
      console.error("Error deleting prescription:", error)
    }
  }

  // Show success modal
  showSuccessModal(title, message) {
    const modal = document.getElementById("successModal")
    const successTitle = document.getElementById("successTitle")
    const successMessage = document.getElementById("successMessage")

    if (successTitle) successTitle.textContent = message
    if (successMessage) successMessage.textContent = title
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"

      // Auto close after 3 seconds
      setTimeout(() => {
        this.closeSuccessModal()
      }, 3000)
    }
  }

  // Close success modal
  closeSuccessModal() {
    const modal = document.getElementById("successModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  // Print prescription
  printPrescription() {
    // Create a new window for printing
    const printWindow = window.open("", "_blank", "width=800,height=600")

    // Get prescription content
    const patientId = document.getElementById("patientId")?.textContent || "N/A"
    const patientComplications = document.getElementById("patientComplications")?.textContent || "None"
    const patientAge = document.getElementById("patientAge")?.textContent || "N/A"
    const patientSex = document.getElementById("patientSex")?.textContent || "N/A"

    // Get medications table
    const medicationsTable =
      document.querySelector(".medications-table")?.outerHTML || "<p>No medications prescribed</p>"

    // Get doctor's notes
    const doctorNotes =
      document.getElementById("savedNotesText")?.textContent ||
      document.getElementById("doctorNotesInput")?.value ||
      "No additional notes provided."

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

  // Refresh patients table (called from add patient modal)
  refreshPatientsTable() {
    this.loadSavedPatients()
    this.updateStats()
  }

  // Add new patient to table (called from add patient modal)
  addNewPatientToTable(patientData) {
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    // Get the next sequential number
    const rowCount = tableBody.children.length + 1

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(patientData)
    const riskClass = riskLevel.toLowerCase().replace(" ", "-")

    // Get complications text
    const complications = patientData.complications || ["None detected"]
    const complicationsText =
      complications.length > 0 && complications[0] !== "None detected" ? complications.join(", ") : "None"

    const newRow = document.createElement("tr")
    newRow.innerHTML = `
          <td>${rowCount}</td>
          <td>${patientData.patientId}</td>
          <td>${patientData.basicInfo.age}</td>
          <td>${patientData.basicInfo.sex}</td>
          <td><span class="risk-badge ${riskClass}">${riskLevel}</span></td>
          <td>${patientData.notes.monitoringFrequency || "Not Set"}</td>
          <td class="complications-cell">${complicationsText}</td>
          <td class="actions-cell">
              <button class="view-btn" data-patient-id="${patientData.patientId}">
                  <span class="material-symbols-outlined">visibility</span>
              </button>
              <button class="action-btn delete-btn" title="Delete Patient" onclick="window.deletePatient('${patientData.patientId}')">
                  <span class="material-symbols-outlined">delete</span>
              </button>
          </td>
      `

    // Add animation
    newRow.style.opacity = "0"
    newRow.style.transform = "translateY(20px)"
    tableBody.appendChild(newRow)

    // Animate in
    setTimeout(() => {
      newRow.style.transition = "all 0.3s ease"
      newRow.style.opacity = "1"
      newRow.style.transform = "translateY(0)"
    }, 100)

    console.log("✅ Patient added to table:", patientData.patientId)

    // Attach view button listeners to the new row
    this.attachViewButtonListeners()

    // Update statistics
    this.updateStats()
  }
}

// Global function to delete patient (called from table buttons)
window.deletePatient = (patientId) => {
  console.log("🗑️ Deleting patient:", patientId)

  if (confirm("Are you sure you want to delete this patient?")) {
    // Remove from table
    const tableBody = document.getElementById("patientsTableBody")
    if (tableBody) {
      const rows = Array.from(tableBody.children)
      const rowToDelete = rows.find((row) => {
        const patientIdCell = row.cells[1]
        return patientIdCell && patientIdCell.textContent === patientId
      })

      if (rowToDelete) {
        // Add fade out animation
        rowToDelete.style.transition = "all 0.3s ease"
        rowToDelete.style.opacity = "0"
        rowToDelete.style.transform = "translateX(-20px)"

        setTimeout(() => {
          rowToDelete.remove()

          // Update row numbers sequentially (1, 2, 3, 4...)
          const remainingRows = Array.from(tableBody.children)
          remainingRows.forEach((row, index) => {
            row.cells[0].textContent = index + 1
          })

          // Update patient ID counter for next new patient
          if (window.enhancedAddPatientModal) {
            window.enhancedAddPatientModal.updatePatientIdCounter()
          }
        }, 300)
      }
    }

    // Remove from localStorage
    if (window.patientTableManager) {
      window.patientTableManager.deletePatientFromStorage(patientId)
    }

    console.log("✅ Patient deleted successfully")
  }
}

// Delete patient from storage
PatientTableManager.prototype.deletePatientFromStorage = function (patientId) {
  try {
    const savedPatients = localStorage.getItem(this.storageKey)
    if (savedPatients) {
      let patients = JSON.parse(savedPatients)
      patients = patients.filter((patient) => patient.patientId !== patientId)
      localStorage.setItem(this.storageKey, JSON.stringify(patients))
      console.log(`🗑️ Patient ${patientId} deleted from localStorage`)

      // Update stats after deletion
      this.updateStats()
    }
  } catch (error) {
    console.error("Error deleting patient from storage:", error)
  }
}

// Initialize the patient table manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.patientTableManager = new PatientTableManager()

  console.log("✅ Patient Table Manager initialized")
})
