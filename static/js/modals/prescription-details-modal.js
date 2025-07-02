// Prescription Details Modal Manager
class PrescriptionDetailsModal {
  constructor() {
    this.currentPrescription = null
    this.isGenerationMode = false
    this.isEditMode = false
    this.tempMedications = []
    this.tempLifestyle = []
    this.tempDoctorNotes = ""
    this.pendingAction = null
    this.debugMode = true // Enable debug mode
    this.init()
  }

  init() {
    console.log("🏥 Initializing Prescription Details Modal...")
    this.log("Starting modal initialization...")
    this.initializeEventListeners()
    this.initializeFilterDropdown()
    this.log("Prescription Details Modal initialized successfully")
    console.log("✅ Prescription Details Modal initialized successfully")
  }

  // Debug logging function
  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toLocaleTimeString()
      console.log(`[${timestamp}] MODAL: ${message}`, data || "")
    }
  }

  // ===== EVENT LISTENERS =====

  initializeEventListeners() {
    this.log("Initializing modal event listeners...")

    // Prescription details modal
    const prescriptionDetailsCloseBtn = document.getElementById("prescriptionDetailsCloseBtn")
    if (prescriptionDetailsCloseBtn) {
      prescriptionDetailsCloseBtn.addEventListener("click", () => this.closePrescriptionDetailsModal())
      this.log("Prescription details close button listener attached")
    } else {
      this.log("ERROR: Prescription details close button not found")
    }

    // Print single button
    const printSingleBtn = document.getElementById("printSingleBtn")
    if (printSingleBtn) {
      printSingleBtn.addEventListener("click", () =>
        this.confirmAction("print", "Are you sure you want to print this prescription?"),
      )
      this.log("Print single button listener attached")
    } else {
      this.log("ERROR: Print single button not found")
    }

    // Generate single button
    const generatePrescriptionBtn = document.getElementById("generatePrescriptionBtn")
    if (generatePrescriptionBtn) {
      generatePrescriptionBtn.addEventListener("click", () => this.startGenerationMode())
      this.log("Generate prescription button listener attached")
    } else {
      this.log("ERROR: Generate prescription button not found")
    }

    // Edit button
    const editPrescriptionBtn = document.getElementById("editPrescriptionBtn")
    if (editPrescriptionBtn) {
      editPrescriptionBtn.addEventListener("click", () => this.startEditMode())
      this.log("Edit prescription button listener attached")
    } else {
      this.log("ERROR: Edit prescription button not found")
    }

    // Edit mode buttons
    const cancelEditBtn = document.getElementById("cancelEditBtn")
    const updatePrescriptionBtn = document.getElementById("updatePrescriptionBtn")

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", () => this.cancelEdit())
      this.log("Cancel edit button listener attached")
    } else {
      this.log("ERROR: Cancel edit button not found")
    }
    if (updatePrescriptionBtn) {
      updatePrescriptionBtn.addEventListener("click", () =>
        this.confirmAction("update", "Are you sure you want to update this prescription?"),
      )
      this.log("Update prescription button listener attached")
    } else {
      this.log("ERROR: Update prescription button not found")
    }

    // Generation mode buttons
    const cancelGenerationBtn = document.getElementById("cancelGenerationBtn")
    const saveGenerationBtn = document.getElementById("saveGenerationBtn")

    if (cancelGenerationBtn) {
      cancelGenerationBtn.addEventListener("click", () => this.cancelGeneration())
      this.log("Cancel generation button listener attached")
    } else {
      this.log("ERROR: Cancel generation button not found")
    }
    if (saveGenerationBtn) {
      saveGenerationBtn.addEventListener("click", () =>
        this.confirmAction("save", "Are you sure you want to save this prescription?"),
      )
      this.log("Save generation button listener attached")
    } else {
      this.log("ERROR: Save generation button not found")
    }

    // Confirmation modal
    this.initializeConfirmationModal()

    this.log("Modal event listeners initialization completed")
  }

  // ===== FILTER DROPDOWN =====

  initializeFilterDropdown() {
    this.log("Initializing filter dropdown...")

    const filterBtn = document.getElementById("riskFilterBtn")
    const filterDropdown = document.getElementById("filterDropdown")
    const filterOptions = document.querySelectorAll(".filter-option")
    const hiddenSelect = document.getElementById("riskFilter")

    if (filterBtn && filterDropdown) {
      // Position dropdown relative to button
      filterBtn.parentElement.style.position = "relative"

      // Toggle dropdown
      filterBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        filterDropdown.classList.toggle("show")
        filterBtn.classList.toggle("active")
      })

      // Handle filter option selection
      filterOptions.forEach((option) => {
        option.addEventListener("click", () => {
          const value = option.getAttribute("data-value")

          // Update hidden select
          if (hiddenSelect) {
            hiddenSelect.value = value
            // Trigger change event for existing functionality
            hiddenSelect.dispatchEvent(new Event("change"))
          }

          // Update visual selection
          filterOptions.forEach((opt) => opt.classList.remove("selected"))
          option.classList.add("selected")

          // Update button state
          if (value) {
            filterBtn.classList.add("active")
          } else {
            filterBtn.classList.remove("active")
          }

          // Close dropdown
          filterDropdown.classList.remove("show")
          filterBtn.classList.remove("active")
        })
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", () => {
        filterDropdown.classList.remove("show")
        filterBtn.classList.remove("active")
      })

      this.log("Filter dropdown initialized successfully")
    } else {
      this.log("ERROR: Filter dropdown elements not found")
    }
  }

  // ===== CONFIRMATION MODAL =====

  initializeConfirmationModal() {
    this.log("Initializing confirmation modal...")

    const confirmationCancelBtn = document.getElementById("confirmationCancelBtn")
    const confirmationConfirmBtn = document.getElementById("confirmationConfirmBtn")
    const confirmationCloseBtn = document.getElementById("confirmationCloseBtn")

    if (confirmationCancelBtn) {
      confirmationCancelBtn.addEventListener("click", () => this.hideConfirmationModal())
    }
    if (confirmationConfirmBtn) {
      confirmationConfirmBtn.addEventListener("click", () => this.executeConfirmedAction())
    }
    if (confirmationCloseBtn) {
      confirmationCloseBtn.addEventListener("click", () => this.hideConfirmationModal())
    }

    // Close modal when clicking outside
    const confirmationModal = document.getElementById("confirmationModal")
    if (confirmationModal) {
      confirmationModal.addEventListener("click", (e) => {
        if (e.target === confirmationModal) {
          this.hideConfirmationModal()
        }
      })
    }

    this.log("Confirmation modal initialized")
  }

  confirmAction(action, message) {
    this.pendingAction = action
    this.showConfirmationModal(message, action)
    this.log(`Confirming action: ${action}`)
  }

  showConfirmationModal(message, actionType) {
    const modal = document.getElementById("confirmationModal")
    const titleEl = document.getElementById("confirmationTitle")
    const messageEl = document.getElementById("confirmationMessage")
    const confirmBtn = document.getElementById("confirmationConfirmBtn")
    const iconEl = document.querySelector(".confirmation-icon .material-symbols-outlined")

    // Set dynamic title and icon based on action
    const actionConfig = {
      save: {
        title: "Save Prescription",
        text: "Save Prescription",
        icon: "save",
        iconColor: "#10b981",
      },
      generate: {
        title: "Generate Prescription",
        text: "Generate",
        icon: "auto_fix_high",
        iconColor: "#10b981",
      },
      print: {
        title: "Print Prescription",
        text: "Print",
        icon: "print",
        iconColor: "#3b82f6",
      },
      update: {
        title: "Update Prescription",
        text: "Update",
        icon: "update",
        iconColor: "#f59e0b",
      },
    }

    const config = actionConfig[actionType] || actionConfig.save

    if (titleEl) titleEl.textContent = config.title
    if (messageEl) messageEl.textContent = message
    if (confirmBtn) {
      confirmBtn.innerHTML = `
        <span class="material-symbols-outlined">${config.icon}</span>
        ${config.text}
      `
    }
    if (iconEl) {
      iconEl.textContent = config.icon
      iconEl.parentElement.style.backgroundColor = config.iconColor + "20"
      iconEl.parentElement.style.color = config.iconColor
    }

    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  hideConfirmationModal() {
    const modal = document.getElementById("confirmationModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
    this.pendingAction = null
  }

  executeConfirmedAction() {
    this.hideConfirmationModal()
    this.log(`Executing confirmed action: ${this.pendingAction}`)

    switch (this.pendingAction) {
      case "save":
        this.saveGeneration()
        break
      case "generate":
        this.generateSinglePrescription()
        break
      case "update":
        this.updatePrescription()
        break
      case "print":
        this.printSinglePrescription()
        break
      default:
        this.log("Unknown action:", this.pendingAction)
    }
  }

  // ===== PRESCRIPTION DETAILS MODAL =====

  showPrescriptionDetails(prescriptionId) {
    try {
      this.log(`Showing prescription details for: ${prescriptionId}`)

      if (!window.prescriptionManager) {
        this.log("ERROR: Prescription manager not available")
        return
      }

      const prescription = window.prescriptionManager.prescriptions.find((p) => p.id === prescriptionId)

      if (!prescription) {
        this.log("ERROR: Prescription not found", prescriptionId)
        return
      }

      // Store current prescription for modal actions
      this.currentPrescription = prescription
      this.log("Current prescription set", prescription)

      // Update modal header (removed prescription number)
      const prescriptionPatientId = document.getElementById("prescriptionPatientId")
      const prescriptionStatus = document.getElementById("prescriptionStatus")
      const prescriptionDate = document.getElementById("prescriptionDate")
      const prescriptionRiskBadge = document.getElementById("prescriptionRiskBadge")

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

      // Show/hide sections based on prescription status
      this.updateModalSections(prescription)

      // Always update patient summary
      this.updatePatientSummary(prescription.patientData)

      // Show modal
      const modal = document.getElementById("prescriptionDetailsModal")
      if (modal) {
        modal.classList.add("show")
        document.body.style.overflow = "hidden"
        this.log("Modal displayed successfully")
      } else {
        this.log("ERROR: Modal element not found")
      }
    } catch (error) {
      this.log("ERROR showing prescription details", error)
    }
  }

  updateModalSections(prescription) {
    this.log(`Updating modal sections for status: ${prescription.status}`)

    const medicationsSection = document.getElementById("medicationsSection")
    const editableMedicationsSection = document.getElementById("editableMedicationsSection")
    const lifestyleSection = document.getElementById("lifestyleSection")
    const notesSection = document.getElementById("notesSection")
    const editableNotesSection = document.getElementById("editableNotesSection")
    const pendingMessage = document.getElementById("pendingMessage")
    const generateBtn = document.getElementById("generatePrescriptionBtn")
    const printBtn = document.getElementById("printSingleBtn")
    const editBtn = document.getElementById("editPrescriptionBtn")
    const normalActions = document.getElementById("normalActions")
    const editActions = document.getElementById("editActions")
    const generationActions = document.getElementById("generationActions")

    // Reset all sections first
    if (editActions) editActions.style.display = "none"
    if (generationActions) generationActions.style.display = "none"

    if (prescription.status === "Pending") {
      // Hide all content sections and show pending message
      if (medicationsSection) medicationsSection.style.display = "none"
      if (editableMedicationsSection) editableMedicationsSection.style.display = "none"
      if (lifestyleSection) lifestyleSection.style.display = "none"
      if (notesSection) notesSection.style.display = "none"
      if (editableNotesSection) editableNotesSection.style.display = "none"
      if (pendingMessage) pendingMessage.style.display = "block"

      // Show only generate button
      if (generateBtn) generateBtn.style.display = "flex"
      if (printBtn) printBtn.style.display = "none"
      if (editBtn) editBtn.style.display = "none"
      if (normalActions) normalActions.style.display = "flex"

      this.log("Modal sections updated for pending status")
    } else {
      // Show content sections and hide pending message
      if (medicationsSection) medicationsSection.style.display = "block"
      if (editableMedicationsSection) editableMedicationsSection.style.display = "none"
      if (lifestyleSection) lifestyleSection.style.display = "block"
      if (notesSection) notesSection.style.display = "block"
      if (editableNotesSection) editableNotesSection.style.display = "none"
      if (pendingMessage) pendingMessage.style.display = "none"

      // Update content for generated prescriptions
      this.updateMedicationsTable(prescription.medications)
      this.updateLifestyleRecommendations(prescription.patientData)
      this.updateDoctorNotes(prescription.doctorNotes)

      // Show print and edit buttons
      if (generateBtn) generateBtn.style.display = "none"
      if (printBtn) printBtn.style.display = "flex"
      if (editBtn) editBtn.style.display = "flex"
      if (normalActions) normalActions.style.display = "flex"

      this.log("Modal sections updated for generated/printed status")
    }
  }

  updatePatientSummary(patientData) {
    this.log("Updating patient summary")

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
    this.log("Updating medications table")

    const tableBody = document.querySelector("#prescriptionMedicationsTable tbody")
    if (!tableBody) {
      this.log("ERROR: Medications table body not found")
      return
    }

    tableBody.innerHTML = ""

    if (!medications || medications.length === 0) {
      // Show default medications based on risk level
      if (window.prescriptionManager && this.currentPrescription) {
        const defaultMedications = window.prescriptionManager.getDefaultMedications(this.currentPrescription.riskLevel)
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
      }
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

  updateEditableMedicationsTable() {
    this.log("Updating editable medications table")

    const tableBody = document.querySelector("#editableMedicationsTable tbody")
    if (!tableBody) return

    tableBody.innerHTML = ""

    this.tempMedications.forEach((med) => {
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
  }

  updateLifestyleRecommendations(patientData) {
    this.log("Updating lifestyle recommendations")

    const lifestyleContainer = document.getElementById("prescriptionLifestyle")
    if (!lifestyleContainer) return

    if (window.prescriptionManager) {
      const recommendations = window.prescriptionManager.getLifestyleRecommendations(patientData)

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
  }

  updateDoctorNotes(notes) {
    this.log("Updating doctor notes", notes)

    const notesContainer = document.getElementById("prescriptionDoctorNotes")
    if (!notesContainer) return

    if (notes && notes.trim()) {
      notesContainer.innerHTML = `<p>${notes}</p>`
    } else {
      notesContainer.innerHTML = `<p>No additional notes provided.</p>`
    }
  }

  closePrescriptionDetailsModal() {
    this.log("Closing prescription details modal")

    const modal = document.getElementById("prescriptionDetailsModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
    }
    this.currentPrescription = null
    this.isGenerationMode = false
    this.isEditMode = false
  }

  // ===== GENERATION FUNCTIONALITY =====

  startGenerationMode() {
    this.log("Starting generation mode")
    this.isGenerationMode = true

    if (!window.prescriptionManager || !this.currentPrescription) {
      this.log("ERROR: Missing prescription manager or current prescription")
      return
    }

    // Generate default content based on risk level
    this.tempMedications = window.prescriptionManager.getDefaultMedications(this.currentPrescription.riskLevel)
    this.tempLifestyle = window.prescriptionManager.getLifestyleRecommendations(this.currentPrescription.patientData)
    this.tempDoctorNotes = window.prescriptionManager.getDefaultDoctorNotes(this.currentPrescription.riskLevel)

    // Hide read-only sections and show editable ones
    const medicationsSection = document.getElementById("medicationsSection")
    const editableMedicationsSection = document.getElementById("editableMedicationsSection")
    const lifestyleSection = document.getElementById("lifestyleSection")
    const notesSection = document.getElementById("notesSection")
    const editableNotesSection = document.getElementById("editableNotesSection")
    const pendingMessage = document.getElementById("pendingMessage")
    const normalActions = document.getElementById("normalActions")
    const generationActions = document.getElementById("generationActions")

    // Hide read-only sections
    if (medicationsSection) medicationsSection.style.display = "none"
    if (lifestyleSection) lifestyleSection.style.display = "none"
    if (notesSection) notesSection.style.display = "none"
    if (pendingMessage) pendingMessage.style.display = "none"

    // Show editable sections
    if (editableMedicationsSection) editableMedicationsSection.style.display = "block"
    if (editableNotesSection) editableNotesSection.style.display = "block"

    // Switch action buttons
    if (normalActions) normalActions.style.display = "none"
    if (generationActions) generationActions.style.display = "flex"

    // Populate editable content
    this.updateEditableMedicationsTable()

    // Populate doctor's notes
    const doctorNotesTextarea = document.getElementById("doctorNotesTextarea")
    if (doctorNotesTextarea) {
      doctorNotesTextarea.value = this.tempDoctorNotes
    }

    this.log("Generation mode started successfully")
  }

  cancelGeneration() {
    this.log("Cancelling generation")
    this.isGenerationMode = false
    this.tempMedications = []
    this.tempLifestyle = []
    this.tempDoctorNotes = ""

    // Show appropriate sections based on prescription status
    this.updateModalSections(this.currentPrescription)
  }

  saveGeneration() {
    if (!this.currentPrescription) {
      this.log("ERROR: No current prescription to save")
      return
    }

    this.log("Saving generation...")
    window.prescriptionManager.showLoading("Saving prescription...")

    // FAST SAVE - only 200ms
    setTimeout(() => {
      try {
        // Get updated doctor's notes from textarea
        const doctorNotesTextarea = document.getElementById("doctorNotesTextarea")
        const updatedNotes = doctorNotesTextarea ? doctorNotesTextarea.value.trim() : this.tempDoctorNotes

        this.log("Saving prescription with notes", updatedNotes)

        // Use the synchronized update method
        const updatedPrescription = window.prescriptionManager.updatePrescriptionData(this.currentPrescription.id, {
          status: "Generated",
          generatedDate: new Date().toISOString(),
          medications: [...this.tempMedications],
          doctorNotes: updatedNotes,
        })

        if (updatedPrescription) {
          // Update current prescription reference
          this.currentPrescription = updatedPrescription

          // Exit generation mode and show generated state
          this.isGenerationMode = false

          // FORCE UPDATE: Immediately update all content
          this.updateMedicationsTable(updatedPrescription.medications)
          this.updateLifestyleRecommendations(updatedPrescription.patientData)
          this.updateDoctorNotes(updatedPrescription.doctorNotes)

          // Update modal sections
          this.updateModalSections(updatedPrescription)

          // Update modal header
          const statusBadge = document.getElementById("prescriptionStatus")
          const dateBadge = document.getElementById("prescriptionDate")

          if (statusBadge) {
            statusBadge.textContent = "Generated"
            statusBadge.className = "status-badge generated"
          }
          if (dateBadge) {
            dateBadge.textContent = new Date().toLocaleDateString()
          }

          window.prescriptionManager.hideLoading()
          this.showSuccessToast("Prescription Saved", "Prescription generated and saved successfully")
          this.log("Prescription saved successfully")
        } else {
          throw new Error("Failed to update prescription")
        }
      } catch (error) {
        this.log("ERROR saving prescription", error)
        window.prescriptionManager.hideLoading()
        this.showSuccessToast("Save Error", "Failed to save prescription")
      }
    }, 200) // FAST - only 200ms
  }

  generateSinglePrescription() {
    this.log("Generating single prescription")
    this.startGenerationMode()
  }

  // ===== EDIT MODE FUNCTIONALITY =====

  startEditMode() {
    this.log("Starting edit mode")
    this.isEditMode = true

    // Show editable notes section
    const notesSection = document.getElementById("notesSection")
    const editableNotesSection = document.getElementById("editableNotesSection")
    const normalActions = document.getElementById("normalActions")
    const editActions = document.getElementById("editActions")

    if (notesSection) notesSection.style.display = "none"
    if (editableNotesSection) editableNotesSection.style.display = "block"
    if (normalActions) normalActions.style.display = "none"
    if (editActions) editActions.style.display = "flex"

    // Populate doctor's notes textarea with current notes
    const doctorNotesTextarea = document.getElementById("doctorNotesTextarea")
    if (doctorNotesTextarea) {
      doctorNotesTextarea.value = this.currentPrescription.doctorNotes || ""
    }
  }

  cancelEdit() {
    this.log("Cancelling edit")
    this.isEditMode = false

    // Switch back to read-only notes
    const notesSection = document.getElementById("notesSection")
    const editableNotesSection = document.getElementById("editableNotesSection")
    const normalActions = document.getElementById("normalActions")
    const editActions = document.getElementById("editActions")

    if (notesSection) notesSection.style.display = "block"
    if (editableNotesSection) editableNotesSection.style.display = "none"
    if (normalActions) normalActions.style.display = "flex"
    if (editActions) editActions.style.display = "none"
  }

  updatePrescription() {
    if (!this.currentPrescription) {
      this.log("ERROR: No current prescription to update")
      return
    }

    this.log("Updating prescription...")
    window.prescriptionManager.showLoading("Updating prescription...")

    // FAST UPDATE - only 150ms
    setTimeout(() => {
      try {
        // Get updated doctor's notes from textarea
        const doctorNotesTextarea = document.getElementById("doctorNotesTextarea")
        const updatedNotes = doctorNotesTextarea
          ? doctorNotesTextarea.value.trim()
          : this.currentPrescription.doctorNotes

        this.log("Updating prescription with new notes", updatedNotes)

        // Use the synchronized update method
        const updatedPrescription = window.prescriptionManager.updatePrescriptionData(this.currentPrescription.id, {
          doctorNotes: updatedNotes,
          generatedDate: new Date().toISOString(),
        })

        if (updatedPrescription) {
          // Update current prescription reference
          this.currentPrescription = updatedPrescription

          // Exit edit mode
          this.isEditMode = false

          // FORCE UPDATE: Immediately update the notes display
          this.updateDoctorNotes(updatedPrescription.doctorNotes)

          // Then update modal sections
          this.updateModalSections(updatedPrescription)

          window.prescriptionManager.hideLoading()
          this.showSuccessToast("Prescription Updated", "Doctor's notes updated successfully")
          this.log("Prescription updated successfully")
        } else {
          throw new Error("Failed to update prescription")
        }
      } catch (error) {
        this.log("ERROR updating prescription", error)
        window.prescriptionManager.hideLoading()
        this.showSuccessToast("Update Error", "Failed to update prescription")
      }
    }, 150) // FAST - only 150ms
  }

  // ===== SINGLE PRESCRIPTION ACTIONS =====

  printSinglePrescription() {
    if (!this.currentPrescription) {
      this.log("ERROR: No current prescription to print")
      return
    }

    this.log("Printing single prescription")
    window.prescriptionManager.printSinglePrescriptionData(this.currentPrescription)

    // Use the synchronized update method
    const updatedPrescription = window.prescriptionManager.updatePrescriptionData(this.currentPrescription.id, {
      status: "Printed",
      printedDate: new Date().toISOString(),
    })

    if (updatedPrescription) {
      this.closePrescriptionDetailsModal()
      this.showSuccessToast("Print Successful", "Prescription sent to printer")
      this.log("Prescription printed successfully")
    }
  }

  // ===== TOAST FUNCTIONALITY =====

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

// Initialize the prescription details modal when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.prescriptionDetailsModal = new PrescriptionDetailsModal()
  console.log("✅ Prescription Details Modal initialized")

  // Update the main prescription manager to use the modal
  if (window.prescriptionManager) {
    // Override the showPrescriptionDetails method
    window.prescriptionManager.showPrescriptionDetails = (prescriptionId) => {
      window.prescriptionDetailsModal.showPrescriptionDetails(prescriptionId)
    }
  }
})
