
let visualizer;

async function loadGraph(graphId) {
const token = localStorage.getItem('token');
try {
const response = await fetch(`/graphs/${graphId}`, {
headers: {
'Authorization': `Bearer ${token}`
}
});
if (response.ok) {
const graph = await response.json();
visualizer.importFromJSON(graph.graphData);
showNotification('Graph loaded successfully', 'success');
document.getElementById('loadModal').classList.remove('active');
}
} catch (error) {
showNotification('Failed to load graph', 'error');
}
}


function showNotification(message, type) {
// Remove existing notifications
const existingNotification = document.querySelector('.notification');
if (existingNotification) {
existingNotification.remove();
}
// Create notification element
const notification = document.createElement('div');
notification.className = `notification notification-${type}`;
notification.innerHTML = `
<div class="notification-content">
<span class="notification-icon">${type === 'success' ? '✓' : '✗'}</span>
<p>${message}</p>
</div>
`;
// Add styles
notification.style.cssText = `
position: fixed;
top: 20px;
right: 20px;
padding: 1rem;
background: ${type === 'success' ? 'var(--success-color)' : 'var(--error-color)'};
color: white;
border-radius: 10px;
box-shadow: 0 10px 20px rgba(0,0,0,0.2);
z-index: 9999;
animation: slideInRight 0.3s ease-out;
`;
document.body.appendChild(notification);
// Auto remove after 3 seconds
setTimeout(() => {
notification.style.animation = 'slideOutRight 0.3s ease-out';
setTimeout(() => notification.remove(), 300);
}, 3000);
}
// js/dashboard.js
document.addEventListener('DOMContentLoaded', () => {
// Check authentication
const token = localStorage.getItem('token');
if (!token) {
window.location.href = 'login.html';
return;
}

// Initialize graph visualizer
visualizer = new GraphVisualizer('graphCanvas');
// Set username
const userEmail = localStorage.getItem('userEmail');
const user_name = document.getElementById('username');
user_name.textContent = userEmail.split('@')[0];
// Initialize UI
initSidebar();
initAlgorithmButtons(visualizer);
initControlButtons(visualizer);
initSettings(visualizer);

initSaveLoad(visualizer);

initLogout();
});
function initSidebar() {
const toggleBtn = document.querySelector('.toggle-sidebar');
const sidebar = document.querySelector('.sidebar');
toggleBtn.addEventListener('click', () => {
sidebar.classList.toggle('collapsed');
toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
});
// Set user avatar
const userEmail = localStorage.getItem('userEmail');
const avatar = document.getElementById('userAvatar');
avatar.textContent = userEmail.charAt(0).toUpperCase();
}
function initAlgorithmButtons(visualizer) {
const algoButtons = document.querySelectorAll('.algo-btn');
algoButtons.forEach(btn => {
btn.addEventListener('click', () => {
// Remove active class from all buttons
algoButtons.forEach(b => b.classList.remove('active'));
btn.classList.add('active');
// Set current algorithm
const algo = btn.dataset.algo;
document.getElementById('algorithmName').textContent =
getAlgorithmName(algo);
});
});
// Start algorithm button
document.getElementById('startAlgoBtn').addEventListener('click', async () => {
if (visualizer.nodes.length === 0) {
showNotification('Please create a graph first', 'error');
return;
}
const activeAlgo = document.querySelector('.algo-btn.active');
if (!activeAlgo) {
showNotification('Please select an algorithm', 'error');
return;
}
const algo = activeAlgo.dataset.algo;
visualizer.isRunning = true;
visualizer.isPaused = false;

// Get start node (first selected or first node)
const startNode = visualizer.selectedNode || visualizer.nodes[0];
switch(algo) {
case 'bfs':
await visualizer.runBFS(startNode.id);
break;
case 'dfs':
await visualizer.runDFS(startNode.id);
break;
case 'dijkstra':
// For Dijkstra, need end node (second selected or last node)
const endNode = visualizer.nodes.length > 1 ?
visualizer.nodes[visualizer.nodes.length - 1] : startNode;
await visualizer.runDijkstra(startNode.id, endNode.id);
break;
case 'prim':
await visualizer.runPrimsMST();
break;

case 'kruskal':
await visualizer.runKruskalMST();
break;
}
});
// Pause/Resume
document.getElementById('pauseAlgoBtn').addEventListener('click', () => {
visualizer.isPaused = !visualizer.isPaused;
document.getElementById('pauseAlgoBtn').textContent =
visualizer.isPaused ? '▶ Resume' : '⏸ Pause';
});
// Step
document.getElementById('stepAlgoBtn').addEventListener('click', () => {
if (visualizer.isPaused) {
// Execute one step
if (visualizer.currentStep < visualizer.algorithmSteps.length) {
const step = visualizer.algorithmSteps[visualizer.currentStep];
visualizer.visitedNodes = new Set(step.visited);
visualizer.currentStep++;
}
}
});
// Reset
document.getElementById('resetAlgoBtn').addEventListener('click', () => {
visualizer.resetAlgorithm();
document.getElementById('pauseAlgoBtn').textContent = '⏸ Pause';
});
}
function initControlButtons(visualizer) {
// Add Node mode
document.getElementById('addNodeBtn').addEventListener('click', () => {
visualizer.mode = 'addNode';
showNotification('Click on canvas to add nodes', 'info');
});
// Add Edge mode
let edgeSource = null;
document.getElementById('addEdgeBtn').addEventListener('click', () => {
visualizer.mode = 'addEdge';
edgeSource = null;
showNotification('Click on first node, then second node to create edge', 'info');
});
// Handle node selection for edge creation
visualizer.canvas.addEventListener('click', (e) => {
if (visualizer.mode === 'addEdge') {
const rect = visualizer.canvas.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
const node = visualizer.findNodeAt(x, y);
if (node) {
if (!edgeSource) {
edgeSource = node;
showNotification(`Selected node ${node.label} as source`, 'info');
} else {
const weight = visualizer.weighted ?
parseFloat(prompt('Enter edge weight:', '1')) : 1;
if (weight !== null && !isNaN(weight)) {
visualizer.addEdge(edgeSource.id, node.id, weight);
showNotification(`Edge created with weight ${weight}`, 'success');
}
edgeSource = null;
visualizer.mode = null;
}
}
}
});
// Delete mode
document.getElementById('deleteBtn').addEventListener('click', () => {
visualizer.mode = 'delete';
showNotification('Click on node or edge to delete', 'info');
});
// Handle deletion
visualizer.canvas.addEventListener('click', (e) => {
if (visualizer.mode === 'delete') {
const rect = visualizer.canvas.getBoundingClientRect();
const x = e.clientX - rect.left;
const y = e.clientY - rect.top;
// Check if clicked on node
const node = visualizer.findNodeAt(x, y);
if (node) {
if (confirm(`Delete node ${node.label}?`)) {
visualizer.deleteNode(node.id);
showNotification('Node deleted', 'success');
}
visualizer.mode = null;
return;
}
// Check if clicked near edge
const edge = findNearbyEdge(visualizer, x, y);
if (edge) {
if (confirm('Delete this edge?')) {
visualizer.deleteEdge(edge.id);
showNotification('Edge deleted', 'success');
}
visualizer.mode = null;
}
}
});
// Clear graph
document.getElementById('clearBtn').addEventListener('click', () => {
if (confirm('Clear the entire graph?')) {
visualizer.clearGraph();
showNotification('Graph cleared', 'success');
}
});
}
function findNearbyEdge(visualizer, x, y, threshold = 10) {
for (const edge of visualizer.edges) {
const source = visualizer.nodes.find(n => n.id === edge.source);
const target = visualizer.nodes.find(n => n.id === edge.target);
if (source && target) {
// Calculate distance from point to line segment
const distance = distanceToLineSegment(
x, y,
source.x, source.y,
target.x, target.y
);
if (distance < threshold) {
return edge;
}
}
}
return null;
}
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
const A = px - x1;
const B = py - y1;
const C = x2 - x1;
const D = y2 - y1;
const dot = A * C + B * D;
const len_sq = C * C + D * D;
let param = -1;
if (len_sq !== 0) param = dot / len_sq;
let xx, yy;
if (param < 0) {
xx = x1;
yy = y1;
} else if (param > 1) {
xx = x2;
yy = y2;
} else {
xx = x1 + param * C;
yy = y1 + param * D;
}
const dx = px - xx;
const dy = py - yy;
return Math.sqrt(dx * dx + dy * dy);
}
function initSettings(visualizer) {
// Weighted toggle
document.getElementById('weightedToggle').addEventListener('change', (e) => {
visualizer.weighted = e.target.checked;
});
// Directed toggle
document.getElementById('directedToggle').addEventListener('change', (e) => {
visualizer.directed = e.target.checked;
});
// Speed control
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
speedSlider.addEventListener('input', (e) => {
const speed = parseFloat(e.target.value);
speedValue.textContent = speed + 'x';
visualizer.animationSpeed = speed;
});
}
function initSaveLoad(visualizer) {
// Save graph
document.getElementById('saveGraphBtn').addEventListener('click', () => {
const modal = document.getElementById('saveModal');
modal.classList.add('active');
});
document.getElementById('confirmSaveBtn').addEventListener('click', async () => {
const graphName = document.getElementById('graphName').value;
if (!graphName) {
showNotification('Please enter a graph name', 'error');
return;
}
const graphData = visualizer.exportToJSON();
const token = localStorage.getItem('token');
try {
const response = await fetch('/graphs/save', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'Authorization': `Bearer ${token}`
},
body: JSON.stringify({
name: graphName,
graphData: graphData
})
});
if (response.ok) {
showNotification('Graph saved successfully', 'success');
document.getElementById('saveModal').classList.remove('active');
document.getElementById('graphName').value = '';
} else {
showNotification('Failed to save graph', 'error');
}
} catch (error) {
showNotification('Network error', 'error');
}
});
document.getElementById('cancelSaveBtn').addEventListener('click', () => {
document.getElementById('saveModal').classList.remove('active');
document.getElementById('graphName').value = '';
});


