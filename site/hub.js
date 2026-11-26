'use strict';

// The main page: pick a web version to play, and read every version's code.
(() => {
  const REPO = 'https://github.com/DasCondor/polyHocuspocus/blob/main/';
  const NUMBERS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const el = id => document.getElementById(id);

  let languages = [];
  let playing = null; // web version shown in the play area
  let viewing = null; // version shown in the code viewer
  let viewingFile = 0;
  const sources = new Map();

  async function load() {
    try {
      languages = await (await fetch('languages.json')).json();
    } catch {
      el('code-view').textContent = 'Could not load the list of versions.';
      return;
    }
    const web = languages.filter(l => l.group === 'web');
    const cli = languages.filter(l => l.group === 'cli' && l.id !== 'original');
    el('web-count').textContent = NUMBERS[web.length] || web.length;
    el('cli-count').textContent = cli.length;

    renderSegments(web);
    renderChips(el('chips-cli'), languages.filter(l => l.group === 'cli'));
    renderChips(el('chips-web'), web);
    renderRunPicker(cli);

    applyHash();
    if (!playing) play(web[0]);
    if (!viewing) view(languages[0], 0);
    addEventListener('hashchange', applyHash);
  }

  // #play/web-react picks a web version; #code/go opens a language's code.
  function applyHash() {
    const [, area, id] = location.hash.match(/^#(play|code)\/(.+)$/) || [];
    const lang = languages.find(l => l.id === id);
    if (!lang) return;
    if (area === 'play' && lang.group === 'web') play(lang);
    if (area === 'code') view(lang, 0);
  }

  /* ---------- Play area ---------- */

  function renderSegments(web) {
    for (const lang of web) {
      const button = document.createElement('button');
      button.className = 'segment';
      button.setAttribute('role', 'tab');
      button.dataset.id = lang.id;
      button.innerHTML = lang.server ? `${lang.name} <small>(local)</small>` : lang.name;
      button.onclick = () => {
        play(lang);
        history.replaceState(null, '', `#play/${lang.id}`);
      };
      el('web-versions').append(button);
    }
  }

  function play(lang) {
    playing = lang;
    document.querySelectorAll('.segment').forEach(b => b.setAttribute('aria-selected', b.dataset.id === lang.id));

    const frame = el('frame');
    const panel = el('server-panel');
    el('stage-name').textContent = lang.server
      ? `${lang.name}: runs on your computer`
      : `You're playing the ${lang.name} version`;

    if (lang.server) {
      frame.hidden = true;
      frame.removeAttribute('src');
      panel.hidden = false;
      el('server-title').textContent = `${lang.name} version`;
      el('server-note').textContent = lang.note || '';
      el('server-docker').textContent = lang.docker;
      el('server-dockerfile').href = REPO + lang.dockerfile;
      el('server-run').textContent = lang.run;
      el('server-url').textContent = `http://localhost:${lang.server.port}`;
      el('server-preview').src = lang.server.preview;
      el('server-preview').alt = `The ${lang.name} version in a browser`;
      el('stage-open').hidden = true;
    } else {
      panel.hidden = true;
      frame.hidden = false;
      frame.title = `Hocus Pocus, ${lang.name} version`;
      if (frame.getAttribute('src') !== lang.play) frame.src = lang.play;
      el('stage-open').hidden = false;
      el('stage-open').href = lang.play;
    }
  }

  // Grow the frame to fit the game so the page never scrolls twice.
  let observer;
  let landed = false;
  el('frame').addEventListener('load', () => {
    const frame = el('frame');
    observer?.disconnect();
    try {
      const body = frame.contentDocument.body;
      const fit = () => { frame.style.height = `${frame.contentDocument.documentElement.scrollHeight}px`; };
      observer = new ResizeObserver(fit);
      observer.observe(body);
      fit();
      // The game's height moves everything below it, so land a #run or #code link again.
      if (!landed && /^#(how|run|code)$/.test(location.hash)) document.querySelector(location.hash).scrollIntoView({ behavior: 'instant' });
      landed = true;
    } catch {
      // Opened from a file:// URL, where the frame can't be measured; keep the default height.
    }
  });

  el('stage-code').onclick = e => {
    e.preventDefault();
    view(playing, 0);
    el('code').scrollIntoView();
  };

  /* ---------- Code viewer ---------- */

  function renderChips(container, list) {
    for (const lang of list) {
      const chip = document.createElement('button');
      chip.className = 'chip';
      chip.setAttribute('role', 'tab');
      chip.dataset.id = lang.id;
      chip.style.setProperty('--lang', lang.color);
      chip.innerHTML = `
        <span class="chip-name"><i class="dot"></i>${lang.name}</span>
        <span class="chip-lines">${lang.lines} lines</span>`;
      chip.onclick = () => {
        view(lang, 0);
        history.replaceState(null, '', `#code/${lang.id}`);
      };
      container.append(chip);
    }
  }

  async function view(lang, fileIndex) {
    viewing = lang;
    viewingFile = fileIndex;
    document.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-selected', c.dataset.id === lang.id));

    el('viewer').style.setProperty('--lang', lang.color);
    el('run-cmd').textContent = lang.run;
    el('docker-line').hidden = !lang.docker;
    el('docker-cmd').textContent = lang.docker || '';
    if (lang.dockerfile) el('dockerfile-link').href = REPO + lang.dockerfile;
    el('lang-note').hidden = !lang.note;
    el('lang-note').textContent = lang.note || '';

    const tabs = el('file-tabs');
    tabs.innerHTML = '';
    lang.files.forEach((path, i) => {
      const tab = document.createElement('button');
      tab.className = 'file-tab';
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === fileIndex);
      tab.textContent = path;
      tab.onclick = () => view(lang, i);
      tabs.append(tab);
    });

    const path = lang.files[fileIndex];
    el('source-link').href = REPO + path;

    const box = el('code-view');
    box.textContent = 'Loading…';
    const source = await getSource(path);
    if (viewing !== lang || viewingFile !== fileIndex) return; // a newer click won

    const language = path.endsWith('.json') ? 'json'
      : path.endsWith('.html') ? 'xml'
        : path.endsWith('.css') ? 'css'
          : path.endsWith('.csproj') ? 'xml'
            : lang.hljs;
    if (window.hljs && hljs.getLanguage(language)) {
      box.innerHTML = hljs.highlight(source, { language }).value;
    } else {
      box.textContent = source;
    }
  }

  function getSource(path) {
    if (!sources.has(path)) {
      sources.set(path, fetch('code/' + path)
        .then(r => (r.ok ? r.text() : Promise.reject()))
        .catch(() => {
          sources.delete(path);
          return `// Could not load ${path}.`;
        }));
    }
    return sources.get(path);
  }

  /* ---------- Run it yourself ---------- */

  function renderRunPicker(cli) {
    const select = el('run-lang');
    select.innerHTML = cli.map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    const show = () => {
      const lang = cli.find(l => l.id === select.value);
      el('run-lang-cmd').textContent = lang.docker;
      el('run-lang-dockerfile').href = REPO + lang.dockerfile;
      el('run-lang-dockerfile').textContent = `${lang.name} Dockerfile ↗`;
    };
    select.value = 'go';
    select.onchange = show;
    show();
  }

  /* ---------- Sharing ---------- */

  const SHARE_TEXT = 'The 21-card trick, in 15 coding languages and 6 web versions. Think of a card and watch it appear:';
  const shareUrl = () => location.href.split('#')[0];

  function shareLinks(text, url) {
    const t = encodeURIComponent(text);
    const u = encodeURIComponent(url);
    return [
      ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
      ['X', `https://x.com/intent/post?text=${t}&url=${u}`],
      ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
      ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
      ['Reddit', `https://www.reddit.com/submit?url=${u}&title=${t}`],
      ['Email', `mailto:?subject=${encodeURIComponent('The 21-card trick')}&body=${t}%20${u}`],
    ];
  }

  document.querySelectorAll('.share').forEach(share => {
    const menu = share.querySelector('.share-menu');
    menu.innerHTML = shareLinks(SHARE_TEXT, shareUrl())
      .map(([name, href]) => `<a href="${href}" target="_blank" rel="noopener">${name}</a>`)
      .join('') + '<button class="copy-link" type="button">Copy link</button>';
    copyOnClick(menu.querySelector('.copy-link'), shareUrl, 'Link copied');

    // Phones get the native share sheet; other devices open the menu instead.
    share.querySelector('summary').addEventListener('click', e => {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        e.preventDefault();
        navigator.share({ title: 'Hocus Pocus · The 21-card trick', text: SHARE_TEXT, url: shareUrl() }).catch(() => {});
      }
    });
  });

  // Close an open share menu when tapping anywhere else.
  document.addEventListener('click', e => {
    document.querySelectorAll('.share[open]').forEach(share => {
      if (!share.contains(e.target)) share.open = false;
    });
  });

  /* ---------- Copy buttons ---------- */

  function copyOnClick(button, getText, done = 'Copied') {
    button.addEventListener('click', async () => {
      const label = button.textContent;
      try {
        await navigator.clipboard.writeText(await getText());
        button.textContent = done;
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => { button.textContent = label; }, 1400);
    });
  }

  copyOnClick(el('copy-code'), () => getSource(viewing.files[viewingFile]));
  document.querySelectorAll('[data-copy]').forEach(b => copyOnClick(b, () => el(b.dataset.copy).textContent));

  load();
})();
