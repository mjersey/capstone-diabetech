// Add Patient Modal JavaScript
class AddPatientModal {
  constructor() {
      this.modal = document.getElementById('addPatientModal');
      this.form = document.getElementById('addPatientForm');
      this.closeBtn = document.getElementById('closeAddPatientModal');
      this.clearBtn = document.getElementById('clearForm');
      this.tabButtons = document.querySelectorAll('.add-patient-modal .tab-button');
      this.tabContents = document.querySelectorAll('.add-patient-modal .tab-content');
      
      this.currentPatientId = 'P000';
      this.nextPatientNumber = 1;
      
      this.init();
  }
  
  init() {
      this.bindEvents();
      this.generatePatientId();
      this.setupDateOfBirthHandler();
  }
  
  bindEvents() {
      // Close modal events
      this.closeBtn.addEventListener('click', () => this.close());
      this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
      });
      
      // Tab switching
      this.tabButtons.forEach(button => {
          button.addEventListener('click', () => this.switchTab(button.dataset.tab));
      });
      
      // Form events
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      this.clearBtn.addEventListener('click', () => this.clearForm());
      
      // Keyboard events
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen()) {
              this.close();
          }
      });

      // Remove section-specific handlers and add insights functionality
      const generateInsightsBtn = document.getElementById('generateInsightsBtn');
      if (generateInsightsBtn) {
          generateInsightsBtn.addEventListener('click', () => this.generateInsights());
      }

      // Monitor form changes to enable/disable insights generation
      this.form.addEventListener('input', () => this.checkInsightsEligibility());
      this.form.addEventListener('change', () => this.checkInsightsEligibility());

      // Section Clear/Save buttons
      document.querySelectorAll('.section-clear').forEach(btn => {
        btn.addEventListener('click', (e) => this.clearSection(e));
      });

      document.querySelectorAll('.section-save').forEach(btn => {
        btn.addEventListener('click', (e) => this.saveSection(e));
      });

      // Auto BMI calculation
      const heightInput = this.form.querySelector('input[name="height"]');
      const weightInput = this.form.querySelector('input[name="weight"]');
      const bmiInput = this.form.querySelector('input[name="bmi"]');

      if (heightInput && weightInput && bmiInput) {
        const calculateBMI = () => {
            const height = parseFloat(heightInput.value);
            const weight = parseFloat(weightInput.value);
            
            if (height && weight) {
                const heightInMeters = height / 100;
                const bmi = weight / (heightInMeters * heightInMeters);
                bmiInput.value = bmi.toFixed(1);
            }
        };
        
        heightInput.addEventListener('input', calculateBMI);
        weightInput.addEventListener('input', calculateBMI);
      }

  }
  
  checkInsightsEligibility() {
    const generateBtn = document.getElementById('generateInsightsBtn');
    if (!generateBtn) return;
    
    // Check if basic info has required fields
    const sex = this.form.querySelector('input[name="sex"]:checked');
    const age = this.form.querySelector('input[name="age"]').value;
    
    // Check if health info has some data
    const height = this.form.querySelector('input[name="height"]').value;
    const weight = this.form.querySelector('input[name="weight"]').value;
    const fastingGlucose = this.form.querySelector('input[name="fastingGlucose"]').value;
    const bloodSugar = this.form.querySelector('input[name="bloodSugarLevel"]').value;
    const hba1c = this.form.querySelector('input[name="hba1c"]').value;
    
    const hasBasicInfo = sex && age;
    const hasHealthInfo = height || weight || fastingGlucose || bloodSugar || hba1c;
    
    generateBtn.disabled = !(hasBasicInfo && hasHealthInfo);
}

