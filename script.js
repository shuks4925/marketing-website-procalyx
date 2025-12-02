// PROCALYX API endpoint
const API_ENDPOINT = 'https://api.procalyx.com/api/v1/notify-me';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    const emailInput = document.getElementById('emailInput');
    const notifyBtn = form.querySelector('.notify-btn');

    // Remove any existing message
    function removeMessage() {
        const existingMessage = form.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Show message
    function showMessage(text, type) {
        removeMessage();
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        form.appendChild(message);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            message.remove();
        }, 5000);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Disable button during submission
        notifyBtn.disabled = true;
        notifyBtn.textContent = 'Submitting...';

        try {
            // Prepare data
            const formData = {
                email: email
            };

            // Submit to PROCALYX API
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                showMessage('Thank you! We\'ll notify you soon.', 'success');
                emailInput.value = '';
                
                // Log to console for debugging
                console.log('Email recorded:', {
                    email: email
                });
            } else {
                throw new Error(result.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Fallback: Store in localStorage if API fails
            try {
                const submissions = JSON.parse(localStorage.getItem('procalyx_submissions') || '[]');
                submissions.push({
                    email: email
                });
                localStorage.setItem('procalyx_submissions', JSON.stringify(submissions));
                
                showMessage('Thank you! We\'ll notify you soon.', 'success');
                emailInput.value = '';
                console.log('Email saved locally:', { email });
            } catch (localError) {
                showMessage('Something went wrong. Please try again later.', 'error');
            }
        } finally {
            // Re-enable button
            notifyBtn.disabled = false;
            notifyBtn.textContent = 'Notify Me';
        }
    });

    // Alternative implementation using a simple public API
    // Uncomment below and comment above if you prefer a different approach
    
    /*
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const timestamp = new Date().toISOString();
        
        if (!email) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        notifyBtn.disabled = true;
        notifyBtn.textContent = 'Submitting...';

        try {
            // Using httpbin.org as a public API for testing
            // In production, replace with your actual API endpoint
            const response = await fetch('https://httpbin.org/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    timestamp: timestamp,
                    source: 'procalyx-coming-soon'
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                showMessage('Thank you! We\'ll notify you soon.', 'success');
                emailInput.value = '';
                console.log('Email recorded:', { email, timestamp });
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Something went wrong. Please try again later.', 'error');
        } finally {
            notifyBtn.disabled = false;
            notifyBtn.textContent = 'Notify Me';
        }
    });
    */
});

