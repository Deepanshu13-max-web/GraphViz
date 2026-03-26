
// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
// Check if user is already logged in
const token = localStorage.getItem('token');
if (token && window.location.pathname.includes('login.html' || 'signup.html')) {
window.location.href = 'dashboard.html';
}
// Initialize forms
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
if (loginForm) {
initLoginForm();
}
if (signupForm) {
initSignupForm();
initPasswordStrength();
}
});
function initLoginForm() {
const form = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
form.addEventListener('submit', async (e) => {
e.preventDefault();
// Show loading state
loginBtn.classList.add('loading');
loginBtn.disabled = true;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
try {
const response = await fetch('http://localhost:8080/api/auth/login', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ email, password })
});
const data = await response.json();
if (response.ok) {
// Store token and user info
localStorage.setItem('token', data.token);
localStorage.setItem('userEmail', data.email);
// Show success message
showNotification('Login successful! Redirecting...', 'success');
// Redirect to dashboard
setTimeout(() => {
window.location.href = 'dashboard.html';
}, 1500);
} else {
showNotification(data.error || 'Login failed', 'error');
loginBtn.classList.remove('loading');
loginBtn.disabled = false;
}
} catch (error) {
showNotification('Network error. Please try again.', 'error');
loginBtn.classList.remove('loading');
loginBtn.disabled = false;
}
});
// Add floating label effect
const inputs = document.querySelectorAll('.form-group input');
inputs.forEach(input => {
input.addEventListener('focus', () => {
input.parentElement.classList.add('focused');
});
input.addEventListener('blur', () => {
if (!input.value) {
input.parentElement.classList.remove('focused');
}
});
});
}
function initSignupForm() {
const form = document.getElementById('signupForm');
const signupBtn = document.getElementById('signupBtn');
form.addEventListener('submit', async (e) => {
e.preventDefault();
const name = document.getElementById('name').value;
const email = document.getElementById('email').value;
const password = document.getElementById('password').value;
const confirmPassword = document.getElementById('confirmPassword').value;
// Validate passwords match
if (password !== confirmPassword) {
showNotification('Passwords do not match', 'error');
return;
}
// Validate password strength
const strength = checkPasswordStrength(password);
if (strength === 'weak') {
showNotification('Password is too weak', 'error');
return;
}
// Show loading state
signupBtn.classList.add('loading');
signupBtn.disabled = true;
try {
const response = await fetch('http://localhost:8080/api/auth/signup', {
method: 'POST',
headers: {
'Content-Type': 'application/json'
},
body: JSON.stringify({ name, email, password })
});
const data = await response.json();
if (response.ok) {
showNotification('Account created successfully! Please login.', 'success');
// Redirect to login page
setTimeout(() => {
window.location.href = 'login.html';
}, 2000);
} else {
showNotification(data.error || 'Signup failed', 'error');
signupBtn.classList.remove('loading');
signupBtn.disabled = false;
}
} catch (error) {
console.error('Error name:',error.name);
console.error('Error message:',error.message);

showNotification('Network error. Please try again.', 'error');
signupBtn.classList.remove('loading');
signupBtn.disabled = false;
}
});
}
function initPasswordStrength() {
const passwordInput = document.getElementById('password');
const strengthBar = document.querySelector('.strength-bar');
if (!passwordInput || !strengthBar) return;
passwordInput.addEventListener('input', () => {
const strength = checkPasswordStrength(passwordInput.value);
strengthBar.className = 'strength-bar';
if (passwordInput.value.length > 0) {
strengthBar.classList.add(strength);
}
});
}
function checkPasswordStrength(password) {
let score = 0;
// Length check
if (password.length >= 8) score++;
if (password.length >= 12) score++;
// Complexity checks
if (/[A-Z]/.test(password)) score++;
if (/[0-9]/.test(password)) score++;
if (/[^A-Za-z0-9]/.test(password)) score++;
if (score <= 2) return 'weak';
if (score <= 4) return 'medium';
return 'strong';
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