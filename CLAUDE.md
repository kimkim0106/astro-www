# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server at localhost:4321
- `npm run build` - Build production site with type checking to ./dist/
- `npm run preview` - Preview built site locally
- `npm run update-articles` - Fetch latest 3 blog posts from Hatena Blog RSS feed

### Type Checking
- `astro check` - Run TypeScript type checking (included in build command)

### Testing
- `npm run test` - Run visual regression tests with Playwright
- `npm run test:visual` - Update visual regression snapshots
- `npm run test:ui` - Run tests with Playwright UI mode
## Architecture

This is an Astro-based personal website that serves as a portfolio/homepage. The architecture is data-driven with automated content updates.

### Key Components
- **Single Page Application**: All content is rendered on `/src/pages/index.astro`
- **Data-Driven Content**: JSON files in `/src/data/` contain dynamic content
- **Automated Blog Integration**: RSS feed from Hatena Blog auto-updates recent articles

### Data Sources
- `/src/data/profiles.json` - Personal profile information
- `/src/data/links.json` - Social media and platform links  
- `/src/data/articles.json` - Recent blog posts (auto-generated from RSS)
- `/src/data/files.json` - Presentation slides and documents

### Blog Article Updates
The `scripts/update-articles.ts` script:
- Fetches RSS feed from `https://kimkim0106.hatenablog.com/feed/author/kimkim0106`
- Parses XML using fast-xml-parser
- Extracts latest 3 articles with title, URL, and publication date
- Uses Temporal API for date handling in Asia/Tokyo timezone
- Updates `/src/data/articles.json` automatically

### Styling and Theming
- Custom CSS with CSS variables in `/public/css/common.css`
- Automatic light/dark mode via prefers-color-scheme
- Japanese language support with Noto fonts
- Responsive design

### Analytics
- Google Analytics integration via environment variable configuration
- Component: `/src/components/GoogleAnalytics.astro`

## Development Notes

- TypeScript strict mode enabled with Astro preset
- All content updates should modify JSON data files rather than hardcoding in components
- When adding new blog sources, update the `fetchFeedConfigs` array in `update-articles.ts`
- Static assets go in `/public/` directory