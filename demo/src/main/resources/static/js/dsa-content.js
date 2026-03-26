// ============================================
// DSA Content JavaScript - Interactive Features
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Highlight active sidebar link
    highlightActiveLink();

    // Initialize FAQ toggles
    initFAQ();

    // Initialize code tabs
    initCodeTabs();

    // Initialize interactive demos
    initDemos();

    // Add smooth scrolling
    initSmoothScroll();

    // Add animation on scroll
    initScrollAnimations();
});

// Highlight active sidebar link based on scroll position
function highlightActiveLink() {
    const sections = document.querySelectorAll('.dsa-section');
    const navLinks = document.querySelectorAll('.sidebar-section ul li a');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.parentElement.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.parentElement.classList.add('active');
            }
        });
    });
}

// Initialize FAQ toggles
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            const isActive = item.classList.contains('active');

            // Close all other FAQs
            document.querySelectorAll('.faq-item').forEach(faq => {
                faq.classList.remove('active');
                const icon = faq.querySelector('.faq-question i');
                if (icon) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });

            // Toggle current FAQ
            if (!isActive) {
                item.classList.add('active');
                const icon = question.querySelector('i');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
}

// Initialize code tabs
function initCodeTabs() {
    window.showCode = function(lang) {
        const tabs = document.querySelectorAll('.code-tabs .tab-btn');
        const codes = document.querySelectorAll('.code-block');

        tabs.forEach(tab => tab.classList.remove('active'));
        codes.forEach(code => code.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(`${lang}-code`).classList.add('active');
    };

    window.showExample = function(type) {
        const tabs = document.querySelectorAll('.example-tabs .tab-btn');
        const examples = document.querySelectorAll('#examples .code-block');

        tabs.forEach(tab => tab.classList.remove('active'));
        examples.forEach(example => example.classList.remove('active'));

        event.target.classList.add('active');
        document.getElementById(`${type}-example`).classList.add('active');
    };
}

// Initialize interactive demos
function initDemos() {
    // BFS Demo
    window.runBFS = function() {
        const output = document.getElementById('bfs-output');
        if (!output) return;

        output.innerHTML = '';
        const steps = ['A', 'B', 'C', 'D', 'E', 'F'];
        let i = 0;

        const interval = setInterval(() => {
            if (i < steps.length) {
                output.innerHTML += steps[i] + ' ';
                i++;
            } else {
                clearInterval(interval);
            }
        }, 500);
    };

    window.resetBFS = function() {
        const output = document.getElementById('bfs-output');
        if (output) {
            output.innerHTML = 'Click "Run BFS" to start';
        }
    };

    // DFS Demo
    window.runDFS = function() {
        const output = document.getElementById('dfs-output');
        if (!output) return;

        output.innerHTML = '';
        const steps = ['A', 'B', 'D', 'E', 'C', 'F'];
        let i = 0;

        const interval = setInterval(() => {
            if (i < steps.length) {
                output.innerHTML += steps[i] + ' ';
                i++;
            } else {
                clearInterval(interval);
            }
        }, 500);
    };

    window.resetDFS = function() {
        const output = document.getElementById('dfs-output');
        if (output) {
            output.innerHTML = 'Click "Run DFS" to start';
        }
    };

    // Dijkstra Demo
    window.runDijkstra = function() {
        const output = document.getElementById('dijkstra-output');
        if (!output) return;

        output.innerHTML = '';
        const steps = [
            'Start from A (Distance: 0)',
            'Visit B (Distance: 4)',
            'Visit C (Distance: 2)',
            'Visit D (Distance: 6)',
            'Visit E (Distance: 8)',
            'Shortest path: A → C → B → D → E (Total: 8)'
        ];
        let i = 0;

        const interval = setInterval(() => {
            if (i < steps.length) {
                output.innerHTML += steps[i] + '<br>';
                i++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    };

    window.resetDijkstra = function() {
        const output = document.getElementById('dijkstra-output');
        if (output) {
            output.innerHTML = 'Click "Run Dijkstra" to start';
        }
    };
}

// Initialize smooth scrolling
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.dsa-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s, transform 0.6s';
        observer.observe(section);
    });
}

// Quiz functionality
class Quiz {
    constructor(questions) {
        this.questions = questions;
        this.currentQuestion = 0;
        this.score = 0;
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestion];
        const container = document.getElementById('quiz-container');

        if (!container) return;

        container.innerHTML = `
            <div class="quiz-question">
                <h4>Question ${this.currentQuestion + 1}: ${question.text}</h4>
                <div class="options">
                    ${question.options.map((opt, i) => `
                        <div class="option" onclick="quiz.checkAnswer(${i})">
                            ${opt}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestion];
        const options = document.querySelectorAll('.option');

        options.forEach(opt => opt.classList.remove('correct', 'wrong'));

        if (selectedIndex === question.correct) {
            options[selectedIndex].classList.add('correct');
            this.score++;
        } else {
            options[selectedIndex].classList.add('wrong');
            options[question.correct].classList.add('correct');
        }

        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.displayQuestion();
            } else {
                this.showResults();
            }
        }, 1500);
    }

    showResults() {
        const container = document.getElementById('quiz-container');
        container.innerHTML = `
            <div class="quiz-results">
                <h3>Quiz Complete!</h3>
                <p>Your score: ${this.score}/${this.questions.length}</p>
                <button onclick="location.reload()" class="btn-primary">Try Again</button>
            </div>
        `;
    }
}

// Initialize quiz if exists
const quizQuestions = [
    {
        text: "BFS mein kaunsa data structure use hota hai?",
        options: ["Stack", "Queue", "Array", "Tree"],
        correct: 1
    },
    {
        text: "BFS ka time complexity kya hai?",
        options: ["O(log n)", "O(n²)", "O(V + E)", "O(n log n)"],
        correct: 2
    }
];

const quiz = new Quiz(quizQuestions);

// Copy code functionality
function copyCode(button) {
    const codeBlock = button.previousElementSibling;
    const text = codeBlock.innerText;

    navigator.clipboard.writeText(text).then(() => {
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = 'Copy';
        }, 2000);
    });
}

// Add copy buttons to code blocks
document.querySelectorAll('.code-block').forEach(block => {
    const button = document.createElement('button');
    button.className = 'btn-outline copy-btn';
    button.textContent = 'Copy';
    button.onclick = () => copyCode(button);
    block.parentElement.insertBefore(button, block.nextSibling);
});