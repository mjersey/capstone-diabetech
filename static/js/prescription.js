// Prescription Management System
class PrescriptionManager {
  constructor() {
    this.storageKey = "diabetech_prescriptions"
    this.patientsStorageKey = "diabetech_patients"
    this.selectedPrescriptions = new Set()
    this.currentStatus = "all"
    this.allPatients = []
    this.prescriptions = []
    this.currentPrescription = null
    this.autoRefreshInterval = null
    this.debugMode = true // Enable debug mode
    this.init()
  }

  init() {
    console.log("🏥 Initializing Prescription Manager...")
    this.log("Starting initialization...")

    this.initializeEventListeners()

    // Add a small delay to ensure DOM is fully loaded
    setTimeout(() => {
      this.syncWithPatients()
      this.loadPrescriptions()
      this.updateStats()
      this.updateTabCounts()
      this.startAutoRefresh()
      this.log("Prescription Manager initialized successfully")
      console.log("✅ Prescription Manager initialized successfully")
    }, 100)
  }

  // Debug logging function
  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[${timestamp}] PRESCRIPTION: ${message}`, data || "")

      // Update debug panel if it exists
      const debugInfo = document.getElementById("debugInfo")
      if (debugInfo) {
        const logEntry = `<div style="margin: 2px 0; font-size: 11px;">[${timestamp}] ${message}</div>`
        debugInfo.innerHTML = logEntry + debugInfo.innerHTML
        // Keep only last 10 entries
        const entries = debugInfo.children
        if (entries.length > 10) {
          for (let i = 10; i < entries.length; i++) {
            entries[i].remove()
          }
        }
      }
    }
  }

  // ===== SHARED METHODS FOR MODAL =====

  // Make these methods available to the modal
  getDefaultMedications(riskLevel) {
    const medicationsByRisk = {
      "High Risk": [
        { medication: "Metformin", dosage: "1000mg", frequency: "2x daily", duration: "30 days", notes: "With meals" },
        {
          medication: "Insulin Glargine",
          dosage: "20 units",
          frequency: "Daily",
          duration: "Ongoing",
          notes: "Bedtime injection",
        },
        { medication: "Lisinopril", dosage: "10mg", frequency: "Daily", duration: "30 days", notes: "Monitor BP" },
        { medication: "Atorvastatin", dosage: "20mg", frequency: "Daily", duration: "30 days", notes: "Evening dose" },
      ],
      "Moderate Risk": [
        { medication: "Metformin", dosage: "500mg", frequency: "2x daily", duration: "30 days", notes: "With meals" },
        { medication: "Glipizide", dosage: "5mg", frequency: "Daily", duration: "30 days", notes: "Before breakfast" },
        { medication: "Lisinopril", dosage: "5mg", frequency: "Daily", duration: "30 days", notes: "Monitor BP" },
      ],
      "Low Risk": [
        { medication: "Metformin", dosage: "500mg", frequency: "Daily", duration: "30 days", notes: "With dinner" },
        {
          medication: "Multivitamin",
          dosage: "1 tablet",
          frequency: "Daily",
          duration: "30 days",
          notes: "With breakfast",
        },
      ],
    }

    return medicationsByRisk[riskLevel] || medicationsByRisk["Low Risk"]
  }

  getLifestyleRecommendations(patientData) {
    const riskLevel = this.calculateRiskLevel(patientData)

    const recommendationsByRisk = {
      "High Risk": [
        { category: "Exercise", recommendation: "45 min/day supervised activity" },
        { category: "Diet", recommendation: "Strict carb counting, 1800 cal/day" },
        { category: "Monitoring", recommendation: "Blood glucose 4x daily" },
        { category: "Follow-up", recommendation: "Monthly appointments" },
      ],
      "Moderate Risk": [
        { category: "Exercise", recommendation: "30 min/day moderate activity" },
        { category: "Diet", recommendation: "Low glycemic index foods" },
        { category: "Monitoring", recommendation: "Blood glucose 2x daily" },
        { category: "Follow-up", recommendation: "Bi-monthly appointments" },
      ],
      "Low Risk": [
        { category: "Exercise", recommendation: "30 min/day walking" },
        { category: "Diet", recommendation: "Balanced diabetic diet" },
        { category: "Monitoring", recommendation: "Weekly blood glucose checks" },
        { category: "Follow-up", recommendation: "Quarterly appointments" },
      ],
    }

    return recommendationsByRisk[riskLevel] || recommendationsByRisk["Low Risk"]
  }

  getDefaultDoctorNotes(riskLevel) {
    const notesByRisk = {
      "High Risk":
        "Patient requires intensive monitoring due to multiple risk factors. Consider insulin adjustment based on glucose logs. Schedule ophthalmology and podiatry referrals.",
      "Moderate Risk":
        "Continue current medication regimen. Monitor for signs of complications. Encourage lifestyle modifications and regular exercise.",
      "Low Risk":
        "Maintain current management plan. Focus on lifestyle modifications and preventive care. Continue regular monitoring.",
    }

    return notesByRisk[riskLevel] || notesByRisk["Low Risk"]
  }

  // SYNCHRONIZED UPDATE METHOD
  updatePrescriptionData(prescriptionId, updates) {
    this.log("Updating prescription data", { prescriptionId, updates })

    const prescription = this.prescriptions.find((p) => p.id === prescriptionId)
    if (prescription) {
      // Apply updates
      Object.assign(prescription, updates)

      // Save to localStorage immediately
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))
        this.log("Prescription saved to localStorage successfully")
      } catch (error) {
        this.log("ERROR saving to localStorage", error)
        return null
      }

      // Refresh UI
      this.filterByStatus(this.currentStatus)
      this.updateStats()
      this.updateTabCounts()

      this.log("Prescription data updated and synced successfully")
      return prescription
    }

    this.log("ERROR: Prescription not found for update", prescriptionId)
    return null
  }

  // ===== AUTO REFRESH =====

  startAutoRefresh() {
    // Auto refresh every 30 seconds
    this.autoRefreshInterval = setInterval(() => {
      this.silentRefresh()
    }, 30000)

    // Stop auto refresh when page is unloaded
    window.addEventListener("beforeunload", () => {
      if (this.autoRefreshInterval) {
        clearInterval(this.autoRefreshInterval)
      }
    })
  }

  silentRefresh() {
    this.log("Auto-refreshing prescription data...")
    this.syncWithPatients()
    this.loadPrescriptions()
    this.updateStats()
    this.updateTabCounts()
  }

  // ===== EVENT LISTENERS =====

  initializeEventListeners() {
    this.log("Initializing event listeners...")

    // Search functionality
    const searchInput = document.getElementById("searchPrescriptionInput")
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        this.filterPrescriptions()
      })
      this.log("Search input listener attached")
    } else {
      this.log("ERROR: Search input not found")
    }

    // Filter functionality
    const riskFilter = document.getElementById("riskFilter")
    if (riskFilter) {
      riskFilter.addEventListener("change", () => this.filterPrescriptions())
      this.log("Risk filter listener attached")
    } else {
      this.log("ERROR: Risk filter not found")
    }

    // Status tabs
    const statusTabs = document.querySelectorAll(".status-tab")
    if (statusTabs.length > 0) {
      statusTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const status = e.target.closest(".status-tab").getAttribute("data-status")
          this.switchStatusTab(status)
        })
      })
      this.log(`Status tabs listeners attached (${statusTabs.length} tabs)`)
    } else {
      this.log("ERROR: Status tabs not found")
    }

    // Select all checkbox
    const selectAllCheckbox = document.getElementById("selectAllCheckbox")
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener("change", (e) => {
        this.toggleSelectAll(e.target.checked)
      })
      this.log("Select all checkbox listener attached")
    } else {
      this.log("ERROR: Select all checkbox not found")
    }

    // Bulk print button
    const bulkPrintBtn = document.getElementById("bulkPrintBtn")
    if (bulkPrintBtn) {
      bulkPrintBtn.addEventListener("click", () => this.showBulkPrintModal())
      this.log("Bulk print button listener attached")
    } else {
      this.log("ERROR: Bulk print button not found")
    }

    // Generate all button
    const generateAllBtn = document.getElementById("generateAllBtn")
    if (generateAllBtn) {
      generateAllBtn.addEventListener("click", () => this.showGenerateAllModal())
      this.log("Generate all button listener attached")
    } else {
      this.log("ERROR: Generate all button not found")
    }

    // Modal event listeners
    this.initializeModalListeners()

    // Success toast close
    const successToastClose = document.getElementById("successToastClose")
    if (successToastClose) {
      successToastClose.addEventListener("click", () => this.hideSuccessToast())
      this.log("Success toast close listener attached")
    } else {
      this.log("ERROR: Success toast close button not found")
    }

    this.log("Event listeners initialization completed")
  }

  initializeModalListeners() {
    this.log("Initializing modal listeners...")

    // Bulk print modal
    const bulkPrintCloseBtn = document.getElementById("bulkPrintCloseBtn")
    const cancelBulkPrintBtn = document.getElementById("cancelBulkPrintBtn")
    const confirmBulkPrintBtn = document.getElementById("confirmBulkPrintBtn")

    if (bulkPrintCloseBtn) {
      bulkPrintCloseBtn.addEventListener("click", () => this.closeBulkPrintModal())
    }
    if (cancelBulkPrintBtn) {
      cancelBulkPrintBtn.addEventListener("click", () => this.closeBulkPrintModal())
    }
    if (confirmBulkPrintBtn) {
      confirmBulkPrintBtn.addEventListener("click", () => this.executeBulkPrint())
    }

    // Generate all modal
    const generateAllCloseBtn = document.getElementById("generateAllCloseBtn")
    const cancelGenerateAllBtn = document.getElementById("cancelGenerateAllBtn")
    const confirmGenerateAllBtn = document.getElementById("confirmGenerateAllBtn")

    if (generateAllCloseBtn) {
      generateAllCloseBtn.addEventListener("click", () => this.closeGenerateAllModal())
    }
    if (cancelGenerateAllBtn) {
      cancelGenerateAllBtn.addEventListener("click", () => this.closeGenerateAllModal())
    }
    if (confirmGenerateAllBtn) {
      confirmGenerateAllBtn.addEventListener("click", () => this.executeGenerateAll())
    }

    // Close modals when clicking outside
    const modals = document.querySelectorAll(".modal-overlay")
    modals.forEach((modal) => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("show")
          document.body.style.overflow = "auto"
        }
      })
    })

    this.log("Modal listeners initialization completed")
  }

  // ===== DATA MANAGEMENT =====

  syncWithPatients() {
    try {
      this.log("Syncing with patients data...")

      // Get patients from localStorage
      const savedPatients = localStorage.getItem(this.patientsStorageKey)
      this.allPatients = savedPatients ? JSON.parse(savedPatients) : []

      this.log(`Synced with ${this.allPatients.length} patients from patients page`)

      // Debug: Log first patient to see structure
      if (this.allPatients.length > 0) {
        this.log("Sample patient data", this.allPatients[0])
      }
    } catch (error) {
      this.log("ERROR syncing with patients", error)
      this.allPatients = []
    }
  }

  loadPrescriptions() {
    try {
      this.log("Loading prescriptions...")

      // Get existing prescriptions from localStorage
      const savedPrescriptions = localStorage.getItem(this.storageKey)
      const existingPrescriptions = savedPrescriptions ? JSON.parse(savedPrescriptions) : []

      // Create prescription entries for all patients
      this.prescriptions = []

      if (this.allPatients.length === 0) {
        this.log("WARNING: No patients found. Make sure to add patients first.")
        this.showEmptyState()
        return
      }

      this.allPatients.forEach((patient, index) => {
        const existingPrescription = existingPrescriptions.find((p) => p.patientId === patient.patientId)

        if (existingPrescription) {
          // Use existing prescription but update patient data
          existingPrescription.patientData = patient
          this.prescriptions.push(existingPrescription)
        } else {
          // Create a pending prescription entry
          const pendingPrescription = {
            id: `RX${Date.now()}_${index}`,
            patientId: patient.patientId,
            patientData: patient,
            status: "Pending",
            riskLevel: this.calculateRiskLevel(patient),
            generatedDate: null,
            medications: [],
            doctorNotes: "",
            createdAt: new Date().toISOString(),
          }
          this.prescriptions.push(pendingPrescription)
        }
      })

      // Save updated prescriptions list
      localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))

      // Filter and display based on current status
      this.filterByStatus(this.currentStatus)

      this.log(`Loaded ${this.prescriptions.length} prescriptions (synced with patients)`)
    } catch (error) {
      this.log("ERROR loading prescriptions", error)
      this.showEmptyState()
    }
  }

  // ===== STATUS TAB MANAGEMENT =====

  switchStatusTab(status) {
    this.currentStatus = status
    this.log(`Switching to status tab: ${status}`)

    // Update active tab
    document.querySelectorAll(".status-tab").forEach((tab) => tab.classList.remove("active"))
    const activeTab = document.querySelector(`[data-status="${status}"]`)
    if (activeTab) {
      activeTab.classList.add("active")
    }

    // Update section title
    const sectionTitle = document.getElementById("sectionTitle")
    const titles = {
      all: "All Patients",
      pending: "Pending Prescriptions",
      generated: "Generated Prescriptions",
      printed: "Printed Prescriptions",
    }
    if (sectionTitle) {
      sectionTitle.textContent = titles[status] || "All Patients"
    }

    // Filter and display prescriptions
    this.filterByStatus(status)
    this.updateTabCounts()
  }

  filterByStatus(status) {
    let filteredPrescriptions = []

    switch (status) {
      case "all":
        filteredPrescriptions = this.prescriptions
        break
      case "pending":
        filteredPrescriptions = this.prescriptions.filter((p) => p.status === "Pending")
        break
      case "generated":
        filteredPrescriptions = this.prescriptions.filter((p) => p.status === "Generated")
        break
      case "printed":
        filteredPrescriptions = this.prescriptions.filter((p) => p.status === "Printed")
        break
      default:
        filteredPrescriptions = this.prescriptions
    }

    this.log(`Filtering by status "${status}": ${filteredPrescriptions.length} prescriptions`)
    this.populatePrescriptionTable(filteredPrescriptions)
  }

  updateTabCounts() {
    const allCount = this.prescriptions.length
    const pendingCount = this.prescriptions.filter((p) => p.status === "Pending").length
    const generatedCount = this.prescriptions.filter((p) => p.status === "Generated").length
    const printedCount = this.prescriptions.filter((p) => p.status === "Printed").length

    // Update tab counts
    const allCountEl = document.getElementById("allCount")
    const pendingCountEl = document.getElementById("pendingCount")
    const generatedCountEl = document.getElementById("generatedCount")
    const printedCountEl = document.getElementById("printedCount")

    if (allCountEl) allCountEl.textContent = allCount
    if (pendingCountEl) pendingCountEl.textContent = pendingCount
    if (generatedCountEl) generatedCountEl.textContent = generatedCount
    if (printedCountEl) printedCountEl.textContent = printedCount

    this.log(
      `Tab counts updated: All(${allCount}), Pending(${pendingCount}), Generated(${generatedCount}), Printed(${printedCount})`,
    )
  }

  populatePrescriptionTable(prescriptions) {
    const tableBody = document.getElementById("prescriptionTableBody")
    const emptyState = document.getElementById("emptyState")

    if (!tableBody) {
      this.log("ERROR: Table body not found!")
      return
    }

    // Clear existing rows
    tableBody.innerHTML = ""

    if (prescriptions.length === 0) {
      this.showEmptyState()
      return
    }

    // Hide empty state
    if (emptyState) {
      emptyState.style.display = "none"
    }

    // Add prescription rows
    prescriptions.forEach((prescription, index) => {
      const row = this.createPrescriptionRow(prescription, index + 1)
      tableBody.appendChild(row)
    })

    // Attach event listeners to new rows
    this.attachRowEventListeners()

    this.log(`Populated table with ${prescriptions.length} prescriptions`)
  }

  createPrescriptionRow(prescription, rowNumber) {
    const row = document.createElement("tr")
    row.setAttribute("data-prescription-id", prescription.id)
    row.setAttribute("data-patient-id", prescription.patientId)

    const riskClass = prescription.riskLevel.toLowerCase().replace(" ", "-")
    const statusClass = prescription.status.toLowerCase()
    const generatedDate = prescription.generatedDate
      ? new Date(prescription.generatedDate).toLocaleDateString()
      : "Not Generated"

    // Get patient data for age and sex
    const age = prescription.patientData?.basicInfo?.age || "N/A"
    const sex = prescription.patientData?.basicInfo?.sex || "N/A"

    row.innerHTML = `
            <td>
              <input type="checkbox" class="select-checkbox row-checkbox" data-prescription-id="${prescription.id}">
            </td>
            <td>${rowNumber}</td>
            <td class="patient-id-cell">${prescription.patientId}</td>
            <td>${age}</td>
            <td>${sex}</td>
            <td><span class="risk-badge ${riskClass}">${prescription.riskLevel}</span></td>
            <td><span class="status-badge ${statusClass}">${prescription.status}</span></td>
            <td>${generatedDate}</td>
            <td class="actions-cell">
              <button class="action-btn view-btn" title="View Details" data-prescription-id="${prescription.id}">
                <span class="material-symbols-outlined">visibility</span>
              </button>
              ${
                prescription.status === "Generated" || prescription.status === "Printed"
                  ? `
                <button class="action-btn print-btn" title="Print Prescription" data-prescription-id="${prescription.id}">
                  <span class="material-symbols-outlined">print</span>
                </button>
              `
                  : ""
              }
              ${
                prescription.status === "Pending"
                  ? `
                <button class="action-btn generate-btn" title="Generate Prescription" data-prescription-id="${prescription.id}">
                  <span class="material-symbols-outlined">auto_fix_high</span>
                </button>
              `
                  : ""
              }
            </td>
          `

    return row
  }

  attachRowEventListeners() {
    this.log("Attaching row event listeners...")

    // Row checkboxes
    const rowCheckboxes = document.querySelectorAll(".row-checkbox")
    rowCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const prescriptionId = e.target.getAttribute("data-prescription-id")
        if (e.target.checked) {
          this.selectedPrescriptions.add(prescriptionId)
        } else {
          this.selectedPrescriptions.delete(prescriptionId)
        }
        this.updateBulkPrintButton()
        this.updateSelectAllCheckbox()
      })
    })

    // View buttons
    const viewButtons = document.querySelectorAll(".view-btn")
    viewButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const prescriptionId = e.target.closest("button").getAttribute("data-prescription-id")
        this.showPrescriptionDetails(prescriptionId)
      })
    })

    // Print buttons
    const printButtons = document.querySelectorAll(".print-btn")
    printButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const prescriptionId = e.target.closest("button").getAttribute("data-prescription-id")
        this.printPrescription(prescriptionId)
      })
    })

    // Generate buttons (in table)
    const generateButtons = document.querySelectorAll(".generate-btn")
    generateButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const prescriptionId = e.target.closest("button").getAttribute("data-prescription-id")
        this.generatePrescriptionFromTable(prescriptionId)
      })
    })

    this.log(
      `Row event listeners attached: ${rowCheckboxes.length} checkboxes, ${viewButtons.length} view buttons, ${printButtons.length} print buttons, ${generateButtons.length} generate buttons`,
    )
  }

  // ===== FILTERING AND SEARCH =====

  filterPrescriptions() {
    const searchTerm = document.getElementById("searchPrescriptionInput")?.value.toLowerCase().trim() || ""
    const riskFilter = document.getElementById("riskFilter")?.value || ""

    const tableBody = document.getElementById("prescriptionTableBody")
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
    let visibleCount = 0

    rows.forEach((row) => {
      const patientId = row.querySelector(".patient-id-cell")?.textContent.toLowerCase() || ""
      const riskBadge = row.querySelector(".risk-badge")?.textContent || ""

      const matchesSearch = !searchTerm || patientId.includes(searchTerm)
      const matchesRisk = !riskFilter || riskBadge === riskFilter

      const shouldShow = matchesSearch && matchesRisk

      row.style.display = shouldShow ? "" : "none"
      if (shouldShow) visibleCount++
    })

    // Show/hide empty state
    const emptyState = document.getElementById("emptyState")
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? "block" : "none"
    }

    this.log(`Filtered prescriptions: ${visibleCount} visible`)
  }

  // ===== SELECTION MANAGEMENT =====

  toggleSelectAll(checked) {
    const rowCheckboxes = document.querySelectorAll(".row-checkbox")
    const visibleCheckboxes = Array.from(rowCheckboxes).filter((cb) => cb.closest("tr").style.display !== "none")

    this.selectedPrescriptions.clear()

    visibleCheckboxes.forEach((checkbox) => {
      checkbox.checked = checked
      if (checked) {
        const prescriptionId = checkbox.getAttribute("data-prescription-id")
        this.selectedPrescriptions.add(prescriptionId)
      }
    })

    this.updateBulkPrintButton()
    this.log(`Select all toggled: ${checked}, ${this.selectedPrescriptions.size} selected`)
  }

  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById("selectAllCheckbox")
    const rowCheckboxes = document.querySelectorAll(".row-checkbox")
    const visibleCheckboxes = Array.from(rowCheckboxes).filter((cb) => cb.closest("tr").style.display !== "none")
    const checkedVisible = visibleCheckboxes.filter((cb) => cb.checked)

    if (selectAllCheckbox) {
      if (checkedVisible.length === 0) {
        selectAllCheckbox.checked = false
        selectAllCheckbox.indeterminate = false
      } else if (checkedVisible.length === visibleCheckboxes.length) {
        selectAllCheckbox.checked = true
        selectAllCheckbox.indeterminate = false
      } else {
        selectAllCheckbox.checked = false
        selectAllCheckbox.indeterminate = true
      }
    }
  }

  updateBulkPrintButton() {
    const bulkPrintBtn = document.getElementById("bulkPrintBtn")
    const selectedCount = document.getElementById("selectedCount")

    if (bulkPrintBtn && selectedCount) {
      const count = this.selectedPrescriptions.size
      selectedCount.textContent = count
      bulkPrintBtn.disabled = count === 0
      this.log(`Bulk print button updated: ${count} selected`)
    }
  }

  // ===== STATISTICS =====

  updateStats() {
    try {
      const totalPatients = this.allPatients.length
      const pending = this.prescriptions.filter((p) => p.status === "Pending").length
      const generated = this.prescriptions.filter((p) => p.status === "Generated").length
      const printed = this.prescriptions.filter((p) => p.status === "Printed").length

      // Update stat cards
      const totalPatientsEl = document.getElementById("totalPatients")
      const pendingEl = document.getElementById("pendingPrescriptions")
      const generatedEl = document.getElementById("generatedPrescriptions")
      const printedEl = document.getElementById("printedPrescriptions")

      if (totalPatientsEl) totalPatientsEl.textContent = totalPatients
      if (pendingEl) pendingEl.textContent = pending
      if (generatedEl) generatedEl.textContent = generated
      if (printedEl) printedEl.textContent = printed

      this.log(
        `Stats updated: ${totalPatients} patients, ${pending} pending, ${generated} generated, ${printed} printed`,
      )
    } catch (error) {
      this.log("ERROR updating stats", error)
    }
  }

  // ===== PRESCRIPTION DETAILS MODAL =====

  showPrescriptionDetails(prescriptionId) {
    this.log(`Showing prescription details for: ${prescriptionId}`)
    // This will be overridden by the modal manager
    if (window.prescriptionDetailsModal) {
      window.prescriptionDetailsModal.showPrescriptionDetails(prescriptionId)
    } else {
      this.log("ERROR: Prescription details modal not available")
    }
  }

  // ===== GENERATION FUNCTIONALITY =====

  showGenerateAllModal() {
    const pendingCount = this.prescriptions.filter((p) => p.status === "Pending").length
    this.log(`Showing generate all modal for ${pendingCount} pending prescriptions`)

    const pendingGenerateCount = document.getElementById("pendingGenerateCount")
    if (pendingGenerateCount) {
      pendingGenerateCount.textContent = pendingCount
    }

    const modal = document.getElementById("generateAllModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  closeGenerateAllModal() {
    const modal = document.getElementById("generateAllModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  executeGenerateAll() {
    this.showLoading("Generating all pending prescriptions...")
    this.log("Executing generate all...")

    // FAST GENERATION - 300ms only
    setTimeout(() => {
      try {
        let generatedCount = 0

        this.prescriptions.forEach((prescription) => {
          if (prescription.status === "Pending") {
            // Generate prescription
            prescription.status = "Generated"
            prescription.generatedDate = new Date().toISOString()
            prescription.medications = this.getDefaultMedications(prescription.riskLevel)
            prescription.doctorNotes = this.getDefaultDoctorNotes(prescription.riskLevel)
            generatedCount++
          }
        })

        // Save updated prescriptions
        localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))

        // Refresh UI
        this.filterByStatus(this.currentStatus)
        this.updateStats()
        this.updateTabCounts()

        this.hideLoading()
        this.closeGenerateAllModal()
        this.showSuccessToast("Generation Complete", `${generatedCount} prescriptions generated successfully`)
        this.log(`Generate all completed: ${generatedCount} prescriptions generated`)
      } catch (error) {
        this.log("ERROR generating prescriptions", error)
        this.hideLoading()
        this.showSuccessToast("Generation Error", "Failed to generate prescriptions")
      }
    }, 300) // FAST - only 300ms
  }

  generatePrescriptionFromTable(prescriptionId) {
    this.showLoading("Generating prescription...")
    this.log(`Generating prescription from table: ${prescriptionId}`)

    // FAST GENERATION - 200ms only
    setTimeout(() => {
      try {
        const prescription = this.prescriptions.find((p) => p.id === prescriptionId)

        if (prescription && prescription.status === "Pending") {
          // Generate prescription
          prescription.status = "Generated"
          prescription.generatedDate = new Date().toISOString()
          prescription.medications = this.getDefaultMedications(prescription.riskLevel)
          prescription.doctorNotes = this.getDefaultDoctorNotes(prescription.riskLevel)

          // Save updated prescriptions
          localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))

          // Refresh UI
          this.filterByStatus(this.currentStatus)
          this.updateStats()
          this.updateTabCounts()

          this.hideLoading()
          this.showSuccessToast(
            "Prescription Generated",
            `Prescription for ${prescription.patientId} generated successfully`,
          )
          this.log(`Prescription generated successfully for ${prescription.patientId}`)
        }
      } catch (error) {
        this.log("ERROR generating prescription from table", error)
        this.hideLoading()
        this.showSuccessToast("Generation Error", "Failed to generate prescription")
      }
    }, 200) // FAST - only 200ms
  }

  // ===== BULK PRINT FUNCTIONALITY =====

  showBulkPrintModal() {
    if (this.selectedPrescriptions.size === 0) return

    this.log(`Showing bulk print modal for ${this.selectedPrescriptions.size} prescriptions`)

    const bulkPrintCount = document.getElementById("bulkPrintCount")
    const selectedPrescriptionsList = document.getElementById("selectedPrescriptionsList")

    if (bulkPrintCount) {
      bulkPrintCount.textContent = this.selectedPrescriptions.size
    }

    if (selectedPrescriptionsList) {
      selectedPrescriptionsList.innerHTML = ""

      this.selectedPrescriptions.forEach((prescriptionId) => {
        const prescription = this.prescriptions.find((p) => p.id === prescriptionId)
        if (prescription) {
          const item = document.createElement("div")
          item.className = "selected-item"
          item.innerHTML = `
                  <div class="selected-item-info">${prescription.patientId}</div>
                  <div class="selected-item-status">${prescription.status}</div>
                `
          selectedPrescriptionsList.appendChild(item)
        }
      })
    }

    const modal = document.getElementById("bulkPrintModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  closeBulkPrintModal() {
    const modal = document.getElementById("bulkPrintModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  executeBulkPrint() {
    this.showLoading("Preparing prescriptions for printing...")
    this.log("Executing bulk print...")

    const printFormat = document.querySelector('input[name="printFormat"]:checked')?.value || "individual"

    setTimeout(() => {
      try {
        const selectedPrescriptionData = Array.from(this.selectedPrescriptions)
          .map((id) => this.prescriptions.find((p) => p.id === id))
          .filter(Boolean)
          .filter((p) => p.status === "Generated" || p.status === "Printed") // Only print generated prescriptions

        if (selectedPrescriptionData.length === 0) {
          this.hideLoading()
          this.showSuccessToast("Print Error", "No generated prescriptions selected for printing")
          return
        }

        if (printFormat === "individual") {
          this.printIndividualPrescriptions(selectedPrescriptionData)
        } else {
          this.printCombinedPrescriptions(selectedPrescriptionData)
        }

        // Update prescription status to printed
        selectedPrescriptionData.forEach((prescription) => {
          prescription.status = "Printed"
          prescription.printedDate = new Date().toISOString()
        })

        // Save updated prescriptions
        localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))

        // Clear selection and refresh
        this.selectedPrescriptions.clear()
        this.updateBulkPrintButton()
        this.updateSelectAllCheckbox()
        this.filterByStatus(this.currentStatus)
        this.updateStats()
        this.updateTabCounts()

        this.hideLoading()
        this.closeBulkPrintModal()
        this.showSuccessToast(
          "Bulk Print Successful",
          `${selectedPrescriptionData.length} prescriptions sent to printer`,
        )
        this.log(`Bulk print completed: ${selectedPrescriptionData.length} prescriptions`)
      } catch (error) {
        this.log("ERROR during bulk print", error)
        this.hideLoading()
        this.showSuccessToast("Print Error", "Failed to print prescriptions")
      }
    }, 600)
  }

  printIndividualPrescriptions(prescriptions) {
    prescriptions.forEach((prescription, index) => {
      setTimeout(() => {
        this.printSinglePrescriptionData(prescription)
      }, index * 500) // Stagger printing
    })
  }

  printCombinedPrescriptions(prescriptions) {
    const printWindow = window.open("", "_blank", "width=800,height=600")

    let combinedContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Bulk Prescriptions - Diabetech</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .prescription-page { page-break-after: always; margin-bottom: 40px; }
                .prescription-page:last-child { page-break-after: auto; }
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
          `

