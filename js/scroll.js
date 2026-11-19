(() => {
  const topButton = document.getElementById("back-to-top");
  const nav = document.getElementById("main-nav");
  const menuButton = document.getElementById("menu-toggle");

  function onScroll() {
    topButton?.classList.toggle("visible", window.scrollY > 420);
    const sections = ["home", "about", "projects", "skills", "github"];
    let current = "home";
    for (const id of sections) {
      const section = document.getElementById(id);
      if (section && window.scrollY >= section.offsetTop - 150) current = id;
    }
    document.querySelectorAll(".main-nav a").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + current));
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  menuButton?.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
})();
