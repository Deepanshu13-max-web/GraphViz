
// js/landing.js
document.addEventListener('DOMContentLoaded', () => {
initPreviewCanvas();
initScrollAnimations();
});
function initPreviewCanvas() {
const canvas = document.getElementById('previewCanvas');
if (!canvas) return;
const ctx = canvas.getContext('2d');
const container = canvas.parentElement;
// Set canvas size
canvas.width = container.clientWidth;
canvas.height = container.clientHeight;
// Create sample graph
const nodes = [
{ x: 150, y: 150 },
{ x: 350, y: 150 },
{ x: 250, y: 300 },
{ x: 100, y: 300 },
{ x: 400, y: 300 }
];
const edges = [
[0, 1], [1, 2], [2, 0], [2, 3], [1, 4], [3, 4]
];
// Animation variables
let time = 0;
const colors = ['#6c5ce7', '#00cec9', '#ff6b6b', '#f39c12', '#51cf66'];
function animate() {
ctx.clearRect(0, 0, canvas.width, canvas.height);
time += 0.01;
// Draw edges
ctx.strokeStyle = '#4a4a6a';
ctx.lineWidth = 2;
edges.forEach(edge => {
ctx.beginPath();
ctx.moveTo(nodes[edge[0]].x, nodes[edge[0]].y);
ctx.lineTo(nodes[edge[1]].x, nodes[edge[1]].y);
ctx.stroke();
});
// Draw nodes with pulsing animation
nodes.forEach((node, i) => {
const pulse = Math.sin(time * 2 + i) * 0.1 + 0.9;
const radius = 25 * pulse;
ctx.beginPath();
ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
ctx.fillStyle = colors[i % colors.length];
ctx.fill();
ctx.strokeStyle = '#ffffff';
ctx.lineWidth = 2;
ctx.stroke();
// Draw node number
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 14px Inter';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText((i + 1).toString(), node.x, node.y);
});
requestAnimationFrame(animate);
}
animate();
}
function initScrollAnimations() {
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.opacity = '1';
entry.target.style.transform = 'translateY(0)';
}
});
}, { threshold: 0.1 });
document.querySelectorAll('.feature-card').forEach(card => {
card.style.opacity = '0';
card.style.transform = 'translateY(30px)';
card.style.transition = 'opacity 0.6s, transform 0.6s';
observer.observe(card);
});
}