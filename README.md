# UEU Canvas Theme (Curio)

Source code for the Unity Environmental University Canvas LMS theme.

## Output

`npm run build` cleans `build/` (gitignored) and writes everything in one place:

```
build/
  ueu_canvas_theme_web.min.js      -> Theme Editor JS
  ueu_canvas_theme_mobile.min.js   -> Theme Editor mobile JS
  ueu_canvas_theme_web.css         -> Theme Editor CSS
  ueu_canvas_theme_mobile.css      -> Theme Editor mobile CSS
  dev/                             -> never upload
    ueu_canvas_theme_*.js          unminified, readable bundles
    ueu_canvas_theme_*.js.map      source maps
```

The four files directly in `build/` are exactly what gets uploaded. The two CSS files are currently identical,
copied from `src/css/custom_web.css` with a version comment added on the first line.

Every file carries `curio-theme v<version> <git sha>`. The JS bundles also set `window.__curioThemeVersion`, so on a
page using a deployed theme you can run that in the browser console to see which build is live. `build/dev/` holds
unminified copies of the same code, useful for debugging and for diffing against what's deployed; it uses plain
source maps rather than `eval`, so it's readable.

## Usage

```bash
npm install

# Full build: upload files in build/, debug bundles in build/dev/
npm run build

# Debug bundles only (build/dev/) / watch mode
npm run build:dev
npm run watch

# Run tests
npm test
```

## Changing styles

Edit `src/css/custom_web.css`; that is the only stylesheet source. The build copies it to both
`ueu_canvas_theme_web.css` and `ueu_canvas_theme_mobile.css` unchanged apart from the version comment, so a
style change reaches both Theme Editor CSS slots. If mobile ever needs its own styles, add a separate source
file and a second copy step in `webpack.config.js` (`EmitThemeCssPlugin`).

## Deploying

Merging a change does not change what users see. It only reaches Canvas after a rebuild and a
Theme Editor upload. Nothing is built or uploaded automatically.

1. Check out the commit to release and run `npm ci && npm test && npm run build`.
2. Upload the four files directly in `build/` to the matching Theme Editor slots as a candidate (see Output),
   test on beta/test, then apply. Don't upload anything from `build/dev/`.
3. Record the commit SHA from `window.__curioThemeVersion` and tag a GitHub release with the `build/` files attached.

The `live/` directory is not part of this process; see `live/README.md`.

## Releases and versions

- Bump `version` in `package.json` before building a release. It appears in every build's version stamp
  (`curio-theme v<version> <git sha>`), alongside the commit SHA.
- Build from a clean checkout of the commit being released. The stamp records the commit but not uncommitted
  changes, so a build from a dirty working tree can't be traced back exactly.
- Tag a GitHub release for each Theme Editor upload and attach the four files from `build/` (not `build/dev/`).
  The tag, the SHA in the stamp and the attached files then identify exactly what was uploaded.
- To check what's live: run `window.__curioThemeVersion` in the browser console on a page using the theme, or
  open the deployed JS/CSS and read the first line.

## Troubleshooting

- **Old files in `build/`:** `npm run build` clears `build/` first. `npm run build:dev` and `npm run watch` do not
  clear it and only write to `build/dev/`.
- **Mobile CSS looks different from before:** the mobile CSS slot now gets the same stylesheet as the web slot
  (`custom_web.css`). Previously the repo's `live/UTC_Template2023_Mobile.css` was suspected to be in use for mobile;
  confirm which file the mobile slot currently holds before switching.
- **Which file goes where:** see the table under Deploying.