generateInsights() {
    const emptyState = document.getElementById('insightsEmptyState');
    const generatedState = document.getElementById('insightsGeneratedState');
    const generateBtn = document.getElementById('generateInsightsBtn');
    
    // Show loading state
    generateBtn.textContent = 'Generating...';
    generateBtn.disabled = true;
    
    // Simulate AI processing
    setTimeout(() => {
        // Calculate insights based on form data
        const insights = this.calculateInsights();
        
        // Update UI with generated insights
        document.getElementById('riskScoreValue').textContent = insights.riskScore;
        document.getElementById('complicationRiskValue').textContent = insights.complicationRisk;
        document.getElementById('monitoringValue').textContent = insights.monitoring;
        document.getElementById('suggestionText').textContent = insights.suggestion;
        
        // Update risk value styling
        const riskValue = document.getElementById('riskScoreValue');
        riskValue.className = 'insight-value risk-value';
        if (insights.riskScore.includes('High') || parseInt(insights.riskScore) > 70) {
            riskValue.style.background = '#fee2e2';
            riskValue.style.color = '#dc2626';
        }
        
        // Show generated state
        emptyState.style.display = 'none';
        generatedState.style.display = 'block';
        
        console.log('Insights generated successfully');
    }, 2000);
}

calculateInsights() {
    const formData = new FormData(this.form);
    
    // Simple risk calculation based on available data
    let riskScore = 0;
    let suggestions = [];
    
    const age = parseInt(formData.get('age')) || 0;
    const fastingGlucose = parseInt(formData.get('fastingGlucose')) || 0;
    const hba1c = parseFloat(formData.get('hba1c')) || 0;
    const height = parseFloat(formData.get('height')) || 0;
    const weight = parseFloat(formData.get('weight')) || 0;
    
    // Age factor
    if (age > 65) riskScore += 20;
    else if (age > 45) riskScore += 10;
    
    // Glucose factor
    if (fastingGlucose > 126) riskScore += 30;
    else if (fastingGlucose > 100) riskScore += 15;
    
    // HbA1c factor
    if (hba1c > 7) riskScore += 25;
    else if (hba1c > 6.5) riskScore += 15;
    
    // BMI factor
    if (height && weight) {
        const bmi = weight / ((height / 100) ** 2);
        if (bmi > 30) riskScore += 15;
        else if (bmi > 25) riskScore += 8;
    }
    
    // Generate suggestions
    if (fastingGlucose > 126) {
        suggestions.push('Consider insulin dosage reassessment in 2 weeks based on fasting blood sugar patterns.');
    } else if (hba1c > 7) {
        suggestions.push('Recommend dietary consultation and increased monitoring frequency.');
    } else {
        suggestions.push('Continue current management plan with regular monitoring.');
    }
    
    return {
        riskScore: `${Math.min(riskScore, 100)}%`,
        complicationRisk: riskScore > 50 ? 'High' : riskScore > 25 ? 'Moderate' : 'Low',
        monitoring: riskScore > 50 ? 'Weekly' : riskScore > 25 ? 'Monthly' : 'Quarterly',
        suggestion: suggestions[0]
    };
}

