"""Assemble the GitHub Pages site into _site/.

- site/                 -> _site/            (the main page)
- web/shared, vanilla   -> _site/web/...     (no build step)
- web/<app>/dist        -> _site/web/<app>/  (Angular, React and Vue builds)
- every file in languages.json -> _site/code/ for the code viewer

Build the framework apps first (npm run build in each), then:

    python tools/build_site.py
    python -m http.server 8000 --directory _site
"""
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"

# Where each framework app's production build ends up.
BUILDS = {
    "angular": ROOT / "web/angular/dist/angular/browser",
    "react": ROOT / "web/react/dist",
    "vue": ROOT / "web/vue/dist",
}


def main():
    strict = "--strict" in sys.argv  # CI: fail if an app wasn't built
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "site", OUT)
    shutil.copytree(ROOT / "web/shared", OUT / "web/shared")
    shutil.copytree(ROOT / "web/vanilla", OUT / "web/vanilla")

    for app, dist in BUILDS.items():
        if dist.is_dir():
            shutil.copytree(dist, OUT / "web" / app)
        elif strict:
            sys.exit(f"Missing build for {app}: run npm run build in web/{app}.")
        else:
            print(f"Note: web/{app} has not been built, so it is left out.")

    languages = json.loads((ROOT / "languages.json").read_text(encoding="utf-8"))
    for lang in languages:
        lang["lines"] = 0
        for i, rel in enumerate(lang["files"]):
            src = ROOT / rel
            dest = OUT / "code" / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
            # Count the main file; the original's two files are both its code.
            if i == 0 or lang["id"] == "original":
                lang["lines"] += len(src.read_text(encoding="utf-8").splitlines())

    (OUT / "languages.json").write_text(json.dumps(languages, indent=1, ensure_ascii=False), encoding="utf-8")
    print(f"Built {OUT} with {len(languages)} versions.")


if __name__ == "__main__":
    main()
