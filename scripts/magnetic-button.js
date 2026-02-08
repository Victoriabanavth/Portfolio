/**
 * Magnetic Button Effect
 * Buttons that subtly move toward the cursor when hovered,
 * creating a "magnetic" attraction effect
 */

class MagneticButton {
    constructor(element) {
        this.element = element;
        this.boundingBox = null;
        this.strength = 0.3; // How strongly the button follows the cursor
        this.maxDistance = 10; // Maximum displacement in pixels

        this.init();
    }

    init() {
        this.element.addEventListener('mouseenter', () => this.onEnter());
        this.element.addEventListener('mousemove', (e) => this.onMove(e));
        this.element.addEventListener('mouseleave', () => this.onLeave());
    }

    onEnter() {
        this.boundingBox = this.element.getBoundingClientRect();
    }

    onMove(e) {
        if (!this.boundingBox) return;

        // Calculate center of button
        const centerX = this.boundingBox.left + this.boundingBox.width / 2;
        const centerY = this.boundingBox.top + this.boundingBox.height / 2;

        // Calculate distance from cursor to center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Apply magnetic effect with limits
        const moveX = Math.min(Math.max(deltaX * this.strength, -this.maxDistance), this.maxDistance);
        const moveY = Math.min(Math.max(deltaY * this.strength, -this.maxDistance), this.maxDistance);

        this.element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }

    onLeave() {
        this.element.style.transform = 'translate(0, 0)';
        this.boundingBox = null;
    }
}

// Initialize all magnetic buttons
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const magneticButtons = document.querySelectorAll('.btn-magnetic');
    magneticButtons.forEach(btn => new MagneticButton(btn));
});
