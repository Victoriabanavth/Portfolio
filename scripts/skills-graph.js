/**
 * Skills Constellation Graph
 * Interactive force-directed graph visualization of skills
 * Users can drag nodes to explore skill relationships
 */

class SkillsGraph {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight || 600;

        // Color palette
        this.colors = {
            core: '#00D4FF',      // Electric Blue
            primary: '#00FF88',   // Signal Green
            secondary: '#8B5CF6', // Plasma Purple
            tertiary: '#64748B',  // Graphite
            link: 'rgba(0, 212, 255, 0.15)',
            linkActive: 'rgba(0, 255, 136, 0.4)'
        };

        // Skills data
        this.skillsData = {
            nodes: [
                // Core node
                { id: 'core', label: 'Data Engineering', group: 'core', size: 24 },

                // Primary skills
                { id: 'python', label: 'Python', group: 'primary', size: 18 },
                { id: 'sql', label: 'SQL', group: 'primary', size: 18 },
                { id: 'powerbi', label: 'Power BI', group: 'primary', size: 16 },

                // Secondary - Python ecosystem
                { id: 'pandas', label: 'pandas', group: 'secondary', size: 12 },
                { id: 'numpy', label: 'NumPy', group: 'secondary', size: 10 },
                { id: 'matplotlib', label: 'Matplotlib', group: 'secondary', size: 10 },

                // Secondary - Databases
                { id: 'snowflake', label: 'Snowflake', group: 'secondary', size: 14 },
                { id: 'postgres', label: 'PostgreSQL', group: 'secondary', size: 12 },
                { id: 'mysql', label: 'MySQL', group: 'secondary', size: 10 },

                // Secondary - Cloud
                { id: 'aws', label: 'AWS', group: 'secondary', size: 14 },
                { id: 'athena', label: 'Athena', group: 'tertiary', size: 10 },
                { id: 's3', label: 'S3', group: 'tertiary', size: 10 },
                { id: 'redshift', label: 'Redshift', group: 'tertiary', size: 10 },
                { id: 'lambda', label: 'Lambda', group: 'tertiary', size: 9 },

                // Secondary - Visualization
                { id: 'tableau', label: 'Tableau', group: 'secondary', size: 14 },
                { id: 'dax', label: 'DAX', group: 'tertiary', size: 10 },
                { id: 'excel', label: 'Excel', group: 'tertiary', size: 10 },

                // ETL
                { id: 'ssis', label: 'SSIS', group: 'secondary', size: 12 },
                { id: 'airflow', label: 'Airflow', group: 'tertiary', size: 10 },
                { id: 'glue', label: 'AWS Glue', group: 'tertiary', size: 10 }
            ],
            links: [
                // Core connections
                { source: 'core', target: 'python', strength: 1 },
                { source: 'core', target: 'sql', strength: 1 },
                { source: 'core', target: 'powerbi', strength: 0.8 },

                // Python ecosystem
                { source: 'python', target: 'pandas', strength: 0.9 },
                { source: 'python', target: 'numpy', strength: 0.7 },
                { source: 'python', target: 'matplotlib', strength: 0.6 },
                { source: 'pandas', target: 'numpy', strength: 0.8 },

                // Databases
                { source: 'sql', target: 'snowflake', strength: 0.9 },
                { source: 'sql', target: 'postgres', strength: 0.8 },
                { source: 'sql', target: 'mysql', strength: 0.7 },
                { source: 'snowflake', target: 'aws', strength: 0.6 },

                // Cloud
                { source: 'aws', target: 'athena', strength: 0.7 },
                { source: 'aws', target: 's3', strength: 0.8 },
                { source: 'aws', target: 'redshift', strength: 0.7 },
                { source: 'aws', target: 'lambda', strength: 0.6 },
                { source: 'aws', target: 'glue', strength: 0.6 },
                { source: 'athena', target: 'sql', strength: 0.5 },
                { source: 'redshift', target: 'sql', strength: 0.5 },

                // Visualization
                { source: 'powerbi', target: 'dax', strength: 0.9 },
                { source: 'powerbi', target: 'tableau', strength: 0.5 },
                { source: 'tableau', target: 'sql', strength: 0.6 },
                { source: 'powerbi', target: 'excel', strength: 0.6 },

                // ETL
                { source: 'core', target: 'ssis', strength: 0.7 },
                { source: 'ssis', target: 'sql', strength: 0.8 },
                { source: 'core', target: 'airflow', strength: 0.6 },
                { source: 'airflow', target: 'python', strength: 0.7 },
                { source: 'glue', target: 'python', strength: 0.5 }
            ]
        };

