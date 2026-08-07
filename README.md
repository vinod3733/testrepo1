# Salesforce Marketing Cloud — Responsive HTML Email

HTML/CSS email template for **Salesforce Marketing Cloud (SFMC)** Content Builder, built with nested `<table>`, `<tr>`, and `<td>` layout for reliable desktop and mobile rendering.

## Files

| File | Purpose |
|------|---------|
| `emails/sfmc-responsive-email.html` | Main responsive template (600px desktop, fluid mobile) |
| `emails/sfmc-desktop-and-mobile-blocks.html` | Optional pattern with separate desktop-only / mobile-only table blocks |

## How it works

- **Desktop (≥601px):** Content sits in a centered 600px table. Two-column product blocks sit side by side.
- **Mobile (≤600px):** CSS `@media` rules make columns stack (`display:block` / `width:100%`), enlarge type, and stretch the CTA to full width.
- **Outlook:** Conditional `<!--[if mso]>` tables lock the 600px width and column split.
- **SFMC tokens:** Includes personalization and compliance links (`%%unsub_center_url%%`, `%%profile_center_url%%`, member address, etc.).

## Import into Marketing Cloud

1. Open **Content Builder** → **Create** → **Email Message** → **HTML Paste** (or Code Paste).
2. Paste the contents of `sfmc-responsive-email.html`.
3. Replace placeholder images with assets from your SFMC **Image Library** (or CDN URLs).
4. Update links, brand colors, and copy.
5. Optional AMPscript at the top of the HTML:

```html
%%[
  SET @subject = "Your subject line"
  SET @previewText = "Short preview text shown in the inbox"
]%%
```

6. Set the email **Subject** to `%%=v(@subject)=%%` (or type it directly).
7. **Preview & Test** → Desktop and Mobile panes, then send a test to Gmail / Outlook / Apple Mail.

## Desktop vs mobile tips for SFMC

- Keep the outer content width at **600px** for desktop.
- Use `class="fluid"` + `style="width:100%; max-width:…"` on images so they scale on phones.
- For columns, use the **hybrid** pattern in the template (`inline-block` + `max-width` + media query) so clients without media-query support still get a usable layout.
- Prefer **inline styles** for critical look; keep `@media` rules in `<style>` for mobile overrides.
- Always include CAN-SPAM / SFMC system links: unsubscribe, profile center, and physical address (`%%Member_*%%`).

## Customization checklist

- [ ] Logo and hero image URLs
- [ ] Brand hex colors (currently `#1a5f4a`)
- [ ] Headline, body, CTA label and URL
- [ ] Two-column feature images and copy
- [ ] Data Extension attributes (`FirstName`, etc.)
- [ ] Subject / preview text AMPscript
