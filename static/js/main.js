// Language translations
const translations = {
    en: {
        'Sinkium': 'Sinkium',
        'Sinkium Network': 'Sinkium Network',
        'Global Testing Network': 'Global Testing Network',
        'Navigation': 'Navigation',
        'New Request': 'New Request',
        'Health Testing': 'Health Testing',
        'Performance Testing': 'Performance Testing',
        'Stress Testing': 'Stress Testing',
        'About': 'About',
        'Profile': 'Profile',
        'What can I check for you?': 'What can I check for you?',
        'Enter URL or service to test...': 'Enter URL or service to test...',
        'Health Check': 'Health Check',
        'Monitor service availability and response times': 'Monitor service availability and response times',
        'Performance Test': 'Performance Test',
        'Analyze load times and optimization opportunities': 'Analyze load times and optimization opportunities',
        'Stress Test': 'Stress Test',
        'Test system limits under high load conditions': 'Test system limits under high load conditions',
        'Active Tests': 'Active Tests',
        'Uptime': 'Uptime',
        'Monitoring': 'Monitoring',
        'All rights reserved.': 'All rights reserved.',
        'Built with innovation': 'Built with innovation'
    },
    ka: {
        'Sinkium': 'სინკიუმი',
        'Sinkium Network': 'სინკიუმის ქსელი',
        'Global Testing Network': 'გლობალური ტესტირების ქსელი',
        'Navigation': 'ნავიგაცია',
        'New Request': 'ახალი მოთხოვნა',
        'Health Testing': 'ჯანმრთელობის ტესტი',
        'Performance Testing': 'შესრულების ტესტი',
        'Stress Testing': 'სტრესის ტესტი',
        'About': 'შესახებ',
        'Profile': 'პროფილი',
        'What can I check for you?': 'რას შემიძლია შემოწმდეს ოთხი?',
        'Enter URL or service to test...': 'შეიყვანეთ URL ან სერვისი ტესტისთვის...',
        'Health Check': 'ჯანმრთელობის შემოწმება',
        'Monitor service availability and response times': 'მონიტორინგი სერვისის ხელმისაწვდომობისა და რეაგირების დროის',
        'Performance Test': 'შესრულების ტესტი',
        'Analyze load times and optimization opportunities': 'გაანალიზეთ ჩატვირთვის დრო და ოპტიმიზაციის შესაძლებლობები',
        'Stress Test': 'სტრესის ტესტი',
        'Test system limits under high load conditions': 'სისტემის ლიმიტების ტესტირება მაღალი დატვირთვის პირობებში',
        'Active Tests': 'აქტიური ტესტები',
        'Uptime': 'აქტივობის დრო',
        'Monitoring': 'მონიტორინგი',
        'All rights reserved.': 'ყველა უფლება დაცულია.',
        'Built with innovation': 'შექმნილია ინოვაციით'
    }
};

// DOM Elements
const menuIcon = document.getElementById('menuIcon');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const langButtons = document.querySelectorAll('.lang-btn');
const animatedBg = document.getElementById('animatedBg');

// Current language
let currentLanguage = 'en';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeAnimations();
    initializeEventListeners();
    createFloatingDots();
    animateCounters();
    setLanguage(currentLanguage);
});

// Initialize event listeners
function initializeEventListeners() {
    // Menu toggle
    menuIcon.addEventListener('click', toggleSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);

    // Language switcher
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            switchLanguage(lang);
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // Action cards hover effects
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });

        card.addEventListener('click', () => {
            // Add click animation
            card.style.transform = 'translateY(-5px) scale(0.98)';
            setTimeout(() => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });

    // Scroll effects
    window.addEventListener('scroll', handleScroll);
}

// Sidebar functions
function toggleSidebar() {
    menuIcon.classList.toggle('active');
    sidebar.classList.toggle('active');
    sidebarOverlay.classList.toggle('active');
    document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
}

function closeSidebar() {
    menuIcon.classList.remove('active');
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Language switching
function switchLanguage(lang) {
    currentLanguage = lang;

    // Update active button
    langButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });

    setLanguage(lang);
}

function setLanguage(lang) {
    // Update elements with data attributes
    const elements = document.querySelectorAll('[data-en], [data-ka]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            element.textContent = text;
        }
    });

    // Update placeholder text
    const searchInput = document.querySelector('.search-input');
    const placeholder = searchInput.getAttribute(`data-${lang}-placeholder`);
    if (placeholder) {
        searchInput.placeholder = placeholder;
    }
}

