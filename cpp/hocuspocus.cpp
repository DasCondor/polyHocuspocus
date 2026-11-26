// Hocus Pocus - the 21-card trick, in C++17.
#include <algorithm>
#include <array>
#include <iomanip>
#include <iostream>
#include <numeric>
#include <random>
#include <sstream>
#include <string>
#include <vector>

using Deck = std::vector<int>;
using Piles = std::array<Deck, 3>;

const std::array<std::string, 4> SUITS{"Spades", "Hearts", "Clubs", "Diamonds"};
const std::array<std::string, 13> RANKS{"Ace", "2", "3", "4",  "5",     "6",    "7",
                                        "8",   "9", "10", "Jack", "Queen", "King"};
constexpr int ROUNDS = 3;

std::mt19937 rng{std::random_device{}()};

std::string cardName(int card) { return RANKS[card % 13] + " of " + SUITS[card / 13]; }

// Shuffle a full 52-card deck and keep 21 cards.
Deck newDeck() {
    Deck cards(52);
    std::iota(cards.begin(), cards.end(), 0);
    std::shuffle(cards.begin(), cards.end(), rng);
    cards.resize(21);
    return cards;
}

// Deal one card at a time into three piles of seven.
Piles deal(const Deck& deck) {
    Piles piles;
    for (std::size_t i = 0; i < deck.size(); ++i) piles[i % 3].push_back(deck[i]);
    return piles;
}

// Stack the piles back up with the chosen pile in the middle.
Deck collect(const Piles& piles, int chosen) {
    int a = (chosen + 1) % 3, b = (chosen + 2) % 3;
    if (std::uniform_int_distribution<int>(0, 1)(rng)) std::swap(a, b);
    Deck deck;
    for (int p : {a, chosen, b}) deck.insert(deck.end(), piles[p].begin(), piles[p].end());
    return deck;
}

void show(const Piles& piles) {
    std::cout << std::left << "  ";
    for (int p = 1; p <= 3; ++p) std::cout << std::setw(20) << ("Pile " + std::to_string(p));
    std::cout << '\n';
    for (int row = 0; row < 7; ++row) {
        std::cout << "  ";
        for (const auto& pile : piles) std::cout << std::setw(20) << cardName(pile[row]);
        std::cout << '\n';
    }
}

// Returns the chosen pile (0-2), or -1 when input runs out.
int ask() {
    std::string line;
    for (;;) {
        std::cout << "\nWhich pile holds your card? [1-3]: " << std::flush;
        if (!std::getline(std::cin, line)) return -1;
        std::istringstream words(line);
        std::string answer, extra;
        words >> answer;
        if (!(words >> extra) && (answer == "1" || answer == "2" || answer == "3"))
            return answer[0] - '1';
        std::cout << "Please type 1, 2 or 3.\n";
    }
}

void play() {
    std::cout << "HOCUS POCUS - the 21-card trick\n"
              << "Remember one card. Don't say it - just tell me which pile it is in.\n";
    Deck deck = newDeck();
    for (int round = 1; round <= ROUNDS; ++round) {
        Piles piles = deal(deck);
        std::cout << "\nRound " << round << " of " << ROUNDS << '\n';
        show(piles);
        int chosen = ask();
        if (chosen < 0) {
            std::cout << '\n';
            return;
        }
        deck = collect(piles, chosen);
    }
    // After three rounds the remembered card is always the 11th card.
    std::cout << "\nHocus pocus... your card is the " << cardName(deck[10]) << "!\n";
}

bool selfTest(int games) {
    int passed = 0;
    for (int g = 0; g < games; ++g) {
        Deck deck = newDeck();
        int secret = deck[std::uniform_int_distribution<int>(0, 20)(rng)];
        for (int r = 0; r < ROUNDS; ++r) {
            Piles piles = deal(deck);
            int chosen = 0;
            for (int p = 0; p < 3; ++p)
                if (std::find(piles[p].begin(), piles[p].end(), secret) != piles[p].end())
                    chosen = p;
            deck = collect(piles, chosen);
        }
        if (deck[10] == secret) ++passed;
    }
    std::cout << "Self-test: " << passed << '/' << games << " tricks revealed the right card.\n";
    return passed == games;
}

int main(int argc, char** argv) {
    if (argc > 1 && std::string(argv[1]) == "--test")
        return selfTest(argc > 2 ? std::stoi(argv[2]) : 1000) ? 0 : 1;
    play();
}
