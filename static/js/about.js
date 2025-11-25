document.addEventListener('DOMContentLoaded', function() {
    initializeAboutAnimations();
    initializeCounters();
});

function initializeAboutAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .tech-item, .stat-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });
}

function initializeCounters() {
    const counters = document.querySelectorAll('.stat-number[data-count]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        observer.observe(counter);
    });
}

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }

        if (target === 99.9) {
            element.textContent = current.toFixed(1) + '%';
        } else if (target === 24) {
            element.textContent = Math.floor(current) + '/7';
        } else {
            element.textContent = Math.floor(current).toLocaleString();
        }
    }, 20);
}