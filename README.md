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
Theme Editor upload:

1. Check out the commit to release and run `npm ci && npm test && npm run build`.
2. Upload the `build/*.min.js` bundles to the Theme Editor as a candidate, test on beta/test, then apply.
3. Record the commit SHA from `window.__curioThemeVersion` and tag a GitHub release with the `build/` files attached.

> The mapping of files to Theme Editor slots is not documented in this repo and has not been confirmed.
> The `live/` directory is believed to be legacy (see issue #8) but is left in place until a maintainer
> confirms against the Theme Editor which files each slot actually uses.
