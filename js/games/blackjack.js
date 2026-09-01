/* NEON ROYALE - Blackjack Game */
import { gameManager } from '../main.js';
import { audioManager } from '../main.js';
import { randomManager } from '../systems/RandomManager.js';
import { progressionManager } from '../systems/ProgressionManager.js';

export class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.isPlaying = false;
        this.isBlackjack = false;
        this.bet = 0;
        this.gameOver = false;
        this.canHit = true;
    }

    /** Initialize the game - works with existing HTML structure */
    init(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // Store references to existing elements (already in HTML)
        this.cardElements = {
            player: document.getElementById('player-hand'),
            dealer: document.getElementById('dealer-hand')
        };
        this.betElement = document.querySelector('.bet-input');
        this.resultElement = document.getElementById('result-message');
        this.betDisplay = document.querySelector('.bet-display');
        this.dealerTotal = document.getElementById('dealer-total');
        this.playerTotal = document.getElementById('player-total');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start a new round
        this.newRound();
    }

    /** Start a new round */
    newRound() {
        // Reset hands
        this.playerHand = [];
        this.dealerHand = [];
        this.isPlaying = true;
        this.isBlackjack = false;
        this.gameOver = false;
        this.canHit = true;
        
        // Create and shuffle deck
        this.deck = this.createDeck();
        this.shuffleDeck();
        
        // Deal cards
        this.dealCards();
    }

    /** Create a standard 52-card deck */
    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const deck = [];
        
        suits.forEach(suit => {
            values.forEach(value => {
                deck.push({ suit, value });
            });
        });
        
        return deck;
    }

    /** Shuffle deck using Fisher-Yates */
    shuffleDeck() {
        this.deck = randomManager.shuffle(this.deck);
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
        
        this.bet = betAmount;
        updateBetDisplay();
        this.dealCards();
    }

    /** Deal initial cards */
    dealCards() {
        if (this.deck.length < 4) {
            showToast('Shuffling deck...');
            this.shuffleDeck();
        }
        
        // Deal two cards to player
        this.playerHand.push(this.deck.pop());
        this.playerHand.push(this.deck.pop());
        
        // Deal two cards to dealer
        this.dealerHand.push(this.deck.pop());
        this.dealerHand.push(this.deck.pop());
        
        // Update display
        this.updateDisplay();
        
        // Check for blackjacks
        this.checkBlackjack();
    }

    /** Update display */
    updateDisplay() {
        // Update player hand
        this.renderHand(this.cardElements.player, this.playerHand, false);
        
        // Update dealer hand (hide first card)
        this.renderHand(this.cardElements.dealer, this.dealerHand, true);
        
        // Update totals
        const playerTotal = this.calculateHandTotal(this.playerHand);
        const dealerTotal = this.calculateDealerTotal(this.dealerHand);
        
        if (this.playerTotal) this.playerTotal.textContent = playerTotal;
        if (this.dealerTotal) this.dealerTotal.textContent = this.gameOver ? dealerTotal : '?';
        
        // Enable/disable controls
        this.updateControls();
    }

    /** Render a hand of cards */
    renderHand(container, cards, hideFirst = false) {
        if (!container) return;
        
        let html = '';
        cards.forEach((card, index) => {
            const show = index > 0 || !hideFirst;
            html += `<div class="card ${show ? '' : 'face-down'}" data-value="${card.value}" data-suit="${card.suit}">
                <div class="card-face front">
                    <span class="suit">${card.suit}</span>
                    <span class="value">${card.value}</span>
                </div>
                <div class="card-face back">
                    <span>NEON</span>
                </div>
            </div>`;
        });
        
        container.innerHTML = html;
        
        // Add card flip animations
        setTimeout(() => {
            const cards = container.querySelectorAll('.card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.transform = 'rotateY(0)';
                    card.style.transition = 'transform 0.3s ease';
                }, index * 100);
            });
        }, 100);
    }

    /** Calculate hand total */
    calculateHandTotal(hand) {
        let total = 0;
        let aceCount = 0;
        
        hand.forEach(card => {
            const value = card.value;
            if (value === 'A') {
                total += 11;
                aceCount++;
            } else if (['J', 'Q', 'K'].includes(value)) {
                total += 10;
            } else {
                total += parseInt(value);
            }
        });
        
        // Adjust for aces if bust
        while (total > 21 && aceCount > 0) {
            total -= 10;
            aceCount--;
        }
        
        return total;
    }

    /** Calculate dealer total (shows hard total for face-down card) */
    calculateDealerTotal(hand) {
        // If only one card is showing (first card hidden), calculate based on visible card only
        if (hand.length === 1) {
            const value = hand[0].value;
            if (value === 'A') return 11;
            if (['J', 'Q', 'K'].includes(value)) return 10;
            return parseInt(value);
        }
        return this.calculateHandTotal(hand);
    }

    /** Check for blackjack */
    checkBlackjack() {
        const playerTotal = this.calculateHandTotal(this.playerHand);
        const dealerTotal = this.calculateDealerTotal(this.dealerHand);
        
        const playerBlackjack = playerTotal === 21 && this.playerHand.length === 2;
        const dealerBlackjack = dealerTotal === 21 && this.dealerHand.length === 2;
        
        if (playerBlackjack && dealerBlackjack) {
            // Push
            gameManager.addCredits(this.bet);
            this.showResult(`Both have blackjack. Push - you get your ${this.bet} credits back.`, 0);
            this.gameOver = true;
            this.canHit = false;
            this.updateControls();
            gameManager.recordGame('blackjack', 'push', { push: true, bet: this.bet });
            gameManager.gainXP(10);
        } else if (playerBlackjack && !dealerBlackjack) {
            // Player blackjack - pays 3:2
            const creditGain = Math.round(this.bet * 1.5);
            gameManager.addCredits(creditGain);
            gameManager.incrementGamesWon();
            this.showResult(`Blackjack! You won ${creditGain} credits (3:2 payout)`, creditGain);
            this.gameOver = true;
            this.canHit = false;
            this.updateControls();
            gameManager.recordGame('blackjack', 'win', { blackjack: true, bet: this.bet });
            gameManager.gainXP(20);
        } else if (!playerBlackjack && dealerBlackjack) {
            // Dealer blackjack
            this.showResult(`Dealer has blackjack. You lost ${this.bet} credits.`, 0);
            gameManager.addCredits(0);
            this.gameOver = true;
            this.canHit = false;
            this.updateControls();
            gameManager.recordGame('blackjack', 'lose', { dealerBlackjack: true, bet: this.bet });
            gameManager.gainXP(10);
        }
    }

    /** Handle blackjack result (for other scenarios) */
    handleBlackjackResult(message, creditChange) {
        this.showResult(message, Math.abs(creditChange));
        if (creditChange > 0) {
            gameManager.addCredits(creditChange);
            gameManager.incrementGamesWon();
        } else {
            gameManager.addCredits(creditChange);
        }
        this.gameOver = true;
        this.canHit = false;
        this.updateControls();
        
        // Record game
        const won = creditChange > 0;
        gameManager.recordGame('blackjack', won ? 'win' : 'lose', { bet: this.bet });
        gameManager.gainXP(won ? 15 : 10);
    }

    /** Hit - take another card */
    hit() {
        if (!this.canHit || this.gameOver) return;
        
        // Add card to player hand
        this.playerHand.push(this.deck.pop());
        
        // Update display
        this.updateDisplay();
        
        // Check for bust
        const playerTotal = this.calculateHandTotal(this.playerHand);
        if (playerTotal > 21) {
            this.bust();
        }
    }

    /** Player busts */
    bust() {
        this.gameOver = true;
        this.canHit = false;
        
        const message = `Bust! You went over 21. Lost ${this.bet} credits.`;
        this.showResult(message, 0);
        gameManager.addCredits(0);
        gameManager.incrementGamesPlayed();
        gameManager.recordGame('blackjack', 'lose', { bust: true, bet: this.bet });
        gameManager.gainXP(10);
        
        this.updateControls();
    }

    /** Stand - end player turn */
    stand() {
        this.canHit = false;
        this.gameOver = true;
        
        // Dealer plays
        setTimeout(() => {
            this.dealerPlay();
        }, 1000);
    }

    /** Dealer plays */
    dealerPlay() {
        let dealerTotal = this.calculateHandTotal(this.dealerHand);
        
        while (dealerTotal < 17) {
            this.dealerHand.push(this.deck.pop());
            dealerTotal = this.calculateHandTotal(this.dealerHand);
        }
        
        // Update display
        this.updateDisplay();
        
        // Determine winner
        const playerTotal = this.calculateHandTotal(this.playerHand);
        
        if (dealerTotal > 21) {
            // Dealer busts
            const message = `Dealer busts! You win ${this.bet} credits!`;
            this.showResult(message, this.bet);
            gameManager.addCredits(this.bet);
            gameManager.incrementGamesWon();
            gameManager.recordGame('blackjack', 'win', { dealerBust: true, bet: this.bet });
            gameManager.gainXP(15);
        } else if (dealerTotal > playerTotal) {
            // Dealer wins
            const message = `Dealer wins. You lost ${this.bet} credits.`;
            this.showResult(message, 0);
            gameManager.recordGame('blackjack', 'lose', { dealerWins: true, bet: this.bet });
            gameManager.gainXP(10);
        } else if (dealerTotal < playerTotal) {
            // Player wins
            const message = `You win ${this.bet} credits!`;
            this.showResult(message, this.bet);
            gameManager.addCredits(this.bet);
            gameManager.incrementGamesWon();
            gameManager.recordGame('blackjack', 'win', { playerWins: true, bet: this.bet });
            gameManager.gainXP(15);
        } else {
            // Push
            const message = `Push - you get your ${this.bet} credits back.`;
            this.showResult(message, 0);
            gameManager.addCredits(this.bet);
            gameManager.recordGame('blackjack', 'push', { push: true, bet: this.bet });
        }
        
        this.updateControls();
    }

    /** Update controls state */
    updateControls() {
        const hitBtn = document.querySelector('.hit-btn');
        const standBtn = document.querySelector('.stand-btn');
        const newRoundBtn = document.querySelector('.new-round-btn');
        
        if (hitBtn) {
            hitBtn.disabled = !this.canHit || this.gameOver;
        }
        if (standBtn) {
            standBtn.disabled = !this.canHit || this.gameOver;
        }
        if (newRoundBtn) {
            newRoundBtn.style.display = this.gameOver ? 'block' : 'none';
        }
    }

    /** Show result message */
    setupEventListeners() {
        const hitBtn = document.querySelector(".hit-btn");
        const standBtn = document.querySelector(".stand-btn");
        const newRoundBtn = document.querySelector(".new-round-btn");
        
        if (hitBtn) {
            hitBtn.addEventListener("click", () => this.hit());
        }
        
        if (standBtn) {
            standBtn.addEventListener("click", () => this.stand());
        }
        
        if (newRoundBtn) {
            newRoundBtn.addEventListener("click", () => this.newRound());
        }
    },

    showResult(message, creditGain) {
        if (!this.resultElement) return;
        
        this.resultElement.textContent = message;
        this.resultElement.style.opacity = '1';
        
        if (this.betDisplay) {
            this.betDisplay.textContent = creditGain > 0 ? `+${creditGain}` : `-${this.bet}`;
        }
        
        // Fade out result
        setTimeout(() => {
            if (this.resultElement) {
                this.resultElement.style.opacity = '0';
            }
        }, 3000);
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