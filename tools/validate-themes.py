#!/usr/bin/env python3
"""Validate the shared Cybercore theme registry served to every site.

Fails when a palette is missing a slot the choosers read, a registry entry
has no file (or a file has no registry entry), an id is duplicated, or a
signature mashup points at a theme that doesn't exist. Prints the totals
the chooser will show: themes + mashups.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent / "data"
SLOTS = ["bg", "white", "panel", "line", "muted", "acid_green", "hot_pink", "purple", "cyan", "orange", "red"]
HEX = re.compile(r"^[0-9a-fA-F]{6}$")
errors = []

grid = json.loads((ROOT / "cybergrid.json").read_text())
families = grid.get("families", {})
seen = {}
for family, names in families.items():
    for name in names:
        if name in seen:
            errors.append(f"duplicate theme id {name} in {family} and {seen[name]}")
        seen[name] = family
        path = ROOT / "themes" / family / f"{name}.json"
        if not path.is_file():
            errors.append(f"missing palette file {path.relative_to(ROOT)}")
            continue
        try:
            palette = json.loads(path.read_text())
        except json.JSONDecodeError as exc:
            errors.append(f"{path.relative_to(ROOT)}: invalid JSON ({exc})")
            continue
        for slot in SLOTS:
            if not HEX.match(str(palette.get(slot, ""))):
                errors.append(f"{path.relative_to(ROOT)}: slot '{slot}' missing or not 6-digit hex")

for path in sorted((ROOT / "themes").glob("*/*.json")):
    if seen.get(path.stem) != path.parent.name:
        errors.append(f"orphan palette file {path.relative_to(ROOT)} (not listed in cybergrid.json)")

mashups = json.loads((ROOT / "mashups.json").read_text()).get("mashups", [])
mash_ids = set()
for m in mashups:
    mid = m.get("id")
    if not mid or mid in mash_ids or mid in seen:
        errors.append(f"mashup id {mid!r} is empty or duplicated")
    mash_ids.add(mid)
    if not m.get("label"):
        errors.append(f"mashup {mid}: missing label")
    for role in ("base", "accent"):
        if m.get(role) not in seen:
            errors.append(f"mashup {mid}: {role} '{m.get(role)}' is not a registry theme")

if errors:
    print(f"{len(errors)} problem(s):")
    for e in errors[:200]:
        print(f"  - {e}")
    sys.exit(1)
print(f"OK: {len(seen)} themes in {len(families)} families + {len(mashups)} signature mashups = {len(seen) + len(mashups)} in the chooser")
