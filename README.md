# UEU Canvas Theme (Curio)

Source code for the Unity Environmental University Canvas LMS theme.

## Output

`npm run build` produces minified, production-only JS bundles in `build/` (gitignored):

- `build/ueu_canvas_theme_web.min.js`
- `build/ueu_canvas_theme_mobile.min.js`

Each bundle starts by setting `window.__curioThemeVersion` to `<version> <git sha>` (dev bundles also carry a
`/* curio-theme v<version> <git sha> */` comment; the minifier strips it from the `.min.js` files). On a page
using a deployed theme, run `window.__curioThemeVersion` in the browser console to see which build is live.

`npm run build:dev` produces the unminified `eval-source-map` bundles (`ueu_canvas_theme_*.js`, no `.min`).
These are for local debugging only; don't upload them.

## Usage

```bash
npm install

# Production build (what gets uploaded)
npm run build

# Development build (with source maps) / watch mode
npm run build:dev
npm run watch

# Run tests
npm test
```

## Deploying

Merging a change does not change what users see. It only reaches Canvas after a rebuild and a
Theme Editor upload. Nothing is built or uploaded automatically.

1. In Canvas' theme editor, select the New Theme button
2. In the dropdown titled "Create theme based on", select the title of the theme with the green outline and "Current Theme"
3. Navigate to Upload, and only replace these files:

   | Theme Editor slot | File |
   | --- | --- |
   | JS | `build/ueu_canvas_theme_web.min.js` |
   | Mobile JS | `build/ueu_canvas_theme_mobile.min.js` |

4. Save the Theme as "Unity [DE/CE] Theme Candidate [Date]"
5. Test the theme in theme editor, making sure nothing breaks
6. Once tested appropriately, you can Apply Theme to make changes go live

The `live/` directory is not part of this process; see `live/README.md`.
