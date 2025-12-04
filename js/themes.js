// Themes Module - Custom Color Themes for Habits Tracker

const THEMES = {
  light: {
    name: 'Light Mode',
    primary: '#6c5ce7',
    secondary: '#a29bfe',
    background: '#ffffff',
    text: '#2d3436',
    accent: '#00b894'
  },
  dark: {
    name: 'Dark Mode',
    primary: '#0984e3',
    secondary: '#74b9ff',
    background: '#1e1e1e',
    text: '#f5f6fa',
    accent: '#55efc4'
  },
  ocean: {
    name: 'Ocean Blue',
    primary: '#0098d4',
    secondary: '#00d9ff',
    background: '#f0f8ff',
    text: '#003d5c',
    accent: '#00b894'
  },
  sunset: {
    name: 'Sunset',
    primary: '#f06292',
    secondary: '#ff8a80',
    background: '#fff3e0',
    text: '#5d4037',
    accent: '#ffd54f'
  },
  forest: {
    name: 'Forest',
    primary: '#00796b',
    secondary: '#4db6ac',
    background: '#e0f2f1',
    text: '#004d40',
    accent: '#81c784'
  }
};

function applyTheme(themeName) {
  const theme = THEMES[themeName] || THEMES.light;
  const root = document.documentElement;
  root.style.setProperty('--primary-color', theme.primary);
  root.style.setProperty('--secondary-color', theme.secondary);
  root.style.setProperty('--background-color', theme.background);
  root.style.setProperty('--text-color', theme.text);
  root.style.setProperty('--accent-color', theme.accent);
  localStorage.setItem('selectedTheme', themeName);
}

function loadSavedTheme() {
  const saved = localStorage.getItem('selectedTheme') || 'light';
  applyTheme(saved);
}

function getAvailableThemes() {
  return Object.keys(THEMES).map(key => ({
    id: key,
    ...THEMES[key]
  }));
}
