(() => {
  const config = window.SITE_CONFIG || {};
  const button = document.getElementById("theme-toggle");
  const saved = localStorage.getItem("sakura-theme");
  const initial = saved || (config.settings?.darkModeEnabled ? "light" : "light");

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (button) {
      button.textContent = theme === "dark" ? "☀️" : "🌙";
      button.setAttribute("aria-label", theme === "dark" ? "切换日间模式" : "切换夜间模式");
      button.title = theme === "dark" ? "切换日间模式" : "切换夜间模式";
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#191923" : "#fff8f7";
  }

  applyTheme(initial);
  button?.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("sakura-theme", next);
    applyTheme(next);
  });
})();
