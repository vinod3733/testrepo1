# Salesforce Marketing Cloud — Cross-Client HTML Email

Table-based (`<table>` / `<tr>` / `<td>`) HTML emails optimized for **SFMC**, **Outlook (Windows desktop + Office 365)**, and major clients: Gmail, Apple Mail, Yahoo, iOS, Android.

> **Workflow:** Send prompts with your content, layout, or brand rules. Code will be corrected and optimized for SFMC + Outlook + all target email versions from those prompts.

## Files

| File | Use when |
|------|----------|
| `emails/pem-meet-banner.html` | **PEM Meet banner** — 640px main / 569×167 inner, dynamic photo + name, static ellipses |
| `emails/pem-meet-banner-preview.html` | Local browser preview of the PEM banner (sample data, no AMPscript) |
| `emails/assets/pem-banner/` | Static ellipse + magenta corner / bar PNGs (upload to SFMC Image Library) |
| `emails/sfmc-responsive-email.html` | Full hybrid email layout (600px desktop, stacked mobile) |
| `emails/sfmc-desktop-and-mobile-blocks.html` | Separate desktop-only / mobile-only `<tr>` blocks |

## PEM Meet banner (`pem-meet-banner.html`)

Matches the orange hero module:

| Spec | Value |
|------|--------|
| Main table | `640px`, padding `29px 36px 0 35px`, bg `#EB7231` |
| Inner table | `569px` × `167px`, **1 row / 2 columns** |
| Col 1 | Dynamic `<img src="%%=v(@PEM_Photo)=%%" … width="184" height="163">` + **3 static ellipses** + magenta corners |
| Col 2 | `Meet` (30px / 18px) + `%%=v(@PEM_FirstName)=%%` (30px / 36px), color `#F5EFE8` |
| Name accents | Magenta bars via table cells / images — **no `[ ]` characters** in the name |

1. Upload PNGs from `emails/assets/pem-banner/` to SFMC Content Builder.
2. In `pem-meet-banner.html`, replace `assets/pem-banner/...` paths with your hosted Image Library URLs.
3. Paste the module into an HTML Paste email (or Code Block).
4. Ensure the send audience / DE provides `PEM_Photo` and `PEM_FirstName`.

## Compatibility built in

| Client / platform | Technique used |
|-------------------|----------------|
| Outlook 2016–2021 / Microsoft 365 (Windows) | `<!--[if mso]>` / `<!--[if (gte mso 9)\|(IE)]>` ghost tables, fixed 600px width, VML bulletproof buttons, `bgcolor` + inline styles, `mso-line-height-rule` |
| Outlook.com / Outlook Mac | Standard table + inline CSS (Word engine not used) |
| Gmail (web + app) | Inline styles, fluid images, media queries where supported |
| Apple Mail / iOS Mail | Media queries, fluid layout, data-detector reset |
| Yahoo Mail | Table layout + inline CSS |
| Android / Gmail app | Full-width stacked columns ≤600px |

## SFMC-specific pieces

- AMPscript block for subject, preview, URLs, safe `FirstName`
- `%%=RedirectTo(@url)=%%` for tracked links
- `%%view_email_url%%`, `%%profile_center_url%%`, `%%unsub_center_url%%`
- Physical address: `%%Member_Busname%%`, `%%Member_Addr%%`, city/state/postal/country
- `alias=` on key links for tracking reports

## Import into Marketing Cloud

1. **Content Builder → Create → Email Message → HTML Paste** (or Code Paste).
2. Paste `sfmc-responsive-email.html` (or the desktop/mobile blocks file).
3. Replace placeholder images with **Content Builder / Image Library** URLs.
4. Update AMPscript `@subject`, `@previewText`, `@ctaUrl`, copy, and colors.
5. Set email Subject to `%%=v(@subject)=%%` (or type it in the send UI).
6. **Preview & Test** → Desktop + Mobile, then Inbox Preview / test sends to Outlook, Gmail, Apple Mail.

## Coding rules we follow on each prompt

1. Layout = nested tables with `tr`/`td` (no CSS Grid/Flex for structure).
2. Critical look = **inline CSS**; mobile tweaks in `<style>` `@media only screen and (max-width: 600px)`.
3. Outlook = MSO conditionals + VML buttons + `bgcolor` attributes.
4. Images = explicit `width`, `border="0"`, `display:block`, `max-width` + `.fluid` for mobile.
5. Fonts = web-safe stacks (Arial / Georgia) for Outlook parity.
6. Links = `RedirectTo()` for SFMC click tracking.
7. Always keep unsubscribe + physical address for compliance.

## Customization checklist

- [ ] Logo and hero image URLs (SFMC-hosted)
- [ ] Brand hex colors (default `#1a5f4a`)
- [ ] Headline, body, CTA label
- [ ] `@ctaUrl` / `@brandUrl` in AMPscript
- [ ] Data Extension attributes
- [ ] Subject / preview text
- [ ] Test: Outlook Windows, Gmail, iPhone Mail
