# HyDecor website — Security

**Last updated:** 2026-11-19
**Repo:** none (local folder). **Stack:** static HTML/CSS/JS + video. **Environments:** local only (http://127.0.0.1:8790/); not deployed.

## Table of Contents
1. [Posture](#1-posture)
2. [Trust boundaries](#2-trust-boundaries)
3. [Data handled](#3-data-handled)
4. [Third-party requests](#4-third-party-requests)
5. [Headers and CSP](#5-headers-and-csp)
6. [Known gaps](#6-known-gaps)
7. [Change Log](#7-change-log)

## 1. Posture
Static brochure site. No authentication, no accounts, no backend, no database, no uploads, no cookies set by site code. All new code (2026-11-19) is client-side presentation only: DOM injection of decorative elements, scroll/hover listeners, video playback.

## 2. Trust boundaries
```
visitor browser ──(static files)── local http.server (127.0.0.1 only)
       └──(user click)──► wa.me / api.whatsapp.com  (message text built client-side, opened in a new tab)
       └──(CSS)──► fonts.googleapis.com / fonts.gstatic.com
```
The dev server binds to `127.0.0.1` only (`--bind 127.0.0.1`), so it is not reachable from the LAN.

## 3. Data handled
- The inquiry form (`#inqForm`) collects a name and a chosen piece and builds a WhatsApp URL (GET). Nothing is stored or sent anywhere except WhatsApp, and only when the visitor clicks.
- No `localStorage`/cookies are written by the 2026-11-19 scripts.
- Business phone number (+961 33 070 19) is public by design.

## 4. Third-party requests
- Google Fonts (Marcellus, Cormorant Garamond, Manrope) — leaks visitor IP to Google on load, as on the live site.
- WhatsApp links (`target="_blank" rel="noopener"`).
- No analytics, no third-party scripts. All videos are self-hosted under `video/`.

## 5. Headers and CSP
N/A locally — `python3 -m http.server` sends no security headers. The live Vercel site sends HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` (observed 2026-11-19); ⚠️ UNVERIFIED whether it sends a CSP. If this redesign is deployed, inline `<script>`/`<style>` blocks would require `'unsafe-inline'` or hashes in any CSP.

## 6. Known gaps
| Date | Gap | Note |
|---|---|---|
| 2026-11-19 | No CSP defined for a future deploy | add with hashes before publishing |
| 2026-11-19 | Google Fonts loaded from Google | self-host to remove the third-party request |

## 7. Change Log
| Date | Change |
|---|---|
| 2026-11-19 | Created. Redesign added only client-side presentation code; no new data flows or endpoints. |
