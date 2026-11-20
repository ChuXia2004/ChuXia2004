(() => {
  const canvas = document.getElementById("sakura-canvas");
  const button = document.getElementById("sakura-toggle");
  const ctx = canvas?.getContext("2d");
  if (!canvas || !ctx) return;

  const settings = window.SITE_CONFIG?.settings || {};
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const baseCount = Math.max(0, Math.min(100, Number(settings.sakuraCount) || 34));
  const speed = Number(settings.sakuraSpeed) || 1;

  // 花瓣密度按屏幕尺寸缩放，手机上不会显得过密
  function petalCountFor(viewportWidth, viewportHeight) {
    const shortSide = Math.min(viewportWidth, viewportHeight);
    const ratio = Math.min(1, shortSide / 720);
    return Math.max(6, Math.round(baseCount * (0.42 + 0.58 * ratio)));
  }
  let count = petalCountFor(window.innerWidth, window.innerHeight);

  let width = 0, height = 0, petals = [];
  let running = settings.sakuraEnabled !== false;
  let rafId = 0;
  let lastTime = 0;
  // 首次进入时花瓣从零开始慢慢长满，而不是一开网页就满屏
  const GROW_MS = 1900;
  let grown = 0;
  let firstRun = true;

  function makePetal(randomY = false) {
    return {
      x: Math.random() * width,
      y: randomY ? Math.random() * height : -20,
      size: 4 + Math.random() * 7,
      fall: (0.55 + Math.random() * 1.1) * speed,
      drift: (Math.random() - .5) * .8,
      swing: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .035,
      rotation: Math.random() * Math.PI * 2,
      alpha: .38 + Math.random() * .45,
      fade: 0
    };
  }

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = window.innerWidth;
    const nextHeight = window.innerHeight;
    if (nextWidth === width && nextHeight === height && petals.length) return;
    const widthChanged = Math.abs(nextWidth - width) > 2;
    width = nextWidth;
    height = nextHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const nextCount = petalCountFor(width, height);
    if (!petals.length || widthChanged || petals.length > nextCount * 1.6) {
      count = nextCount;
      petals = Array.from({ length: count }, () => makePetal(true));
    } else {
      count = nextCount;
      while (petals.length < count) petals.push(makePetal(true));
      if (petals.length > count) petals.length = count;
      for (const p of petals) {
        if (p.x > width) p.x = Math.random() * width;
        if (p.y > height + 25) p.y = Math.random() * height;
      }
    }
  }

  function drawPetal(p, color) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.globalAlpha = p.alpha * p.fade;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.bezierCurveTo(p.size * 1.1, -p.size * .8, p.size * 1.2, p.size * .4, 0, p.size);
    ctx.bezierCurveTo(-p.size * 1.2, p.size * .4, -p.size * 1.1, -p.size * .8, 0, -p.size);
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    rafId = 0;
    if (!running || reducedMotion) return;
    if (document.hidden) { lastTime = 0; return; }
    const delta = lastTime ? Math.min(now - lastTime, 50) : 16.7;
    lastTime = now;
    const step = delta / 16.667;
    const color = document.documentElement.dataset.theme === "dark" ? "#f2b7d0" : "#e9a9b9";
    ctx.clearRect(0, 0, width, height);
    if (grown < petals.length) {
      grown = Math.min(petals.length, grown + (delta / GROW_MS) * Math.max(petals.length, 1));
    }
    const visible = Math.min(petals.length, Math.max(1, Math.floor(grown)));
    for (let i = 0; i < visible; i++) {
      const p = petals[i];
      if (p.fade < 1) p.fade = Math.min(1, p.fade + .06 * step);
      p.swing += .012 * step;
      p.x += (p.drift + Math.sin(p.swing) * .55) * step;
      p.y += p.fall * step;
      p.rotation += p.spin * step;
      if (p.y > height + 25 || p.x < -30 || p.x > width + 30) Object.assign(p, makePetal());
      drawPetal(p, color);
    }
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId || !running || reducedMotion) return;
    lastTime = 0;
    if (firstRun) { grown = 0; firstRun = false; }
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
    lastTime = 0;
  }

  function setRunning(value) {
    running = value;
    canvas.style.display = running ? "block" : "none";
    if (button) {
      button.textContent = running ? "🌸" : "✿";
      button.setAttribute("aria-label", running ? "关闭樱花效果" : "开启樱花效果");
      button.title = running ? "关闭樱花效果" : "开启樱花效果";
    }
    if (running) start();
    else { stop(); ctx.clearRect(0, 0, width, height); }
  }

  button?.addEventListener("click", () => setRunning(!running));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else if (running) start();
  });
  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(resize, 120));

  resize();
  if (reducedMotion) setRunning(false);
  else setRunning(running);
})();
