/**
 * Interactive Particle Network Background
 * 
 * FEATURES:
 * - Glowing nodes connected by dynamic lines
 * - Mouse interaction (attraction/repulsion)
 * - Gentle drift animation
 * - Distance-based line opacity
 * - High performance canvas rendering
 * 
 * EASY CONFIGURATION: All parameters below
 */

console.log('===== WAVES.JS LOADED =====');

class ParticleNetwork {
    constructor() {
        console.log('ParticleNetwork constructor called');
        
        // ===== DEBUG MODE - Set to true to see nodes in bright magenta =====
        this.DEBUG = false;
        
        // ===== CONFIGURATION - TUNE THESE VALUES =====
        this.config = {
            NODE_COUNT: 80,              // Number of particles (60-120 recommended)
            MAX_DIST: 150,               // Max distance for line connections (pixels)
            NODE_SPEED: 0.3,             // Base drift speed (0.1-0.5)
            NODE_SIZE: 3,                // Particle radius (pixels) - INCREASED for visibility
            MOUSE_RADIUS: 200,           // Mouse influence radius (pixels)
            MOUSE_STRENGTH: 0.15,        // Attraction strength (0-1, negative for repulsion)
            LINE_WIDTH: 1,               // Connection line thickness
            
            // Colors
            COLORS: {
                background: '#020208',   // Deep navy/black background
                node: '#09BAF2',         // Cyan node core matching font
                nodeGlow: 'rgba(9, 186, 242, 0.2)', // Cyan bloom/glow - 50% opacity
                line: 'rgba(9, 186, 242, 0.3)',      // Line base color
                star: 'rgba(255, 255, 255, 0.4)'     // Optional stars
            }
        };
        
        this.canvas = null;
        this.ctx = null;
        this.nodes = [];
        this.stars = [];
        this.mouse = { x: null, y: null };
        this.animationFrame = null;
        this.dpr = window.devicePixelRatio || 1; // Handle high DPI displays
        
        this.init();
    }
    
    init() {
        console.log('ParticleNetwork initializing...');
        this.createCanvas();
        this.createNodes();
        this.createStars();
        console.log(`Created ${this.nodes.length} nodes`);
        console.log(`Canvas size: ${this.canvas.width}x${this.canvas.height}`);
        this.setupEventListeners();
        this.animate();
    }
    
    createCanvas() {
        const container = document.getElementById('wave-background');
        console.log('Container found:', container);
        container.innerHTML = ''; // Clear existing content
        
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        
        container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        
        this.resize();
        console.log('Canvas created, dimensions:', this.canvas.width, 'x', this.canvas.height);
        console.log('Device pixel ratio:', this.dpr);
    }
    
    createNodes() {
        this.nodes = [];
        
        // Use actual canvas dimensions for node placement
        const count = this.config.NODE_COUNT;
        
        for (let i = 0; i < count; i++) {
            this.nodes.push({
                x: Math.random() * (this.canvas.width / this.dpr),
                y: Math.random() * (this.canvas.height / this.dpr),
                baseX: 0, // Store original position for subtle drift
                baseY: 0,
                vx: (Math.random() - 0.5) * this.config.NODE_SPEED,
                vy: (Math.random() - 0.5) * this.config.NODE_SPEED,
                radius: this.config.NODE_SIZE
            });
        }
        
        // Set base positions
        this.nodes.forEach(node => {
            node.baseX = node.x;
            node.baseY = node.y;
        });
    }
    
