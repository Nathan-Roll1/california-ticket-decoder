export function directoryKind(url) {
  if (!url) return null;
  const {protocol, hostname, pathname} = new URL(url);
  if (protocol !== "https:") return null;
  if (hostname === "lacdawebimages.blob.core.windows.net" && pathname === "/assets/TAS/TASList.pdf") return "pdf";
  const host = hostname.replace(/^www\./, "");
  if (host === "dmv.ca.gov" && /^\/portal\/vehicle-industry-services\/occupational-licensing\/occupational-license-lookup\/traffic-school-list\/?$/.test(pathname)) return "html";
  if (hostname === "drive.dmvonline.ca.gov" && /^\/s\/oll-traffic-schools(?:\/|$)/.test(pathname)) return "html";
  if (host === "latrafficschoolinfo.com" || host === "ctsi-courtnetwork.org") return /\.pdf$/i.test(pathname) ? "pdf" : "html";
  return null;
}

// Injected only into a user-selected, allowlisted directory. Keep this function self-contained.
export function annotate(offers, date, expectedUrl) {
  if (location.href !== expectedUrl) return 0;
  const normalize = text => text.trim().replace(/\s+/g, " ").toLowerCase();
  const exact = new Map(offers.map(s => [normalize(s.name), s]));
  let count = 0;
  function scan(root) {
    for (const element of root.querySelectorAll("*")) {
      if (element.shadowRoot) scan(element.shadowRoot);
      if (!element.matches("td,th,a,li,span,strong,b,div,[role=cell],[role=gridcell]")) continue;
      if (element.childElementCount || element.closest("[data-cle-fee],form,nav,[contenteditable=true]") || !element.getClientRects().length) continue;
      const offer = exact.get(normalize(element.textContent));
      if (!offer || element.dataset.cleMatched === "1") continue;
      const badge = document.createElement("small");
      badge.dataset.cleFee = "1";
      badge.textContent = " · CLE comparison: advertised school fee " + new Intl.NumberFormat("en-US", {style:"currency", currency:"USD"}).format(offer.priceMinor/100) + " (" + date + "). Court charges separate.";
      badge.style.cssText = "display:block;color:#253b37;background:#f0f4f1;padding:2px 4px;font:normal 12px/1.5 system-ui;white-space:normal;overflow-wrap:anywhere;max-inline-size:100%;box-sizing:border-box";
      if (element.matches("td,th,li,[role=cell],[role=gridcell]")) element.append(badge);
      else element.after(badge);
      element.dataset.cleMatched = "1";
      count++;
    }
  }
  scan(document);
  return count;
}
