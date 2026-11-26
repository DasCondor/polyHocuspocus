/* Hocus Pocus - the 21-card trick, in C. */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#define DECK 21
#define ROUNDS 3

static const char *SUITS[] = {"Spades", "Hearts", "Clubs", "Diamonds"};
static const char *RANKS[] = {"Ace", "2", "3", "4", "5", "6", "7",
                              "8", "9", "10", "Jack", "Queen", "King"};

static void card_name(int card, char *out, size_t size) {
    snprintf(out, size, "%s of %s", RANKS[card % 13], SUITS[card / 13]);
}

/* Shuffle a full 52-card deck and keep 21 cards. */
static void new_deck(int deck[DECK]) {
    int cards[52];
    for (int i = 0; i < 52; i++) cards[i] = i;
    for (int i = 51; i > 0; i--) {
        int j = rand() % (i + 1);
        int t = cards[i];
        cards[i] = cards[j];
        cards[j] = t;
    }
    memcpy(deck, cards, DECK * sizeof(int));
}

/* Deal one card at a time into three piles of seven. */
static void deal(const int deck[DECK], int piles[3][7]) {
    for (int i = 0; i < DECK; i++) piles[i % 3][i / 3] = deck[i];
}

/* Stack the piles back up with the chosen pile in the middle. */
static void collect(int piles[3][7], int chosen, int deck[DECK]) {
    int a = (chosen + 1) % 3, b = (chosen + 2) % 3;
    if (rand() % 2) {
        int t = a;
        a = b;
        b = t;
    }
    int order[3] = {a, chosen, b};
    for (int k = 0; k < 3; k++) memcpy(deck + k * 7, piles[order[k]], 7 * sizeof(int));
}

static void show(int piles[3][7]) {
    char name[32];
    printf("  %-20s%-20s%-20s\n", "Pile 1", "Pile 2", "Pile 3");
    for (int row = 0; row < 7; row++) {
        printf("  ");
        for (int p = 0; p < 3; p++) {
            card_name(piles[p][row], name, sizeof name);
            printf("%-20s", name);
        }
        printf("\n");
    }
}

/* Returns the chosen pile (0-2), or -1 when input runs out. */
static int ask(void) {
    char line[64], word[8], extra;
    for (;;) {
        printf("\nWhich pile holds your card? [1-3]: ");
        fflush(stdout);
        if (!fgets(line, sizeof line, stdin)) return -1;
        if (sscanf(line, "%7s %c", word, &extra) == 1 && strlen(word) == 1 &&
            word[0] >= '1' && word[0] <= '3')
            return word[0] - '1';
        printf("Please type 1, 2 or 3.\n");
    }
}

static void play(void) {
    int deck[DECK], piles[3][7];
    char name[32];
    printf("HOCUS POCUS - the 21-card trick\n");
    printf("Remember one card. Don't say it - just tell me which pile it is in.\n");
    new_deck(deck);
    for (int round = 1; round <= ROUNDS; round++) {
        deal(deck, piles);
        printf("\nRound %d of %d\n", round, ROUNDS);
        show(piles);
        int chosen = ask();
        if (chosen < 0) {
            printf("\n");
            return;
        }
        collect(piles, chosen, deck);
    }
    /* After three rounds the remembered card is always the 11th card. */
    card_name(deck[10], name, sizeof name);
    printf("\nHocus pocus... your card is the %s!\n", name);
}

static int self_test(int games) {
    int passed = 0, deck[DECK], piles[3][7];
    for (int g = 0; g < games; g++) {
        new_deck(deck);
        int secret = deck[rand() % DECK];
        for (int r = 0; r < ROUNDS; r++) {
            deal(deck, piles);
            int chosen = 0;
            for (int p = 0; p < 3; p++)
                for (int row = 0; row < 7; row++)
                    if (piles[p][row] == secret) chosen = p;
            collect(piles, chosen, deck);
        }
        if (deck[10] == secret) passed++;
    }
    printf("Self-test: %d/%d tricks revealed the right card.\n", passed, games);
    return passed == games;
}

int main(int argc, char **argv) {
    srand((unsigned)time(NULL));
    if (argc > 1 && strcmp(argv[1], "--test") == 0)
        return self_test(argc > 2 ? atoi(argv[2]) : 1000) ? 0 : 1;
    play();
    return 0;
}
