const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const siteFavicon = document.querySelector('#site-favicon');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');
const navSectionLinks = [...nav.querySelectorAll('a[href^="#"]')];
const navSections = navSectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute('href')) }))
  .filter(({ section }) => section);
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

function resolvedTheme(mode = currentThemeMode()) {
  return mode === 'auto' ? (systemTheme.matches ? 'dark' : 'light') : mode;
}

function updateSiteFavicon(theme = resolvedTheme()) {
  const themeHref = siteFavicon?.dataset[`${theme}Href`];
  if (themeHref && siteFavicon.getAttribute('href') !== themeHref) {
    siteFavicon.setAttribute('href', themeHref);
  }
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
  updateSiteFavicon(resolvedTheme(mode));
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

function handleSystemThemeChange() {
  updateSiteFavicon();
  updateThemeControl();
}

if (typeof systemTheme.addEventListener === 'function') {
  systemTheme.addEventListener('change', handleSystemThemeChange);
} else {
  systemTheme.addListener(handleSystemThemeChange);
}

function closeMenu({ restoreFocus = false } = {}) {
  const wasOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
  if (restoreFocus && wasOpen) menuToggle.focus();
}

menuToggle.addEventListener('click', () => {
  const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(willOpen));
  menuToggle.setAttribute('aria-label', willOpen ? '关闭导航菜单' : '打开导航菜单');
  nav.classList.toggle('open', willOpen);
});

nav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    closeMenu();
  }
});

document.addEventListener('click', (event) => {
  if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
    closeMenu();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu({ restoreFocus: true });
});

let scrollFrame = 0;

function updateScrollState() {
  header.classList.toggle('scrolled', window.scrollY > 8);

  const marker = window.scrollY + Math.min(window.innerHeight * 0.36, 280);
  let activeId = null;
  navSections.forEach(({ section }) => {
    if (section.offsetTop <= marker) activeId = section.id;
  });

  navSections.forEach(({ link, section }) => {
    const isActive = section.id === activeId;
    link.classList.toggle('is-active', isActive);
    if (isActive) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function scheduleScrollUpdate() {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollState();
    scrollFrame = 0;
  });
}

window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
window.addEventListener('resize', () => {
  if (window.innerWidth > 760) closeMenu();
  scheduleScrollUpdate();
}, { passive: true });

document.querySelector('#year').textContent = new Date().getFullYear();
applyThemeMode(currentThemeMode(), false);
updateScrollState();