clearForm() {
    this.form.reset();
    
    // Reset insights to empty state
    const emptyState = document.getElementById('insightsEmptyState');
    const generatedState = document.getElementById('insightsGeneratedState');
    const generateBtn = document.getElementById('generateInsightsBtn');
    
    if (emptyState && generatedState) {
        emptyState.style.display = 'flex';
        generatedState.style.display = 'none';
    }
    
    if (generateBtn) {
        generateBtn.textContent = 'Generate Insights';
        generateBtn.disabled = true;
    }
    
    // Clear any error highlights
    const fields = this.form.querySelectorAll('input, select, textarea');
    fields.forEach(field => this.clearError(field));
    
    // Reset to first tab
    this.switchTab('basic-info');
    
    // Generate new patient ID
    this.generatePatientId();
    
    console.log('Form cleared');
}

  setupDateOfBirthHandler() {
      const dobInput = this.form.querySelector('input[name="dateOfBirth"]');
      const ageInput = this.form.querySelector('input[name="age"]');
      
      if (dobInput && ageInput) {
          dobInput.addEventListener('change', () => {
              const birthDate = new Date(dobInput.value);
              const today = new Date();
              const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
              
              if (age >= 0 && age <= 120) {
                  ageInput.value = age;
              }
          });
          
          ageInput.addEventListener('input', () => {
              // Clear date of birth when age is manually entered
              if (ageInput.value && dobInput.value) {
                  const confirmClear = confirm('Changing age will clear the date of birth. Continue?');
                  if (!confirmClear) {
                      ageInput.value = '';
                  } else {
                      dobInput.value = '';
                  }
              }
          });
      }
  }
  
  generatePatientId() {
      // In a real application, this would come from the server
      // For now, we'll generate a simple incremental ID
      const existingPatients = this.getExistingPatients();
      this.nextPatientNumber = existingPatients.length + 1;
      this.currentPatientId = `P${String(this.nextPatientNumber).padStart(3, '0')}`;
      
      const patientIdElement = this.modal.querySelector('.patient-id');
      if (patientIdElement) {
          patientIdElement.textContent = this.currentPatientId;
      }
  }
  
  clearSection(e) {
    const section = e.target.closest('.form-section');
    const inputs = section.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'radio' || input.type === 'checkbox') {
            input.checked = false;
        } else if (input.name !== 'bmi') { // Don't clear calculated BMI
            input.value = '';
        }
    });
    
    console.log('Section cleared');
}

  saveSection(e) {
    console.log('Section saved (placeholder)');
    this.showSuccess('Section saved successfully!');
}

  getExistingPatients() {
      // This would typically fetch from your backend
      // For now, return mock data or get from localStorage
      const patients = localStorage.getItem('patients');
      return patients ? JSON.parse(patients) : [];
  }
  
  switchTab(tabId) {
      // Remove active class from all tabs and contents
      this.tabButtons.forEach(btn => btn.classList.remove('active'));
      this.tabContents.forEach(content => content.classList.remove('active'));
      
      // Add active class to selected tab and content
      const selectedTab = document.querySelector(`[data-tab="${tabId}"]`);
      const selectedContent = document.getElementById(tabId);
      
      if (selectedTab && selectedContent) {
          selectedTab.classList.add('active');
          selectedContent.classList.add('active');
      }
  }
  
  async handleSubmit(e) {
      e.preventDefault();
      
      if (!this.validateForm()) {
          return;
      }
      
      const formData = this.getFormData();
      
      try {
          this.setLoading(true);
          
          const response = await fetch('/api/add-patient', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          
          if (result.success) {
              this.showSuccess('Patient added successfully!');
              this.clearForm();
              this.close();
              
              // Refresh the patients table if it exists
              if (window.refreshPatientsTable) {
                  window.refreshPatientsTable();
              }
              
              // Trigger custom event for other components
              document.dispatchEvent(new CustomEvent('patientAdded', {
                  detail: { patient: result.patient }
              }));
              
          } else {
              this.showError(result.message || 'Failed to add patient');
          }
          
      } catch (error) {
          console.error('Error adding patient:', error);
          this.showError('Network error. Please try again.');
      } finally {
          this.setLoading(false);
      }
  }
  
  validateForm() {
      const requiredFields = this.form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
          if (!field.value.trim()) {
              this.highlightError(field);
              isValid = false;
          } else {
              this.clearError(field);
          }
      });
      
      // Custom validations
      const age = this.form.querySelector('input[name="age"]').value;
      if (age && (age < 1 || age > 120)) {
          this.showError('Please enter a valid age between 1 and 120');
          isValid = false;
      }
      
      const bmi = this.form.querySelector('input[name="bmi"]').value;
      if (bmi && (bmi < 10 || bmi > 50)) {
          this.showError('Please enter a valid BMI between 10 and 50');
          isValid = false;
      }
      
      if (!isValid) {
          this.showError('Please fill in all required fields correctly');
      }
      
      return isValid;
  }
  
  getFormData() {
      const formData = new FormData(this.form);
      const data = {
          patientId: this.currentPatientId,
          basicInfo: {},
          health: {},
          lifestyle: {},
          notes: {}
      };
      
      // Basic Info
      data.basicInfo = {
          sex: formData.get('sex'),
          dateOfBirth: formData.get('dateOfBirth'),
          age: parseInt(formData.get('age')),
          smokingStatus: formData.get('smokingStatus')
      };
      
      // Health
      data.health = {
          bmi: parseFloat(formData.get('bmi')) || null,
          glucoseLevel: parseInt(formData.get('glucoseLevel')) || null,
          bloodPressure: {
              systolic: parseInt(formData.get('systolic')) || null,
              diastolic: parseInt(formData.get('diastolic')) || null
          }
      };
      
      // Lifestyle
      data.lifestyle = {
          physicalActivity: formData.get('physicalActivity'),
          alcoholConsumption: formData.get('alcoholConsumption'),
          stressLevel: formData.get('stressLevel'),
          dietType: formData.get('dietType'),
          sleepDuration: parseFloat(formData.get('sleepDuration')) || null
      };
      
      // Risk Assessment
      data.riskLevel = formData.get('riskLevel');
      data.checkupFrequency = formData.get('checkupFrequency');
      
      // Notes
      data.notes = {
          complications: formData.get('complications'),
          medicalHistory: formData.get('medicalHistory'),
          notes: formData.get('notes')
      };
      
      return data;
  }
  
  highlightError(field) {
      field.style.borderColor = '#ef4444';
      field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
  }
  
  clearError(field) {
      field.style.borderColor = '';
      field.style.boxShadow = '';
  }
  
  clearForm() {
      this.form.reset();
      
      // Clear any error highlights
      const fields = this.form.querySelectorAll('input, select, textarea');
      fields.forEach(field => this.clearError(field));
      
      // Reset to first tab
      this.switchTab('basic-info');
      
      // Generate new patient ID
      this.generatePatientId();
      
      console.log('Form cleared');
  }
  
  setLoading(loading) {
      const saveBtn = this.form.querySelector('.btn-save');
      const formContent = this.form;
      
      if (loading) {
          saveBtn.disabled = true;
          saveBtn.textContent = 'Saving...';
          formContent.classList.add('form-loading');
      } else {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save';
          formContent.classList.remove('form-loading');
      }
  }
  
  showSuccess(message) {
      // You can integrate with your existing notification system
      console.log('Success:', message);
      
      // Simple alert for now - replace with your notification system
      if (window.showNotification) {
          window.showNotification(message, 'success');
      } else {
          alert(message);
      }
  }
  
  showError(message) {
      console.error('Error:', message);
      
      // Simple alert for now - replace with your notification system
      if (window.showNotification) {
          window.showNotification(message, 'error');
      } else {
          alert(message);
      }
  }
  
  open() {
      this.modal.classList.add('show');
      document.body.style.overflow = 'hidden';
      
      // Focus first input
      const firstInput = this.form.querySelector('input[type="radio"]:checked, input:not([type="radio"]), select');
      if (firstInput) {
          setTimeout(() => firstInput.focus(), 100);
      }
      
      console.log('Add Patient modal opened');
  }
  
  close() {
      this.modal.classList.remove('show');
      document.body.style.overflow = 'auto';
      console.log('Add Patient modal closed');
  }
  
  isOpen() {
      return this.modal.classList.contains('show');
  }
}

