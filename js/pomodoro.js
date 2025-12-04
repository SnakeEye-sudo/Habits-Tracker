/**
 * Pomodoro Module
 * Handles the timer logic and task association.
 */
class PomodoroTimer {
    constructor(onTick, onComplete) {
        this.duration = 25 * 60; // Default 25 mins in seconds
        this.breakDuration = 5 * 60; // 5 mins
        this.timeLeft = this.duration;
        this.timerId = null;
        this.isRunning = false;
        this.mode = 'work'; // 'work' or 'break'
        this.currentTaskId = null;

        this.onTick = onTick; // Callback for UI updates
        this.onComplete = onComplete; // Callback when timer finishes

        // Load state if exists (optional, for page refreshes)
        // For simplicity, we start fresh or could implement persistence later.
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.timerId = setInterval(() => {
            this.tick();
        }, 1000);
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        clearInterval(this.timerId);
    }

    reset() {
        this.pause();
        this.mode = 'work';
        this.timeLeft = this.duration;
        if (this.onTick) this.onTick(this.timeLeft, this.duration, this.mode);
    }

    tick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            if (this.onTick) this.onTick(this.timeLeft, this.mode === 'work' ? this.duration : this.breakDuration, this.mode);
        } else {
            this.complete();
        }
    }

    complete() {
        this.pause();
        // Play sound or notify
        // Switch mode
        if (this.mode === 'work') {
            if (this.onComplete) this.onComplete(this.currentTaskId);
            this.mode = 'break';
            this.timeLeft = this.breakDuration;
        } else {
            this.mode = 'work';
            this.timeLeft = this.duration;
        }
        // Auto-start next phase or wait? Let's wait for user to start.
        if (this.onTick) this.onTick(this.timeLeft, this.duration, this.mode); // Update UI to show new time

        // Notify user
        // alert(this.mode === 'break' ? "Work session finished! Take a break." : "Break finished! Back to work.");
    }

    setTask(taskId) {
        this.currentTaskId = taskId;
    }

    setDuration(workMinutes, breakMinutes) {
        this.duration = workMinutes * 60;
        this.breakDuration = breakMinutes * 60;
        if (!this.isRunning && this.mode === 'work') {
            this.timeLeft = this.duration;
            if (this.onTick) this.onTick(this.timeLeft, this.duration, this.mode);
        }
    }
}

window.PomodoroTimer = PomodoroTimer;
