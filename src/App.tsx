import { FormEvent, ReactNode, useEffect, useRef, useState } from "react"
import { PORTFOLIO_CONFIG } from "./config"

type Page = "home" | "about" | "projects" | "rice" | "readmission" | "claro" | "hnl" | "skills" | "achievements" | "resume" | "contact" | "notes" | "404"

const routes: Record<string, Page> = {
  "/": "home",
  "/about": "about",
  "/projects": "projects",
  "/projects/rice-market-outlook": "rice",
  "/projects/readmission-risk": "readmission",
  "/projects/claro": "claro",
  "/projects/hnl-construction": "hnl",
  "/skills": "skills",
  "/achievements": "achievements",
  "/resume": "resume",
  "/contact": "contact",
  "/notes": "notes",
}

function getCleanPath(): string {
  if (typeof window === "undefined") return "/"
  if (window.location.hash && window.location.hash.startsWith("#/")) {
    return window.location.hash.slice(1)
  }
  let path = window.location.pathname || "/"
  path = path.replace(/^\/(portfolio|Portfolio)/i, "")
  if (!path.startsWith("/")) path = "/" + path
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1)
  return path
}

const pagePaths: Partial<Record<Page, string>> = Object.fromEntries(
  Object.entries(routes).map(([path, page]) => [page, path]),
)

const menuItems: Array<[string, string, Page]> = [
  ["01", "Home", "home"],
  ["02", "About", "about"],
  ["03", "Projects", "projects"],
  ["04", "Skills", "skills"],
  ["05", "Achievements", "achievements"],
  ["06", "Resume", "resume"],
  ["07", "Contact", "contact"],
  ["08", "Notes", "notes"],
]

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return { ref, visible }
}

function Cursor() {
  return (
    <span className="cursor" aria-hidden="true">
      █
    </span>
  )
}

function TopBar({
  onMenu,
  navigate,
}: {
  onMenu: () => void
  navigate: (page: Page) => void
}) {
  const [time, setTime] = useState("")
  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Manila",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date()),
      )
    update()
    const interval = window.setInterval(update, 30_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <header className="topbar">
      <button className="brand" onClick={() => navigate("home")}>
        {PORTFOLIO_CONFIG.profile.name}
      </button>
      <span className="edition">BUILD:2026</span>
      <span className="clock">MNL {time}</span>
      <button className="menu-trigger" onClick={onMenu}>
        [ MENU ]
      </button>
    </header>
  )
}

function MenuOverlay({
  open,
  onClose,
  navigate,
}: {
  open: boolean
  onClose: () => void
  navigate: (page: Page) => void
}) {
  useEffect(() => {
    if (!open) return
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose()
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [open, onClose])
  if (!open) return null
  return (
    <div
      className="menu-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
    >
      <button className="menu-close" onClick={onClose} autoFocus>
        [ ESC / CLOSE X ]
      </button>
      <nav className="menu-list">
        {menuItems.map(([number, label, page]) => (
          <button
            key={page}
            className="menu-link"
            onClick={() => {
              navigate(page)
              onClose()
            }}
          >
            <span className="menu-prefix">&gt; </span>
            {number} {label}
            <span className="menu-cursor">█</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function SectionLabel({
  cmd,
  children,
}: {
  cmd?: string
  children: ReactNode
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "4px",
        alignSelf: "flex-start",
      }}
    >
      {cmd && (
        <span
          style={{
            fontSize: "11px",
            color: "var(--ink-muted)",
            letterSpacing: "0.06em",
            fontFamily: "inherit",
            textTransform: "none",
          }}
          aria-hidden="true"
        >
          {cmd}
        </span>
      )}
      <h2 className="section-label">{children}</h2>
    </div>
  )
}

function SelectedParagraph({
  children,
  cursor = true,
  hero = false,
}: {
  children: string
  cursor?: boolean
  hero?: boolean
}) {
  const { ref, visible } = useInView<HTMLParagraphElement>()
  const [typed, setTyped] = useState(hero ? "" : children)
  useEffect(() => {
    if (!hero || !visible) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(children)
      return
    }
    let index = 0
    const timer = window.setInterval(() => {
      index += 1
      setTyped(children.slice(0, index))
      if (index >= children.length) window.clearInterval(timer)
    }, 25)
    return () => window.clearInterval(timer)
  }, [children, hero, visible])
  return (
    <p
      ref={ref}
      className={`selected-paragraph ${visible ? "is-visible" : ""}`}
    >
      <span>{typed}</span>
      {cursor && <Cursor />}
    </p>
  )
}

function Divider({ type = "A" }: { type?: "A" | "B" | "C" | "D" }) {
  const { ref, visible } = useInView<HTMLDivElement>()
  const chars = { A: "*", B: "/", C: "=", D: "-" }[type].repeat(180)
  return (
    <div
      ref={ref}
      className={`divider ${visible ? "is-visible" : ""}`}
      aria-hidden="true"
    >
      {chars}
    </div>
  )
}

function InlineLink({
  children,
  to,
  href,
  external,
  navigate,
}: {
  children: ReactNode
  to?: Page
  href?: string
  external?: boolean
  navigate?: (page: Page) => void
}) {
  if (href) {
    return (
      <a
        className="inline-link"
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    )
  }
  return (
    <a
      className="inline-link"
      href={to ? pagePaths[to] : "#"}
      onClick={(event) => {
        if (to && navigate) {
          event.preventDefault()
          navigate(to)
        }
      }}
    >
      {children}
    </a>
  )
}

function BracketButton({
  children,
  type = "button",
  onClick,
  disabled,
}: {
  children: string
  type?: "button" | "submit"
  onClick?: () => void
  disabled?: boolean
}) {
  return (
    <button
      className="bracket-button"
      type={type}
      data-label={children}
      onClick={onClick}
      disabled={disabled}
      style={disabled ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
    >
      <span data-label={children}>[ {children} ]</span>
    </button>
  )
}

function TimeTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="time-table">
      {rows.map(([date, label], index) => {
        const isLast = index === rows.length - 1
        const prefix = isLast ? "└──" : "├──"
        return (
          <div className="time-row" key={`${date}-${index}`}>
            <strong>
              <span className="tree-char" aria-hidden="true">{prefix} </span>
              {date}
            </strong>
            <span>{label}</span>
          </div>
        )
      })}
    </div>
  )
}

type StatBlockProps = {
  value: string
  caption: string
}

function StatBlock({ value, caption }: StatBlockProps) {
  const { ref, visible } = useInView<HTMLDivElement>()
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!visible) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(value)
      return
    }

    const chars = "0123456789ABCDEF#%*="
    let step = 0
    const totalSteps = 8

    const interval = window.setInterval(() => {
      step += 1
      if (step >= totalSteps) {
        setDisplay(value)
        window.clearInterval(interval)
        return
      }

      // Progressively lock characters from left to right
      const lockedLength = Math.floor((step / totalSteps) * value.length)
      const scrambled = value
        .split("")
        .map((char, i) => {
          if (
            i < lockedLength ||
            char === " " ||
            char === "." ||
            char === "/" ||
            char === "-" ||
            char === ","
          ) {
            return char
          }
          return chars[Math.floor(Math.random() * chars.length)]
        })
        .join("")

      setDisplay(scrambled)
    }, 45)

    return () => window.clearInterval(interval)
  }, [value, visible])

  return (
    <div ref={ref} className="stat-block">
      <strong>{display}</strong>
      <span>{caption}</span>
    </div>
  )
}

function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">[{children}]</span>
}

type Project = {
  index: string
  title: string
  summary: string
  metric: string
  tags: string[]
  year: string
  page: Page
  category: "Data" | "AI and Mobile" | "Web"
}

