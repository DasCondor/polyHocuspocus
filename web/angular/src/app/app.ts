// Hocus Pocus - the 21-card trick, in Angular (signals + built-in control flow).
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

interface Card {
  id: number;
  rank: string;
  suit: string;
  red: boolean;
  name: string;
}

type Phase = 'remember' | 'choose' | 'reveal';

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES: Record<string, string> = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;

function makeCard(id: number): Card {
  const rank = RANKS[id % 13];
  const [suit, suitName] = SUITS[Math.floor(id / 13)];
  return { id, rank, suit, red: suit === '♥' || suit === '♦', name: `${RANK_NAMES[rank] ?? rank} of ${suitName}` };
}

/** Shuffle a full 52-card deck and keep 21 cards. */
function newDeck(): Card[] {
  const ids = [...Array(52).keys()];
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, 21).map(makeCard);
}

/** Deal one card at a time into three piles of seven. */
const deal = (deck: Card[]): Card[][] => [0, 1, 2].map(p => deck.filter((_, i) => i % 3 === p));

/** Stack the piles back up with the chosen pile in the middle. */
function collect(piles: Card[][], chosen: number): Card[] {
  const others = [0, 1, 2].filter(p => p !== chosen);
  if (Math.random() < 0.5) others.reverse();
  return [...piles[others[0]], ...piles[chosen], ...piles[others[1]]];
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKey($event)' },
  template: `
    <main class="hp">
      <ol class="hp-steps">
        @for (step of steps(); track $index) {
          <li [class.active]="step.state === 'active'" [class.done]="step.state === 'done'">{{ step.label }}</li>
        }
      </ol>

      @switch (phase()) {
        @case ('remember') {
          <h1 class="hp-title">Think of a card</h1>
          <p class="hp-text">Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind.</p>
        }
        @case ('choose') {
          <h1 class="hp-title">Round {{ round() }} of {{ rounds }}</h1>
          <p class="hp-text">
            {{ round() === 1 ? 'Which pile is your card in?' : 'The cards have moved. Which pile is your card in now?' }}
          </p>
        }
        @case ('reveal') {
          <h1 class="hp-title">Your card is…</h1>
          <p class="hp-text">After three rounds your card always ends up 11th in the deck. That is the whole trick.</p>
        }
      }

      @if (phase() === 'reveal') {
        <div class="hp-reveal">
          <ul class="hp-cards">
            <li class="hp-card hp-big" [class.red]="revealed().red" [attr.aria-label]="revealed().name">
              <span class="hp-corner">{{ revealed().rank }}<span>{{ revealed().suit }}</span></span>
              <span class="hp-pip" aria-hidden="true">{{ revealed().suit }}</span>
            </li>
          </ul>
          <p class="hp-name">{{ revealed().name }}</p>
        </div>
      } @else {
        <div class="hp-table">
          <div class="hp-piles">
            @for (pile of piles(); track round() * 10 + p; let p = $index) {
              <section class="hp-pile">
                <h2>Pile {{ p + 1 }}</h2>
                <ul class="hp-cards">
                  @for (card of pile; track card.id; let row = $index) {
                    <li class="hp-card" [class.red]="card.red" [style.--i]="row * 3 + p" [attr.aria-label]="card.name">
                      <span class="hp-corner">{{ card.rank }}<span>{{ card.suit }}</span></span>
                      <span class="hp-pip" aria-hidden="true">{{ card.suit }}</span>
                    </li>
                  }
                </ul>
                @if (phase() === 'choose') {
                  <button class="hp-pick" (click)="choose(p)">It's in pile {{ p + 1 }} <kbd>{{ p + 1 }}</kbd></button>
                }
              </section>
            }
          </div>
        </div>
      }

      <div class="hp-actions">
        @if (phase() === 'remember') {
          <button class="hp-primary" (click)="startChoosing()">I've got my card</button>
        } @else if (phase() === 'reveal') {
          <button class="hp-primary" (click)="newGame()">Play again</button>
        }
      </div>
      <p class="hp-made">Built with Angular</p>
    </main>
  `,
})
export class App {
  protected readonly rounds = ROUNDS;
  protected readonly deck = signal<Card[]>(newDeck());
  protected readonly piles = signal<Card[][]>(deal(this.deck()));
  protected readonly round = signal(0);
  protected readonly phase = signal<Phase>('remember');

  /** After three rounds the remembered card is always the 11th card. */
  protected readonly revealed = computed(() => this.deck()[10]);

  protected readonly steps = computed(() => {
    const now = ['remember', 'choose', 'reveal'].indexOf(this.phase());
    const labels = ['Remember', this.phase() === 'choose' ? `Choose ${this.round()}/${ROUNDS}` : 'Choose', 'Reveal'];
    return labels.map((label, i) => ({ label, state: i === now ? 'active' : i < now ? 'done' : '' }));
  });

  protected newGame(): void {
    const deck = newDeck();
    this.deck.set(deck);
    this.piles.set(deal(deck));
    this.round.set(0);
    this.phase.set('remember');
  }

  protected startChoosing(): void {
    this.round.set(1);
    this.phase.set('choose');
  }

  protected choose(p: number): void {
    if (this.phase() !== 'choose') return;
    const deck = collect(this.piles(), p);
    this.deck.set(deck);
    if (this.round() === ROUNDS) {
      this.phase.set('reveal');
    } else {
      this.round.update(r => r + 1);
      this.piles.set(deal(deck));
    }
  }

  protected onKey(event: KeyboardEvent): void {
    if (['1', '2', '3'].includes(event.key)) this.choose(Number(event.key) - 1);
  }
}
