# UEU Canvas Theme (Curio)

Source code for the Unity Environmental University Canvas LMS theme.

## Output

Running the build produces JS files for two platforms, placed in the `build/` directory.

## Usage

```bash
npm install

# Development build (with source maps)
npm run build

# Watch mode
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
