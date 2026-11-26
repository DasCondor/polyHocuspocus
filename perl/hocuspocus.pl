#!/usr/bin/env perl
# Hocus Pocus - the 21-card trick, in Perl.
use strict;
use warnings;
use List::Util qw(shuffle first);

my @SUITS  = qw(Spades Hearts Clubs Diamonds);
my @RANKS  = qw(Ace 2 3 4 5 6 7 8 9 10 Jack Queen King);
my $ROUNDS = 3;
$| = 1;    # flush output straight away so prompts appear

sub card_name {
    my ($card) = @_;
    return "$RANKS[$card % 13] of $SUITS[int($card / 13)]";
}

# Shuffle a full 52-card deck and keep 21 cards.
sub new_deck { return [ (shuffle 0 .. 51)[0 .. 20] ] }

# Deal one card at a time into three piles of seven.
sub deal {
    my ($deck) = @_;
    my @piles = ([], [], []);
    push @{ $piles[ $_ % 3 ] }, $deck->[$_] for 0 .. $#$deck;
    return \@piles;
}

# Stack the piles back up with the chosen pile in the middle.
sub collect {
    my ($piles, $chosen) = @_;
    my ($x, $y) = shuffle(($chosen + 1) % 3, ($chosen + 2) % 3);
    return [ map { @{ $piles->[$_] } } $x, $chosen, $y ];
}

sub show {
    my ($piles) = @_;
    printf "  %-20s%-20s%-20s\n", 'Pile 1', 'Pile 2', 'Pile 3';
    for my $row (0 .. 6) {
        printf "  %-20s%-20s%-20s\n", map { card_name($_->[$row]) } @$piles;
    }
}

# Returns the chosen pile (0-2), or undef when input runs out.
sub ask {
    while (1) {
        print "\nWhich pile holds your card? [1-3]: ";
        my $line = <STDIN>;
        return undef unless defined $line;
        $line =~ s/^\s+|\s+$//g;
        return $line - 1 if $line =~ /^[123]$/;
        print "Please type 1, 2 or 3.\n";
    }
}

sub play {
    print "HOCUS POCUS - the 21-card trick\n";
    print "Remember one card. Don't say it - just tell me which pile it is in.\n";
    my $deck = new_deck();
    for my $round (1 .. $ROUNDS) {
        my $piles = deal($deck);
        print "\nRound $round of $ROUNDS\n";
        show($piles);
        my $chosen = ask();
        if (!defined $chosen) { print "\n"; return }
        $deck = collect($piles, $chosen);
    }
    # After three rounds the remembered card is always the 11th card.
    printf "\nHocus pocus... your card is the %s!\n", card_name($deck->[10]);
}

sub self_test {
    my ($games) = @_;
    my $passed = 0;
    for (1 .. $games) {
        my $deck   = new_deck();
        my $secret = $deck->[ int rand 21 ];
        for (1 .. $ROUNDS) {
            my $piles  = deal($deck);
            my $chosen = first {
                my $pile = $piles->[$_];
                grep { $_ == $secret } @$pile;
            } 0 .. 2;
            $deck = collect($piles, $chosen);
        }
        $passed++ if $deck->[10] == $secret;
    }
    print "Self-test: $passed/$games tricks revealed the right card.\n";
    return $passed == $games;
}

if (@ARGV && $ARGV[0] eq '--test') {
    exit(self_test($ARGV[1] // 1000) ? 0 : 1);
}
play();
