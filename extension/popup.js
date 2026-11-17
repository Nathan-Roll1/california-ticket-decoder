import {annotate, directoryKind} from "./match.js";

const data = await (await fetch("./offers.json")).json();
const byId = id => document.getElementById(id);
const money = minor => new Intl.NumberFormat("en-US", {style:"currency", currency:data.currency}).format(minor/100);
byId("scope").textContent = "Seven advertised school fees reviewed " + data.checkedDate + ". Optional services are listed where known.";
function paragraph(parent, text) {
  const p = document.createElement("p");
  p.textContent = text;
  parent.append(p);
}
function render(query) {
  const offers = byId("offers");
  offers.replaceChildren();
  for (const school of data.schools.filter(s => s.name.toLowerCase().includes(query.trim().toLowerCase()))) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = school.name + " · " + money(school.priceMinor);
    details.append(summary);
    paragraph(details, school.included + " " + school.paymentTiming);
    if (school.promotion) paragraph(details, school.promotion + " Listed regular price " + money(school.regularPriceMinor) + ".");
    for (const service of school.optionalServices) {
      const range = service.maximumPriceMinor ? "–" + money(service.maximumPriceMinor) : "";
      paragraph(details, service.name + " (optional) " + money(service.priceMinor) + range + ". " + (service.condition || ""));
    }
    paragraph(details, school.optionalServicesNote);
    const source = document.createElement("a");
    source.href = school.sourceUrl;
    source.target = "_blank";
    source.rel = "noreferrer";
    source.textContent = "Provider’s public offer";
    details.append(source);
    offers.append(details);
  }
  if (!offers.childElementCount) paragraph(offers, "No school in this seven-offer comparison matches that name.");
}
render("");
byId("filter").addEventListener("input", event => render(event.target.value));
const [tab] = await chrome.tabs.query({active:true, currentWindow:true});
const status = byId("status");
const button = byId("annotate");
const kind = directoryKind(tab?.url);
if (kind === "html") {
  status.textContent = "Add notes to visible exact school-name matches. Run again after changing directory results.";
  button.disabled = false;
} else if (kind === "pdf") {
  status.textContent = "This directory uses a PDF. Look up the printed name below.";
} else {
  status.textContent = "Open a supported DMV, TAS or CTSI directory for inline notes, or look up a school below.";
}
button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    const [current] = await chrome.tabs.query({active:true,currentWindow:true});
    if (current?.id !== tab.id || current.url !== tab.url) {
      status.textContent = "The tab changed. Reopen fee notes on the directory.";
      return;
    }
    const [{result}] = await chrome.scripting.executeScript({target:{tabId:tab.id}, func:annotate, args:[data.schools,data.checkedDate,tab.url]});
    status.textContent = result ? "Added " + result + " school fee note(s)." : "No new exact matches. Search the offers below.";
  } catch {
    status.textContent = "Chrome could not annotate this page. Search the offers below.";
  } finally {
    button.disabled = false;
  }
});
