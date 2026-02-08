/**
 * Main Application Entry Point
 * Initializes all components and handles global functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Victoria Banavath Portfolio Initialized');

    // Add loaded class for any initial animations
    document.body.classList.add('loaded');

    // Log performance metrics
    if (window.performance) {
        const timing = performance.timing;
        window.addEventListener('load', () => {
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`⚡ Page loaded in ${loadTime}ms`);
        });
    }
});

// Preload critical resources
const preloadResources = () => {
    const links = [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
    ];

    links.forEach(link => {
        const el = document.createElement('link');
        Object.assign(el, link);
        document.head.appendChild(el);
    });
};

// Handle visibility changes (pause animations when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        document.body.classList.add('paused');
    } else {
        document.body.classList.remove('paused');
    }
});

// Error handling
window.addEventListener('error', (e) => {
    console.error('Portfolio Error:', e.message);
});
