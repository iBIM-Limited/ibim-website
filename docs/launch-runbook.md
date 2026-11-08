# iBIM launch runbook

Status: draft, not started. Do not make these changes until Jack gives a separate yes.

Target: go live by about 27 Nov 2026. Hosting renews on 4 Dec. The Hostinger plan and domain registration end on 18 Dec unless renewed.

## Before the switch

- [ ] Jack has reviewed the test site and confirmed the service claims and privacy notice
- [ ] Company details are added if required
- [ ] Jack has authorised the Google script, and its web app URL is stored as the `NOTIFY_URL` Worker secret
- [ ] With Jack's approval, one test enquiry arrives at `jack@i-bim.co.uk`, replying reaches the sender, and the row shows `emailed = 1`
- [ ] Test rows are deleted from `ibim-enquiries`, including `deploy-test@example.com`
- [ ] Search Console access is sorted, and the current data is exported if any exists
- [ ] Export the Cloudflare DNS records and save them outside this repository

## DNS records

Records seen in the `jack@i-bim.co.uk` Cloudflare zone on 8 Nov 2026. Re-export before changing anything.

**Website records to change at the switch**

| Type | Name | Current value | Proxied |
|---|---|---|---|
| A | `i-bim.co.uk` | `88.223.87.49` | Yes |
| A | `i-bim.co.uk` | `147.79.79.225` | Yes |
| AAAA | `i-bim.co.uk` | `2a02:4780:4d:d861:ae84:5720:977:2e08` | Yes |
| AAAA | `i-bim.co.uk` | `2a02:4780:4a:ba3e:996d:992e:1309:3f0b` | Yes |
| CNAME | `www.i-bim.co.uk` | `www.i-bim.co.uk.cdn.hstgr.net` | Yes |

**Records that must not change**

- All 5 Google MX records on `i-bim.co.uk`
- `google._domainkey`, `_dmarc`, SPF and both Google site verification TXT records
- `neo-verification`, until Jack confirms it is unused

**Later clean-up, not part of the switch**

The `autoconfig`, `autodiscover` and `hostingermail-*._domainkey` CNAMEs and the SPF entries for Hostinger and Neo. Hostinger's Emails page offered to set up a mailbox and listed none. Confirm nothing sends through either service first.

## The switch

The current Wrangler login cannot edit DNS. Use the Cloudflare dashboard, or a separately approved login with that permission.

1. Choose a quiet time, with Jack available.
2. Add `www.i-bim.co.uk` and `i-bim.co.uk` as Worker custom domains. Follow Cloudflare's current instructions for replacing the existing records above.
3. Confirm the MX and TXT records are unchanged.

## Checks after the switch

- [ ] `https://www.i-bim.co.uk/` loads the new site with no `X-Robots-Tag: noindex`
- [ ] `https://i-bim.co.uk/` and `http://i-bim.co.uk/` each reach `https://www.i-bim.co.uk/`
- [ ] All 18 URLs in `docs/seo-baseline-2026-11-08.md` return their planned result
- [ ] The sitemap lists only URLs that return 200
- [ ] Read the final `robots.txt`. Cloudflare's managed rules may be added to the site's file. Confirm search crawlers are allowed and the AI crawler choices match what Jack wants
- [ ] Send a test email from an outside address to `jack@i-bim.co.uk`, and send one back
- [ ] Forms work on the live domain
- [ ] Submit the sitemap and inspect key pages in Search Console
- [ ] Turn on Cloudflare Web Analytics, if approved. Update the Content-Security-Policy and privacy notice if it adds a script
- [ ] Switch off the `workers.dev` address and preview URLs in `wrangler.jsonc`, or confirm they stay `noindex`

## Rollback

Remove the Worker custom domains and restore the five website records from the export, proxied as before. The old site keeps working only while the Hostinger plan is active, so do not cancel it until the new site has been checked.

## After launch

1. Prompt Jack to cancel the hosting renewal before 4 Dec, only once the new site is confirmed working.
2. Agree the domain move. Do not turn off domain renewal until a transfer has completed or is safely under way.
3. Delete the old preview on the Wardyj93 Cloudflare account, with Jack's approval.
4. Delete the Hostinger account only after the conditions in `docs/seo-next-steps.md` are met.
