'use strict';

// The code viewer: one chip per language, a file viewer below.
(() => {
  const REPO = 'https://github.com/DasCondor/polyHocuspocus/blob/main/';
  const el = id => document.getElementById(id);

  let languages = [];
  let current = null;
  let currentFile = 0;
  const cache = new Map();

  async function load() {
    try {
      const response = await fetch('languages.json');
      languages = await response.json();
    } catch {
      el('code-view').textContent = 'Could not load the language list.';
      return;
    }
    el('lang-count').textContent = languages.filter(l => l.id !== 'original').length;
    renderChips();
    select(fromHash() || languages[0], 0, false);
    addEventListener('hashchange', () => {
      const lang = fromHash();
      if (lang && lang !== current) select(lang, 0, false);
    });
  }

  // #code/go opens the Go version.
  function fromHash() {
    const match = location.hash.match(/^#code\/(.+)$/);
    return match && languages.find(l => l.id === match[1]);
  }

  function renderChips() {
    // Scale bars to the rewrites; the longer original just fills its bar.
    const most = Math.max(...languages.filter(l => l.id !== 'original').map(l => l.lines));
    el('langs').innerHTML = '';
    for (const lang of languages) {
      const chip = document.createElement('button');
      chip.className = 'lang-chip';
      chip.setAttribute('role', 'tab');
      chip.dataset.id = lang.id;
      chip.style.setProperty('--lang', lang.color);
      chip.innerHTML = `
        <span class="lang-name"><i class="dot"></i>${lang.name}</span>
        <span class="lang-lines">${lang.lines} lines</span>
        <span class="lang-bar"><span style="width:${Math.min(100, (lang.lines / most) * 100)}%"></span></span>`;
      chip.onclick = () => select(lang, 0, true);
      el('langs').append(chip);
    }
  }

  async function select(lang, fileIndex, updateHash) {
    current = lang;
    currentFile = fileIndex;
    if (updateHash) history.replaceState(null, '', `#code/${lang.id}`);

    document.querySelectorAll('.lang-chip').forEach(chip => {
      const active = chip.dataset.id === lang.id;
      chip.classList.toggle('active', active);
      chip.setAttribute('aria-selected', active);
    });

    el('viewer').style.setProperty('--lang', lang.color);
    el('run-cmd').textContent = lang.run;
    el('lang-note').hidden = !lang.note;
    el('lang-note').textContent = lang.note || '';

    const tabs = el('file-tabs');
    tabs.innerHTML = '';
    lang.files.forEach((path, i) => {
      const tab = document.createElement('button');
      tab.className = 'file-tab' + (i === fileIndex ? ' active' : '');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', i === fileIndex);
      tab.textContent = path;
      tab.onclick = () => select(lang, i, false);
      tabs.append(tab);
    });

    const path = lang.files[fileIndex];
    el('source-link').href = REPO + path;

    const view = el('code-view');
    view.textContent = 'Loading…';
    const source = await getSource(path);
    if (current !== lang || currentFile !== fileIndex) return; // a newer click won

    const language = path.endsWith('.csproj') ? 'xml' : lang.hljs;
    view.className = `language-${language}`;
    if (window.hljs && hljs.getLanguage(language)) {
      view.innerHTML = hljs.highlight(source, { language }).value;
    } else {
      view.textContent = source;
    }
  }

  async function getSource(path) {
    if (!cache.has(path)) {
      cache.set(path, fetch('code/' + path)
        .then(r => (r.ok ? r.text() : Promise.reject()))
        .catch(() => {
          cache.delete(path);
          return `// Could not load ${path}.`;
        }));
    }
    return cache.get(path);
  }

  function copyButton(button, getText) {
    button.onclick = async () => {
      const label = button.textContent;
      try {
        await navigator.clipboard.writeText(await getText());
        button.textContent = 'Copied';
      } catch {
        button.textContent = 'Copy failed';
      }
      setTimeout(() => { button.textContent = label; }, 1400);
    };
  }

  copyButton(el('copy-code'), () => getSource(current.files[currentFile]));
  copyButton(el('copy-run'), () => current.run);

  load();
})();