// Initialize the modal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.addPatientModal = new AddPatientModal();
  
  // Connect to existing "Add Patient" button
  const addPatientBtn = document.getElementById('addPatientBtn');
  if (addPatientBtn) {
      addPatientBtn.addEventListener('click', () => {
          window.addPatientModal.open();
      });
  }
  
  console.log('Add Patient Modal initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AddPatientModal;
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔄 Initializing Add Patient Modal...')
  
  // Small delay to ensure everything is ready
  setTimeout(() => {
      if (typeof window.addPatientModal === 'undefined') {
          console.log('🚀 Creating Add Patient Modal instance...')
          window.addPatientModal = new AddPatientModal()
          console.log('✅ Add Patient Modal ready!')
      }
  }, 50)
})

// Notes Tab JavaScript Functionality
class NotesTabHandler {
  constructor(parentModal) {
      this.parentModal = parentModal;
      this.form = parentModal.form;
      this.init();
  }

  init() {
      this.bindNotesEvents();
      this.setupDateValidation();
      this.setupMonitoringFrequency();
      this.setupAutoSave();
  }

  bindNotesEvents() {
      // Monitor radio button changes
      const monitoringRadios = this.form.querySelectorAll('input[name="monitoringFrequency"]');
      monitoringRadios.forEach(radio => {
          radio.addEventListener('change', () => this.handleMonitoringChange(radio));
      });

      // Auto-calculate next follow-up based on monitoring frequency
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]');
      if (lastCheckupInput) {
          lastCheckupInput.addEventListener('change', () => this.calculateNextFollowUp());
      }

