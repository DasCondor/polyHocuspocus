// Hocus Pocus - the 21-card trick, in plain JavaScript (no framework).
'use strict';

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;

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
    action = '<button class="hp-primary" data-action="again">Play again</button>';
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
  const button = e.target.closest('button');
  if (!button) return;
  if (button.dataset.pile) choose(Number(button.dataset.pile));
  else if (button.dataset.action === 'start') startChoosing();
  else if (button.dataset.action === 'again') newGame();
});

document.addEventListener('keydown', e => {
  if (['1', '2', '3'].includes(e.key)) choose(Number(e.key) - 1);
});

newGame();
