/**
 * Notes Module
 * Handles daily notes with auto-save.
 */
class NotesManager {
    constructor() {
        this.STORAGE_PREFIX = 'notes_';
    }

    getNote(dateString) {
        // dateString format: YYYY-MM-DD
        return Storage.get(this.STORAGE_PREFIX + dateString, '');
    }

    saveNote(dateString, content) {
        Storage.set(this.STORAGE_PREFIX + dateString, content);
    }
}

window.NotesManager = NotesManager;