// Load graph
document.getElementById('loadGraphBtn').addEventListener('click', async () => {
//console.log("hello")
const modal = document.getElementById('loadModal');
const listContainer = document.getElementById('savedGraphsList');
const token = localStorage.getItem('token');
try {
const response = await fetch('/graphs/list', {
headers: {
'Authorization': `Bearer ${token}`
}
});
if (response.ok) {
console.log("hello");
//
const graphs = await response.json();   // error point
console.log("Graphs:",graphs);
//console.log("raw response; ",text);
//const cleanText = text.trim();
//const graphs = JSON.parse(cleanText);
console.log("parse: ");


listContainer.innerHTML = '';
graphs.forEach(graph => {
const graphItem = document.createElement('div');
graphItem.className = 'graph-item';
graphItem.innerHTML = `
<h4>${graph.name}</h4>
<p>Created: ${new Date(graph.createdAt).toLocaleDateString()}</p>
`;
graphItem.addEventListener('click', () => loadGraph(graph.id));
listContainer.appendChild(graphItem);
});
modal.classList.add('active');
}
} catch (error) {
showNotification('Failed to load graphs', 'error');
}
});

document.getElementById('closeLoadModalBtn').addEventListener('click', () => {
document.getElementById('loadModal').classList.remove('active');
});
// Export JSON
document.getElementById('exportJsonBtn').addEventListener('click', () => {
const json = visualizer.exportToJSON();
const blob = new Blob([json], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `graph_${new Date().toISOString()}.json`;
a.click();
URL.revokeObjectURL(url);
showNotification('Graph exported successfully', 'success');
});




// Import JSON
document.getElementById('importJsonBtn').addEventListener('click', () => {
const input = document.createElement('input');
input.type = 'file';
input.accept = '.json';
input.onchange = (e) => {
const file = e.target.files[0];
const reader = new FileReader();
reader.onload = (e) => {
if (visualizer.importFromJSON(e.target.result)) {
showNotification('Graph imported successfully', 'success');
} else {
showNotification('Failed to import graph', 'error');
}
};
reader.readAsText(file);
};
input.click();
});
}



