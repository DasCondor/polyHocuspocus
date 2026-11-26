<!-- Hocus Pocus - the 21-card trick, in Vue (Composition API). -->
<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

const SUITS = [['♠', 'Spades'], ['♥', 'Hearts'], ['♣', 'Clubs'], ['♦', 'Diamonds']];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const RANK_NAMES = { A: 'Ace', J: 'Jack', Q: 'Queen', K: 'King' };
const ROUNDS = 3;
const SHARE_URL = 'https://dascondor.github.io/polyHocuspocus/#play/web-vue';

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

const deck = ref(newDeck());
const round = ref(0);
const phase = ref('remember'); // remember | choose | reveal

const piles = computed(() => deal(deck.value));
// After three rounds the remembered card is always the 11th card.
const revealed = computed(() => deck.value[10]);

const steps = computed(() => {
  const now = ['remember', 'choose', 'reveal'].indexOf(phase.value);
  const labels = ['Remember', phase.value === 'choose' ? `Choose ${round.value}/${ROUNDS}` : 'Choose', 'Reveal'];
  return labels.map((label, i) => ({ label, state: i === now ? 'active' : i < now ? 'done' : '' }));
});

const title = computed(() =>
  phase.value === 'remember' ? 'Think of a card'
    : phase.value === 'choose' ? `Round ${round.value} of ${ROUNDS}`
      : 'Your card is…');

const text = computed(() =>
  phase.value === 'remember' ? "Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind."
    : phase.value === 'reveal' ? 'After three rounds your card always ends up 11th in the deck. That is the whole trick.'
      : round.value === 1 ? 'Which pile is your card in?'
        : 'The cards have moved. Which pile is your card in now?');

const shareText = computed(() => `The 21-card trick found my card: the ${revealed.value.name}! Think of a card and try it:`);
const shareLinks = computed(() => {
  const text = shareText.value;
  const url = SHARE_URL;
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  return [
    ['WhatsApp', `https://wa.me/?text=${t}%20${u}`],
    ['X', `https://x.com/intent/post?text=${t}&url=${u}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${u}`],
    ['Reddit', `https://www.reddit.com/submit?url=${u}&title=${t}`],
    ['Email', `mailto:?subject=${encodeURIComponent('The 21-card trick')}&body=${t}%20${u}`],
  ];
});
const copyLabel = ref('Copy link');

// Phones get the native share sheet; other devices open the menu instead.
function shareNatively(e) {
  if (navigator.share && matchMedia('(pointer: coarse)').matches) {
    e.preventDefault();
    navigator.share({ title: 'Hocus Pocus', text: shareText.value, url: SHARE_URL }).catch(() => {});
  }
}

function copyLink() {
  navigator.clipboard.writeText(SHARE_URL).then(
    () => { copyLabel.value = 'Link copied'; },
    () => { copyLabel.value = 'Copy failed'; },
  );
}

function newGame() {
  deck.value = newDeck();
  round.value = 0;
  phase.value = 'remember';
  copyLabel.value = 'Copy link';
}

function startChoosing() {
  round.value = 1;
  phase.value = 'choose';
}

function choose(p) {
  if (phase.value !== 'choose') return;
  deck.value = collect(piles.value, p);
  if (round.value === ROUNDS) phase.value = 'reveal';
  else round.value++;
}

const onKey = e => {
  if (['1', '2', '3'].includes(e.key)) choose(Number(e.key) - 1);
};
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));
</script>

<template>
  <main class="hp">
    <ol class="hp-steps">
      <li v-for="(step, i) in steps" :key="i" :class="step.state">{{ step.label }}</li>
    </ol>
    <h1 class="hp-title">{{ title }}</h1>
    <p class="hp-text">{{ text }}</p>

    <div v-if="phase === 'reveal'" class="hp-reveal">
      <ul class="hp-cards">
        <li class="hp-card hp-big" :class="{ red: revealed.red }" :aria-label="revealed.name">
          <span class="hp-corner">{{ revealed.rank }}<span>{{ revealed.suit }}</span></span>
          <span class="hp-pip" aria-hidden="true">{{ revealed.suit }}</span>
        </li>
      </ul>
      <p class="hp-name">{{ revealed.name }}</p>
    </div>

    <div v-else class="hp-table">
      <div class="hp-piles">
        <section v-for="(pile, p) in piles" :key="`${round}-${p}`" class="hp-pile">
          <h2>Pile {{ p + 1 }}</h2>
          <ul class="hp-cards">
            <li
              v-for="(card, row) in pile"
              :key="card.id"
              class="hp-card"
              :class="{ red: card.red }"
              :style="{ '--i': row * 3 + p }"
              :aria-label="card.name"
            >
              <span class="hp-corner">{{ card.rank }}<span>{{ card.suit }}</span></span>
              <span class="hp-pip" aria-hidden="true">{{ card.suit }}</span>
            </li>
          </ul>
          <button v-if="phase === 'choose'" class="hp-pick" @click="choose(p)">
            It's in pile {{ p + 1 }} <kbd>{{ p + 1 }}</kbd>
          </button>
        </section>
      </div>
    </div>

    <div class="hp-actions">
      <button v-if="phase === 'remember'" class="hp-primary" @click="startChoosing">I've got my card</button>
      <template v-else-if="phase === 'reveal'">
        <button class="hp-primary" @click="newGame">Play again</button>
        <details class="hp-share">
          <summary class="hp-secondary" @click="shareNatively">Share</summary>
          <div class="hp-share-menu">
            <a v-for="[name, href] in shareLinks" :key="name" :href="href" target="_blank" rel="noopener">{{ name }}</a>
            <button class="hp-copy" type="button" @click="copyLink">{{ copyLabel }}</button>
          </div>
        </details>
        <a class="hp-coffee" href="https://buymeacoffee.com/dascondor" target="_blank" rel="noopener">☕ Buy me a coffee</a>
      </template>
    </div>
    <p class="hp-made">Built with Vue</p>
  </main>
</template>
