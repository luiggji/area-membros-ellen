# QA acceptance — branding, visual system and implementation

## V1.0 launch blocking
- [ ] Desktop 1366px and mobile 390px reproduce approved minimal hierarchy with content placeholders sourced from real DB states.
- [ ] Max density in home: hero, journey, 3 featured courses, 2 auxiliary blocks.
- [ ] Logo not stretched; light/dark safe backgrounds; favicon distinguishable at 16/32px.
- [ ] One primary CTA at a time, logical headings, focus visible, 44px touch targets.
- [ ] Page usable with keyboard, screen reader labels, alt text, 200% zoom, no horizontal scrolling at 320px.
- [ ] Contrast WCAG 2.2 AA for text/control combinations; champagne only decorative unless checked.
- [ ] No invalid subscription access, fake users, placeholder fees, inaccessible videos, fictitious progress/engagement in production.
- [ ] Empty/loading/error/success states verified for catalog, payment, community, event tickets and member directory.
- [ ] Booking and payment flows tested in sandbox and staging, QR replay prevented.
- [ ] Supabase security policies tested for owner/commercial/member and direct API access.

## Automated suggested checks
`pnpm lint` / `pnpm typecheck` / `pnpm test` / `pnpm build`; adjust commands to repo. Playwright smoke: home, nav, courses, accessibility basics, checkout status, admin access, check-in once-only. Browser-based contrast and responsive snapshots; CI visual diffs reviewed, not auto-approved.

## Severity
P0 security/data/payment-critical blocks release. P1 important functionality usually blocks affected release. P2 minor visual inconsistencies can be scheduled with documented acceptance. Do not reclassify to force deploy.
