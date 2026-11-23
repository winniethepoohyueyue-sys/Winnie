const get = (id) => document.getElementById(id);
const defaults = {
  exercises: [
    { week: 1, title: 'Week 1 exercise', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/week1.mp4', memo: '' },
    { week: 2, title: 'Storyboard', video: '', image: 'week2-storyboard.png', memo: '' },
    { week: 3, title: 'POV exercise', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/week3.mp4', memo: '' },
    { week: 4, title: 'Sound', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/week4.mp4', memo: '' }
  ],
  profile: { name: '', bio: '' }
};
const assignments = [
  { title: 'Ass1 · ANSWER', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/answer.mp4' },
  { title: 'Ass2 · Decision to Leave Remake', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/remake-ass2.mp4', original: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/original-scene.mp4' }
];
const otherExercises = [
  { title: 'Herframe · The woman horror film festival', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/herframe.mp4' },
  { title: 'Food Film Festival with presentation', video: 'https://screen-production-cutroom.q5x4hsqgf6.chatgpt.site/media/food-festival.mp4' }
];
const portfolio = defaults;

function videoSource(value) {
  if (!value) return null;
  let url;
  try { url = new URL(value, window.location.href); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  const host = url.hostname.replace(/^www\./, '');
  if (['youtube.com', 'm.youtube.com', 'youtu.be'].includes(host)) {
    const id = url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
    if (/^[\w-]{11}$/.test(id ?? '')) {
      return ['iframe', 'https://www.youtube-nocookie.com/embed/' + id];
    }
  }
  if (['vimeo.com', 'player.vimeo.com'].includes(host)) {
    const id = url.pathname.split('/').filter(Boolean).find((part) => /^\d+$/.test(part));
    if (id) return ['iframe', 'https://player.vimeo.com/video/' + id];
  }
  if (/\.(mp4|webm|ogg|ogv)$/i.test(url.pathname)) return ['video', url.href];
  return ['a', url.href];
}

function showMedia(monitor, value, image) {
  if (image && !value) {
    const link = document.createElement('a');
    link.href = image;
    link.target = '_blank';
    link.rel = 'noopener';
    link.className = 'storyboard-link';
    link.setAttribute('aria-label', 'Enlarge the Week 2 storyboard');
    const picture = document.createElement('img');
    picture.src = image;
    picture.alt = 'Week 2 assignment 1 storyboard';
    picture.loading = 'lazy';
    link.append(picture);
    monitor.replaceChildren(link);
    return;
  }
  const source = videoSource(value);
  if (!source) {
    const frame = document.createElement('div');
    frame.className = 'frame';
    frame.innerHTML = '<span aria-hidden="true">▷</span><p>Video to come</p>';
    monitor.replaceChildren(frame);
    return;
  }
  const [tag, address] = source;
  const media = document.createElement(tag);
  if (tag === 'a') {
    media.href = address;
    media.target = '_blank';
    media.rel = 'noopener noreferrer';
    media.textContent = 'Open film';
    media.className = 'pill';
  } else {
    media.src = address;
    if (tag === 'video') {
      media.controls = true;
      if (value.startsWith('')) media.poster = value.replace(/\.mp4$/, '.jpg');
      media.preload = 'metadata';
      media.playsInline = true;
    } else {
      media.title = 'Weekly exercise film';
      media.loading = 'lazy';
      media.allowFullscreen = true;
    }
  }
  monitor.replaceChildren(media);
}

function render() {
  const { exercises } = portfolio;
  const template = get('entry-template');
  get('roll').replaceChildren(...exercises.map((exercise, index) => {
    const entry = template.content.firstElementChild.cloneNode(true);
    const week = String(exercise.week).padStart(2, '0');
    entry.id = 'week-' + exercise.week;
    const title = entry.querySelector('h3');
    title.id = 'title-' + exercise.week;
    title.textContent = exercise.title;
    entry.setAttribute('aria-labelledby', title.id);
    entry.querySelector('.mono').textContent = 'WEEK ' + week + (exercise.sample ? ' / Sample exercise' : '');
    entry.querySelector('.notes p').remove();
    const monitor = entry.querySelector('.monitor');
    monitor.style.setProperty('--swatch', ['#ebe1f1', '#f4e5dc', '#e1e9e2', '#e8e4f1'][index % 4]);
    showMedia(monitor, exercise.video, exercise.image);
    return entry;
  }));
  for (const [container, works] of [['assignments-roll', assignments], ['other-roll', otherExercises]]) {
    get(container).replaceChildren(...works.map((exercise) => {
      const card = document.createElement('article');
      card.className = 'other-card';
      const monitor = document.createElement('div');
      monitor.className = 'monitor';
      showMedia(monitor, exercise.video);
      const title = document.createElement('h3');
      title.textContent = exercise.title;
      if (exercise.original) {
        const pair = document.createElement('div');
        pair.className = 'film-comparison';
        const remake = document.createElement('figure');
        const remakeLabel = document.createElement('figcaption');
        remakeLabel.textContent = 'Remake';
        remake.append(remakeLabel, monitor);
        const original = document.createElement('figure');
        const originalLabel = document.createElement('figcaption');
        originalLabel.textContent = 'Original scene · Decision to Leave (2022), Park Chan-wook';
        const originalMonitor = document.createElement('div');
        originalMonitor.className = 'monitor';
        showMedia(originalMonitor, exercise.original);
        original.append(originalLabel, originalMonitor);
        pair.append(remake, original);
        card.append(title, pair);
      } else {
        card.append(monitor, title);
      }
      return card;
    }));
  }
  observeEntries();
}

const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 }) : null;
function observeEntries() {
  if (!revealObserver) return;
  revealObserver.disconnect();
  document.querySelectorAll('.entry').forEach((entry) => {
    entry.classList.add('reveal-ready');
    revealObserver.observe(entry);
  });
}
function updateProgress() {
  const range = document.documentElement.scrollHeight - window.innerHeight;
  document.querySelector('.scroll-meter').style.width = (range > 0 ? Math.min(100, window.scrollY / range * 100) : 0) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });
window.addEventListener('resize', updateProgress);
render();
updateProgress();

