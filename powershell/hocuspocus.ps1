# Hocus Pocus - the 21-card trick, in PowerShell (5.1 and 7+).
param(
    [switch] $Test,
    [int] $Games = 1000
)

$Suits = 'Spades', 'Hearts', 'Clubs', 'Diamonds'
$Ranks = 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'
$Rounds = 3

function Get-CardName([int] $Card) {
    "$($Ranks[$Card % 13]) of $($Suits[[math]::Floor($Card / 13)])"
}

# Shuffle a full 52-card deck and keep 21 cards.
function New-Deck {
    , [int[]] (0..51 | Get-Random -Count 21)
}

# Deal one card at a time into three piles of seven.
function Split-Deck([int[]] $Deck) {
    $piles = foreach ($p in 0..2) {
        , [int[]] @(for ($i = $p; $i -lt $Deck.Count; $i += 3) { $Deck[$i] })
    }
    , $piles
}

# Stack the piles back up with the chosen pile in the middle.
function Join-Piles($Piles, [int] $Chosen) {
    $a, $b = (($Chosen + 1) % 3), (($Chosen + 2) % 3) | Get-Random -Count 2
    , [int[]] ($Piles[$a] + $Piles[$Chosen] + $Piles[$b])
}

function Show-Piles($Piles) {
    '  {0,-20}{1,-20}{2,-20}' -f 'Pile 1', 'Pile 2', 'Pile 3'
    foreach ($row in 0..6) {
        '  {0,-20}{1,-20}{2,-20}' -f @($Piles | ForEach-Object { Get-CardName $_[$row] })
    }
}

# Returns the chosen pile (0-2), or $null when input runs out.
function Read-Pile {
    while ($true) {
        Write-Host "`nWhich pile holds your card? [1-3]: " -NoNewline
        $line = [Console]::In.ReadLine()
        if ($null -eq $line) { return $null }
        $answer = $line.Trim()
        if ($answer -in '1', '2', '3') { return [int] $answer - 1 }
        Write-Host 'Please type 1, 2 or 3.'
    }
}

function Start-Trick {
    Write-Host 'HOCUS POCUS - the 21-card trick'
    Write-Host "Remember one card. Don't say it - just tell me which pile it is in."
    $deck = New-Deck
    foreach ($round in 1..$Rounds) {
        $piles = Split-Deck $deck
        Write-Host "`nRound $round of $Rounds"
        Show-Piles $piles | Write-Host
        $chosen = Read-Pile
        if ($null -eq $chosen) { Write-Host; return }
        $deck = Join-Piles $piles $chosen
    }
    # After three rounds the remembered card is always the 11th card.
    Write-Host "`nHocus pocus... your card is the $(Get-CardName $deck[10])!"
}

function Test-Trick([int] $Count) {
    $passed = 0
    foreach ($g in 1..$Count) {
        $deck = New-Deck
        $secret = $deck[(Get-Random -Maximum 21)]
        foreach ($r in 1..$Rounds) {
            $piles = Split-Deck $deck
            $chosen = @(0..2 | Where-Object { $piles[$_] -contains $secret })[0]
            $deck = Join-Piles $piles $chosen
        }
        if ($deck[10] -eq $secret) { $passed++ }
    }
    Write-Host "Self-test: $passed/$Count tricks revealed the right card."
    $passed -eq $Count
}

if ($Test -or $args -contains '--test') {
    if (Test-Trick $Games) { exit 0 } else { exit 1 }
}
Start-Trick
