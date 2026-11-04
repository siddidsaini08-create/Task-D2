# How the two uploaded ZIPs were combined

Base: uploaded **Task-D1** project. It contains the newer Firebase login, Google sign-in, saved user accounts, subscription page, demo upgrade backend, portfolio, gallery and working email routes.

From uploaded **SIT313-C2-DEV-Deakin**: retained the richer New Post Question/Article form, responsive styling and tutorials section, and the Netlify deployment setup.

D2 additions:
- `src/pages/BrowsePosts.jsx` and `src/styles/browse-posts.css`: browse/filter/hide/reset/expand.
- `src/pages/NewPost.jsx`: existing C2 form extended with Free/Paid choice and real publishing.
- `shared/postValidation.js`: short, shared browser/server validation.
- `postAccess.js` and extra routes in `server.js`: backend-only Firestore read/write and verified plan checks.
- `firestore.rules`: post reads/writes blocked in clients; user profile read/creation preserved.
- `src/api.js`: local or hosted frontend can call the backend.
- `src/components/Navbar.jsx`, `src/styles/nav.css`, `src/styles/responsive.css`: combined links, a mobile menu and consistent alignment.
- `tests/posts.test.js`: backend access and post-validation checks.

The original D1 `Posts.jsx` was **replaced**, not kept active, because it queried Firestore from the browser and that would break the D2 requirement that Free browsers cannot receive paid post data. Its old `/posts` link still works, redirecting to the extended C2/D2 form at `/post`. Old D1 post documents are displayed as Free posts for backwards compatibility.

The uploaded C2 `.env` was intentionally NOT copied. Do not commit private email keys or Firebase Admin credentials. No changes have been made to either of your original ZIPs.