      // Character counter for remarks
      const remarksTextarea = this.form.querySelector('textarea[name="remarksNotes"]');
      if (remarksTextarea) {
          this.setupCharacterCounter(remarksTextarea);
      }

      // Auto-resize textarea
      if (remarksTextarea) {
          remarksTextarea.addEventListener('input', () => this.autoResizeTextarea(remarksTextarea));
      }

      // Save draft functionality
      const notesInputs = this.form.querySelectorAll('#notes input, #notes textarea, #notes select');
      notesInputs.forEach(input => {
          input.addEventListener('input', () => this.saveDraft());
      });
  }

  handleMonitoringChange(selectedRadio) {
      const value = selectedRadio.value;
      console.log(`📅 Monitoring frequency changed to: ${value}`);
      
      // Update next follow-up date based on monitoring frequency
      this.calculateNextFollowUp();
      
      // Show custom frequency input if "Custom" is selected
      this.handleCustomFrequency(value);
      
      // Visual feedback
      this.highlightSelectedOption(selectedRadio);
  }

  handleCustomFrequency(frequency) {
      let customInput = this.form.querySelector('#customFrequencyInput');
      
      if (frequency === 'Custom') {
          if (!customInput) {
              // Create custom frequency input
              const customDiv = document.createElement('div');
              customDiv.className = 'custom-frequency-container';
              customDiv.innerHTML = `
                  <div class="form-group" style="margin-top: 16px;">
                      <label class="form-label">Custom Frequency:</label>
                      <div class="custom-frequency-input">
                          <input type="number" id="customFrequencyInput" name="customFrequencyValue" 
                                 class="form-input" min="1" max="365" placeholder="Enter days">
                          <span class="frequency-unit">days</span>
                      </div>
                  </div>
              `;
              
              const monitoringGroup = this.form.querySelector('.radio-group.horizontal').parentElement;
              monitoringGroup.appendChild(customDiv);
              
              // Focus on the new input
              setTimeout(() => {
                  document.getElementById('customFrequencyInput').focus();
              }, 100);
          }
      } else {
          // Remove custom input if it exists
          const customContainer = this.form.querySelector('.custom-frequency-container');
          if (customContainer) {
              customContainer.remove();
          }
      }
  }

  calculateNextFollowUp() {
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]');
      const nextFollowUpInput = this.form.querySelector('input[name="nextFollowUp"]');
      const selectedFrequency = this.form.querySelector('input[name="monitoringFrequency"]:checked');
      
      if (!lastCheckupInput.value || !selectedFrequency || !nextFollowUpInput) return;
      
      const lastCheckupDate = new Date(lastCheckupInput.value);
      let daysToAdd = 0;
      
      switch (selectedFrequency.value) {
          case 'Monthly':
              daysToAdd = 30;
              break;
          case 'Quarterly':
              daysToAdd = 90;
              break;
          case 'Custom':
              const customValue = this.form.querySelector('#customFrequencyInput')?.value;
              daysToAdd = parseInt(customValue) || 30;
              break;
          default:
              daysToAdd = 30;
      }
      
      const nextFollowUpDate = new Date(lastCheckupDate);
      nextFollowUpDate.setDate(nextFollowUpDate.getDate() + daysToAdd);
      
      // Format date for input (YYYY-MM-DD)
      const formattedDate = nextFollowUpDate.toISOString().split('T')[0];
      nextFollowUpInput.value = formattedDate;
      
      // Visual feedback
      this.showCalculationFeedback(nextFollowUpInput);
      
      console.log(`📅 Next follow-up calculated: ${formattedDate}`);
  }

  showCalculationFeedback(input) {
      input.style.background = '#dcfce7';
      input.style.borderColor = '#16a34a';
      
      setTimeout(() => {
          input.style.background = '';
          input.style.borderColor = '';
      }, 1500);
  }

  setupDateValidation() {
      const lastCheckupInput = this.form.querySelector('input[name="lastCheckupDate"]');
      const nextFollowUpInput = this.form.querySelector('input[name="nextFollowUp"]');
      
      if (lastCheckupInput) {
          lastCheckupInput.addEventListener('change', () => {
              const selectedDate = new Date(lastCheckupInput.value);
              const today = new Date();
              
              if (selectedDate > today) {
                  this.showValidationError(lastCheckupInput, 'Last check-up date cannot be in the future');
                  lastCheckupInput.value = '';
              } else {
                  this.clearValidationError(lastCheckupInput);
              }
          });
      }
      
      if (nextFollowUpInput) {
          nextFollowUpInput.addEventListener('change', () => {
              const nextDate = new Date(nextFollowUpInput.value);
              const lastDate = new Date(this.form.querySelector('input[name="lastCheckupDate"]').value);
              
              if (this.form.querySelector('input[name="lastCheckupDate"]').value && nextDate <= lastDate) {
                  this.showValidationError(nextFollowUpInput, 'Next follow-up must be after last check-up');
              } else {
                  this.clearValidationError(nextFollowUpInput);
              }
          });
      }
  }

  setupCharacterCounter(textarea) {
      const maxLength = 1000;
      
      // Create character counter
      const counterDiv = document.createElement('div');
      counterDiv.className = 'character-counter';
      counterDiv.innerHTML = `<span id="charCount">0</span>/${maxLength} characters`;
      
      textarea.parentElement.appendChild(counterDiv);
      
      // Update counter on input
      textarea.addEventListener('input', () => {
          const currentLength = textarea.value.length;
          const charCountSpan = document.getElementById('charCount');
          
          charCountSpan.textContent = currentLength;
          
          // Change color based on usage
          if (currentLength > maxLength * 0.9) {
              counterDiv.style.color = '#dc2626';
          } else if (currentLength > maxLength * 0.7) {
              counterDiv.style.color = '#d97706';
          } else {
              counterDiv.style.color = '#6b7280';
          }
          
          // Prevent exceeding max length
          if (currentLength > maxLength) {
              textarea.value = textarea.value.substring(0, maxLength);
              charCountSpan.textContent = maxLength;
          }
      });
  }

  autoResizeTextarea(textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 300) + 'px';
  }

  highlightSelectedOption(selectedRadio) {
      // Remove highlight from all options
      const allOptions = this.form.querySelectorAll('.radio-group.horizontal .radio-option');
      allOptions.forEach(option => {
          option.classList.remove('selected');
      });
      
      // Add highlight to selected option
      selectedRadio.closest('.radio-option').classList.add('selected');
  }

  setupMonitoringFrequency() {
      // Set default monitoring frequency based on patient data
      const defaultFrequency = this.getRecommendedFrequency();
      if (defaultFrequency) {
          const defaultRadio = this.form.querySelector(`input[name="monitoringFrequency"][value="${defaultFrequency}"]`);
          if (defaultRadio) {
              defaultRadio.checked = true;
              this.highlightSelectedOption(defaultRadio);
          }
      }
  }

  getRecommendedFrequency() {
      // Get patient data from other tabs to recommend frequency
      const age = parseInt(this.form.querySelector('input[name="age"]')?.value) || 0;
      const hba1c = parseFloat(this.form.querySelector('input[name="hba1c"]')?.value) || 0;
      const fastingGlucose = parseInt(this.form.querySelector('input[name="fastingGlucose"]')?.value) || 0;
      
      // Recommend based on risk factors
      if (age > 65 || hba1c > 7 || fastingGlucose > 126) {
          return 'Monthly';
      } else if (age > 45 || hba1c > 6.5 || fastingGlucose > 100) {
          return 'Quarterly';
      }
      
      return 'Quarterly'; // Default
  }

  setupAutoSave() {
      let saveTimeout;
      
      const autoSave = () => {
          clearTimeout(saveTimeout);
          saveTimeout = setTimeout(() => {
              this.saveDraft();
          }, 2000); // Save after 2 seconds of inactivity
      };
      
      const notesInputs = this.form.querySelectorAll('#notes input, #notes textarea');
      notesInputs.forEach(input => {
          input.addEventListener('input', autoSave);
      });
  }

  saveDraft() {
      const notesData = this.getNotesData();
      const patientId = this.parentModal.currentPatientId;
      
      // Save to localStorage as draft
      const draftKey = `patient_notes_draft_${patientId}`;
      localStorage.setItem(draftKey, JSON.stringify({
          ...notesData,
          lastSaved: new Date().toISOString()
      }));
      
      // Show save indicator
      this.showSaveIndicator();
      
      console.log('💾 Notes draft saved');
  }

  loadDraft() {
      const patientId = this.parentModal.currentPatientId;
      const draftKey = `patient_notes_draft_${patientId}`;
      const draft = localStorage.getItem(draftKey);
      
      if (draft) {
          const draftData = JSON.parse(draft);
          this.populateNotesData(draftData);
          console.log('📄 Notes draft loaded');
      }
  }

  getNotesData() {
      return {
          monitoringFrequency: this.form.querySelector('input[name="monitoringFrequency"]:checked')?.value || '',
          customFrequencyValue: this.form.querySelector('input[name="customFrequencyValue"]')?.value || '',
          initialDiagnosis: this.form.querySelector('input[name="initialDiagnosis"]')?.value || '',
          lastCheckupDate: this.form.querySelector('input[name="lastCheckupDate"]')?.value || '',
          nextFollowUp: this.form.querySelector('input[name="nextFollowUp"]')?.value || '',
          remarksNotes: this.form.querySelector('textarea[name="remarksNotes"]')?.value || ''
      };
  }

  populateNotesData(data) {
      // Populate monitoring frequency
      if (data.monitoringFrequency) {
          const radio = this.form.querySelector(`input[name="monitoringFrequency"][value="${data.monitoringFrequency}"]`);
          if (radio) {
              radio.checked = true;
              this.highlightSelectedOption(radio);
              this.handleCustomFrequency(data.monitoringFrequency);
          }
      }
      
      // Populate other fields
      const fields = ['customFrequencyValue', 'initialDiagnosis', 'lastCheckupDate', 'nextFollowUp', 'remarksNotes'];
      fields.forEach(field => {
          const input = this.form.querySelector(`[name="${field}"]`);
          if (input && data[field]) {
              input.value = data[field];
          }
      });
  }

  showSaveIndicator() {
      let indicator = document.getElementById('saveIndicator');
      
      if (!indicator) {
          indicator = document.createElement('div');
          indicator.id = 'saveIndicator';
          indicator.className = 'save-indicator';
          indicator.innerHTML = '💾 Draft saved';
          document.body.appendChild(indicator);
      }
      
      indicator.classList.add('show');
      
      setTimeout(() => {
          indicator.classList.remove('show');
      }, 2000);
  }

  showValidationError(input, message) {
      this.clearValidationError(input);
      
      const errorDiv = document.createElement('div');
      errorDiv.className = 'validation-error';
      errorDiv.textContent = message;
      
      input.parentElement.appendChild(errorDiv);
      input.style.borderColor = '#dc2626';
  }

  clearValidationError(input) {
      const existingError = input.parentElement.querySelector('.validation-error');
      if (existingError) {
          existingError.remove();
      }
      input.style.borderColor = '';
  }

  validateNotesTab() {
      let isValid = true;
      const errors = [];
      
      // Check if monitoring frequency is selected
      const monitoringSelected = this.form.querySelector('input[name="monitoringFrequency"]:checked');
      if (!monitoringSelected) {
          errors.push('Please select a monitoring frequency');
          isValid = false;
      }
      
      // Validate custom frequency if selected
      if (monitoringSelected?.value === 'Custom') {
          const customValue = this.form.querySelector('#customFrequencyInput')?.value;
          if (!customValue || customValue < 1 || customValue > 365) {
              errors.push('Please enter a valid custom frequency (1-365 days)');
              isValid = false;
          }
      }
      
      // Validate dates
      const lastCheckup = this.form.querySelector('input[name="lastCheckupDate"]').value;
      const nextFollowUp = this.form.querySelector('input[name="nextFollowUp"]').value;
      
      if (lastCheckup && nextFollowUp) {
          const lastDate = new Date(lastCheckup);
          const nextDate = new Date(nextFollowUp);
          
          if (nextDate <= lastDate) {
              errors.push('Next follow-up date must be after last check-up date');
              isValid = false;
          }
      }
      
      if (!isValid) {
          console.log('❌ Notes tab validation errors:', errors);
      }
      
      return { isValid, errors };
  }

  clearNotesTab() {
      // Clear all inputs
      const inputs = this.form.querySelectorAll('#notes input, #notes textarea');
      inputs.forEach(input => {
          if (input.type === 'radio') {
              input.checked = false;
          } else {
              input.value = '';
          }
      });
      
      // Remove custom frequency input if exists
      const customContainer = this.form.querySelector('.custom-frequency-container');
      if (customContainer) {
          customContainer.remove();
      }
      
      // Clear highlights
      const allOptions = this.form.querySelectorAll('.radio-group.horizontal .radio-option');
      allOptions.forEach(option => {
          option.classList.remove('selected');
      });
      
      // Clear validation errors
      const errors = this.form.querySelectorAll('#notes .validation-error');
      errors.forEach(error => error.remove());
      
      console.log('🧹 Notes tab cleared');
  }
}

