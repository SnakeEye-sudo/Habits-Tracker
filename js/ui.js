/**
 * UI Manager
 * Handles DOM manipulation, event listeners, and rendering.
 */
class UIManager {
    constructor(app) {
        this.app = app;
        this.elements = {
            navLinks: document.querySelectorAll('.nav-link'),
            sections: document.querySelectorAll('.section'),
            themeToggle: document.getElementById('theme-toggle'),

            // Tasks
            taskList: document.getElementById('task-list'),
            addTaskForm: document.getElementById('add-task-form'),
            taskInput: document.getElementById('task-input'),

            // Pomodoro
            timerDisplay: document.getElementById('timer-display'),
            timerStartBtn: document.getElementById('timer-start'),
            timerPauseBtn: document.getElementById('timer-pause'),
            timerResetBtn: document.getElementById('timer-reset'),
            currentTaskLabel: document.getElementById('current-task-label'),

            // Habits
            habitList: document.getElementById('habit-list'),
            addHabitForm: document.getElementById('add-habit-form'),
            habitNameInput: document.getElementById('habit-name'),
            habitCategoryInput: document.getElementById('habit-category'),

            // Notes
            noteDateInput: document.getElementById('note-date'),
            noteContent: document.getElementById('note-content'),
            prevDayBtn: document.getElementById('prev-day'),
            nextDayBtn: document.getElementById('next-day'),

            // Stats
            statTasksToday: document.getElementById('stat-tasks-today'),
            statPomoToday: document.getElementById('stat-pomo-today'),
            statHabitsToday: document.getElementById('stat-habits-today'),
            weeklyChart: document.getElementById('weekly-chart')
        };

        this.initEventListeners();
        this.render();
    }

