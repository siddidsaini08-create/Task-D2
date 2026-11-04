# SIT313 combined coursework checklist

## C2 — Deploy DEV@Deakin
- [ ] Frontend URL opens and all routes refresh without a 404.
- [ ] Login, register, Google login and logout work on the hosted site.
- [ ] The backend host runs `/api/health` and the frontend is using the right `VITE_API_BASE_URL`.
- [ ] Verify contact/newsletter with configured Resend; otherwise explain any disabled feature accurately.
- [ ] Record 2–4 minute walkthrough and include link and hosted website URL in C2 report.

## D1 — Subscription
- [ ] Firestore `users/{uid}` contains a real saved profile with Free plan.
- [ ] Demonstration payment validates dummy details only.
- [ ] Secure backend upgrade changes the plan to Paid in Firestore.
- [ ] Badge changes with the saved plan and persists after refresh/log out/login.
- [ ] Firestore saved posts also have real documents for screenshots.

## D2 — Browse Posts Page
- [ ] GitLab project `Task D2` has visibility **Internal**.
- [ ] NO `node_modules`, `.env`, Firebase service-account key, or `dist` committed.
- [ ] C2/D1 features remain working on desktop, tablet and mobile.
- [ ] Create Question/Article with Free/Paid selection and input validation.
- [ ] Guest cannot submit; logged-in user can submit through Express.
- [ ] Firestore posts store UID and createdAt, but client reads/writes to posts are blocked by rules.
- [ ] Guest sees free posts only. Free user sees free posts only. Paid user sees both.
- [ ] Check Network tab on a Free session: **paid post data is absent from API response**.
- [ ] Filtering by date/type/plan/tag, hide (not delete), reset and expand work.
- [ ] Show login/logout of more than one user and upgrade process in 3–6 minute Panopto recording.
- [ ] Add screenshots: website, Firestore posts, Firestore users.
- [ ] Include GitLab repo URL and Panopto video URL in report. Upload report in OnTrack.

## Useful commit history
1. `Extend C2 and D1 project with responsive navigation`
2. `Add backend post publishing and subscription-based access`
3. `Add browse filters and D2 testing`
4. `Add report and demo screenshots`

**Do not fake screenshots or say cloud functionality was tested until you have run it against your Firebase project.**
