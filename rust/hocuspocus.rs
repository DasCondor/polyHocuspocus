// Hocus Pocus - the 21-card trick, in Rust (no external crates).
use std::io::{self, BufRead, Write};
use std::time::{SystemTime, UNIX_EPOCH};

const SUITS: [&str; 4] = ["Spades", "Hearts", "Clubs", "Diamonds"];
const RANKS: [&str; 13] = [
    "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King",
];
const ROUNDS: usize = 3;

/// A tiny xorshift generator, so the program needs no `rand` crate.
struct Rng(u64);

impl Rng {
    fn new() -> Self {
        let nanos = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos() as u64;
        Rng(nanos | 1)
    }

    fn below(&mut self, n: usize) -> usize {
        self.0 ^= self.0 << 13;
        self.0 ^= self.0 >> 7;
        self.0 ^= self.0 << 17;
        (self.0 % n as u64) as usize
    }
}

fn card_name(card: usize) -> String {
    format!("{} of {}", RANKS[card % 13], SUITS[card / 13])
}

/// Shuffle a full 52-card deck and keep 21 cards.
fn new_deck(rng: &mut Rng) -> Vec<usize> {
    let mut cards: Vec<usize> = (0..52).collect();
    for i in (1..cards.len()).rev() {
        let j = rng.below(i + 1);
        cards.swap(i, j);
    }
    cards.truncate(21);
    cards
}

/// Deal one card at a time into three piles of seven.
fn deal(deck: &[usize]) -> Vec<Vec<usize>> {
    (0..3).map(|p| deck.iter().skip(p).step_by(3).copied().collect()).collect()
}

/// Stack the piles back up with the chosen pile in the middle.
fn collect(piles: &[Vec<usize>], chosen: usize, rng: &mut Rng) -> Vec<usize> {
    let (mut a, mut b) = ((chosen + 1) % 3, (chosen + 2) % 3);
    if rng.below(2) == 0 {
        std::mem::swap(&mut a, &mut b);
    }
    let mut deck = piles[a].clone();
    deck.extend(&piles[chosen]);
    deck.extend(&piles[b]);
    deck
}

fn show(piles: &[Vec<usize>]) {
    println!("  {:<20}{:<20}{:<20}", "Pile 1", "Pile 2", "Pile 3");
    for row in 0..7 {
        let line: String = piles
            .iter()
            .map(|pile| format!("{:<20}", card_name(pile[row])))
            .collect();
        println!("  {}", line);
    }
}

fn ask(lines: &mut impl Iterator<Item = io::Result<String>>) -> Option<usize> {
    loop {
        print!("\nWhich pile holds your card? [1-3]: ");
        io::stdout().flush().ok();
        let line = lines.next()?.ok()?;
        match line.trim() {
            answer @ ("1" | "2" | "3") => return Some(answer.parse::<usize>().unwrap() - 1),
            _ => println!("Please type 1, 2 or 3."),
        }
    }
}

fn play(rng: &mut Rng) {
    println!("HOCUS POCUS - the 21-card trick");
    println!("Remember one card. Don't say it - just tell me which pile it is in.");
    let mut lines = io::stdin().lock().lines();
    let mut deck = new_deck(rng);
    for round in 1..=ROUNDS {
        let piles = deal(&deck);
        println!("\nRound {} of {}", round, ROUNDS);
        show(&piles);
        match ask(&mut lines) {
            Some(chosen) => deck = collect(&piles, chosen, rng),
            None => {
                println!();
                return;
            }
        }
    }
    // After three rounds the remembered card is always the 11th card.
    println!("\nHocus pocus... your card is the {}!", card_name(deck[10]));
}

fn self_test(games: usize, rng: &mut Rng) -> bool {
    let mut passed = 0;
    for _ in 0..games {
        let mut deck = new_deck(rng);
        let secret = deck[rng.below(21)];
        for _ in 0..ROUNDS {
            let piles = deal(&deck);
            let chosen = (0..3).find(|&p| piles[p].contains(&secret)).unwrap();
            deck = collect(&piles, chosen, rng);
        }
        if deck[10] == secret {
            passed += 1;
        }
    }
    println!("Self-test: {}/{} tricks revealed the right card.", passed, games);
    passed == games
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let mut rng = Rng::new();
    if args.len() > 1 && args[1] == "--test" {
        let games = args.get(2).and_then(|s| s.parse().ok()).unwrap_or(1000);
        std::process::exit(if self_test(games, &mut rng) { 0 } else { 1 });
    }
    play(&mut rng);
}
