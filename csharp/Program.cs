// Hocus Pocus - the 21-card trick, in C#.
using System;
using System.Collections.Generic;
using System.Linq;

string[] suits = { "Spades", "Hearts", "Clubs", "Diamonds" };
string[] ranks = { "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King" };
const int Rounds = 3;
var rng = new Random();

string CardName(int card) => $"{ranks[card % 13]} of {suits[card / 13]}";

// Shuffle a full 52-card deck and keep 21 cards.
List<int> NewDeck() => Enumerable.Range(0, 52).OrderBy(_ => rng.Next()).Take(21).ToList();

// Deal one card at a time into three piles of seven.
List<int>[] Deal(List<int> deck) =>
    Enumerable.Range(0, 3).Select(p => deck.Where((_, i) => i % 3 == p).ToList()).ToArray();

// Stack the piles back up with the chosen pile in the middle.
List<int> Collect(List<int>[] piles, int chosen)
{
    int a = (chosen + 1) % 3, b = (chosen + 2) % 3;
    if (rng.Next(2) == 0) (a, b) = (b, a);
    return piles[a].Concat(piles[chosen]).Concat(piles[b]).ToList();
}

void Show(List<int>[] piles)
{
    Console.WriteLine($"  {"Pile 1",-20}{"Pile 2",-20}{"Pile 3",-20}");
    for (int row = 0; row < 7; row++)
        Console.WriteLine("  " + string.Concat(piles.Select(pile => CardName(pile[row]).PadRight(20))));
}

// Returns the chosen pile (0-2), or null when input runs out.
int? Ask()
{
    while (true)
    {
        Console.Write("\nWhich pile holds your card? [1-3]: ");
        string? line = Console.ReadLine();
        if (line is null) return null;
        string answer = line.Trim();
        if (answer is "1" or "2" or "3") return int.Parse(answer) - 1;
        Console.WriteLine("Please type 1, 2 or 3.");
    }
}

void Play()
{
    Console.WriteLine("HOCUS POCUS - the 21-card trick");
    Console.WriteLine("Remember one card. Don't say it - just tell me which pile it is in.");
    var deck = NewDeck();
    for (int round = 1; round <= Rounds; round++)
    {
        var piles = Deal(deck);
        Console.WriteLine($"\nRound {round} of {Rounds}");
        Show(piles);
        if (Ask() is not int chosen)
        {
            Console.WriteLine();
            return;
        }
        deck = Collect(piles, chosen);
    }
    // After three rounds the remembered card is always the 11th card.
    Console.WriteLine($"\nHocus pocus... your card is the {CardName(deck[10])}!");
}

bool SelfTest(int games)
{
    int passed = 0;
    for (int g = 0; g < games; g++)
    {
        var deck = NewDeck();
        int secret = deck[rng.Next(21)];
        for (int r = 0; r < Rounds; r++)
        {
            var piles = Deal(deck);
            deck = Collect(piles, Array.FindIndex(piles, pile => pile.Contains(secret)));
        }
        if (deck[10] == secret) passed++;
    }
    Console.WriteLine($"Self-test: {passed}/{games} tricks revealed the right card.");
    return passed == games;
}

if (args.Length > 0 && args[0] == "--test")
    return SelfTest(args.Length > 1 ? int.Parse(args[1]) : 1000) ? 0 : 1;
Play();
return 0;
