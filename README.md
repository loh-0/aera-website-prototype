# AÉRA website prototype

Built from the MKC2610 Website Mockup Figma file.

## Open it
Double-click `index.html`. Everything runs locally: no build step, no server.

## Put it online (free, permanent)
Drag this whole folder onto https://app.netlify.com/drop. Netlify gives you a public URL in about a minute.

## Pages
| File | Figma frame |
|---|---|
| index.html | Homepage – Desktop – Landing Page |
| shop.html | Homepage – Desktop – Landing Page (Shop All) |
| product.html | Sculpting Tank Top Product (works for every product via `?id=` and `&color=`) |
| cart.html | Shopping Cart |
| sustainability.html | Sustainability Page (the footprint graphic rebuilt as a live table, steps and fabric cards) |
| inspiration.html | Inspiration (the lookbook rebuilt as live components; photos link to products) |
| about.html | About Us Page (the "How We Started" story as live text and photos) |

## What's interactive
- Shop dropdown (Shop All / Fitness / Lounge), search, mobile menu
- Shop filters: category, price range, colour, size, dress style, Apply / reset, removable chips
- Product page: colour swatches, gallery thumbnails + click-to-zoom, size, quantity, Add to Cart, tabs, review sort/filter, Load More, Write a Review
- Cart: quantity, remove with undo, promo codes (`AERA10`, `WELCOME15`), quick-add recommendations
- Join Now / Sign Up modal, newsletter form, dismissible announcement bar, review carousel

The cart is saved in the visitor's own browser (clear site data to reset to the demo cart). The sign-up and newsletter forms collect nothing: no names or email addresses are stored or sent anywhere.

## Editing
- Colours and fonts: the top of `styles.css`
- Products, prices, reviews and promo codes: the top of `app.js`
- The shared header and footer are written once in `app.js`, so every page updates together.

Fonts: Prata and Crimson Text are bundled in `/fonts` (SIL Open Font License). Satoshi loads from Fontshare.
