# iBIM launch record

The site went live on 9 Nov 2026.

## How it runs
- `www.i-bim.co.uk/*` and `i-bim.co.uk/*` are Worker routes in `wrangler.jsonc`, on the existing proxied records.
- No DNS records changed for the switch. The MX, SPF, DKIM, DMARC and Google verification records must stay as they are.
- The Worker redirects plain HTTP and the bare domain to `https://www.i-bim.co.uk`.
- The `workers.dev` address is off.
- Form emails go through the Google Apps Script set in the `NOTIFY_URL` and `NOTIFY_KEY` Worker secrets. Enquiries are saved first in the `ibim-enquiries` D1 database.

## Roll back
Remove `routes` from `wrangler.jsonc` and run `npm run deploy`. Traffic returns to the old Hostinger site, but only until that plan ends on 18 Dec 2026.

## Still to do
- [ ] Cancel the Hostinger hosting renewal on 1 Dec 2026 (scheduled, before the 4 Dec charge)
- [ ] Move the domain out of Hostinger. Cloudflare: checkout first, then set the IPS tag to `CLOUDFLARE` at Hostinger
- [ ] After the old plan ends, replace the website DNS records that still point at Hostinger. The site does not use them, but they should not point at a cancelled service
- [ ] Clean up the SPF and proxied Hostinger mail records, once nothing sends through Hostinger or Neo
- [ ] Delete the old preview on the Wardyj93 Cloudflare account
- [ ] Delete the Hostinger account, only after the domain has moved and the hosting has ended
