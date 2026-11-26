// Hocus Pocus - the 21-card trick, in Java.
// Java 11+ runs it straight from source: java HocusPocus.java
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class HocusPocus {
    static final String[] SUITS = {"Spades", "Hearts", "Clubs", "Diamonds"};
    static final String[] RANKS = {"Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"};
    static final int ROUNDS = 3;
    static final Random RNG = new Random();

    static String cardName(int card) {
        return RANKS[card % 13] + " of " + SUITS[card / 13];
    }

    /** Shuffle a full 52-card deck and keep 21 cards. */
    static List<Integer> newDeck() {
        List<Integer> cards = IntStream.range(0, 52).boxed().collect(Collectors.toList());
        Collections.shuffle(cards, RNG);
        return new ArrayList<>(cards.subList(0, 21));
    }

    /** Deal one card at a time into three piles of seven. */
    static List<List<Integer>> deal(List<Integer> deck) {
        List<List<Integer>> piles = List.of(new ArrayList<>(), new ArrayList<>(), new ArrayList<>());
        for (int i = 0; i < deck.size(); i++) piles.get(i % 3).add(deck.get(i));
        return piles;
    }

    /** Stack the piles back up with the chosen pile in the middle. */
    static List<Integer> collect(List<List<Integer>> piles, int chosen) {
        int a = (chosen + 1) % 3, b = (chosen + 2) % 3;
        if (RNG.nextBoolean()) { int t = a; a = b; b = t; }
        List<Integer> deck = new ArrayList<>(piles.get(a));
        deck.addAll(piles.get(chosen));
        deck.addAll(piles.get(b));
        return deck;
    }

    static void show(List<List<Integer>> piles) {
        System.out.printf("  %-20s%-20s%-20s%n", "Pile 1", "Pile 2", "Pile 3");
        for (int row = 0; row < 7; row++) {
            StringBuilder line = new StringBuilder("  ");
            for (List<Integer> pile : piles) line.append(String.format("%-20s", cardName(pile.get(row))));
            System.out.println(line);
        }
    }

    /** Returns the chosen pile (0-2), or -1 when input runs out. */
    static int ask(BufferedReader in) throws IOException {
        while (true) {
            System.out.print("\nWhich pile holds your card? [1-3]: ");
            System.out.flush();
            String line = in.readLine();
            if (line == null) return -1;
            String answer = line.trim();
            if (answer.equals("1") || answer.equals("2") || answer.equals("3")) return Integer.parseInt(answer) - 1;
            System.out.println("Please type 1, 2 or 3.");
        }
    }

    static void play() throws IOException {
        System.out.println("HOCUS POCUS - the 21-card trick");
        System.out.println("Remember one card. Don't say it - just tell me which pile it is in.");
        BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
        List<Integer> deck = newDeck();
        for (int round = 1; round <= ROUNDS; round++) {
            List<List<Integer>> piles = deal(deck);
            System.out.printf("%nRound %d of %d%n", round, ROUNDS);
            show(piles);
            int chosen = ask(in);
            if (chosen < 0) {
                System.out.println();
                return;
            }
            deck = collect(piles, chosen);
        }
        // After three rounds the remembered card is always the 11th card.
        System.out.println("\nHocus pocus... your card is the " + cardName(deck.get(10)) + "!");
    }

    static boolean selfTest(int games) {
        int passed = 0;
        for (int g = 0; g < games; g++) {
            List<Integer> deck = newDeck();
            int secret = deck.get(RNG.nextInt(21));
            for (int r = 0; r < ROUNDS; r++) {
                List<List<Integer>> piles = deal(deck);
                int chosen = 0;
                for (int p = 0; p < 3; p++) if (piles.get(p).contains(secret)) chosen = p;
                deck = collect(piles, chosen);
            }
            if (deck.get(10) == secret) passed++;
        }
        System.out.printf("Self-test: %d/%d tricks revealed the right card.%n", passed, games);
        return passed == games;
    }

    public static void main(String[] args) throws IOException {
        if (args.length > 0 && args[0].equals("--test")) {
            System.exit(selfTest(args.length > 1 ? Integer.parseInt(args[1]) : 1000) ? 0 : 1);
        }
        play();
    }
}
