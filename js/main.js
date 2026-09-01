/* NEON ROYALE - Main Game System */
import { GameManager } from './js/systems/GameManager.js';
import { AudioManager } from './js/systems/AudioManager.js';
import { SaveManager } from './js/systems/SaveManager.js';
import { ProgressionManager } from './js/systems/ProgressionManager.js';
import { RandomManager } from './js/systems/RandomManager.js';
import { AchievementManager } from './js/systems/AchievementManager.js';

/* Initialize systems */
const gameManager = new GameManager();
const audioManager = new AudioManager();
const saveManager = new SaveManager();
const progressionManager = new ProgressionManager();
const randomManager = new RandomManager();
const achievementManager = new AchievementManager();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize save system
    saveManager.init();
    
    // Load saved data
    const savedData = saveManager.load();
    if (savedData) {
        progressionManager.load(savedData.progression);
        gameManager.load(savedData.gameState);
    }
    
    // Update UI
    updateUI();
    
    // Set up event listeners
    setupEventListeners();
    
    // Start ambient music
    audioManager.playAmbient();
});

// Update UI based on current state
function updateUI() {
    const credits = gameManager.getCredits();
    const level = progressionManager.getLevel();
    const xp = progressionManager.getXP();
    const xpNeeded = progressionManager.getXPNeeded();
    
    // Update dashboard
    const creditDisplay = document.querySelector('.credits .value');
    if (creditDisplay) {
        creditDisplay.textContent = credits.toLocaleString();
    }
    
    // Update XP bar
    const xpFill = document.querySelector('.xp-bar .fill');
    if (xpFill) {
        const percent = (xp / xpNeeded) * 100;
        xpFill.style.width = `${percent}%`;
    }
    
    // Update level display
    const levelDisplay = document.querySelectorAll('.status-item .value');
    if (levelDisplay.length >= 2) {
        levelDisplay[0].textContent = level;
        levelDisplay[1].textContent = xpNeeded;
    }
}

// Set up all event listeners
function setupEventListeners() {
    // Navigation
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const section = link.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Play Now button
    const playBtn = document.querySelector('.play-now');
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            navigateToSection('games');
        });
    }
    
    // Reset save data
    const resetBtn = document.querySelector('.reset-save');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
                saveManager.reset();
                progressionManager.reset();
                gameManager.reset();
                updateUI();
                showToast('Save data reset successfully');
            }
        });
    }
    
    // Settings toggle
    const settingsBtn = document.querySelector('.settings-toggle');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const modal = document.querySelector('.modal-overlay');
            if (modal) {
                modal.classList.toggle('active');
            }
        });
    }
    
    // Close modal on overlay click
    const modalOverlay = document.querySelector('.modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }
}

/* Navigation */
function navigateToSection(section) {
    // In a full implementation, this would show the appropriate game section
    showGameSection(section);
    showToast(`Navigating to ${section}`);
}

function showGameSection(section) {
    // Hide all game sections
    const sections = document.querySelectorAll('.game-section');
    sections.forEach(s => s.classList.add('hidden'));
    
    // Show selected section
    const selected = document.querySelector(`.game-section.${section}`);
    if (selected) {
        selected.classList.remove('hidden');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav a[data-section="${section}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

/* Toast notification */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--card);
        border: 1px solid var(--border);
        padding: 12px 24px;
        border-radius: 8px;
        color: var(--fg);
        font-family: 'Orbitron', sans-serif;
        z-index: 200;
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* Add toast styles */
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    .toast {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

// Export for testing
window.NEON = {
    gameManager,
    audioManager,
    saveManager,
    progressionManager,
    randomManager,
    achievementManager,
    updateUI,
    showToast
};