# Copilot Instructions

## Commands

```bash
npm run start      # dev server (with --host)
npm run build      # tsc -b + vite build (base=/blog/)
npm run lint       # eslint
npm run deploy     # push dist/ to gh-pages via gh-pages
```

No test suite exists.

## Architecture

This is a personal blog frontend (React 19 + TypeScript + Vite) deployed to GitHub Pages at `/blog/`. It uses **HashRouter** — all routes are hash-based (`/#/`, `/#/post/:permalink`, `/#/about`, etc.).

**Content is served from a separate backend** at the URL in `VITE_APP_DOMAIN`. The frontend never writes content; it only fetches from these endpoints:
- `/mrblog-content/index/<magicword><chunkIndex>` — paginated post index (100 posts per chunk)
- `/mrblog-content/index/<magicword>category_<cat>_<chunkIndex>` — category-filtered index
- `/mrblog-content/blogposts/<permalink>` — individual post JSON `{title, categories, date, content}`
- `/mrblog-content/about`, `/mrblog-content/timeline`, `/mrblog-content/index/categories`

All fetches go through the singleton `contentManager` (in `ContentManager.ts`) which caches responses in-memory. A "magicword" (from the `magicword` file at repo root) gates access to private post chunks.

**Mobile vs desktop** is split at 960px via `react-responsive`. `main.tsx` renders either `BlogMain` (desktop) or `MobileBlogMain` (mobile) and provides `BlogContext` with `{ isMobile }`. Access it via `useBlogContext()`.

**Key files:**
- `ContentManager.ts` — all API logic, `PostInfo`/`CategoryNode` types, singleton export `contentManager`
- `BlogMain.tsx` — desktop layout, routing, `DirectoryTabs` (about/archive/friends), `MainFeedPage`
- `Mobile.tsx` — simplified mobile layout (feed + expandable about/friends, no archive tabs)
- `Components.tsx` — all page/UI components (`Post`, `ContentStream`, `ArchivePage`, `TimelinePostRenderer`, `PostExcerptRenderer`, etc.)
- `Utils.tsx` — shared utilities: `Markdown`, `P5Canvas`, `Expandable`, `Clickable`, `useWindowSize`, `useElementSize`
- `GlslBackground.tsx` — active GLSL shader background (full-screen fixed canvas, `zIndex: -100`)
- `background.tsx` — legacy p5.js background (currently commented out); also exports `getContentLeft()` and `getContentWidth()` used for layout
- `P5Functions.tsx` — p5.js drawing functions used inline (blockquote decorations, excerpt collapse handle)

## Key Conventions

**Layout math:** Desktop content position is computed via `getContentLeft()` / `getContentWidth()` from `background.tsx` — they snap to a 64px grid based on `window.innerWidth`. Many components use inline `style` with these values rather than CSS classes.

**Post loading / `ContentStream`:** Posts are fetched lazily. Scrolling to the bottom of a `ContentStream` triggers fetching the next chunk. `scrollMinIndex` must equal `startIndex` (asserted at runtime) — upward loading is not supported.

**Category paths** use dash-separated hierarchical strings (e.g., `art-digital`). The tree is built client-side from flat category strings in `asyncGetCategoryTree`.

**`localStorage` keys in use:**
- `directoryPageName` — last visited directory tab
- `lastRenderedCategory` — last archive category
- `tabsClickY` — visual position of tab handle
- `exp: <title>` — expanded/collapsed state for each `Expandable`

**`PostRenderer` pattern:** `Post` is a data-fetching wrapper that accepts a `renderer: PostRenderer` prop. Renderers (`TimelinePostRenderer`, `SinglePostRenderer`, `PostExcerptRenderer`) receive `{info, content, container}` and handle their own layout.

**Markdown rendering:** The `Markdown` component uses `react-markdown` with `remark-gfm` and `rehype-raw`. Pass `inline={true}` to strip block-level elements (images, headings → `<b>`, etc.) for use in truncated previews.

**Build deploy:** `npm run build` hard-codes `--base=/blog/`. The `magicword` file is read at runtime by the Python content scripts, not bundled.

**Python scripts** (`scripts/`) are content-management tools that require `MRBLOG_PATH`, `MRBLOG_CONTENT`, and `MRBLOG_DOMAIN` environment variables. They are independent of the frontend build.
