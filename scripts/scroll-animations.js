/**
 * Scroll Animations
 * Handles intersection observer based animations and metric counter animations
 */

class ScrollAnimations {
    constructor() {
        this.observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2
        };

        this.init();
    }

    init() {
        this.setupFadeInObserver();
        this.setupMetricCounters();
    }

    setupFadeInObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    // Unobserve after animation triggers
                    observer.unobserve(entry.target);
                }
            });
        }, this.observerOptions);

        // Observe all fade-in elements
        const fadeElements = document.querySelectorAll('.fade-in-up, .stagger-children');
        fadeElements.forEach(el => observer.observe(el));
    }

    setupMetricCounters() {
        const metricCards = document.querySelectorAll('.metric-card');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const card = entry.target;
                    const target = parseInt(card.dataset.target, 10);
                    const prefix = card.dataset.prefix || '';
                    const suffix = card.dataset.suffix || '';
                    const numberEl = card.querySelector('.metric-number');

                    this.animateCounter(numberEl, target, prefix, suffix);
                    card.classList.add('in-view');
                    observer.unobserve(card);
                }
            });
        }, { ...this.observerOptions, threshold: 0.5 });

        metricCards.forEach(card => observer.observe(card));
    }

    animateCounter(element, target, prefix, suffix) {
        const duration = 2000;
        const steps = 60;
        const stepDuration = duration / steps;
        let current = 0;
        let step = 0;

        const easeOutExpo = (t) => {
            return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        };

        const update = () => {
            step++;
            const progress = step / steps;
            const easedProgress = easeOutExpo(progress);
            current = Math.round(easedProgress * target);

            element.textContent = prefix + current + suffix;

            if (step < steps) {
                setTimeout(update, stepDuration);
            } else {
                element.textContent = prefix + target + suffix;
            }
        };

        update();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ScrollAnimations();
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
