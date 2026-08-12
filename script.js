const root = document.documentElement;
const themeToggle = document.querySelector('.theme-toggle');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

function currentTheme() {
  if (root.dataset.theme) return root.dataset.theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function updateThemeLabel() {
  const nextTheme = currentTheme() === 'dark' ? '浅色' : '深色';
  themeToggle.setAttribute('aria-label', `切换到${nextTheme}主题`);
  themeToggle.setAttribute('title', `切换到${nextTheme}主题`);
}

themeToggle.addEventListener('click', () => {
  const nextTheme = currentTheme() === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try { localStorage.setItem('dl-theme', nextTheme); } catch (_) {}
  updateThemeLabel();
});

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
updateThemeLabel();
