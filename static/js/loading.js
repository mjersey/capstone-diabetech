document.addEventListener('DOMContentLoaded', function() {
    const progressBar = document.getElementById('progressBar');
    const loadingText = document.getElementById('loadingText');
    
    const loadingMessages = [
        'Signing you in...',
        'Verifying credentials...',
        'Loading your dashboard...',
        'Almost there!'
    ];
    
    let currentProgress = 0;
    let messageIndex = 0;
    
    // Progress animation
    function updateProgress() {
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15 + 5; // Random increment between 5-20
            
            if (currentProgress >= 100) {
                currentProgress = 100;
                progressBar.style.width = currentProgress + '%';
                
                // Show final message
                setTimeout(() => {
                    loadingText.textContent = 'Welcome back!';
                    
                    // Redirect after completion
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Change to your dashboard URL
                    }, 1000);
                }, 500);
                
                clearInterval(interval);
                return;
            }
            
            progressBar.style.width = currentProgress + '%';
            
            // Update loading message based on progress
            if (currentProgress > 25 && messageIndex === 0) {
                messageIndex = 1;
                loadingText.textContent = loadingMessages[messageIndex];
            } else if (currentProgress > 50 && messageIndex === 1) {
                messageIndex = 2;
                loadingText.textContent = loadingMessages[messageIndex];
            } else if (currentProgress > 75 && messageIndex === 2) {
                messageIndex = 3;
                loadingText.textContent = loadingMessages[messageIndex];
            }
            
        }, 200 + Math.random() * 300); // Random interval between 200-500ms
    }
    
    // Start loading animation
    setTimeout(updateProgress, 500);
});

// Function to be called from sign-in page
function startLoading() {
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = 'loading.html';
    }, 300);
}

// Export for use in other files
window.startLoading = startLoading;