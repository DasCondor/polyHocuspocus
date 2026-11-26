"""Play the trick against a running web server version (Node.js or Python).

Each game remembers a random card, follows it through three rounds by
clicking the links the server renders, and checks the reveal names it.

    python tools/test_web_server.py http://localhost:3000 [games]
"""
import html
import random
import re
import sys
import urllib.error
import urllib.request

SUITS = ["Spades", "Hearts", "Clubs", "Diamonds"]
RANKS = ["Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King"]


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None


opener = urllib.request.build_opener(NoRedirect)


def get(base, path):
    """Return (status, location, body) without following redirects."""
    try:
        with opener.open(base + path) as r:
            return r.status, None, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.headers.get("Location"), ""


def play(base):
    status, _, page = get(base, "/")
    assert status == 200, f"home page returned {status}"
    start = html.unescape(re.search(r'class="hp-primary" href="([^"]+)"', page).group(1))
    deck = [int(n) for n in re.search(r"deck=([\d.]+)", start).group(1).split(".")]
    secret = random.choice(deck)
    link = start
    for round_no in (1, 2, 3):
        status, _, page = get(base, link)
        assert status == 200 and f"Round {round_no} of 3" in page, f"round {round_no} page missing"
        pile = deck.index(secret) % 3
        picks = [html.unescape(h) for h in re.findall(r'class="hp-pick" href="([^"]+)"', page)]
        status, link, _ = get(base, picks[pile])
        assert status == 303, f"pick returned {status}"
        if round_no < 3:
            deck = [int(n) for n in re.search(r"deck=([\d.]+)", link).group(1).split(".")]
    status, _, page = get(base, link)
    name = f"{RANKS[secret % 13]} of {SUITS[secret // 13]}"
    return status == 200 and f'class="hp-name">{name}<' in page


def main():
    base = sys.argv[1].rstrip("/")
    games = int(sys.argv[2]) if len(sys.argv) > 2 else 50
    status, _, css = get(base, "/hocuspocus.css")
    assert status == 200 and ".hp-card" in css, "stylesheet not served"
    passed = sum(play(base) for _ in range(games))
    print(f"{base}: {passed}/{games} games revealed the right card.")
    sys.exit(0 if passed == games else 1)


if __name__ == "__main__":
    main()