        this.init();
    }

    init() {
        this.createSVG();
        this.processData();
        this.setupSimulation();
        this.render();
        this.setupResize();
    }

    createSVG() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.container.appendChild(this.svg);

        // Create groups for links and nodes
        this.linksGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(this.linksGroup);
        this.svg.appendChild(this.nodesGroup);
    }

    processData() {
        // Create maps for quick lookup
        this.nodeMap = new Map(this.skillsData.nodes.map(n => [n.id, n]));

        // Position nodes by group with specific angular separation
        const groupPositions = {
            'core': { angle: 0, radius: 0 },
            'python': { angle: Math.PI * 0.5, radius: 140 },      // Top
            'sql': { angle: Math.PI * 1.5, radius: 140 },          // Bottom
            'powerbi': { angle: Math.PI, radius: 140 },            // Left
        };

        // Secondary nodes positioned around their primaries
        const secondaryGroups = {
            'pandas': 'python', 'numpy': 'python', 'matplotlib': 'python',
            'snowflake': 'sql', 'postgres': 'sql', 'mysql': 'sql',
            'tableau': 'powerbi', 'dax': 'powerbi', 'excel': 'powerbi',
            'aws': 'sql', 'ssis': 'sql'
        };

        const tertiaryGroups = {
            'athena': 'aws', 's3': 'aws', 'redshift': 'aws', 'lambda': 'aws', 'glue': 'aws',
            'airflow': 'python'
        };

        let secondaryIndex = {};
        let tertiaryIndex = {};

        this.skillsData.nodes.forEach((node, index) => {
            if (node.id === 'core') {
                node.x = this.width / 2;
                node.y = this.height / 2;
            } else if (groupPositions[node.id]) {
                // Primary nodes at fixed angles
                const pos = groupPositions[node.id];
                node.x = this.width / 2 + Math.cos(pos.angle) * pos.radius;
                node.y = this.height / 2 + Math.sin(pos.angle) * pos.radius;
            } else if (secondaryGroups[node.id]) {
                // Secondary nodes spread around their primary
                const primary = secondaryGroups[node.id];
                const primaryPos = groupPositions[primary];
                if (!secondaryIndex[primary]) secondaryIndex[primary] = 0;
                const offset = (secondaryIndex[primary]++ - 1) * 0.6;
                const angle = primaryPos.angle + offset;
                const radius = primaryPos.radius + 100;
                node.x = this.width / 2 + Math.cos(angle) * radius;
                node.y = this.height / 2 + Math.sin(angle) * radius;
            } else if (tertiaryGroups[node.id]) {
                // Tertiary nodes spread further out
                const parent = tertiaryGroups[node.id];
                const parentNode = this.nodeMap.get(parent);
                if (!tertiaryIndex[parent]) tertiaryIndex[parent] = 0;
                const offset = (tertiaryIndex[parent]++ - 2) * 0.5;
                const baseAngle = Math.atan2(parentNode?.y || 0 - this.height / 2, parentNode?.x || 0 - this.width / 2);
                const angle = baseAngle + offset;
                node.x = this.width / 2 + Math.cos(angle) * 280;
                node.y = this.height / 2 + Math.sin(angle) * 250;
            } else {
                // Fallback random positioning
                const angle = (index / this.skillsData.nodes.length) * Math.PI * 2;
                node.x = this.width / 2 + Math.cos(angle) * 200;
                node.y = this.height / 2 + Math.sin(angle) * 200;
            }
            node.vx = 0;
            node.vy = 0;
        });
    }

    setupSimulation() {
        this.simulation = {
            centerX: this.width / 2,
            centerY: this.height / 2,
            linkDistance: 200,        // Much longer links
            linkStrength: 0.08,       // Very weak links to allow spreading
            chargeStrength: -1500,    // Very strong repulsion
            centerStrength: 0.015,    // Minimal center pull
            friction: 0.8             // More friction for stability
        };
    }

    render() {
        this.renderLinks();
        this.renderNodes();
        this.startSimulation();
    }

    renderLinks() {
        this.skillsData.links.forEach(link => {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'skill-link');
            line.setAttribute('stroke', this.colors.link);
            line.setAttribute('stroke-width', link.strength * 2);
            line.dataset.source = link.source;
            line.dataset.target = link.target;
            this.linksGroup.appendChild(line);
            link.element = line;
        });
    }

    renderNodes() {
        this.skillsData.nodes.forEach(node => {
            const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            group.setAttribute('class', 'skill-node');
            group.style.cursor = 'grab';

            // Circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('r', node.size);
            circle.setAttribute('fill', this.getNodeColor(node.group));
            circle.setAttribute('opacity', node.group === 'core' ? '1' : '0.8');

            // Glow filter
            if (node.group === 'core') {
                circle.style.filter = 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.6))';
            }

            // Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('dy', node.size + 14);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#E2E8F0');
            text.setAttribute('font-size', node.group === 'core' ? '13px' : '11px');
            text.setAttribute('font-family', "'Space Grotesk', monospace");
            text.textContent = node.label;

            group.appendChild(circle);
            group.appendChild(text);
            this.nodesGroup.appendChild(group);

            node.element = group;
            node.circleElement = circle;

            // Drag handling
            this.setupDrag(node, group);
        });
    }

    getNodeColor(group) {
        const colorMap = {
            core: this.colors.core,
            primary: this.colors.primary,
            secondary: this.colors.secondary,
            tertiary: this.colors.tertiary
        };
        return colorMap[group] || this.colors.tertiary;
    }

    setupDrag(node, element) {
        let isDragging = false;
        let offsetX, offsetY;

        const onStart = (e) => {
            isDragging = true;
            element.style.cursor = 'grabbing';

            const point = this.getEventPoint(e);
            offsetX = point.x - node.x;
            offsetY = point.y - node.y;

            node.fx = node.x;
            node.fy = node.y;

            // Highlight connected links
            this.highlightConnections(node.id, true);

            e.preventDefault();
        };

        const onMove = (e) => {
            if (!isDragging) return;

            const point = this.getEventPoint(e);
            node.fx = point.x - offsetX;
            node.fy = point.y - offsetY;
            node.x = node.fx;
            node.y = node.fy;

            this.updatePositions();
            e.preventDefault();
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            element.style.cursor = 'grab';

            node.fx = null;
            node.fy = null;

            this.highlightConnections(node.id, false);
        };

        element.addEventListener('mousedown', onStart);
        element.addEventListener('touchstart', onStart);

        window.addEventListener('mousemove', onMove);
        window.addEventListener('touchmove', onMove);

        window.addEventListener('mouseup', onEnd);
        window.addEventListener('touchend', onEnd);
    }

    getEventPoint(e) {
        const rect = this.svg.getBoundingClientRect();
        const scaleX = this.width / rect.width;
        const scaleY = this.height / rect.height;

        if (e.touches && e.touches.length) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            };
        }

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    highlightConnections(nodeId, highlight) {
        this.skillsData.links.forEach(link => {
            if (link.source === nodeId || link.target === nodeId) {
                link.element.setAttribute('stroke', highlight ? this.colors.linkActive : this.colors.link);
                link.element.setAttribute('stroke-width', highlight ? link.strength * 3 : link.strength * 2);
            }
        });
    }

    startSimulation() {
        const tick = () => {
            this.applyForces();
            this.updatePositions();
            requestAnimationFrame(tick);
        };
        tick();
    }

    applyForces() {
        const nodes = this.skillsData.nodes;
        const links = this.skillsData.links;

        // Reset velocities (with damping)
        nodes.forEach(node => {
            if (node.fx !== null) return;

            // Center force
            const dx = this.simulation.centerX - node.x;
            const dy = this.simulation.centerY - node.y;
            node.vx += dx * this.simulation.centerStrength * 0.01;
            node.vy += dy * this.simulation.centerStrength * 0.01;
        });

        // Link forces
        links.forEach(link => {
            const source = this.nodeMap.get(link.source);
            const target = this.nodeMap.get(link.target);

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = (distance - this.simulation.linkDistance) * this.simulation.linkStrength * link.strength;

            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;

            if (source.fx === null) {
                source.vx += fx;
                source.vy += fy;
            }
            if (target.fx === null) {
                target.vx -= fx;
                target.vy -= fy;
            }
        });

        // Collision detection - enforce minimum distance based on node sizes
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const nodeA = nodes[i];
                const nodeB = nodes[j];

                const dx = nodeB.x - nodeA.x;
                const dy = nodeB.y - nodeA.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;

                // Minimum distance = sum of radii + padding for labels
                const minDistance = nodeA.size + nodeB.size + 80;

                // If overlapping, push apart
                if (distance < minDistance) {
                    const overlap = minDistance - distance;
                    const pushForce = overlap * 0.5; // Strong push when overlapping

                    const fx = (dx / distance) * pushForce;
                    const fy = (dy / distance) * pushForce;

                    if (nodeA.fx === null) {
                        nodeA.x -= fx;
                        nodeA.y -= fy;
                    }
                    if (nodeB.fx === null) {
                        nodeB.x += fx;
                        nodeB.y += fy;
                    }
                }

                // Standard repulsion (for spreading)
                const repulsionForce = this.simulation.chargeStrength / (distance * distance);
                const rfx = (dx / distance) * repulsionForce;
                const rfy = (dy / distance) * repulsionForce;

                if (nodeA.fx === null) {
                    nodeA.vx += rfx;
                    nodeA.vy += rfy;
                }
                if (nodeB.fx === null) {
                    nodeB.vx -= rfx;
                    nodeB.vy -= rfy;
                }
            }
        }

        // Apply velocities with friction
        nodes.forEach(node => {
            if (node.fx !== null) return;

            node.vx *= this.simulation.friction;
            node.vy *= this.simulation.friction;

            node.x += node.vx;
            node.y += node.vy;

            // Boundary constraints with more padding
            const padding = 60;
            node.x = Math.max(padding, Math.min(this.width - padding, node.x));
            node.y = Math.max(padding, Math.min(this.height - padding, node.y));
        });
    }

    updatePositions() {
        // Update nodes
        this.skillsData.nodes.forEach(node => {
            node.element.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        });

        // Update links
        this.skillsData.links.forEach(link => {
            const source = this.nodeMap.get(link.source);
            const target = this.nodeMap.get(link.target);

            link.element.setAttribute('x1', source.x);
            link.element.setAttribute('y1', source.y);
            link.element.setAttribute('x2', target.x);
            link.element.setAttribute('y2', target.y);
        });
    }

    setupResize() {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this.width = entry.contentRect.width;
                this.height = entry.contentRect.height || 600;
                this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
                this.simulation.centerX = this.width / 2;
                this.simulation.centerY = this.height / 2;
            }
        });

        resizeObserver.observe(this.container);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Still render but disable physics
        return;
    }

    // Use Intersection Observer to initialize only when visible
    const container = document.getElementById('skills-graph');
    if (!container) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                new SkillsGraph('skills-graph');
                observer.disconnect();
            }
        });
    }, { threshold: 0.1 });

    observer.observe(container);
});
