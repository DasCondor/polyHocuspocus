// Hocus Pocus - the 21-card trick, in Kotlin.
import kotlin.random.Random
import kotlin.system.exitProcess

val SUITS = listOf("Spades", "Hearts", "Clubs", "Diamonds")
val RANKS = listOf("Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King")
const val ROUNDS = 3

fun cardName(card: Int) = "${RANKS[card % 13]} of ${SUITS[card / 13]}"

/** Shuffle a full 52-card deck and keep 21 cards. */
fun newDeck(): List<Int> = (0 until 52).shuffled().take(21)

/** Deal one card at a time into three piles of seven. */
fun deal(deck: List<Int>): List<List<Int>> =
    (0 until 3).map { p -> deck.filterIndexed { i, _ -> i % 3 == p } }

/** Stack the piles back up with the chosen pile in the middle. */
fun collect(piles: List<List<Int>>, chosen: Int): List<Int> {
    val (a, b) = listOf((chosen + 1) % 3, (chosen + 2) % 3).shuffled()
    return piles[a] + piles[chosen] + piles[b]
}

fun show(piles: List<List<Int>>) {
    println("  " + (1..3).joinToString("") { "Pile $it".padEnd(20) })
    for (row in 0 until 7) {
        println("  " + piles.joinToString("") { cardName(it[row]).padEnd(20) })
    }
}

/** Returns the chosen pile (0-2), or null when input runs out. */
fun ask(): Int? {
    while (true) {
        print("\nWhich pile holds your card? [1-3]: ")
        val answer = readlnOrNull()?.trim() ?: return null
        if (answer in listOf("1", "2", "3")) return answer.toInt() - 1
        println("Please type 1, 2 or 3.")
    }
}

fun play() {
    println("HOCUS POCUS - the 21-card trick")
    println("Remember one card. Don't say it - just tell me which pile it is in.")
    var deck = newDeck()
    for (round in 1..ROUNDS) {
        val piles = deal(deck)
        println("\nRound $round of $ROUNDS")
        show(piles)
        val chosen = ask() ?: run { println(); return }
        deck = collect(piles, chosen)
    }
    // After three rounds the remembered card is always the 11th card.
    println("\nHocus pocus... your card is the ${cardName(deck[10])}!")
}

fun selfTest(games: Int): Boolean {
    var passed = 0
    repeat(games) {
        var deck = newDeck()
        val secret = deck[Random.nextInt(21)]
        repeat(ROUNDS) {
            val piles = deal(deck)
            deck = collect(piles, piles.indexOfFirst { secret in it })
        }
        if (deck[10] == secret) passed++
    }
    println("Self-test: $passed/$games tricks revealed the right card.")
    return passed == games
}

fun main(args: Array<String>) {
    if (args.firstOrNull() == "--test") {
        exitProcess(if (selfTest(args.getOrNull(1)?.toInt() ?: 1000)) 0 else 1)
    }
    play()
}
