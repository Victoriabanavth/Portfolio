/**
 * Decoding Text Animation
 * Creates a "Matrix-style" text reveal effect where random characters
 * resolve into the final text character by character
 */

class DecodingText {
    constructor(element) {
        this.element = element;
        this.finalText = element.dataset.text || element.textContent;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';
        this.duration = 2000; // Total animation duration
        this.fps = 30;
        this.frameInterval = 1000 / this.fps;
        this.isAnimating = false;
        this.hasAnimated = false;

        this.init();
    }

    init() {
        // Set up intersection observer to trigger on scroll into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.hasAnimated) {
                    this.hasAnimated = true;
                    this.animate();
                }
            });
        }, { threshold: 0.5 });

        observer.observe(this.element);

        // Optionally trigger immediately if already in view
        if (this.isInViewport()) {
            this.hasAnimated = true;
            this.animate();
        }
    }

    isInViewport() {
        const rect = this.element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    animate() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const textLength = this.finalText.length;
        const revealDelay = this.duration / textLength;
        let revealedCount = 0;
        let lastFrameTime = 0;

        // Initialize with scrambled text
        this.element.textContent = this.getScrambledText(0);

        const step = (timestamp) => {
            if (!lastFrameTime) lastFrameTime = timestamp;
            const elapsed = timestamp - lastFrameTime;

            if (elapsed >= this.frameInterval) {
                lastFrameTime = timestamp;

                // Calculate how many characters should be revealed
                const progress = Math.min(revealedCount * revealDelay + elapsed, this.duration);
                revealedCount = Math.floor(progress / revealDelay);

                // Update the text
                this.element.textContent = this.getScrambledText(revealedCount);

                // Increment revealed count over time
                if (revealedCount < textLength) {
                    revealedCount++;
                }
            }

            if (revealedCount < textLength) {
                requestAnimationFrame(step);
            } else {
                // Final state - ensure exact text
                this.element.textContent = this.finalText;
                this.isAnimating = false;
            }
        };

        requestAnimationFrame(step);
    }

    getScrambledText(revealedCount) {
        let result = '';

        for (let i = 0; i < this.finalText.length; i++) {
            if (this.finalText[i] === ' ') {
                result += ' ';
            } else if (i < revealedCount) {
                result += this.finalText[i];
            } else {
                result += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
        }

        return result;
    }
}

// Initialize all decoding text elements
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const elements = document.querySelectorAll('.decode-text');
    elements.forEach(el => new DecodingText(el));
});
