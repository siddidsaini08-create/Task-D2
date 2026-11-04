# Your remaining setup (short version)

1. Open folder in VS Code and run `npm install`.
2. Copy `.env.example` to `.env` and fill your Firebase **web app** values.
3. Make sure Email/Password + Google sign-in and Firestore are enabled in that SAME Firebase project.
4. Paste `firestore.rules` into Firestore Rules and Publish.
5. Get your Firebase **Admin** service account JSON and save locally as `serviceAccountKey.json`. Never share it, and never commit it.
6. Run `npm run server` in one terminal and `npm run dev` in another.
7. Test with actual Free & Paid accounts. Make screenshots and 3–6 minute D2 video.
8. Deploy frontend + backend if you want hosted D2; set `VITE_API_BASE_URL` and `CLIENT_ORIGIN` correctly.
9. Create **Internal** GitLab project `Task D2`, push files but not secrets or `node_modules`.

The code does not include private Firebase keys or live credentials. This is deliberate. Your existing C2 `.env` was **not** copied, as it may contain email passwords.
