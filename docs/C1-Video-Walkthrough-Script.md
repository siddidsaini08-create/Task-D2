# SIT313 C1 — 2–4 Minute Walkthrough Script

Use this as a guide and explain the code in your own words while recording. Show the running site as well as the source code.

## 0:00–0:30 — Introduce the page

“This is my DEV@Deakin website from P4, extended with the C1 New Post page. I open it using the Post item in the navigation. The page lets the user choose whether they want to create a Question or an Article.”

## 0:30–1:15 — Show conditional rendering

“In `src/pages/NewPost.jsx`, `useState` stores the selected post type, starting with Question. When I click Article, `setPostType` updates the state. React then conditionally renders the article fields instead of the question details field. This means the interface changes without reloading the page.”

Show the `postType` state declaration, `changePostType`, and the conditional expression that renders the two sets of fields.

## 1:15–2:10 — Explain validation

“The form uses controlled inputs, so each field value is kept in React state. When Post is clicked, the `validate` function checks the title length, the correct content field for the selected type, and the tags. Tags are separated by commas, and the form allows one to five tags. If validation fails, errors are shown beside the relevant fields and an error dialog appears.”

Demonstrate submitting an empty form.

## 2:10–2:45 — Demonstrate success and limits

“I will enter valid information and submit again. The success dialog appears after validation. The assignment says the actual publishing feature is for a future task, so this page demonstrates the frontend only and does not save the post.”

Demonstrate a valid Question or Article submission and close the dialog.

## 2:45–3:00 — Wrap up

“The New Post page is available at `/post`, the route is registered in `src/App.jsx`, the navigation item links to it, and the page styles are in `src/index.css`. I will include screenshots, the GitLab repository link, and this Panopto link in my report.”