    prescriptions.forEach((prescription, index) => {
      const medications =
        prescription.medications.length > 0
          ? prescription.medications
          : this.getDefaultMedications(prescription.riskLevel)

      combinedContent += `
              <div class="prescription-page">
                <div class="header">
                  <h1>PRESCRIPTION</h1>
                  <h2>Diabetech Medical Center</h2>
                </div>
                
                <div class="patient-info">
                  <h3>Patient Information</h3>
                  <p><strong>Patient ID:</strong> ${prescription.patientId}</p>
                  <p><strong>Age:</strong> ${prescription.patientData.basicInfo?.age || "N/A"} yrs</p>
                  <p><strong>Sex:</strong> ${prescription.patientData.basicInfo?.sex || "N/A"}</p>
                  <p><strong>Risk Level:</strong> ${prescription.riskLevel}</p>
                  <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="section">
                  <h3>Prescribed Medications</h3>
                  <table>
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
                      ${medications
                        .map(
                          (med) => `
                        <tr>
                          <td>${med.medication}</td>
                          <td>${med.dosage}</td>
                          <td>${med.frequency}</td>
                          <td>${med.duration}</td>
                          <td>${med.notes || ""}</td>
                        </tr>
                      `,
                        )
                        .join("")}
                    </tbody>
                  </table>
                </div>
                
                <div class="section">
                  <h3>Doctor's Additional Notes</h3>
                  <div class="notes">
                    ${prescription.doctorNotes || "No additional notes provided."}
                  </div>
                </div>
              </div>
            `
    })