const projects: Project[] = [
  {
    index: "01",
    title: "Philippine Rice Market Outlook",
    summary:
      "End-to-end analytics pipeline merging PSA, PhilRice & NASA POWER data for 18 regions — Holt-Winters price forecast with 95% bands, star-schema Power BI dashboard, and DAX measures.",
    metric: "3.6% MAPE",
    tags: ["Python", "Power BI", "Holt-Winters", "DAX"],
    year: "2026",
    page: "rice",
    category: "Data",
  },
  {
    index: "02",
    title: "Readmission Risk Prediction + Guideline Assistant",
    summary:
      "30-day readmission risk prediction for diabetic inpatients using XGBoost with SHAP explanations, plus hybrid retrieval-based guideline search for discharge support.",
    metric: "AUROC 0.676",
    tags: ["Python", "XGBoost", "scikit-learn", "SHAP", "ChromaDB", "BM25"],
    year: "2026",
    page: "readmission",
    category: "Data",
  },
  {
    index: "03",
    title: "CLARO: AI-Powered Mobile App",
    summary:
      "On-device YOLOv8s model (57 SKUs, 12,454 images) deployed via TFLite with Gemini-powered OCR advisories & bilingual voice assistant — piloted with 50 shoppers at a Manila supermarket.",
    metric: "89.26% in-store",
    tags: ["Flutter", "YOLOv8", "TFLite", "Gemini API"],
    year: "2026",
    page: "claro",
    category: "AI and Mobile",
  },
]

