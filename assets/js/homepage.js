(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let globallyPaused = reducedMotion.matches || Boolean(navigator.connection?.saveData);
  const players = [...document.querySelectorAll('video[data-src]')].map(video => ({
    video,
    button: video.parentElement.querySelector('.video-control'),
    visible: false,
    manuallyPaused: false,
    failed: false
  }));

  function updatePlayer(player) {
    const paused = player.video.paused;
    player.button.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${player.video.dataset.name} preview`);
    player.button.querySelector('use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  }

  function syncPlayer(player) {
    const shouldPlay = player.visible && !globallyPaused && !player.manuallyPaused && !document.hidden;
    if (!shouldPlay || player.failed) {
      player.video.pause();
      return;
    }
    // Load only when playback is needed; reduced-motion and data-saving visitors keep the poster.
    if (!player.video.hasAttribute('src')) player.video.src = player.video.dataset.src;
    player.video.play().catch(() => updatePlayer(player));
  }

  for (const player of players) {
    player.video.muted = true;
    player.button.hidden = false;
    player.video.addEventListener('play', () => updatePlayer(player));
    player.video.addEventListener('pause', () => updatePlayer(player));
    player.video.addEventListener('error', () => {
      player.failed = true;
      player.button.hidden = true;
      player.video.hidden = true;
      player.video.parentElement.querySelector('.preview-fallback').hidden = false;
      console.warn(`Preview unavailable: ${player.video.dataset.name}; showing its poster.`);
    });
    player.button.addEventListener('click', () => {
      if (!player.video.paused) {
        player.manuallyPaused = true;
      } else {
        if (globallyPaused) {
          // Explicitly playing a clip with reduced motion should not restart all the others.
          globallyPaused = false;
          players.forEach(other => { other.manuallyPaused = true; });
        }
        player.manuallyPaused = false;
      }
      syncPlayer(player);
    });
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const player = players.find(item => item.video === entry.target);
        player.visible = entry.isIntersecting && entry.intersectionRatio >= 0.25;
        syncPlayer(player);
      }
    }, { threshold: [0, 0.25] });
    players.forEach(player => observer.observe(player.video));
  } else {
    players.forEach(player => { player.visible = true; syncPlayer(player); });
  }
  document.addEventListener('visibilitychange', () => players.forEach(syncPlayer));
  reducedMotion.addEventListener('change', event => {
    globallyPaused = event.matches;
    players.forEach(syncPlayer);
  });

  // Keep complete names in source order and fit as many as possible on one line.
  const authorRows = [...document.querySelectorAll('[data-authors]')];
  function fitAuthors(row) {
    const names = row.dataset.authors.split('|');
    const line = row.querySelector('span');
    const first = line.querySelector('strong');
    line.style.whiteSpace = '';
    for (let count = names.length; count >= 2; count--) {
      line.replaceChildren(first, document.createTextNode(', ' + names.slice(1, count).join(', ') + (count < names.length ? ', et al.' : '')));
      if (line.getBoundingClientRect().width <= row.clientWidth) break;
    }
    // Very narrow screens may wrap the minimum two names rather than cut them off.
    line.style.whiteSpace = line.getBoundingClientRect().width > row.clientWidth ? 'normal' : '';
  }
  authorRows.forEach(fitAuthors);
  if ('ResizeObserver' in window) {
    const authorObserver = new ResizeObserver(entries => entries.forEach(entry => fitAuthors(entry.target)));
    authorRows.forEach(row => authorObserver.observe(row));
  }

  const cacheDuration = 6 * 60 * 60 * 1000;
  const cachePrefix = 'eastbean:stars:v1:';
  function validCount(count) { return Number.isInteger(count) && count >= 0; }

  function showStars(link, count, checkedAt) {
    const badge = link.querySelector('.repo-stars');
    badge.hidden = count <= 100;
    badge.querySelector('.star-count').textContent = new Intl.NumberFormat('en', {
      notation: count >= 1000 ? 'compact' : 'standard', maximumFractionDigits: 1
    }).format(count);
    badge.title = `${count.toLocaleString('en')} GitHub stars · checked ${new Date(checkedAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  async function refreshStars(link) {
    const repo = link.dataset.repo;
    const cacheKey = cachePrefix + repo;
    let cached;
    try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch { /* Storage is optional. */ }
    const now = Date.now();
    if (cached && validCount(cached.count) && Number.isFinite(cached.checkedAt) && cached.checkedAt <= now) {
      const snapshotDate = Date.parse(link.dataset.starsDate);
      if (cached.checkedAt > snapshotDate) showStars(link, cached.count, cached.checkedAt);
      if (now - cached.checkedAt < cacheDuration) return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}`, {
        signal: controller.signal, headers: { Accept: 'application/vnd.github+json' }
      });
      if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
      const result = await response.json();
      if (!validCount(result.stargazers_count)) throw new Error('Invalid star count');
      const value = { count: result.stargazers_count, checkedAt: Date.now() };
      showStars(link, value.count, value.checkedAt);
      try { localStorage.setItem(cacheKey, JSON.stringify(value)); } catch { /* Private browsing can disable storage. */ }
    } catch (error) {
      // Retain the dated snapshot/cache when GitHub is unavailable or rate-limited.
      console.info(`Stars for ${repo}: retaining the last checked count (${error.message}).`);
    } finally {
      clearTimeout(timeout);
    }
  }
  document.querySelectorAll('[data-repo]').forEach(refreshStars);
})();
