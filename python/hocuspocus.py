#!/usr/bin/env python3
"""Hocus Pocus - the 21-card trick, in Python."""
import random
import sys

SUITS = ["Spades", "Hearts", "Clubs", "Diamonds"]
RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"]
ROUNDS = 3


def card_name(card):
    return f"{RANKS[card % 13]} of {SUITS[card // 13]}"


def new_deck():
    """Shuffle a full 52-card deck and keep 21 cards."""
    return random.sample(range(52), 21)


def deal(deck):
    """Deal one card at a time into three piles of seven."""
    return [deck[p::3] for p in range(3)]


def collect(piles, chosen):
    """Stack the piles back up with the chosen pile in the middle."""
    others = [p for p in range(3) if p != chosen]
    random.shuffle(others)
    return piles[others[0]] + piles[chosen] + piles[others[1]]


def show(piles):
    print("  " + "".join(f"Pile {p + 1}".ljust(20) for p in range(3)))
    for row in range(7):
        print("  " + "".join(card_name(pile[row]).ljust(20) for pile in piles))


def ask():
    while True:
        answer = input("\nWhich pile holds your card? [1-3]: ").strip()
        if answer in ("1", "2", "3"):
            return int(answer) - 1
        print("Please type 1, 2 or 3.")


def play():
    print("HOCUS POCUS - the 21-card trick")
    print("Remember one card. Don't say it - just tell me which pile it is in.")
    deck = new_deck()
    for round_no in range(1, ROUNDS + 1):
        piles = deal(deck)
        print(f"\nRound {round_no} of {ROUNDS}")
        show(piles)
        deck = collect(piles, ask())
    # After three rounds the remembered card is always the 11th card.
    print(f"\nHocus pocus... your card is the {card_name(deck[10])}!")


def self_test(games):
    passed = 0
    for _ in range(games):
        deck = new_deck()
        secret = random.choice(deck)
        for _ in range(ROUNDS):
            piles = deal(deck)
            chosen = next(p for p in range(3) if secret in piles[p])
            deck = collect(piles, chosen)
        passed += deck[10] == secret
    print(f"Self-test: {passed}/{games} tricks revealed the right card.")
    return passed == games


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        games = int(sys.argv[2]) if len(sys.argv) > 2 else 1000
        sys.exit(0 if self_test(games) else 1)
    try:
        play()
    except (EOFError, KeyboardInterrupt):
        print()
