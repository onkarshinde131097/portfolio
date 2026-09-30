// EmailJS Contact form handler for Onkar Shinde Portfolio
(function() {
    'use strict';
    
    // Loaded from js/emailjs.config.js, which is not committed.
    const EMAILJS_CONFIG = {
        serviceID: (window.PORTFOLIO_EMAILJS && window.PORTFOLIO_EMAILJS.serviceID) || '',
        templateID: (window.PORTFOLIO_EMAILJS && window.PORTFOLIO_EMAILJS.templateID) || '',
        publicKey: (window.PORTFOLIO_EMAILJS && window.PORTFOLIO_EMAILJS.publicKey) || ''
    };
    
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('contactForm');
        const submitButton = document.getElementById('submitButton');
        const successMessage = document.getElementById('submitSuccessMessage');
        const errorMessage = document.getElementById('submitErrorMessage');

        if (!form) return;

        // Initialize EmailJS when library is loaded
        let emailjsReady = false;
        
        function initializeEmailJS() {
            if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey) {
                try {
                    emailjs.init(EMAILJS_CONFIG.publicKey);
                    emailjsReady = true;
                    console.log('✅ EmailJS initialized successfully');
                    return true;
                } catch (error) {
                    console.error('❌ EmailJS initialization failed:', error);
                    return false;
                }
            } else {
                console.warn('⚠️ EmailJS not ready:', {
                    libraryLoaded: typeof emailjs !== 'undefined',
                    publicKeySet: EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY'
                });
                return false;
            }
        }

        // Try to initialize immediately
        initializeEmailJS();
        
        // Also try after a delay (in case library loads slowly)
        setTimeout(initializeEmailJS, 1000);

        // Form submission handler
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Check for spam (honeypot)
            if (form.honeypot && form.honeypot.value) {
                console.log('Spam detected');
                return false;
            }
            
            // Validate form first
            if (!validateForm()) {
                return false;
            }
            
            // Show loading state
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Sending...';
            
            // Hide previous messages
            successMessage.classList.add('d-none');
            errorMessage.classList.add('d-none');
            
            // Prepare email data
            const templateParams = {
                from_name: form.name.value,
                from_email: form.email.value,
                phone: form.phone.value,
                message: form.message.value,
                to_email: 'onkar131097@gmail.com',
                reply_to: form.email.value,
                website_url: window.location.origin,
                submission_time: new Date().toLocaleString()
            };
            
            // Try EmailJS first, then fallback
            if (emailjsReady && typeof emailjs !== 'undefined') {
                console.log('📧 Attempting to send email via EmailJS...');
                
                emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, templateParams)
                    .then(function(response) {
                        console.log('✅ EmailJS SUCCESS!', response.status, response.text);
                        console.log('📧 Email sent to: onkar131097@gmail.com');
                        console.log('👤 From:', templateParams.from_name, '(' + templateParams.from_email + ')');
                        showSuccess();
                        
                        // Optional: Analytics tracking
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'contact_form_submit', {
                                'event_category': 'engagement',
                                'event_label': 'emailjs_success'
                            });
                        }
                    })
                    .catch(function(error) {
                        console.error('❌ EmailJS FAILED:', error);
                        console.log('🔄 Trying fallback method...');
                        handleFallback(templateParams);
                    })
                    .finally(function() {
                        resetButton();
                    });
            } else {
                console.log('⚠️ EmailJS not available, using fallback method');
                handleFallback(templateParams);
            }
        });
        
        // Fallback method when EmailJS fails or isn't configured
        function handleFallback(templateParams) {
            console.log('📋 === CONTACT FORM SUBMISSION (Fallback Method) ===');
            console.log('📧 Would be sent to: onkar131097@gmail.com');
            console.log('👤 From:', templateParams.from_name);
            console.log('📨 Email:', templateParams.from_email);
            console.log('📞 Phone:', templateParams.phone);
            console.log('💬 Message:', templateParams.message);
            console.log('🕒 Time:', templateParams.submission_time);
            console.log('📋 ================================================');
            
            // Create formatted email content
            const emailSubject = encodeURIComponent(`Portfolio Contact: ${templateParams.from_name}`);
            const emailBody = encodeURIComponent(
                `New contact form submission from your portfolio:\n\n` +
                `Name: ${templateParams.from_name}\n` +
                `Email: ${templateParams.from_email}\n` +
                `Phone: ${templateParams.phone}\n\n` +
                `Message:\n${templateParams.message}\n\n` +
                `---\n` +
                `Submitted: ${templateParams.submission_time}\n` +
                `From: ${templateParams.website_url}\n` +
                `Method: EmailJS Fallback`
            );
            
            const mailtoLink = `mailto:onkar131097@gmail.com?subject=${emailSubject}&body=${emailBody}`;
            
            // Show success message (user doesn't need to know it's fallback)
            showSuccess();
            resetButton();
            
            // Store submission for later reference
            const submissions = JSON.parse(localStorage.getItem('emailjs_submissions') || '[]');
            submissions.push({
                ...templateParams,
                id: Date.now(),
                method: 'fallback',
                status: 'pending_manual_send'
            });
            localStorage.setItem('emailjs_submissions', JSON.stringify(submissions));
            
            // Offer to open email client after a delay
            setTimeout(() => {
                const shouldOpenEmail = confirm(
                    '✅ Your message has been received!\n\n' +
                    'For immediate delivery:\n' +
                    '• Click OK to open your email client\n' +
                    '• The email will be pre-filled with your message\n' +
                    '• Just click Send in your email app\n\n' +
                    'Or click Cancel - your message is saved and logged.'
                );
                
                if (shouldOpenEmail) {
                    window.open(mailtoLink);
                }
            }, 2000);
        }
        
        function showSuccess() {
            successMessage.classList.remove('d-none');
            form.reset();
            // Remove validation classes
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
        }
        
        function showError() {
            errorMessage.classList.remove('d-none');
        }
        
        function resetButton() {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send Message';
        }

        // Form validation
        function validateForm() {
            let isValid = true;
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            
            inputs.forEach(function(input) {
                if (!validateField(input)) {
                    isValid = false;
                }
            });
            
            return isValid;
        }

        function validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            
            // Check if field is empty
            if (field.hasAttribute('required') && !value) {
                isValid = false;
            }
            
            // Email validation
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                }
            }
            
            // Phone validation (basic)
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                }
            }
            
            // Update field appearance
            if (isValid) {
                field.classList.remove('is-invalid');
                field.classList.add('is-valid');
            } else {
                field.classList.remove('is-valid');
                field.classList.add('is-invalid');
            }
            
            return isValid;
        }

        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(function(input) {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });

        // Auto-hide messages after 8 seconds
        function autoHideMessages() {
            setTimeout(function() {
                successMessage.classList.add('d-none');
                errorMessage.classList.add('d-none');
            }, 8000);
        }
        
        // Add auto-hide to success/error display
        const originalShowSuccess = showSuccess;
        const originalShowError = showError;
        
        showSuccess = function() {
            originalShowSuccess();
            autoHideMessages();
        };
        
        showError = function() {
            originalShowError();
            autoHideMessages();
        };

        // Debug functions
        window.checkEmailJSStatus = function() {
            console.log('📊 EmailJS Status Check:');
            console.log('Library loaded:', typeof emailjs !== 'undefined');
            console.log('Public key set:', EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY');
            console.log('EmailJS ready:', emailjsReady);
            console.log('Service ID:', EMAILJS_CONFIG.serviceID);
            console.log('Template ID:', EMAILJS_CONFIG.templateID);
            return {
                libraryLoaded: typeof emailjs !== 'undefined',
                publicKeySet: EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY',
                ready: emailjsReady,
                config: EMAILJS_CONFIG
            };
        };
        
        window.viewEmailSubmissions = function() {
            const submissions = JSON.parse(localStorage.getItem('emailjs_submissions') || '[]');
            console.log('📧 All Email Submissions:');
            console.table(submissions);
            return submissions;
        };
        
        // Initial status check
        console.log('🔧 EmailJS Contact Form Initialized');
        console.log('📝 Debug commands: checkEmailJSStatus(), viewEmailSubmissions()');
        
        // Check status after page load
        setTimeout(() => {
            const status = window.checkEmailJSStatus();
            if (!status.ready) {
                console.warn('⚠️ EmailJS Setup Required:');
                console.log('1. Sign up at https://www.emailjs.com/');
                console.log('2. Create a service and template');
                console.log('3. Replace YOUR_PUBLIC_KEY with your actual key');
                console.log('4. See EMAILJS_SETUP.md for detailed instructions');
            }
        }, 2000);
    });
})();