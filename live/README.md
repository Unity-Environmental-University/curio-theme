# live/

Legacy files. They are not built from `src/` and are not part of the deploy process in the main README.
Nobody on the team is sure exactly what they are for.

- `UTC_Template2023_Web.js`, `UTC_Template2023_Web.css`, `UTC_Template2023_Mobile.js`: old copies of the
  theme, untouched since early 2025 and missing later fixes.
- `UTC_Template2023_Mobile.css`: no `src/` equivalent, and it lacks the 2026 CSS fixes.
- `ROOT_Theme.js`: `src/rootThemeWeb.js` is not a webpack entry and has drifted from this file. Its
  deployment status is unconfirmed.

Don't upload these as a rollback; that could remove over a year of fixes. To deploy, build from a known
commit and follow the main README.
