// Enhanced Add Patient Modal JavaScript with Sequential Numbering and Complications
class EnhancedAddPatientModal {
    constructor() {
      this.modal = document.getElementById("addPatientModal")
      this.form = document.getElementById("addPatientForm")
      this.closeBtn = document.getElementById("closeAddPatientModal")
      this.tabButtons = document.querySelectorAll(".add-patient-modal .tab-button")
      this.tabContents = document.querySelectorAll(".add-patient-modal .tab-content")
  
      // Confirmation modal elements
      this.confirmationModal = document.getElementById("confirmationModal")
      this.successBadge = document.getElementById("successBadge")
      this.confirmationTitle = document.getElementById("confirmationTitle")
      this.confirmationCancel = document.getElementById("confirmationCancel")
      this.confirmationConfirm = document.getElementById("confirmationConfirm")
      this.closeConfirmationModal = document.getElementById("closeConfirmationModal")
  
      this.currentPatientId = "P000"
      this.nextPatientNumber = 1
      this.patientDataSaved = false
      this.pendingAction = null
      this.currentComplications = []
  
      // Storage key for patients
      this.storageKey = "diabetech_patients"
  
      this.init()
    }
  
    init() {
      this.bindEvents()
      this.generatePatientId()
      this.setupDateOfBirthHandler()
      this.setupBMICalculation()
      this.setupDateValidation()
      this.initializeTabStates()
      this.loadSavedPatients()
    }
  