    initEventListeners() {
        // Navigation
        this.elements.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.switchTab(targetId);
            });
        });

        // Theme Toggle
        this.elements.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            Storage.set('theme', isDark ? 'dark' : 'light');
        });

        // Load Theme
        if (Storage.get('theme') === 'dark') {
            document.body.classList.add('dark-theme');
        }

        // Tasks
        this.elements.addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.elements.taskInput.value.trim();
            if (text) {
                this.app.addTask(text);
                this.elements.taskInput.value = '';
                this.renderTasks();
            }
        });

        // Pomodoro Controls
        this.elements.timerStartBtn.addEventListener('click', () => this.app.pomodoro.start());
        this.elements.timerPauseBtn.addEventListener('click', () => this.app.pomodoro.pause());
        this.elements.timerResetBtn.addEventListener('click', () => this.app.pomodoro.reset());

        // Habits
        this.elements.addHabitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = this.elements.habitNameInput.value.trim();
            const category = this.elements.habitCategoryInput.value.trim();
            if (name) {
                this.app.habits.addHabit(name, category);
                this.elements.habitNameInput.value = '';
                this.renderHabits();
            }
        });

        // Notes
        this.elements.noteContent.addEventListener('input', this.debounce((e) => {
            this.app.notes.saveNote(this.elements.noteDateInput.value, e.target.value);
        }, 500));

        this.elements.noteDateInput.addEventListener('change', (e) => {
            this.loadNoteForDate(e.target.value);
        });

        this.elements.prevDayBtn.addEventListener('click', () => this.changeNoteDay(-1));
        this.elements.nextDayBtn.addEventListener('click', () => this.changeNoteDay(1));
    }

    switchTab(tabId) {
        this.elements.sections.forEach(sec => sec.classList.remove('active'));
        this.elements.navLinks.forEach(link => link.classList.remove('active'));

        document.getElementById(tabId).classList.add('active');
        document.querySelector(`a[href="#${tabId}"]`).classList.add('active');

        if (tabId === 'stats') {
            this.renderStats();
        }
    }

    render() {
        this.renderTasks();
        this.renderHabits();
        this.loadNoteForDate(new Date().toISOString().split('T')[0]);
        this.renderStats();
    }

    // --- Tasks ---
    renderTasks() {
        const tasks = this.app.getTasks();
        this.elements.taskList.innerHTML = '';
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.id === this.app.currentTaskId ? 'selected' : ''}`;
            li.innerHTML = `
                <span class="task-text">${task.text}</span>
                <div class="task-actions">
                    <button class="btn-icon check-btn">✓</button>
                    <button class="btn-icon delete-btn">🗑</button>
                </div>
            `;

            li.addEventListener('click', (e) => {
                // If clicked on buttons, don't select
                if (e.target.closest('.btn-icon')) return;
                this.app.selectTask(task.id);
                this.renderTasks();
                this.updateTimerLabel();
            });

            li.querySelector('.check-btn').addEventListener('click', () => {
                this.app.toggleTask(task.id);
                this.renderTasks();
            });

            li.querySelector('.delete-btn').addEventListener('click', () => {
                this.app.deleteTask(task.id);
                this.renderTasks();
            });

            this.elements.taskList.appendChild(li);
        });
        this.updateTimerLabel();
    }

    updateTimerLabel() {
        const task = this.app.getTasks().find(t => t.id === this.app.currentTaskId);
        this.elements.currentTaskLabel.textContent = task ? `Focusing on: ${task.text}` : 'Select a task to focus';
    }

    updateTimerDisplay(timeLeft, totalDuration, mode) {
        const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const seconds = (timeLeft % 60).toString().padStart(2, '0');
        this.elements.timerDisplay.textContent = `${minutes}:${seconds}`;

        // Update visual progress (simple background gradient or similar)
        // For now, just text is fine, or we can add a progress bar.
        const percent = ((totalDuration - timeLeft) / totalDuration) * 100;
        document.documentElement.style.setProperty('--timer-progress', `${percent}%`);

        // Update mode class
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.className = `timer-container ${mode}`;
        }
    }

    // --- Habits ---
    renderHabits() {
        const habits = this.app.habits.getAll();
        this.elements.habitList.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];

        habits.forEach(habit => {
            const div = document.createElement('div');
            div.className = 'habit-card';
            const isDoneToday = !!habit.history[today];

            // Generate weekly view (last 7 days)
            let weeklyHTML = '<div class="weekly-view">';
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dStr = d.toISOString().split('T')[0];
                const isDone = !!habit.history[dStr];
                const dayName = d.toLocaleDateString('en-US', { weekday: 'narrow' });
                weeklyHTML += `
                    <div class="day-circle ${isDone ? 'done' : ''}" title="${dStr}">
                        ${dayName}
                    </div>
                `;
            }
            weeklyHTML += '</div>';

            div.innerHTML = `
                <div class="habit-header">
                    <h3>${habit.name} <span class="category-tag">${habit.category}</span></h3>
                    <div class="streak">🔥 ${habit.streak}</div>
                </div>
                ${weeklyHTML}
                <button class="btn btn-check ${isDoneToday ? 'done' : ''}">${isDoneToday ? 'Completed' : 'Mark Done'}</button>
                <button class="btn-icon delete-habit" style="float:right; margin-top:10px;">🗑</button>
            `;

            div.querySelector('.btn-check').addEventListener('click', () => {
                this.app.habits.toggleCompletion(habit.id, today);
                this.renderHabits();
                this.renderStats(); // Update stats immediately
            });

            div.querySelector('.delete-habit').addEventListener('click', () => {
                if (confirm('Delete this habit?')) {
                    this.app.habits.deleteHabit(habit.id);
                    this.renderHabits();
                }
            });

            this.elements.habitList.appendChild(div);
        });
    }

    // --- Notes ---
    loadNoteForDate(dateString) {
        this.elements.noteDateInput.value = dateString;
        const note = this.app.notes.getNote(dateString);
        this.elements.noteContent.value = note;
    }

    changeNoteDay(offset) {
        const current = new Date(this.elements.noteDateInput.value);
        current.setDate(current.getDate() + offset);
        const newDateStr = current.toISOString().split('T')[0];
        this.loadNoteForDate(newDateStr);
    }

    debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // --- Stats ---
    renderStats() {
        const today = new Date().toISOString().split('T')[0];

        // Tasks
        const tasks = this.app.getTasks();
        const completedTasks = tasks.filter(t => t.completed).length; // Total completed ever? Or today?
        // Requirement says "Number of tasks completed today".
        // My task model needs a 'completedDate'.
        // I'll update app.js to handle this. For now, let's assume I can get it.
        const completedTasksToday = this.app.getCompletedTasksCount(today);
        this.elements.statTasksToday.textContent = completedTasksToday;

        // Pomodoros
        const pomosToday = this.app.getPomoCount(today);
        this.elements.statPomoToday.textContent = pomosToday;

        // Habits
        const habitStats = this.app.habits.getStats();
        this.elements.statHabitsToday.textContent = `${habitStats.completedToday} / ${habitStats.totalHabits}`;

        // Weekly Chart (Simple HTML bars)
        this.renderWeeklyChart();
    }

    renderWeeklyChart() {
        // Show Pomodoros per day for last 7 days
        const container = this.elements.weeklyChart;
        container.innerHTML = '';

        const maxVal = 10; // Scale

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const count = this.app.getPomoCount(dStr);
            const height = Math.min((count / maxVal) * 100, 100);

            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}%`;
            bar.setAttribute('data-count', count);
            bar.title = `${dStr}: ${count} sessions`;

            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = d.toLocaleDateString('en-US', { weekday: 'short' });

            const wrapper = document.createElement('div');
            wrapper.className = 'chart-col';
            wrapper.appendChild(bar);
            wrapper.appendChild(label);

            container.appendChild(wrapper);
        }
    }
}

window.UIManager = UIManager;
