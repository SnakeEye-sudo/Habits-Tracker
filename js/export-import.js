// Export/Import Module for Habits Tracker
// CSV Export functionality
function exportHabitsToCSV() {
  const habits = JSON.parse(localStorage.getItem('habits')) || [];
  if (habits.length === 0) {
    alert('No habits to export!');
    return;
  }
  let csv = 'Habit Name,Category,Created Date,Completions\n';
  habits.forEach(habit => {
    const completed = Object.values(habit.completions || {}).filter(c => c).length;
    csv += `"${habit.name}","${habit.category || 'General'}","${new Date(habit.createdDate).toLocaleDateString()}",${completed}\n`;
  });
  downloadFile(csv, 'habits-export.csv', 'text/csv');
}

// JSON Backup export
function exportBackupJSON() {
  const backup = {
    habits: JSON.parse(localStorage.getItem('habits')) || [],
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    timestamp: new Date().toISOString()
  };
  downloadFile(JSON.stringify(backup, null, 2), 'habits-backup.json', 'application/json');
}

// Helper function to download files
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type: type + ';charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Import from file
function importFromFile(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      if (file.name.endsWith('.json')) {
        const backup = JSON.parse(content);
        if (confirm('Restore all data from backup? This will overwrite current data.')) {
          localStorage.setItem('habits', JSON.stringify(backup.habits || []));
          localStorage.setItem('tasks', JSON.stringify(backup.tasks || []));
          alert('Data restored successfully!');
          location.reload();
        }
      }
    } catch (error) {
      alert('Error importing file: ' + error.message);
    }
  };
  reader.readAsText(file);
}
