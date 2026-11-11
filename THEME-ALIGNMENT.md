# Terminal Theme Alignment & Clarity Audit

> **Core Philosophy**: *Terminal flavor in the chrome, plain language in the content.*
> Viewers include non-technical recruiters and HR screeners who make decisions in seconds. Clarity always supersedes theme purity: if terminal syntax and plain-language understanding conflict, clarity wins.

---

## 1. Theme Rules

### 1.1 The Clarity Rule (Highest Priority)
1. **Interactive Elements (Links & Buttons)**:
   - Must use human-readable, plain-language action verbs (for example: `View Projects ->`, `Read About ->`, `Print / Save PDF`, `Send Message`).
   - Shell command verbs (`cd`, `ls`, `cat`, `./*.sh`, `lpr`, `grep`) are **strictly prohibited** inside clickable link labels and button texts.
   - Every clickable element must visually communicate clickability through brackets `[ ... ]`, leading arrow `> `, text underline, or full color inversion on hover/focus.
2. **Decorative Command Syntax**:
   - Shell prompts (`$`, `guest@portfolio:~$`, command flags) are strictly decorative styling.
   - Decorative prompt labels must accompany clear human-readable section headings, never replace them.
   - Visitors must never be expected to type commands or interpret Unix CLI syntax to navigate or understand content.
3. **10-Second Recruiter Heuristic**:
   - Within 10 seconds of landing on any page, a recruiter must easily identify:
     1. Who the portfolio owner is
     2. What their primary skills and focus areas are
     3. How to view proof of work (projects and case studies)
     4. How to contact them or download their resume

### 1.2 Prompt Styling Convention (Decorative Layer)
- Unified prompt format: `guest@portfolio:~$ <command>` or `$ <command> --<flag>` as a secondary label.
- Placed above or beside standard headings (e.g. `$ cat status.env` accompanying `CURRENT STATUS`).
- Styled using muted ink (`var(--ink-muted)`) or inverted block tag (`var(--invert-bg)` with `var(--invert-text)`).

### 1.3 List & Layout Rules
- Two-column grid-aligned rows: keys/dates on the left, values/descriptions on the right.
- Output listing: Aligned columns or ASCII tree markers (`├── ` and `└── `) for clear visual hierarchy.
- Dividers: 1px solid lines or repeated ASCII divider characters (`+---+`, `=====`, `-----`).
- Strict prohibition of GUI window chrome: No simulated browser address bars, window dots, rounded card corners, or soft drop shadows.

### 1.4 Interaction Rules
- **Hover & Focus**: Instant color inversion (dark background with light text) or cursor highlight. No physical lifting (`translateY`), soft drop shadows, or scaling.
- **Blinking Cursor**: Terminal block cursor (`█`) indicates active focal points.
- **Motion & Accessibility**: Stepped character animations or digital counters (discrete 45ms steps) that instantly render static full content when `prefers-reduced-motion: reduce` is active.
- **Forms**: Natural mixed casing (`text-transform: none`) preserved across inputs and textareas to ensure legible email delivery and professional communication.

---

## 2. Comprehensive Misalignment Audit