function initLogout() {
document.getElementById('logoutBtn').addEventListener('click', () => {
localStorage.removeItem('token');
localStorage.removeItem('userEmail');
window.location.href = 'index.html';
});
}
function getAlgorithmName(algo) {
const names = {
bfs: 'Breadth-First Search (BFS)',
dfs: 'Depth-First Search (DFS)',
dijkstra: "Dijkstra's Shortest Path",
prim: "Prim's Minimum Spanning Tree",
kruskal: "Kruskal's Minimum Spanning Tree"
};
return names[algo] || algo;
}

//
//
//// =====================================================
//// DASHBOARD.JS - COMPLETE FIXED VERSION
//// =====================================================
//
//let visualizer;
//
//// =====================================================
//// LOAD GRAPH FUNCTION
//// =====================================================
//async function loadGraph(graphId) {
//    const token = localStorage.getItem('token');
//    if (!token) {
//        showNotification('Please login again', 'error');
//        window.location.href = 'login.html';
//        return;
//    }
//
//    try {
//        const response = await fetch(`http://localhost:8080/api/graphs/${graphId}`, {
//            headers: {
//                'Authorization': `Bearer ${token}`
//            }
//        });
//
//        if (response.ok) {
//            const graph = await response.json();
//            if (visualizer && graph.graphData) {
//                visualizer.importFromJSON(graph.graphData);
//                showNotification('Graph loaded successfully', 'success');
//                document.getElementById('loadModal')?.classList.remove('active');
//            } else {
//                showNotification('Invalid graph data', 'error');
//            }
//        } else {
//            const error = await response.text();
//            showNotification(`Failed to load graph: ${error}`, 'error');
//        }
//    } catch (error) {
//        console.error('Load graph error:', error);
//        showNotification('Network error - Failed to load graph', 'error');
//    }
//}
//
//// =====================================================
//// SHOW NOTIFICATION FUNCTION
//// =====================================================
//function showNotification(message, type = 'info') {
//    // Remove existing notifications
//    const existingNotification = document.querySelector('.notification');
//    if (existingNotification) {
//        existingNotification.remove();
//    }
//
//    // Create notification element
//    const notification = document.createElement('div');
//    notification.className = `notification notification-${type}`;
//
//    // Set icon based on type
//    let icon = '✓';
//    if (type === 'error') icon = '✗';
//    else if (type === 'info') icon = 'ℹ';
//    else if (type === 'warning') icon = '⚠';
//
//    notification.innerHTML = `
//        <div class="notification-content">
//            <span class="notification-icon">${icon}</span>
//            <p>${message}</p>
//        </div>
//    `;
//
//    // Set colors
//    let bgColor = '#3b82f6'; // blue for info
//    if (type === 'success') bgColor = '#10b981';
//    else if (type === 'error') bgColor = '#ef4444';
//    else if (type === 'warning') bgColor = '#f59e0b';
//
//    // Add styles
//    notification.style.cssText = `
//        position: fixed;
//        top: 20px;
//        right: 20px;
//        padding: 1rem 1.5rem;
//        background: ${bgColor};
//        color: white;
//        border-radius: 10px;
//        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
//        z-index: 9999;
//        animation: slideInRight 0.3s ease-out;
//        font-weight: 500;
//        min-width: 250px;
//    `;
//
//    document.body.appendChild(notification);
//
//    // Auto remove after 3 seconds
//    setTimeout(() => {
//        notification.style.animation = 'slideOutRight 0.3s ease-out';
//        setTimeout(() => notification.remove(), 300);
//    }, 3000);
//}
//
//// =====================================================
//// DOM CONTENT LOADED - MAIN INITIALIZATION
//// =====================================================
//document.addEventListener('DOMContentLoaded', () => {
//    console.log('🚀 Dashboard initializing...');
//
//    try {
//        // =====================================================
//        // 1. CHECK AUTHENTICATION
//        // =====================================================
//        const token = localStorage.getItem('token');
//        if (!token) {
//            console.log('❌ No token found, redirecting to login');
//            window.location.href = 'login.html';
//            return;
//        }
//
//        // =====================================================
//        // 2. CHECK CANVAS ELEMENT
//        // =====================================================
//        const canvas = document.getElementById('graphCanvas');
//        if (!canvas) {
//            console.error('❌ Canvas element not found');
//            showNotification('Canvas element missing', 'error');
//            return;
//        }
//
//        // =====================================================
//        // 3. INITIALIZE GRAPH VISUALIZER
//        // =====================================================
//        try {
//            visualizer = new GraphVisualizer('graphCanvas');
//            console.log('✅ Graph visualizer initialized');
//        } catch (error) {
//            console.error('❌ Failed to initialize visualizer:', error);
//            showNotification('Failed to initialize graph visualizer', 'error');
//            return;
//        }
//
//        // =====================================================
//        // 4. SET USERNAME - FIXED (ERROR LINE 73 WALA)
//        // =====================================================
//        try {
//            const userEmail = localStorage.getItem('userEmail');
//            const usernameElement = document.getElementById('username');
//
//            if (usernameElement) {
//                if (userEmail && typeof userEmail === 'string') {
//                    if (userEmail.includes('@')) {
//                        usernameElement.textContent = userEmail.split('@')[0];
//                        console.log(`✅ Username set from email: ${userEmail.split('@')[0]}`);
//                    } else {
//                        usernameElement.textContent = userEmail;
//                        console.log(`✅ Username set directly: ${userEmail}`);
//                    }
//                } else {
//                    usernameElement.textContent = 'User';
//                    console.warn('⚠️ No userEmail found, using "User"');
//
//                    // Try to fetch from API
//                    fetchUserProfile();
//                }
//            } else {
//                console.warn('⚠️ Username element not found');
//            }
//        } catch (error) {
//            console.error('❌ Error setting username:', error);
//            // Fallback
//            const usernameElement = document.getElementById('username');
//            if (usernameElement) {
//                usernameElement.textContent = 'User';
//            }
//        }
//
//        // =====================================================
//        // 5. SET USER AVATAR - FIXED
//        // =====================================================
//        try {
//            const userEmail = localStorage.getItem('userEmail');
//            const avatarElement = document.getElementById('userAvatar');
//
//            if (avatarElement) {
//                if (userEmail && typeof userEmail === 'string' && userEmail.length > 0) {
//                    avatarElement.textContent = userEmail.charAt(0).toUpperCase();
//                } else {
//                    avatarElement.textContent = '?';
//                }
//            }
//        } catch (error) {
//            console.error('❌ Error setting avatar:', error);
//        }
//
//        // =====================================================
//        // 6. INITIALIZE ALL FEATURES
//        // =====================================================
//        try {
//            initSidebar();
//            initAlgorithmButtons(visualizer);
//            initControlButtons(visualizer);
//            initSettings(visualizer);
//            initSaveLoad(visualizer);
//            initLogout();
//            console.log('✅ All features initialized');
//        } catch (error) {
//            console.error('❌ Error initializing features:', error);
//            showNotification('Some features may not work properly', 'warning');
//        }
//
//    } catch (error) {
//        console.error('❌ Fatal error in dashboard initialization:', error);
//        showNotification('Failed to initialize dashboard', 'error');
//    }
//});
//
//// =====================================================
//// FETCH USER PROFILE FROM API
//// =====================================================
//async function fetchUserProfile() {
//    try {
//        const token = localStorage.getItem('token');
//        if (!token) return;
//
//        const response = await fetch('http://localhost:8080/api/users/profile', {
//            headers: {
//                'Authorization': `Bearer ${token}`
//            }
//        });
//
//        if (response.ok) {
//            const userData = await response.json();
//            console.log('📥 User profile fetched:', userData);
//
//            // Update localStorage
//            if (userData.email) {
//                localStorage.setItem('userEmail', userData.email);
//            }
//            if (userData.name) {
//                localStorage.setItem('userName', userData.name);
//            }
//
//            // Update UI
//            const usernameElement = document.getElementById('username');
//            if (usernameElement) {
//                if (userData.name) {
//                    usernameElement.textContent = userData.name;
//                } else if (userData.email) {
//                    usernameElement.textContent = userData.email.split('@')[0];
//                }
//            }
//
//            const avatarElement = document.getElementById('userAvatar');
//            if (avatarElement) {
//                if (userData.name) {
//                    avatarElement.textContent = userData.name.charAt(0).toUpperCase();
//                } else if (userData.email) {
//                    avatarElement.textContent = userData.email.charAt(0).toUpperCase();
//                }
//            }
//        }
//    } catch (error) {
//        console.warn('⚠️ Could not fetch user profile:', error);
//    }
//}
//
//// =====================================================
//// SIDEBAR INITIALIZATION
//// =====================================================
//function initSidebar() {
//    const toggleBtn = document.querySelector('.toggle-sidebar');
//    const sidebar = document.querySelector('.sidebar');
//
//    if (toggleBtn && sidebar) {
//        // Remove existing listeners
//        const newToggleBtn = toggleBtn.cloneNode(true);
//        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
//
//        newToggleBtn.addEventListener('click', () => {
//            sidebar.classList.toggle('collapsed');
//            newToggleBtn.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
//        });
//    }
//}
//
//// =====================================================
//// ALGORITHM BUTTONS INITIALIZATION
//// =====================================================
//function initAlgorithmButtons(visualizer) {
//    const algoButtons = document.querySelectorAll('.algo-btn');
//
//    if (algoButtons.length > 0) {
//        algoButtons.forEach(btn => {
//            // Remove existing listeners
//            const newBtn = btn.cloneNode(true);
//            btn.parentNode.replaceChild(newBtn, btn);
//
//            newBtn.addEventListener('click', () => {
//                // Remove active class from all buttons
//                document.querySelectorAll('.algo-btn').forEach(b => b.classList.remove('active'));
//                newBtn.classList.add('active');
//
//                // Set current algorithm
//                const algo = newBtn.dataset.algo;
//                const algoNameElement = document.getElementById('algorithmName');
//                if (algoNameElement) {
//                    algoNameElement.textContent = getAlgorithmName(algo);
//                }
//            });
//        });
//    }
//
//    // Start algorithm button
//    const startBtn = document.getElementById('startAlgoBtn');
//    if (startBtn) {
//        const newStartBtn = startBtn.cloneNode(true);
//        startBtn.parentNode.replaceChild(newStartBtn, startBtn);
//
//        newStartBtn.addEventListener('click', async () => {
//            if (!visualizer) {
//                showNotification('Visualizer not initialized', 'error');
//                return;
//            }
//
//            if (visualizer.nodes.length === 0) {
//                showNotification('Please create a graph first', 'error');
//                return;
//            }
//
//            const activeAlgo = document.querySelector('.algo-btn.active');
//            if (!activeAlgo) {
//                showNotification('Please select an algorithm', 'error');
//                return;
//            }
//
//            const algo = activeAlgo.dataset.algo;
//            visualizer.isRunning = true;
//            visualizer.isPaused = false;
//
//            // Get start node
//            const startNode = visualizer.selectedNode || visualizer.nodes[0];
//
//            try {
//                switch(algo) {
//                    case 'bfs':
//                        await visualizer.runBFS(startNode.id);
//                        break;
//                    case 'dfs':
//                        await visualizer.runDFS(startNode.id);
//                        break;
//                    case 'dijkstra':
//                        const endNode = visualizer.nodes.length > 1 ?
//                            visualizer.nodes[visualizer.nodes.length - 1] : startNode;
//                        await visualizer.runDijkstra(startNode.id, endNode.id);
//                        break;
//                    case 'prim':
//                        if (typeof visualizer.runPrimsMST === 'function') {
//                            await visualizer.runPrimsMST();
//                        } else {
//                            showNotification('Prim\'s algorithm not implemented', 'error');
//                        }
//                        break;
//                    case 'kruskal':
//                        if (typeof visualizer.runKruskalMST === 'function') {
//                            await visualizer.runKruskalMST();
//                        } else {
//                            showNotification('Kruskal\'s algorithm not implemented', 'error');
//                        }
//                        break;
//                    default:
//                        showNotification('Unknown algorithm', 'error');
//                }
//            } catch (error) {
//                console.error('Algorithm error:', error);
//                showNotification('Error running algorithm', 'error');
//                visualizer.isRunning = false;
//            }
//        });
//    }
//
//    // Pause/Resume button
//    const pauseBtn = document.getElementById('pauseAlgoBtn');
//    if (pauseBtn) {
//        const newPauseBtn = pauseBtn.cloneNode(true);
//        pauseBtn.parentNode.replaceChild(newPauseBtn, pauseBtn);
//
//        newPauseBtn.addEventListener('click', () => {
//            if (visualizer) {
//                visualizer.isPaused = !visualizer.isPaused;
//                newPauseBtn.textContent = visualizer.isPaused ? '▶ Resume' : '⏸ Pause';
//            }
//        });
//    }
//
//    // Step button
//    const stepBtn = document.getElementById('stepAlgoBtn');
//    if (stepBtn) {
//        const newStepBtn = stepBtn.cloneNode(true);
//        stepBtn.parentNode.replaceChild(newStepBtn, stepBtn);
//
//        newStepBtn.addEventListener('click', () => {
//            if (visualizer && visualizer.isPaused) {
//                if (visualizer.currentStep < visualizer.algorithmSteps.length) {
//                    const step = visualizer.algorithmSteps[visualizer.currentStep];
//                    visualizer.visitedNodes = new Set(step.visited);
//                    visualizer.currentStep++;
//                    visualizer.draw();
//                }
//            }
//        });
//    }
//
//    // Reset button
//    const resetBtn = document.getElementById('resetAlgoBtn');
//    if (resetBtn) {
//        const newResetBtn = resetBtn.cloneNode(true);
//        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
//
//        newResetBtn.addEventListener('click', () => {
//            if (visualizer) {
//                visualizer.resetAlgorithm();
//                const pauseBtn = document.getElementById('pauseAlgoBtn');
//                if (pauseBtn) pauseBtn.textContent = '⏸ Pause';
//                showNotification('Algorithm reset', 'info');
//            }
//        });
//    }
//}
//
//// =====================================================
//// CONTROL BUTTONS INITIALIZATION
//// =====================================================
//function initControlButtons(visualizer) {
//    // Add Node mode
//    const addNodeBtn = document.getElementById('addNodeBtn');
//    if (addNodeBtn) {
//        const newBtn = addNodeBtn.cloneNode(true);
//        addNodeBtn.parentNode.replaceChild(newBtn, addNodeBtn);
//
//        newBtn.addEventListener('click', () => {
//            visualizer.mode = 'addNode';
//            showNotification('Click on canvas to add nodes', 'info');
//        });
//    }
//
//    // Add Edge mode
//    let edgeSource = null;
//    const addEdgeBtn = document.getElementById('addEdgeBtn');
//    if (addEdgeBtn) {
//        const newBtn = addEdgeBtn.cloneNode(true);
//        addEdgeBtn.parentNode.replaceChild(newBtn, addEdgeBtn);
//
//        newBtn.addEventListener('click', () => {
//            visualizer.mode = 'addEdge';
//            edgeSource = null;
//            showNotification('Click first node, then second node to create edge', 'info');
//        });
//    }
//
//    // Handle node selection for edge creation
//    if (visualizer.canvas) {
//        // Remove existing listeners
//        const newCanvas = visualizer.canvas.cloneNode(true);
//        visualizer.canvas.parentNode.replaceChild(newCanvas, visualizer.canvas);
//        visualizer.canvas = newCanvas;
//
//        visualizer.canvas.addEventListener('click', (e) => {
//            if (visualizer.mode === 'addEdge') {
//                const rect = visualizer.canvas.getBoundingClientRect();
//                const x = e.clientX - rect.left;
//                const y = e.clientY - rect.top;
//                const node = visualizer.findNodeAt(x, y);
//
//                if (node) {
//                    if (!edgeSource) {
//                        edgeSource = node;
//                        showNotification(`Selected node ${node.label} as source`, 'info');
//                    } else {
//                        const weight = visualizer.weighted ?
//                            parseFloat(prompt('Enter edge weight:', '1')) : 1;
//                        if (weight !== null && !isNaN(weight)) {
//                            visualizer.addEdge(edgeSource.id, node.id, weight);
//                            showNotification(`Edge created with weight ${weight}`, 'success');
//                        }
//                        edgeSource = null;
//                        visualizer.mode = null;
//                    }
//                }
//            }
//        });
//    }
//
//    // Delete mode
//    const deleteBtn = document.getElementById('deleteBtn');
//    if (deleteBtn) {
//        const newBtn = deleteBtn.cloneNode(true);
//        deleteBtn.parentNode.replaceChild(newBtn, deleteBtn);
//
//        newBtn.addEventListener('click', () => {
//            visualizer.mode = 'delete';
//            showNotification('Click on node or edge to delete', 'info');
//        });
//    }
//
//    // Handle deletion on canvas
//    if (visualizer.canvas) {
//        visualizer.canvas.addEventListener('click', (e) => {
//            if (visualizer.mode === 'delete') {
//                const rect = visualizer.canvas.getBoundingClientRect();
//                const x = e.clientX - rect.left;
//                const y = e.clientY - rect.top;
//
//                // Check if clicked on node
//                const node = visualizer.findNodeAt(x, y);
//                if (node) {
//                    if (confirm(`Delete node ${node.label}?`)) {
//                        visualizer.deleteNode(node.id);
//                        showNotification('Node deleted', 'success');
//                    }
//                    visualizer.mode = null;
//                    return;
//                }
//
//                // Check if clicked near edge
//                const edge = findNearbyEdge(visualizer, x, y);
//                if (edge) {
//                    if (confirm('Delete this edge?')) {
//                        visualizer.deleteEdge(edge.id);
//                        showNotification('Edge deleted', 'success');
//                    }
//                    visualizer.mode = null;
//                }
//            }
//        });
//    }
//
//    // Clear graph
//    const clearBtn = document.getElementById('clearBtn');
//    if (clearBtn) {
//        const newBtn = clearBtn.cloneNode(true);
//        clearBtn.parentNode.replaceChild(newBtn, clearBtn);
//
//        newBtn.addEventListener('click', () => {
//            if (confirm('Clear the entire graph?')) {
//                visualizer.clearGraph();
//                showNotification('Graph cleared', 'success');
//            }
//        });
//    }
//}
//
//// =====================================================
//// FIND NEARBY EDGE HELPER
//// =====================================================
//function findNearbyEdge(visualizer, x, y, threshold = 10) {
//    if (!visualizer || !visualizer.edges) return null;
//
//    for (const edge of visualizer.edges) {
//        const source = visualizer.nodes.find(n => n.id === edge.source);
//        const target = visualizer.nodes.find(n => n.id === edge.target);
//
//        if (source && target) {
//            const distance = distanceToLineSegment(
//                x, y, source.x, source.y, target.x, target.y
//            );
//            if (distance < threshold) {
//                return edge;
//            }
//        }
//    }
//    return null;
//}
//
//// =====================================================
//// DISTANCE TO LINE SEGMENT HELPER
//// =====================================================
//function distanceToLineSegment(px, py, x1, y1, x2, y2) {
//    const A = px - x1;
//    const B = py - y1;
//    const C = x2 - x1;
//    const D = y2 - y1;
//
//    const dot = A * C + B * D;
//    const len_sq = C * C + D * D;
//    let param = -1;
//
//    if (len_sq !== 0) param = dot / len_sq;
//
//    let xx, yy;
//
//    if (param < 0) {
//        xx = x1;
//        yy = y1;
//    } else if (param > 1) {
//        xx = x2;
//        yy = y2;
//    } else {
//        xx = x1 + param * C;
//        yy = y1 + param * D;
//    }
//
//    const dx = px - xx;
//    const dy = py - yy;
//    return Math.sqrt(dx * dx + dy * dy);
//}
//
//// =====================================================
//// SETTINGS INITIALIZATION
//// =====================================================
//function initSettings(visualizer) {
//    // Weighted toggle
//    const weightedToggle = document.getElementById('weightedToggle');
//    if (weightedToggle) {
//        const newToggle = weightedToggle.cloneNode(true);
//        weightedToggle.parentNode.replaceChild(newToggle, weightedToggle);
//
//        newToggle.addEventListener('change', (e) => {
//            visualizer.weighted = e.target.checked;
//        });
//    }
//
//    // Directed toggle
//    const directedToggle = document.getElementById('directedToggle');
//    if (directedToggle) {
//        const newToggle = directedToggle.cloneNode(true);
//        directedToggle.parentNode.replaceChild(newToggle, directedToggle);
//
//        newToggle.addEventListener('change', (e) => {
//            visualizer.directed = e.target.checked;
//        });
//    }
//
//    // Speed control
//    const speedSlider = document.getElementById('speedSlider');
//    const speedValue = document.getElementById('speedValue');
//
//    if (speedSlider && speedValue) {
//        const newSlider = speedSlider.cloneNode(true);
//        speedSlider.parentNode.replaceChild(newSlider, speedSlider);
//
//        newSlider.addEventListener('input', (e) => {
//            const speed = parseFloat(e.target.value);
//            speedValue.textContent = speed.toFixed(1) + 'x';
//            if (visualizer) {
//                visualizer.animationSpeed = speed;
//            }
//        });
//    }
//}
//
//// =====================================================
//// SAVE/LOAD INITIALIZATION
//// =====================================================
//function initSaveLoad(visualizer) {
//    // Save graph button
//    const saveBtn = document.getElementById('saveGraphBtn');
//    if (saveBtn) {
//        const newBtn = saveBtn.cloneNode(true);
//        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
//
//        newBtn.addEventListener('click', () => {
//            const modal = document.getElementById('saveModal');
//            if (modal) modal.classList.add('active');
//        });
//    }
//
//    // Confirm save button
//    const confirmBtn = document.getElementById('confirmSaveBtn');
//    if (confirmBtn) {
//        const newBtn = confirmBtn.cloneNode(true);
//        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
//
//        newBtn.addEventListener('click', async () => {
//            const graphName = document.getElementById('graphName')?.value;
//            if (!graphName) {
//                showNotification('Please enter a graph name', 'error');
//                return;
//            }
//
//            const graphData = visualizer.exportToJSON();
//            const token = localStorage.getItem('token');
//
//            try {
//                const response = await fetch('http://localhost:8080/api/graphs/save', {
//                    method: 'POST',
//                    headers: {
//                        'Content-Type': 'application/json',
//                        'Authorization': `Bearer ${token}`
//                    },
//                    body: JSON.stringify({
//                        name: graphName,
//                        graphData: graphData
//                    })
//                });
//
//                if (response.ok) {
//                    showNotification('Graph saved successfully', 'success');
//                    document.getElementById('saveModal')?.classList.remove('active');
//                    const nameInput = document.getElementById('graphName');
//                    if (nameInput) nameInput.value = '';
//                } else {
//                    const error = await response.text();
//                    showNotification(`Failed to save graph: ${error}`, 'error');
//                }
//            } catch (error) {
//                console.error('Save error:', error);
//                showNotification('Network error - graph saved locally', 'warning');
//
//                // Save locally as fallback
//                saveGraphLocally(graphName, graphData);
//                document.getElementById('saveModal')?.classList.remove('active');
//            }
//        });
//    }
//
//    // Cancel save button
//    const cancelBtn = document.getElementById('cancelSaveBtn');
//    if (cancelBtn) {
//        const newBtn = cancelBtn.cloneNode(true);
//        cancelBtn.parentNode.replaceChild(newBtn, cancelBtn);
//
//        newBtn.addEventListener('click', () => {
//            document.getElementById('saveModal')?.classList.remove('active');
//            const nameInput = document.getElementById('graphName');
//            if (nameInput) nameInput.value = '';
//        });
//    }
//
//    // Load graph button
//    const loadBtn = document.getElementById('loadGraphBtn');
//    if (loadBtn) {
//        const newBtn = loadBtn.cloneNode(true);
//        loadBtn.parentNode.replaceChild(newBtn, loadBtn);
//
//        newBtn.addEventListener('click', async () => {
//            const modal = document.getElementById('loadModal');
//            const listContainer = document.getElementById('savedGraphsList');
//
//            if (!modal || !listContainer) return;
//
//            const token = localStorage.getItem('token');
//
//            try {
//                const response = await fetch('http://localhost:8080/api/graphs/list', {
//                    headers: {
//                        'Authorization': `Bearer ${token}`
//                    }
//                });
//
//                if (response.ok) {
//                    const graphs = await response.json();
//                    console.log('📥 Loaded graphs:', graphs);
//
//                    listContainer.innerHTML = '';
//
//                    if (graphs.length === 0) {
//                        listContainer.innerHTML = '<p class="text-center p-4">No saved graphs found</p>';
//                    } else {
//                        graphs.forEach(graph => {
//                            const graphItem = document.createElement('div');
//                            graphItem.className = 'graph-item p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100';
//                            graphItem.innerHTML = `
//                                <h4 class="font-medium">${graph.name}</h4>
//                                <p class="text-sm text-gray-500">Created: ${new Date(graph.createdAt).toLocaleDateString()}</p>
//                            `;
//                            graphItem.addEventListener('click', () => loadGraph(graph.id));
//                            listContainer.appendChild(graphItem);
//                        });
//                    }
//
//                    modal.classList.add('active');
//                } else {
//                    showNotification('Failed to load graphs list', 'error');
//                }
//            } catch (error) {
//                console.error('Load list error:', error);
//                showNotification('Network error - cannot load graphs', 'error');
//            }
//        });
//    }
//
//    // Close load modal button
//    const closeBtn = document.getElementById('closeLoadModalBtn');
//    if (closeBtn) {
//        const newBtn = closeBtn.cloneNode(true);
//        closeBtn.parentNode.replaceChild(newBtn, closeBtn);
//
//        newBtn.addEventListener('click', () => {
//            document.getElementById('loadModal')?.classList.remove('active');
//        });
//    }
//
//    // Export JSON button
//    const exportBtn = document.getElementById('exportJsonBtn');
//    if (exportBtn) {
//        const newBtn = exportBtn.cloneNode(true);
//        exportBtn.parentNode.replaceChild(newBtn, exportBtn);
//
//        newBtn.addEventListener('click', () => {
//            const json = visualizer.exportToJSON();
//            const blob = new Blob([json], { type: 'application/json' });
//            const url = URL.createObjectURL(blob);
//            const a = document.createElement('a');
//            a.href = url;
//            a.download = `graph_${new Date().toISOString().slice(0,10)}.json`;
//            a.click();
//            URL.revokeObjectURL(url);
//            showNotification('Graph exported successfully', 'success');
//        });
//    }
//
//    // Import JSON button
//    const importBtn = document.getElementById('importJsonBtn');
//    if (importBtn) {
//        const newBtn = importBtn.cloneNode(true);
//        importBtn.parentNode.replaceChild(newBtn, importBtn);
//
//        newBtn.addEventListener('click', () => {
//            const input = document.createElement('input');
//            input.type = 'file';
//            input.accept = '.json';
//
//            input.onchange = (e) => {
//                const file = e.target.files[0];
//                const reader = new FileReader();
//
//                reader.onload = (e) => {
//                    try {
//                        if (visualizer.importFromJSON(e.target.result)) {
//                            showNotification('Graph imported successfully', 'success');
//                        } else {
//                            showNotification('Failed to import graph - invalid format', 'error');
//                        }
//                    } catch (error) {
//                        console.error('Import error:', error);
//                        showNotification('Error importing graph', 'error');
//                    }
//                };
//
//                reader.readAsText(file);
//            };
//
//            input.click();
//        });
//    }
//}
//
//// =====================================================
//// SAVE GRAPH LOCALLY (FALLBACK)
//// =====================================================
//function saveGraphLocally(name, data) {
//    try {
//        const savedGraphs = JSON.parse(localStorage.getItem('localGraphs') || '[]');
//        savedGraphs.push({
//            id: Date.now(),
//            name: name,
//            data: data,
//            date: new Date().toISOString()
//        });
//        localStorage.setItem('localGraphs', JSON.stringify(savedGraphs));
//        showNotification('Graph saved locally!', 'success');
//    } catch (error) {
//        console.error('Local save error:', error);
//        showNotification('Failed to save graph', 'error');
//    }
//}
//
//// =====================================================
//// LOGOUT INITIALIZATION
//// =====================================================
//function initLogout() {
//    const logoutBtn = document.getElementById('logoutBtn');
//    if (logoutBtn) {
//        const newBtn = logoutBtn.cloneNode(true);
//        logoutBtn.parentNode.replaceChild(newBtn, logoutBtn);
//
//        newBtn.addEventListener('click', (e) => {
//            e.preventDefault();
//
//            // Clear localStorage
//            localStorage.removeItem('token');
//            localStorage.removeItem('userEmail');
//            localStorage.removeItem('userName');
//
//            // Redirect to home
//            window.location.href = 'index.html';
//        });
//    }
//}
//
//// =====================================================
//// GET ALGORITHM NAME
//// =====================================================
//function getAlgorithmName(algo) {
//    const names = {
//        bfs: 'Breadth-First Search (BFS)',
//        dfs: 'Depth-First Search (DFS)',
//        dijkstra: "Dijkstra's Shortest Path",
//        prim: "Prim's Minimum Spanning Tree",
//        kruskal: "Kruskal's Minimum Spanning Tree"
//    };
//    return names[algo] || algo;
//}
//
//// =====================================================
//// ADD ANIMATION STYLES
//// =====================================================
//const style = document.createElement('style');
//style.textContent = `
//    @keyframes slideInRight {
//        from {
//            transform: translateX(100%);
//            opacity: 0;
//        }
//        to {
//            transform: translateX(0);
//            opacity: 1;
//        }
//    }
//
//    @keyframes slideOutRight {
//        from {
//            transform: translateX(0);
//            opacity: 1;
//        }
//        to {
//            transform: translateX(100%);
//            opacity: 0;
//        }
//    }
//
//    .cursor-pointer {
//        cursor: pointer;
//    }
//
//    .graph-item {
//        transition: all 0.3s;
//    }
//
//    .graph-item:hover {
//        background: rgba(108, 92, 231, 0.1);
//        border-color: var(--primary-color);
//    }
//`;
//document.head.appendChild(style);
//
//console.log('✅ Dashboard.js loaded successfully');
