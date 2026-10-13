# Mary Faith Ardientes — Portfolio Website

React 19 + Vite + Tailwind CSS v4 personal portfolio showcasing projects in data analytics, AI/mobile development, and full-stack web applications.

## Development Server

Start the development server with:

```bash
npm run dev
```

- Preview URL: typically `http://localhost:5173`
- Build for production: `npm run build`
- Preview production build: `npm run preview`

## Project Structure

- `src/main.tsx` - React entrypoint; imports `src/index.css` and mounts `src/App.tsx` into `#root`
- `src/App.tsx` - Primary application component containing routing, case studies, terminal UI components, and resume/contact views
- `src/index.css` - Global design system, CRT aesthetics, scanline shaders, typography tokens, and Tailwind CSS v4 import
- `index.html` - HTML entry point with SEO metadata and web font connections
- `package.json` - Project dependencies, scripts, and build configuration
- `vite.config.ts` - Modern Vite configuration with React and Tailwind CSS v4 plugins plus the `@` alias for `src`

## Dependencies

- Runtime: React 19 and React DOM 19
- Styling: Tailwind CSS v4 with `@tailwindcss/vite`
- Build tooling: Vite 8, TypeScript 5.7, and `@vitejs/plugin-react`
- Formatting: oxfmt

## Styling & Design System

This project uses **Tailwind CSS v4** through the `@tailwindcss/vite` plugin with an authentic retro-computing / terminal aesthetic:
- Color palette: Forest ink (`#0b3d1e`), soft paper background (`#f6f8f2`), accent green (`#1f8a4c`)
- Monospace font: IBM Plex Mono
- Interactive elements: ASCII brackets, scanline page transitions, live Manila clock, terminal cursor
- Responsive layouts: Mobile-first with collapsible terminal navigation drawer

## Connecting GitHub Works

To link your repositories and live demos:
- Update project repositories and links in `src/App.tsx` (in the `Rice`, `Claro`, and `Hnl` case studies or `projects` array).
- Add your GitHub profile URL in the `Footer` and `Contact` sections.
