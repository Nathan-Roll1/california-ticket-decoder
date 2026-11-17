"""Offline California ticket schedule references published by California Licensing Education."""
import json
import sys
from pathlib import Path


def load(name):
    return json.loads(Path(__file__).with_name(name + ".json").read_text(encoding="utf-8"))


def main():
    args = sys.argv[1:]
    usage = 'california-ticket-decoder list | get "County" "Code" [speed-band] | scope'
    if not args or args in (["--help"], ["-h"]):
        print(usage)
        return 0
    rows = load("ticket-references-live")
    if args == ["list"]:
        result = [{key: row[key] for key in ("county", "code", "speedBand")} for row in rows]
    elif args == ["scope"]:
        result = load("assumptions-and-unknowns")
    elif args[0] == "get" and len(args) in (3, 4):
        county, code = (value.strip().lower() for value in args[1:3])
        band = args[3].strip().lower() if len(args) == 4 else None
        row = next((r for r in rows if r["county"].lower() == county
                    and r["code"].lower() == code and r["speedBand"] == band), None)
        if row is None:
            print("No reviewed exact match. Run list for covered county, subsection and speed-band combinations.", file=sys.stderr)
            return 1
        scope = load("assumptions-and-unknowns")
        result = {"datasetVersion": "2026-11-17.3", "record": row,
                  "assumptions": scope["assumptions"], "unknowns": scope["unknowns"],
                  "courtEligibilityGuide": "https://selfhelp.courts.ca.gov/traffic/traffic-school"}
    else:
        print(usage, file=sys.stderr)
        return 2
    print(json.dumps(result, indent=2, ensure_ascii=False))
    return 0
