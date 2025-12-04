/**
 * App Module
 * Main entry point, coordinates modules.
 */
class App {
    constructor() {
        this.storage = window.Storage;
        this.habits = new window.HabitManager();
        this.notes = new window.NotesManager();

        // Tasks Data
        this.tasks = this.storage.get('tasks', []);
        this.currentTaskId = null;

        // Stats Data
        this.stats = this.storage.get('stats', { pomodoros: {}, tasksCompleted: {} }); // { date: count }

        this.pomodoro = new window.PomodoroTimer(
            (timeLeft, total, mode) => this.ui.updateTimerDisplay(timeLeft, total, mode),
            (taskId) => this.onPomoComplete(taskId)
        );

        this.ui = new window.UIManager(this);
    }

    // --- Task Logic ---
    getTasks() {
        return this.tasks;
    }

    addTask(text) {
        const task = {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        this.tasks.push(task);
        this.saveTasks();
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            if (task.completed) {
                this.recordTaskCompletion();
            }
            this.saveTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        if (this.currentTaskId === id) {
            this.currentTaskId = null;
        }
        this.saveTasks();
    }

    selectTask(id) {
        this.currentTaskId = id;
        this.pomodoro.setTask(id);
    }

    saveTasks() {
        this.storage.set('tasks', this.tasks);
    }

    // --- Stats Logic ---
    onPomoComplete(taskId) {
        const today = new Date().toISOString().split('T')[0];
        if (!this.stats.pomodoros[today]) {
            this.stats.pomodoros[today] = 0;
        }
        this.stats.pomodoros[today]++;
        this.storage.set('stats', this.stats);

        // Notify UI
        this.ui.renderStats();

        // Optional: Play sound
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU'); // Placeholder
        // audio.play().catch(e => console.log('Audio play failed', e));
        alert("Session Complete!");
    }

    recordTaskCompletion() {
        const today = new Date().toISOString().split('T')[0];
        if (!this.stats.tasksCompleted[today]) {
            this.stats.tasksCompleted[today] = 0;
        }
        this.stats.tasksCompleted[today]++;
        this.storage.set('stats', this.stats);
        this.ui.renderStats();
    }

    getPomoCount(dateStr) {
        return this.stats.pomodoros[dateStr] || 0;
    }

    getCompletedTasksCount(dateStr) {
        return this.stats.tasksCompleted[dateStr] || 0;
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
