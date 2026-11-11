# Terminal Portfolio Website

A personal portfolio web application built with a retro terminal and command prompt aesthetic. The interface pairs developer-oriented styling in the chrome with clear, plain-language content for non-technical visitors, recruiters, and hiring managers.

---

## 1. Overview

This project is a single-page portfolio application configured for fast loading and edge deployment. The user interface draws inspiration from classic CRT terminal consoles, command-line interfaces, and system monitoring logs. 

Key design principles:
- Terminal aesthetics in decorative elements, section banners, and borders.
- Plain-language labels on all clickable actions, links, and buttons.
- Character-grid alignment, monospace typography, and ASCII structural accents.
- Zero runtime overhead for heavy animation engines.

---

## 2. Tech Stack

- Framework: React 19 (`react`, `react-dom`)
- Build Tool: Vite 8
- Language: TypeScript 5.7
- Styling: Tailwind CSS v4 via `@tailwindcss/vite`
- Code Formatting: oxfmt
- Form Handling: Client-side submission via Web3Forms API with automatic mail client fallback

---

## 3. Project Structure

```text
portfolio/
├── public/                 # Static assets, favicon, redirect handlers, and project media
│   ├── images/             # Profile portraits, case study screenshots, and artifacts
│   ├── 404.html            # Single-page application redirect handler for static hosts
│   └── favicon.svg         # Terminal prompt favicon
├── src/                    # Application source code
│   ├── App.tsx             # Main application component, routing, views, and case studies
│   ├── config.ts           # Centralized configuration for profile data, links, and works
│   ├── index.css           # Global design system, CSS variables, CRT styling, and breakpoints
│   └── main.tsx            # React application entry point
├── .env.example            # Template for environment variables
├── .gitignore              # Git ignore rules for dependencies, build output, and secrets
├── index.html              # HTML entry point with font connections and metadata
├── package.json            # Project dependencies and script definitions
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Single-page application rewrite rules for Vercel deployment
└── vite.config.ts          # Vite build and plugin configuration
```

---

## 4. Getting Started

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd portfolio
npm install
```

### Environment Configuration
Copy the sample environment file and configure your credentials:

```bash
cp .env.example .env
```

Open `.env` and set your form access key:

```env
VITE_WEB3FORMS_ACCESS_KEY=<your-access-key>
```

### Development Server
Start the local Vite development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

### Production Build
Compile and bundle the production build into the `dist/` directory:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Code Formatting
Format source files using oxfmt:

```bash
npm run format
```

### Deployment
This project is configured for deployment on Vercel, Netlify, or GitHub Pages.

For Vercel deployment:
1. Connect your repository to Vercel.
2. Vercel automatically detects the Vite framework preset.
3. Set the build command to `npm run build` and output directory to `dist`.
4. Add `VITE_WEB3FORMS_ACCESS_KEY` under Project Settings > Environment Variables.
5. Deploy.

The included `vercel.json` file ensures client-side routes (e.g. `/projects`, `/about`) reload correctly without 404 errors.

---

## 5. Design System

### Typography
- Primary font: `IBM Plex Mono`, `JetBrains Mono`, monospace (used for all content, headers, and UI elements)
- Utility font: `Inter`, sans-serif (limited to system topbar metadata)

### Color Tokens
The design system relies on semantic CSS custom properties defined in `src/index.css`:

- `--bg-page` (`#f6f8f2`): Soft paper-like background matching retro CRT phosphors.
- `--ink-primary` (`#0b3d1e`): Deep forest ink used for body copy, primary headings, and borders.
- `--ink-muted` (`#4f7a5c`): Medium green tone for secondary text, metadata, and timestamps.
- `--ink-line` (`#a9c2b0`): Light muted green for subtle borders, grid dividers, and ASCII box-drawing.
- `--invert-bg` (`#0b3d1e`): Solid dark background for highlighted section badges and active states.
- `--invert-text` (`#f6f8f2`): Inverted light text rendered against dark backgrounds.
- `--accent-cursor` (`#1f8a4c`): Terminal cursor green used for status markers, live accents, and active indicators.

### Theme Rules
- Guiding principle: Terminal flavor in the chrome, plain language in the content.
- Clarity over purity: Links and buttons must use plain English action verbs (`View Projects ->`, `[ Send Message ]`), not shell commands (`cd`, `ls`, `./*.sh`).
- Decorative prompts: Command syntax (e.g., `$ status.env`) is purely decorative and must be paired with readable headings.
- Borders: Solid 1px lines or ASCII characters. No soft box-shadows, gradients, or rounded corners.
- Interactive feedback: Instant color inversion on hover and focus. No physical lift animations or scaling transforms.

---

## 6. Customization

All primary portfolio content is centralized to allow easy modification without editing core component logic.

### Profile and Projects Configuration (`src/config.ts`)
Edit `src/config.ts` to replace placeholder information:
- `profile.name`: Full name of the portfolio owner.
- `profile.title`: Professional headline and specialization.
- `profile.location`: City and country.
- `profile.email`: Contact email address.
- `profile.githubUrl`: Link to GitHub profile.
- `profile.linkedin`: Link to LinkedIn profile.
- `profile.photo`: Path to avatar or headshot in `public/images/`.
- `projects`: Repositories and external links for featured case studies.
- `otherWorks`: Additional project entries with titles, summaries, tags, and status tags (`[ ONGOING ]`).

### Case Studies and Detail Pages (`src/App.tsx`)
Case studies are declared using the `CaseStudy` component in `src/App.tsx`. Each study accepts:
- `title`: Project title.
- `meta`: Two-column key-value pairs (Role, Type, Date, Stack).
- `sections`: Content blocks (Overview, Architecture, Results).
- `stats`: Highlighted numerical metrics.
- `tools`: Array of technologies used.
- `links`: Array of external repository or live demo links.

### Resume and Timeline (`src/App.tsx`)
- Update the milestones array in the `Home` component to adjust the career timeline.
- Update the `Resume` component to adjust education, experience, and award records.

---

## 7. Accessibility and Performance Notes

### Reduced Motion Support
The application respects user system preferences for reduced motion:
- Animated scramble counters in metrics immediately display final numbers.
- CRT scanline wipe transitions between routes are disabled.
- Continuous jitter animations on detection frames are paused.
- All styles implement `@media (prefers-reduced-motion: reduce)`.

### High Contrast and Legibility
- Text contrast ratios exceed WCAG AA standards across all body paragraphs and interactive controls.
- Form inputs and textareas use `text-transform: none` to ensure visitor input is preserved with natural capitalization.

### Responsive Breakpoints
The layout adapts across five screen width tiers:
- Desktop (> 1024px): Multi-column grid with side-by-side terminal monitors and bounded hero copy.
- Tablet (≤ 1024px and ≤ 900px): Fluid column wrapping and proportionally scaled typography.
- Mobile (≤ 768px): Single-column stack with horizontally centered avatar frame and full-width navigation drawer.
- Small Mobile (≤ 400px): Tightened padding and character spacing to prevent text overflow on compact viewports down to 320px.

### Performance
- Production bundle size is under 280 kB uncompressed with zero external animation frameworks.
- Static assets and images implement `loading="lazy"` and graceful error handling.

