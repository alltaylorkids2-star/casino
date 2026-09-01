/* NEON ROYALE - Roulette Game */
import { gameManager } from '../main.js';
import { audioManager } from '../main.js';
import { randomManager } from '../systems/RandomManager.js';
import { progressionManager } from '../systems/ProgressionManager.js';

export class RouletteGame {
    constructor() {
        this.wheelElements = null;
        this.ballElement = null;
        this.resultElement = null;
        this.betElement = null;
        this.creditsDisplay = null;
        
        this.currentBet = 0;
        this.currentMode = 'color'; // color, odd_even, high_low, exact
        this.betOptions = [];
    }

    /** Initialize the roulette game */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Store references to elements
        this.wheelElements = {
            wheel: container.querySelector('.roulette-wheel'),
            ball: container.querySelector('.roulette-ball')
        };
        this.betElement = container.querySelector('.bet-input');
        this.resultElement = container.querySelector('.result-message');
        this.creditsDisplay = container.querySelector('.credits .value');
        
        // Set up challenge mode buttons
        this.setupModeButtons();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize wheel segments
        this.initializeWheel();
    }

    /** Set up challenge mode buttons */
    setupModeButtons() {
        const modeButtons = document.querySelectorAll('.mode-btn');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Update active mode
                modeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                this.currentMode = btn.getAttribute('data-mode');
            });
        });
    }

    /** Set up event listeners */
    setupEventListeners() {
        const placeBetBtn = document.querySelector('.place-bet-btn');
        const spinBtn = document.querySelector('.spin-btn');
        const newRoundBtn = document.querySelector('.new-round-btn');
        
        if (placeBetBtn) {
            placeBetBtn.addEventListener('click', () => this.placeBet());
        }
        
        if (spinBtn) {
            spinBtn.addEventListener('click', () => this.spin());
        }
        
        if (newRoundBtn) {
            newRoundBtn.addEventListener('click', () => this.newRound());
        }
    }

    /** Initialize wheel segments */
    initializeWheel() {
        const wheel = this.wheelElements.wheel;
        if (!wheel) return;
        
        // Create 12 segments (numbers 1-12 with colors)
        const segments = [
            { value: 1, color: 'red' },
            { value: 2, color: 'black' },
            { value: 3, color: 'red' },
            { value: 4, color: 'black' },
            { value: 5, color: 'red' },
            { value: 6, color: 'black' },
            { value: 7, color: 'red' },
            { value: 8, color: 'black' },
            { value: 9, color: 'red' },
            { value: 10, color: 'black' },
            { value: 11, color: 'red' },
            { value: 12, color: 'black' }
        ];
        
        let html = '';
        segments.forEach((segment, index) => {
            const angle = (360 / segments.length) * index;
            html += `<div class="segment" style="--angle: ${angle}deg;" data-value="${segment.value}" data-color="${segment.color}"></div>`;
        });
        
        wheel.innerHTML = html;
    }

    /** Place a bet */
    placeBet() {
        if (!this.betElement) return;
        
        const betAmount = parseInt(this.betElement.value) || 0;
        if (betAmount <= 0 || betAmount > gameManager.getCredits()) {
            showToast('Invalid bet amount');
            return;
        }
        
        // Spend credits
        if (!gameManager.spendCredits(betAmount)) {
            showToast('Not enough credits!');
            return;
        }
        
        this.currentBet = betAmount;
        updateBetDisplay();
        showToast(`Bet placed: ${betAmount} credits`);
    }

    /** Spin the wheel */
    spin() {
        if (!this.wheelElements || !this.wheelElements.wheel) return;
        
        // Show "spinning" state
        this.wheelElements.wheel.style.transition = 'transform 3s ease';
        
        // Determine result based on mode
        const result = this.determineResult();
        
        // Rotate wheel to result
        const segmentCount = 12;
        const rotateDeg = result.index * (360 / segmentCount) - 90; // -90 to start from top
        this.wheelElements.wheel.style.transform = `rotate(${rotateDeg}deg)`;
        
        // Show result after animation
        setTimeout(() => {
            this.showResult(result);
        }, 3000);
    }

    /** Determine result based on current mode */
    determineResult() {
        // Get all wheel segments
        const segments = document.querySelectorAll('.segment');
        const winningSegment = segments[randomManager.int(0, segments.length - 1)];
        
        const value = parseInt(winningSegment.getAttribute('data-value'));
        const color = winningSegment.getAttribute('data-color');
        
        // Calculate game result based on mode
        let resultInfo = { index: -1, value, color, win: false, message: '' };
        
        switch (this.currentMode) {
            case 'color':
                const playerColor = document.querySelector('.mode-btn.active') 
                    ? document.querySelector('.mode-btn.active').getAttribute('data-color') 
                    : 'red';
                resultInfo.win = color === playerColor;
                resultInfo.message = resultInfo.win ? `Ball landed on ${color}! You win ${this.currentBet} credits!` : `Ball landed on ${color}. You lost ${this.currentBet} credits.`;
                break;
                
            case 'odd_even':
                const isOdd = value % 2 !== 0;
                resultInfo.win = isOdd; // Simplified: bet on odd
                resultInfo.message = resultInfo.win ? `Ball landed on ${value} (odd)! You win ${this.currentBet} credits!` : `Ball landed on ${value} (even). You lost ${this.currentBet} credits.`;
                break;
                
            case 'high_low':
                resultInfo.win = value >= 7; // High is 8-12, low is 1-6
                resultInfo.message = resultInfo.win ? `Ball landed on ${value} (high)! You win ${this.currentBet} credits!` : `Ball landed on ${value} (low). You lost ${this.currentBet} credits.`;
                break;
                
            case 'exact':
                // For exact number, just use the winning value
                resultInfo.win = true; // Always win for simplicity in demo
                resultInfo.message = `Ball landed on ${value}! You win ${this.currentBet * 5} credits!`;
                break;
        }
        
        // Apply credits if won
        if (resultInfo.win && this.currentBet > 0) {
            gameManager.addCredits(resultInfo.message.includes('win') ? this.currentBet : -this.currentBet);
            progressionManager.addXP(15);
            gameManager.gainXP(15);
        }
        
        return { ...resultInfo, winningValue: value, winningColor: color };
    }

    /** Show result message */
    showResult(resultInfo) {
        if (!this.resultElement) return;
        
        this.resultElement.textContent = resultInfo.message;
        this.resultElement.style.opacity = '1';
        
        // Fade out result
        setTimeout(() => {
            if (this.resultElement) {
                this.resultElement.style.opacity = '0';
            }
        }, 3000);
        
        // Update credits display
        if (this.creditsDisplay) {
            this.creditsDisplay.textContent = gameManager.getCredits();
        }
    }
    
    /** Start a new round */
    newRound() {
        // Reset wheel
        if (this.wheelElements && this.wheelElements.wheel) {
            this.wheelElements.wheel.style.transition = 'none';
            this.wheelElements.wheel.style.transform = 'rotate(0deg)';
        }
        
        // Show bet prompt
        showToast('Place your bets for the next spin!');
    }
}

/* Helper function */
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
        from { opacity: 0; transform: translateX(-50%) translateY(10px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    .toast { opacity: 1; transition: opacity 0.3s ease; }
`;
document.head.appendChild(style);