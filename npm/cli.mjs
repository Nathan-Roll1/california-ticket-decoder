#!/usr/bin/env node
import { readFileSync } from "node:fs";

function load(name) {
  return JSON.parse(readFileSync(new URL('./' + name + '.json', import.meta.url), 'utf8'));
}
function main(args) {
  const usage = 'california-ticket-decoder list | get "County" "Code" [speed-band] | scope';
  const [command, ...params] = args;
  if (!args.length || (args.length === 1 && ["-h", "--help"].includes(command))) {
    console.log(usage);
    return 0;
  }
  const rows = load("ticket-references-live");
  let result;
  if (command === "list" && !params.length) {
    result = rows.map(({county, code, speedBand}) => ({county, code, speedBand}));
  } else if (command === "scope" && !params.length) {
    result = load("assumptions-and-unknowns");
  } else if (command === "get" && [2, 3].includes(params.length)) {
    const [county, code, band = null] = params.map(value => value.trim().toLowerCase());
    const row = rows.find(r => r.county.toLowerCase() === county && r.code.toLowerCase() === code && r.speedBand === band);
    if (!row) {
      console.error("No reviewed exact match. Run list for covered county, subsection and speed-band combinations.");
      return 1;
    }
    const { assumptions, unknowns } = load("assumptions-and-unknowns");
    result = {datasetVersion: "2026-11-17.3", record: row, assumptions, unknowns,
              courtEligibilityGuide: "https://selfhelp.courts.ca.gov/traffic/traffic-school"};
  } else {
    console.error(usage);
    return 2;
  }
  console.log(JSON.stringify(result, null, 2));
  return 0;
}
process.exitCode = main(process.argv.slice(2));
