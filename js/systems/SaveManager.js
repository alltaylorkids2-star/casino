/* NEON ROYALE - Save Manager */
export class SaveManager {
    constructor() {
        this.saveKey = 'neon_royale_save';
    }

    /** Initialize save system */
    init() {
        // Check for existing save
        this.checkAutoSave();
    }

    /** Load saved data */
    load() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load save', e);
                return null;
            }
        }
        return null;
    }

    /** Save data */
    save(data) {
        localStorage.setItem(this.saveKey, JSON.stringify(data));
    }

    /** Reset all save data */
    reset() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
            localStorage.removeItem(this.saveKey);
            showToast('Save data reset');
        }
    }

    /** Check for auto-save */
    checkAutoSave() {
        // Auto-save on key milestones
        const data = this.load();
        if (data) {
            // Validate save structure
            const required = ['credits', 'xp', 'level'];
            const hasRequired = required.every(key => key in data);
            if (!hasRequired) {
                // Corrupted save, start fresh
                this.reset();
            }
        }
    }
}