    bindEvents() {
      // Close modal events
      this.closeBtn.addEventListener("click", () => this.close())
      this.modal.addEventListener("click", (e) => {
        if (e.target === this.modal) this.close()
      })
  
      // Confirmation modal events
      this.closeConfirmationModal.addEventListener("click", () => this.closeConfirmation())
      this.confirmationCancel.addEventListener("click", () => this.closeConfirmation())
      this.confirmationConfirm.addEventListener("click", () => this.executeConfirmedAction())
      this.confirmationModal.addEventListener("click", (e) => {
        if (e.target === this.confirmationModal) this.closeConfirmation()
      })
  
      // Tab switching (only for enabled tabs)
      this.tabButtons.forEach((button) => {
        button.addEventListener("click", () => {
          if (!button.classList.contains("disabled")) {
            this.switchTab(button.dataset.tab)
          }
        })
      })
  
      // Navigation buttons
      document.getElementById("nextToHealth")?.addEventListener("click", () => this.handleNextToHealth())
      document.getElementById("backToBasic")?.addEventListener("click", () => this.switchTab("basic-info"))
      document.getElementById("backToInsights")?.addEventListener("click", () => this.switchTab("insights"))
  
      // Clear buttons with confirmation
      document.getElementById("clearBasicInfo")?.addEventListener("click", () => this.showClearConfirmation("basic"))
      document.getElementById("clearHealth")?.addEventListener("click", () => this.showClearConfirmation("health"))
      document.getElementById("clearNotes")?.addEventListener("click", () => this.showClearConfirmation("notes"))
  
      // Save health data button
      document.getElementById("saveHealthData")?.addEventListener("click", () => this.saveHealthData())
  
      // Final save button with confirmation
      document.getElementById("savePatientBtn")?.addEventListener("click", (e) => this.showSaveConfirmation(e))
  
      // Form submission
      this.form.addEventListener("submit", (e) => this.handleSubmit(e))
  
      // Keyboard events
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          if (this.confirmationModal.classList.contains("show")) {
            this.closeConfirmation()
          } else if (this.isOpen()) {
            this.close()
          }
        }
      })
    }
  
    setupDateValidation() {
      const currentYear = new Date().getFullYear()
      const maxDate = `${currentYear}-12-31`
  
      // Date of Birth validation (up to current year)
      const dobInput = this.form.querySelector('input[name="dateOfBirth"]')
      if (dobInput) {
        dobInput.setAttribute("max", maxDate)
        dobInput.addEventListener("change", () => this.validateDateOfBirth())
      }
  
      // Last checkup date validation (up to current year)
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]')
      if (lastCheckupInput) {
        lastCheckupInput.setAttribute("max", maxDate)
        lastCheckupInput.addEventListener("change", () => this.validateLastCheckupDate())
      }
  
      // Next follow-up date validation (must be after last checkup)
      const nextFollowUpInput = this.form.querySelector('input[name="nextFollowUp"]')
      if (nextFollowUpInput) {
        nextFollowUpInput.setAttribute("max", maxDate)
        nextFollowUpInput.addEventListener("change", () => this.validateNextFollowUpDate())
      }
    }
  
    validateDateOfBirth() {
      const dobInput = this.form.querySelector('input[name="dateOfBirth"]')
      const ageInput = this.form.querySelector('input[name="age"]')
  
      if (!dobInput.value) return true
  
      const selectedDate = new Date(dobInput.value)
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
  
      // Check if date is in the future
      if (selectedDate > currentDate) {
        this.showFieldError("dateOfBirth", "Date of birth cannot be in the future")
        dobInput.classList.add("error")
        if (ageInput) ageInput.value = ""
        return false
      }
  
      // Check if year is beyond current year
      if (selectedDate.getFullYear() > currentYear) {
        this.showFieldError("dateOfBirth", `Year cannot be beyond ${currentYear}`)
        dobInput.classList.add("error")
        if (ageInput) ageInput.value = ""
        return false
      }
  
      // Check if person would be too old (over 120 years)
      const age = Math.floor((currentDate - selectedDate) / (365.25 * 24 * 60 * 60 * 1000))
      if (age > 120) {
        this.showFieldError("dateOfBirth", "Age cannot be more than 120 years")
        dobInput.classList.add("error")
        if (ageInput) ageInput.value = ""
        return false
      }
  
      // Valid date
      this.clearFieldError("dateOfBirth")
      dobInput.classList.remove("error")
      return true
    }
  
    validateLastCheckupDate() {
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]')
  
      if (!lastCheckupInput.value) return true
  
      const selectedDate = new Date(lastCheckupInput.value)
      const currentDate = new Date()
      const currentYear = currentDate.getFullYear()
  
      // Check if date is in the future
      if (selectedDate > currentDate) {
        this.showFieldError("lastCheckupDate", "Last checkup date cannot be in the future")
        lastCheckupInput.classList.add("error")
        return false
      }
  
      // Check if year is beyond current year
      if (selectedDate.getFullYear() > currentYear) {
        this.showFieldError("lastCheckupDate", `Year cannot be beyond ${currentYear}`)
        lastCheckupInput.classList.add("error")
        return false
      }
  
      // Valid date
      this.clearFieldError("lastCheckupDate")
      lastCheckupInput.classList.remove("error")
  
      // Also validate next follow-up if it has a value
      this.validateNextFollowUpDate()
      return true
    }
  
    validateNextFollowUpDate() {
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]')
      const nextFollowUpInput = this.form.querySelector('input[name="nextFollowUp"]')
  
      if (!nextFollowUpInput.value) return true
  
      const nextFollowUpDate = new Date(nextFollowUpInput.value)
      const currentDate = new Date()
  
      // Check if date is too far in the past (more than 1 year ago)
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
  
      if (nextFollowUpDate < oneYearAgo) {
        this.showFieldError("nextFollowUp", "Next follow-up date cannot be more than 1 year in the past")
        nextFollowUpInput.classList.add("error")
        return false
      }
  
      // If last checkup date is provided, next follow-up must be same day or after it
      if (lastCheckupInput.value) {
        const lastCheckupDate = new Date(lastCheckupInput.value)
  
        if (nextFollowUpDate < lastCheckupDate) {
          this.showFieldError("nextFollowUp", "Next follow-up date must be on or after the last checkup date")
          nextFollowUpInput.classList.add("error")
          return false
        }
      }
  
      // Valid date
      this.clearFieldError("nextFollowUp")
      nextFollowUpInput.classList.remove("error")
      return true
    }
  
    // Load saved patients from localStorage
    loadSavedPatients() {
      try {
        const savedPatients = localStorage.getItem(this.storageKey)
        if (savedPatients) {
          const patients = JSON.parse(savedPatients)
          console.log(`📋 Loading ${patients.length} saved patients`)
  
          // Update patient ID counter based on existing patients
          this.updatePatientIdCounter()
        }
      } catch (error) {
        console.error("Error loading saved patients:", error)
      }
    }
  
    // Update patient ID counter based on existing patients
    updatePatientIdCounter() {
      const tableBody = document.getElementById("patientsTableBody")
      if (tableBody) {
        const existingRows = tableBody.children.length
        this.nextPatientNumber = existingRows + 1
        this.generatePatientId()
      }
    }
  
    // Save patient to localStorage
    savePatientToStorage(patientData) {
      try {
        let savedPatients = []
        const existingData = localStorage.getItem(this.storageKey)
  
        if (existingData) {
          savedPatients = JSON.parse(existingData)
        }
  
        // Add new patient
        savedPatients.push({
          ...patientData,
          savedAt: new Date().toISOString(),
        })
  
        localStorage.setItem(this.storageKey, JSON.stringify(savedPatients))
        console.log(`💾 Patient ${patientData.patientId} saved to localStorage`)
      } catch (error) {
        console.error("Error saving patient to storage:", error)
      }
    }
  
    // Delete patient from storage
    deletePatientFromStorage(patientId) {
      try {
        const savedPatients = localStorage.getItem(this.storageKey)
        if (savedPatients) {
          let patients = JSON.parse(savedPatients)
          patients = patients.filter((patient) => patient.patientId !== patientId)
          localStorage.setItem(this.storageKey, JSON.stringify(patients))
          console.log(`🗑️ Patient ${patientId} deleted from localStorage`)
        }
      } catch (error) {
        console.error("Error deleting patient from storage:", error)
      }
    }
  
    initializeTabStates() {
      // Initially disable Insights and Notes tabs
      this.setTabState("insights", false)
      this.setTabState("notes", false)
    }
  
    setTabState(tabId, enabled) {
      const tabButton = document.querySelector(`[data-tab="${tabId}"]`)
      if (tabButton) {
        if (enabled) {
          tabButton.classList.remove("disabled")
        } else {
          tabButton.classList.add("disabled")
        }
      }
    }
  
    handleNextToHealth() {
      if (this.validateBasicInfo()) {
        this.switchTab("health")
      }
    }
  
    validateBasicInfo() {
      const requiredFields = [
        { name: "sex", type: "radio" },
        { name: "dateOfBirth", type: "input" },
        { name: "age", type: "input" },
        { name: "smokingStatus", type: "radio" },
        { name: "physicalActivity", type: "select" },
        { name: "alcoholConsumption", type: "select" },
        { name: "stressLevel", type: "select" },
        { name: "dietType", type: "select" },
        { name: "sleepDuration", type: "input" },
      ]
  
      let isValid = true
  
      requiredFields.forEach((field) => {
        const errorElement = document.getElementById(`${field.name}-error`)
        let value = ""
        let fieldElement = null
  
        if (field.type === "radio") {
          const checkedRadio = this.form.querySelector(`[name="${field.name}"]:checked`)
          value = checkedRadio ? checkedRadio.value : ""
          fieldElement = this.form.querySelector(`[name="${field.name}"]`)
        } else {
          fieldElement = this.form.querySelector(`[name="${field.name}"]`)
          value = fieldElement ? fieldElement.value.trim() : ""
        }
  
        if (!value) {
          this.showFieldError(field.name, `${this.formatFieldName(field.name)} is required`)
          if (fieldElement) {
            fieldElement.classList.add("error")
          }
          isValid = false
        } else {
          this.clearFieldError(field.name)
          if (fieldElement) {
            fieldElement.classList.remove("error")
          }
        }
      })
  
      // Additional date validation
      if (!this.validateDateOfBirth()) {
        isValid = false
      }
  
      return isValid
    }
  
    validateHealthData() {
      const requiredFields = [
        { name: "diabetesType", type: "select" },
        { name: "familyHistory", type: "radio" },
        { name: "height", type: "input" },
        { name: "weight", type: "input" },
        { name: "bloodPressure", type: "input" },
        { name: "fastingGlucose", type: "input" },
        { name: "bloodSugarLevel", type: "input" },
        { name: "hba1c", type: "input" },
      ]
  
      let isValid = true
  
      requiredFields.forEach((field) => {
        let value = ""
        let fieldElement = null
  
        if (field.type === "radio") {
          const checkedRadio = this.form.querySelector(`[name="${field.name}"]:checked`)
          value = checkedRadio ? checkedRadio.value : ""
          fieldElement = this.form.querySelector(`[name="${field.name}"]`)
        } else {
          fieldElement = this.form.querySelector(`[name="${field.name}"]`)
          value = fieldElement ? fieldElement.value.trim() : ""
        }
  
        if (!value) {
          this.showFieldError(field.name, `${this.formatFieldName(field.name)} is required`)
          if (fieldElement) {
            fieldElement.classList.add("error")
          }
          isValid = false
        } else {
          this.clearFieldError(field.name)
          if (fieldElement) {
            fieldElement.classList.remove("error")
          }
        }
      })
  
      return isValid
    }
  
    validateNotesData() {
      let isValid = true
  
      // Validate date fields if they have values
      if (!this.validateLastCheckupDate()) {
        isValid = false
      }
  
      if (!this.validateNextFollowUpDate()) {
        isValid = false
      }
  
      return isValid
    }
  
    hasHealthData() {
      const formData = new FormData(this.form)
  
      // Check if any required health fields have data
      const healthFields = [
        "diabetesType",
        "familyHistory",
        "height",
        "weight",
        "bloodPressure",
        "fastingGlucose",
        "bloodSugarLevel",
        "hba1c",
      ]
  
      return healthFields.some((field) => {
        if (field === "familyHistory") {
          return this.form.querySelector(`[name="${field}"]:checked`)
        }
        const value = formData.get(field)
        return value && value.trim() !== ""
      })
    }
  
    showFieldError(fieldName, message) {
      const errorElement = document.getElementById(`${fieldName}-error`)
      if (errorElement) {
        errorElement.textContent = message
      }
    }
  
    clearFieldError(fieldName) {
      const errorElement = document.getElementById(`${fieldName}-error`)
      if (errorElement) {
        errorElement.textContent = ""
      }
    }
  
    formatFieldName(fieldName) {
      return fieldName
        .replace(/([A-Z])/g, " $1")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    }
  
    async saveHealthData() {
      if (!this.validateHealthData()) {
        return
      }
  
      // Check if any health data exists
      if (!this.hasHealthData()) {
        this.showError("Please enter health data before saving.")
        return
      }
  
      const saveBtn = document.getElementById("saveHealthData")
      const originalText = saveBtn.innerHTML
  
      try {
        // Show loading state
        saveBtn.classList.add("loading")
        saveBtn.disabled = true
  
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 1500))
  
        // Generate insights
        const insights = this.calculateInsights()
        this.displayInsights(insights)
  
        // Store complications for later use
        this.currentComplications = insights.complications
  
        // Enable Insights and Notes tabs
        this.setTabState("insights", true)
        this.setTabState("notes", true)
        this.patientDataSaved = true
  
        // Show success confirmation
        this.showSuccessConfirmation("Health data saved successfully!")
  
        // Auto-switch to insights tab after confirmation
        setTimeout(() => {
          this.switchTab("insights")
        }, 2000)
      } catch (error) {
        this.showError("Failed to save health data. Please try again.")
      } finally {
        // Reset button state
        saveBtn.classList.remove("loading")
        saveBtn.disabled = false
        saveBtn.innerHTML = originalText
      }
    }
  
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
  
    calculateInsights() {
      const formData = new FormData(this.form)
  
      let riskScore = 0
      const suggestions = []
      const complications = []
  
      // Age factor
      const age = Number.parseInt(formData.get("age")) || 0
      if (age > 65) riskScore += 20
      else if (age > 45) riskScore += 10
  
      // Health factors
      const fastingGlucose = Number.parseInt(formData.get("fastingGlucose")) || 0
      const hba1c = Number.parseFloat(formData.get("hba1c")) || 0
      const height = Number.parseFloat(formData.get("height")) || 0
      const weight = Number.parseFloat(formData.get("weight")) || 0
      const bloodPressure = formData.get("bloodPressure") || ""
      const cholesterol = Number.parseInt(formData.get("cholesterolLevel")) || 0
  
      // Parse blood pressure
      let systolic = 0,
        diastolic = 0
      if (bloodPressure.includes("/")) {
        const bpParts = bloodPressure.split("/")
        systolic = Number.parseInt(bpParts[0]) || 0
        diastolic = Number.parseInt(bpParts[1]) || 0
      }
  
      // Glucose factor
      if (fastingGlucose > 126) riskScore += 30
      else if (fastingGlucose > 100) riskScore += 15
  
      // HbA1c factor and retinopathy risk
      if (hba1c > 9) {
        riskScore += 35
        complications.push("Retinopathy")
      } else if (hba1c > 7) {
        riskScore += 25
        if (age > 50) complications.push("Retinopathy")
      } else if (hba1c > 6.5) {
        riskScore += 15
      }
  
      // BMI factor
      let bmi = 0
      if (height && weight) {
        bmi = weight / (height / 100) ** 2
        if (bmi > 30) riskScore += 15
        else if (bmi > 25) riskScore += 8
      }
  
      // Neuropathy risk factors
      if (hba1c > 8 && age > 40) {
        complications.push("Neuropathy")
      } else if (fastingGlucose > 140 && age > 50) {
        complications.push("Neuropathy")
      }
  
      // Cardiovascular risk factors
      if (systolic > 140 || diastolic > 90) {
        riskScore += 20
        complications.push("Cardiovascular Risk")
      } else if (systolic > 130 || diastolic > 80) {
        riskScore += 10
        if (age > 45 || bmi > 25) complications.push("Cardiovascular Risk")
      }
  
      if (cholesterol > 240) {
        riskScore += 15
        if (!complications.includes("Cardiovascular Risk")) {
          complications.push("Cardiovascular Risk")
        }
      } else if (cholesterol > 200) {
        riskScore += 8
      }
  
      // Lifestyle factors
      const smoking = formData.get("smokingStatus")
      if (smoking === "Smoker") {
        riskScore += 15
        if (!complications.includes("Cardiovascular Risk")) {
          complications.push("Cardiovascular Risk")
        }
      } else if (smoking === "Former") {
        riskScore += 5
      }
  
      const activity = formData.get("physicalActivity")
      if (activity === "Sedentary") {
        riskScore += 10
        if (age > 50 && !complications.includes("Cardiovascular Risk")) {
          complications.push("Cardiovascular Risk")
        }
      } else if (activity === "Moderate") {
        riskScore += 5
      }
  
      // Generate suggestions based on complications
      if (complications.includes("Retinopathy")) {
        suggestions.push("Recommend ophthalmologic examination and HbA1c optimization.")
      } else if (complications.includes("Neuropathy")) {
        suggestions.push("Consider neurological assessment and foot care education.")
      } else if (complications.includes("Cardiovascular Risk")) {
        suggestions.push("Recommend cardiovascular screening and lifestyle modifications.")
      } else if (fastingGlucose > 126) {
        suggestions.push("Consider insulin dosage reassessment in 2 weeks based on fasting blood sugar patterns.")
      } else if (hba1c > 7) {
        suggestions.push("Recommend dietary consultation and increased monitoring frequency.")
      } else if (riskScore > 50) {
        suggestions.push("High risk detected. Recommend immediate consultation and frequent monitoring.")
      } else {
        suggestions.push("Continue current management plan with regular monitoring.")
      }
  
      return {
        riskScore: `${Math.min(riskScore, 100)}%`,
        complicationRisk: riskScore > 50 ? "High" : riskScore > 25 ? "Moderate" : "Low",
        monitoring: riskScore > 50 ? "Weekly" : riskScore > 25 ? "Monthly" : "Auto-generated",
        suggestion: suggestions[0],
        complications: complications.length > 0 ? complications : ["None detected"],
      }
    }
  
    displayInsights(insights) {
      // Hide empty state, show generated state
      document.getElementById("insightsEmptyState").style.display = "none"
      document.getElementById("insightsGeneratedState").style.display = "block"
  
      // Update values
      document.getElementById("riskScoreValue").textContent = insights.riskScore
      document.getElementById("complicationRiskValue").textContent = insights.complicationRisk
      document.getElementById("monitoringValue").textContent = insights.monitoring
      document.getElementById("suggestionText").textContent = insights.suggestion
  
      // Update complications
      const complicationsElement = document.getElementById("complicationsValue")
      if (complicationsElement) {
        complicationsElement.textContent = insights.complications.join(", ")
      }
  
      // Update styling based on risk level
      const complicationValue = document.getElementById("complicationRiskValue")
  
      // Reset classes
      complicationValue.className = "insight-value"
  
      // Apply risk-based styling
      if (insights.complicationRisk === "High") {
        complicationValue.style.background = "#fee2e2"
        complicationValue.style.color = "#dc2626"
      } else if (insights.complicationRisk === "Moderate") {
        complicationValue.style.background = "#fef3c7"
        complicationValue.style.color = "#d97706"
      } else {
        complicationValue.classList.add("complication-value")
      }
  
      // Show notes content
      document.getElementById("notesEmptyState").style.display = "none"
      document.getElementById("notesContent").style.display = "block"
  
      // Auto-populate monitoring frequency based on risk
      const monitoringRadios = this.form.querySelectorAll('input[name="monitoringFrequency"]')
      const recommendedFrequency =
        insights.monitoring === "Weekly" ? "Monthly" : insights.monitoring === "Monthly" ? "Monthly" : "Quarterly"
  
      monitoringRadios.forEach((radio) => {
        if (radio.value === recommendedFrequency) {
          radio.checked = true
          radio.closest(".radio-option").classList.add("selected")
        }
      })
    }
  
    // Confirmation Modal Methods
    showSaveConfirmation(e) {
      e.preventDefault()
  
      if (!this.patientDataSaved) {
        this.showError("Please save health data first before saving the patient record.")
        return
      }
  
      // Validate notes data before showing confirmation
      if (!this.validateNotesData()) {
        this.showError("Please fix the date errors before saving.")
        return
      }
  
      this.pendingAction = "save"
      this.successBadge.style.display = "none"
      this.confirmationTitle.textContent = "Are you sure you want to save this record?"
      this.confirmationConfirm.textContent = "Save Patient Record"
      this.showConfirmationModal()
    }
  
    showClearConfirmation(type) {
      this.pendingAction = `clear-${type}`
      this.successBadge.style.display = "none"
  
      let message = ""
      switch (type) {
        case "basic":
          message = "Are you sure you want to clear all basic information?"
          break
        case "health":
          message = "Are you sure you want to clear all health data?"
          break
        case "notes":
          message = "Are you sure you want to clear all notes?"
          break
      }
  
      this.confirmationTitle.textContent = message
      this.confirmationConfirm.textContent = "Clear Data"
      this.showConfirmationModal()
    }
  
    showSuccessConfirmation(message) {
      this.pendingAction = null
      this.successBadge.style.display = "inline-flex"
      this.confirmationTitle.textContent = message
      this.confirmationConfirm.style.display = "none"
      this.confirmationCancel.textContent = "Close"
      this.showConfirmationModal()
  
      // Auto close after 3 seconds
      setTimeout(() => {
        this.closeConfirmation()
      }, 3000)
    }
  
    showConfirmationModal() {
      this.confirmationModal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  
    closeConfirmation() {
      this.confirmationModal.classList.remove("show")
      document.body.style.overflow = "auto"
      this.pendingAction = null
  
      // Reset confirmation modal state
      this.confirmationConfirm.style.display = "inline-block"
      this.confirmationCancel.textContent = "Cancel"
      this.successBadge.style.display = "none"
    }
  
    async executeConfirmedAction() {
      if (!this.pendingAction) return
  
      switch (this.pendingAction) {
        case "save":
          this.closeConfirmation()
          await this.handleFinalSave()
          break
        case "clear-basic":
          this.clearBasicInfo()
          this.closeConfirmation()
          break
        case "clear-health":
          this.clearHealth()
          this.closeConfirmation()
          break
        case "clear-notes":
          this.clearNotes()
          this.closeConfirmation()
          break
      }
    }
  
    async handleFinalSave() {
      if (!this.patientDataSaved || !this.hasHealthData()) {
        this.showError("Please save health data first before saving the patient record.")
        return
      }
  
      // Final validation before saving
      if (!this.validateNotesData()) {
        this.showError("Please fix the date errors before saving.")
        return
      }
  
      const saveBtn = document.getElementById("savePatientBtn")
      const originalText = saveBtn.innerHTML
  
      try {
        saveBtn.classList.add("loading")
        saveBtn.disabled = true
  
        const patientData = this.getFormData()
  
        // Add complications to patient data
        patientData.complications = this.currentComplications
  
        // Save to localStorage for persistence
        this.savePatientToStorage(patientData)
  
        // Add to patient table via patient table manager
        if (window.patientTableManager) {
          window.patientTableManager.addNewPatientToTable(patientData)
        }
  
        this.showSuccessConfirmation("Patient record saved successfully!")
  
        // Close modal after delay
        setTimeout(() => {
          this.close()
          this.resetForm()
        }, 3500)
      } catch (error) {
        console.error("Error saving patient:", error)
        this.showError("Network error. Please try again.")
      } finally {
        saveBtn.classList.remove("loading")
        saveBtn.disabled = false
        saveBtn.innerHTML = originalText
      }
    }
  
    getFormData() {
      const formData = new FormData(this.form)
      const data = {
        patientId: this.currentPatientId,
        basicInfo: {
          sex: formData.get("sex"),
          dateOfBirth: formData.get("dateOfBirth"),
          age: Number.parseInt(formData.get("age")),
          smokingStatus: formData.get("smokingStatus"),
        },
        health: {
          diabetesType: formData.get("diabetesType"),
          familyHistory: formData.get("familyHistory"),
          knownConditions: formData.get("knownConditions"),
          currentMedications: formData.get("currentMedications"),
          allergies: formData.get("allergies"),
          height: Number.parseFloat(formData.get("height")) || null,
          weight: Number.parseFloat(formData.get("weight")) || null,
          bmi: Number.parseFloat(formData.get("bmi")) || null,
          bloodPressure: formData.get("bloodPressure"),
          fastingGlucose: Number.parseInt(formData.get("fastingGlucose")) || null,
          bloodSugarLevel: Number.parseInt(formData.get("bloodSugarLevel")) || null,
          hba1c: Number.parseFloat(formData.get("hba1c")) || null,
          cholesterolLevel: Number.parseInt(formData.get("cholesterolLevel")) || null,
          waistCircumference: Number.parseFloat(formData.get("waistCircumference")) || null,
        },
        lifestyle: {
          physicalActivity: formData.get("physicalActivity"),
          alcoholConsumption: formData.get("alcoholConsumption"),
          stressLevel: formData.get("stressLevel"),
          dietType: formData.get("dietType"),
          sleepDuration: Number.parseFloat(formData.get("sleepDuration")) || null,
        },
        notes: {
          monitoringFrequency: formData.get("monitoringFrequency"),
          initialDiagnosis: formData.get("initialDiagnosis"),
          lastCheckupDate: formData.get("lastCheckupDate"),
          nextFollowUp: formData.get("nextFollowUp"),
          remarksNotes: formData.get("remarksNotes"),
        },
      }
  
      return data
    }
  
    clearBasicInfo() {
      const basicInfoInputs = document.querySelectorAll("#basic-info input, #basic-info select")
      basicInfoInputs.forEach((input) => {
        if (input.type === "radio") {
          input.checked = false
        } else {
          input.value = ""
        }
        input.classList.remove("error")
      })
  
      // Clear all error messages in basic info
      document.querySelectorAll("#basic-info .error-message").forEach((error) => {
        error.textContent = ""
      })
    }
  
    clearHealth() {
      const healthInputs = document.querySelectorAll("#health input, #health select, #health textarea")
      healthInputs.forEach((input) => {
        if (input.name !== "bmi") {
          // Don't clear calculated BMI
          if (input.type === "radio") {
            input.checked = false
          } else {
            input.value = ""
          }
        }
        input.classList.remove("error")
      })
  
      // Clear all error messages in health
      document.querySelectorAll("#health .error-message").forEach((error) => {
        error.textContent = ""
      })
  
      // Clear stored complications
      this.currentComplications = []
  
      // Disable insights and notes tabs since health data is cleared
      this.setTabState("insights", false)
      this.setTabState("notes", false)
      this.patientDataSaved = false
  
      // Reset insights and notes to empty state
      document.getElementById("insightsEmptyState").style.display = "flex"
      document.getElementById("insightsGeneratedState").style.display = "none"
      document.getElementById("notesEmptyState").style.display = "flex"
      document.getElementById("notesContent").style.display = "none"
  
      // Switch back to health tab
      this.switchTab("health")
    }
  
    clearNotes() {
      const notesInputs = document.querySelectorAll("#notes input, #notes textarea")
      notesInputs.forEach((input) => {
        if (input.type === "radio") {
          input.checked = false
        } else {
          input.value = ""
        }
        input.classList.remove("error")
      })
  
      // Clear error messages in notes
      document.querySelectorAll("#notes .error-message").forEach((error) => {
        error.textContent = ""
      })
  
      // Remove selected styling from radio options
      document.querySelectorAll("#notes .radio-option").forEach((option) => {
        option.classList.remove("selected")
      })
    }
  
    resetForm() {
      this.form.reset()
      this.patientDataSaved = false
      this.currentComplications = []
  
      // Clear all error messages
      document.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = ""
      })
  
      // Remove error styling
      document.querySelectorAll(".form-input, .form-select").forEach((input) => {
        input.classList.remove("error")
      })
  
      // Reset tab states
      this.setTabState("insights", false)
      this.setTabState("notes", false)
  
      // Reset insights and notes to empty state
      document.getElementById("insightsEmptyState").style.display = "flex"
      document.getElementById("insightsGeneratedState").style.display = "none"
      document.getElementById("notesEmptyState").style.display = "flex"
      document.getElementById("notesContent").style.display = "none"
  
      // Switch back to basic info tab
      this.switchTab("basic-info")
  
      // Generate new patient ID
      this.generatePatientId()
    }
  
    setupDateOfBirthHandler() {
      const dobInput = this.form.querySelector('input[name="dateOfBirth"]')
      const ageInput = this.form.querySelector('input[name="age"]')
  
      if (dobInput && ageInput) {
        dobInput.addEventListener("change", () => {
          if (this.validateDateOfBirth()) {
            const birthDate = new Date(dobInput.value)
            const today = new Date()
            const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000))
  
            if (age >= 0 && age <= 120) {
              ageInput.value = age
              this.clearFieldError("age")
              ageInput.classList.remove("error")
            }
          }
        })
      }
    }
  
    setupBMICalculation() {
      const heightInput = this.form.querySelector('input[name="height"]')
      const weightInput = this.form.querySelector('input[name="weight"]')
      const bmiInput = this.form.querySelector('input[name="bmi"]')
  
      if (heightInput && weightInput && bmiInput) {
        const calculateBMI = () => {
          const height = Number.parseFloat(heightInput.value)
          const weight = Number.parseFloat(weightInput.value)
  
          if (height && weight) {
            const heightInMeters = height / 100
            const bmi = weight / (heightInMeters * heightInMeters)
            bmiInput.value = bmi.toFixed(1)
  
            // Visual feedback
            bmiInput.style.background = "#dcfce7"
            bmiInput.style.borderColor = "#16a34a"
            setTimeout(() => {
              bmiInput.style.background = ""
              bmiInput.style.borderColor = ""
            }, 1000)
          }
        }
  
        heightInput.addEventListener("input", calculateBMI)
        weightInput.addEventListener("input", calculateBMI)
      }
    }
  
    generatePatientId() {
      const existingPatients = this.getExistingPatients()
      this.nextPatientNumber = existingPatients.length + 1
      this.currentPatientId = `P${String(this.nextPatientNumber).padStart(3, "0")}`
  
      const patientIdElement = this.modal.querySelector(".patient-id")
      if (patientIdElement) {
        patientIdElement.textContent = this.currentPatientId
      }
    }
  
    getExistingPatients() {
      const tableBody = document.getElementById("patientsTableBody")
      return tableBody ? Array.from(tableBody.children) : []
    }
  
    switchTab(tabId) {
      // Remove active class from all tabs and contents
      this.tabButtons.forEach((btn) => btn.classList.remove("active"))
      this.tabContents.forEach((content) => content.classList.remove("active"))
  
      // Add active class to selected tab and content
      const selectedTab = document.querySelector(`[data-tab="${tabId}"]`)
      const selectedContent = document.getElementById(tabId)
  
      if (selectedTab && selectedContent && !selectedTab.classList.contains("disabled")) {
        selectedTab.classList.add("active")
        selectedContent.classList.add("active")
      }
    }
  
    showSuccess(message) {
      console.log("Success:", message)
      if (window.showNotification) {
        window.showNotification(message, "success")
      }
    }
  
    showError(message) {
      console.error("Error:", message)
      if (window.showNotification) {
        window.showNotification(message, "error")
      } else {
        alert(message)
      }
    }
  
    handleSubmit(e) {
      e.preventDefault()
      // Form submission is handled by the final save button
    }
  
    open() {
      this.modal.classList.add("show")
      document.body.style.overflow = "hidden"
  
      // Focus first input
      const firstInput = this.form.querySelector('input[type="radio"]:not(:checked), input:not([type="radio"]), select')
      if (firstInput) {
        setTimeout(() => firstInput.focus(), 100)
      }
  
      console.log("Enhanced Add Patient modal opened")
    }
  
    close() {
      this.modal.classList.remove("show")
      document.body.style.overflow = "auto"
      console.log("Enhanced Add Patient modal closed")
    }
  
    isOpen() {
      return this.modal.classList.contains("show")
    }
  }
  
  // Initialize the enhanced modal when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    window.enhancedAddPatientModal = new EnhancedAddPatientModal()
  
    // Connect to existing "Add Patient" button
    const addPatientBtn = document.getElementById("addPatientBtn")
    if (addPatientBtn) {
      addPatientBtn.addEventListener("click", () => {
        window.enhancedAddPatientModal.open()
      })
    }
  
    console.log("Enhanced Add Patient Modal initialized")
  })
  