/**
 * WebGL Particle Network
 * Creates an interactive particle system that responds to mouse movement
 * Particles connect when close together, creating a data network visualization
 */

class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.mouse = { x: null, y: null, radius: 150 };
    
    // Configuration
    this.config = {
      particleCount: 100,
      particleColor: '#00D4FF',
      lineColor: 'rgba(0, 212, 255, 0.12)',
      particleMinSize: 1,
      particleMaxSize: 2.5,
      connectionDistance: 120,
      speed: 0.3,
      mouseAttraction: 0.02,
      mouseRepulsion: 0.08
    };
    
    this.init();
    this.animate();
    this.setupEventListeners();
  }
  
  init() {
    this.resize();
    this.createParticles();
  }
  
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    this.particles = [];
    const count = Math.min(this.config.particleCount, Math.floor((this.canvas.width * this.canvas.height) / 15000));
    
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * this.config.speed,
        vy: (Math.random() - 0.5) * this.config.speed,
        size: Math.random() * (this.config.particleMaxSize - this.config.particleMinSize) + this.config.particleMinSize,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  
  setupEventListeners() {
    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
    });
    
    this.canvas.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    
    // Touch support
    this.canvas.addEventListener('touchmove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.touches[0].clientX - rect.left;
      this.mouse.y = e.touches[0].clientY - rect.top;
    });
    
    this.canvas.addEventListener('touchend', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.updateParticles();
    this.drawConnections();
    this.drawParticles();
    
    requestAnimationFrame(() => this.animate());
  }
  
  updateParticles() {
    for (const particle of this.particles) {
      // Mouse interaction
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          
          if (distance < 50) {
            // Repel when too close
            particle.vx -= (dx / distance) * force * this.config.mouseRepulsion;
            particle.vy -= (dy / distance) * force * this.config.mouseRepulsion;
          } else {
            // Attract at medium distance
            particle.vx += (dx / distance) * force * this.config.mouseAttraction;
            particle.vy += (dy / distance) * force * this.config.mouseAttraction;
          }
        }
      }
      
      // Apply velocity
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      
      // Boundary wrapping
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
      
      // Random drift
      particle.vx += (Math.random() - 0.5) * 0.01;
      particle.vy += (Math.random() - 0.5) * 0.01;
      
      // Speed limit
      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > this.config.speed * 2) {
        particle.vx = (particle.vx / speed) * this.config.speed * 2;
        particle.vy = (particle.vy / speed) * this.config.speed * 2;
      }
    }
  }
  
  drawConnections() {
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.config.connectionDistance) {
          const opacity = (1 - distance / this.config.connectionDistance) * 0.3;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
    
    // Connect to mouse
    if (this.mouse.x !== null && this.mouse.y !== null) {
      for (const particle of this.particles) {
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
          const opacity = (1 - distance / this.mouse.radius) * 0.4;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 255, 136, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.stroke();
        }
      }
    }
  }
  
  drawParticles() {
    for (const particle of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity})`;
      this.ctx.fill();
      
      // Glow effect
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(0, 212, 255, ${particle.opacity * 0.1})`;
      this.ctx.fill();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check for reduced motion preference
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    new ParticleNetwork('particle-canvas');
  }
});
