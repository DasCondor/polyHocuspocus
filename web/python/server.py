"""Hocus Pocus - the 21-card trick, as a Python web server (standard library only).

Every page is rendered on the server; the browser runs no JavaScript.
The game state lives in the link: /?deck=4.17.33...&round=2

    python web/python/server.py      then open http://localhost:8000
"""
import os
import random
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

PORT = int(os.environ.get("PORT", 8000))
CSS = (Path(__file__).resolve().parent.parent / "shared" / "hocuspocus.css").read_bytes()

SUITS = [("♠", "Spades"), ("♥", "Hearts"), ("♣", "Clubs"), ("♦", "Diamonds")]
RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
RANK_NAMES = {"A": "Ace", "J": "Jack", "Q": "Queen", "K": "King"}
ROUNDS = 3


def card(card_id):
    rank = RANKS[card_id % 13]
    suit, suit_name = SUITS[card_id // 13]
    return {
        "rank": rank,
        "suit": suit,
        "red": suit in "♥♦",
        "name": f"{RANK_NAMES.get(rank, rank)} of {suit_name}",
    }


def new_deck():
    """Shuffle a full 52-card deck and keep 21 card ids."""
    return random.sample(range(52), 21)


def deal(deck):
    """Deal one card at a time into three piles of seven."""
    return [deck[p::3] for p in range(3)]


def collect(piles, chosen):
    """Stack the piles back up with the chosen pile in the middle."""
    others = [p for p in range(3) if p != chosen]
    random.shuffle(others)
    return piles[others[0]] + piles[chosen] + piles[others[1]]


def parse_deck(text):
    """A deck from the link must be 21 different cards."""
    try:
        ids = [int(n) for n in text.split(".")]
    except ValueError:
        return None
    ok = len(ids) == 21 and len(set(ids)) == 21 and all(0 <= n < 52 for n in ids)
    return ids if ok else None


def game_link(deck, round_no):
    return f"/?deck={'.'.join(map(str, deck))}&round={round_no}"


# ---------- Pages ----------

def card_html(c, i, extra=""):
    red = " red" if c["red"] else ""
    return f"""
  <li class="hp-card{red}{extra}" style="--i:{i}" aria-label="{c['name']}">
    <span class="hp-corner">{c['rank']}<span>{c['suit']}</span></span>
    <span class="hp-pip" aria-hidden="true">{c['suit']}</span>
  </li>"""


def steps_html(phase, round_no):
    now = ["remember", "choose", "reveal"].index(phase)
    labels = ["Remember", f"Choose {round_no}/{ROUNDS}" if phase == "choose" else "Choose", "Reveal"]
    return "".join(
        f'<li class="{"active" if i == now else "done" if i < now else ""}">{label}</li>'
        for i, label in enumerate(labels)
    )


def table_html(deck, round_no, choosing):
    sections = []
    for p, pile in enumerate(deal(deck)):
        cards = "".join(card_html(card(c), row * 3 + p) for row, c in enumerate(pile))
        pick = (f'<a class="hp-pick" href="{game_link(deck, round_no)}&amp;pick={p}">'
                f"It's in pile {p + 1}</a>") if choosing else ""
        sections.append(f"""
      <section class="hp-pile">
        <h2>Pile {p + 1}</h2>
        <ul class="hp-cards">{cards}</ul>
        {pick}
      </section>""")
    return f'<div class="hp-table"><div class="hp-piles">{"".join(sections)}</div></div>'


def page(phase, title, text, body, action="", round_no=0):
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hocus Pocus · Python</title>
  <link rel="stylesheet" href="/hocuspocus.css">
</head>
<body>
  <main class="hp">
    <ol class="hp-steps">{steps_html(phase, round_no)}</ol>
    <h1 class="hp-title">{title}</h1>
    <p class="hp-text">{text}</p>
    {body}
    <div class="hp-actions">{action}</div>
    <p class="hp-made">Rendered by a Python server, no JavaScript in the browser</p>
  </main>
</body>
</html>"""


def remember_page():
    deck = new_deck()
    return page(
        "remember",
        "Think of a card",
        "Pick any one of these 21 cards and remember it. Don't click it, just keep it in mind.",
        table_html(deck, 0, False),
        f'<a class="hp-primary" href="{game_link(deck, 1)}">I\'ve got my card</a>',
    )


def choose_page(deck, round_no):
    text = ("Which pile is your card in?" if round_no == 1
            else "The cards have moved. Which pile is your card in now?")
    return page("choose", f"Round {round_no} of {ROUNDS}", text, table_html(deck, round_no, True),
                round_no=round_no)


def reveal_page(card_id):
    c = card(card_id)
    return page(
        "reveal",
        "Your card is…",
        "After three rounds your card always ends up 11th in the deck. That is the whole trick.",
        f'<div class="hp-reveal"><ul class="hp-cards">{card_html(c, 0, " hp-big")}</ul>'
        f'<p class="hp-name">{c["name"]}</p></div>',
        '<a class="hp-primary" href="/">Play again</a>',
    )


# ---------- Routes ----------

class Handler(BaseHTTPRequestHandler):
    def send(self, status, content_type, body):
        data = body.encode() if isinstance(body, str) else body
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def redirect(self, to):
        self.send_response(303)
        self.send_header("Location", to)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        url = urlsplit(self.path)
        if url.path == "/hocuspocus.css":
            return self.send(200, "text/css; charset=utf-8", CSS)
        if url.path != "/":
            return self.send(404, "text/plain; charset=utf-8", "Not found")

        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        html = "text/html; charset=utf-8"
        if "reveal" in q:
            ok = q["reveal"].isdigit() and int(q["reveal"]) < 52
            return self.send(200, html, reveal_page(int(q["reveal"]))) if ok else self.redirect("/")
        if "deck" not in q:
            return self.send(200, html, remember_page())

        deck = parse_deck(q["deck"])
        round_no = int(q["round"]) if q.get("round", "") in ("1", "2", "3") else 0
        if not deck or not round_no:
            return self.redirect("/")
        if "pick" not in q:
            return self.send(200, html, choose_page(deck, round_no))
        if q["pick"] not in ("0", "1", "2"):
            return self.redirect("/")

        new = collect(deal(deck), int(q["pick"]))
        # After three rounds the remembered card is always the 11th card.
        self.redirect(f"/?reveal={new[10]}" if round_no == ROUNDS else game_link(new, round_no + 1))

    def log_message(self, *args):
        pass  # keep the terminal quiet


if __name__ == "__main__":
    print(f"Hocus Pocus (Python) at http://localhost:{PORT}")
    ThreadingHTTPServer(("", PORT), Handler).serve_forever()