// Additional CSS for Notes Tab JavaScript functionality
const notesTabCSS = `
<style>
/* Custom Frequency Input */
.custom-frequency-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.custom-frequency-input input {
  flex: 1;
  max-width: 120px;
}

.frequency-unit {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

/* Selected Radio Option */
.radio-option.selected {
  background-color: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
}

/* Character Counter */
.character-counter {
  text-align: right;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

/* Save Indicator */
.save-indicator {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 12px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 10000;
}

.save-indicator.show {
  opacity: 1;
  transform: translateY(0);
}

/* Validation Error */
.validation-error {
  color: #dc2626;
  font-size: 12px;
  margin-top: 4px;
}

/* Custom Frequency Container */
.custom-frequency-container {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
      opacity: 0;
      transform: translateY(-10px);
  }
  to {
      opacity: 1;
      transform: translateY(0);
  }
}
</style>
`;

// Inject CSS
document.head.insertAdjacentHTML('beforeend', notesTabCSS);

// Extend the main AddPatientModal class
if (window.AddPatientModal) {
  const originalInit = window.AddPatientModal.prototype.init;
  
  window.AddPatientModal.prototype.init = function() {
      originalInit.call(this);
      this.notesHandler = new NotesTabHandler(this);
  };
  
  // Add notes validation to form validation
  const originalValidateForm = window.AddPatientModal.prototype.validateForm;
  
  window.AddPatientModal.prototype.validateForm = function() {
      const baseValidation = originalValidateForm.call(this);
      const notesValidation = this.notesHandler.validateNotesTab();
      
      return baseValidation && notesValidation.isValid;
  };
  
  // Add notes clearing to form clearing
  const originalClearForm = window.AddPatientModal.prototype.clearForm;
  
  window.AddPatientModal.prototype.clearForm = function() {
      originalClearForm.call(this);
      if (this.notesHandler) {
          this.notesHandler.clearNotesTab();
      }
  };
}

console.log('✅ Notes Tab JavaScript functionality loaded');