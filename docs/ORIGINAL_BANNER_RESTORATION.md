# Banner restoration

The homepage banner has been restored directly from the originally uploaded **SIT313-C2-DEV-Deakin** project, not redesigned.

- `src/pages/Home.jsx` uses the original banner JSX block verbatim.
- `src/styles/banner-original.css` uses the original banner CSS rules (including responsive breakpoints and the hover greeting) in the original order.
- `src/main.jsx` imports this banner stylesheet after the other styles, so later page styling does not replace its appearance.
- Login, Pricing, Browse Posts, Post, backend and Firestore files were not changed in this correction.

The site's live appearance still depends on fonts, viewport and browser. Firebase-connected functionality must be tested with your own credentials.
