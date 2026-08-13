const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const themeModes = ['auto', 'light', 'dark'];
const themeModeDetails = {
  auto: { label: '自动', icon: '◐' },
  light: { label: '浅色', icon: '☀' },
  dark: { label: '深色', icon: '☾' },
};

function currentThemeMode() {
  return themeModes.includes(root.dataset.themeMode) ? root.dataset.themeMode : 'auto';
}

function applyThemeMode(mode, save = true) {
  root.dataset.themeMode = mode;
  if (mode === 'auto') {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = mode;
  }

  if (save) {
    try { localStorage.setItem('dl-theme', mode); } catch (_) {}
  }
  updateThemeControl();
}

function updateThemeControl() {
  const mode = currentThemeMode();
  const currentIndex = themeModes.indexOf(mode);
  const nextMode = themeModes[(currentIndex + 1) % themeModes.length];
  const current = themeModeDetails[mode];
  const next = themeModeDetails[nextMode];
  const resolvedLabel = systemTheme.matches ? '深色' : '浅色';
  const currentLabel = mode === 'auto' ? `自动（当前${resolvedLabel}）` : current.label;

  themeToggle.querySelector('.theme-icon').textContent = current.icon;
  themeToggle.querySelector('.theme-mode-text').textContent = current.label;
  themeToggle.dataset.mode = mode;
  themeToggle.setAttribute('aria-label', `主题：${currentLabel}；点击切换到${next.label}主题`);
  themeToggle.setAttribute('title', `主题：${currentLabel}`);
}

themeToggle.addEventListener('click', () => {
  const currentIndex = themeModes.indexOf(currentThemeMode());
  const nextMode = themeModes[(currentIndex + 1) % themeModes.length];
  applyThemeMode(nextMode);
});

if (typeof systemTheme.addEventListener === 'function') {
  systemTheme.addEventListener('change', updateThemeControl);
} else {
  systemTheme.addListener(updateThemeControl);
}

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? '打开导航菜单' : '关闭导航菜单');
  nav.classList.toggle('open', !isOpen);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
  }
});

document.addEventListener('click', (event) => {
  if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
    nav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '打开导航菜单');
  }
});

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
}, { passive: true });

document.querySelector('#year').textContent = new Date().getFullYear();
applyThemeMode(currentThemeMode(), false);
