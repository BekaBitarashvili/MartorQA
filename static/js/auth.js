// Authentication Pages JavaScript

// Toggle Password Visibility
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
    input.setAttribute('type', type);
}

// Password Strength Checker
function checkPasswordStrength(password) {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
}

// Update Password Strength Indicator
function updatePasswordStrength(password) {
    const strengthContainer = document.getElementById('passwordStrength');
    if (!strengthContainer) return;

    const strength = checkPasswordStrength(password);

    strengthContainer.className = 'password-strength';

    if (strength <= 2) {
        strengthContainer.classList.add('weak');
    } else if (strength <= 4) {
        strengthContainer.classList.add('medium');
    } else {
        strengthContainer.classList.add('strong');
    }
}

// Initialize Authentication Pages
document.addEventListener('DOMContentLoaded', () => {
    // Create animated background particles
    createAuthParticles();

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);

        // Password strength checker
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                updatePasswordStrength(e.target.value);
            });
        }

        // Password match checker
        const confirmPasswordInput = document.getElementById('confirmPassword');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', checkPasswordMatch);
        }
    }

    // Add input focus animations
    addInputAnimations();

    // Language switcher
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
});

// Handle Login Submission
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Add loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Signing in...</span>';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual authentication)
    setTimeout(() => {
        console.log('Login attempt:', { email, password, rememberMe });

        // Show success animation
        submitBtn.innerHTML = '<span>✓ Success!</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        // Redirect after success
        setTimeout(() => {
            window.location.href = '/stress-test';
        }, 1000);
    }, 1500);
}

// Handle Register Submission
async function handleRegister(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (!agreeTerms) {
        showError('Please agree to the terms and conditions');
        return;
    }

    const strength = checkPasswordStrength(password);
    if (strength < 3) {
        showError('Please choose a stronger password');
        return;
    }

    // Add loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Creating account...</span>';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual registration)
    setTimeout(() => {
        console.log('Registration attempt:', { username, email, password });

        // Show success animation
        submitBtn.innerHTML = '<span>✓ Account Created!</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';

        // Redirect after success
        setTimeout(() => {
            window.location.href = '/login';
        }, 1500);
    }, 1500);
}

// Check Password Match
function checkPasswordMatch() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');

    if (confirmPassword.length > 0) {
        if (password === confirmPassword) {
            confirmInput.style.borderColor = '#10b981';
        } else {
            confirmInput.style.borderColor = '#ef4444';
        }
    }
}

// Show Error Message
function showError(message) {
    // Create error notification
    const error = document.createElement('div');
    error.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(239, 68, 68, 0.4);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        font-size: 14px;
        font-weight: 500;
    `;
    error.textContent = message;

    document.body.appendChild(error);

    // Remove after 3 seconds
    setTimeout(() => {
        error.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => error.remove(), 300);
    }, 3000);
}

// Add Input Animations
function addInputAnimations() {
    const inputs = document.querySelectorAll('.input-wrapper input');

    inputs.forEach((input, index) => {
        // Add load animation delay
        input.style.animationDelay = `${index * 0.1}s`;

        // Add focus effect to icon
        input.addEventListener('focus', function() {
            const icon = this.parentElement.querySelector('.input-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1)';
                icon.style.color = '#ff6b35';
            }
        });

        input.addEventListener('blur', function() {
            const icon = this.parentElement.querySelector('.input-icon');
            if (icon) {
                icon.style.transform = 'scale(1)';
                icon.style.color = 'rgba(255, 255, 255, 0.4)';
            }
        });

        // Add typing effect
        input.addEventListener('input', function() {
            this.style.transform = 'scale(1.01)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// Create Animated Background Particles
function createAuthParticles() {
    const authBg = document.getElementById('authBg');
    if (!authBg) return;

    const particlesCount = 50;

    for (let i = 0; i < particlesCount; i++) {
        createParticle(authBg);
    }

    // Create new particles periodically
    setInterval(() => {
        if (Math.random() > 0.5) {
            createParticle(authBg);
        }
    }, 2000);
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + 20;
    const endY = -50;
    const duration = Math.random() * 10 + 8;
    const delay = Math.random() * 2;
    const opacity = Math.random() * 0.5 + 0.2;

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle, rgba(255, 107, 53, ${opacity}), rgba(247, 147, 30, ${opacity * 0.5}));
        border-radius: 50%;
        left: ${startX}px;
        top: ${startY}px;
        pointer-events: none;
        box-shadow: 0 0 ${size * 3}px rgba(255, 107, 53, ${opacity});
    `;

    container.appendChild(particle);

    // Animate particle
    const startTime = Date.now();

    function animate() {
        const elapsed = (Date.now() - startTime) / 1000;
        const progress = Math.min(elapsed / duration, 1);

        if (progress < 1) {
            const currentY = startY + (endY - startY) * progress;
            const currentX = startX + Math.sin(progress * Math.PI * 4) * 30;
            const currentOpacity = opacity * (1 - progress);

            particle.style.top = currentY + 'px';
            particle.style.left = currentX + 'px';
            particle.style.opacity = currentOpacity;

            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    }

    setTimeout(() => {
        requestAnimationFrame(animate);
    }, delay * 1000);
}

// Add CSS animations dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);