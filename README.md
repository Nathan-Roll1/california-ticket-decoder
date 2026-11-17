# California Ticket Decoder

Look up 49 source-linked 2026 California ticket schedule examples offline in Python or Node. Each result gives the county, Vehicle Code, scenario, amount in cents, source and page. Coverage varies by offense. For example, the only reviewed stop-sign row is Santa Barbara. Your court determines the balance, eligibility and deadline for your case.

## Install from a release

Download a build and the SHA256SUMS.txt file from the [releases page](https://github.com/Nathan-Roll1/california-ticket-decoder/releases). Verify the digest of the downloaded file before installation.

In a Python virtual environment:

    python -m pip install --no-index ./california_ticket_decoder-0.1.0-py3-none-any.whl
    california-ticket-decoder get "Santa Barbara" "22450(a)"

With Node 18 or newer, in a local project:

    npm install --offline ./california-ticket-decoder-0.1.0.tgz
    npx --offline california-ticket-decoder list

## Directory price notes

The separate Chrome extension shows seven dated school offers and identifies promotional prices and optional services. CLE sells one of the compared courses. Open the popup beside a directory PDF, or apply the notes to supported HTML pages. It uses temporary active-tab access and runs on demand. See the [installation and privacy notes](extension/README.txt).

## Sources and license

California Licensing Education maintains the [2026 dataset](https://github.com/Nathan-Roll1/california-traffic-ticket-and-tvs-fees-2026) and the [web tools](https://traffic.californialicensingeducation.com/tools/). Verify case-specific questions with the issuing court. The code uses the MIT license. The original dataset curation and annotations use CC BY 4.0. Third-party source documents retain their own terms.
