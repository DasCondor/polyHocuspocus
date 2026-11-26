// Hocus Pocus - the 21-card trick, in Go.
package main

import (
	"bufio"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
)

var suits = []string{"Spades", "Hearts", "Clubs", "Diamonds"}
var ranks = []string{"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"}

const rounds = 3

func cardName(card int) string { return ranks[card%13] + " of " + suits[card/13] }

// newDeck shuffles a full 52-card deck and keeps 21 cards.
func newDeck() []int { return rand.Perm(52)[:21] }

// deal deals one card at a time into three piles of seven.
func deal(deck []int) [3][]int {
	var piles [3][]int
	for i, card := range deck {
		piles[i%3] = append(piles[i%3], card)
	}
	return piles
}

// collect stacks the piles back up with the chosen pile in the middle.
func collect(piles [3][]int, chosen int) []int {
	a, b := (chosen+1)%3, (chosen+2)%3
	if rand.Intn(2) == 0 {
		a, b = b, a
	}
	deck := make([]int, 0, 21)
	deck = append(deck, piles[a]...)
	deck = append(deck, piles[chosen]...)
	return append(deck, piles[b]...)
}

func show(piles [3][]int) {
	fmt.Printf("  %-20s%-20s%-20s\n", "Pile 1", "Pile 2", "Pile 3")
	for row := 0; row < 7; row++ {
		fmt.Print("  ")
		for _, pile := range piles {
			fmt.Printf("%-20s", cardName(pile[row]))
		}
		fmt.Println()
	}
}

func ask(in *bufio.Scanner) (int, bool) {
	for {
		fmt.Print("\nWhich pile holds your card? [1-3]: ")
		if !in.Scan() {
			return 0, false
		}
		answer := strings.TrimSpace(in.Text())
		if answer == "1" || answer == "2" || answer == "3" {
			n, _ := strconv.Atoi(answer)
			return n - 1, true
		}
		fmt.Println("Please type 1, 2 or 3.")
	}
}

func play() {
	fmt.Println("HOCUS POCUS - the 21-card trick")
	fmt.Println("Remember one card. Don't say it - just tell me which pile it is in.")
	in := bufio.NewScanner(os.Stdin)
	deck := newDeck()
	for round := 1; round <= rounds; round++ {
		piles := deal(deck)
		fmt.Printf("\nRound %d of %d\n", round, rounds)
		show(piles)
		chosen, ok := ask(in)
		if !ok {
			fmt.Println()
			return
		}
		deck = collect(piles, chosen)
	}
	// After three rounds the remembered card is always the 11th card.
	fmt.Printf("\nHocus pocus... your card is the %s!\n", cardName(deck[10]))
}

func selfTest(games int) bool {
	passed := 0
	for g := 0; g < games; g++ {
		deck := newDeck()
		secret := deck[rand.Intn(21)]
		for r := 0; r < rounds; r++ {
			piles := deal(deck)
			chosen := 0
			for p := range piles {
				for _, card := range piles[p] {
					if card == secret {
						chosen = p
					}
				}
			}
			deck = collect(piles, chosen)
		}
		if deck[10] == secret {
			passed++
		}
	}
	fmt.Printf("Self-test: %d/%d tricks revealed the right card.\n", passed, games)
	return passed == games
}

func main() {
	if len(os.Args) > 1 && os.Args[1] == "--test" {
		games := 1000
		if len(os.Args) > 2 {
			games, _ = strconv.Atoi(os.Args[2])
		}
		if !selfTest(games) {
			os.Exit(1)
		}
		return
	}
	play()
}
