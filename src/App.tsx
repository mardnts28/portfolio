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

function SectionLabel({ children }: { children: ReactNode }) {
  return <h2 className="section-label">{children}</h2>
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
    metric: "97.60% mAP@50",
    tags: ["Flutter", "YOLOv8", "TFLite", "Gemini API"],
    year: "2026",
    page: "claro",
    category: "AI and Mobile",
  },
  {
    index: "04",
    title: "HNL Construction Website",
    summary:
      "Production Next.js corporate portal with dynamic architectural cost estimator, Sanity CMS, PostgreSQL lead capture, and Resend transactional email — 100% Lighthouse score.",
    metric: "100% Lighthouse",
    tags: ["Next.js", "TypeScript", "Sanity CMS", "PostgreSQL"],
    year: "2026",
    page: "hnl",
    category: "Web",
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
        >
          $ cd ~  # top ^
        </button>
      </div>
    </footer>
  )
}

function PortraitPhoto() {
  const [imgError, setImgError] = useState(false)
  const photo = PORTFOLIO_CONFIG.profile.photo

  return (
    <div className="bbox-container" aria-label="Professional photo of Mary Faith Ardientes">
      {/* YOLOv8-style detection bounding box */}
      <div className="bbox-wrapper">
        {/* Corner brackets */}
        <span className="bbox-corner bbox-tl" aria-hidden="true" />
        <span className="bbox-corner bbox-tr" aria-hidden="true" />
        <span className="bbox-corner bbox-bl" aria-hidden="true" />
        <span className="bbox-corner bbox-br" aria-hidden="true" />

        {/* Label strip — top left like YOLO detection label */}
        <div className="bbox-label" aria-hidden="true">
          TIP MANILA &bull; BS IT &apos;27
        </div>

        {/* Confidence / scan line overlay */}
        <div className="bbox-scanline" aria-hidden="true" />

        {/* Photo or placeholder */}
        <div className="bbox-photo">
          {photo && !imgError ? (
            <img
              src={photo}
              alt={PORTFOLIO_CONFIG.profile.name}
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
              cat ./about
            </InlineLink>
            <InlineLink to="projects" navigate={navigate}>
              ls ./projects
            </InlineLink>
            <InlineLink href={PORTFOLIO_CONFIG.profile.githubUrl} external>
              ssh github.com -&gt;
            </InlineLink>
          </div>
        </div>
        <PortraitPhoto />
      </section>
      <Divider type="A" />
      <Section>
        <SectionLabel>$ cat status.env</SectionLabel>
        <div className="indented status-list">
          <p><span className="tree-char">├── </span>OPEN_TO: Internships &amp; entry-level data analyst roles</p>
          <p><span className="tree-char">├── </span>LOCATION: {PORTFOLIO_CONFIG.profile.location}</p>
          <p><span className="tree-char">├── </span>SCHOOL: {PORTFOLIO_CONFIG.profile.school}</p>
          <p><span className="tree-char">└── </span>GRADUATION: {PORTFOLIO_CONFIG.profile.expectedGraduation}</p>
        </div>
      </Section>
      <Section>
        <SectionLabel>$ ls -t timeline/</SectionLabel>
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
              "Jul 2026",
              "Freelance Full-Stack Developer, HNL Construction Website",
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
            ls ./achievements
          </InlineLink>
        </div>
      </Section>
      <Divider type="B" />
      <Section>
        <SectionLabel>$ ls -la projects/</SectionLabel>
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
            ls -a ./projects
          </InlineLink>
        </div>
      </Section>
      <Divider type="C" />
      <Section>
        <SectionLabel>$ head -n 4 metrics.log</SectionLabel>
        <div className="stats-grid">
          <StatBlock value="97.60%" caption="mAP@50, CLARO YOLOv8 model" />
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
        <SectionLabel>$ cat skills.txt</SectionLabel>
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
            cat ./skills
          </InlineLink>
        </div>
      </Section>
      <Section>
        <SectionLabel>$ ./contact.sh</SectionLabel>
        <p className="indented">
          &gt; Open to connecting and collaborating on data-driven projects.
        </p>
        <div className="indented">
          <InlineLink to="contact" navigate={navigate}>
            ./contact.sh --connect
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
        <SectionLabel>$ cat about.md</SectionLabel>
        <SelectedParagraph>
          I'm a 4th-year Information Technology student who enjoys turning data
          into useful insights and building software that solves everyday
          problems. I like understanding how different tools and technologies
          fit together to make a working solution.
        </SelectedParagraph>
      </Section>
      <Divider type="D" />
      <Section>
        <SectionLabel>$ cat focus_areas.txt</SectionLabel>
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
        <SectionLabel>$ cat education.log</SectionLabel>
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
        <SectionLabel>$ cat currently.txt</SectionLabel>
        <p className="indented">
          &gt; Strengthening my skills in predictive analytics, econometrics, and
          machine learning while documenting open-source codebases on GitHub.
        </p>
      </Section>
      <Section>
        <SectionLabel>$ cat looking_for.txt</SectionLabel>
        <p className="indented">
          &gt; Internships and entry-level opportunities in data analytics, business
          intelligence, and related IT fields.
        </p>
      </Section>
      <div className="link-row indented">
        <InlineLink to="resume" navigate={navigate}>
          cat resume.pdf
        </InlineLink>
        <InlineLink to="projects" navigate={navigate}>
          ls ./projects
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
      <SectionLabel>$ ls -la projects/</SectionLabel>
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
        <SectionLabel>$ git remote -v --works</SectionLabel>
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
                <strong>{work.title}</strong>
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
        <button onClick={() => navigate("projects")} className="breadcrumb-btn">
          &lt; cd ../projects
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
          <SectionLabel>{`$ cat ${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}.txt`}</SectionLabel>
          <p className="indented case-copy">{copy}</p>
        </Section>
      ))}
      {stats && (
        <Section>
          <SectionLabel>$ head -n 4 metrics.log</SectionLabel>
          <div className="stats-grid case-stats">
            {stats.map(([value, caption]) => (
              <StatBlock key={value} value={value} caption={caption} />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <SectionLabel>$ cat dependencies.json</SectionLabel>
        <div className="indented tags">
          {tools.map((tool) => (
            <Tag key={tool}>{tool}</Tag>
          ))}
        </div>
      </Section>
      {showcase && (
        <Section>
          <SectionLabel>{showcaseLabel || "$ open preview"}</SectionLabel>
          <div className="indented">{showcase}</div>
        </Section>
      )}
      <Section>
        <SectionLabel>$ git remote -v --links</SectionLabel>
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

// ---------------------------------------------------------------------------
// Interactive Visualizer 3: HNL Construction Website Showcase
// ---------------------------------------------------------------------------
function HnlWebsiteShowcase() {
  const [projectType, setProjectType] =
    useState<"residential" | "commercial" | "warehouse">("residential")
  const [area, setArea] = useState<number>(120)

  const rates = {
    residential: 24000,
    commercial: 31000,
    warehouse: 18500,
  }

  const total = area * rates[projectType]
  const structural = Math.round(total * 0.45)
  const architectural = Math.round(total * 0.35)
  const mep = Math.round(total * 0.2)

  const presets = [60, 120, 240, 360, 500]
  const maxArea = 600
  const barFilled = Math.min(20, Math.max(1, Math.round((area / maxArea) * 20)))
  const progressBar =
    "[" + "=".repeat(barFilled) + ">" + " ".repeat(Math.max(0, 20 - barFilled)) + "]"

  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <span>[HNL] CLIENT COST ESTIMATION ENGINE</span>
        <span>NEXT.JS &bull; SANITY CMS &bull; RESEND</span>
      </div>
      <div className="showcase-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              &gt; Dynamic Quotation Calculator (TypeScript &bull; Sanity Studio)
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                marginBottom: "16px",
              }}
            >
              Built for HNL Construction to automate client bids, store inquiries
              in PostgreSQL, and trigger transactional client emails via Resend.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--ink-muted)",
                  }}
                >
                  $ select --project-classification:
                </label>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button
                    className={`telemetry-tab ${
                      projectType === "residential" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("residential")}
                  >
                    [ Residential ]
                  </button>
                  <button
                    className={`telemetry-tab ${
                      projectType === "commercial" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("commercial")}
                  >
                    [ Commercial ]
                  </button>
                  <button
                    className={`telemetry-tab ${
                      projectType === "warehouse" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("warehouse")}
                  >
                    [ Warehouse ]
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "6px",
                    color: "var(--ink-muted)",
                  }}
                >
                  $ set --floor-area: <strong>{area} SQM</strong>
                </label>
                <div
                  style={{
                    display: "flex",
                    gap: "6px",
                    flexWrap: "wrap",
                    marginBottom: "8px",
                  }}
                >
                  {presets.map((sqm) => (
                    <button
                      key={sqm}
                      className={`telemetry-tab ${area === sqm ? "active" : ""}`}
                      onClick={() => setArea(sqm)}
                    >
                      [ {sqm} SQM ]
                    </button>
                  ))}
                  <button
                    className="telemetry-tab"
                    onClick={() => setArea((prev) => Math.max(40, prev - 20))}
                    title="Decrease by 20 SQM"
                  >
                    [ -20 ]
                  </button>
                  <button
                    className="telemetry-tab"
                    onClick={() => setArea((prev) => Math.min(600, prev + 20))}
                    title="Increase by 20 SQM"
                  >
                    [ +20 ]
                  </button>
                </div>
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "11px",
                    color: "var(--accent-cursor)",
                    letterSpacing: "0.08em",
                  }}
                  aria-hidden="true"
                >
                  SCALE: {progressBar} {area} / 600 SQM
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              border: "1px dashed var(--ink-line)",
              padding: "16px",
              background: "rgba(169, 194, 176, 0.12)",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "var(--ink-muted)",
                marginBottom: "8px",
              }}
            >
              $ calculate --bid-breakdown:
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontSize: "12px",
              }}
            >
              <span>Structural Framing (45%):</span>
              <strong>₱{structural.toLocaleString()}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontSize: "12px",
              }}
            >
              <span>Architectural Finishing (35%):</span>
              <strong>₱{architectural.toLocaleString()}</strong>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "12px",
                fontSize: "12px",
              }}
            >
              <span>MEP Engineering (20%):</span>
              <strong>₱{mep.toLocaleString()}</strong>
            </div>
            <div
              style={{
                borderTop: "1px solid var(--ink-primary)",
                paddingTop: "8px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "14px",
              }}
            >
              <strong>TOTAL ESTIMATE:</strong>
              <strong style={{ color: "var(--ink-primary)" }}>
                ₱{total.toLocaleString()} PHP
              </strong>
            </div>
            <small
              style={{
                display: "block",
                marginTop: "12px",
                fontSize: "10px",
                color: "var(--ink-muted)",
              }}
            >
              &gt; Synced with Sanity Studio CMS for instant pricing updates
              without code redeploys.
            </small>
          </div>
        </div>
      </div>
    </div>
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
          label: "git remote: rice-forecast (Python & Pipeline) ->",
          href: PORTFOLIO_CONFIG.projects.rice.githubUrl,
          external: true,
        },
      ]}
      next={["cd ./readmission ->", "readmission"]}
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
          label: "jupyter: diabetes_readmission.ipynb ->",
          href: PORTFOLIO_CONFIG.projects.readmission.notebookUrl,
          external: true,
        },
      ]}
      next={["cd ./claro ->", "claro"]}
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
        ["97.60%", "mAP@50 detection accuracy (held-out test)"],
        ["4.68/5", "shopper UAT rating (ISO/IEC 25010, n=50)"],
        ["57", "benchmarked product SKUs"],
        ["12,454", "annotated training dataset images"],
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
          label: "git remote: claro (Flutter & YOLOv8) ->",
          href: PORTFOLIO_CONFIG.projects.claro.githubUrl,
          external: true,
        },
      ]}
      next={["cd ./hnl ->", "hnl"]}
      navigate={navigate}
    />
  )
}

function Hnl({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="HNL - Construction Website & Client Cost Estimator"
      meta={[
        ["Role", "Full-Stack Developer"],
        ["Type", "Freelance Client Project"],
        ["Date", "July 2026"],
      ]}
      sections={[
        [
          "Overview",
          "Built a responsive production web platform for a Philippine construction firm featuring an interactive architectural quotation calculator and product materials catalog.",
        ],
        [
          "Headless CMS Integration",
          "Integrated Sanity Studio CMS so non-technical management can update featured building projects, catalog prices, and team personnel directly without writing code.",
        ],
        [
          "Backend & Reliability",
          "PostgreSQL database integration for bid lead storage and automated transactional customer notifications powered by Resend.",
        ],
      ]}
      stats={[
        ["100%", "lighthouse performance & SEO"],
        ["<1.2s", "average page load time"],
        ["0", "code required for client content updates"],
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
      showcase={
        <ProjectMediaViewer
          title="HNL Construction Platform"
          simulator={<HnlWebsiteShowcase />}
          imageSrc="/images/hnl-website.png"
          imageAlt="HNL Construction Responsive Website & Sanity CMS Studio"
        />
      }
      showcaseLabel="$ open hnl_estimator_preview"
      links={[
        {
          label: "HTTP: hnl-construction.com ->",
          href: PORTFOLIO_CONFIG.projects.hnl.liveSiteUrl,
          external: true,
        },
        {
          label: "git remote: hnl (Next.js & Sanity) ->",
          href: PORTFOLIO_CONFIG.projects.hnl.githubUrl,
          external: true,
        },
      ]}
      next={["cd ../projects", "projects"]}
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
    "Applied in: HNL Construction Website, CLARO Admin Dashboard, and personal portfolio.",
  ],
]

function Skills() {
  return (
    <>
      <Section>
        <SectionLabel>$ cat skills.manifest</SectionLabel>
      </Section>
      {skillGroups.map(([label, tags, note]) => (
        <Section key={label}>
          <SectionLabel>{`$ ls ${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}/`}</SectionLabel>
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
        <SectionLabel>$ ls -t achievements/</SectionLabel>
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
        <SectionLabel>$ cat certifications.log</SectionLabel>
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
      <SectionLabel>$ cat resume.pdf | lpr</SectionLabel>
      <div
        className="indented"
        style={{ display: "flex", gap: "12px", alignItems: "center" }}
      >
        <BracketButton onClick={handlePrint}>
          print resume.pdf
        </BracketButton>
        <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
          &gt; Opens browser print / PDF export dialog
        </span>
      </div>

      <div className="resume-paper" id="resume-print-area">
        <div className="resume-header">
          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "22px",
              letterSpacing: "0.05em",
            }}
          >
            {PORTFOLIO_CONFIG.profile.name}
          </h2>
          <p style={{ margin: 0, fontSize: "12px", color: "#444" }}>
            {PORTFOLIO_CONFIG.profile.location} &bull;{" "}
            <a href={`mailto:${PORTFOLIO_CONFIG.profile.email}`}>
              {PORTFOLIO_CONFIG.profile.email}
            </a>{" "}
            &bull;{" "}
            <a
              href={PORTFOLIO_CONFIG.profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>{" "}
            &bull;{" "}
            <a
              href={PORTFOLIO_CONFIG.profile.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>

        <div className="resume-section-title">Education</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "13px",
          }}
        >
          <strong>Technological Institute of the Philippines - Manila</strong>
          <span>Expected 2027</span>
        </div>
        <p style={{ margin: "2px 0 12px", fontSize: "12px", color: "#444" }}>
          Bachelor of Science in Information Technology (BS IT)
        </p>

        <div className="resume-section-title">Technical Expertise</div>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Languages &amp; Core:</strong> Python, R, SQL, TypeScript,
          JavaScript, DAX, Dart
        </p>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Data &amp; Analytics:</strong> Power BI, Tableau, Pandas,
          Excel, Time-Series Forecasting (Holt-Winters), Star-Schema
        </p>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Frameworks &amp; AI:</strong> React 19, Next.js, Flutter,
          YOLOv8, TensorFlow Lite, Gemini API, Tailwind CSS
        </p>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          <strong>Databases &amp; Cloud:</strong> PostgreSQL, Firebase,
          Supabase, Sanity CMS, Git/GitHub
        </p>

        <div className="resume-section-title">Key Projects</div>
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <strong>
              Philippine Rice Market Outlook &mdash; Predictive Analytics
              Dashboard
            </strong>
            <span>Sep 2026</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444" }}>
            &bull; Extracted and harmonized climate &amp; agricultural data from
            PSA, PhilRice, and NASA POWER across 18 Philippine regions.
            <br />
            &bull; Built Holt-Winters time-series forecasts with 95% confidence
            intervals achieving 3.6% backtest MAPE.
            <br />
            &bull; Designed interactive Power BI dashboards with DAX measures
            for executive regional price telemetry.
          </p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <strong>
              CLARO: AI Mobile Food Advisory Application &mdash; Capstone PM
            </strong>
            <span>Nov 2026</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444" }}>
            &bull; Trained YOLOv8s computer vision model on 12,454 annotated
            images (57 Filipino CPG classes) hitting 97.60% mAP@50.
            <br />
            &bull; Quantized to TFLite for real-time offline smartphone scanning
            and integrated Gemini API for bilingual voice advice.
            <br />
            &bull; Conducted grocery field study with 50 shoppers resulting in
            4.68/5 satisfaction and 84% independent task success.
          </p>
        </div>

        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "13px",
            }}
          >
            <strong>
              HNL Construction Website &mdash; Full-Stack Client Platform
            </strong>
            <span>Jul 2026</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444" }}>
            &bull; Developed full-stack company portal using Next.js,
            TypeScript, PostgreSQL, and Sanity Headless CMS.
            <br />
            &bull; Integrated automated construction cost calculator and Resend
            API for instant transactional notifications.
          </p>
        </div>

        <div className="resume-section-title">Honors &amp; Awards</div>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          &bull; <strong>Finalist &amp; Most Scalable Solution</strong> &mdash;
          Safety by Design Showcase, Development Gateway (IREX), Jan 2026
        </p>
        <p style={{ margin: "4px 0", fontSize: "12px" }}>
          &bull; <strong>Consolation Prize</strong> &mdash; Data &amp; AI
          Inclusion Hackathon, Grundfos x TIP TechnoCoRe, Feb 2026
        </p>
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
    setStatus("sending")
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: PORTFOLIO_CONFIG.contact.web3formsAccessKey,
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
        <SectionLabel>$ ./contact.sh --connect</SectionLabel>
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
          {status === "sending" ? "transmitting..." : "./send_message.sh"}
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
      title: "Performance Engineering & Dynamic Estimation for Corporate Web Portals",
      summary:
        "Architecting a 100% Lighthouse Next.js corporate portal with interactive architectural cost estimation, Sanity CMS, and automated lead capture.",
      content:
        "For the HNL Construction platform, our goal was enterprise-grade web performance paired with self-service client estimation tools. We engineered a dynamic floor plan and materials calculator with live arithmetic in TypeScript, backed by Sanity Headless CMS for structured content management. Server-side rendering, responsive SVG blueprints, and atomic Tailwind CSS delivery achieved perfect 100/100 Lighthouse scores across performance, accessibility, best practices, and SEO, driving qualified client inquiries through PostgreSQL and Resend transactional email.",
    },
  ]

  return (
    <Section>
      <SectionLabel>$ ls -la engineering_logs/</SectionLabel>
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
      <h1>&gt; Error 404: Page not found</h1>
      <button className="bracket-button" onClick={() => navigate("home")}>
        <span data-label="cd ~">[ cd ~ ]</span>
      </button>
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
  const [page, setPage] = useState<Page>(() => routes[getCleanPath()] || "home")
  const [menuOpen, setMenuOpen] = useState(false)
  const [wiping, setWiping] = useState(false)
  const [booting, setBooting] = useState(
    () => !sessionStorage.getItem("portfolio-booted"),
  )

  useEffect(() => {
    const pop = () => setPage(routes[getCleanPath()] || "home")
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
