# DataViz Platform (synthetix)

An offline-first, browser-based data warehouse, dashboard builder, and process mining
platform. No build step, no CDN dependencies, no backend — runs entirely as static
files, either opened directly (`file://`) or hosted on GitHub Pages.

## Phase 1 complete: multi-file refactor

The tool used to live in a single ~2,600-line `.html` file. This phase splits it into a
proper project structure with **zero behavior change** — every feature works exactly as
before; only the organization changed. This was verified two ways before delivery:

1. **Byte-level check** — every non-blank line from the original file is present in the
   new files, in a 1:1 multiset comparison (nothing duplicated, nothing dropped).
2. **Cross-reference check** — every `onclick`/`onchange` handler in the HTML resolves to
   a real function somewhere in `/js`, and every `getElementById()` call resolves to a
   real element ID (or a runtime-generated one from a template string, same as before).

## Folder structure

```
/
├── index.html          — page shell: <link> + <script> tags only, no logic
├── css/
│   ├── variables.css    — color/theme variables (dark + light)
│   ├── layout.css       — app shell, workspace, cards, generic layout
│   ├── sidebar.css      — left navigation
│   ├── forms.css        — buttons, inputs, selects, textareas
│   ├── components.css   — pills, badges, tabs, tiles, picker list
│   ├── dashboard.css    — widget grid, drag/resize, toggle switch
│   ├── widgets.css      — the right-side add/edit widget drawer
│   ├── process.css      — process flow canvas
│   └── modals.css       — tooltip, confirm modal, connector modals
└── js/
    ├── state.js          — global State object + module-level flags
    ├── helpers.js        — generic utilities (date/number formatting, CSV parsing, etc.)
    ├── router.js         — sidebar navigation / view switching
    ├── confirmModal.js    — reusable delete-confirmation dialog
    ├── storage.js         — IndexedDB persistence, auto-save status
    ├── folderConnect.js   — local folder connect (File System Access API)
    ├── dataHubConnectors.js — SharePoint/OneDrive + Amazon S3 connector modals
    ├── dataHub.js          — file upload, table list, write-back to CSV
    ├── sql.js              — the mini SQL engine (SELECT/WHERE/GROUP BY/aggregates)
    ├── processMap.js       — process mining engine (DFG, variants, layout, zoom, SVG)
    ├── widgetLibrary.js    — the component catalog (chart/KPI/selection types)
    ├── dashboard.js        — dashboard list/detail, undo/redo, edit/view toggle
    ├── widgetBuilder.js    — the widget creation/edit forms
    ├── widgetRenderer.js   — chart/KPI drawing + hover tooltips
    ├── themeManager.js     — dark/light theme toggle
    └── app.js              — bootstrap (init sequence, workspace export/import)
```

Load order in `index.html` matters (these are classic scripts, not ES modules — modules
get blocked by CORS when opened via `file://`, which would break local testing). The
order above is dependency-safe: state and helpers first, feature modules next, `app.js`
last since it calls `initApp()`.

## Testing locally

No install, no server. Just open `index.html` directly in Chrome or Edge (double-click,
or drag into a browser tab). Edit any `.css`/`.js` file, save, refresh the browser.

## Deploying

Same as before: push all files (preserving the folder structure) to the `main` branch of
this repo, then Settings → Pages → Deploy from branch → `main` / `(root)`.

GitHub's web upload UI supports dragging in whole folders and preserves the paths, or
use `git add . && git commit && git push` if you have git access.

## What's next (proposed roadmap)

- **Phase 2** — Visual redesign: glassmorphism cards, refined dark/light themes,
  smoother transitions.
- **Phase 3** — Dashboard Studio upgrades: duplicate widget, richer properties panel,
  more widget types.
- **Phase 4** — Process Intelligence upgrades: Variant Explorer, Case Explorer,
  Activity Explorer, conformance checking.

Each phase will keep this same principle: verifiable, incremental, no full-file rewrites.
