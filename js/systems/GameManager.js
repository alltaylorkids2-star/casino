/* NEON ROYALE - Game Manager */
export class GameManager {
    constructor() {
        this.credits = 1000; // Starting fictional arcade credits
        this.xp = 0;
        this.level = 1;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.statistics = {};
        this.gameHistory = [];
        this.maxHistory = 50;
        this.settings = {
            sound: true,
            music: true,
            difficulty: 'normal'
        };
    }

    /** Fictional arcade credits */
    getCredits() {
        return this.credits;
    }

    /** Add credits */
    addCredits(amount) {
        this.credits = Math.max(0, this.credits + amount);
        this.save();
        updateUIDisplay();
    }

    /** Spend credits */
    spendCredits(amount) {
        if (amount > this.credits) {
            return false;
        }
        this.credits -= amount;
        this.save();
        updateUIDisplay();
        return true;
    }

    /** Gain XP */
    gainXP(amount) {
        this.xp += amount;
        progressionManager.checkLevelUp();
        this.save();
        updateUIDisplay();
        showLevelUpEffect();
    }

    /** Get total games played */
    getGamesPlayed() {
        return this.gamesPlayed;
    }

    /** Increment games played */
    incrementGamesPlayed() {
        this.gamesPlayed++;
        this.save();
    }

    /** Increment games won */
    incrementGamesWon() {
        this.gamesWon++;
        this.save();
    }

    /** Set statistic */
    setStat(key, value) {
        this.statistics[key] = value;
        this.save();
    }

    /** Get statistic */
    getStat(key) {
        return this.statistics[key] || 0;
    }

    /** Add to statistic */
    addStat(key, amount) {
        this.statistics[key] = (this.statistics[key] || 0) + amount;
        this.save();
    }

    /** Record game in history */
    recordGame(gameType, result, details = {}) {
        this.gameHistory.unshift({
            id: Date.now(),
            gameType,
            result,
            details,
            timestamp: new Date().toISOString()
        });

        if (this.gameHistory.length > this.maxHistory) {
            this.gameHistory.pop();
        }
        this.save();
    }

    /** Get game history */
    getGameHistory() {
        return this.gameHistory;
    }

    /** Reset all data */
    reset() {
        this.credits = 1000;
        this.xp = 0;
        this.level = 1;
        this.gamesPlayed = 0;
        this.gamesWon = 0;
        this.statistics = {};
        this.gameHistory = [];
        this.save();
        updateUIDisplay();
    }

    /** Save state */
    save() {
        const data = {
            credits: this.credits,
            xp: this.xp,
            level: this.level,
            gamesPlayed: this.gamesPlayed,
            gamesWon: this.gamesWon,
            statistics: this.statistics,
            gameHistory: this.gameHistory,
            settings: this.settings
        };
        saveManager.save(data);
    }
}