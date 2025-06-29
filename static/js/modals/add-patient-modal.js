// Enhanced Add Patient Modal System
class EnhancedAddPatientModal {
  constructor() {
    this.storageKey = "diabetech_patients"
    this.currentPatientId = this.generateNextPatientId()
    this.currentTab = "basic-info"
    this.formData = {}
    this.isDataSaved = false
    this.init()
  }

  init() {
    this.initializeModal()
    this.initializeTabs()
    this.initializeFormHandlers()
    this.initializeValidation()
    this.updatePatientIdDisplay()
    console.log("🏥 Enhanced Add Patient Modal initialized")
  }

  // ===== MODAL INITIALIZATION =====

  initializeModal() {
    // Add Patient Button
    const addPatientBtn = document.getElementById("addPatientBtn")
    if (addPatientBtn) {
      addPatientBtn.addEventListener("click", () => this.openModal())
    }

    // Close Modal Buttons
    const closeBtn = document.getElementById("closeAddPatientModal")
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal())
    }

    // Close modal when clicking outside
    const modal = document.getElementById("addPatientModal")
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal()
        }
      })
    }

    // Confirmation Modal
    this.initializeConfirmationModal()
  }

  initializeConfirmationModal() {
    const confirmationModal = document.getElementById("confirmationModal")
    const closeConfirmationBtn = document.getElementById("closeConfirmationModal")
    const confirmationCancel = document.getElementById("confirmationCancel")
    const confirmationConfirm = document.getElementById("confirmationConfirm")

    if (closeConfirmationBtn) {
      closeConfirmationBtn.addEventListener("click", () => this.closeConfirmationModal())
    }

    if (confirmationCancel) {
      confirmationCancel.addEventListener("click", () => this.closeConfirmationModal())
    }

    if (confirmationConfirm) {
      confirmationConfirm.addEventListener("click", () => this.confirmSavePatient())
    }

    if (confirmationModal) {
      confirmationModal.addEventListener("click", (e) => {
        if (e.target === confirmationModal) {
          this.closeConfirmationModal()
        }
      })
    }
  }

  // ===== TAB MANAGEMENT =====

  initializeTabs() {
    const tabButtons = document.querySelectorAll("#addPatientModal .tab-button")

    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetTab = button.getAttribute("data-tab")
        if (targetTab && !button.classList.contains("disabled")) {
          this.switchTab(targetTab)
        }
      })
    })

    // Initialize with basic-info tab
    this.switchTab("basic-info")
  }

  switchTab(tabName) {
    // Update current tab
    this.currentTab = tabName

    // Remove active class from all tabs and contents
    const tabButtons = document.querySelectorAll("#addPatientModal .tab-button")
    const tabContents = document.querySelectorAll("#addPatientModal .tab-content")

    tabButtons.forEach((btn) => btn.classList.remove("active"))
    tabContents.forEach((content) => content.classList.remove("active"))

    // Add active class to current tab and content
    const activeButton = document.querySelector(`#addPatientModal [data-tab="${tabName}"]`)
    const activeContent = document.getElementById(tabName)

    if (activeButton) activeButton.classList.add("active")
    if (activeContent) activeContent.classList.add("active")

    console.log(`📋 Switched to tab: ${tabName}`)
  }

  enableTab(tabName) {
    const tabButton = document.querySelector(`#addPatientModal [data-tab="${tabName}"]`)
    if (tabButton) {
      tabButton.classList.remove("disabled")
      console.log(`✅ Tab enabled: ${tabName}`)
    }
  }

  disableTab(tabName) {
    const tabButton = document.querySelector(`#addPatientModal [data-tab="${tabName}"]`)
    if (tabButton) {
      tabButton.classList.add("disabled")
      console.log(`❌ Tab disabled: ${tabName}`)
    }
  }

  // ===== FORM HANDLERS =====

  initializeFormHandlers() {
    // Navigation buttons
    this.initializeNavigationButtons()

    // Form submission
    const form = document.getElementById("addPatientForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleFormSubmission()
      })
    }

    // Auto-calculate BMI
    this.initializeBMICalculation()

    // Auto-calculate age from date of birth
    this.initializeAgeCalculation()
  }

  initializeNavigationButtons() {
    // Next to Health button
    const nextToHealthBtn = document.getElementById("nextToHealth")
    if (nextToHealthBtn) {
      nextToHealthBtn.addEventListener("click", () => {
        if (this.validateBasicInfo()) {
          this.switchTab("health")
        }
      })
    }

    // Back to Basic button
    const backToBasicBtn = document.getElementById("backToBasic")
    if (backToBasicBtn) {
      backToBasicBtn.addEventListener("click", () => {
        this.switchTab("basic-info")
      })
    }

    // Save Health Data button
    const saveHealthBtn = document.getElementById("saveHealthData")
    if (saveHealthBtn) {
      saveHealthBtn.addEventListener("click", () => {
        if (this.validateHealthData()) {
          this.saveHealthData()
        }
      })
    }

    // Back to Insights button
    const backToInsightsBtn = document.getElementById("backToInsights")
    if (backToInsightsBtn) {
      backToInsightsBtn.addEventListener("click", () => {
        this.switchTab("insights")
      })
    }

    // Clear buttons
    this.initializeClearButtons()
  }

  initializeClearButtons() {
    const clearBasicBtn = document.getElementById("clearBasicInfo")
    const clearHealthBtn = document.getElementById("clearHealth")
    const clearNotesBtn = document.getElementById("clearNotes")

    if (clearBasicBtn) {
      clearBasicBtn.addEventListener("click", () => this.clearBasicInfo())
    }

    if (clearHealthBtn) {
      clearHealthBtn.addEventListener("click", () => this.clearHealthData())
    }

    if (clearNotesBtn) {
      clearNotesBtn.addEventListener("click", () => this.clearNotesData())
    }
  }

  initializeBMICalculation() {
    const heightInput = document.querySelector('input[name="height"]')
    const weightInput = document.querySelector('input[name="weight"]')
    const bmiInput = document.querySelector('input[name="bmi"]')

    const calculateBMI = () => {
      const height = Number.parseFloat(heightInput?.value) || 0
      const weight = Number.parseFloat(weightInput?.value) || 0

      if (height > 0 && weight > 0) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        if (bmiInput) {
          bmiInput.value = bmi.toFixed(1)
        }
      } else if (bmiInput) {
        bmiInput.value = ""
      }
    }

    if (heightInput) heightInput.addEventListener("input", calculateBMI)
    if (weightInput) weightInput.addEventListener("input", calculateBMI)
  }

  initializeAgeCalculation() {
    const dobInput = document.querySelector('input[name="dateOfBirth"]')
    const ageInput = document.querySelector('input[name="age"]')

    if (dobInput && ageInput) {
      dobInput.addEventListener("change", () => {
        const dob = new Date(dobInput.value)
        const today = new Date()

        if (dob && dob <= today) {
          let age = today.getFullYear() - dob.getFullYear()
          const monthDiff = today.getMonth() - dob.getMonth()

          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--
          }

          ageInput.value = age
        }
      })
    }
  }

  // ===== VALIDATION =====

  initializeValidation() {
    // Real-time validation for required fields
    const requiredFields = document.querySelectorAll("#addPatientModal [required]")

    requiredFields.forEach((field) => {
      field.addEventListener("blur", () => this.validateField(field))
      field.addEventListener("input", () => this.clearFieldError(field))
    })
  }

  validateField(field) {
    const fieldName = field.name
    const value = field.value.trim()
    const errorElement = document.getElementById(`${fieldName}-error`)

    // Clear previous error
    this.clearFieldError(field)

    // Required field validation
    if (field.hasAttribute("required") && !value) {
      this.showFieldError(field, "This field is required")
      return false
    }

    // Specific field validations
    switch (fieldName) {
      case "age":
        if (value && (Number.parseInt(value) < 1 || Number.parseInt(value) > 120)) {
          this.showFieldError(field, "Age must be between 1 and 120")
          return false
        }
        break
      case "height":
        if (value && (Number.parseFloat(value) < 50 || Number.parseFloat(value) > 250)) {
          this.showFieldError(field, "Height must be between 50 and 250 cm")
          return false
        }
        break
      case "weight":
        if (value && (Number.parseFloat(value) < 20 || Number.parseFloat(value) > 300)) {
          this.showFieldError(field, "Weight must be between 20 and 300 kg")
          return false
        }
        break
      case "bloodPressure":
        if (value && !/^\d{2,3}\/\d{2,3}$/.test(value)) {
          this.showFieldError(field, "Format: 120/80")
          return false
        }
        break
      case "fastingGlucose":
      case "bloodSugarLevel":
        if (value && (Number.parseFloat(value) < 50 || Number.parseFloat(value) > 500)) {
          this.showFieldError(field, "Value must be between 50 and 500 mg/dL")
          return false
        }
        break
      case "hba1c":
        if (value && (Number.parseFloat(value) < 3 || Number.parseFloat(value) > 20)) {
          this.showFieldError(field, "Value must be between 3 and 20%")
          return false
        }
        break
    }

    return true
  }

  showFieldError(field, message) {
    field.classList.add("error")
    const errorElement = document.getElementById(`${field.name}-error`)
    if (errorElement) {
      errorElement.textContent = message
    }
  }

  clearFieldError(field) {
    field.classList.remove("error")
    const errorElement = document.getElementById(`${field.name}-error`)
    if (errorElement) {
      errorElement.textContent = ""
    }
  }

  validateBasicInfo() {
    const requiredFields = [
      'input[name="sex"]:checked',
      'input[name="dateOfBirth"]',
      'input[name="age"]',
      'input[name="smokingStatus"]:checked',
      'select[name="physicalActivity"]',
      'select[name="alcoholConsumption"]',
      'select[name="stressLevel"]',
      'select[name="dietType"]',
      'input[name="sleepDuration"]',
    ]

    let isValid = true

    requiredFields.forEach((selector) => {
      const field = document.querySelector(selector)
      if (!field || !field.value) {
        isValid = false
        if (field) {
          this.showFieldError(field, "This field is required")
        }
      }
    })

    if (!isValid) {
      console.log("❌ Basic info validation failed")
    } else {
      console.log("✅ Basic info validation passed")
    }

    return isValid
  }

  validateHealthData() {
    const requiredFields = [
      'select[name="diabetesType"]',
      'input[name="familyHistory"]:checked',
      'input[name="height"]',
      'input[name="weight"]',
      'input[name="bloodPressure"]',
      'input[name="fastingGlucose"]',
      'input[name="bloodSugarLevel"]',
      'input[name="hba1c"]',
    ]

    let isValid = true

    requiredFields.forEach((selector) => {
      const field = document.querySelector(selector)
      if (!field || !field.value) {
        isValid = false
        if (field) {
          this.showFieldError(field, "This field is required")
        }
      } else {
        // Validate the field
        if (!this.validateField(field)) {
          isValid = false
        }
      }
    })

    if (!isValid) {
      console.log("❌ Health data validation failed")
    } else {
      console.log("✅ Health data validation passed")
    }

    return isValid
  }

  // ===== DATA MANAGEMENT =====

  collectFormData() {
    const form = document.getElementById("addPatientForm")
    if (!form) return null

    const formData = new FormData(form)
    const data = {
      patientId: this.currentPatientId,
      basicInfo: {},
      lifestyle: {},
      health: {},
      notes: {},
      timestamp: new Date().toISOString(),
    }

    // Basic Info
    data.basicInfo.sex = formData.get("sex")
    data.basicInfo.dateOfBirth = formData.get("dateOfBirth")
    data.basicInfo.age = Number.parseInt(formData.get("age"))
    data.basicInfo.smokingStatus = formData.get("smokingStatus")

    // Lifestyle
    data.lifestyle.physicalActivity = formData.get("physicalActivity")
    data.lifestyle.alcoholConsumption = formData.get("alcoholConsumption")
    data.lifestyle.stressLevel = formData.get("stressLevel")
    data.lifestyle.dietType = formData.get("dietType")
    data.lifestyle.sleepDuration = Number.parseInt(formData.get("sleepDuration"))

    // Health
    data.health.diabetesType = formData.get("diabetesType")
    data.health.familyHistory = formData.get("familyHistory")
    data.health.knownConditions = formData.get("knownConditions") || ""
    data.health.currentMedications = formData.get("currentMedications") || ""
    data.health.allergies = formData.get("allergies") || ""
    data.health.height = Number.parseFloat(formData.get("height"))
    data.health.weight = Number.parseFloat(formData.get("weight"))
    data.health.bmi = Number.parseFloat(formData.get("bmi"))
    data.health.bloodPressure = formData.get("bloodPressure")
    data.health.fastingGlucose = Number.parseInt(formData.get("fastingGlucose"))
    data.health.bloodSugarLevel = Number.parseInt(formData.get("bloodSugarLevel"))
    data.health.hba1c = Number.parseFloat(formData.get("hba1c"))
    data.health.cholesterolLevel = Number.parseInt(formData.get("cholesterolLevel")) || null
    data.health.waistCircumference = Number.parseFloat(formData.get("waistCircumference")) || null

    // Notes
    data.notes.monitoringFrequency = formData.get("monitoringFrequency") || ""
    data.notes.initialDiagnosis = formData.get("initialDiagnosis") || ""
    data.notes.lastCheckupDate = formData.get("lastCheckupDate") || ""
    data.notes.nextFollowUp = formData.get("nextFollowUp") || ""
    data.notes.remarksNotes = formData.get("remarksNotes") || ""

    // Calculate complications
    data.complications = this.calculateComplications(data)

    return data
  }

  saveHealthData() {
    if (this.validateHealthData()) {
      // Collect current form data
      this.formData = this.collectFormData()

      // Generate insights
      this.generateInsights()

      // Enable insights and notes tabs
      this.enableTab("insights")
      this.enableTab("notes")

      // Switch to insights tab
      this.switchTab("insights")

      // Mark data as saved
      this.isDataSaved = true

      console.log("✅ Health data saved, insights generated")
    }
  }

  generateInsights() {
    if (!this.formData) return

    // Calculate risk score
    const riskScore = this.calculateRiskScore(this.formData)
    const complicationRisk = this.getComplicationRisk(riskScore)
    const complications = this.formData.complications || []
    const monitoring = this.getMonitoringRecommendation(riskScore)
    const suggestion = this.generateAISuggestion(this.formData, complications)

    // Update insights display
    this.updateInsightsDisplay(riskScore, complicationRisk, complications, monitoring, suggestion)

    // Update notes display
    this.updateNotesDisplay()
  }

  updateInsightsDisplay(riskScore, complicationRisk, complications, monitoring, suggestion) {
    // Hide empty state, show generated state
    const emptyState = document.getElementById("insightsEmptyState")
    const generatedState = document.getElementById("insightsGeneratedState")

    if (emptyState) emptyState.style.display = "none"
    if (generatedState) generatedState.style.display = "block"

    // Update values
    const riskScoreEl = document.getElementById("riskScoreValue")
    const complicationRiskEl = document.getElementById("complicationRiskValue")
    const complicationsEl = document.getElementById("complicationsValue")
    const monitoringEl = document.getElementById("monitoringValue")
    const suggestionEl = document.getElementById("suggestionText")

    if (riskScoreEl) riskScoreEl.textContent = `${riskScore}%`
    if (complicationRiskEl) {
      complicationRiskEl.textContent = complicationRisk
      complicationRiskEl.className = "insight-value complication-value"
      if (complicationRisk === "High") complicationRiskEl.style.color = "#dc2626"
      else if (complicationRisk === "Moderate") complicationRiskEl.style.color = "#d97706"
      else complicationRiskEl.style.color = "#16a34a"
    }
    if (complicationsEl) {
      const complicationsText =
        complications.length > 0 && complications[0] !== "None detected" ? complications.join(", ") : "None detected"
      complicationsEl.textContent = complicationsText
    }
    if (monitoringEl) monitoringEl.textContent = monitoring
    if (suggestionEl) suggestionEl.textContent = suggestion
  }

  updateNotesDisplay() {
    // Hide empty state, show content
    const emptyState = document.getElementById("notesEmptyState")
    const content = document.getElementById("notesContent")

    if (emptyState) emptyState.style.display = "none"
    if (content) content.style.display = "block"

    // Set default monitoring frequency based on risk
    if (this.formData) {
      const riskScore = this.calculateRiskScore(this.formData)
      const defaultMonitoring = riskScore > 50 ? "Monthly" : riskScore > 25 ? "Quarterly" : "Quarterly"

      const monitoringRadios = document.querySelectorAll('input[name="monitoringFrequency"]')
      monitoringRadios.forEach((radio) => {
        if (radio.value === defaultMonitoring) {
          radio.checked = true
        }
      })
    }
  }

  calculateRiskScore(data) {
    let score = 0

    // Age factor
    const age = data.basicInfo.age || 0
    if (age > 65) score += 20
    else if (age > 45) score += 10

    // Health factors
    const fastingGlucose = data.health.fastingGlucose || 0
    const hba1c = data.health.hba1c || 0

    if (fastingGlucose > 126) score += 30
    else if (fastingGlucose > 100) score += 15

    if (hba1c > 7) score += 25
    else if (hba1c > 6.5) score += 15

    // BMI factor
    const bmi = data.health.bmi || 0
    if (bmi > 30) score += 15
    else if (bmi > 25) score += 8

    // Lifestyle factors
    if (data.basicInfo.smokingStatus === "Smoker") score += 15
    if (data.lifestyle.physicalActivity === "Sedentary") score += 10

    return Math.min(score, 100)
  }

  getComplicationRisk(riskScore) {
    if (riskScore >= 60) return "High"
    else if (riskScore >= 30) return "Moderate"
    else return "Low"
  }

  getMonitoringRecommendation(riskScore) {
    if (riskScore >= 60) return "Weekly"
    else if (riskScore >= 30) return "Monthly"
    else return "Quarterly"
  }

  calculateComplications(data) {
    const complications = []

    // Extract data
    const age = data.basicInfo.age || 0
    const hba1c = data.health.hba1c || 0
    const fastingGlucose = data.health.fastingGlucose || 0
    const bloodPressure = data.health.bloodPressure || ""
    const cholesterol = data.health.cholesterolLevel || 0
    const smoking = data.basicInfo.smokingStatus || ""
    const activity = data.lifestyle.physicalActivity || ""
    const bmi = data.health.bmi || 0

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

  generateAISuggestion(data, complications) {
    if (complications.includes("Retinopathy")) {
      return "Recommend ophthalmologic examination and HbA1c optimization."
    } else if (complications.includes("Neuropathy")) {
      return "Consider neurological assessment and foot care education."
    } else if (complications.includes("Cardiovascular Risk")) {
      return "Recommend cardiovascular screening and lifestyle modifications."
    } else if (data.health.fastingGlucose > 126) {
      return "Consider insulin dosage reassessment in 2 weeks based on fasting blood sugar patterns."
    } else if (data.health.hba1c > 7) {
      return "Recommend dietary consultation and increased monitoring frequency."
    } else {
      return "Continue current management plan with regular monitoring."
    }
  }

  // ===== CLEAR FUNCTIONS =====

  clearBasicInfo() {
    const basicInfoTab = document.getElementById("basic-info")
    if (basicInfoTab) {
      const inputs = basicInfoTab.querySelectorAll("input, select")
      inputs.forEach((input) => {
        if (input.type === "radio") {
          input.checked = false
        } else {
          input.value = ""
        }
        this.clearFieldError(input)
      })
    }
    console.log("🧹 Basic info cleared")
  }

  clearHealthData() {
    const healthTab = document.getElementById("health")
    if (healthTab) {
      const inputs = healthTab.querySelectorAll("input, select, textarea")
      inputs.forEach((input) => {
        if (input.type === "radio") {
          input.checked = false
        } else {
          input.value = ""
        }
        this.clearFieldError(input)
      })
    }
    console.log("🧹 Health data cleared")
  }

  clearNotesData() {
    const notesTab = document.getElementById("notes")
    if (notesTab) {
      const inputs = notesTab.querySelectorAll("input, select, textarea")
      inputs.forEach((input) => {
        if (input.type === "radio") {
          input.checked = false
        } else {
          input.value = ""
        }
        this.clearFieldError(input)
      })
    }
    console.log("🧹 Notes data cleared")
  }

  // ===== MODAL MANAGEMENT =====

  openModal() {
    const modal = document.getElementById("addPatientModal")
    if (modal) {
      // Reset modal state
      this.resetModal()

      // Show modal
      modal.classList.add("show")
      document.body.style.overflow = "hidden"

      console.log("📋 Add Patient Modal opened")
    }
  }

  closeModal() {
    const modal = document.getElementById("addPatientModal")
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = "auto"
      console.log("📋 Add Patient Modal closed")
    }
  }

  resetModal() {
    // Reset form
    const form = document.getElementById("addPatientForm")
    if (form) {
      form.reset()
    }

    // Clear all errors
    const errorElements = document.querySelectorAll(".error-message")
    errorElements.forEach((el) => (el.textContent = ""))

    const errorFields = document.querySelectorAll(".error")
    errorFields.forEach((field) => field.classList.remove("error"))

    // Reset tabs
    this.disableTab("insights")
    this.disableTab("notes")
    this.switchTab("basic-info")

    // Reset insights display
    const emptyState = document.getElementById("insightsEmptyState")
    const generatedState = document.getElementById("insightsGeneratedState")
    if (emptyState) emptyState.style.display = "flex"
    if (generatedState) generatedState.style.display = "none"

    // Reset notes display
    const notesEmptyState = document.getElementById("notesEmptyState")
    const notesContent = document.getElementById("notesContent")
    if (notesEmptyState) notesEmptyState.style.display = "flex"
    if (notesContent) notesContent.style.display = "none"

    // Reset state
    this.isDataSaved = false
    this.formData = {}

    // Generate new patient ID
    this.currentPatientId = this.generateNextPatientId()
    this.updatePatientIdDisplay()

    console.log("🔄 Modal reset completed")
  }

  // ===== FORM SUBMISSION =====

  handleFormSubmission() {
    // Collect final form data
    const finalData = this.collectFormData()

    if (!finalData) {
      console.error("❌ Failed to collect form data")
      return
    }

    // Show confirmation modal
    this.showConfirmationModal(finalData)
  }

  showConfirmationModal(patientData) {
    const modal = document.getElementById("confirmationModal")
    const title = document.getElementById("confirmationTitle")

    if (title) {
      title.textContent = `Save patient ${patientData.patientId}?`
    }

    // Store data for confirmation
    this.pendingPatientData = patientData

    if (modal) {
      modal.classList.add("show")
    }
  }

  closeConfirmationModal() {
    const modal = document.getElementById("confirmationModal")
    if (modal) {
      modal.classList.remove("show")
    }
    this.pendingPatientData = null
  }

  confirmSavePatient() {
    if (!this.pendingPatientData) return

    try {
      // Save to localStorage
      this.savePatientToStorage(this.pendingPatientData)

      // Show success
      this.showSuccessMessage()

      // Add to table if patient table manager exists
      if (window.patientTableManager) {
        window.patientTableManager.addNewPatientToTable(this.pendingPatientData)
      }

      // Close modals after delay
      setTimeout(() => {
        this.closeConfirmationModal()
        this.closeModal()
      }, 1500)

      console.log("✅ Patient saved successfully:", this.pendingPatientData.patientId)
    } catch (error) {
      console.error("❌ Error saving patient:", error)
      alert("Error saving patient. Please try again.")
    }
  }

  showSuccessMessage() {
    const successBadge = document.getElementById("successBadge")
    const title = document.getElementById("confirmationTitle")
    const actions = document.querySelector(".confirmations-actions")

    if (successBadge) successBadge.style.display = "flex"
    if (title) title.textContent = "Patient saved successfully!"
    if (actions) actions.style.display = "none"
  }

  savePatientToStorage(patientData) {
    try {
      // Get existing patients
      const existingPatients = JSON.parse(localStorage.getItem(this.storageKey) || "[]")

      // Add new patient
      existingPatients.push(patientData)

      // Save back to localStorage
      localStorage.setItem(this.storageKey, JSON.stringify(existingPatients))

      console.log("💾 Patient saved to localStorage")
    } catch (error) {
      console.error("Error saving to localStorage:", error)
      throw error
    }
  }

  // ===== PATIENT ID MANAGEMENT =====

  generateNextPatientId() {
    try {
      const existingPatients = JSON.parse(localStorage.getItem(this.storageKey) || "[]")
      const maxId = existingPatients.reduce((max, patient) => {
        const idNumber = Number.parseInt(patient.patientId.replace("P", ""))
        return Math.max(max, idNumber)
      }, 0)

      const nextId = `P${String(maxId + 1).padStart(3, "0")}`
      console.log("🆔 Generated patient ID:", nextId)
      return nextId
    } catch (error) {
      console.error("Error generating patient ID:", error)
      return "P001"
    }
  }

  updatePatientIdDisplay() {
    const patientIdElement = document.querySelector(".patient-info h2")
    if (patientIdElement) {
      patientIdElement.textContent = this.currentPatientId
    }
  }

  updatePatientIdCounter() {
    this.currentPatientId = this.generateNextPatientId()
    this.updatePatientIdDisplay()
  }
}

// Initialize the enhanced add patient modal when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.enhancedAddPatientModal = new EnhancedAddPatientModal()
  console.log("✅ Enhanced Add Patient Modal initialized")
})
