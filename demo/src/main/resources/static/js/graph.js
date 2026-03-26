// ============================================
// graph.js - Complete Graph Visualizer Class
// ============================================

class GraphVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        // Graph data
        this.nodes = [];
        this.edges = [];
        this.nodeRadius = 25;
        this.draggingNode = null;
        this.dragOffset = { x: 0, y: 0 };

        // Algorithm state
        this.currentAlgorithm = null;
        this.isRunning = false;
        this.isPaused = false;
        this.animationSpeed = 1;
        this.visitedNodes = new Set();
        this.currentPath = [];
        this.algorithmSteps = [];
        this.currentStep = 0;

        // MST specific properties
        this.mstEdges = [];
        this.mstSteps = [];

        // Settings
        this.weighted = false;
        this.directed = false;
        this.mode = null; // 'addNode', 'addEdge', 'delete'
        this.selectedNode = null;
        this.hoveredNode = null;

        // Colors
        this.colors = {
            node: '#2d2d44',
            nodeHover: '#3d3d54',
            nodeSelected: '#6c5ce7',
            nodeVisited: '#00cec9',
            nodePath: '#ff6b6b',
            edge: '#4a4a6a',
            edgeHover: '#6c5ce7',
            edgeWeight: '#b8b8d4',
            text: '#ffffff'
        };

        // Bind event handlers
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.init();
    }

    init() {
        this.resize();
        this.canvas.addEventListener('mousedown', this.handleMouseDown);
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseup', this.handleMouseUp);
        this.canvas.addEventListener('click', this.handleClick);
        window.addEventListener('resize', this.handleResize);
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.draw();
    }

    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.edges.forEach(edge => this.drawEdge(edge));
        this.nodes.forEach(node => this.drawNode(node));
    }

    drawNode(node) {
        const ctx = this.ctx;
        const isVisited = this.visitedNodes.has(node.id);
        const isInPath = this.currentPath.includes(node.id);

        let color = this.colors.node;
        if (isInPath) color = this.colors.nodePath;
        else if (isVisited) color = this.colors.nodeVisited;
        else if (node === this.selectedNode) color = this.colors.nodeSelected;
        else if (node === this.hoveredNode) color = this.colors.nodeHover;

        ctx.beginPath();
        ctx.arc(node.x, node.y, this.nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = this.colors.text;
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.label, node.x, node.y);
    }

    drawEdge(edge) {
        const ctx = this.ctx;
        const source = this.nodes.find(n => n.id === edge.source);
        const target = this.nodes.find(n => n.id === edge.target);

        if (!source || !target) return;

        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);

        const startX = source.x + Math.cos(angle) * this.nodeRadius;
        const startY = source.y + Math.sin(angle) * this.nodeRadius;
        const endX = target.x - Math.cos(angle) * this.nodeRadius;
        const endY = target.y - Math.sin(angle) * this.nodeRadius;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = edge.isHighlighted ? this.colors.edgeHover : this.colors.edge;
        ctx.lineWidth = edge.isHighlighted ? 3 : 2;
        ctx.stroke();

        if (this.directed) {
            this.drawArrowhead(target.x, target.y, angle);
        }

        if (this.weighted && edge.weight !== undefined) {
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            ctx.fillStyle = this.colors.edgeWeight;
            ctx.font = 'bold 12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(edge.weight.toString(), midX, midY - 15);
        }
    }

    drawArrowhead(x, y, angle) {
        const ctx = this.ctx;
        const size = 10;
        ctx.save();
        ctx.translate(x - Math.cos(angle) * this.nodeRadius, y - Math.sin(angle) * this.nodeRadius);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-size, -size/2);
        ctx.lineTo(-size, size/2);
        ctx.closePath();
        ctx.fillStyle = this.colors.edge;
        ctx.fill();
        ctx.restore();
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.draggingNode = this.findNodeAt(x, y);
        if (this.draggingNode) {
            this.dragOffset.x = x - this.draggingNode.x;
            this.dragOffset.y = y - this.draggingNode.y;
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.hoveredNode = this.findNodeAt(x, y);

        if (this.draggingNode) {
            this.draggingNode.x = x - this.dragOffset.x;
            this.draggingNode.y = y - this.dragOffset.y;
            this.draggingNode.x = Math.max(this.nodeRadius, Math.min(this.canvas.width - this.nodeRadius, this.draggingNode.x));
            this.draggingNode.y = Math.max(this.nodeRadius, Math.min(this.canvas.height - this.nodeRadius, this.draggingNode.y));
        }
    }

    handleMouseUp() {
        this.draggingNode = null;
    }

    handleClick(e) {
        if (this.mode === 'addNode') {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (!this.findNodeAt(x, y)) {
                this.addNode(x, y);
            }
        }
    }

    handleResize() {
        this.resize();
    }

    // ============================================
    // HELPER METHODS
    // ============================================
    findNodeAt(x, y) {
        return this.nodes.find(node => {
            const dx = x - node.x;
            const dy = y - node.y;
            return Math.sqrt(dx*dx + dy*dy) <= this.nodeRadius;
        });
    }

    // ============================================
    // GRAPH MANIPULATION
    // ============================================
    addNode(x, y) {
        const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const label = (this.nodes.length + 1).toString();

        this.nodes.push({
            id,
            label,
            x,
            y
        });
    }

    addEdge(sourceId, targetId, weight = 1) {
        const exists = this.edges.some(edge =>
            (edge.source === sourceId && edge.target === targetId) ||
            (!this.directed && edge.source === targetId && edge.target === sourceId)
        );

        if (!exists && sourceId !== targetId) {
            this.edges.push({
                source: sourceId,
                target: targetId,
                weight: this.weighted ? weight : 1,
                id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                isHighlighted: false
            });
        }
    }

    deleteNode(nodeId) {
        this.nodes = this.nodes.filter(n => n.id !== nodeId);
        this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    }

    deleteEdge(edgeId) {
        this.edges = this.edges.filter(e => e.id !== edgeId);
    }

    clearGraph() {
        this.nodes = [];
        this.edges = [];
        this.visitedNodes.clear();
        this.currentPath = [];
        this.mstEdges = [];
    }

    // ============================================
    // ALGORITHM IMPLEMENTATIONS
    // ============================================

    // BFS Algorithm
    async runBFS(startNodeId) {
        const startNode = this.nodes.find(n => n.id === startNodeId);
        if (!startNode) return;

        this.resetAlgorithm();
        this.currentAlgorithm = 'BFS';

        const queue = [startNodeId];
        this.visitedNodes.add(startNodeId);
        this.algorithmSteps = [];
        this.isRunning=true;



        while (queue.length > 0 && this.isRunning) {
            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }

            const currentId = queue.shift();
            const neighbors = this.getNeighbors(currentId);

            for (const neighborId of neighbors) {
                if (!this.visitedNodes.has(neighborId)) {
                    this.visitedNodes.add(neighborId);
                    queue.push(neighborId);

                    this.algorithmSteps.push({
                        visited: Array.from(this.visitedNodes),
                        current: neighborId,
                        queue: [...queue]
                    });

                    await this.sleep(500 / this.animationSpeed);
                }
            }
        }
    }

    // DFS Algorithm
    async runDFS(startNodeId) {
        const startNode = this.nodes.find(n => n.id === startNodeId);
        if (!startNode) return;

        this.resetAlgorithm();
        this.currentAlgorithm = 'DFS';

        const stack = [startNodeId];
        this.isRunning=true;

        while (stack.length > 0 && this.isRunning) {
            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }

            const currentId = stack.pop();

            if (!this.visitedNodes.has(currentId)) {
                this.visitedNodes.add(currentId);

                const neighbors = this.getNeighbors(currentId);

                for (let i = neighbors.length - 1; i >= 0; i--) {
                    if (!this.visitedNodes.has(neighbors[i])) {
                        stack.push(neighbors[i]);
                    }
                }

                this.algorithmSteps.push({
                    visited: Array.from(this.visitedNodes),
                    current: currentId,
                    stack: [...stack]
                });

                await this.sleep(500 / this.animationSpeed);
            }
        }
    }

    // Dijkstra's Algorithm
    async runDijkstra(startNodeId, endNodeId) {
        this.resetAlgorithm();
        this.currentAlgorithm = 'Dijkstra';

        const distances = {};
        const previous = {};
        const unvisited = new Set();

        this.nodes.forEach(node => {
            distances[node.id] = Infinity;
            previous[node.id] = null;
            unvisited.add(node.id);
        });
        distances[startNodeId] = 0;
        this.isRunning=true;

        while (unvisited.size > 0 && this.isRunning) {
            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }

            let currentId = null;
            let minDistance = Infinity;
            unvisited.forEach(id => {
                if (distances[id] < minDistance) {
                    minDistance = distances[id];
                    currentId = id;
                }
            });

            if (currentId === null || minDistance === Infinity) break;

            unvisited.delete(currentId);
            this.visitedNodes.add(currentId);

            if (currentId === endNodeId) {
                this.reconstructPath(previous, endNodeId);
                break;
            }

            const neighbors = this.getNeighbors(currentId);
            for (const neighborId of neighbors) {
                if (unvisited.has(neighborId)) {
                    const edge = this.getEdge(currentId, neighborId);
                    const newDistance = distances[currentId] + (edge ? edge.weight : 1);

                    if (newDistance < distances[neighborId]) {
                        distances[neighborId] = newDistance;
                        previous[neighborId] = currentId;
                    }
                }
            }

            this.algorithmSteps.push({
                visited: Array.from(this.visitedNodes),
                current: currentId,
                distances: { ...distances }
            });

            await this.sleep(500 / this.animationSpeed);
        }
    }

    // PRIM'S ALGORITHM - Minimum Spanning Tree
    async runPrimsMST() {
        if (this.nodes.length === 0) {
            showNotification('Please create a graph first', 'error');
            return;
        }

        this.resetAlgorithm();
        this.currentAlgorithm = "Prim's MST";

        const visited = new Set();
        this.mstEdges = [];
        const pq = [];


        const startNodeId = this.nodes[0].id;
        visited.add(startNodeId);

        this.addEdgesToPQ(startNodeId, pq, visited);
        this.recordMSTStep(visited, this.mstEdges, `Starting from node: ${startNodeId}`);

        let totalWeight = 0;
        this.isRunning = true;

        while (pq.length > 0 && visited.size < this.nodes.length && this.isRunning) {
            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }

            pq.sort((a, b) => a.weight - b.weight);
            const minEdge = pq.shift();

            if (visited.has(minEdge.source) && visited.has(minEdge.target)) {
                continue;
            }

            const newNode = visited.has(minEdge.source) ? minEdge.target : minEdge.source;

            visited.add(newNode);
            this.mstEdges.push(minEdge);
            totalWeight += minEdge.weight;

            const edgeToHighlight = this.edges.find(e => e.id === minEdge.id);
            if (edgeToHighlight) {
                edgeToHighlight.isHighlighted = true;
            }

            this.recordMSTStep(visited, this.mstEdges,
                `Added edge ${minEdge.source}-${minEdge.target} weight: ${minEdge.weight}`);

            this.addEdgesToPQ(newNode, pq, visited);

            document.getElementById('pathCost').textContent = totalWeight;

            await this.sleep(500 / this.animationSpeed);
        }

        if (visited.size === this.nodes.length) {
            showNotification(`MST Complete! Total Weight: ${totalWeight}`, 'success');
        } else {
            showNotification('Graph is not connected - cannot form MST', 'error');
        }
    }


    // KRUSKAL'S ALGORITHM - Minimum Spanning Tree
    async runKruskalMST() {
        if (this.nodes.length === 0) {
            showNotification('Please create a graph first', 'error');
            return;
        }

        this.resetAlgorithm();
        this.currentAlgorithm = "Kruskal's MST";

        const sortedEdges = [...this.edges].sort((a, b) => a.weight - b.weight);

        const parent = {};
        const rank = {};

        this.nodes.forEach(node => {
            parent[node.id] = node.id;
            rank[node.id] = 0;
        });

        const find = (nodeId) => {
            if (parent[nodeId] !== nodeId) {
                parent[nodeId] = find(parent[nodeId]);
            }
            return parent[nodeId];
        };

        const union = (node1, node2) => {
            const root1 = find(node1);
            const root2 = find(node2);

            if (root1 !== root2) {
                if (rank[root1] < rank[root2]) {
                    parent[root1] = root2;
                } else if (rank[root1] > rank[root2]) {
                    parent[root2] = root1;
                } else {
                    parent[root2] = root1;
                    rank[root1]++;
                }
                return true;
            }
            return false;
        };

        this.mstEdges = [];
        let totalWeight = 0;

        this.recordMSTStep(new Set(), this.mstEdges, "Starting Kruskal's Algorithm");

        for (const edge of sortedEdges) {
            this.isRunning = true;
            if (!this.isRunning) break;

            while (this.isPaused && this.isRunning) {
                await this.sleep(100);
            }

            if (union(edge.source, edge.target)) {
                this.mstEdges.push(edge);
                totalWeight += edge.weight;

                edge.isHighlighted = true;

                this.recordMSTStep(
                    new Set(this.mstEdges.flatMap(e => [e.source, e.target])),
                    this.mstEdges,
                    `Added edge ${edge.source}-${edge.target} weight: ${edge.weight}`
                );

                document.getElementById('pathCost').textContent = totalWeight;

                await this.sleep(500 / this.animationSpeed);
            } else {
                this.recordMSTStep(
                    new Set(this.mstEdges.flatMap(e => [e.source, e.target])),
                    this.mstEdges,
                    `Skipped edge ${edge.source}-${edge.target} (would create cycle)`
                );
            }

            if (this.mstEdges.length === this.nodes.length - 1) {
                break;
            }
        }

        if (this.mstEdges.length === this.nodes.length - 1) {
            showNotification(`MST Complete! Total Weight: ${totalWeight}`, 'success');
        } else {
            showNotification('Graph is not connected - cannot form MST', 'error');
        }
    }

    // HELPER METHODS FOR MST
    addEdgesToPQ(nodeId, pq, visited) {
        this.edges.forEach(edge => {
            if (edge.source === nodeId && !visited.has(edge.target)) {
                if (!pq.some(e => e.id === edge.id)) {
                    pq.push(edge);
                }
            } else if (edge.target === nodeId && !visited.has(edge.source)) {
                if (!pq.some(e => e.id === edge.id)) {
                    pq.push(edge);
                }
            }
        });
    }

    recordMSTStep(visited, mstEdges, description) {
        const step = {
            visited: Array.from(visited),
            mstEdges: mstEdges.map(e => e.id),
            description: description,
            timestamp: Date.now()
        };

        this.algorithmSteps.push(step);

        const infoDiv = document.getElementById('algorithmInfo');
        if (infoDiv) {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'step-description';
            stepDiv.textContent = description;
            stepDiv.style.padding = '5px';
            stepDiv.style.margin = '2px 0';
            stepDiv.style.backgroundColor = 'rgba(108, 92, 231, 0.1)';
            stepDiv.style.borderRadius = '3px';
            stepDiv.style.fontSize = '12px';
            infoDiv.appendChild(stepDiv);

            infoDiv.scrollTop = infoDiv.scrollHeight;
        }
    }

    // ANIMATION CONTROL FOR MST
    animateMSTStep() {
        if (!this.isRunning || this.currentStep >= this.algorithmSteps.length) {
            this.isRunning = false;
            return;
        }

        const step = this.algorithmSteps[this.currentStep];

        // Reset all edge highlights
        this.edges.forEach(edge => {
            edge.isHighlighted = false;
        });

        // Highlight MST edges for this step
        if (step.mstEdges) {
            step.mstEdges.forEach(edgeId => {
                const edge = this.edges.find(e => e.id === edgeId);
                if (edge) {
                    edge.isHighlighted = true;
                }
            });
        }

        // Update visited nodes for visualization
        this.visitedNodes = new Set(step.visited || []);

        this.draw();

        this.currentStep++;

        if (this.isRunning && !this.isPaused) {
            setTimeout(() => this.animateMSTStep(), 1000 / this.animationSpeed);
        }
    }

    // UTILITY METHODS
    getNeighbors(nodeId) {
        const neighbors = new Set();
        this.edges.forEach(edge => {
            if (edge.source === nodeId) neighbors.add(edge.target);
            if (!this.directed && edge.target === nodeId) neighbors.add(edge.source);
        });
        return Array.from(neighbors);
    }

    getEdge(sourceId, targetId) {
        return this.edges.find(edge =>
            (edge.source === sourceId && edge.target === targetId) ||
            (!this.directed && edge.source === targetId && edge.target === sourceId)
        );
    }

    reconstructPath(previous, endNodeId) {
        this.currentPath = [];
        let current = endNodeId;
        while (current !== null) {
            this.currentPath.unshift(current);
            current = previous[current];
        }
    }

    resetAlgorithm() {
        this.isRunning = false;
        this.isPaused = false;
        this.visitedNodes.clear();
        this.currentPath = [];
        this.algorithmSteps = [];
        this.currentStep = 0;
        this.mstEdges = [];

        this.edges.forEach(edge => {
            edge.isHighlighted = false;
        });

        const infoDiv = document.getElementById('algorithmInfo');
        if (infoDiv) {
            infoDiv.innerHTML = '<h3 id="algorithmName">No Algorithm Running</h3><div class="algorithm-stats"><div class="stat"><span>Visited Nodes:</span><span id="visitedCount">0</span></div><div class="stat"><span>Path Cost:</span><span id="pathCost">0</span></div></div>';
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // EXPORT/IMPORT
    exportToJSON() {
        return JSON.stringify({
            nodes: this.nodes,
            edges: this.edges,
            settings: {
                weighted: this.weighted,
                directed: this.directed
            }
        }, null, 2);
    }

    importFromJSON(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.nodes = data.nodes || [];
            this.edges = data.edges || [];
            this.weighted = data.settings?.weighted || false;
            this.directed = data.settings?.directed || false;
            return true;
        } catch (error) {
            console.error('Failed to import graph:', error);
            return false;
        }
    }
}