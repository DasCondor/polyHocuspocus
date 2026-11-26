<div align="center">

# ✧ polyHocuspocus

**The classic 21-card trick, written in 15 programming languages.**

Think of a card. Point to its pile three times. Watch it appear, in whichever language you like.

[![Play and read the code](https://img.shields.io/badge/▶_Play_and_read_the_code-in_your_browser-d8be82?style=for-the-badge&labelColor=183c2e)](https://dascondor.github.io/polyHocuspocus/)

[![Test and deploy](https://github.com/DasCondor/polyHocuspocus/actions/workflows/ci.yml/badge.svg)](https://github.com/DasCondor/polyHocuspocus/actions/workflows/ci.yml)
![15 languages](https://img.shields.io/badge/languages-15-2f5947)
![No dependencies](https://img.shields.io/badge/dependencies-none-2f5947)

</div>

This grew out of [pyHocuspocus](https://github.com/DasCondor/pyHocuspocus). The [website](https://dascondor.github.io/polyHocuspocus/) has the browser game at the top and every version of the code below it, with syntax highlighting and the command to run each one.

## How the trick works

Deal 21 cards into three piles of seven. The player silently picks a card and says only which pile it is in. Pick the piles back up **with the chosen pile in the middle**, deal again, and repeat.

| Round | Where the card can be | Possibilities |
| :---: | :-------------------: | :-----------: |
| Start |        1 – 21         |      21       |
|   1   |        8 – 14         |       7       |
|   2   |        10 – 12        |       3       |
|   3   |        **11**         |     **1**     |

After the third round the card is always the 11th in the deck.

## The versions

Every version is a single file with no third-party packages. They all behave the same way: show three piles, ask `Which pile holds your card? [1-3]` three times, then reveal the card. Add `--test` to play 1,000 games against itself and check that the reveal is never wrong (`--test 50` plays 50).

Run these from the repository root:

| Language | Run it |
| --- | --- |
| [Python](python/hocuspocus.py) | `python python/hocuspocus.py` |
| [JavaScript](javascript/hocuspocus.js) | `node javascript/hocuspocus.js` |
| [TypeScript](typescript/hocuspocus.ts) | `node typescript/hocuspocus.ts` (Node.js 22.18+) |
| [Go](go/hocuspocus.go) | `go run go/hocuspocus.go` |
| [Rust](rust/hocuspocus.rs) | `rustc -O rust/hocuspocus.rs -o hocuspocus && ./hocuspocus` |
| [C](c/hocuspocus.c) | `cc -O2 c/hocuspocus.c -o hocuspocus && ./hocuspocus` |
| [C++](cpp/hocuspocus.cpp) | `c++ -std=c++17 -O2 cpp/hocuspocus.cpp -o hocuspocus && ./hocuspocus` |
| [C#](csharp/Program.cs) | `dotnet run --project csharp` |
| [Java](java/HocusPocus.java) | `java java/HocusPocus.java` |
| [Kotlin](kotlin/hocuspocus.kt) | `kotlinc kotlin/hocuspocus.kt -include-runtime -d hocuspocus.jar && java -jar hocuspocus.jar` |
| [Ruby](ruby/hocuspocus.rb) | `ruby ruby/hocuspocus.rb` |
| [Lua](lua/hocuspocus.lua) | `lua lua/hocuspocus.lua` |
| [Perl](perl/hocuspocus.pl) | `perl perl/hocuspocus.pl` |
| [Bash](bash/hocuspocus.sh) | `bash bash/hocuspocus.sh` |
| [PowerShell](powershell/hocuspocus.ps1) | `pwsh powershell/hocuspocus.ps1` |

The first Python version from pyHocuspocus is kept unchanged in [`python/original/`](python/original).

## Testing

[`ci.yml`](.github/workflows/ci.yml) builds every version on each push, runs its 1,000-game self-test, and plays one game from piped answers. The website is only redeployed when all 15 pass.

## The website

The page is plain HTML, CSS and JavaScript in [`site/`](site). [`tools/build_site.py`](tools/build_site.py) copies it to `_site/` together with every file listed in [`languages.json`](languages.json). To preview it:

```powershell
py tools/build_site.py
py -m http.server 8000 --directory _site
```

Then open <http://localhost:8000>. To add a language, add its folder, an entry in `languages.json`, and a line in the `ci.yml` test matrix.

## Project layout

```text
polyHocuspocus/
├── python/ javascript/ typescript/ go/ rust/ c/ cpp/
├── csharp/ java/ kotlin/ ruby/ lua/ perl/ bash/ powershell/
├── python/original/    # The first version, from pyHocuspocus
├── site/               # Browser game and code viewer
├── languages.json      # The versions shown on the website
└── tools/build_site.py # Assembles the website into _site/
```

## Support development

<img src=".github/dascondor-logo.png" alt="DasCondor logo" width="64" height="64">

If this project was useful to you, you can [buy me a coffee](https://buymeacoffee.com/dascondor) to support future work. Contributions are voluntary.
