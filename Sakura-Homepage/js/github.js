(() => {
  const cfg = window.SITE_CONFIG?.github || {};
  const profile = window.SITE_CONFIG?.profile || {};
  const username = (cfg.username || profile.githubUsername || "username").trim();
  const usernameEl = document.getElementById("github-username");
  const repoEl = document.getElementById("repo-count");
  const followerEl = document.getElementById("follower-count");
  const followingEl = document.getElementById("following-count");
  const link = document.getElementById("github-profile-link");
  const heroLink = document.getElementById("hero-github-link");
  const note = document.getElementById("github-note");
  if (!username) return;

  const url = `https://github.com/${encodeURIComponent(username)}`;
  if (usernameEl) usernameEl.textContent = username;
  if (link) link.href = url;
  if (heroLink) heroLink.href = url;

  if (cfg.showStats === false || username === "username") {
    if (note) note.textContent = "请在 config/config.js 中填写你的 GitHub 用户名以显示公开数据。";
    return;
  }

  fetch(`https://api.github.com/users/${encodeURIComponent(username)}`)
    .then(response => {
      if (!response.ok) throw new Error("GitHub API request failed");
      return response.json();
    })
    .then(data => {
      if (repoEl) repoEl.textContent = data.public_repos ?? "—";
      if (followerEl) followerEl.textContent = data.followers ?? "—";
      if (followingEl) followingEl.textContent = data.following ?? "—";
      if (note) note.textContent = "公开数据由 GitHub API 提供 · 数据可能有短暂延迟";
    })
    .catch(() => {
      if (note) note.textContent = "暂时无法获取 GitHub 数据，请稍后再试。";
    });
})();
