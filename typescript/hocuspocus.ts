// Hocus Pocus - the 21-card trick, in TypeScript.
// Runs directly on Node.js 22.18+ (built-in type stripping): node hocuspocus.ts
import * as readline from 'node:readline';

type Card = number; // 0..51
type Piles = [Card[], Card[], Card[]];

const SUITS = ['Spades', 'Hearts', 'Clubs', 'Diamonds'] as const;
const RANKS = ['Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'] as const;
const ROUNDS = 3;

const cardName = (card: Card): string => `${RANKS[card % 13]} of ${SUITS[Math.floor(card / 13)]}`;
const randomInt = (n: number): number => Math.floor(Math.random() * n);

/** Shuffle a full 52-card deck and keep 21 cards. */
function newDeck(): Card[] {
  const cards: Card[] = [...Array(52).keys()];
  for (let i = cards.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards.slice(0, 21);
}

/** Deal one card at a time into three piles of seven. */
function deal(deck: Card[]): Piles {
  const piles: Piles = [[], [], []];
  deck.forEach((card, i) => piles[i % 3].push(card));
  return piles;
}

/** Stack the piles back up with the chosen pile in the middle. */
function collect(piles: Piles, chosen: number): Card[] {
  const others = [0, 1, 2].filter(p => p !== chosen);
  if (Math.random() < 0.5) others.reverse();
  return [...piles[others[0]], ...piles[chosen], ...piles[others[1]]];
}

function show(piles: Piles): void {
  console.log('  ' + piles.map((_, p) => `Pile ${p + 1}`.padEnd(20)).join(''));
  for (let row = 0; row < 7; row++) {
    console.log('  ' + piles.map(pile => cardName(pile[row]).padEnd(20)).join(''));
  }
}

async function play(): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin });
  const lines = rl[Symbol.asyncIterator]();

  const ask = async (): Promise<number | null> => {
    for (;;) {
      process.stdout.write('\nWhich pile holds your card? [1-3]: ');
      const next = await lines.next();
      if (next.done) return null;
      const answer: string = next.value.trim();
      if (['1', '2', '3'].includes(answer)) return Number(answer) - 1;
      console.log('Please type 1, 2 or 3.');
    }
  };

  console.log('HOCUS POCUS - the 21-card trick');
  console.log("Remember one card. Don't say it - just tell me which pile it is in.");
  let deck = newDeck();
  for (let round = 1; round <= ROUNDS; round++) {
    const piles = deal(deck);
    console.log(`\nRound ${round} of ${ROUNDS}`);
    show(piles);
    const chosen = await ask();
    if (chosen === null) {
      console.log();
      rl.close();
      return;
    }
    deck = collect(piles, chosen);
  }
  rl.close();
  // After three rounds the remembered card is always the 11th card.
  console.log(`\nHocus pocus... your card is the ${cardName(deck[10])}!`);
}

function selfTest(games: number): boolean {
  let passed = 0;
  for (let g = 0; g < games; g++) {
    let deck = newDeck();
    const secret = deck[randomInt(21)];
    for (let r = 0; r < ROUNDS; r++) {
      const piles = deal(deck);
      deck = collect(piles, piles.findIndex(pile => pile.includes(secret)));
    }
    if (deck[10] === secret) passed++;
  }
  console.log(`Self-test: ${passed}/${games} tricks revealed the right card.`);
  return passed === games;
}

const args = process.argv.slice(2);
if (args[0] === '--test') {
  process.exit(selfTest(Number(args[1] ?? 1000)) ? 0 : 1);
} else {
  await play();
}
