/* NEON ROYALE - Progression Manager */
export class ProgressionManager {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        this.totalXPEarned = 0;
        this.achievements = [];
        this.unlockedCosmetics = {
            cardBacks: [],
            tableThemes: [],
            diceDesigns: [],
            machineSkins: [],
            avatarItems: []
        };
        this.titles = [];
    }

    /** Load progression data */
    load(data) {
        if (data) {
            this.xp = data.xp || 0;
            this.level = data.level || 1;
            this.xpToNextLevel = data.xpToNextLevel || 100;
            this.totalXPEarned = data.totalXPEarned || 0;
            this.achievements = data.achievements || [];
            this.unlockedCosmetics = data.unlockedCosmetics || this.unlockedCosmetics;
            this.titles = data.titles || [];
        }
        this.calculateXPToNextLevel();
    }

    /** Reset progression */
    reset() {
        this.xp = 0;
        this.level = 1;
        this.xpToNextLevel = 100;
        this.totalXPEarned = 0;
        this.achievements = [];
        this.unlockedCosmetics = {
            cardBacks: [],
            tableThemes: [],
            diceDesigns: [],
            machineSkins: [],
            avatarItems: []
        };
        this.titles = [];
        this.save();
        updateUIDisplay();
        showToast('Progress reset');
    }

    /** Save progression */
    save() {
        saveManager.save({
            xp: this.xp,
            level: this.level,
            xpToNextLevel: this.xpToNextLevel,
            totalXPEarned: this.totalXPEarned,
            achievements: this.achievements,
            unlockedCosmetics: this.unlockedCosmetics,
            titles: this.titles
        });
    }

    /** Add XP to player */
    addXP(amount, source = 'game') {
        this.xp += amount;
        this.totalXPEarned += amount;
        this.calculateXPToNextLevel();
        this.checkLevelUp();
        this.save();
        updateUIDisplay();
        showXPGainEffect(amount);
    }

    /** Calculate XP needed for next level */
    calculateXPToNextLevel() {
        // Exponential scaling: 100, 200, 400, 800, etc.
        this.xpToNextLevel = Math.floor(100 * Math.pow(1.5, this.level - 1));
    }

    /** Check for level up */
    checkLevelUp() {
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.level++;
            this.calculateXPToNextLevel();
            
            // Grant level-up rewards
            this.grantLevelUpRewards();
        }
    }

    /** Grant level-up rewards */
    grantLevelUpRewards() {
        // Add some credits
        gameManager.addCredits(50);
        
        // Check for new titles
        this.checkNewTitle();
        
        // Show level-up animation
        showLevelUpAnimation(this.level);
    }

    /** Check for new titles */
    checkNewTitle() {
        const titleData = this.getTitleForLevel(this.level);
        if (titleData && !this.titles.includes(titleData.id)) {
            this.titles.push(titleData.id);
            achievementManager.unlock({
                id: `title_${titleData.id}`,
                name: titleData.name,
                description: `Reach Level ${this.level}: ${titleData.name}`,
                type: 'title'
            });
        }
    }

    /** Get title for level */
    getTitleForLevel(level) {
        const titles = [
            { id: 'rookie', name: 'Rookie', minLevel: 1 },
            { id: 'high_roller', name: 'High Roller', minLevel: 5 },
            { id: 'vip', name: 'VIP', minLevel: 10 },
            { id: 'casino_master', name: 'Casino Master', minLevel: 25 },
            { id: 'legend', name: 'Legend', minLevel: 50 }
        ];
        
        const title = titles.find(t => t.minLevel <= level && !this.titles.includes(t.id));
        return title || null;
    }

    /** Get current title */
    getCurrentTitle() {
        const title = this.getTitleForLevel(this.level);
        return title ? title.name : 'Rookie';
    }

    /** Get level display */
    getLevelDisplay() {
        return {
            level: this.level,
            xp: this.xp,
            xpNeeded: this.xpToNextLevel,
            percent: (this.xp / this.xpToNextLevel) * 100
        };
    }
}