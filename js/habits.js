/**
 * Habits Module
 * Manages habits data, streaks, and completion status.
 * Depends on Storage.
 */
class HabitManager {
    constructor() {
        this.STORAGE_KEY = 'habits_data';
        this.habits = Storage.get(this.STORAGE_KEY, []);
    }

    /**
     * Add a new habit.
     * @param {string} name 
     * @param {string} category 
     */
    addHabit(name, category = 'General') {
        const newHabit = {
            id: Date.now().toString(),
            name,
            category,
            startDate: new Date().toISOString(),
            history: {}, // Format: "YYYY-MM-DD": true
            streak: 0
        };
        this.habits.push(newHabit);
        this.save();
        return newHabit;
    }

    /**
     * Delete a habit by ID.
     * @param {string} id 
     */
    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.save();
    }

    /**
     * Toggle completion for a specific date.
     * @param {string} id - Habit ID
     * @param {string} dateString - "YYYY-MM-DD"
     */
    toggleCompletion(id, dateString) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        if (habit.history[dateString]) {
            delete habit.history[dateString];
        } else {
            habit.history[dateString] = true;
        }

        this.recalculateStreak(habit);
        this.save();
    }

    /**
     * Recalculate streak for a habit.
     * Streak = continuous days ending today or yesterday.
     * @param {object} habit 
     */
    recalculateStreak(habit) {
        let streak = 0;
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const toDateString = (date) => date.toISOString().split('T')[0];
        const todayStr = toDateString(today);
        const yesterdayStr = toDateString(yesterday);

        // If completed today, start checking from today backwards
        // If not completed today, start checking from yesterday backwards
        // If neither, streak is 0.

        let currentCheckDate = new Date();

        if (habit.history[todayStr]) {
            streak++;
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else if (habit.history[yesterdayStr]) {
            // Streak continues from yesterday
            // We don't increment here because the loop will catch yesterday
            // Actually, if today is NOT done, but yesterday IS, streak is valid.
            // So we start checking from yesterday.
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
            habit.streak = 0;
            return;
        }

        while (true) {
            const dateStr = toDateString(currentCheckDate);
            if (habit.history[dateStr]) {
                // If we already counted today, don't double count if logic overlaps
                // But my logic above handles the start point.
                // If we started from yesterday, we haven't counted it yet.
                // If we started from today (and decremented), we are now at yesterday.

                // Let's simplify:
                // Just count backwards from the last completed day that is connected to today.
            } else {
                break;
            }

            // Wait, simpler logic:
            // 1. Check if today is done. If yes, streak starts at 1. Else 0.
            // 2. Check yesterday. If done, streak++. Else stop.
            // 3. Keep going back.

            // Correction: If today is NOT done, but yesterday IS, the streak is still active (just not extended yet).
            // So we need to find the most recent consecutive run ending at Today OR Yesterday.
        }

        // Re-implementation of simple streak logic
        let tempStreak = 0;
        let checkDate = new Date();

        // Check today
        if (habit.history[toDateString(checkDate)]) {
            tempStreak++;
        }

        // Move to yesterday
        checkDate.setDate(checkDate.getDate() - 1);

        // Loop backwards
        while (true) {
            const dateStr = toDateString(checkDate);
            if (habit.history[dateStr]) {
                tempStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                // If we haven't counted today (tempStreak is 0) and yesterday is missing, streak is broken.
                // If we counted today, and yesterday is missing, streak is 1.
                // If we didn't count today, but yesterday is present... wait.

                // Special case: If today is NOT done, we shouldn't reset streak to 0 immediately if yesterday was done.
                // The user has until end of today to keep the streak.
                // So if today is unchecked, we should calculate streak ending yesterday.

                if (tempStreak === 0 && !habit.history[toDateString(new Date())]) {
                    // Today not done. Check if yesterday was done.
                    // If yesterday was not done (which we are at in the loop), then streak is 0.
                    // If yesterday WAS done, we would be inside the 'if' block.
                    // So if we are here, it means the chain broke.
                }
                break;
            }
        }

        // Let's try a robust approach:
        // 1. Get all completed dates, sort them.
        // 2. Find the chain ending at Today or Yesterday.

        const sortedDates = Object.keys(habit.history).sort((a, b) => new Date(b) - new Date(a)); // Descending
        if (sortedDates.length === 0) {
            habit.streak = 0;
            return;
        }

        const todayKey = toDateString(new Date());
        const yesterdayKey = toDateString(yesterday);

        let currentStreak = 0;
        let expectedDate = new Date(); // Start expecting today

        // If today is not in list, check if yesterday is the latest
        if (sortedDates[0] !== todayKey) {
            if (sortedDates[0] === yesterdayKey) {
                expectedDate = yesterday;
            } else {
                // Latest completion was before yesterday -> streak broken
                habit.streak = 0;
                return;
            }
        }

        // Now count backwards
        for (let i = 0; i < sortedDates.length; i++) {
            const dateStr = sortedDates[i];
            const expectedStr = toDateString(expectedDate);

            if (dateStr === expectedStr) {
                currentStreak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else {
                // Gap found
                break;
            }
        }

        habit.streak = currentStreak;
    }

    save() {
        Storage.set(this.STORAGE_KEY, this.habits);
    }

    getAll() {
        return this.habits;
    }

    getStats() {
        const todayStr = new Date().toISOString().split('T')[0];
        const completedToday = this.habits.filter(h => h.history[todayStr]).length;
        return {
            totalHabits: this.habits.length,
            completedToday
        };
    }
}

window.HabitManager = HabitManager;
