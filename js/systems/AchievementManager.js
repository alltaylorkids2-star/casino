/* NEON ROYALE - Achievement Manager */
export class AchievementManager {
    constructor() {
        this.achievements = [];
        this.unlockedAchievements = [];
    }

    /** Load achievements */
    load(data) {
        if (data) {
            this.achievements = data.achievements || [];
            this.unlockedAchievements = data.unlockedAchievements || [];
        }
    }

    /** Save achievements */
    save() {
        saveManager.save({
            achievements: this.achievements,
            unlockedAchievements: this.unlockedAchievements
        });
    }

    /** Check and unlock achievement */
    checkUnlock(achievementId, progressData = {}) {
        // Check if already unlocked
        if (this.unlockedAchievements.includes(achievementId)) {
            return false;
        }

        // Get achievement definition
        const definition = this.getAchievementDefinition(achievementId);
        if (!definition) return false;

        // Check progress conditions
        let unlocked = false;
        
        switch (achievementId) {
            case 'first_win':
                unlocked = gameManager.getGamesWon() >= 1;
                break;
            case 'first_game':
                unlocked = gameManager.getGamesPlayed() >= 1;
                break;
            case 'win_3_rounds':
                unlocked = gameManager.getGamesWon() >= 3;
                break;
            case 'play_5_games':
                unlocked = gameManager.getGamesPlayed() >= 5;
                break;
            case 'win_10_rounds':
                unlocked = gameManager.getGamesWon() >= 10;
                break;
            case 'play_20_games':
                unlocked = gameManager.getGamesPlayed() >= 20;
                break;
            case 'level_5':
                unlocked = progressionManager.level >= 5;
                break;
            case 'level_10':
                unlocked = progressionManager.level >= 10;
                break;
            case 'level_25':
                unlocked = progressionManager.level >= 25;
                break;
            case 'credits_1000':
                unlocked = gameManager.getCredits() >= 1000;
                break;
            case 'credits_5000':
                unlocked = gameManager.getCredits() >= 5000;
                break;
            case 'streak_3':
                // Would need streak tracking
                unlocked = false; // Placeholder
                break;
            default:
                // Generic progress check
                unlocked = this.checkGenericProgress(achievementId, progressData);
                break;
        }

        if (unlocked) {
            this.unlock(achievementId, definition);
            return true;
        }

        return false;
    }

    /** Unlock achievement */
    unlock(achievementId, definition) {
        this.unlockedAchievements.push(achievementId);

        // Add to achievements collection
        const existing = this.achievements.find(a => a.id === achievementId);
        if (!existing) {
            this.achievements.push({
                id: achievementId,
                unlockedAt: new Date().toISOString(),
                ...definition
            });
        }

        this.save();
        showAchievementPopup(achievementId, definition);
    }

    /** Get achievement definition */
    getAchievementDefinition(achievementId) {
        const definitions = {
            'first_win': {
                name: 'First Victory',
                description: 'Win your first arcade round',
                icon: 'trophy',
                rarity: 'common'
            },
            'first_game': {
                name: 'First Play',
                description: 'Play your first game',
                icon: 'dice',
                rarity: 'common'
            },
            'win_3_rounds': {
                name: 'Win Streak Beginner',
                description: 'Win 3 arcade rounds',
                icon: 'trophy',
                rarity: 'common'
            },
            'play_5_games': {
                name: 'Game Explorer',
                description: 'Play 5 different games',
                icon: 'games',
                rarity: 'common'
            },
            'win_10_rounds': {
                name: 'Win Streak',
                description: 'Win 10 arcade rounds',
                icon: 'trophy',
                rarity: 'rare'
            },
            'play_20_games': {
                name: 'Arcade Regular',
                description: 'Play 20 arcade rounds',
                icon: 'games',
                rarity: ' uncommon'
            },
            'level_5': {
                name: 'High Roller',
                description: 'Reach Level 5',
                icon: 'star',
                rarity: 'rare'
            },
            'level_10': {
                name: 'VIP',
                description: 'Reach Level 10',
                icon: 'star',
                rarity: 'epic'
            },
            'level_25': {
                name: 'Casino Master',
                description: 'Reach Level 25',
                icon: 'star',
                rarity: 'legendary'
            },
            'credits_1000': {
                name: 'Wealthy Beginner',
                description: 'Accumulate 1,000 arcade credits',
                icon: 'chip',
                rarity: 'common'
            },
            'credits_5000': {
                name: 'High Roller',
                description: 'Accumulate 5,000 arcade credits',
                icon: 'chip',
                rarity: 'rare'
            }
        };

        return definitions[achievementId] || null;
    }

    /** Check generic progress */
    checkGenericProgress(achievementId, progressData) {
        // Generic progress checking for custom achievements
        return false;
    }

    /** Get all unlocked achievements */
    getUnlocked() {
        return this.unlockedAchievements;
    }

    /** Get all achievements */
    getAll() {
        return this.achievements;
    }
}