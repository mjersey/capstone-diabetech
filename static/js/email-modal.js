// Email Modal functionality
const emailModal = document.getElementById('emailModal');
const closeModal = document.getElementById('closeModal');
const confirmBtn = document.getElementById('confirmBtn');
const resendBtn = document.getElementById('resendBtn');
const otpInputs = document.querySelectorAll('.otp-input');
const timerElement = document.getElementById('timer');
const userEmailSpan = document.getElementById('userEmail');

let countdown = 300; // 5 minutes in seconds
let timerInterval;

// Show modal function
function showEmailModal(email) {
    userEmailSpan.textContent = email;
    emailModal.classList.add('active');
    startTimer();
    otpInputs[0].focus();
}

// Close modal
closeModal.addEventListener('click', () => {
    emailModal.classList.remove('active');
    resetModal();
});

// Close modal when clicking outside
emailModal.addEventListener('click', (e) => {
    if (e.target === emailModal) {
        emailModal.classList.remove('active');
        resetModal();
    }
});

// OTP input handling
otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        // Only allow numbers
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        
        if (e.target.value.length === 1 && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
        
        // Auto-submit when all fields are filled
        if (index === otpInputs.length - 1 && e.target.value.length === 1) {
            const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
            if (allFilled) {
                setTimeout(() => confirmOTP(), 500);
            }
        }
    });
    
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
    
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
        
        for (let i = 0; i < Math.min(pastedData.length, otpInputs.length - index); i++) {
            if (otpInputs[index + i]) {
                otpInputs[index + i].value = pastedData[i];
            }
        }
        
        // Focus on the next empty input or the last one
        const nextIndex = Math.min(index + pastedData.length, otpInputs.length - 1);
        otpInputs[nextIndex].focus();
    });
});

// Timer function
function startTimer() {
    clearInterval(timerInterval);
    countdown = 300;
    
    timerInterval = setInterval(() => {
        const minutes = Math.floor(countdown / 60);
        const seconds = countdown % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (countdown <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = '0:00';
            timerElement.style.color = '#EF4444';
        }
        countdown--;
    }, 1000);
}

// Reset modal
function resetModal() {
    otpInputs.forEach(input => input.value = '');
    clearInterval(timerInterval);
    countdown = 300;
    timerElement.style.color = '#8B0000';
    timerElement.textContent = '5:00';
}

// Confirm OTP function
function confirmOTP() {
    const otp = Array.from(otpInputs).map(input => input.value).join('');
    if (otp.length === 4) {
        // Simulate OTP verification
        confirmBtn.textContent = 'Verifying...';
        confirmBtn.disabled = true;
        
        setTimeout(() => {
            alert('Account verified successfully! Welcome to Diabetech.');
            emailModal.classList.remove('active');
            resetModal();
            confirmBtn.textContent = 'Confirm';
            confirmBtn.disabled = false;
            
            // Redirect or perform next action
            window.location.href = 'dashboard.html'; // or wherever you want to redirect
        }, 2000);
    } else {
        alert('Please enter the complete OTP code.');
        otpInputs[0].focus();
    }
}

// Confirm OTP
confirmBtn.addEventListener('click', confirmOTP);

// Resend OTP
resendBtn.addEventListener('click', () => {
    resendBtn.textContent = 'Sending...';
    resendBtn.disabled = true;
    
    setTimeout(() => {
        resetModal();
        startTimer();
        resendBtn.textContent = 'Resend';
        resendBtn.disabled = false;
        alert('OTP resent successfully!');
        otpInputs[0].focus();
    }, 2000);
});

// Export function for use in other files
window.showEmailModal = showEmailModal;