    combinedContent += `
              <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                Generated on ${new Date().toLocaleString()} | Diabetech Medical System<br>
                Bulk Print: ${prescriptions.length} prescriptions
              </div>
            </body>
            </html>
          `

    printWindow.document.write(combinedContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  // ===== SINGLE PRESCRIPTION ACTIONS =====

  printSinglePrescriptionData(prescription) {
    const printWindow = window.open("", "_blank", "width=800,height=600")

    const medications =
      prescription.medications.length > 0
        ? prescription.medications
        : this.getDefaultMedications(prescription.riskLevel)

    const lifestyle = this.getLifestyleRecommendations(prescription.patientData)

    const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Prescription - ${prescription.patientId}</title>
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
                .lifestyle-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .lifestyle-item { padding: 10px; background: #f8f9fa; border-radius: 5px; }
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
                <p><strong>Patient ID:</strong> ${prescription.patientId}</p>
                <p><strong>Age:</strong> ${prescription.patientData.basicInfo?.age || "N/A"} yrs</p>
                <p><strong>Sex:</strong> ${prescription.patientData.basicInfo?.sex || "N/A"}</p>
                <p><strong>Risk Level:</strong> ${prescription.riskLevel}</p>
                <p><strong>BMI:</strong> ${prescription.patientData.health?.bmi || "N/A"}</p>
                <p><strong>Glucose Level:</strong> ${prescription.patientData.health?.fastingGlucose || "N/A"} mg/dL</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>
              
              <div class="section">
                <h3>Prescribed Medications</h3>
                <table>
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
                    ${medications
                      .map(
                        (med) => `
                      <tr>
                        <td>${med.medication}</td>
                        <td>${med.dosage}</td>
                        <td>${med.frequency}</td>
                        <td>${med.duration}</td>
                        <td>${med.notes || ""}</td>
                      </tr>
                    `,
                      )
                      .join("")}
                  </tbody>
                </table>
              </div>
              
              <div class="section">
                <h3>Lifestyle Recommendations</h3>
                <div class="lifestyle-grid">
                  ${lifestyle
                    .map(
                      (rec) => `
                    <div class="lifestyle-item">
                      <strong>${rec.category}:</strong> ${rec.recommendation}
                    </div>
                  `,
                    )
                    .join("")}
                </div>
              </div>
              
              <div class="section">
                <h3>Doctor's Additional Notes</h3>
                <div class="notes">
                  ${prescription.doctorNotes || "No additional notes provided."}
                </div>
              </div>
              
              <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
                Generated on ${new Date().toLocaleString()} | Diabetech Medical System
              </div>
            </body>
            </html>
          `

    printWindow.document.write(printContent)
    printWindow.document.close()

    printWindow.onload = () => {
      printWindow.print()
      printWindow.close()
    }
  }

  printPrescription(prescriptionId) {
    const prescription = this.prescriptions.find((p) => p.id === prescriptionId)

    if (prescription) {
      this.printSinglePrescriptionData(prescription)

      // Update status
      prescription.status = "Printed"
      prescription.printedDate = new Date().toISOString()
      localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))

      // Refresh UI
      this.filterByStatus(this.currentStatus)
      this.updateStats()
      this.updateTabCounts()
      this.showSuccessToast("Print Successful", "Prescription sent to printer")
      this.log(`Prescription printed: ${prescription.patientId}`)
    }
  }

  // ===== UTILITY FUNCTIONS =====

  calculateRiskLevel(patientData) {
    let riskScore = 0

    // Age factor
    const age = patientData.basicInfo?.age || 0
    if (age > 65) riskScore += 20
    else if (age > 45) riskScore += 10

    // Health factors
    const fastingGlucose = patientData.health?.fastingGlucose || 0
    const hba1c = patientData.health?.hba1c || 0

    if (fastingGlucose > 126) riskScore += 30
    else if (fastingGlucose > 100) riskScore += 15

    if (hba1c > 7) riskScore += 25
    else if (hba1c > 6.5) riskScore += 15

    // BMI factor
    const bmi = patientData.health?.bmi || 0
    if (bmi > 30) riskScore += 15
    else if (bmi > 25) riskScore += 8

    // Lifestyle factors
    if (patientData.basicInfo?.smokingStatus === "Smoker") riskScore += 15
    if (patientData.lifestyle?.physicalActivity === "Sedentary") riskScore += 10

    if (riskScore >= 50) return "High Risk"
    else if (riskScore >= 25) return "Moderate Risk"
    else return "Low Risk"
  }

  // ===== UI HELPERS =====

  showEmptyState() {
    const emptyState = document.getElementById("emptyState")
    if (emptyState) {
      emptyState.style.display = "block"
    }
  }

  showLoading(message = "Processing...") {
    const loadingOverlay = document.getElementById("loadingOverlay")
    const loadingText = document.getElementById("loadingText")

    if (loadingText) loadingText.textContent = message
    if (loadingOverlay) {
      loadingOverlay.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  hideLoading() {
    const loadingOverlay = document.getElementById("loadingOverlay")
    if (loadingOverlay) {
      loadingOverlay.classList.remove("show")
      document.body.style.overflow = "auto"
    }
  }

  showSuccessToast(title, message) {
    const toast = document.getElementById("successToast")
    const toastTitle = toast?.querySelector(".toast-title")
    const toastMessage = toast?.querySelector(".toast-message")

    if (toastTitle) toastTitle.textContent = title
    if (toastMessage) toastMessage.textContent = message

    if (toast) {
      toast.classList.remove("hidden")
      toast.classList.add("show")

      // Auto hide after 5 seconds
      setTimeout(() => {
        this.hideSuccessToast()
      }, 5000)
    }
  }

  hideSuccessToast() {
    const toast = document.getElementById("successToast")
    if (toast) {
      toast.classList.remove("show")
      toast.classList.add("hidden")
    }
  }
}

// Initialize the prescription manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.prescriptionManager = new PrescriptionManager()
  console.log("✅ Prescription Manager initialized")
})
