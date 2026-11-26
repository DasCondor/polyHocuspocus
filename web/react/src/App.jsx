// Hocus Pocus - the 21-card trick, in React (function component + hooks).
import { useEffect, useState } from 'react';

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;

function makeCard(id) {
  const rank = RANKS[id % 13];
  const [suit, suitName] = SUITS[Math.floor(id / 13)];
  return { id, rank, suit, red: suit === '♥' || suit === '♦', name: `${RANK_NAMES[rank] ?? rank} of ${suitName}` };
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

function newGame() {
  return { deck: newDeck(), round: 0, phase: 'remember' }; // phase: remember | choose | reveal
}

function Card({ card, i = 0, big = false }) {
  return (
    <li
      className={`hp-card${card.red ? ' red' : ''}${big ? ' hp-big' : ''}`}
      style={{ '--i': i }}
      aria-label={card.name}
    >
      <span className="hp-corner">
        {card.rank}
        <span>{card.suit}</span>
      </span>
      <span className="hp-pip" aria-hidden="true">{card.suit}</span>
    </li>
  );
}

function Steps({ phase, round }) {
  const now = ['remember', 'choose', 'reveal'].indexOf(phase);
  const labels = ['Remember', phase === 'choose' ? `Choose ${round}/${ROUNDS}` : 'Choose', 'Reveal'];
  return (
    <ol className="hp-steps">
      {labels.map((label, i) => (
        <li key={i} className={i === now ? 'active' : i < now ? 'done' : ''}>{label}</li>
      ))}
    </ol>
  );
}

export default function App() {
  const [game, setGame] = useState(newGame);
  const { deck, round, phase } = game;
  const piles = deal(deck); // the deck is always stored in dealing order

  function choose(p) {
    setGame(g => {
      if (g.phase !== 'choose') return g;
      const next = collect(deal(g.deck), p);
      return g.round === ROUNDS
        ? { deck: next, round: g.round, phase: 'reveal' }
        : { deck: next, round: g.round + 1, phase: 'choose' };
    });
  }

  useEffect(() => {
    const onKey = e => {
      if (['1', '2', '3'].includes(e.key)) choose(Number(e.key) - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  let title, text;
  if (phase === 'remember') {
    title = 'Think of a card';
    text = "Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind.";
  } else if (phase === 'choose') {
    title = `Round ${round} of ${ROUNDS}`;
    text = round === 1 ? 'Which pile is your card in?' : 'The cards have moved. Which pile is your card in now?';
  } else {
    title = 'Your card is…';
    text = 'After three rounds your card always ends up 11th in the deck. That is the whole trick.';
  }

  return (
    <main className="hp">
      <Steps phase={phase} round={round} />
      <h1 className="hp-title">{title}</h1>
      <p className="hp-text">{text}</p>

      {phase === 'reveal' ? (
        <div className="hp-reveal">
          {/* After three rounds the remembered card is always the 11th card. */}
          <ul className="hp-cards"><Card card={deck[10]} big /></ul>
          <p className="hp-name">{deck[10].name}</p>
        </div>
      ) : (
        <div className="hp-table">
          <div className="hp-piles">
            {piles.map((pile, p) => (
              <section className="hp-pile" key={`${round}-${p}`}>
                <h2>Pile {p + 1}</h2>
                <ul className="hp-cards">
                  {pile.map((card, row) => <Card key={card.id} card={card} i={row * 3 + p} />)}
                </ul>
                {phase === 'choose' && (
                  <button className="hp-pick" onClick={() => choose(p)}>
                    It's in pile {p + 1} <kbd>{p + 1}</kbd>
                  </button>
                )}
              </section>
            ))}
          </div>
        </div>
      )}

      <div className="hp-actions">
        {phase === 'remember' && (
          <button className="hp-primary" onClick={() => setGame({ ...game, round: 1, phase: 'choose' })}>
            I've got my card
          </button>
        )}
        {phase === 'reveal' && (
          <button className="hp-primary" onClick={() => setGame(newGame())}>Play again</button>
        )}
      </div>
      <p className="hp-made">Built with React</p>
    </main>
  );
}
