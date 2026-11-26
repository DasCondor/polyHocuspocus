#!/usr/bin/env bash
# Hocus Pocus - the 21-card trick, in Bash.
# Bash has no nested arrays, so the deck is one array and piles are read
# straight out of it: pile p holds the cards at positions p, p+3, p+6, ...

SUITS=(Spades Hearts Clubs Diamonds)
RANKS=(Ace 2 3 4 5 6 7 8 9 10 Jack Queen King)
ROUNDS=3

card_name() { echo "${RANKS[$1 % 13]} of ${SUITS[$1 / 13]}"; }

# Shuffle a full 52-card deck and keep 21 cards in DECK.
new_deck() {
  local cards=($(seq 0 51)) i j t
  for ((i = 51; i > 0; i--)); do
    j=$((RANDOM % (i + 1)))
    t=${cards[i]}; cards[i]=${cards[j]}; cards[j]=$t
  done
  DECK=("${cards[@]:0:21}")
}

# Card in pile $1 (0-2), row $2 (0-6), as dealt one card at a time.
pile_card() { echo "${DECK[$2 * 3 + $1]}"; }

# Stack the piles back up with pile $1 in the middle.
collect() {
  local chosen=$1 a=$(( ($1 + 1) % 3 )) b=$(( ($1 + 2) % 3 )) t p row next=()
  if ((RANDOM % 2)); then t=$a; a=$b; b=$t; fi
  for p in $a $chosen $b; do
    for ((row = 0; row < 7; row++)); do next+=("${DECK[row * 3 + p]}"); done
  done
  DECK=("${next[@]}")
}

show() {
  local row p line
  printf '  %-20s%-20s%-20s\n' 'Pile 1' 'Pile 2' 'Pile 3'
  for ((row = 0; row < 7; row++)); do
    line='  '
    for p in 0 1 2; do line+=$(printf '%-20s' "$(card_name "$(pile_card $p $row)")"); done
    echo "$line"
  done
}

# Sets CHOSEN to the pile (0-2); returns 1 when input runs out.
ask() {
  local answer
  while true; do
    printf '\nWhich pile holds your card? [1-3]: '
    read -r answer || return 1
    answer=${answer//[[:space:]]/}
    case $answer in
      1 | 2 | 3) CHOSEN=$((answer - 1)); return 0 ;;
      *) echo 'Please type 1, 2 or 3.' ;;
    esac
  done
}

play() {
  echo 'HOCUS POCUS - the 21-card trick'
  echo "Remember one card. Don't say it - just tell me which pile it is in."
  new_deck
  local round
  for ((round = 1; round <= ROUNDS; round++)); do
    printf '\nRound %d of %d\n' "$round" "$ROUNDS"
    show
    ask || { echo; return; }
    collect "$CHOSEN"
  done
  # After three rounds the remembered card is always the 11th card.
  printf '\nHocus pocus... your card is the %s!\n' "$(card_name "${DECK[10]}")"
}

self_test() {
  local games=$1 passed=0 g r i secret
  for ((g = 0; g < games; g++)); do
    new_deck
    secret=${DECK[RANDOM % 21]}
    for ((r = 0; r < ROUNDS; r++)); do
      for ((i = 0; i < 21; i++)); do
        ((DECK[i] == secret)) && break
      done
      collect $((i % 3))
    done
    ((DECK[10] == secret)) && ((passed++))
  done
  echo "Self-test: $passed/$games tricks revealed the right card."
  ((passed == games))
}

if [[ $1 == --test ]]; then
  self_test "${2:-1000}"
  exit
fi
play
