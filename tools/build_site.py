"""Assemble the GitHub Pages site into _site/.

Copies site/ as-is, copies every source file listed in languages.json into
_site/code/, and writes _site/languages.json with line counts added.

    python tools/build_site.py
    python -m http.server 8000 --directory _site
"""
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "_site"


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    shutil.copytree(ROOT / "site", OUT)

    languages = json.loads((ROOT / "languages.json").read_text(encoding="utf-8"))
    for lang in languages:
        lang["lines"] = 0
        for rel in lang["files"]:
            src = ROOT / rel
            dest = OUT / "code" / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dest)
            if rel == lang["files"][0] or lang["id"] == "original":
                lang["lines"] += len(src.read_text(encoding="utf-8").splitlines())

    (OUT / "languages.json").write_text(json.dumps(languages, indent=1), encoding="utf-8")
    print(f"Built {OUT} with {len(languages)} versions.")


if __name__ == "__main__":
    main()