    createStars() {
        this.stars = [];
        const starCount = 50; // Optional background stars
        
        for (let i = 0; i < starCount; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 0.8 + 0.2,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    setupEventListeners() {
        // Track mouse position relative to canvas
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        
        // Reset mouse when leaving window
        window.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
        
        // Handle window resize
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        
        // CRITICAL FIX: Handle devicePixelRatio for high DPI displays
        // This ensures canvas internal resolution matches display resolution
        this.canvas.width = rect.width * this.dpr;
        this.canvas.height = rect.height * this.dpr;
        
        // Scale context to match device pixel ratio
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        
        // Recreate nodes if empty or on first load
        if (this.nodes.length === 0) {
            this.createNodes();
            this.createStars();
        }
    }
    
    // Optimized squared distance calculation (avoid Math.sqrt when possible)
    getDistanceSquared(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return dx * dx + dy * dy;
    }
    
    updateNodes() {
        const mouseRadiusSquared = this.config.MOUSE_RADIUS * this.config.MOUSE_RADIUS;
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        
        this.nodes.forEach(node => {
            // Gentle autonomous drift
            node.baseX += node.vx;
            node.baseY += node.vy;
            
            // Wrap around edges for seamless movement
            if (node.baseX < 0) node.baseX = width;
            if (node.baseX > width) node.baseX = 0;
            if (node.baseY < 0) node.baseY = height;
            if (node.baseY > height) node.baseY = 0;
            
            // Reset to base position
            node.x = node.baseX;
            node.y = node.baseY;
            
            // Mouse interaction (attraction/repulsion)
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const distSquared = this.getDistanceSquared(node.x, node.y, this.mouse.x, this.mouse.y);
                
                if (distSquared < mouseRadiusSquared) {
                    const dist = Math.sqrt(distSquared);
                    const force = (1 - dist / this.config.MOUSE_RADIUS) * this.config.MOUSE_STRENGTH;
                    
                    // Calculate direction from node to mouse
                    const angle = Math.atan2(this.mouse.y - node.y, this.mouse.x - node.x);
                    
                    // Apply attraction (use negative MOUSE_STRENGTH for repulsion)
                    node.x += Math.cos(angle) * force * 30;
                    node.y += Math.sin(angle) * force * 30;
                }
            }
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = this.config.COLORS.star;
        
        this.stars.forEach(star => {
            this.ctx.globalAlpha = star.opacity;
            this.ctx.beginPath();
            this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        this.ctx.globalAlpha = 1;
    }
    
    drawConnections() {
        const maxDistSquared = this.config.MAX_DIST * this.config.MAX_DIST;
        
        // Draw lines between nearby nodes
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const distSquared = this.getDistanceSquared(
                    this.nodes[i].x, this.nodes[i].y,
                    this.nodes[j].x, this.nodes[j].y
                );
                
                // Only connect if within threshold
                if (distSquared < maxDistSquared) {
                    const dist = Math.sqrt(distSquared);
                    // Fade opacity based on distance (closer = brighter)
                    const opacity = 1 - (dist / this.config.MAX_DIST);
                    
                    this.ctx.strokeStyle = `rgba(9, 186, 242, ${opacity * 0.3})`;
                    this.ctx.lineWidth = this.config.LINE_WIDTH;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                    this.ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    /**
     * CRITICAL FIX: Draw nodes with proper visibility
     * 
     * REASONS NODES WERE INVISIBLE:
     * 1. Node size was too small (2px) - now 3px
     * 2. Node color was same cyan as background - now WHITE for max contrast
     * 3. Glow opacity was too low - increased from 0.6 to 0.8
     * 4. devicePixelRatio wasn't handled - now properly scaled
     * 5. globalAlpha might have been affected by line drawing - now explicitly reset
     * 
     * FIXES APPLIED:
     * - Draw nodes AFTER lines (so they're on top)
     * - Reset globalAlpha to 1 before drawing
     * - Use high-contrast white core with cyan glow
     * - Larger glow radius for "constellation" effect
     * - DEBUG mode to confirm rendering
     */
    drawNodes() {
        // CRITICAL: Reset alpha to ensure nodes are fully opaque
        this.ctx.globalAlpha = 1;
        
        this.nodes.forEach(node => {
            if (this.DEBUG) {
                // DEBUG MODE: Bright magenta nodes for visibility testing
                
                // Large debug circle
                this.ctx.strokeStyle = '#FF00FF';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Bright magenta core
                this.ctx.fillStyle = '#FF00FF';
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
                
            } else {
                // PRODUCTION MODE: Beautiful glowing constellation nodes
                
                // Reduce overall opacity by 50%
                this.ctx.globalAlpha = 0.5;
                
                // Draw outer glow (larger bloom effect for visibility)
                const glowRadius = node.radius * 3; // Reduced glow
                const gradient = this.ctx.createRadialGradient(
                    node.x, node.y, 0,
                    node.x, node.y, glowRadius
                );
                gradient.addColorStop(0, this.config.COLORS.nodeGlow);
                gradient.addColorStop(0.4, 'rgba(9, 186, 242, 0.1)');
                gradient.addColorStop(1, 'rgba(9, 186, 242, 0)');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Draw bright core (solid white for maximum contrast)
                this.ctx.fillStyle = this.config.COLORS.node;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
                this.ctx.fill();
                
                // Add subtle inner glow
                this.ctx.fillStyle = 'rgba(9, 186, 242, 0.2)';
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, node.radius * 0.7, 0, Math.PI * 2);
                this.ctx.fill();
            }
        });
        
        // Reset globalAlpha to 1 after drawing
        this.ctx.globalAlpha = 1;
    }
    
    
    animate() {
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;
        
        // Clear canvas with opaque background fill
        this.ctx.fillStyle = this.config.COLORS.background;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw layers in correct order (nodes LAST so they're on top)
        this.drawStars();
        this.updateNodes();
        this.drawConnections(); // Lines drawn first
        this.drawNodes();        // Nodes drawn LAST (on top)
        
        // DEBUG: Display node count
        if (this.DEBUG) {
            this.ctx.fillStyle = '#FF00FF';
            this.ctx.font = '16px monospace';
            this.ctx.fillText(`NODES: ${this.nodes.length}`, 10, 20);
            this.ctx.fillText(`CANVAS: ${Math.round(width)}x${Math.round(height)}`, 10, 40);
            this.ctx.fillText(`DPR: ${this.dpr}`, 10, 60);
        }
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
    }
}

// Initialize when DOM is loaded
console.log('Script execution reached initialization code');
console.log('Document readyState:', document.readyState);

if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded fired! Creating ParticleNetwork...');
        const particleNetwork = new ParticleNetwork();
        console.log('ParticleNetwork created:', particleNetwork);
    });
} else {
    console.log('DOM already loaded, creating ParticleNetwork immediately...');
    const particleNetwork = new ParticleNetwork();
    console.log('ParticleNetwork created:', particleNetwork);
}
