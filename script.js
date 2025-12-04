// PROCALYX API endpoint
const API_ENDPOINT = 'https://api.procalyx.com/api/v1/notify-me';

// Social media configuration
let socialConfig = {
    enabled: false,
    links: {}
};

// Load social media configuration
async function loadSocialConfig() {
    try {
        const response = await fetch('./config.json');
        if (response.ok) {
            const config = await response.json();
            socialConfig = config.socialMedia || socialConfig;
        } else {
            console.warn('Failed to load config.json, social media links disabled');
        }
    } catch (error) {
        console.error('Error loading social media config:', error);
    }
}

// Initialize social media links
function initializeSocialLinks() {
    const socialIcons = document.querySelectorAll('.social-icon[data-social]');
    
    socialIcons.forEach(icon => {
        const socialType = icon.getAttribute('data-social');
        const url = socialConfig.links[socialType];
        
        if (url) {
            icon.href = url;
        }
        
        // Add click handler
        icon.addEventListener('click', function(e) {
            if (!socialConfig.enabled) {
                e.preventDefault();
                return false;
            }
            
            // If URL is not set, prevent navigation
            if (!url) {
                e.preventDefault();
                console.warn(`No URL configured for ${socialType}`);
                return false;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async function() {
    // Load social media configuration
    await loadSocialConfig();
    
    // Initialize social media links
    initializeSocialLinks();
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
                // Handle specific API error responses
                if (result.error) {
                    const errorType = result.error.type || result.error.code;
                    const errorMessage = result.error.message || result.message || 'Submission failed';
                    
                    // Handle duplicate email error (409 Conflict)
                    if (errorType === 'DUPLICATE_EMAIL' || response.status === 409) {
                        showMessage('This email is already subscribed. We\'ll notify you when we launch!', 'error');
                        emailInput.value = '';
                    } else {
                        // Handle other specific errors
                        showMessage(errorMessage, 'error');
                    }
                } else {
                    // Generic error message
                    showMessage(result.message || 'Submission failed. Please try again.', 'error');
                }
                return; // Don't proceed to catch block for API errors
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            // Only fallback to localStorage for network/connection errors
            // Not for business logic errors (like duplicate emails)
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                // Network error - fallback to localStorage
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
                    showMessage('Network error. Please check your connection and try again.', 'error');
                }
            } else {
                // Other errors (parsing, etc.)
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

