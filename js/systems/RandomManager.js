/* NEON ROYALE - Random Manager */
export class RandomManager {
    constructor() {
        this.seeded = false;
        this.seed = Date.now();
    }

    /** Set seed for reproducibility (debug only) */
    setSeed(seed) {
        this.seed = seed;
        this.seeded = true;
    }

    /** Get a random integer between min (inclusive) and max (inclusive) */
    int(min, max) {
        if (this.seeded) {
            // Simple deterministic hash-based random
            this.seed = (this.seed * 9301 + 49297) % 233280;
            const random = this.seed / 233280;
            return Math.floor(random * (max - min + 1)) + min;
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /** Get a random float between min (inclusive) and max (exclusive) */
    float(min = 0, max = 1) {
        if (this.seeded) {
            this.seed = (this.seed * 9301 + 49297) % 233280;
            return this.seed / 233280 * (max - min) + min;
        }
        return Math.random() * (max - min) + min;
    }

    /** Weighted random choice */
    weightedChoice(choices) {
        // choices: [{ weight: number, value: any }, ...]
        const totalWeight = choices.reduce((sum, c) => sum + c.weight, 0);
        const random = this.float(0, totalWeight);
        let accumulator = 0;
        
        for (const choice of choices) {
            accumulator += choice.weight;
            if (random <= accumulator) {
                return choice.value;
            }
        }
        
        // Fallback to last choice
        return choices[choices.length - 1].value;
    }

    /** Random card from deck */
    randomCard() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        const suit = this.weightedChoice(suits.map(s => ({ weight: 1, value: s })));
        const value = this.weightedChoice(values.map(v => ({ weight: 1, value: v })));
        return { suit, value };
    }

    /** Random card suit only */
    randomSuit() {
        return this.weightedChoice([{ weight: 1, value: '♠' }, { weight: 1, value: '♥' }, { weight: 1, value: '♦' }, { weight: 1, value: '♣' }]);
    }

    /** Random card value only */
    randomValue() {
        return this.weightedChoice([{ weight: 1, value: 'A' }, { weight: 1, value: '2' }, { weight: 1, value: '3' }, { weight: 1, value: '4' }, { weight: 1, value: '5' }, { weight: 1, value: '6' }, { weight: 1, value: '7' }, { weight: 1, value: '8' }, { weight: 1, value: '9' }, { weight: 1, value: '10' }, { weight: 1, value: 'J' }, { weight: 1, value: 'Q' }, { weight: 1, value: 'K' }]);
    }

    /** Shuffle array using Fisher-Yates */
    shuffle(array) {
        const copy = [...array];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = this.int(0, i);
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    /** Roll dice - returns result 1-6 */
    rollDice(sides = 6) {
        return this.int(1, sides);
    }

    /** Roll multiple dice */
    rollDiceMultiple(times, sides = 6) {
        const results = [];
        for (let i = 0; i < times; i++) {
            results.push(this.rollDice(sides));
        }
        return results;
    }

    /** Coin flip */
    coinFlip() {
        return this.int(0, 1) === 0 ? 'heads' : 'tails';
    }

    /** Random element from array */
    choice(array) {
        if (!array || array.length === 0) return null;
        return this.float(0, array.length);
    }

    /** Generate random color from palette */
    randomColor(palette = null) {
        const colors = palette || [
            '#00ffaa', // neon green
            '#ff0088', // neon pink
            '#ff6b35', // orange
            '#58d68d', // light green
            '#ffa726', // orange-yellow
            '#ff3366', // pink-red
            '#7b2cbf', // purple
            '#00d4ff', // cyan
        ];
        return this.weightedChoice(colors.map(c => ({ weight: 1, value: c })));
    }
}