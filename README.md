# DEV@Deakin — SIT313 C2 + D1 + D2

This is **one combined React project**, made by extending the supplied C2 and D1 ZIPs rather than starting the website again. The existing homepage, portfolio projects, gallery, contact form, newsletter, login, register, Google sign-in and D1 demo subscription are retained. C2's Question/Article form is expanded for D2 and now saves through Express.

The site uses React + Vite, Firebase Authentication, Firestore, and an Express backend with Firebase Admin. The design stays mostly black, white and soft green, with separate JSX files for each page.

## Start here (Windows / VS Code)

1. Extract the ZIP and open the `SIT313-C2-D1-D2-Final` folder in VS Code (the one with `package.json`).
2. Install Node.js 20.19+ or 22.12+, if needed.
3. In a terminal run `npm install`. This will create a fresh `package-lock.json` (the old upload's lockfile predated Firebase Admin).
4. Copy `.env.example` to `.env` and fill in **your own** Firebase web configuration. Do not share or commit the `.env` file.
5. In **the same Firebase project**, enable Authentication → Email/Password and Google. Enable Firestore.
6. In Firestore → Rules, paste `firestore.rules` and **Publish**. These rules deny browser access to `posts` and allow only the backend to serve them.
7. Firebase Console → Project settings → Service accounts → Generate new private key. Save this locally as `serviceAccountKey.json` in the project root. Leave `FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json` in `.env`. **Never push this key to GitLab.**
8. Open two VS Code terminals in the project folder:
   - Terminal 1: `npm run server` (Express, port 5000)
   - Terminal 2: `npm run dev` (Vite, usually port 5173)
9. Open the Vite local address in your browser.

Resend (`RESEND_API_KEY`, `RESEND_FROM`, `RESEND_OWNER_EMAIL`) is only needed for the existing newsletter/contact email features. The app's login, posts and demo upgrade use Firebase instead. If you don't configure Resend, those email forms show an error rather than claiming a message was sent.

## Project pages

| Path | File | Origin / feature |
|---|---|---|
| `/` | `src/pages/Home.jsx` | Existing C2/D1 portfolio, gallery, tutorials, contact/newsletter |
| `/login` | `src/pages/Login.jsx` | D1 Firebase login, Google, password reset |
| `/register` | `src/pages/Register.jsx` | D1 account creation in Firestore |
| `/pricing` | `src/pages/Pricing.jsx` | D1 free/paid plans and test-only checkout |
| `/post` | `src/pages/NewPost.jsx` | C2 Question/Article form + D2 Free/Paid + secure publishing |
| `/browse` | `src/pages/BrowsePosts.jsx` | D2 list, filters, hide, reset, expand |

The older D1 `/posts` link redirects to the extended `/post` form. Old D1 documents in Firestore are shown as **Free** in Browse Posts. `src/styles/` holds the modular new/updated styles; `src/index.css` remains the original shared P5/C2 styling so the existing pages don't get redesigned.

## How D2 security works

- React gets a Firebase ID token when a user is logged in.
- `POST /api/posts` checks that token and validates post fields again on Express. It saves the user UID and server-generated creation date using Firebase Admin.
- `GET /api/posts` reads the **actual account plan** from Firestore using Firebase Admin. Guests/free users get only free documents; Paid users get both.
- The browser does not read the Firestore `posts` collection directly; `firestore.rules` blocks it. Browsers cannot request a higher plan through a query parameter.
- Hide/Reset only changes the current list in browser state. It never deletes Firestore records.
- Existing D1 `/api/upgrade` still simulates a Paid upgrade; **no real payment is processed**. Don't enter real card details.

## D2 practical test

1. As a guest, open Browse Posts → free only; open Post → login required.
2. Register a new user, log in (also try Google login), verify a `users/{uid}` document with `plan: Free`.
3. Create one Free Question and one Paid Article; check the Firestore `posts` collection for type, plan, UID and timestamp.
4. Browse while Free → only Free entries delivered in the Network response. Filter by type, plan, date, tag. Try Hide and Reset. Expand an article.
5. Upgrade in Pricing using the **example test-only** card on the page; verify Firestore user plan changes to `Paid`.
6. Browse while Paid → both Free and Paid. Log out → only Free visible again. Refresh and repeat.
7. Test desktop and narrow-mobile browser widths, and retest the original contact/newsletter where Resend is set up.

Run local logic tests: `npm test`. **Real Firebase/Auth, email service, and deployment must be tested with your own connected accounts.**

## Publish C2 + D2 (frontend and backend)

Static Netlify hosting runs React, **not** the Express server. For D2, the backend must also be deployed separately (e.g. Render or another Node hosting service).

**Backend (Node host):** publish this repository, use `npm install` as build command and `npm run server` as start command. Set `FIREBASE_SERVICE_ACCOUNT_JSON` to the service-account JSON content as a **private secret environment variable**, instead of uploading the JSON file. Set `CLIENT_ORIGIN` to your frontend's complete origin (e.g. `https://example.netlify.app`) and `PORT` if the host requires it. For newsletter/contact add Resend variables as private server settings.

**Frontend (Netlify):** import the same repository. Build command `npm run build`, publish directory `dist`; `netlify.toml` handles SPA refreshes. In Netlify environment variables set all `VITE_FIREBASE_*` web values and set `VITE_API_BASE_URL` to your working HTTPS backend origin (without `/api` or a trailing slash). Redeploy after changing env variables. Add the Netlify domain to Firebase Authentication → Settings → Authorized domains. If the Node host sleeps on its free tier, initial API requests can take longer.

**Don't put** `.env`, service-account JSON, passwords, `node_modules` or `dist` into GitLab. Create a **new GitLab project named `Task D2` with Internal visibility**, as required by the brief.

See `docs/SUBMISSION_CHECKLIST.md` for C2/D1/D2 report and video reminders.
