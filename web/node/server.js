// Hocus Pocus - the 21-card trick, as a Node.js web server.
// Every page is rendered on the server; the browser runs no JavaScript.
// The game state lives in the link: /?deck=4.17.33...&round=2
//
//   node web/node/server.js      then open http://localhost:3000
'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT) || 3000;
const CSS = fs.readFileSync(path.join(__dirname, '..', 'shared', 'hocuspocus.css'));

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;
// Shares point at the public site: a localhost link would mean nothing to a friend.
const SHARE_URL = 'https://dascondor.github.io/polyHocuspocus/';

function makeCard(id) {
  const rank = RANKS[id % 13];
  const [suit, suitName] = SUITS[Math.floor(id / 13)];
  return { id, rank, suit, red: suit === '♥' || suit === '♦', name: `${RANK_NAMES[rank] || rank} of ${suitName}` };
}

// Shuffle a full 52-card deck and keep 21 card ids.
function newDeck() {
  const ids = [...Array(52).keys()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 21);
}

// Deal one card at a time into three piles of seven.
const deal = deck => [0, 1, 2].map(p => deck.filter((_, i) => i % 3 === p));

// Stack the piles back up with the chosen pile in the middle.
function collect(piles, chosen) {
  const others = [0, 1, 2].filter(p => p !== chosen);
  if (Math.random() < 0.5) others.reverse();
  return [...piles[others[0]], ...piles[chosen], ...piles[others[1]]];
}

// A deck from the link must be 21 different cards.
function parseDeck(text) {
  const ids = (text || '').split('.').map(Number);
  const valid = ids.length === 21 && new Set(ids).size === 21 && ids.every(n => Number.isInteger(n) && n >= 0 && n < 52);
  return valid ? ids : null;
}

const gameLink = (deck, round) => `/?deck=${deck.join('.')}&round=${round}`;

/* ---------- Pages ---------- */

// Plain links, so sharing works with no JavaScript in the browser.
function shareHtml(card) {
  const text = `The 21-card trick found my card: the ${card.name}! Think of a card and try it:`;
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(SHARE_URL);
  const links = [
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['X', `https://x.com/intent/post?text=${t}&amp;url=${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['Reddit', `https://www.reddit.com/submit?url=${u}&amp;title=${t}`],
    ['Email', `mailto:?subject=${encodeURIComponent('The 21-card trick')}&amp;body=${t}%20${u}`],
  ];
  return `
    <details class="hp-share">
      <summary class="hp-secondary">Share</summary>
      <div class="hp-share-menu">
        ${links.map(([name, href]) => `<a href="${href}" target="_blank" rel="noopener">${name}</a>`).join('')}
        <input readonly value="${SHARE_URL}" aria-label="Link to copy">
      </div>
    </details>`;
}

const cardHtml = (card, i, extra = '') => `
  <li class="hp-card${card.red ? ' red' : ''}${extra}" style="--i:${i}" aria-label="${card.name}">
    <span class="hp-corner">${card.rank}<span>${card.suit}</span></span>
    <span class="hp-pip" aria-hidden="true">${card.suit}</span>
  </li>`;

function stepsHtml(phase, round) {
  const now = ['remember', 'choose', 'reveal'].indexOf(phase);
  const labels = ['Remember', phase === 'choose' ? `Choose ${round}/${ROUNDS}` : 'Choose', 'Reveal'];
  return labels.map((label, i) => `<li class="${i === now ? 'active' : i < now ? 'done' : ''}">${label}</li>`).join('');
}

function tableHtml(deck, round, choosing) {
  const piles = deal(deck).map(ids => ids.map(makeCard));
  return `
    <div class="hp-table">
      <div class="hp-piles">
        ${piles.map((pile, p) => `
          <section class="hp-pile">
            <h2>Pile ${p + 1}</h2>
            <ul class="hp-cards">${pile.map((card, row) => cardHtml(card, row * 3 + p)).join('')}</ul>
            ${choosing ? `<a class="hp-pick" href="${gameLink(deck, round)}&amp;pick=${p}">It's in pile ${p + 1}</a>` : ''}
          </section>`).join('')}
      </div>
    </div>`;
}

function page({ phase, round = 0, title, text, body, action = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hocus Pocus · Node.js</title>
  <link rel="stylesheet" href="/hocuspocus.css">
</head>
<body>
  <main class="hp">
    <ol class="hp-steps">${stepsHtml(phase, round)}</ol>
    <h1 class="hp-title">${title}</h1>
    <p class="hp-text">${text}</p>
    ${body}
    <div class="hp-actions">${action}</div>
    <p class="hp-made">Rendered by a Node.js server, no JavaScript in the browser</p>
  </main>
</body>
</html>`;
}

function rememberPage() {
  const deck = newDeck();
  return page({
    phase: 'remember',
    title: 'Think of a card',
    text: "Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind.",
    body: tableHtml(deck, 0, false),
    action: `<a class="hp-primary" href="${gameLink(deck, 1)}">I've got my card</a>`,
  });
}

function choosePage(deck, round) {
  return page({
    phase: 'choose',
    round,
    title: `Round ${round} of ${ROUNDS}`,
    text: round === 1 ? 'Which pile is your card in?' : 'The cards have moved. Which pile is your card in now?',
    body: tableHtml(deck, round, true),
  });
}

function revealPage(id) {
  const card = makeCard(id);
  return page({
    phase: 'reveal',
    title: 'Your card is…',
    text: 'After three rounds your card always ends up 11th in the deck. That is the whole trick.',
    body: `
      <div class="hp-reveal">
        <ul class="hp-cards">${cardHtml(card, 0, ' hp-big')}</ul>
        <p class="hp-name">${card.name}</p>
      </div>`,
    action: `<a class="hp-primary" href="/">Play again</a>${shareHtml(card)}`,
  });
}

/* ---------- Routes ---------- */

function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const send = (status, type, body) => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
    res.end(body);
  };
  const redirect = to => {
    res.writeHead(303, { Location: to });
    res.end();
  };

  if (url.pathname === '/hocuspocus.css') return send(200, 'text/css; charset=utf-8', CSS);
  if (url.pathname !== '/') return send(404, 'text/plain; charset=utf-8', 'Not found');

  const q = url.searchParams;
  if (q.has('reveal')) {
    const id = Number(q.get('reveal'));
    return Number.isInteger(id) && id >= 0 && id < 52 ? send(200, 'text/html; charset=utf-8', revealPage(id)) : redirect('/');
  }
  if (!q.has('deck')) return send(200, 'text/html; charset=utf-8', rememberPage());

  const deck = parseDeck(q.get('deck'));
  const round = Number(q.get('round'));
  if (!deck || ![1, 2, 3].includes(round)) return redirect('/');
  if (!q.has('pick')) return send(200, 'text/html; charset=utf-8', choosePage(deck, round));

  const pick = Number(q.get('pick'));
  if (![0, 1, 2].includes(pick)) return redirect('/');
  const next = collect(deal(deck), pick);
  // After three rounds the remembered card is always the 11th card.
  return redirect(round === ROUNDS ? `/?reveal=${next[10]}` : gameLink(next, round + 1));
}

http.createServer(handle).listen(PORT, () => {
  console.log(`Hocus Pocus (Node.js) at http://localhost:${PORT}`);
});
