const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/homepage.js'), 'utf8');

function element(children = {}) {
  return {
    hidden: false, attrs: {}, handlers: {}, textContent: '',
    querySelector(selector) { return children[selector]; },
    setAttribute(key, value) { this.attrs[key] = value; },
    addEventListener(name, fn) { this.handlers[name] = fn; },
    fire(name) { this.handlers[name]?.(); }
  };
}

async function setup({counts = [], reduced = false, reject = false, cache = new Map()} = {}) {
  const videos = [0, 1].map(index => {
    const button = element({use: element()});
    const fallback = element(); fallback.hidden = true;
    const video = element();
    Object.assign(video, {
      dataset: {name: `video-${index}`, src: `/clip-${index}.mp4`}, paused: true,
      parentElement: element({'.video-control': button, '.preview-fallback': fallback}),
      hasAttribute(name) { return this[name] !== undefined; },
      play() { this.paused = false; this.fire('play'); return Promise.resolve(); },
      pause() { this.paused = true; this.fire('pause'); }
    });
    return video;
  });
  const links = counts.map((_, index) => {
    const badge = element({'.star-count': element()});
    badge.querySelector('.star-count').textContent = '235';
    const link = element({'.repo-stars': badge});
    link.dataset = {repo: `owner/repo-${index}`, starsDate: '2026-10-29'};
    return link;
  });
  let observer;
  let requests = 0;
  class IntersectionObserver {
    constructor(callback) { observer = callback; }
    observe() {}
  }
  const context = {
    window: {matchMedia: () => ({matches: reduced, addEventListener() {}}), IntersectionObserver},
    navigator: {}, IntersectionObserver, AbortController, setTimeout, clearTimeout,
    console: {info() {}, warn() {}},
    document: {
      hidden: false, addEventListener() {},
      querySelectorAll: selector => selector === '[data-repo]' ? links : selector === '[data-authors]' ? [] : videos
    },
    localStorage: {getItem: key => cache.get(key) ?? null, setItem: (key, value) => cache.set(key, value)},
    fetch: async url => {
      requests++;
      if (reject) throw new Error('Offline');
      const index = Number(url.match(/repo-(\d+)$/)[1]);
      return {ok: true, json: async () => ({stargazers_count: counts[index]})};
    }
  };
  vm.runInNewContext(source, context);
  await new Promise(setImmediate);
  return {
    videos, links, requests,
    intersect(index, visible) { observer([{target: videos[index], isIntersecting: visible, intersectionRatio: visible ? 1 : 0}]); }
  };
}

test('stars appear strictly above 100, including the boundary cases', async () => {
  const s = await setup({counts: [99, 100, 101]});
  assert.deepEqual(s.links.map(a => a.querySelector('.repo-stars').hidden), [true, true, false]);
  assert.equal(s.links[2].querySelector('.repo-stars').querySelector('.star-count').textContent, '101');
});

test('offline GitHub requests retain the dated snapshot', async () => {
  const s = await setup({counts: [101], reject: true});
  assert.equal(s.links[0].querySelector('.repo-stars').querySelector('.star-count').textContent, '235');
  assert.equal(s.links[0].querySelector('.repo-stars').hidden, false);
});

test('a fresh cached count avoids another GitHub request', async () => {
  const cache = new Map([['eastbean:stars:v1:owner/repo-0', JSON.stringify({count: 100, checkedAt: Date.now() - 1000})]]);
  const s = await setup({counts: [101], cache});
  assert.equal(s.requests, 0);
  assert.equal(s.links[0].querySelector('.repo-stars').hidden, true);
});

test('videos load on entry and pause when offscreen or manually paused', async () => {
  const s = await setup();
  assert.equal(s.videos[0].src, undefined);
  s.intersect(0, true);
  assert.equal(s.videos[0].src, '/clip-0.mp4');
  assert.equal(s.videos[0].paused, false);
  s.intersect(0, false);
  assert.equal(s.videos[0].paused, true);
  s.intersect(0, true);
  s.videos[0].parentElement.querySelector('.video-control').fire('click');
  assert.equal(s.videos[0].paused, true);
});

test('reduced motion keeps posters until playback is explicitly requested', async () => {
  const s = await setup({reduced: true});
  s.intersect(0, true);
  assert.equal(s.videos[0].src, undefined);
  s.videos[0].parentElement.querySelector('.video-control').fire('click');
  assert.equal(s.videos[0].paused, false);
  s.intersect(1, true);
  assert.equal(s.videos[1].src, undefined);
});

test('manual pause survives scrolling; failed media falls back to its image', async () => {
  const s = await setup();
  s.intersect(0, true);
  const button = s.videos[0].parentElement.querySelector('.video-control');
  button.fire('click');
  s.intersect(0, false); s.intersect(0, true);
  assert.equal(s.videos[0].paused, true);
  s.videos[0].fire('error');
  assert.equal(s.videos[0].hidden, true);
  assert.equal(button.hidden, true);
  assert.equal(s.videos[0].parentElement.querySelector('.preview-fallback').hidden, false);
});
