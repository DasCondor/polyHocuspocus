<div align="center">

# ✧ polyHocuspocus

**The classic 21-card trick in 15 coding languages and 6 web versions.**

Think of a card. Point to its pile three times. Watch it appear.

[![Play and read the code](https://img.shields.io/badge/▶_Play_and_read_the_code-in_your_browser-e2c785?style=for-the-badge&labelColor=1c4534)](https://dascondor.github.io/polyHocuspocus/)

[![Test and deploy](https://github.com/DasCondor/polyHocuspocus/actions/workflows/ci.yml/badge.svg)](https://github.com/DasCondor/polyHocuspocus/actions/workflows/ci.yml)
![15 coding languages](https://img.shields.io/badge/coding_languages-15-2f6149)
![6 web versions](https://img.shields.io/badge/web_versions-6-2f6149)
![Docker](https://img.shields.io/badge/runs_in-Docker-2496ed?logo=docker&logoColor=white)

</div>

This grew out of [pyHocuspocus](https://github.com/DasCondor/pyHocuspocus). The [website](https://dascondor.github.io/polyHocuspocus/) lets you play any web version, then read every version's code with the commands to run it.

## Contents

- [How the trick works](#how-the-trick-works)
- [Coding languages](#coding-languages)
- [Web versions](#web-versions)
- [Docker](#docker)
- [Testing](#testing)
- [Project layout](#project-layout)

## How the trick works

Deal 21 cards into three piles of seven. The player silently picks a card and says only which pile it is in. Pick the piles back up **with the chosen pile in the middle**, deal again, and repeat.

| After | Where the card can be | Possible cards |
| :---: | :-------------------: | :------------: |
| Start |        1 – 21         |       21       |
| Round 1 |      8 – 14         |       7        |
| Round 2 |      10 – 12        |       3        |
| Round 3 |      **11**         |     **1**      |

After the third round the card is always the 11th in the deck.

## Coding languages

Each terminal version is one file with no third-party packages. They all show three piles, ask `Which pile holds your card? [1-3]` three times, then reveal the card. Add `--test` to play 1,000 games against itself and check the reveal is never wrong (`--test 50` plays 50).

Run from the repository root, with the language installed or with Docker:

| Language | Run it | Or with Docker |
| --- | --- | --- |
| [Python](python/hocuspocus.py) | `python python/hocuspocus.py` | `docker compose run --rm python` |
| [JavaScript](javascript/hocuspocus.js) | `node javascript/hocuspocus.js` | `docker compose run --rm javascript` |
| [TypeScript](typescript/hocuspocus.ts) | `node typescript/hocuspocus.ts` (Node.js 22.18+) | `docker compose run --rm typescript` |
| [Go](go/hocuspocus.go) | `go run go/hocuspocus.go` | `docker compose run --rm go` |
| [Rust](rust/hocuspocus.rs) | `rustc -O rust/hocuspocus.rs -o hocuspocus && ./hocuspocus` | `docker compose run --rm rust` |
| [C](c/hocuspocus.c) | `cc -O2 c/hocuspocus.c -o hocuspocus && ./hocuspocus` | `docker compose run --rm c` |
| [C++](cpp/hocuspocus.cpp) | `c++ -std=c++17 -O2 cpp/hocuspocus.cpp -o hocuspocus && ./hocuspocus` | `docker compose run --rm cpp` |
| [C#](csharp/Program.cs) | `dotnet run --project csharp` | `docker compose run --rm csharp` |
| [Java](java/HocusPocus.java) | `java java/HocusPocus.java` | `docker compose run --rm java` |
| [Kotlin](kotlin/hocuspocus.kt) | `kotlinc kotlin/hocuspocus.kt -include-runtime -d hocuspocus.jar && java -jar hocuspocus.jar` | `docker compose run --rm kotlin` |
| [Ruby](ruby/hocuspocus.rb) | `ruby ruby/hocuspocus.rb` | `docker compose run --rm ruby` |
| [Lua](lua/hocuspocus.lua) | `lua lua/hocuspocus.lua` | `docker compose run --rm lua` |
| [Perl](perl/hocuspocus.pl) | `perl perl/hocuspocus.pl` | `docker compose run --rm perl` |
| [Bash](bash/hocuspocus.sh) | `bash bash/hocuspocus.sh` | `docker compose run --rm bash` |
| [PowerShell](powershell/hocuspocus.ps1) | `pwsh powershell/hocuspocus.ps1` | `docker compose run --rm powershell` |

The first Python version from pyHocuspocus is kept unchanged in [`python/original/`](python/original).

## Web versions

Six browser versions share one stylesheet, [`web/shared/hocuspocus.css`](web/shared/hocuspocus.css), so they look and play the same. Only the code behind them differs.

| Version | Code | Run it locally |
| --- | --- | --- |
| Plain JavaScript | [`web/vanilla/app.js`](web/vanilla/app.js) | Open `web/vanilla/index.html` in a browser |
| Angular | [`web/angular/src/app/app.ts`](web/angular/src/app/app.ts) | `cd web/angular && npm install && npm start` |
| React | [`web/react/src/App.jsx`](web/react/src/App.jsx) | `cd web/react && npm install && npm run dev` |
| Vue | [`web/vue/src/App.vue`](web/vue/src/App.vue) | `cd web/vue && npm install && npm run dev` |
| Node.js server | [`web/node/server.js`](web/node/server.js) | `node web/node/server.js`, then <http://localhost:3000> |
| Python server | [`web/python/server.py`](web/python/server.py) | `python web/python/server.py`, then <http://localhost:8000> |

The Node.js and Python versions build every page on the server and keep the game in the links, so the browser runs no JavaScript and neither needs any packages. GitHub Pages only hosts static files, so the website shows screenshots of these two and the commands to run them.

## Docker

[`compose.yaml`](compose.yaml) has a service for every version, built from the files in [`docker/`](docker). Compiled languages use multi-stage builds, so the final images hold only the program.

```powershell
docker compose run --rm go           # play the Go version in your terminal
docker compose run --rm go --test    # run its 1,000-game self-test
docker compose up                    # website on :8080, Node.js on :3000, Python on :8000
```

`docker compose up` builds the Angular, React and Vue apps, assembles the website and serves it at <http://localhost:8080>. The terminal versions are in the `cli` profile, so `up` leaves them out.

## Testing

[`ci.yml`](.github/workflows/ci.yml) runs on every push:

- **Languages:** builds each terminal version with its own toolchain, runs the 1,000-game self-test, and plays one game from piped answers.
- **Docker images:** builds every image and repeats the self-test inside each one, then plays 50 games against both server images.
- **Web versions:** builds Angular, React and Vue, assembles the site, and plays 50 games against the Node.js and Python servers with [`tools/test_web_server.py`](tools/test_web_server.py).

The website is redeployed only when all of these pass.

To preview the site without Docker, build the three apps (`npm run build` in each folder), then:

```powershell
py tools/build_site.py
py -m http.server 8000 --directory _site
```

To add a language, add its folder, an entry in [`languages.json`](languages.json), a Dockerfile and a `compose.yaml` service, and a line in the `ci.yml` test matrix.

## Project layout

```text
polyHocuspocus/
├── python/ javascript/ typescript/ go/ rust/ c/ cpp/
├── csharp/ java/ kotlin/ ruby/ lua/ perl/ bash/ powershell/
├── python/original/    # The first version, from pyHocuspocus
├── web/
│   ├── shared/         # hocuspocus.css, used by every web version
│   ├── vanilla/ angular/ react/ vue/
│   └── node/ python/   # Server-rendered versions
├── docker/             # One Dockerfile per version
├── compose.yaml
├── site/               # The main page: version switcher and code viewer
├── languages.json      # Every version the website lists
└── tools/              # Site builder and web server test
```

## Support development

<img src=".github/dascondor-logo.png" alt="DasCondor logo" width="64" height="64">

If this project was useful to you, you can [buy me a coffee](https://buymeacoffee.com/dascondor) to support future work. Contributions are voluntary.
