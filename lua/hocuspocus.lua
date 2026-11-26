-- Hocus Pocus - the 21-card trick, in Lua (5.1 - 5.4).
-- Lua tables start at 1, so cards are numbered 1..52 and piles 1..3.

local SUITS = { "Spades", "Hearts", "Clubs", "Diamonds" }
local RANKS = { "Ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King" }
local ROUNDS = 3

math.randomseed(os.time())

local function card_name(card)
  return RANKS[(card - 1) % 13 + 1] .. " of " .. SUITS[math.floor((card - 1) / 13) + 1]
end

-- Shuffle a full 52-card deck and keep 21 cards.
local function new_deck()
  local cards = {}
  for i = 1, 52 do cards[i] = i end
  for i = 52, 2, -1 do
    local j = math.random(i)
    cards[i], cards[j] = cards[j], cards[i]
  end
  local deck = {}
  for i = 1, 21 do deck[i] = cards[i] end
  return deck
end

-- Deal one card at a time into three piles of seven.
local function deal(deck)
  local piles = { {}, {}, {} }
  for i, card in ipairs(deck) do
    local pile = piles[(i - 1) % 3 + 1]
    pile[#pile + 1] = card
  end
  return piles
end

-- Stack the piles back up with the chosen pile in the middle.
local function collect(piles, chosen)
  local a, b = chosen % 3 + 1, (chosen + 1) % 3 + 1
  if math.random(2) == 1 then a, b = b, a end
  local deck = {}
  for _, p in ipairs({ a, chosen, b }) do
    for _, card in ipairs(piles[p]) do deck[#deck + 1] = card end
  end
  return deck
end

local function show(piles)
  print(string.format("  %-20s%-20s%-20s", "Pile 1", "Pile 2", "Pile 3"))
  for row = 1, 7 do
    local line = "  "
    for p = 1, 3 do line = line .. string.format("%-20s", card_name(piles[p][row])) end
    print(line)
  end
end

-- Returns the chosen pile (1-3), or nil when input runs out.
local function ask()
  while true do
    io.write("\nWhich pile holds your card? [1-3]: ")
    io.flush()
    local line = io.read("*l")
    if line == nil then return nil end
    local answer = line:match("^%s*(.-)%s*$")
    if answer == "1" or answer == "2" or answer == "3" then return tonumber(answer) end
    print("Please type 1, 2 or 3.")
  end
end

local function play()
  print("HOCUS POCUS - the 21-card trick")
  print("Remember one card. Don't say it - just tell me which pile it is in.")
  local deck = new_deck()
  for round = 1, ROUNDS do
    local piles = deal(deck)
    print(string.format("\nRound %d of %d", round, ROUNDS))
    show(piles)
    local chosen = ask()
    if chosen == nil then print() return end
    deck = collect(piles, chosen)
  end
  -- After three rounds the remembered card is always the 11th card.
  print("\nHocus pocus... your card is the " .. card_name(deck[11]) .. "!")
end

local function self_test(games)
  local passed = 0
  for _ = 1, games do
    local deck = new_deck()
    local secret = deck[math.random(21)]
    for _ = 1, ROUNDS do
      local piles = deal(deck)
      local chosen = 1
      for p = 1, 3 do
        for _, card in ipairs(piles[p]) do
          if card == secret then chosen = p end
        end
      end
      deck = collect(piles, chosen)
    end
    if deck[11] == secret then passed = passed + 1 end
  end
  print(string.format("Self-test: %d/%d tricks revealed the right card.", passed, games))
  return passed == games
end

if arg[1] == "--test" then
  os.exit(self_test(tonumber(arg[2]) or 1000) and 0 or 1)
else
  play()
end
