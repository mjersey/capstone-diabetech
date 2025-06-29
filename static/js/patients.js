// Patient Table/List Management System
class PatientTableManager {
  constructor() {
    this.storageKey = "diabetech_patients"
    this.selectedPatients = new Set()
    this.currentFilters = {
      riskLevels: [],
      sexes: [],
      minAge: null,
      maxAge: null,
      complications: [],
    }
    this.init()
  }

  init() {
    this.initializePatientTable()
    this.loadSavedPatients()
    this.updateStats()
    this.initializeBulkSelection()
    console.log("🏥 Patient Table Manager initialized")
  }

  // ===== PATIENT TABLE MANAGEMENT FUNCTIONS =====

  // Initialize patient table functionality
  initializePatientTable() {
    this.initializeSearch()
    this.initializeFilters()
    this.initializePatientDetailsModal()
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

  // Initialize bulk selection functionality
  initializeBulkSelection() {
    // Add bulk delete button to actions
    const actionsContainer = document.querySelector(".patients-actions")
    if (actionsContainer) {
      const bulkDeleteBtn = document.createElement("button")
      bulkDeleteBtn.className = "bulk-delete-btn"
      bulkDeleteBtn.id = "bulkDeleteBtn"
      bulkDeleteBtn.innerHTML = `
        <span class="material-symbols-outlined">delete</span>
        Delete Selected (<span id="selectedCount">0</span>)
      `
      bulkDeleteBtn.addEventListener("click", () => this.bulkDeletePatients())
      actionsContainer.appendChild(bulkDeleteBtn)
    }

    // Add bulk selection header
    const listSection = document.querySelector(".patients-list-section")
    if (listSection) {
      const bulkHeader = document.createElement("div")
      bulkHeader.className = "bulk-selection-header"
      bulkHeader.id = "bulkSelectionHeader"
      bulkHeader.innerHTML = `
        <div class="bulk-selection-info">
          <span id="bulkSelectionCount">0</span> patients selected
        </div>
        <div class="bulk-actions">
          <button class="bulk-action-btn bulk-select-all" id="bulkSelectAll">Select All</button>
          <button class="bulk-action-btn bulk-clear-selection" id="bulkClearSelection">Clear Selection</button>
        </div>
      `

      const listHeader = listSection.querySelector(".list-header")
      listHeader.insertAdjacentElement("afterend", bulkHeader)

      // Add event listeners
      document.getElementById("bulkSelectAll").addEventListener("click", () => this.selectAllPatients())
      document.getElementById("bulkClearSelection").addEventListener("click", () => this.clearSelection())
    }

    // Add checkbox column to table header
    const tableHeader = document.querySelector(".patients-table thead tr")
    if (tableHeader) {
      const checkboxHeader = document.createElement("th")
      checkboxHeader.innerHTML = `
        <input type="checkbox" class="bulk-checkbox" id="selectAllCheckbox">
      `
      tableHeader.insertBefore(checkboxHeader, tableHeader.firstChild)

      // Add event listener for select all checkbox
      document.getElementById("selectAllCheckbox").addEventListener("change", (e) => {
        if (e.target.checked) {
          this.selectAllPatients()
        } else {
          this.clearSelection()
        }
      })
    }
  }

  // Filter patients based on search term
  filterPatients(searchTerm) {
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
    rows.forEach((row) => {
      const patientId = row.cells[2].textContent.toLowerCase() // Adjusted for checkbox column
      const age = row.cells[3].textContent.toLowerCase()
      const sex = row.cells[4].textContent.toLowerCase()
      const complications = row.cells[7].textContent.toLowerCase()

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

  // Show enhanced filter modal
  showFilterModal() {
    const modalHtml = `
    <div class="modal-overlay filter-modal" id="filterModal">
      <div class="modal" style="max-width: 500px; background: white; border-radius: 16px; padding: 0; overflow: hidden;">
        <div class="modal-content">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 24px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #1e293b;">Filter Patients</h3>
            <button class="close-btn" onclick="window.patientTableManager.hideFilterModal()" style="background: none; border: none; cursor: pointer; padding: 8px; border-radius: 8px; color: #64748b;">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          
          <div class="filter-options" style="padding: 24px;">
            <!-- Risk Level Filter -->
            <div class="filter-section" style="margin-bottom: 24px;">
              <label style="font-weight: 600; margin-bottom: 12px; display: block; color: #374151;">Risk Level</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="High Risk" style="margin-right: 8px;"> 
                  <span style="font-size: 12px; font-weight: 600; color: #dc2626;">High Risk</span>
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Moderate Risk" style="margin-right: 8px;"> 
                  <span style="font-size: 12px; font-weight: 600; color: #d97706;">Moderate Risk</span>
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Low Risk" style="margin-right: 8px;"> 
                  <span style="font-size: 12px; font-weight: 600; color: #059669;">Low Risk</span>
                </label>
              </div>
            </div>
            
            <!-- Sex Filter -->
            <div class="filter-section" style="margin-bottom: 24px;">
              <label style="font-weight: 600; margin-bottom: 12px; display: block; color: #374151;">Sex</label>
              <div style="display: flex; gap: 12px;">
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Male" style="margin-right: 8px;"> Male
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 16px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Female" style="margin-right: 8px;"> Female
                </label>
              </div>
            </div>
            
            <!-- Age Range Filter -->
            <div class="filter-section" style="margin-bottom: 24px;">
              <label style="font-weight: 600; margin-bottom: 12px; display: block; color: #374151;">Age Range</label>
              <div style="display: flex; gap: 12px; align-items: center;">
                <input type="number" placeholder="Min Age" id="minAge" style="flex: 1; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
                <span style="color: #64748b; font-weight: 500;">to</span>
                <input type="number" placeholder="Max Age" id="maxAge" style="flex: 1; padding: 10px 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 14px;">
              </div>
            </div>

            <!-- Complications Filter -->
            <div class="filter-section" style="margin-bottom: 24px;">
              <label style="font-weight: 600; margin-bottom: 12px; display: block; color: #374151;">Complications</label>
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Retinopathy" style="margin-right: 8px;"> Retinopathy
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Neuropathy" style="margin-right: 8px;"> Neuropathy
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="Cardiovascular" style="margin-right: 8px;"> Cardiovascular
                </label>
                <label class="filter-checkbox-option" style="display: flex; align-items: center; padding: 8px 12px; border: 2px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                  <input type="checkbox" value="None" style="margin-right: 8px;"> None
                </label>
              </div>
            </div>
          </div>
          
          <div class="modal-actions" style="display: flex; gap: 12px; justify-content: flex-end; padding: 24px; border-top: 1px solid #e2e8f0; background: #f8fafc;">
            <button type="button" class="btn-secondary" onclick="window.patientTableManager.clearAllFilters()" style="padding: 10px 20px; background: #f3f4f6; color: #374151; border: 2px solid #d1d5db; border-radius: 8px; font-weight: 600; cursor: pointer;">Clear All</button>
            <button type="button" class="btn-primary" onclick="window.patientTableManager.applyFilters()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">Apply Filters</button>
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
    modal.style.backdropFilter = "blur(4px)"

    // Add hover effects to filter options
    const filterOptions = modal.querySelectorAll(".filter-checkbox-option")
    filterOptions.forEach((option) => {
      option.addEventListener("mouseenter", () => {
        option.style.borderColor = "#3b82f6"
        option.style.background = "#eff6ff"
      })
      option.addEventListener("mouseleave", () => {
        if (!option.querySelector("input").checked) {
          option.style.borderColor = "#e2e8f0"
          option.style.background = "transparent"
        }
      })

      const checkbox = option.querySelector("input")
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          option.style.borderColor = "#3b82f6"
          option.style.background = "#eff6ff"
        } else {
          option.style.borderColor = "#e2e8f0"
          option.style.background = "transparent"
        }
      })
    })

    // Restore previous filter selections
    this.restoreFilterSelections(modal)
  }

  // Restore previous filter selections
  restoreFilterSelections(modal) {
    // Restore risk level selections
    this.currentFilters.riskLevels.forEach((risk) => {
      const checkbox = modal.querySelector(`input[value="${risk}"]`)
      if (checkbox) {
        checkbox.checked = true
        checkbox.closest(".filter-checkbox-option").style.borderColor = "#3b82f6"
        checkbox.closest(".filter-checkbox-option").style.background = "#eff6ff"
      }
    })

    // Restore sex selections
    this.currentFilters.sexes.forEach((sex) => {
      const checkbox = modal.querySelector(`input[value="${sex}"]`)
      if (checkbox) {
        checkbox.checked = true
        checkbox.closest(".filter-checkbox-option").style.borderColor = "#3b82f6"
        checkbox.closest(".filter-checkbox-option").style.background = "#eff6ff"
      }
    })

    // Restore age range
    if (this.currentFilters.minAge) {
      modal.querySelector("#minAge").value = this.currentFilters.minAge
    }
    if (this.currentFilters.maxAge) {
      modal.querySelector("#maxAge").value = this.currentFilters.maxAge
    }

    // Restore complications selections
    this.currentFilters.complications.forEach((complication) => {
      const checkbox = modal.querySelector(`input[value="${complication}"]`)
      if (checkbox) {
        checkbox.checked = true
        checkbox.closest(".filter-checkbox-option").style.borderColor = "#3b82f6"
        checkbox.closest(".filter-checkbox-option").style.background = "#eff6ff"
      }
    })
  }

  // Hide filter modal
  hideFilterModal() {
    const modal = document.getElementById("filterModal")
    if (modal) {
      modal.remove()
    }
  }

  // Apply filters with enhanced functionality
  applyFilters() {
    const modal = document.getElementById("filterModal")
    if (!modal) return

    // Collect filter selections
    const riskCheckboxes = modal.querySelectorAll('input[value*="Risk"]:checked')
    const sexCheckboxes = modal.querySelectorAll('input[value="Male"]:checked, input[value="Female"]:checked')
    const complicationCheckboxes = modal.querySelectorAll(
      'input[value="Retinopathy"]:checked, input[value="Neuropathy"]:checked, input[value="Cardiovascular"]:checked, input[value="None"]:checked',
    )
    const minAge = modal.querySelector("#minAge").value
    const maxAge = modal.querySelector("#maxAge").value

    // Update current filters
    this.currentFilters.riskLevels = Array.from(riskCheckboxes).map((cb) => cb.value)
    this.currentFilters.sexes = Array.from(sexCheckboxes).map((cb) => cb.value)
    this.currentFilters.complications = Array.from(complicationCheckboxes).map((cb) => cb.value)
    this.currentFilters.minAge = minAge ? Number.parseInt(minAge) : null
    this.currentFilters.maxAge = maxAge ? Number.parseInt(maxAge) : null

    // Apply filters to table
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const rows = tableBody.querySelectorAll("tr")
    let visibleCount = 0

    rows.forEach((row) => {
      const riskBadge = row.querySelector(".risk-badge")
      const riskLevel = riskBadge ? riskBadge.textContent : ""
      const sex = row.cells[4].textContent // Adjusted for checkbox column
      const age = Number.parseInt(row.cells[3].textContent)
      const complications = row.cells[7].textContent.toLowerCase()

      let showRow = true

      // Filter by risk level
      if (this.currentFilters.riskLevels.length > 0 && !this.currentFilters.riskLevels.includes(riskLevel)) {
        showRow = false
      }

      // Filter by sex
      if (this.currentFilters.sexes.length > 0 && !this.currentFilters.sexes.includes(sex)) {
        showRow = false
      }

      // Filter by age range
      if (this.currentFilters.minAge && age < this.currentFilters.minAge) {
        showRow = false
      }
      if (this.currentFilters.maxAge && age > this.currentFilters.maxAge) {
        showRow = false
      }

      // Filter by complications
      if (this.currentFilters.complications.length > 0) {
        const hasMatchingComplication = this.currentFilters.complications.some((comp) => {
          if (comp === "None") {
            return complications === "none" || complications === ""
          }
          return complications.includes(comp.toLowerCase())
        })
        if (!hasMatchingComplication) {
          showRow = false
        }
      }

      row.style.display = showRow ? "" : "none"
      if (showRow) visibleCount++
    })

    // Update filter button to show active state
    const filterBtn = document.getElementById("filterBtn")
    const hasActiveFilters =
      this.currentFilters.riskLevels.length > 0 ||
      this.currentFilters.sexes.length > 0 ||
      this.currentFilters.complications.length > 0 ||
      this.currentFilters.minAge ||
      this.currentFilters.maxAge

    if (filterBtn) {
      if (hasActiveFilters) {
        filterBtn.classList.add("active")
        filterBtn.innerHTML = `
          <span class="material-symbols-outlined">tune</span>
          Filtered (${visibleCount})
        `
      } else {
        filterBtn.classList.remove("active")
        filterBtn.innerHTML = `<span class="material-symbols-outlined">tune</span>`
      }
    }

    this.hideFilterModal()
    console.log(`🔧 Filters applied - ${visibleCount} patients visible`)
  }

  // Clear all filters
  clearAllFilters() {
    this.currentFilters = {
      riskLevels: [],
      sexes: [],
      minAge: null,
      maxAge: null,
      complications: [],
    }

    const tableBody = document.getElementById("patientsTableBody")
    if (tableBody) {
      const rows = tableBody.querySelectorAll("tr")
      rows.forEach((row) => {
        row.style.display = ""
      })
    }

    // Reset filter button
    const filterBtn = document.getElementById("filterBtn")
    if (filterBtn) {
      filterBtn.classList.remove("active")
      filterBtn.innerHTML = `<span class="material-symbols-outlined">tune</span>`
    }

    this.hideFilterModal()
    console.log("🧹 All filters cleared")
  }

  // Clear filters (legacy method)
  clearFilters() {
    this.clearAllFilters()
  }

  // ===== BULK SELECTION FUNCTIONS =====

  // Select all visible patients
  selectAllPatients() {
    const tableBody = document.getElementById("patientsTableBody")
    if (!tableBody) return

    const visibleRows = Array.from(tableBody.querySelectorAll("tr")).filter((row) => row.style.display !== "none")

    visibleRows.forEach((row) => {
      const checkbox = row.querySelector(".bulk-checkbox")
      const patientId = row.cells[2].textContent // Adjusted for checkbox column

      if (checkbox && patientId) {
        checkbox.checked = true
        row.classList.add("selected")
        this.selectedPatients.add(patientId)
      }
    })

    this.updateBulkSelectionUI()
    console.log(`✅ Selected ${visibleRows.length} patients`)
  }

  // Clear all selections
  clearSelection() {
    this.selectedPatients.clear()

    const checkboxes = document.querySelectorAll(".bulk-checkbox")
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false
    })

    const rows = document.querySelectorAll(".patients-table tbody tr")
    rows.forEach((row) => {
      row.classList.remove("selected")
    })

    this.updateBulkSelectionUI()
    console.log("🧹 Selection cleared")
  }

  // Toggle patient selection
  togglePatientSelection(patientId, checkbox, row) {
    if (checkbox.checked) {
      this.selectedPatients.add(patientId)
      row.classList.add("selected")
    } else {
      this.selectedPatients.delete(patientId)
      row.classList.remove("selected")
    }

    this.updateBulkSelectionUI()
  }

  // Update bulk selection UI
  updateBulkSelectionUI() {
    const selectedCount = this.selectedPatients.size
    const bulkDeleteBtn = document.getElementById("bulkDeleteBtn")
    const bulkSelectionHeader = document.getElementById("bulkSelectionHeader")
    const bulkSelectionCount = document.getElementById("bulkSelectionCount")
    const selectedCountSpan = document.getElementById("selectedCount")
    const selectAllCheckbox = document.getElementById("selectAllCheckbox")

    // Update counts
    if (bulkSelectionCount) bulkSelectionCount.textContent = selectedCount
    if (selectedCountSpan) selectedCountSpan.textContent = selectedCount

    // Show/hide bulk actions
    if (selectedCount > 0) {
      if (bulkDeleteBtn) bulkDeleteBtn.classList.add("show")
      if (bulkSelectionHeader) bulkSelectionHeader.classList.add("show")
    } else {
      if (bulkDeleteBtn) bulkDeleteBtn.classList.remove("show")
      if (bulkSelectionHeader) bulkSelectionHeader.classList.remove("show")
    }

    // Update select all checkbox state
    if (selectAllCheckbox) {
      const tableBody = document.getElementById("patientsTableBody")
      const visibleRows = Array.from(tableBody.querySelectorAll("tr")).filter((row) => row.style.display !== "none")
      const visiblePatientIds = visibleRows.map((row) => row.cells[2].textContent)
      const allVisibleSelected =
        visiblePatientIds.length > 0 && visiblePatientIds.every((id) => this.selectedPatients.has(id))

      selectAllCheckbox.checked = allVisibleSelected
      selectAllCheckbox.indeterminate = selectedCount > 0 && !allVisibleSelected
    }
  }

  // Bulk delete patients
  bulkDeletePatients() {
    if (this.selectedPatients.size === 0) return

    const selectedCount = this.selectedPatients.size
    const confirmMessage = `Are you sure you want to delete ${selectedCount} selected patient${selectedCount > 1 ? "s" : ""}?`

    if (confirm(confirmMessage)) {
      const selectedIds = Array.from(this.selectedPatients)

      // Remove from table with animation
      selectedIds.forEach((patientId) => {
        const tableBody = document.getElementById("patientsTableBody")
        const rows = Array.from(tableBody.children)
        const rowToDelete = rows.find((row) => row.cells[2].textContent === patientId)

        if (rowToDelete) {
          rowToDelete.style.transition = "all 0.3s ease"
          rowToDelete.style.opacity = "0"
          rowToDelete.style.transform = "translateX(-20px)"

          setTimeout(() => {
            rowToDelete.remove()

            // Update row numbers after deletion
            const remainingRows = Array.from(tableBody.children)
            remainingRows.forEach((row, index) => {
              row.cells[1].textContent = index + 1 // Adjusted for checkbox column
            })
          }, 300)
        }
      })

      // Remove from localStorage
      this.bulkDeleteFromStorage(selectedIds)

      // Clear selection
      this.clearSelection()

      // Update stats
      setTimeout(() => {
        this.updateStats()
        if (window.enhancedAddPatientModal) {
          window.enhancedAddPatientModal.updatePatientIdCounter()
        }
      }, 400)

      console.log(`✅ Bulk deleted ${selectedCount} patients`)
    }
  }

  // Bulk delete from storage
  bulkDeleteFromStorage(patientIds) {
    try {
      const savedPatients = localStorage.getItem(this.storageKey)
      if (savedPatients) {
        let patients = JSON.parse(savedPatients)
        patients = patients.filter((patient) => !patientIds.includes(patient.patientId))
        localStorage.setItem(this.storageKey, JSON.stringify(patients))
        console.log(`🗑️ Bulk deleted ${patientIds.length} patients from localStorage`)
      }
    } catch (error) {
      console.error("Error bulk deleting patients from storage:", error)
    }
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
        this.attachBulkCheckboxListeners()
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
            <td style="text-align: center;">
                <input type="checkbox" class="bulk-checkbox" data-patient-id="${patientData.patientId}">
            </td>
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

  // Attach bulk checkbox listeners
  attachBulkCheckboxListeners() {
    const checkboxes = document.querySelectorAll(".bulk-checkbox[data-patient-id]")
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const patientId = e.target.getAttribute("data-patient-id")
        const row = e.target.closest("tr")
        this.togglePatientSelection(patientId, e.target, row)
      })
    })
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
    const patientRow = rows.find((row) => row.cells[2].textContent === patientId) // Adjusted for checkbox column
    const patientNumber = patientRow ? patientRow.cells[1].textContent : "1"

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

    // Populate all tabs with patient data
    this.populateBasicInfoTab(patientData)
    this.populateHealthDataTab(patientData)
    this.populateInsightsTab(patientData, complications, riskLevel)
    this.populateNotesTab(patientData)

    // Reset to first tab
    document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))
    document.querySelectorAll(".tab-content").forEach((content) => content.classList.remove("active"))

    const firstTab = document.querySelector('[data-tab="basic-info-tab"]')
    const firstContent = document.getElementById("basic-info-tab")

    if (firstTab) firstTab.classList.add("active")
    if (firstContent) firstContent.classList.add("active")

    // Show the modal
    const modal = document.getElementById("patientDetailsModal")
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  // Populate Basic Info Tab
  populateBasicInfoTab(patientData) {
    // Basic information
    const basicPatientId = document.getElementById("basicPatientId")
    const basicAge = document.getElementById("basicAge")
    const basicSex = document.getElementById("basicSex")
    const basicDOB = document.getElementById("basicDOB")
    const basicSmoking = document.getElementById("basicSmoking")

    if (basicPatientId) basicPatientId.textContent = patientData.patientId || "N/A"
    if (basicAge) basicAge.textContent = `${patientData.basicInfo?.age || "N/A"} years old`
    if (basicSex) basicSex.textContent = patientData.basicInfo?.sex || "N/A"

    // Format date of birth
    if (basicDOB && patientData.basicInfo?.dateOfBirth) {
      const date = new Date(patientData.basicInfo.dateOfBirth)
      basicDOB.textContent = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (basicDOB) {
      basicDOB.textContent = "N/A"
    }

    if (basicSmoking) basicSmoking.textContent = patientData.basicInfo?.smokingStatus || "N/A"

    // Lifestyle information
    const basicActivity = document.getElementById("basicActivity")
    const basicAlcohol = document.getElementById("basicAlcohol")
    const basicStress = document.getElementById("basicStress")
    const basicDiet = document.getElementById("basicDiet")
    const basicSleep = document.getElementById("basicSleep")

    if (basicActivity) basicActivity.textContent = patientData.lifestyle?.physicalActivity || "N/A"
    if (basicAlcohol) basicAlcohol.textContent = patientData.lifestyle?.alcoholConsumption || "N/A"
    if (basicStress) basicStress.textContent = patientData.lifestyle?.stressLevel || "N/A"
    if (basicDiet) basicDiet.textContent = patientData.lifestyle?.dietType || "N/A"
    if (basicSleep) {
      const sleepDuration = patientData.lifestyle?.sleepDuration
      basicSleep.textContent = sleepDuration ? `${sleepDuration} hrs/night` : "N/A"
    }
  }

  // Populate Health Data Tab
  populateHealthDataTab(patientData) {
    // Health metrics
    const healthBMI = document.getElementById("healthBMI")
    const healthGlucose = document.getElementById("healthGlucose")
    const healthBP = document.getElementById("healthBP")

    if (healthBMI) healthBMI.textContent = patientData.health?.bmi || "N/A"
    if (healthGlucose) {
      const glucose = patientData.health?.fastingGlucose
      healthGlucose.textContent = glucose ? `${glucose} mg/dL` : "N/A"
    }
    if (healthBP) healthBP.textContent = patientData.health?.bloodPressure || "N/A"

    // Medical history
    const healthDiabetesType = document.getElementById("healthDiabetesType")
    const healthFamilyHistory = document.getElementById("healthFamilyHistory")
    const healthConditions = document.getElementById("healthConditions")
    const healthMedications = document.getElementById("healthMedications")
    const healthAllergies = document.getElementById("healthAllergies")

    if (healthDiabetesType) healthDiabetesType.textContent = patientData.health?.diabetesType || "N/A"
    if (healthFamilyHistory) healthFamilyHistory.textContent = patientData.health?.familyHistory || "N/A"
    if (healthConditions) healthConditions.textContent = patientData.health?.knownConditions || "None"
    if (healthMedications) healthMedications.textContent = patientData.health?.currentMedications || "None"
    if (healthAllergies) healthAllergies.textContent = patientData.health?.allergies || "None"

    // Clinical data
    const healthHeight = document.getElementById("healthHeight")
    const healthWeight = document.getElementById("healthWeight")
    const healthHbA1c = document.getElementById("healthHbA1c")
    const healthBloodSugar = document.getElementById("healthBloodSugar")
    const healthCholesterol = document.getElementById("healthCholesterol")

    if (healthHeight) {
      const height = patientData.health?.height
      healthHeight.textContent = height ? `${height} cm` : "N/A"
    }
    if (healthWeight) {
      const weight = patientData.health?.weight
      healthWeight.textContent = weight ? `${weight} kg` : "N/A"
    }
    if (healthHbA1c) {
      const hba1c = patientData.health?.hba1c
      healthHbA1c.textContent = hba1c ? `${hba1c}%` : "N/A"
    }
    if (healthBloodSugar) {
      const bloodSugar = patientData.health?.bloodSugarLevel
      healthBloodSugar.textContent = bloodSugar ? `${bloodSugar} mg/dL` : "N/A"
    }
    if (healthCholesterol) {
      const cholesterol = patientData.health?.cholesterolLevel
      healthCholesterol.textContent = cholesterol ? `${cholesterol} mg/dL` : "N/A"
    }
  }

  // Populate Insights Tab
  populateInsightsTab(patientData, complications, riskLevel) {
    // Overall risk and individual risks
    const insightsOverallRisk = document.getElementById("insightsOverallRisk")
    const insightsRetinopathy = document.getElementById("insightsRetinopathy")
    const insightsNeuropathy = document.getElementById("insightsNeuropathy")
    const insightsCardiovascular = document.getElementById("insightsCardiovascular")

    if (insightsOverallRisk) {
      insightsOverallRisk.textContent = riskLevel
      insightsOverallRisk.className = "risk-badge"
      if (riskLevel === "High Risk") {
        insightsOverallRisk.classList.add("high-risk")
      } else if (riskLevel === "Moderate Risk") {
        insightsOverallRisk.classList.add("moderate-risk")
      } else {
        insightsOverallRisk.classList.add("low-risk")
      }
    }

    // Individual risk assessments
    const retinopathyRisk = complications.includes("Retinopathy") ? "High" : "Low"
    const neuropathyRisk = complications.includes("Neuropathy") ? "High" : "Low"
    const cardiovascularRisk = complications.includes("Cardiovascular Risk") ? "High" : "Low"

    this.updateRiskBadge("insightsRetinopathy", retinopathyRisk)
    this.updateRiskBadge("insightsNeuropathy", neuropathyRisk)
    this.updateRiskBadge("insightsCardiovascular", cardiovascularRisk)

    // AI recommendations
    const insightsRiskScore = document.getElementById("insightsRiskScore")
    const insightsMonitoring = document.getElementById("insightsMonitoring")
    const insightsComplications = document.getElementById("insightsComplications")
    const insightsSuggestion = document.getElementById("insightsSuggestion")

    // Calculate risk score
    let riskScore = 0
    const age = patientData.basicInfo?.age || 0
    const hba1c = patientData.health?.hba1c || 0
    const fastingGlucose = patientData.health?.fastingGlucose || 0

    if (age > 65) riskScore += 20
    else if (age > 45) riskScore += 10
    if (fastingGlucose > 126) riskScore += 30
    else if (fastingGlucose > 100) riskScore += 15
    if (hba1c > 7) riskScore += 25
    else if (hba1c > 6.5) riskScore += 15

    if (insightsRiskScore) insightsRiskScore.textContent = `${Math.min(riskScore, 100)}%`
    if (insightsMonitoring) {
      const monitoring = riskScore > 50 ? "Weekly" : riskScore > 25 ? "Monthly" : "Quarterly"
      insightsMonitoring.textContent = monitoring
    }
    if (insightsComplications) {
      const complicationsText =
        complications.length > 0 && complications[0] !== "None detected" ? complications.join(", ") : "None detected"
      insightsComplications.textContent = complicationsText
    }
    if (insightsSuggestion) {
      let suggestion = "Continue current management plan with regular monitoring."
      if (complications.includes("Retinopathy")) {
        suggestion = "Recommend ophthalmologic examination and HbA1c optimization."
      } else if (complications.includes("Neuropathy")) {
        suggestion = "Consider neurological assessment and foot care education."
      } else if (complications.includes("Cardiovascular Risk")) {
        suggestion = "Recommend cardiovascular screening and lifestyle modifications."
      } else if (fastingGlucose > 126) {
        suggestion = "Consider insulin dosage reassessment in 2 weeks based on fasting blood sugar patterns."
      } else if (hba1c > 7) {
        suggestion = "Recommend dietary consultation and increased monitoring frequency."
      }
      insightsSuggestion.textContent = suggestion
    }
  }

  // Populate Notes Tab
  populateNotesTab(patientData) {
    const notesMonitoring = document.getElementById("notesMonitoring")
    const notesDiagnosis = document.getElementById("notesDiagnosis")
    const notesLastCheckup = document.getElementById("notesLastCheckup")
    const notesNextFollowup = document.getElementById("notesNextFollowup")
    const notesRemarks = document.getElementById("notesRemarks")

    if (notesMonitoring) notesMonitoring.textContent = patientData.notes?.monitoringFrequency || "Not Set"
    if (notesDiagnosis) notesDiagnosis.textContent = patientData.notes?.initialDiagnosis || "N/A"

    // Format dates
    if (notesLastCheckup && patientData.notes?.lastCheckupDate) {
      const date = new Date(patientData.notes.lastCheckupDate)
      notesLastCheckup.textContent = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (notesLastCheckup) {
      notesLastCheckup.textContent = "N/A"
    }

    if (notesNextFollowup && patientData.notes?.nextFollowUp) {
      const date = new Date(patientData.notes.nextFollowUp)
      notesNextFollowup.textContent = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } else if (notesNextFollowup) {
      notesNextFollowup.textContent = "N/A"
    }

    if (notesRemarks) {
      const remarks = patientData.notes?.remarksNotes
      notesRemarks.textContent = remarks || "No additional notes provided."
    }
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
          <td style="text-align: center;">
              <input type="checkbox" class="bulk-checkbox" data-patient-id="${patientData.patientId}">
          </td>
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
    this.attachBulkCheckboxListeners()

    // Update statistics
    this.updateStats()
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

        // Update stats after deletion
        this.updateStats()
      }
    } catch (error) {
      console.error("Error deleting patient from storage:", error)
    }
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
        const patientIdCell = row.cells[2] // Adjusted for checkbox column
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
            row.cells[1].textContent = index + 1 // Adjusted for checkbox column
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

    // Remove from selected patients if it was selected
    if (window.patientTableManager && window.patientTableManager.selectedPatients.has(patientId)) {
      window.patientTableManager.selectedPatients.delete(patientId)
      window.patientTableManager.updateBulkSelectionUI()
    }

    console.log("✅ Patient deleted successfully")
  }
}

// Initialize the patient table manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.patientTableManager = new PatientTableManager()
  console.log("✅ Patient Table Manager initialized")
})