// Search functionality
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const query = searchInput.value.trim();

    if (query) {
        // Add search animation
        const searchBtn = document.querySelector('.search-btn');
        searchBtn.style.transform = 'translateY(-50%) scale(0.9)';

        setTimeout(() => {
            searchBtn.style.transform = 'translateY(-50%) scale(1)';
            // Here you would typically send the search query to your backend
            console.log('Searching for:', query);
            showSearchAnimation();
        }, 150);
    }
}

function showSearchAnimation() {
    // Create ripple effect
    const searchContainer = document.querySelector('.search-container');
    const ripple = document.createElement('div');
    ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 107, 53, 0.3);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
        left: 50%;
        top: 50%;
        width: 100px;
        height: 100px;
        margin-left: -50px;
        margin-top: -50px;
    `;

    searchContainer.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Floating dots animation
function createFloatingDots() {
    const dotsCount = 50;

    for (let i = 0; i < dotsCount; i++) {
        createFloatingDot();
    }

    // Create new dots periodically
    setInterval(createFloatingDot, 200);
}

function createFloatingDot() {
    const dot = document.createElement('div');
    dot.className = 'floating-dot';

    // Random horizontal position
    dot.style.left = Math.random() * 100 + '%';

    // Random animation delay
    dot.style.animationDelay = Math.random() * 2 + 's';

    // Random size variation
    const size = Math.random() * 3 + 2;
    dot.style.width = size + 'px';
    dot.style.height = size + 'px';

    animatedBg.appendChild(dot);

    // Remove dot after animation completes
    setTimeout(() => {
        if (dot.parentNode) {
            dot.remove();
        }
    }, 12000);
}

// Counter animation
function animateCounters() {
    const counters = [
        {element: document.querySelector('.stat-number'), target: 1245},
        {element: document.querySelectorAll('.stat-number')[1], target: 99.9, suffix: '%'},
        {element: document.querySelectorAll('.stat-number')[2], target: 24, suffix: '/7'}
    ];

    counters.forEach((counter, index) => {
        if (counter.element) {
            animateNumber(counter.element, 0, counter.target, 2000, counter.suffix || '');
        }
    });
}

function animateNumber(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }

        if (suffix === '%') {
            element.textContent = current.toFixed(1) + suffix;
        } else if (suffix === '/7') {
            element.textContent = Math.floor(current) + suffix;
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 16);
}

// Scroll effects
function handleScroll() {
    const scrollY = window.scrollY;
    const header = document.querySelector('.header');

    // Header background opacity based on scroll
    const opacity = Math.min(scrollY / 100, 1);
    header.style.background = `rgba(26, 26, 46, ${0.95 + opacity * 0.05})`;

    // Parallax effect for floating dots
    const dots = document.querySelectorAll('.floating-dot');
    dots.forEach(dot => {
        const speed = Math.random() * 0.5 + 0.2;
        dot.style.transform = `translateY(${scrollY * speed}px)`;
    });
}

// Initialize animations
function initializeAnimations() {
    // Add CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
                opacity: 0.8;
            }
        }
        
        .pulse {
            animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes slideInFromLeft {
            from {
                transform: translateX(-100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .slide-in-left {
            animation: slideInFromLeft 0.5s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// Utility functions
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Enhanced interactions
function addInteractiveEffects() {
    // Logo pulse effect
    const logo = document.querySelector('.logo');
    logo.classList.add('pulse');

    // Smooth scroll for navigation links
    // const navLinks = document.querySelectorAll('.nav-link');
    // navLinks.forEach(link => {
    //     link.addEventListener('click', (e) => {
    //         e.preventDefault();
    //
    //         // Add click effect
    //         link.style.transform = 'translateX(10px) scale(0.95)';
    //         setTimeout(() => {
    //             link.style.transform = 'translateX(5px) scale(1)';
    //         }, 150);
    //
    //         // Close sidebar on mobile
    //         if (window.innerWidth <= 768) {
    //             setTimeout(closeSidebar, 300);
    //         }
    //     });
    // });
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            link.style.transform = 'translateX(5px) scale(1.02)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translateX(0) scale(1)';
        });
    });
}

// Initialize enhanced effects when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(addInteractiveEffects, 1000);
});

// Responsive behavior
window.addEventListener('resize', debounce(() => {
    // Close sidebar on resize to desktop
    if (window.innerWidth > 768) {
        closeSidebar();
    }
}, 250));

// Performance optimization
function optimizePerformance() {
    // Throttle scroll events
    window.removeEventListener('scroll', handleScroll);
    window.addEventListener('scroll', throttle(handleScroll, 16));

    // Lazy load non-critical animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    });

    // Observe action cards for animation
    document.querySelectorAll('.action-card').forEach(card => {
        observer.observe(card);
    });
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);