| Section / File | Current Implementation (Off-Theme or Unclear) | Severity | Proposed Plain-Language Fix |
| :--- | :--- | :--- | :--- |
| **Hero / `src/App.tsx`** | Navigation links use shell commands: `cat ./about`, `ls ./projects`, `ssh github.com ->` | **High** | Replace button text with plain language: `About Mary ->`, `View Projects ->`, `GitHub Profile ->`. Keep decorative prompt indicator above or as prefix. |
| **Contact Form / `src/App.tsx`** | Submit button reads `[ ./send_message.sh ]` | **High** | Change button label to `[ Send Message ]` (or `[ Submit Message ]`). HR screeners may fear executing an unknown script. |
| **Case Studies / `src/App.tsx`** | Breadcrumb navigation reads `< cd ../projects` | **High** | Change to `< Back to Projects`. |
| **Case Studies / `src/App.tsx`** | Next project bottom link reads `cd ./readmission ->` | **High** | Change to `Next Project: Diabetes Readmission Risk ->` and `Back to All Projects ->`. |
| **Home Links / `src/App.tsx`** | Section navigation links read `ls ./achievements`, `ls -a ./projects`, `cat ./skills`, `./contact.sh --connect` | **High** | Change to plain language: `View All Achievements ->`, `Explore All Projects ->`, `View Skills Manifest ->`, `Contact Mary ->`. |
| **About Page / `src/App.tsx`** | Action links read `cat resume.pdf`, `ls ./projects` | **High** | Change to `View Resume ->` and `View Projects ->`. |
| **Resume / `src/App.tsx`** | Print button reads `[ print resume.pdf ]` | **Medium** | Change to `[ Print / Save PDF ]` so visitors know it opens standard browser print/export. |
| **Resume / `src/App.tsx`** | Header reads `$ cat resume.pdf \| lpr` | **Medium** | Pair decorative `$ resume --print` with a clear plain heading `CURRICULUM VITAE / RESUME`. |
| **404 Page / `src/App.tsx`** | Return button reads `[ cd ~ ]` | **Medium** | Change to `[ Return to Home ]`. |
| **Footer / `src/App.tsx`** | Top scroll button reads `$ cd ~ # top ^` | **Medium** | Change to `[ Top of Page ^ ]` or `Back to Top ^`. |
| **TopBar / `src/App.tsx`** | Build tag reads `BUILD:2026` | **Low** | Change to `PORTFOLIO 2026` or `EDITION 2026` for instant non-technical comprehension. |
| **Case Studies / `src/App.tsx`** | External project links read `git remote: claro (Flutter & YOLOv8) ->` | **Medium** | Change to `View GitHub Repository (Flutter & YOLOv8) ->`. |
| **Case Studies / `src/App.tsx`** | Colab link reads `jupyter: diabetes_readmission.ipynb ->` | **Medium** | Change to `Open Colab Notebook (Jupyter) ->`. |
| **Section Labels / `src/App.tsx`** | Headings like `$ cat status.env` or `$ cat skills.manifest` lack human-readable secondary titles | **Medium** | Pair decorative CLI commands with plain title tags: e.g. `<span class="cli-cmd">$ status</span> CURRENT STATUS`. |
| **Contact Error / `src/App.tsx`** | Error fallback refers to "mailto client" | **Low** | Clarify message: `Direct Email Fallback` with mail link and copy button. |

---

## 3. Top 5 Highest-Impact Changes

1. **Convert Navigation and Action Links to Plain Language**:
   - Eliminate `cat ./about`, `ls ./projects`, `ssh github.com ->`, and `cd ../projects`.
   - Replace with `About Mary ->`, `View Projects ->`, `GitHub Profile ->`, and `< Back to Projects`.
   - *Impact*: Immediate jump in usability for non-technical HR and talent acquisition screeners.

2. **De-jargon the Contact Form Submit Button**:
   - Replace `[ ./send_message.sh ]` with `[ Send Message ]`.
   - *Impact*: Eliminates hesitation from visitors who do not recognize shell scripts.

3. **Demystify Case Study Transitions & External Links**:
   - Replace `git remote: <name>` and `jupyter: <filename>` with `View GitHub Repository ->` and `Open Colab Notebook ->`.
   - *Impact*: Allows hiring managers to directly access project source code and interactive notebooks without decoding Git syntax.

4. **Pair Decorative Prompts with Real English Headings**:
   - Display a human-readable title alongside every decorative prompt (e.g. `$ timeline/` accompanied by `EXPERIENCE & MILESTONES`).
   - *Impact*: Preserves authentic terminal aesthetic while enabling fast scanning in under 10 seconds.

5. **Clarify Resume and Global Navigation Actions**:
   - Change `[ print resume.pdf ]` to `[ Print / Save PDF ]` and `$ cd ~ # top ^` to `[ Back to Top ^ ]`.
   - *Impact*: Clear call-to-actions that behave exactly as expected across desktop and mobile.

---

## 4. Reusable Pre-Commit Checklist

Before committing any content or UI modification, review each change against this checklist:

- [ ] **Recruiter Clarity Test**: *Would a non-technical recruiter or HR screener understand and navigate this without help?*
- [ ] **No Shell Commands in Interactive Copy**: Are all buttons, links, and navigation prompts written in plain language (no `cd`, `ls`, `cat`, `./*.sh`)?
- [ ] **Decorative Command Isolation**: Are shell commands strictly secondary, non-essential visual flavor?
- [ ] **Clickability Affordance**: Does every clickable element look clickable (`[ brackets ]`, `> ` prefix, underline, or hover inversion)?
- [ ] **Monospace & Character Grid**: Are monospace fonts and character-aligned columns preserved?
- [ ] **Border & Token Integrity**: Are all borders 1px solid or ASCII characters (no soft shadows, no rounded corners, no new color tokens)?
- [ ] **Natural Input Casing**: Does form input remain untransformed (`text-transform: none`) so email addresses and messages retain proper casing?
- [ ] **Mobile Responsiveness**: Does the layout wrap cleanly without horizontal scroll or broken words on screens down to 320px?
- [ ] **Reduced Motion**: Do animated counters and cursors render statically and immediately when `prefers-reduced-motion` is active?

