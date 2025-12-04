/**
 * Storage Module
 * Wraps localStorage to handle JSON serialization and providing defaults.
 */
const Storage = {
    /**
     * Get a value from localStorage.
     * @param {string} key - The key to retrieve.
     * @param {*} defaultValue - The value to return if key doesn't exist.
     * @returns {*} The parsed value or default.
     */
    get(key, defaultValue) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error(`Error getting key ${key} from storage:`, e);
            return defaultValue;
        }
    },

    /**
     * Set a value in localStorage.
     * @param {string} key - The key to set.
     * @param {*} value - The value to store (will be JSON stringified).
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error setting key ${key} to storage:`, e);
        }
    },

    /**
     * Remove a value from localStorage.
     * @param {string} key - The key to remove.
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error(`Error removing key ${key} from storage:`, e);
        }
    }
};

// Expose globally if needed, or just rely on script order.
// Since we are not using modules (ESM) due to "no frameworks/simple setup" preference often implying simple script tags,
// we'll attach it to window or just let it be a global const.
window.Storage = Storage;
