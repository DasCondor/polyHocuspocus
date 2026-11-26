// Hocus Pocus - the 21-card trick, in plain JavaScript (no framework).
'use strict';

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;
const SHARE_URL = 'https://dascondor.github.io/polyHocuspocus/#play/web-vanilla';

function makeCard(id) {
  const rank = RANKS[id % 13];
  const [suit, suitName] = SUITS[Math.floor(id / 13)];
  return { id, rank, suit, red: suit === '♥' || suit === '♦', name: `${RANK_NAMES[rank] || rank} of ${suitName}` };
}

// Shuffle a full 52-card deck and keep 21 cards.
function newDeck() {
  const ids = [...Array(52).keys()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 21).map(makeCard);
}

// Deal one card at a time into three piles of seven.
const deal = deck => [0, 1, 2].map(p => deck.filter((_, i) => i % 3 === p));

// Stack the piles back up with the chosen pile in the middle.
function collect(piles, chosen) {
  const others = [0, 1, 2].filter(p => p !== chosen);
  if (Math.random() < 0.5) others.reverse();
  return [...piles[others[0]], ...piles[chosen], ...piles[others[1]]];
}

/* ---------- Sharing ---------- */

const shareText = card => `The 21-card trick found my card: the ${card.name}! Think of a card and try it:`;

function shareLinks(text, url) {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  return [
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['X', `https://x.com/intent/post?text=${t}&url=${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['Reddit', `https://www.reddit.com/submit?url=${u}&title=${t}`],
    ['Email', `mailto:?subject=${encodeURIComponent('The 21-card trick')}&body=${t}%20${u}`],
  ];
}

// Phones get the native share sheet; other devices open the menu instead.
function shareNatively(event, text, url) {
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    event.preventDefault();
    navigator.share({ title: 'Hocus Pocus', text, url }).catch(() => {});
  }
}

const shareHtml = card => `
  <details class="hp-share">
    <summary class="hp-secondary">Share</summary>
    <div class="hp-share-menu">
      ${shareLinks(shareText(card), SHARE_URL)
        .map(([name, href]) => `<a href="${href}" target="_blank" rel="noopener">${name}</a>`).join('')}
      <button class="hp-copy" type="button" data-action="copy">Copy link</button>
    </div>
  </details>`;

/* ---------- State ---------- */

let deck, piles, round, phase; // phase: 'remember' | 'choose' | 'reveal'

function newGame() {
  deck = newDeck();
  piles = deal(deck);
  round = 0;
  phase = 'remember';
  render();
}

function startChoosing() {
  phase = 'choose';
  round = 1;
  render();
}

function choose(p) {
  if (phase !== 'choose') return;
  deck = collect(piles, p);
  if (round === ROUNDS) {
    phase = 'reveal'; // the remembered card is now always deck[10]
  } else {
    round++;
    piles = deal(deck);
  }
  render();
}

/* ---------- Rendering ---------- */

const cardHtml = (card, i, extra = '') => `
  <li class="hp-card${card.red ? ' red' : ''}${extra}" style="--i:${i}" aria-label="${card.name}">
    <span class="hp-corner">${card.rank}<span>${card.suit}</span></span>
    <span class="hp-pip" aria-hidden="true">${card.suit}</span>
  </li>`;

function steps() {
  const order = ['remember', 'choose', 'reveal'];
  const labels = ['Remember', phase === 'choose' ? `Choose ${round}/${ROUNDS}` : 'Choose', 'Reveal'];
  const now = order.indexOf(phase);
  return labels
    .map((label, i) => `<li class="${i === now ? 'active' : i < now ? 'done' : ''}">${label}</li>`)
    .join('');
}

function render() {
  const app = document.getElementById('app');
  let title, text, body, action;

  if (phase === 'reveal') {
    title = 'Your card is…';
    text = 'After three rounds your card always ends up 11th in the deck. That is the whole trick.';
    body = `
      <div class="hp-reveal">
        <ul class="hp-cards">${cardHtml(deck[10], 0, ' hp-big')}</ul>
        <p class="hp-name">${deck[10].name}</p>
      </div>`;
    action = `<button class="hp-primary" data-action="again">Play again</button>${shareHtml(deck[10])}`;
  } else {
    if (phase === 'remember') {
      title = 'Think of a card';
      text = "Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind.";
      action = '<button class="hp-primary" data-action="start">I\'ve got my card</button>';
    } else {
      title = `Round ${round} of ${ROUNDS}`;
      text = round === 1 ? 'Which pile is your card in?' : 'The cards have moved. Which pile is your card in now?';
      action = '';
    }
    body = `
      <div class="hp-table">
        <div class="hp-piles">
          ${piles.map((pile, p) => `
            <section class="hp-pile">
              <h2>Pile ${p + 1}</h2>
              <ul class="hp-cards">${pile.map((card, row) => cardHtml(card, row * 3 + p)).join('')}</ul>
              ${phase === 'choose' ? `<button class="hp-pick" data-pile="${p}">It's in pile ${p + 1} <kbd>${p + 1}</kbd></button>` : ''}
            </section>`).join('')}
        </div>
      </div>`;
  }

  app.innerHTML = `
    <ol class="hp-steps">${steps()}</ol>
    <h1 class="hp-title">${title}</h1>
    <p class="hp-text">${text}</p>
    ${body}
    <div class="hp-actions">${action}</div>
    <p class="hp-made">Plain JavaScript, no framework</p>`;
}

/* ---------- Input ---------- */

document.addEventListener('click', e => {
  if (e.target.closest('.hp-share summary')) return shareNatively(e, shareText(deck[10]), SHARE_URL);
  const button = e.target.closest('button');
  if (!button) return;
  if (button.dataset.pile) choose(Number(button.dataset.pile));
  else if (button.dataset.action === 'start') startChoosing();
  else if (button.dataset.action === 'again') newGame();
  else if (button.dataset.action === 'copy') {
    navigator.clipboard.writeText(SHARE_URL).then(
      () => { button.textContent = 'Link copied'; },
      () => { button.textContent = 'Copy failed'; });
  }
});

document.addEventListener('keydown', e => {
  if (['1', '2', '3'].includes(e.key)) choose(Number(e.key) - 1);
});

newGame();