function ProjectIndexRow({
  project,
  navigate,
}: {
  project: Project
  navigate: (page: Page) => void
}) {
  return (
    <a
      className="project-row"
      href={pagePaths[project.page]}
      onClick={(event) => {
        event.preventDefault()
        navigate(project.page)
      }}
    >
      <span className="project-index">{project.index}</span>
      <div className="project-main-info">
        <strong>{project.title}</strong>
        <p className="project-summary">{project.summary}</p>
        <span className="project-metric-badge">{project.metric}</span>
      </div>
      <span className="project-tags">
        {project.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </span>
      <span>{project.year}</span>
      <span aria-hidden="true">-&gt;</span>
    </a>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <Divider type="A" />
      <div className="footer-grid">
        <div>
          <p>
            {PORTFOLIO_CONFIG.profile.name} /{" "}
            {PORTFOLIO_CONFIG.profile.location}
          </p>
          <p>
            <a href={`mailto:${PORTFOLIO_CONFIG.profile.email}`}>
              {PORTFOLIO_CONFIG.profile.email}
            </a>{" "}
            /{" "}
            <a
              href={PORTFOLIO_CONFIG.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            /{" "}
            <a
              href={PORTFOLIO_CONFIG.profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
          <p>
            © 2026 {PORTFOLIO_CONFIG.profile.name} / Built with React &amp; Vite
          </p>
        </div>
        <button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top of page"
        >
          [ Back to Top ^ ]
        </button>
      </div>
    </footer>
  )
}

function PortraitPhoto() {
  const [imgError, setImgError] = useState(false)
  const photo = PORTFOLIO_CONFIG.profile.photo

  return (
    <div className="bbox-container">
      <div className="bbox-wrapper">
        <div className="bbox-photo">
          {photo && !imgError ? (
            <img
              src={photo}
              alt="Professional photo of Mary Faith Ardientes"
              className="portrait-img"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="portrait-placeholder-content">
              <span className="portrait-tag">[ PHOTO ]</span>
              <small className="portrait-sub">.:*:+:.</small>
              <span className="portrait-hint">
                Drop photo to:
                <br />
                <code style={{ fontSize: "9px" }}>public/images/profile.jpg</code>
              </span>
            </div>
          )}
        </div>
        <div className="bbox-detect" aria-hidden="true">
          <span className="bbox-corner bbox-tl" />
          <span className="bbox-corner bbox-tr" />
          <span className="bbox-corner bbox-bl" />
          <span className="bbox-corner bbox-br" />
          <div className="bbox-label">
            <span>MARY</span>
            <span className="bbox-conf" aria-hidden="true">0.98</span>
          </div>
          <div className="bbox-crosshair" />
        </div>
        <div className="bbox-status">
          <span className="bbox-status-label">TIP MANILA &bull; BS IT &apos;27</span>
          <span className="bbox-status-meta" aria-hidden="true">1 face detected &bull; 0.98</span>
        </div>
      </div>
    </div>
  )
}

function Home({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1 className="display-name">
            <span style={{ display: "block" }}>
              M A R Y&nbsp;&nbsp;&nbsp;&nbsp;F A I T H
            </span>
            <span style={{ display: "block" }}>
              A R D I E N T E S<Cursor />
            </span>
          </h1>
          <div className="hero-username-wrap">
            <a
              href={PORTFOLIO_CONFIG.profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-username-tag"
            >
              @{PORTFOLIO_CONFIG.profile.githubUsername}
            </a>
          </div>
          <SelectedParagraph hero>
            Aspiring data analyst and 4th-year IT student who turns data into
            useful insights and builds practical software for real-world
            problems.
          </SelectedParagraph>
          <div className="link-row">
            <InlineLink to="about" navigate={navigate}>
              About Mary -&gt;
            </InlineLink>
            <InlineLink to="projects" navigate={navigate}>
              View Projects -&gt;
            </InlineLink>
            <InlineLink href={PORTFOLIO_CONFIG.profile.githubUrl} external>
              GitHub Profile -&gt;
            </InlineLink>
          </div>
        </div>
        <PortraitPhoto />
      </section>
      <Divider type="A" />
      <Section>
        <SectionLabel cmd="$ cat status.env">CURRENT STATUS</SectionLabel>
        <div className="indented status-list">
          <p><span className="tree-char">├── </span>OPEN_TO: Internships &amp; entry-level data analyst roles</p>
          <p><span className="tree-char">├── </span>LOCATION: {PORTFOLIO_CONFIG.profile.location}</p>
          <p><span className="tree-char">├── </span>SCHOOL: {PORTFOLIO_CONFIG.profile.school}</p>
          <p><span className="tree-char">└── </span>GRADUATION: {PORTFOLIO_CONFIG.profile.expectedGraduation}</p>
        </div>
      </Section>
      <Section>
        <SectionLabel cmd="$ ls -t timeline/">CAREER TIMELINE</SectionLabel>
        <TimeTable
          rows={[
            [
              "2025",
              "TOPCIT participant, Technological Institute of the Philippines",
            ],
            [
              "Jan 2026",
              "Finalist & Most Scalable Solution, Safety by Design Showcase (IREX)",
            ],
            [
              "Feb 2026",
              "Consolation Prize, Data & AI Inclusion Hackathon (Grundfos x TIP)",
            ],
            [
              "Sep 2026",
              "Philippine Rice Market Outlook (Predictive Analytics & Power BI)",
            ],
            [
              "Oct 2026",
              "CLARO: Mobile AI Food Scanner & Advisory (Capstone Project)",
            ],
          ]}
        />
        <div className="indented">
          <InlineLink to="achievements" navigate={navigate}>
            View Achievements -&gt;
          </InlineLink>
        </div>
      </Section>
      <Divider type="B" />
      <Section>
        <SectionLabel cmd="$ ls -la projects/">FEATURED PROJECTS</SectionLabel>
        <div className="project-list">
          {projects.map((project) => (
            <ProjectIndexRow
              key={project.index}
              project={project}
              navigate={navigate}
            />
          ))}
        </div>
        <div className="indented">
          <InlineLink to="projects" navigate={navigate}>
            Explore All Projects -&gt;
          </InlineLink>
        </div>
      </Section>
      <Divider type="C" />
      <Section>
        <SectionLabel cmd="$ head -n 4 metrics.log">KEY PERFORMANCE METRICS</SectionLabel>
        <div className="stats-grid">
          <StatBlock value="89.26%" caption="in-store accuracy, CLARO YOLOv8" />
          <StatBlock
            value="3.6%"
            caption="backtest MAPE, rice price forecast"
          />
          <StatBlock
            value="4.68/5"
            caption="average shopper satisfaction (n=50)"
          />
          <StatBlock
            value="12,454"
            caption="dataset images trained for CLARO"
          />
        </div>
      </Section>
      <Section>
        <SectionLabel cmd="$ cat skills.txt">CORE SKILLS &amp; TECHNOLOGIES</SectionLabel>
        <div className="indented tags">
          {[
            "Python",
            "R",
            "Power BI",
            "Tableau",
            "Excel",
            "SQL",
            "React",
            "Next.js",
            "Flutter",
          ].map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="indented">
          <InlineLink to="skills" navigate={navigate}>
            View Full Skills Manifest -&gt;
          </InlineLink>
        </div>
      </Section>
      <Section>
        <SectionLabel cmd="$ ./contact.sh">GET IN TOUCH</SectionLabel>
        <p className="indented">
          &gt; Open to connecting and collaborating on data-driven projects.
        </p>
        <div className="indented">
          <InlineLink to="contact" navigate={navigate}>
            Get In Touch -&gt;
          </InlineLink>
        </div>
      </Section>
    </>
  )
}

function Section({ children }: { children: ReactNode }) {
  return <section className="content-section">{children}</section>
}

function About({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <Section>
        <SectionLabel cmd="$ cat about.md">ABOUT ME</SectionLabel>
        <SelectedParagraph>
          I'm a 4th-year Information Technology student who enjoys turning data
          into useful insights and building software that solves everyday
          problems. I like understanding how different tools and technologies
          fit together to make a working solution.
        </SelectedParagraph>
      </Section>
      <Divider type="D" />
      <Section>
        <SectionLabel cmd="$ cat focus_areas.txt">FOCUS AREAS</SectionLabel>
        <div className="indented block-list">
          <p>
            &gt; Data analytics: Python data pipelines, time-series forecasting,
            Power BI dashboards.
          </p>
          <p>
            &gt; AI and mobile: Computer vision (YOLOv8), OCR, Flutter, Firebase
            and Gemini API.
          </p>
          <p>
            &gt; Web development: Next.js, React, TypeScript, Tailwind CSS,
            PostgreSQL, Sanity CMS.
          </p>
        </div>
      </Section>
      <Section>
        <SectionLabel cmd="$ cat education.log">EDUCATION</SectionLabel>
        <TimeTable
          rows={[
            [
              "2027 (expected)",
              "BS Information Technology, Technological Institute of the Philippines - Manila",
            ],
          ]}
        />
      </Section>
      <Section>
        <SectionLabel cmd="$ cat currently.txt">CURRENT PURSUITS</SectionLabel>
        <p className="indented">
          &gt; Strengthening my skills in predictive analytics, econometrics, and
          machine learning while documenting open-source codebases on GitHub.
        </p>
      </Section>
      <Section>
        <SectionLabel cmd="$ cat looking_for.txt">LOOKING FOR</SectionLabel>
        <p className="indented">
          &gt; Internships and entry-level opportunities in data analytics, business
          intelligence, and related IT fields.
        </p>
      </Section>
      <div className="link-row indented">
        <InlineLink to="resume" navigate={navigate}>
          View Resume -&gt;
        </InlineLink>
        <InlineLink to="projects" navigate={navigate}>
          View Projects -&gt;
        </InlineLink>
      </div>
    </>
  )
}

function Projects({ navigate }: { navigate: (page: Page) => void }) {
  const [filter, setFilter] = useState("All")
  const filters = ["All", "Data", "AI and Mobile", "Web"]
  return (
    <Section>
      <SectionLabel cmd="$ ls -la projects/">PROJECT DIRECTORY</SectionLabel>
      <div className="filter-row" aria-label="Project filters">
        <span style={{ color: "var(--ink-muted)", alignSelf: "center", marginRight: "8px" }}>
          $ filter:
        </span>
        {filters.map((item, index) => (
          <span key={item}>
            <button
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              [ {item} ]
            </button>
            {index < filters.length - 1 && " "}
          </span>
        ))}
      </div>
      <div className="project-list">
        {projects
          .filter((project) => filter === "All" || project.category === filter)
          .map((project) => (
            <ProjectIndexRow
              key={project.index}
              project={project}
              navigate={navigate}
            />
          ))}
      </div>
      <Divider type="B" />
      <Section>
        <SectionLabel cmd="$ git remote -v --works">ADDITIONAL OPEN SOURCE WORKS</SectionLabel>
        <p className="indented muted" style={{ marginBottom: "16px" }}>
          &gt; Public repositories on{" "}
          <a
            href={PORTFOLIO_CONFIG.profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "underline", color: "var(--ink-primary)" }}
          >
            github.com/{PORTFOLIO_CONFIG.profile.githubUsername}
          </a>
          :
        </p>
        <div className="project-list">
          {PORTFOLIO_CONFIG.otherWorks.map((work) => (
            <a
              key={work.title}
              className="project-row"
              href={work.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="project-index">&gt;</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <strong>{work.title}</strong>
                  {"status" in work && Boolean(work.status) && (
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "1px 6px",
                        color: "var(--accent-cursor)",
                        border: "1px solid var(--accent-cursor)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      [ {work.status} ]
                    </span>
                  )}
                </div>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "12px",
                    color: "var(--ink-muted)",
                    textTransform: "none",
                  }}
                >
                  {work.description}
                </p>
              </div>
              <span className="project-tags">
                {work.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </span>
              <span>{work.category}</span>
              <span aria-hidden="true">-&gt;</span>
            </a>
          ))}
        </div>
      </Section>
    </Section>
  )
}

function MetaTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="meta-table">
      {rows.map(([label, value]) => (
        <p key={label}>
          <strong>{label}:</strong> {value}
        </p>
      ))}
    </div>
  )
}

type ProjectLink = {
  label: string
  href: string
  external?: boolean
}

function ProjectMediaViewer({
  simulator,
  imageSrc,
  imageAlt,
  title,
}: {
  simulator: ReactNode
  imageSrc?: string
  imageAlt: string
  title: string
}) {
  const [tab, setTab] = useState<"simulator" | "screenshot">("simulator")
  const [imgError, setImgError] = useState(false)

  return (
    <div>
      <div className="media-toggle-bar">
        <button
          className={`media-toggle-btn ${tab === "simulator" ? "active" : ""}`}
          onClick={() => setTab("simulator")}
        >
          [ SIMULATOR ]
        </button>
        <button
          className={`media-toggle-btn ${tab === "screenshot" ? "active" : ""}`}
          onClick={() => setTab("screenshot")}
        >
          [ SCREENSHOT ]
        </button>
      </div>

      {tab === "simulator" ? (
        simulator
      ) : (
        <div className="real-screenshot-frame">
          {imageSrc && !imgError ? (
            <div>
              <img
                src={imageSrc}
                alt={imageAlt}
                onError={() => setImgError(true)}
              />
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  color: "var(--ink-muted)",
                  textAlign: "center",
                }}
              >
                &gt; Production artifact: {imageAlt}
              </p>
            </div>
          ) : (
            <div className="screenshot-empty-notice">
              <strong>[ REAL SCREENSHOT PREVIEW READY ]</strong>
              <p style={{ margin: "8px 0 4px" }}>
                &gt; Place artifact image for {title} at:
              </p>
              <code>{imageSrc || "public/images/project.png"}</code>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CaseStudy({
  title,
  meta,
  sections,
  stats,
  tools,
  showcase,
  showcaseLabel,
  links,
  next,
  navigate,
}: {
  title: string
  meta: Array<[string, string]>
  sections: Array<[string, string]>
  stats?: Array<[string, string]>
  tools: string[]
  showcase?: ReactNode
  showcaseLabel?: string
  links: ProjectLink[]
  next: [string, Page]
  navigate: (page: Page) => void
}) {
  return (
    <>
      <div className="case-breadcrumb">
        <button
          onClick={() => navigate("projects")}
          className="breadcrumb-btn"
          aria-label="Return to projects catalog"
        >
          &lt; Back to Projects
        </button>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">{title.split(":")[0]}</span>
      </div>
      <section className="case-header">
        <h1 className="case-title">{title}</h1>
        <MetaTable rows={meta} />
      </section>
      <Divider type="A" />
      {sections.map(([label, copy]) => (
        <Section key={label}>
          <SectionLabel cmd={`$ cat ${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}.txt`}>
            {label.toUpperCase()}
          </SectionLabel>
          <p className="indented case-copy">{copy}</p>
        </Section>
      ))}
      {stats && (
        <Section>
          <SectionLabel cmd="$ head -n 4 metrics.log">KEY METRICS &amp; RESULTS</SectionLabel>
          <div className="stats-grid case-stats">
            {stats.map(([value, caption]) => (
              <StatBlock key={value} value={value} caption={caption} />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <SectionLabel cmd="$ cat dependencies.json">TECHNOLOGIES &amp; TOOLS</SectionLabel>
        <div className="indented tags">
          {tools.map((tool) => (
            <Tag key={tool}>{tool}</Tag>
          ))}
        </div>
      </Section>
      {showcase && (
        <Section>
          <SectionLabel cmd={showcaseLabel || "$ open preview"}>
            INTERACTIVE PREVIEW &amp; ARTIFACTS
          </SectionLabel>
          <div className="indented">{showcase}</div>
        </Section>
      )}
      <Section>
        <SectionLabel cmd="$ git remote -v --links">PROJECT LINKS &amp; SOURCE CODE</SectionLabel>
        <div className="indented link-row">
          {links.map((link) => (
            <InlineLink
              key={link.label}
              href={link.href}
              external={link.external}
            >
              {link.label} -&gt;
            </InlineLink>
          ))}
        </div>
      </Section>
      <div className="next-project">
        <InlineLink to={next[1]} navigate={navigate}>
          {next[0]}
        </InlineLink>
      </div>
    </>
  )
}

function Rice({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="Philippine Rice Market Outlook: Predictive Analytics Dashboard"
      meta={[
        ["Role", "Data Analyst"],
        ["Course", "Fundamentals of Analytics"],
        ["Institution", "TIP Manila"],
        ["Date", "September 2026"],
      ]}
      sections={[
        [
          "Overview",
          "A one-page Power BI dashboard answering three questions for rice market stakeholders: where retail prices are heading over the next six months, which regions have weak or at-risk yields, and how much rainfall is statistically associated with yield.",
        ],
        [
          "Data Pipeline",
          "Built a Python/Colab pipeline that standardized region names, converted dates, and merged four government Excel files (PSA production, area harvested, retail price, farmgate price) with NASA POWER weather data into five clean CSV tables. Passed all validation checks — no unmapped regions, median palay yield confirmed at 3.87 t/ha.",
        ],
        [
          "Forecasting",
          "Holt-Winters model forecasting the national retail price six months ahead at ~₱49.72/kg, with a 95% prediction band. Backtest MAPE: 3.6% nationally, ranging 1.9% (Eastern Visayas) to 12.9% (MIMAROPA) by region.",
        ],
        [
          "Dashboard & Data Model",
          "Star-schema model in Power BI with dim_region and Dim_Date linking four fact tables (price, forecast, weather, yield). Custom DAX measures include Yield vs National %, Yield Status (At Risk / Watch / Healthy), and Forecast MAPE %. A single region + year slicer drives five KPI cards, a hero forecast line chart, ranked yield bars, a rainfall-yield scatter, and an ecosystem donut.",
        ],
        [
          "Rainfall & Yield Finding",
          "The rainfall analysis found only a weak statistical association: r = −0.09, r² ≈ 0.007, across 554 region-quarters — less than 1% of quarterly yield variation explained by rainfall. Reported honestly as a finding, with a dashboard note that association ≠ causation.",
        ],
      ]}
      stats={[
        ["3.6%", "national backtest MAPE"],
        ["r = −0.09", "rainfall–yield correlation (554 region-quarters)"],
        ["18", "PSA regions analyzed & forecasted"],
        ["₱49.72", "6-month forecast national retail price"],
      ]}
      tools={[
        "Python",
        "Pandas",
        "Google Colab",
        "Power BI",
        "DAX",
        "Holt-Winters (Statsmodels)",
        "NASA POWER API",
        "PSA OpenSTAT",
        "PhilRice Ricelytics",
      ]}
      showcase={
        <div className="showcase-container">
          <div className="showcase-header">
            <span>[POWER BI] RICE OUTLOOK DASHBOARD</span>
            <span>ACADEMIC MIDTERM PROJECT</span>
          </div>
          <div className="showcase-body" style={{ padding: "16px" }}>
            <a
              href="/images/phil_rice_outlook.png"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="/images/phil_rice_outlook.png"
                alt="Philippine Rice Outlook 2018-2026 Power BI dashboard showing retail price forecast, yield by region, rainfall vs. yield, and production by ecosystem"
                loading="lazy"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                  display: "block",
                  border: "1px solid var(--ink-line)",
                }}
              />
            </a>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "11px",
                color: "var(--ink-muted)",
                textAlign: "center",
              }}
            >
              Screenshot of the Power BI report (academic midterm project).
            </p>
          </div>
        </div>
      }
      showcaseLabel="$ open rice_dashboard.pbix"
      links={[
        {
          label: "View GitHub Repository (Python & Pipeline)",
          href: PORTFOLIO_CONFIG.projects.rice.githubUrl,
          external: true,
        },
      ]}
      next={["Next: Diabetes Readmission Risk ->", "readmission"]}
      navigate={navigate}
    />
  )
}

function Readmission({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="Readmission Risk Prediction + Guideline Assistant"
      meta={[
        ["Role", "Predictive Analytics & Knowledge Layer Developer"],
        ["Course", "CIT403A, Fundamentals of Predictive Analytics"],
        ["Institution", "TIP Manila"],
        ["Date", "2026"],
        ["Team", "Group project with Roella Monzaga"],
      ]}
      sections={[
        [
          "Problem",
          "Hospital readmissions within 30 days are costly and often preventable, yet clinical teams lack patient-level risk scores at discharge. This project built a readmission risk prediction system for diabetic inpatients, paired with a retrieval-based guideline search to support discharge planning.",
        ],
        [
          "Data",
          "The Diabetes 130-US Hospitals dataset from UCI, covering encounters from 1999–2008. After cleaning, the dataset contained 99,340 encounters with an 11.39% readmission rate. I built the binary 30-day readmission target and engineered features including age midpoints and ICD-9 diagnosis grouping.",
        ],
        [
          "Approach",
          "I split the data by patient into train, validation, and test sets and checked for leakage. I trained a logistic regression baseline and a tuned XGBoost model, then applied isotonic calibration and built low, medium, and high risk bands. I explained predictions with SHAP. For the knowledge layer, I built a document ingestion and chunking pipeline over the AHRQ RED toolkit plus 16 project notes (521 chunks), created embeddings stored in ChromaDB, and implemented hybrid retrieval combining dense search, BM25, and reciprocal rank fusion. The team also built a LangGraph agent layer and Streamlit app that use the prediction and retrieval tools above, though those parts were not my work.",
        ],
        [
          "Results",
          "The XGBoost model reached AUROC 0.676, PR-AUC 0.212, and Brier score 0.096. The logistic regression baseline AUROC was 0.671 — a modest gain. A static-dashboard baseline scored AUROC 0.63 and PR-AUC 0.20. The high-risk band (about 10% of test patients) had a 27.0% observed readmission rate, medium 14.0%, low 6.7%, versus about 11.3% overall. On a 20-question test set, hybrid retrieval reached recall@5 of 0.90 versus 0.80 for vector-only and keyword-only search.",
        ],
        [
          "Limitations",
          "The dataset covers 1999–2008 encounters, so clinical patterns may have shifted. The predictive signal is moderate — AUROC 0.676 is a realistic but not strong discriminator. Retrieval test questions were written around the project's own notes, not independently sourced. Fairness audits showed recall and AUROC varied across age and race groups (for example, lower recall for patients aged 80+). The system is not clinically validated.",
        ],
        [
          "My Role",
          "I built and evaluated three parts of the system. In Part 1 (predictive analytics), I loaded and cleaned the dataset, built the readmission target, engineered features, split the data by patient and checked for leakage, trained the logistic regression baseline and tuned XGBoost model, applied isotonic calibration, built risk bands, explained predictions with SHAP, and built the input-validated prediction function. In Part 2 (knowledge layer), I built the document ingestion and chunking pipeline, created embeddings stored in ChromaDB, implemented hybrid retrieval (dense + BM25 + reciprocal rank fusion), and evaluated vector-only vs. keyword-only vs. hybrid retrieval. In Part 4 (evaluation), I ran the fairness audit across age, gender, and race, edge-case tests, and the baseline comparison against a static dashboard.",
        ],
      ]}
      stats={[
        ["0.676", "AUROC (XGBoost, calibrated)"],
        ["0.212", "PR-AUC"],
        ["0.096", "Brier score"],
        ["0.90", "recall@5, hybrid retrieval (20-question test)"],
      ]}
      tools={[
        "Python",
        "XGBoost",
        "scikit-learn",
        "SHAP",
        "ChromaDB",
        "BM25",
        "pandas",
      ]}
      links={[
        {
          label: "Open Colab Notebook (Jupyter)",
          href: PORTFOLIO_CONFIG.projects.readmission.notebookUrl,
          external: true,
        },
      ]}
      next={["Next: CLARO AI Mobile App ->", "claro"]}
      navigate={navigate}
    />
  )
}

function ClaroGallerySlot({
  initialSrc,
  fallbackSrcs = [],
  alt,
  caption,
  subImages,
}: {
  initialSrc: string
  fallbackSrcs?: string[]
  alt: string
  caption: string
  subImages?: { label: string; src: string }[]
}) {
  const [activeSrc, setActiveSrc] = useState(initialSrc)
  const [hasError, setHasError] = useState(false)
  const [candidateIndex, setCandidateIndex] = useState(0)

  const handleError = () => {
    if (fallbackSrcs && candidateIndex < fallbackSrcs.length) {
      const nextSrc = fallbackSrcs[candidateIndex]
      setCandidateIndex((prev) => prev + 1)
      setActiveSrc(nextSrc)
    } else {
      setHasError(true)
    }
  }

  if (hasError) return null

  return (
    <div className="claro-gallery-card">
      {subImages && subImages.length > 1 && (
        <div className="claro-gallery-tabs">
          <span className="claro-tabs-label">PART:</span>
          {subImages.map((sub) => (
            <button
              key={sub.src}
              type="button"
              className={`claro-tab-btn ${activeSrc === sub.src ? "active" : ""}`}
              onClick={() => setActiveSrc(sub.src)}
            >
              [{sub.label}]
            </button>
          ))}
        </div>
      )}
      <div className="claro-phone-frame">
        <a
          href={activeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="claro-gallery-link"
          title="Click to view full size in new tab"
        >
          <img
            src={activeSrc}
            alt={alt}
            loading="lazy"
            onError={handleError}
            className="claro-gallery-img"
          />
        </a>
      </div>
      <p className="claro-gallery-caption">
        <span className="ascii-bracket">[</span> {caption}{" "}
        <span className="ascii-bracket">]</span>
      </p>
    </div>
  )
}

function ClaroShowcase() {
  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <span>[CLARO] APPLICATION SCREENSHOTS &amp; FIELD PROOF</span>
        <span>EVER PLUS PILOT &bull; 57 SKUS</span>
      </div>
      <div className="showcase-body">
        <div className="claro-gallery-container">
          <ClaroGallerySlot
            initialSrc="/images/Scan.jpeg"
            fallbackSrcs={[
              "/images/scan.jpeg",
              "/images/Scan.png",
              "/images/scan.png",
            ]}
            alt="CLARO scanner detecting a canned product with a green bounding box"
            caption="01 SCAN"
          />
          <ClaroGallerySlot
            initialSrc="/images/Product_result_advisory1.jpeg"
            fallbackSrcs={["/images/product_result_advisory1.jpeg"]}
            subImages={[
              { label: "1", src: "/images/Product_result_advisory1.jpeg" },
              { label: "2", src: "/images/Product_result_advisory2.jpeg" },
              { label: "3", src: "/images/Product_result_advisory3.jpeg" },
            ]}
            alt="Product result with FDA status, allergen flags, and condition-specific health advisory"
            caption="02 ADVISORY"
          />
          <ClaroGallerySlot
            initialSrc="/images/Ranking_result.jpeg"
            fallbackSrcs={[
              "/images/ranking_result.jpeg",
              "/images/Ranking_result.png",
            ]}
            alt="Ranked product comparison based on the user's health profile"
            caption="03 COMPARE"
          />
          <ClaroGallerySlot
            initialSrc="/images/Voice_assistant.jpeg"
            fallbackSrcs={[
              "/images/voice_assistant.jpeg",
              "/images/Voice_assistant.png",
              "/images/voice_assistant.png",
              "/images/VoiceAssistant.jpeg",
              "/images/Accessibility.jpeg",
            ]}
            alt="Voice assistant and accessibility settings"
            caption="04 ACCESSIBILITY"
          />
        </div>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "11px",
            color: "var(--ink-muted)",
            textAlign: "center",
          }}
        >
          Screenshots from the Ever Plus Superstore field pilot (click any
          phone screen to open full size).
        </p>
      </div>
    </div>
  )
}

function Claro({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="CLARO: An AI-Powered Mobile Application for Health-Informed Decision-Making on Filipino Canned Foods and Instant Noodles"
      meta={[
        ["Role", "Project Manager & Quality Lead"],
        ["Type", "Capstone Project — BS IT"],
        ["Institution", "TIP Manila"],
        ["Date", "November 2026"],
        ["Team", "3 Members (Lead: Mary Faith Ardientes)"],
        ["Pilot Site", "Ever Plus Superstore Inc., Sampaloc, Manila"],
      ]}
      sections={[
        [
          "Overview",
          "CLARO is an AI-powered Android mobile application and web admin dashboard designed to support health-informed grocery purchasing among Filipino consumers aged 18 to 40. Developed with Flutter, Firebase, and React, it recognizes local canned foods and instant noodles across 57 SKUs and provides automated nutritional analysis, 2023 Nutri-Score and NOVA processing classifications, allergen alerts, FDA registration verification, multi-product scanning for up to 3 items, and bilingual voice assistance (English and Filipino).",
        ],
        [
          "Model & Edge Deployment",
          "A custom YOLOv8s (Small) object detection model was fine-tuned via transfer learning on 12,454 annotated images (4,414 source photographs across 57 benchmarked SKUs with Roboflow augmentation, 80/10/10 split) and exported to TensorFlow Lite FP32 for real-time on-device inference. On the held-out test set, the model achieved a mAP@50 of 97.60%, correctly identifying 89.26% of 242 real-world store images and 80.30% of multi-distance validation images (optimal range 20–30 cm).",
        ],
        [
          "AI & Health Advisory",
          "CLARO combines cloud-based generative AI (Google Gemini 3.5 Flash) with an on-device bilingual rule-based fallback advisory engine. Dietary guidance is anchored to WHO and NIDDK clinical thresholds for hypertension, diabetes, cardiovascular disease, chronic kidney disease (CKD), gastroesophageal reflux disease (GERD), and food allergies. A 3-tier caching architecture (in-memory, local device storage, Firestore offline SQLite) ensures scanning, scoring, and advisories remain operational offline in supermarket connectivity dead zones.",
        ],
        [
          "Admin Dashboard & Security",
          "A React web dashboard enables Ever Plus Superstore staff to review user-submitted unrecognized product reports, verify FDA registration records (CPR number and validity date), and audit activity logs. Patient health data is encrypted at rest using AES-GCM via Cloudflare Worker proxy and Android Keystore (FlutterSecureStorage), with PII stripped before external AI requests.",
        ],
        [
          "Field Evaluation",
          "Piloted on-site at Ever Plus Superstore Inc. (Sampaloc, Manila). In User Acceptance Testing (UAT) evaluated under ISO/IEC 25010 standards, 50 grocery shoppers awarded CLARO a composite mean rating of 4.68 out of 5.00, and the store administrator rated the dashboard 4.90 out of 5.00, with 3 licensed medical professionals validating the clinical dietary logic.",
        ],
      ]}
      stats={[
        ["89.26%", "in-store detection accuracy (242 real-world captures)"],
        ["97.60%", "mAP@50 detection accuracy (held-out test)"],
        ["4.68/5", "shopper UAT rating (ISO/IEC 25010, n=50)"],
        ["57", "benchmarked product SKUs"],
      ]}
      tools={[
        "Flutter",
        "Firebase (Firestore & Auth)",
        "React",
        "YOLOv8s",
        "TensorFlow Lite",
        "Gemini 3.5 Flash",
        "Roboflow",
        "Cloudflare Workers",
        "Cloudinary",
        "AES-GCM",
      ]}
      showcase={<ClaroShowcase />}
      showcaseLabel="$ open claro_gallery"
      links={[
        {
          label: "View GitHub Repository (Flutter & YOLOv8)",
          href: PORTFOLIO_CONFIG.projects.claro.githubUrl,
          external: true,
        },
      ]}
      next={["Back to Projects ->", "projects"]}
      navigate={navigate}
    />
  )
}

function Hnl({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="HNL Latina - Construction Website & Client Portal"
      meta={[
        ["Role", "Full-Stack Developer"],
        ["Type", "Client Project"],
        ["Status", "[ ONGOING DEVELOPMENT ]"],
        ["Date", "2026 — Present"],
      ]}
      sections={[
        [
          "Overview",
          "A production web platform currently in active ongoing development for HNL Latina Construction featuring a modern architectural materials catalog and digital quotation tools.",
        ],
        [
          "Headless CMS Integration",
          "Configuring Sanity Studio CMS so non-technical management can maintain building projects, catalog prices, and team personnel directly without writing code.",
        ],
        [
          "Backend & Pipeline",
          "PostgreSQL database integration for bid lead storage and automated transactional customer notifications powered by Resend.",
        ],
      ]}
      stats={[
        ["ONGOING", "project development phase"],
        ["Next.js", "core application framework"],
        ["Sanity", "headless CMS integration"],
      ]}
      tools={[
        "Next.js",
        "React",
        "TypeScript",
        "Tailwind CSS",
        "PostgreSQL",
        "Sanity CMS",
        "Resend",
      ]}
      links={[
        {
          label: "View GitHub Repository (Next.js & Sanity)",
          href: PORTFOLIO_CONFIG.projects.hnl.githubUrl,
          external: true,
        },
      ]}
      next={["Back to Projects ->", "projects"]}
      navigate={navigate}
    />
  )
}

const skillGroups: Array<[string, string[], string]> = [
  [
    "Data Analytics & Telemetry:",
    [
      "Python",
      "R",
      "Power BI",
      "Tableau",
      "Excel",
      "DAX",
      "star-schema modeling",
      "Time-series forecasting",
    ],
    "Applied in: Philippine Rice Market Outlook and econometrics coursework.",
  ],
  [
    "Machine Learning & Edge AI:",
    [
      "YOLOv8",
      "TensorFlow Lite",
      "Gemini API",
      "OCR",
      "Computer Vision",
      "Model Quantization",
    ],
    "Applied in: CLARO AI Mobile App capstone project.",
  ],
  [
    "Full-Stack Web & Mobile:",
    [
      "Next.js",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Flutter",
      "PostgreSQL",
      "Firebase",
      "Sanity CMS",
    ],
    "Applied in: CLARO Admin Dashboard, personal portfolio, and client web applications.",
  ],
]

function Skills() {
  return (
    <>
      <Section>
        <SectionLabel cmd="$ cat skills.manifest">TECHNICAL SKILLS MANIFEST</SectionLabel>
      </Section>
      {skillGroups.map(([label, tags, note]) => (
        <Section key={label}>
          <SectionLabel cmd={`$ ls ${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}/`}>
            {label.toUpperCase()}
          </SectionLabel>
          <div className="indented tags">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <p className="indented muted">&gt; {note}</p>
        </Section>
      ))}
      <Divider type="C" />
      <p className="soft-skills">
        &gt; Project management / Team leadership / Cross-functional collaboration /
        Problem solving / Analytical thinking / Technical communication
      </p>
    </>
  )
}

function Achievements() {
  return (
    <>
      <Section>
        <SectionLabel cmd="$ ls -t achievements/">AWARDS &amp; RECOGNITIONS</SectionLabel>
        <TimeTable
          rows={[
            [
              "Jan 2026",
              "Finalist, Safety by Design Showcase, Development Gateway (IREX)",
            ],
            [
              "Jan 2026",
              "Most Scalable SbD Solution (Special Recognition), Development Gateway (IREX)",
            ],
            [
              "Feb 2026",
              "Consolation Prize, Data & AI Inclusion Hackathon, Grundfos x TIP TechnoCoRe",
            ],
          ]}
        />
      </Section>
      <Divider type="B" />
      <Section>
        <SectionLabel cmd="$ cat certifications.log">CERTIFICATIONS &amp; ASSESSMENTS</SectionLabel>
        <div className="indented block-list">
          <p><span className="tree-char">├── </span>R for Data Science, Great Learning Academy</p>
          <p>
            <span className="tree-char">├── </span>TOPCIT 2025 Participant, Technological Institute of the
            Philippines - Manila, 2025
          </p>
          <p><span className="tree-char">└── </span>Microsoft Power BI Data Analyst Training (In Progress)</p>
        </div>
      </Section>
    </>
  )
}

function Resume() {
  const handlePrint = () => {
    window.print()
  }

  return (
    <Section>
      <div className="no-print">
        <SectionLabel cmd="$ cat resume.pdf | lpr">CURRICULUM VITAE / RESUME</SectionLabel>
        <div
          className="indented"
          style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}
        >
          <BracketButton onClick={handlePrint}>
            Print / Save PDF
          </BracketButton>
          <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
            &gt; Opens browser print / PDF export dialog
          </span>
        </div>
      </div>

      <div className="resume-paper" id="resume-print-area">
        <div className="resume-header">
          <h2>Mary Faith P. Ardientes</h2>
          <p>
            <a href="mailto:maryfaithardientes13@gmail.com">
              maryfaithardientes13@gmail.com
            </a>{" "}
            &#9670; 09569969023 &#9670; Manila, Philippines &#9670;{" "}
            <a
              href="https://www.linkedin.com/in/mary-ardientes-aa8598315"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.linkedin.com/in/mary-ardientes-aa8598315
            </a>
          </p>
        </div>

        <div className="resume-section-title">Professional Summary</div>
        <p className="resume-summary-text">
          Information Technology student and aspiring data analyst with hands-on
          experience in predictive analytics, dashboard development, and machine
          learning. Proven ability to deliver data-driven insights and project
          solutions through participation in hackathons and collaborative projects.
        </p>

        <div className="resume-section-title">Work Experience</div>

        <div className="resume-item">
          <div className="resume-item-header">
            <strong>
              Philippine Rice Market Outlook: A Predictive Analytics Dashboard for Price Forecasting
            </strong>
            <span className="resume-item-date">September 2026</span>
          </div>
          <div className="resume-item-header" style={{ marginTop: "1px" }}>
            <strong>and Regional Yield Risk</strong>
          </div>
          <div className="resume-item-role">
            Data Analyst
          </div>
          <ul>
            <li>
              Engineered an automated Python ETL pipeline merging PSA, PhilRice, and NASA POWER data across 18 regions.
            </li>
            <li>
              Forecasted retail rice prices six months ahead using an additive Holt-Winters model, achieving a 3.6% backtest MAPE with 95% prediction intervals.
            </li>
            <li>
              Designed an interactive Power BI dashboard using a star-schema model and custom DAX measures, visualizing regional price outlooks and rainfall-yield correlation (r = &minus;0.09).
            </li>
          </ul>
        </div>

        <div className="resume-item">
          <div className="resume-item-header">
            <strong>
              CLARO: An AI-Powered Mobile Application for Health-Informed Decision-Making
            </strong>
            <span className="resume-item-date">October 2026</span>
          </div>
          <div className="resume-item-role">
            Project Manager &amp; Quality Lead
          </div>
          <ul>
            <li>
              Led a 3-person team developing an on-device Flutter mobile app with a Firebase backend and a React admin dashboard, successfully piloted at Ever Plus Superstore in Manila.
            </li>
            <li>
              Fine-tuned a custom YOLOv8s model on 12,454 annotated images across 57 product classes, achieving 97.60% mAP@50 on test data and 89.26% real-world in-store detection accuracy; deployed via TensorFlow Lite FP32.
            </li>
            <li>
              Integrated on-device bilingual dietary advisories (WHO/NIDDK thresholds) with Gemini-powered OCR and voice assistance, achieving an 84% independent shopper completion rate and a 4.68/5.00 UAT rating (n = 50).
            </li>
          </ul>
        </div>

        <div className="resume-item">
          <div className="resume-item-header">
            <strong>
              Predictive Agentic RAG System for 30-Day Readmission Risk in Diabetic Inpatients
            </strong>
            <span className="resume-item-date">November 2026</span>
          </div>
          <div className="resume-item-role">
            Machine Learning &amp; RAG Developer
          </div>
          <ul>
            <li>
              Built an end-to-end 30-day hospital readmission risk model (XGBoost, scikit-learn) on 99,340 clinical encounters from the UCI Diabetes dataset, achieving 0.676 AUROC with SHAP feature interpretability.
            </li>
            <li>
              Calibrated risk bands using isotonic regression; the high-risk band was readmitted at 27.0% vs. 11.3% overall.
            </li>
            <li>
              Implemented a hybrid retrieval RAG pipeline (ChromaDB vector embeddings, BM25 keyword search, and Reciprocal Rank Fusion) over AHRQ clinical guidelines, achieving 0.90 Recall@5 versus 0.80 for vector-only retrieval.
            </li>
            <li>
              Ran fairness screening across age, gender, and race groups, comparing recall and AUROC to flag gaps.
            </li>
          </ul>
        </div>

        <div className="resume-section-title">Education</div>

        <div className="resume-edu-item">
          <div className="resume-item-header">
            <strong>Technological Institute of the Philippines - Manila</strong>
            <span className="resume-item-date">Expected Graduation - 2027</span>
          </div>
          <div className="resume-edu-sub">
            <span>Bachelor of Science in Information Technology</span>
            <span>Manila, Philippines</span>
          </div>
        </div>

        <div className="resume-edu-item">
          <div className="resume-item-header">
            <strong>STEM</strong>
            <span className="resume-item-date">2021 - 2023</span>
          </div>
          <div className="resume-edu-sub">
            <span>Senior High School</span>
            <span>Arellano University - Juan Sumulong Campus, Manila, Philippines</span>
          </div>
        </div>

        <div className="resume-section-title">Certifications &amp; Skills</div>
        <ul className="resume-skills-list">
          <li>
            <strong>Skills:</strong> Data Analysis; Predictive Analytics; Dashboard Development; Python; R; Power BI; Tableau; Machine Learning; SQL; Data Cleaning; Data Visualization; Communication; Attention to Detail; Project Management; Team Leadership
          </li>
          <li>
            <strong>Certifications:</strong> Finalist, Safety by Design Showcase, Development Gateway (IREX), January 2026; Most Scalable SbD Solution (Special Recognition), Development Gateway (IREX), January 2026; Consolation Prize, Data &amp; AI Inclusion Hackathon, Grundfos x TIP TechnoCoRe, February 2026
          </li>
        </ul>
      </div>
    </Section>
  )
}

function Contact() {
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_CONFIG.profile.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const accessKey = PORTFOLIO_CONFIG.contact.web3formsAccessKey
    if (!accessKey) {
      // Fallback directly to mailto if env variable is not configured
      const mailtoUrl = `mailto:${PORTFOLIO_CONFIG.profile.email}?subject=Portfolio Inquiry from ${encodeURIComponent(
        formData.name.trim(),
      )}&body=${encodeURIComponent(
        `From: ${formData.name.trim()} (${formData.email.trim()})\n\nMessage:\n${formData.message.trim()}`,
      )}`
      window.location.href = mailtoUrl
      setStatus("success")
      return
    }

    setStatus("sending")
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          subject: `Portfolio Inquiry from ${formData.name.trim()}`,
          from_name: `${formData.name.trim()} via Portfolio`,
          replyto: formData.email.trim(),
        }),
      })

      const result = await response.json()
      if (result.success) {
        setStatus("success")
        setFormData({ name: "", email: "", message: "" })
      } else {
        setStatus("error")
      }
    } catch {
      setStatus("error")
    }
  }

  return (
    <>
      <Section>
        <SectionLabel cmd="$ ./contact.sh --connect">GET IN TOUCH</SectionLabel>
        <SelectedParagraph>
          Open to internships, entry-level opportunities in data analytics, and
          tech collaborations. Let's connect.
        </SelectedParagraph>
        <div className="contact-links">
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <a href={`mailto:${PORTFOLIO_CONFIG.profile.email}`}>
              {PORTFOLIO_CONFIG.profile.email}
            </a>
            <button
              onClick={copyEmail}
              className="bracket-button"
              style={{
                fontSize: "11px",
                padding: "2px 8px",
              }}
            >
              {copied ? "[ COPIED! ]" : "[ COPY EMAIL ]"}
            </button>
          </div>
          <a
            href={PORTFOLIO_CONFIG.profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn: {PORTFOLIO_CONFIG.profile.linkedin}
          </a>
          <a
            href={PORTFOLIO_CONFIG.profile.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub: {PORTFOLIO_CONFIG.profile.githubUrl}
          </a>
        </div>
      </Section>
      <Divider type="D" />
      <form className="contact-form" onSubmit={submit}>
        <label>
          <span>Name &gt;</span>
          <input
            name="name"
            required
            autoComplete="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Your Name"
          />
        </label>
        <label>
          <span>Email &gt;</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="you@domain.com"
          />
        </label>
        <label>
          <span>Message &gt;</span>
          <textarea
            name="message"
            required
            rows={4}
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            placeholder="Hi Mary, I'd like to discuss an opportunity..."
          />
        </label>
        <BracketButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Transmitting..." : "Send Message"}
        </BracketButton>
        {status === "success" && (
          <p className="success" style={{ marginTop: "12px", lineHeight: 1.5 }}>
            &gt; [SUCCESS 200 OK]: Message transmitted directly to {PORTFOLIO_CONFIG.profile.email}. I&apos;ll get back to you shortly!
          </p>
        )}
        {status === "error" && (
          <p style={{ marginTop: "12px", color: "var(--ink-muted)", lineHeight: 1.5 }}>
            &gt; [TRANSMISSION ERROR]: Could not reach email gateway. You can send directly via{" "}
            <a
              href={`mailto:${PORTFOLIO_CONFIG.profile.email}?subject=Portfolio Inquiry from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(formData.message)}`}
              style={{ textDecoration: "underline", color: "var(--ink-primary)" }}
            >
              mailto client
            </a>{" "}
            or use the copy button above.
          </p>
        )}
      </form>
    </>
  )
}

function Notes() {
  const [openNote, setOpenNote] = useState<number | null>(null)

  const notesList = [
    {
      title: "How I built the Philippine Rice Market Forecast",
      summary:
        "Combining PSA, PhilRice and NASA POWER data into a seasonal Holt-Winters forecasting engine in Python and Power BI.",
      content:
        "The project required harmonizing 18 distinct regional datasets with disparate time granularities across retail prices, provincial paddy yields, and meteorological features (precipitation and solar radiation). Using Python and Pandas, we built automated ETL routines to clean outlier data points from weather anomalies and applied additive Holt-Winters exponential smoothing. The resulting 3.6% backtest MAPE allowed regional planners and agricultural stakeholders to observe price volatility trends with 95% confidence intervals directly in an interactive star-schema Power BI dashboard.",
    },
    {
      title: "Clinical Risk Stratification & Guideline Retrieval in EHR Systems",
      summary:
        "Predicting 30-day diabetic inpatient readmissions using cost-sensitive XGBoost with SHAP explainability and hybrid BM25 + dense guideline retrieval.",
      content:
        "Electronic health record datasets present severe class imbalance, extreme sparsity across clinical codes, and high collinearity among lab biomarkers. We trained cost-sensitive gradient boosted trees (XGBoost) evaluated with AUROC (0.676), computing TreeSHAP values for each individual prediction to give clinicians transparent attribution of inpatient length-of-stay, lab test counts, and prior admissions. To support post-discharge planning, a hybrid retrieval pipeline combining lexical BM25 and dense semantic embeddings queries curated clinical practice guidelines, surfacing evidence-grounded recommendations tailored to each patient profile.",
    },
    {
      title: "Training YOLOv8 for Edge Vision on Filipino CPG Products",
      summary:
        "Overcoming retail packaging glare, class imbalance across 57 SKUs, and building an offline-first 3-tier advisory cache for mobile inference.",
      content:
        "Standard object detection models struggle with the specular glare of canned goods and deformed flexible noodle packaging under fluorescent supermarket lighting. For CLARO, we custom-trained a YOLOv8s architecture across 57 benchmark SKUs using 12,454 annotated frames. On-site pilot evaluation at Ever Plus Superstore (Sampaloc, Manila) verified 97.60% mAP@50 and 89.26% accuracy on 242 real-world captures, supporting multi-item scanning of up to 3 products at 20–30 cm. An on-device 3-tier cache and bilingual clinical rule engine allow Nutri-Score, NOVA, and FDA registration verification to operate seamlessly without cellular connectivity.",
    },
    {
      title: "Production Architecture for Modern Headless Web Applications",
      summary:
        "Engineering responsive web applications with Next.js, Headless CMS, and transactional API pipelines.",
      content:
        "Architecting modern web portals requires balancing high-speed static generation with dynamic content authoring for non-technical stakeholders. By pairing Next.js App Router with Sanity Studio headless CMS, content editors can manage structured records without writing code or initiating server redeployments. Integrating type-safe API routes, database lead capture, and transactional email dispatch delivers fast performance and automated client workflows.",
    },
  ]

  return (
    <Section>
      <SectionLabel cmd="$ ls -la engineering_logs/">ENGINEERING LOGS &amp; WRITE-UPS</SectionLabel>
      <p className="indented muted">
        Behind-the-scenes engineering write-ups and technical methodologies.
      </p>
      <div className="notes-list">
        {notesList.map((note, index) => (
          <div
            className="note-row"
            key={note.title}
            style={{
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
            onClick={() => setOpenNote(openNote === index ? null : index)}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: "8px 12px",
                width: "100%",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "12px",
                  flex: "1 1 240px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--ink-muted)",
                    flexShrink: 0,
                  }}
                >
                  0{index + 1}
                </span>
                <strong style={{ minWidth: 0, overflowWrap: "break-word" }}>
                  {note.title}
                </strong>
              </div>
              <span style={{ flexShrink: 0, fontSize: "12px" }}>
                {openNote === index ? "[ CLOSE - ]" : "[ READ + ]"}
              </span>
            </div>
            <p
              style={{
                margin: "4px 0 0 clamp(16px, 3.5vw, 32px)",
                fontSize: "12px",
                color: "var(--ink-muted)",
                lineHeight: 1.5,
              }}
            >
              {note.summary}
            </p>
            {openNote === index && (
              <div
                style={{
                  margin: "8px 0 0 clamp(16px, 3.5vw, 32px)",
                  padding: "16px",
                  border: "1px dashed var(--ink-line)",
                  background: "rgba(169, 194, 176, 0.12)",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                {note.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}

function NotFound({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <section className="not-found">
      <SectionLabel cmd="$ cd /unknown">PAGE NOT FOUND (404)</SectionLabel>
      <div className="indented" style={{ marginTop: "24px" }}>
        <h1 style={{ display: "inline-block", margin: "0 0 24px" }}>
          &gt; Error 404: NO SUCH FILE OR DIRECTORY
        </h1>
        <p style={{ color: "var(--ink-muted)", margin: "0 0 24px", lineHeight: 1.6 }}>
          &gt; The requested path does not exist in this environment.
          <br />
          &gt; Use the button below to return to the home page.
        </p>
        <BracketButton onClick={() => navigate("home")}>
          Return to Home
        </BracketButton>
      </div>
    </section>
  )
}

function Boot({ onDone }: { onDone: () => void }) {
  const lines = [
    "> INITIALIZING MARY ARDIENTES PORTFOLIO...",
    "> CONNECTING REPOSITORIES... OK",
    "> LOADING TELEMETRY & DATA VISUALIZERS... OK",
    "> SYSTEM READY. WELCOME, VISITOR.",
  ]
  const full = lines.join("\n")
  const [text, setText] = useState("")
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(full)
      onDone()
      return
    }
    let index = 0
    const longestLine = Math.max(...lines.map((line) => line.length))
    const typing = window.setInterval(() => {
      index += 1
      setText(lines.map((line) => line.slice(0, index)).join("\n"))
      if (index >= longestLine) window.clearInterval(typing)
    }, 28)
    const finish = window.setTimeout(onDone, 1500)
    return () => {
      window.clearInterval(typing)
      window.clearTimeout(finish)
    }
  }, [full, onDone])

  useEffect(() => {
    const skip = () => onDone()
    window.addEventListener("keydown", skip, { once: true })
    window.addEventListener("click", skip, { once: true })
    return () => {
      window.removeEventListener("keydown", skip)
      window.removeEventListener("click", skip)
    }
  }, [onDone])

  return (
    <div className="boot-screen" aria-label="Portfolio loading">
      <pre>{text}</pre>
      <Cursor />
    </div>
  )
}

function App() {
  const getInitialPage = (): Page => {
    const clean = getCleanPath()
    if (clean === "/" || clean === "") return "home"
    return routes[clean] || "404"
  }

  const [page, setPage] = useState<Page>(getInitialPage)
  const [menuOpen, setMenuOpen] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [booting, setBooting] = useState(
    () => !sessionStorage.getItem("portfolio-booted"),
  )

  useEffect(() => {
    const pop = () => {
      const clean = getCleanPath()
      if (clean === "/" || clean === "") setPage("home")
      else setPage(routes[clean] || "404")
    }
    window.addEventListener("popstate", pop)
    window.addEventListener("hashchange", pop)
    return () => {
      window.removeEventListener("popstate", pop)
      window.removeEventListener("hashchange", pop)
    }
  }, [])

  const finishBoot = () => {
    sessionStorage.setItem("portfolio-booted", "true")
    setBooting(false)
  }

  const navigate = (next: Page) => {
    const path = pagePaths[next] || "/"
    if (next === page) {
      window.scrollTo(0, 0)
      return
    }
    setWiping(true)
    window.setTimeout(
      () => {
        const basePath =
          window.location.pathname.match(/^\/(portfolio|Portfolio)/i)?.[0] || ""
        window.history.pushState({}, "", basePath + path)
        setPage(next)
        setWiping(false)
        window.scrollTo(0, 0)
      },
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 150,
    )
  }

  const content: Record<Page, ReactNode> = {
    home: <Home navigate={navigate} />,
    about: <About navigate={navigate} />,
    projects: <Projects navigate={navigate} />,
    rice: <Rice navigate={navigate} />,
    readmission: <Readmission navigate={navigate} />,
    claro: <Claro navigate={navigate} />,
    hnl: <Hnl navigate={navigate} />,
    skills: <Skills />,
    achievements: <Achievements />,
    resume: <Resume />,
    contact: <Contact />,
    notes: <Notes />,
    "404": <NotFound navigate={navigate} />,
  }

  if (booting) return <Boot onDone={finishBoot} />

  return (
    <div className="app-shell">
      {wiping && <div className="scanline-wipe" aria-hidden="true" />}
      <TopBar onMenu={() => setMenuOpen(true)} navigate={navigate} />
      <MenuOverlay
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        navigate={navigate}
      />
      <main className="page" key={page}>
        {content[page]}
      </main>
      <Footer />
    </div>
  )
}

export default App
