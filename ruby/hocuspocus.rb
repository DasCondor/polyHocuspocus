#!/usr/bin/env ruby
# Hocus Pocus - the 21-card trick, in Ruby.

SUITS = %w[Spades Hearts Clubs Diamonds].freeze
RANKS = %w[Ace 2 3 4 5 6 7 8 9 10 Jack Queen King].freeze
ROUNDS = 3

def card_name(card)
  "#{RANKS[card % 13]} of #{SUITS[card / 13]}"
end

# Shuffle a full 52-card deck and keep 21 cards.
def new_deck
  (0...52).to_a.sample(21)
end

# Deal one card at a time into three piles of seven.
def deal(deck)
  (0...3).map { |p| deck.select.with_index { |_, i| i % 3 == p } }
end

# Stack the piles back up with the chosen pile in the middle.
def collect(piles, chosen)
  a, b = [(chosen + 1) % 3, (chosen + 2) % 3].shuffle
  piles[a] + piles[chosen] + piles[b]
end

def show(piles)
  puts '  ' + (1..3).map { |p| "Pile #{p}".ljust(20) }.join
  7.times do |row|
    puts '  ' + piles.map { |pile| card_name(pile[row]).ljust(20) }.join
  end
end

# Returns the chosen pile (0-2), or nil when input runs out.
def ask
  loop do
    print "\nWhich pile holds your card? [1-3]: "
    $stdout.flush
    line = $stdin.gets or return nil
    answer = line.strip
    return answer.to_i - 1 if %w[1 2 3].include?(answer)

    puts 'Please type 1, 2 or 3.'
  end
end

def play
  puts 'HOCUS POCUS - the 21-card trick'
  puts "Remember one card. Don't say it - just tell me which pile it is in."
  deck = new_deck
  (1..ROUNDS).each do |round|
    piles = deal(deck)
    puts "\nRound #{round} of #{ROUNDS}"
    show(piles)
    chosen = ask
    return puts if chosen.nil?

    deck = collect(piles, chosen)
  end
  # After three rounds the remembered card is always the 11th card.
  puts "\nHocus pocus... your card is the #{card_name(deck[10])}!"
end

def self_test(games)
  passed = games.times.count do
    deck = new_deck
    secret = deck.sample
    ROUNDS.times do
      piles = deal(deck)
      deck = collect(piles, piles.index { |pile| pile.include?(secret) })
    end
    deck[10] == secret
  end
  puts "Self-test: #{passed}/#{games} tricks revealed the right card."
  passed == games
end

if ARGV[0] == '--test'
  exit(self_test((ARGV[1] || 1000).to_i) ? 0 : 1)
else
  begin
    play
  rescue Interrupt
    puts
  end
end
