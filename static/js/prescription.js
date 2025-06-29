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
      this.init()
    }
  
    init() {
      console.log("🏥 Initializing Prescription Manager...")
      this.initializeEventListeners()
  
      // Add a small delay to ensure DOM is fully loaded
      setTimeout(() => {
        this.syncWithPatients()
        this.loadPrescriptions()
        this.updateStats()
        this.updateTabCounts()
        console.log("✅ Prescription Manager initialized successfully")
      }, 100)
    }
  
    // ===== EVENT LISTENERS =====
  
    initializeEventListeners() {
      // Search functionality
      const searchInput = document.getElementById("searchPrescriptionInput")
      if (searchInput) {
        searchInput.addEventListener("input", () => {
          this.filterPrescriptions()
        })
      }
  
      // Filter functionality
      const riskFilter = document.getElementById("riskFilter")
      if (riskFilter) {
        riskFilter.addEventListener("change", () => this.filterPrescriptions())
      }
  
      // Status tabs
      const statusTabs = document.querySelectorAll(".status-tab")
      statusTabs.forEach((tab) => {
        tab.addEventListener("click", (e) => {
          const status = e.target.closest(".status-tab").getAttribute("data-status")
          this.switchStatusTab(status)
        })
      })
  
      // Refresh button
      const refreshBtn = document.getElementById("refreshBtn")
      if (refreshBtn) {
        refreshBtn.addEventListener("click", () => this.refreshPrescriptions())
      }
  
      // Select all checkbox
      const selectAllCheckbox = document.getElementById("selectAllCheckbox")
      if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", (e) => {
          this.toggleSelectAll(e.target.checked)
        })
      }
  
      // Bulk print button
      const bulkPrintBtn = document.getElementById("bulkPrintBtn")
      if (bulkPrintBtn) {
        bulkPrintBtn.addEventListener("click", () => this.showBulkPrintModal())
      }
  
      // Generate all button
      const generateAllBtn = document.getElementById("generateAllBtn")
      if (generateAllBtn) {
        generateAllBtn.addEventListener("click", () => this.showGenerateAllModal())
      }
  
      // Modal event listeners
      this.initializeModalListeners()
    }
  
    initializeModalListeners() {
      // Prescription details modal
      const prescriptionDetailsCloseBtn = document.getElementById("prescriptionDetailsCloseBtn")
      if (prescriptionDetailsCloseBtn) {
        prescriptionDetailsCloseBtn.addEventListener("click", () => this.closePrescriptionDetailsModal())
      }
  
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
  
      // Print single button
      const printSingleBtn = document.getElementById("printSingleBtn")
      if (printSingleBtn) {
        printSingleBtn.addEventListener("click", () => this.printSinglePrescription())
      }
  
      // Generate single button
      const generatePrescriptionBtn = document.getElementById("generatePrescriptionBtn")
      if (generatePrescriptionBtn) {
        generatePrescriptionBtn.addEventListener("click", () => this.generateSinglePrescription())
      }
  
      // Edit prescription button
      const editPrescriptionBtn = document.getElementById("editPrescriptionBtn")
      if (editPrescriptionBtn) {
        editPrescriptionBtn.addEventListener("click", () => this.editPrescription())
      }
  
      // Success toast close
      const successToastClose = document.getElementById("successToastClose")
      if (successToastClose) {
        successToastClose.addEventListener("click", () => this.hideSuccessToast())
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
    }
  
    // ===== DATA MANAGEMENT =====
  
    syncWithPatients() {
      try {
        // Get patients from localStorage
        const savedPatients = localStorage.getItem(this.patientsStorageKey)
        this.allPatients = savedPatients ? JSON.parse(savedPatients) : []
  
        console.log(`🔄 Synced with ${this.allPatients.length} patients from patients page`)
  
        // Debug: Log first patient to see structure
        if (this.allPatients.length > 0) {
          console.log("📋 Sample patient data:", this.allPatients[0])
        }
      } catch (error) {
        console.error("❌ Error syncing with patients:", error)
        this.allPatients = []
      }
    }
  
    loadPrescriptions() {
      try {
        console.log("📋 Loading prescriptions...")
  
        // Get existing prescriptions from localStorage
        const savedPrescriptions = localStorage.getItem(this.storageKey)
        const existingPrescriptions = savedPrescriptions ? JSON.parse(savedPrescriptions) : []
  
        // Create prescription entries for all patients
        this.prescriptions = []
  
        if (this.allPatients.length === 0) {
          console.log("⚠️ No patients found. Make sure to add patients first.")
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
  
        console.log(`✅ Loaded ${this.prescriptions.length} prescriptions (synced with patients)`)
      } catch (error) {
        console.error("❌ Error loading prescriptions:", error)
        this.showEmptyState()
      }
    }
  
    // ===== STATUS TAB MANAGEMENT =====
  
    switchStatusTab(status) {
      this.currentStatus = status
  
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
  
      console.log(`🔍 Filtering by status "${status}": ${filteredPrescriptions.length} prescriptions`)
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
  
      console.log(
        `📊 Tab counts updated: All(${allCount}), Pending(${pendingCount}), Generated(${generatedCount}), Printed(${printedCount})`,
      )
    }
  
    populatePrescriptionTable(prescriptions) {
      const tableBody = document.getElementById("prescriptionTableBody")
      const emptyState = document.getElementById("emptyState")
  
      if (!tableBody) {
        console.error("❌ Table body not found!")
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
  
      console.log(`✅ Populated table with ${prescriptions.length} prescriptions`)
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
                : `
              <button class="action-btn edit-btn" title="Edit Prescription" data-prescription-id="${prescription.id}">
                <span class="material-symbols-outlined">edit</span>
              </button>
            `
            }
          </td>
        `
  
      return row
    }
  
    attachRowEventListeners() {
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
  
      // Edit buttons
      const editButtons = document.querySelectorAll(".edit-btn")
      editButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const prescriptionId = e.target.closest("button").getAttribute("data-prescription-id")
          this.editPrescriptionFromTable(prescriptionId)
        })
      })
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
  
      console.log(`🔍 Filtered prescriptions: ${visibleCount} visible`)
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
  
        console.log(
          `📊 Stats updated: ${totalPatients} patients, ${pending} pending, ${generated} generated, ${printed} printed`,
        )
      } catch (error) {
        console.error("❌ Error updating stats:", error)
      }
    }
  
    // ===== PRESCRIPTION DETAILS MODAL =====
  
    showPrescriptionDetails(prescriptionId) {
      try {
        const prescription = this.prescriptions.find((p) => p.id === prescriptionId)
  
        if (!prescription) {
          console.error("❌ Prescription not found:", prescriptionId)
          return
        }
  
        // Store current prescription for modal actions
        this.currentPrescription = prescription
  
        // Update modal header
        const prescriptionNumber = document.getElementById("prescriptionNumber")
        const prescriptionPatientId = document.getElementById("prescriptionPatientId")
        const prescriptionStatus = document.getElementById("prescriptionStatus")
        const prescriptionDate = document.getElementById("prescriptionDate")
        const prescriptionRiskBadge = document.getElementById("prescriptionRiskBadge")
  
        if (prescriptionNumber) {
          const rowNumber =
            Array.from(document.querySelectorAll("[data-prescription-id]")).findIndex(
              (el) => el.getAttribute("data-prescription-id") === prescriptionId,
            ) + 1
          prescriptionNumber.textContent = `#${rowNumber}`
        }
  
        if (prescriptionPatientId) prescriptionPatientId.textContent = prescription.patientId
        if (prescriptionStatus) {
          prescriptionStatus.textContent = prescription.status
          prescriptionStatus.className = `status-badge ${prescription.status.toLowerCase()}`
        }
        if (prescriptionDate) {
          prescriptionDate.textContent = prescription.generatedDate
            ? new Date(prescription.generatedDate).toLocaleDateString()
            : "Not Generated"
        }
        if (prescriptionRiskBadge) {
          prescriptionRiskBadge.textContent = prescription.riskLevel
          prescriptionRiskBadge.className = `risk-badge-header ${prescription.riskLevel.toLowerCase().replace(" ", "-")}`
        }
  
        // Show/hide buttons based on status
        const generateBtn = document.getElementById("generatePrescriptionBtn")
        const printBtn = document.getElementById("printSingleBtn")
        const editBtn = document.getElementById("editPrescriptionBtn")
  
        if (generateBtn) {
          generateBtn.style.display = prescription.status === "Pending" ? "flex" : "none"
        }
        if (printBtn) {
          printBtn.style.display =
            prescription.status === "Generated" || prescription.status === "Printed" ? "flex" : "none"
        }
        if (editBtn) {
          editBtn.style.display = prescription.status !== "Pending" ? "flex" : "none"
        }
  
        // Update patient summary
        this.updatePatientSummary(prescription.patientData)
  
        // Update medications table
        this.updateMedicationsTable(prescription.medications)
  
        // Update lifestyle recommendations
        this.updateLifestyleRecommendations(prescription.patientData)
  
        // Update doctor's notes
        this.updateDoctorNotes(prescription.doctorNotes)
  
        // Show modal
        const modal = document.getElementById("prescriptionDetailsModal")
        if (modal) {
          modal.classList.add("show")
          document.body.style.overflow = "hidden"
        }
      } catch (error) {
        console.error("❌ Error showing prescription details:", error)
      }
    }
  
    updatePatientSummary(patientData) {
      const patientAgeDetail = document.getElementById("patientAgeDetail")
      const patientSexDetail = document.getElementById("patientSexDetail")
      const patientBMIDetail = document.getElementById("patientBMIDetail")
      const patientGlucoseDetail = document.getElementById("patientGlucoseDetail")
  
      if (patientAgeDetail) patientAgeDetail.textContent = `${patientData.basicInfo?.age || "N/A"} yrs`
      if (patientSexDetail) patientSexDetail.textContent = patientData.basicInfo?.sex || "N/A"
      if (patientBMIDetail) patientBMIDetail.textContent = patientData.health?.bmi || "N/A"
      if (patientGlucoseDetail) patientGlucoseDetail.textContent = `${patientData.health?.fastingGlucose || "N/A"} mg/dL`
    }
  
    updateMedicationsTable(medications) {
      const tableBody = document.querySelector("#prescriptionMedicationsTable tbody")
      if (!tableBody) return
  
      tableBody.innerHTML = ""
  
      if (!medications || medications.length === 0) {
        // Show default medications based on risk level
        const defaultMedications = this.getDefaultMedications(this.currentPrescription?.riskLevel)
        defaultMedications.forEach((med) => {
          const row = document.createElement("tr")
          row.innerHTML = `
              <td>${med.medication}</td>
              <td>${med.dosage}</td>
              <td>${med.frequency}</td>
              <td>${med.duration}</td>
              <td>${med.notes}</td>
            `
          tableBody.appendChild(row)
        })
      } else {
        medications.forEach((med) => {
          const row = document.createElement("tr")
          row.innerHTML = `
              <td>${med.medication}</td>
              <td>${med.dosage}</td>
              <td>${med.frequency}</td>
              <td>${med.duration}</td>
              <td>${med.notes || ""}</td>
            `
          tableBody.appendChild(row)
        })
      }
    }
  
    updateLifestyleRecommendations(patientData) {
      const lifestyleContainer = document.getElementById("prescriptionLifestyle")
      if (!lifestyleContainer) return
  
      const recommendations = this.getLifestyleRecommendations(patientData)
  
      lifestyleContainer.innerHTML = ""
      recommendations.forEach((rec) => {
        const item = document.createElement("div")
        item.className = "lifestyle-item"
        item.innerHTML = `
            <span class="lifestyle-label">${rec.category}</span>
            <span class="lifestyle-value">${rec.recommendation}</span>
          `
        lifestyleContainer.appendChild(item)
      })
    }
  
    updateDoctorNotes(notes) {
      const notesContainer = document.getElementById("prescriptionDoctorNotes")
      if (!notesContainer) return
  
      if (notes && notes.trim()) {
        notesContainer.innerHTML = `<p>${notes}</p>`
      } else {
        notesContainer.innerHTML = `<p>No additional notes provided.</p>`
      }
    }
  
    closePrescriptionDetailsModal() {
      const modal = document.getElementById("prescriptionDetailsModal")
      if (modal) {
        modal.classList.remove("show")
        document.body.style.overflow = "auto"
      }
      this.currentPrescription = null
    }
  
    // ===== GENERATION FUNCTIONALITY =====
  
    showGenerateAllModal() {
      const pendingCount = this.prescriptions.filter((p) => p.status === "Pending").length
  
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
        } catch (error) {
          console.error("❌ Error generating prescriptions:", error)
          this.hideLoading()
          this.showSuccessToast("Generation Error", "Failed to generate prescriptions")
        }
      }, 3000)
    }
  
    generateSinglePrescription() {
      if (!this.currentPrescription) return
  
      this.showLoading("Generating prescription...")
  
      setTimeout(() => {
        try {
          const prescription = this.prescriptions.find((p) => p.id === this.currentPrescription.id)
  
          if (prescription && prescription.status === "Pending") {
            // Generate prescription
            prescription.status = "Generated"
            prescription.generatedDate = new Date().toISOString()
            prescription.medications = this.getDefaultMedications(prescription.riskLevel)
            prescription.doctorNotes = this.getDefaultDoctorNotes(prescription.riskLevel)
  
            // Save updated prescriptions
            localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))
  
            // Update current prescription reference
            this.currentPrescription = prescription
  
            // Refresh UI
            this.filterByStatus(this.currentStatus)
            this.updateStats()
            this.updateTabCounts()
  
            // Update modal content
            this.updateMedicationsTable(prescription.medications)
            this.updateDoctorNotes(prescription.doctorNotes)
  
            // Update modal buttons
            const generateBtn = document.getElementById("generatePrescriptionBtn")
            const printBtn = document.getElementById("printSingleBtn")
            const editBtn = document.getElementById("editPrescriptionBtn")
            const statusBadge = document.getElementById("prescriptionStatus")
            const dateBadge = document.getElementById("prescriptionDate")
  
            if (generateBtn) generateBtn.style.display = "none"
            if (printBtn) printBtn.style.display = "flex"
            if (editBtn) editBtn.style.display = "flex"
            if (statusBadge) {
              statusBadge.textContent = "Generated"
              statusBadge.className = "status-badge generated"
            }
            if (dateBadge) {
              dateBadge.textContent = new Date().toLocaleDateString()
            }
  
            this.hideLoading()
            this.showSuccessToast("Prescription Generated", "Prescription generated successfully")
          }
        } catch (error) {
          console.error("❌ Error generating single prescription:", error)
          this.hideLoading()
          this.showSuccessToast("Generation Error", "Failed to generate prescription")
        }
      }, 2000)
    }
  
    generatePrescriptionFromTable(prescriptionId) {
      this.showLoading("Generating prescription...")
  
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
          }
        } catch (error) {
          console.error("❌ Error generating prescription from table:", error)
          this.hideLoading()
          this.showSuccessToast("Generation Error", "Failed to generate prescription")
        }
      }, 1500)
    }
  
    // ===== BULK PRINT FUNCTIONALITY =====
  
    showBulkPrintModal() {
      if (this.selectedPrescriptions.size === 0) return
  
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
        } catch (error) {
          console.error("❌ Error during bulk print:", error)
          this.hideLoading()
          this.showSuccessToast("Print Error", "Failed to print prescriptions")
        }
      }, 2000)
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
  
    printSinglePrescription() {
      if (!this.currentPrescription) return
  
      this.printSinglePrescriptionData(this.currentPrescription)
  
      // Update status to printed
      const prescription = this.prescriptions.find((p) => p.id === this.currentPrescription.id)
  
      if (prescription) {
        prescription.status = "Printed"
        prescription.printedDate = new Date().toISOString()
        localStorage.setItem(this.storageKey, JSON.stringify(this.prescriptions))
  
        // Refresh UI
        this.filterByStatus(this.currentStatus)
        this.updateStats()
        this.updateTabCounts()
        this.closePrescriptionDetailsModal()
        this.showSuccessToast("Print Successful", "Prescription sent to printer")
      }
    }
  
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
      }
    }
  
    editPrescription() {
      if (!this.currentPrescription) return
  
      // Close current modal and redirect to patients page
      this.closePrescriptionDetailsModal()
  
      // Store the prescription ID for the patients page to open
      sessionStorage.setItem("openPrescriptionFor", this.currentPrescription.patientId)
  
      // Redirect to patients page
      window.location.href = "/patients"
    }
  
    editPrescriptionFromTable(prescriptionId) {
      const prescription = this.prescriptions.find((p) => p.id === prescriptionId)
  
      if (prescription) {
        // Store the prescription ID for the patients page to open
        sessionStorage.setItem("openPrescriptionFor", prescription.patientId)
  
        // Redirect to patients page
        window.location.href = "/patients"
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
      }
    }
  
    refreshPrescriptions() {
      this.showLoading("Refreshing prescriptions...")
  
      setTimeout(() => {
        this.syncWithPatients()
        this.loadPrescriptions()
        this.updateStats()
        this.updateTabCounts()
        this.hideLoading()
        this.showSuccessToast("Refreshed", "Prescription list updated with latest patient data")
      }, 1000)
    }
  }
  
  // Initialize the prescription manager when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    window.prescriptionManager = new PrescriptionManager()
    console.log("✅ Prescription Manager initialized")
  })
  