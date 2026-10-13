import { FormEvent, ReactNode, useEffect, useRef, useState } from "react"
import { PORTFOLIO_CONFIG } from "./config"

type Page = "home" | "about" | "projects" | "rice" | "claro" | "hnl" | "skills" | "achievements" | "resume" | "contact" | "notes" | "404"

const routes: Record<string, Page> = {
  "/": "home",
  "/about": "about",
  "/projects": "projects",
  "/projects/rice-market-outlook": "rice",
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
      <span className="edition">Portfolio 2026</span>
      <span className="clock">MNL {time}</span>
      <button className="menu-trigger" onClick={onMenu}>
        Menu
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
        Close [X]
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
}: {
  children: string
  type?: "button" | "submit"
  onClick?: () => void
}) {
  return (
    <button
      className="bracket-button"
      type={type}
      data-label={children}
      onClick={onClick}
    >
      <span data-label={children}>[ {children} ]</span>
    </button>
  )
}

function TimeTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="time-table">
      {rows.map(([date, label], index) => (
        <div className="time-row" key={`${date}-${index}`}>
          <strong>{date}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  )
}

type StatBlockProps = {
  value: string
  caption: string
}

function StatBlock({ value, caption }: StatBlockProps) {
  const { ref, visible } = useInView<HTMLDivElement>()
  const [display, setDisplay] = useState("0")
  useEffect(() => {
    if (!visible) return
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const match = value.match(/-?\d[\d,.]*/)
    if (reduced || !match) {
      setDisplay(value)
      return
    }
    const numeric = Number(match[0].replace(",", ""))
    const decimals = match[0].includes(".") ? match[0].split(".")[1].length : 0
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const progress = Math.min((now - start) / 900, 1)
      const current = numeric * progress
      let number = current.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
      if (value.startsWith("r = ")) number = `r = ${number}`
      else if (value.endsWith("%")) number += "%"
      else if (value.endsWith("/5")) number += "/5"
      setDisplay(number)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
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
      "Predictive price forecasting across 18 PSA regions with Holt-Winters seasonal exponential smoothing & Power BI telemetry.",
    metric: "3.6% MAPE",
    tags: ["Python", "Power BI", "Forecasting", "DAX"],
    year: "2026",
    page: "rice",
    category: "Data",
  },
  {
    index: "02",
    title: "CLARO: AI-Powered Mobile App",
    summary:
      "Real-time edge computer vision (YOLOv8s) & bilingual Gemini AI voice dietary advisory piloted with 50 supermarket shoppers.",
    metric: "98.55% mAP@50",
    tags: ["Flutter", "YOLOv8", "TFLite", "Gemini API"],
    year: "2026",
    page: "claro",
    category: "AI and Mobile",
  },
  {
    index: "03",
    title: "HNL Construction Website",
    summary:
      "Full-stack client corporate portal with dynamic architectural quotation estimator, PostgreSQL lead capture, and Sanity CMS.",
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
          Back to top ^
        </button>
      </div>
    </footer>
  )
}

function Home({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1 className="display-name">
            {PORTFOLIO_CONFIG.profile.displayName}
            <Cursor />
          </h1>
          <SelectedParagraph hero>
            Aspiring data analyst and 4th-year IT student who turns data into
            useful insights and builds practical software for real-world
            problems.
          </SelectedParagraph>
          <div className="link-row">
            <InlineLink to="about" navigate={navigate}>
              Read more
            </InlineLink>
            <InlineLink to="projects" navigate={navigate}>
              View projects
            </InlineLink>
            <InlineLink href={PORTFOLIO_CONFIG.profile.githubUrl} external>
              GitHub Profile -&gt;
            </InlineLink>
          </div>
        </div>
        <div className="portrait" role="img" aria-label="Terminal Avatar">
          <pre
            style={{
              margin: 0,
              fontSize: "11px",
              lineHeight: 1.25,
              textAlign: "center",
            }}
          >
            {`  +------------------+
  |  [ MFA / 2026 ]  |
  |                  |
  |     o      o     |
  |        <         |
  |     \\______/     |
  |                  |
  | DATA & IT ENGR   |
  +------------------+`}
          </pre>
          <small
            style={{
              marginTop: "12px",
              color: "var(--ink-muted)",
              fontSize: "11px",
            }}
          >
            TIP MANILA &bull; BS IT '27
          </small>
        </div>
      </section>
      <Divider type="A" />
      <Section>
        <SectionLabel>Status</SectionLabel>
        <div className="indented status-list">
          <p>Open to: Internships and entry-level data analyst roles</p>
          <p>Location: {PORTFOLIO_CONFIG.profile.location}</p>
          <p>School: {PORTFOLIO_CONFIG.profile.school}</p>
          <p>
            Expected graduation: {PORTFOLIO_CONFIG.profile.expectedGraduation}
          </p>
        </div>
      </Section>
      <Section>
        <SectionLabel>Timeline</SectionLabel>
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
            View achievements
          </InlineLink>
        </div>
      </Section>
      <Divider type="B" />
      <Section>
        <SectionLabel>Featured Projects</SectionLabel>
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
            View all projects
          </InlineLink>
        </div>
      </Section>
      <Divider type="C" />
      <Section>
        <SectionLabel>By the Numbers</SectionLabel>
        <div className="stats-grid">
          <StatBlock value="98.55%" caption="mAP@50, CLARO YOLOv8 model" />
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
        <SectionLabel>Skills Preview</SectionLabel>
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
            View all skills
          </InlineLink>
        </div>
      </Section>
      <Section>
        <SectionLabel>Contact</SectionLabel>
        <p className="indented">
          Open to connecting and collaborating on data-driven projects.
        </p>
        <div className="indented">
          <InlineLink to="contact" navigate={navigate}>
            Get in touch
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
        <SectionLabel>About</SectionLabel>
        <SelectedParagraph>
          I'm a 4th-year Information Technology student who enjoys turning data
          into useful insights and building software that solves everyday
          problems. I like understanding how different tools and technologies
          fit together to make a working solution.
        </SelectedParagraph>
      </Section>
      <Divider type="D" />
      <Section>
        <SectionLabel>Focus Areas</SectionLabel>
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
        <SectionLabel>Education</SectionLabel>
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
        <SectionLabel>Currently</SectionLabel>
        <p className="indented">
          Strengthening my skills in predictive analytics, econometrics, and
          machine learning while documenting open-source codebases on GitHub.
        </p>
      </Section>
      <Section>
        <SectionLabel>Looking For</SectionLabel>
        <p className="indented">
          Internships and entry-level opportunities in data analytics, business
          intelligence, and related IT fields.
        </p>
      </Section>
      <div className="link-row indented">
        <InlineLink to="resume" navigate={navigate}>
          View &amp; Download Resume
        </InlineLink>
        <InlineLink to="projects" navigate={navigate}>
          View projects
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
      <SectionLabel>Projects</SectionLabel>
      <div className="filter-row" aria-label="Project filters">
        {filters.map((item, index) => (
          <span key={item}>
            <button
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              aria-pressed={filter === item}
            >
              {item}
            </button>
            {index < filters.length - 1 && " / "}
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
        <SectionLabel>More GitHub Works &amp; Repositories</SectionLabel>
        <p className="indented muted" style={{ marginBottom: "16px" }}>
          Explore open-source repositories and experimental codebases on{" "}
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
              <span className="project-index">&bull;</span>
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
              <span aria-hidden="true">&rarr;</span>
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
          [ Interactive Simulator ]
        </button>
        <button
          className={`media-toggle-btn ${tab === "screenshot" ? "active" : ""}`}
          onClick={() => setTab("screenshot")}
        >
          [ Real Screenshot / Production Proof ]
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
                Production artifact: {imageAlt}
              </p>
            </div>
          ) : (
            <div className="screenshot-empty-notice">
              <strong>[ REAL SCREENSHOT PREVIEW READY ]</strong>
              <p style={{ margin: "8px 0 4px" }}>
                To display your real screenshot for {title}, place your image
                at:
              </p>
              <code>{imageSrc || "public/images/project.png"}</code>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "11px",
                  color: "var(--ink-muted)",
                }}
              >
                The website will automatically load and display it here!
              </p>
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
  links: ProjectLink[]
  next: [string, Page]
  navigate: (page: Page) => void
}) {
  return (
    <>
      <div className="case-breadcrumb">
        <button onClick={() => navigate("projects")} className="breadcrumb-btn">
          &lt; Back to all projects
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
          <SectionLabel>{label}</SectionLabel>
          <p className="indented case-copy">{copy}</p>
        </Section>
      ))}
      {stats && (
        <Section>
          <SectionLabel>Results &amp; Metrics</SectionLabel>
          <div className="stats-grid case-stats">
            {stats.map(([value, caption]) => (
              <StatBlock key={value} value={value} caption={caption} />
            ))}
          </div>
        </Section>
      )}
      <Section>
        <SectionLabel>Tech Stack &amp; Tools</SectionLabel>
        <div className="indented tags">
          {tools.map((tool) => (
            <Tag key={tool}>{tool}</Tag>
          ))}
        </div>
      </Section>
      {showcase && (
        <Section>
          <SectionLabel>Interactive Project Preview</SectionLabel>
          <div className="indented">{showcase}</div>
        </Section>
      )}
      <Section>
        <SectionLabel>Source Code &amp; Project Links</SectionLabel>
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
// Interactive Visualizer 1: Philippine Rice Market Outlook
// ---------------------------------------------------------------------------
function RiceDashboardShowcase() {
  const [region, setRegion] = useState<"R3" | "NCR" | "R6" | "R4A">("R3")

  const data = {
    R3: {
      name: "Region III - Central Luzon",
      curr: "₱48.50 / kg",
      forecast: "₱51.40 / kg",
      trend: "+5.9% (Projected Q4)",
      mape: "3.2%",
      points: [44, 45, 46.2, 45.8, 47.5, 48.5, 49.3, 50.1, 50.8, 51.4],
      low: [42, 43, 44.1, 43.8, 45.2, 46.1, 46.8, 47.4, 48.0, 48.5],
      high: [46, 47, 48.3, 47.8, 49.8, 50.9, 51.8, 52.8, 53.6, 54.3],
    },
    NCR: {
      name: "National Capital Region (NCR)",
      curr: "₱52.00 / kg",
      forecast: "₱54.30 / kg",
      trend: "+4.4% (Projected Q4)",
      mape: "3.6%",
      points: [48.5, 49.2, 50.0, 50.8, 51.4, 52.0, 52.7, 53.2, 53.8, 54.3],
      low: [46.5, 47.1, 48.0, 48.6, 49.2, 49.8, 50.3, 50.9, 51.4, 51.8],
      high: [50.5, 51.3, 52.0, 53.0, 53.6, 54.2, 55.1, 55.5, 56.2, 56.8],
    },
    R6: {
      name: "Region VI - Western Visayas",
      curr: "₱46.80 / kg",
      forecast: "₱49.20 / kg",
      trend: "+5.1% (Projected Q4)",
      mape: "3.8%",
      points: [42.8, 43.5, 44.2, 45.0, 45.9, 46.8, 47.5, 48.1, 48.6, 49.2],
      low: [40.8, 41.5, 42.2, 43.0, 43.8, 44.6, 45.2, 45.8, 46.2, 46.7],
      high: [44.8, 45.5, 46.2, 47.0, 48.0, 49.0, 49.8, 50.4, 51.0, 51.7],
    },
    R4A: {
      name: "Region IV-A - CALABARZON",
      curr: "₱50.20 / kg",
      forecast: "₱52.90 / kg",
      trend: "+5.3% (Projected Q4)",
      mape: "3.5%",
      points: [46.5, 47.2, 48.0, 48.8, 49.5, 50.2, 50.9, 51.6, 52.2, 52.9],
      low: [44.5, 45.1, 45.9, 46.6, 47.3, 48.0, 48.6, 49.2, 49.8, 50.4],
      high: [48.5, 49.3, 50.1, 51.0, 51.7, 52.4, 53.2, 54.0, 54.6, 55.4],
    },
  }

  const active = data[region]
  const months = [
    "M-5",
    "M-4",
    "M-3",
    "M-2",
    "M-1",
    "Current",
    "+1M",
    "+2M",
    "+3M",
    "+6M",
  ]

  // SVG Chart points calculation
  const svgWidth = 560
  const svgHeight = 180
  const minVal = 38
  const maxVal = 58
  const getY = (val: number) =>
    svgHeight - ((val - minVal) / (maxVal - minVal)) * svgHeight
  const getX = (idx: number) =>
    30 + idx * ((svgWidth - 60) / (months.length - 1))

  const histPath = active.points
    .slice(0, 6)
    .map((v, i) => `${getX(i)},${getY(v)}`)
    .join(" ")

  const forecastPath = active.points
    .slice(5)
    .map((v, i) => `${getX(i + 5)},${getY(v)}`)
    .join(" ")

  // Shaded 95% Confidence Band
  const bandTop = active.high
    .slice(5)
    .map((v, i) => `${getX(i + 5)},${getY(v)}`)
    .join(" ")
  const bandBottom = active.low
    .slice(5)
    .reverse()
    .map((v, i) => `${getX(9 - i)},${getY(v)}`)
    .join(" ")
  const bandPolygon = `${bandTop} ${bandBottom}`

  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <span>[POWER BI / PYTHON TELEMETRY] RICE OUTLOOK MODEL</span>
        <span>STATUS: LIVE SIMULATION</span>
      </div>
      <div className="showcase-body">
        <div className="telemetry-tabs">
          <button
            className={`telemetry-tab ${region === "R3" ? "active" : ""}`}
            onClick={() => setRegion("R3")}
          >
            [Region III - Central Luzon]
          </button>
          <button
            className={`telemetry-tab ${region === "NCR" ? "active" : ""}`}
            onClick={() => setRegion("NCR")}
          >
            [NCR - Metro Manila]
          </button>
          <button
            className={`telemetry-tab ${region === "R6" ? "active" : ""}`}
            onClick={() => setRegion("R6")}
          >
            [Region VI - W. Visayas]
          </button>
          <button
            className={`telemetry-tab ${region === "R4A" ? "active" : ""}`}
            onClick={() => setRegion("R4A")}
          >
            [Region IV-A - CALABARZON]
          </button>
        </div>

        <div className="telemetry-grid">
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "12px",
              }}
            >
              <strong>
                {active.name} &mdash; 6-Month Holt-Winters Projection
              </strong>
              <span style={{ color: "var(--ink-muted)" }}>
                95% Confidence Bounds (shaded)
              </span>
            </div>
            <div
              style={{
                border: "1px solid var(--ink-line)",
                background: "rgba(169, 194, 176, 0.08)",
                padding: "12px",
              }}
            >
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                style={{ width: "100%", height: "auto" }}
              >
                {/* Horizontal gridlines */}
                {[40, 45, 50, 55].map((level) => (
                  <g key={level}>
                    <line
                      x1="20"
                      y1={getY(level)}
                      x2={svgWidth - 20}
                      y2={getY(level)}
                      stroke="var(--ink-line)"
                      strokeDasharray="2,3"
                      strokeWidth="0.8"
                    />
                    <text
                      x="5"
                      y={getY(level) + 4}
                      fontSize="9"
                      fill="var(--ink-muted)"
                    >
                      ₱{level}
                    </text>
                  </g>
                ))}

                {/* 95% Confidence Interval Band */}
                <polygon points={bandPolygon} fill="rgba(31, 138, 76, 0.18)" />

                {/* Historical Line */}
                <polyline
                  points={histPath}
                  fill="none"
                  stroke="var(--ink-primary)"
                  strokeWidth="2.5"
                />

                {/* Forecast Line */}
                <polyline
                  points={forecastPath}
                  fill="none"
                  stroke="var(--accent-cursor)"
                  strokeWidth="2.5"
                  strokeDasharray="4,4"
                />

                {/* Data point dots */}
                {active.points.map((v, i) => (
                  <circle
                    key={i}
                    cx={getX(i)}
                    cy={getY(v)}
                    r={i >= 5 ? 3.5 : 3}
                    fill={
                      i >= 5 ? "var(--accent-cursor)" : "var(--ink-primary)"
                    }
                  />
                ))}
              </svg>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                  fontSize: "10px",
                  color: "var(--ink-muted)",
                }}
              >
                {months.map((m) => (
                  <span key={m}>{m}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="telemetry-kpis">
            <div className="telemetry-kpi-card">
              <span>CURRENT RETAIL BENCHMARK</span>
              <strong>{active.curr}</strong>
            </div>
            <div className="telemetry-kpi-card">
              <span>6-MONTH FORECAST ESTIMATE</span>
              <strong style={{ color: "var(--accent-cursor)" }}>
                {active.forecast}
              </strong>
              <small style={{ fontSize: "10px", color: "var(--ink-muted)" }}>
                {active.trend}
              </small>
            </div>
            <div className="telemetry-kpi-card">
              <span>BACKTEST ACCURACY (MAPE)</span>
              <strong>{active.mape}</strong>
              <small style={{ fontSize: "10px", color: "var(--ink-muted)" }}>
                Across 18 regional markets
              </small>
            </div>
            <div className="telemetry-kpi-card">
              <span>RAINFALL CORRELATION</span>
              <strong>r = -0.09</strong>
              <small style={{ fontSize: "10px", color: "var(--ink-muted)" }}>
                NASA POWER vs PhilRice Yield
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Interactive Visualizer 2: CLARO Mobile AI Food Scanner
// ---------------------------------------------------------------------------
function ClaroMobileShowcase() {
  const [lang, setLang] = useState<"tagalog" | "english">("tagalog")

  return (
    <div className="showcase-container">
      <div className="showcase-header">
        <span>[MOBILE SIMULATOR] CLARO: YOLOV8 + FLUTTER + GEMINI AI</span>
        <span>MODEL: 98.55% mAP@50</span>
      </div>
      <div className="showcase-body">
        <div className="phone-grid-interactive">
          {/* Phone Screen 1: Camera Vision */}
          <div className="phone-card">
            <div className="phone-top-notch">
              <span>09:41</span>
              <span>CAMERA / SCANNER</span>
              <span>100%</span>
            </div>
            <div className="phone-screen-content">
              <div style={{ fontSize: "11px", fontWeight: 600 }}>
                YOLOv8 Edge Detection
              </div>
              <div
                style={{
                  height: "240px",
                  border: "1px dashed var(--ink-line)",
                  background: "rgba(169, 194, 176, 0.15)",
                  position: "relative",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div className="yolo-box">
                  <span className="yolo-tag">
                    Ligo Sardines (Tomato) &bull; 99.2%
                  </span>
                  <div
                    style={{ fontSize: "10px", color: "var(--ink-primary)" }}
                  >
                    CLASS 14: CANNED FISH
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--ink-muted)" }}>
                    NET WT: 155g &bull; OCR VERIFIED
                  </div>
                </div>

                <div
                  className="yolo-box"
                  style={{
                    borderColor: "#b87000",
                    background: "rgba(184, 112, 0, 0.08)",
                  }}
                >
                  <span className="yolo-tag" style={{ background: "#b87000" }}>
                    Lucky Me! Kalamansi &bull; 98.4%
                  </span>
                  <div
                    style={{ fontSize: "10px", color: "var(--ink-primary)" }}
                  >
                    CLASS 03: INSTANT NOODLES
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--ink-muted)" }}>
                    HIGH SODIUM DETECTED
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "center",
                    fontSize: "10px",
                    color: "var(--ink-muted)",
                  }}
                >
                  [+] 57 Filipino CPG classes in TFLite
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "var(--ink-muted)" }}>
                &gt; Real-time bounding box tracking at 32 FPS on mobile edge.
              </div>
            </div>
          </div>

          {/* Phone Screen 2: Nutritional Breakdown */}
          <div className="phone-card">
            <div className="phone-top-notch">
              <span>09:41</span>
              <span>NUTRITION ADVISORY</span>
              <span>100%</span>
            </div>
            <div className="phone-screen-content">
              <div style={{ fontSize: "11px", fontWeight: 600 }}>
                Nutritional Assessment
              </div>
              <div
                style={{
                  padding: "12px",
                  border: "1px solid var(--ink-line)",
                  background: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                    }}
                  >
                    <strong>SODIUM INTAKE</strong>
                    <span style={{ color: "#d9381e", fontWeight: 700 }}>
                      1,480 mg (74% RDA)
                    </span>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      width: "100%",
                      background: "#eee",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "74%",
                        background: "#d9381e",
                      }}
                    />
                  </div>
                  <small style={{ fontSize: "9px", color: "#d9381e" }}>
                    ALERT: Exceeds single meal threshold
                  </small>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                    }}
                  >
                    <span>FAT / LIPIDS</span>
                    <span>14g (22% RDA)</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "#eee",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "22%",
                        background: "var(--ink-primary)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "11px",
                    }}
                  >
                    <span>PROTEIN CONTENT</span>
                    <span>18g (36% RDA)</span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      background: "#eee",
                      marginTop: "4px",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: "36%",
                        background: "var(--accent-cursor)",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    borderTop: "1px dashed #ccc",
                    paddingTop: "8px",
                    fontSize: "11px",
                  }}
                >
                  <strong>OVERALL SAFETY RATING:</strong>
                  <span
                    style={{
                      color: "#b87000",
                      fontWeight: 600,
                      marginLeft: "6px",
                    }}
                  >
                    MODERATE - HIGH SODIUM
                  </span>
                </div>
              </div>
              <div style={{ fontSize: "10px", color: "var(--ink-muted)" }}>
                &gt; Piloted with 50 supermarket shoppers in Manila with 84%
                independent task completion.
              </div>
            </div>
          </div>

          {/* Phone Screen 3: Bilingual Voice AI */}
          <div className="phone-card">
            <div className="phone-top-notch">
              <span>09:41</span>
              <span>GEMINI AI VOICE</span>
              <span>100%</span>
            </div>
            <div className="phone-screen-content">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontSize: "11px", fontWeight: 600 }}>
                  Bilingual Voice Advisory
                </span>
                <button
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    border: "1px solid var(--ink-line)",
                    background: "var(--bg-page)",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setLang(lang === "tagalog" ? "english" : "tagalog")
                  }
                >
                  [{lang === "tagalog" ? "TAGALOG" : "ENGLISH"}]
                </button>
              </div>

              <div
                style={{
                  padding: "12px",
                  border: "1px solid var(--ink-line)",
                  background: "rgba(169, 194, 176, 0.12)",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  minHeight: "160px",
                }}
              >
                <div
                  style={{
                    fontSize: "9px",
                    color: "var(--ink-muted)",
                    marginBottom: "6px",
                  }}
                >
                  VOICE OUTPUT TRANSCRIPT:
                </div>
                {lang === "tagalog" ? (
                  <p style={{ margin: 0 }}>
                    "Pansin: Ang pancit canton na ito ay naglalaman ng 1,480mg
                    ng sodium (74% ng inirerekomendang daily intake). Para sa
                    may altapresyon, iminumungkahing magbawas ng pampalasa o
                    kumain ng kalahating serving lamang."
                  </p>
                ) : (
                  <p style={{ margin: 0 }}>
                    "Health advisory: This instant noodle product contains
                    1,480mg of sodium (74% of daily recommended limit). If
                    managing hypertension, consider using half the seasoning
                    packet or draining excess broth."
                  </p>
                )}
              </div>

              <div
                style={{
                  padding: "8px",
                  border: "1px dashed var(--ink-line)",
                  fontSize: "10px",
                }}
              >
                <span>
                  &bull; Average Usability Score: <strong>4.68 / 5.0</strong>
                </span>
                <br />
                <span>
                  &bull; Voice latency: <strong>~340ms</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  return (
    <div className="showcase-container browser-showcase">
      <div className="browser-bar">
        <div className="browser-dots">
          <span className="browser-dot" />
          <span className="browser-dot" />
          <span className="browser-dot" />
        </div>
        <div className="browser-url">
          https://hnlconstruction.com.ph &mdash; Interactive Client Quotation
          System
        </div>
      </div>
      <div className="showcase-body">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
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
              Instant Construction Cost Estimator (Next.js + Sanity CMS)
            </div>
            <p
              style={{
                fontSize: "12px",
                color: "var(--ink-muted)",
                marginBottom: "16px",
              }}
            >
              Built for HNL Construction to automate quote inquiries, store bids
              in PostgreSQL, and send automated client emails via Resend.
            </p>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  PROJECT CLASSIFICATION:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className={`telemetry-tab ${
                      projectType === "residential" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("residential")}
                  >
                    [Residential Build]
                  </button>
                  <button
                    className={`telemetry-tab ${
                      projectType === "commercial" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("commercial")}
                  >
                    [Commercial Fit-out]
                  </button>
                  <button
                    className={`telemetry-tab ${
                      projectType === "warehouse" ? "active" : ""
                    }`}
                    onClick={() => setProjectType("warehouse")}
                  >
                    [Warehouse]
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  TOTAL FLOOR AREA: <strong>{area} SQM</strong>
                </label>
                <input
                  type="range"
                  min="40"
                  max="600"
                  step="10"
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--ink-primary)" }}
                />
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
              AUTOMATED BID BREAKDOWN:
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
              Data synced to Sanity Studio CMS for instant pricing updates
              without code changes.
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
        ["Type", "Course project"],
        ["Date", "September 2026"],
      ]}
      sections={[
        [
          "Overview",
          "Forecasts retail rice prices six months ahead and shows how price outlook relates to rainfall and yield across 18 Philippine administrative regions.",
        ],
        [
          "Data and Method",
          "Built a Python pipeline to clean and merge datasets from PSA (Philippine Statistics Authority), PhilRice, and NASA POWER into analysis-ready tables across 18 regions. Forecasted prices with a Holt-Winters seasonal exponential smoothing model with 95% prediction intervals.",
        ],
        [
          "Dashboard",
          "Interactive Power BI dashboard with a star-schema model, custom DAX measures, and drill-down regional telemetry visualizing retail prices vs. historical climate metrics.",
        ],
      ]}
      stats={[
        ["3.6%", "backtest MAPE across regions"],
        ["r = -0.09", "rainfall-yield correlation coefficient"],
        ["18", "regions analyzed and forecasted"],
      ]}
      tools={[
        "Python",
        "Pandas",
        "Power BI",
        "DAX",
        "Holt-Winters Forecasting",
        "NASA POWER API",
      ]}
      showcase={
        <ProjectMediaViewer
          title="Philippine Rice Market Outlook"
          simulator={<RiceDashboardShowcase />}
          imageSrc="/images/rice-dashboard.png"
          imageAlt="Power BI Retail Rice Market Forecast Dashboard"
        />
      }
      links={[
        {
          label: "GitHub Repository (Python & Data Pipeline)",
          href: PORTFOLIO_CONFIG.projects.rice.githubUrl,
          external: true,
        },
        {
          label: "Interactive Power BI Report",
          href: PORTFOLIO_CONFIG.projects.rice.liveReportUrl,
          external: true,
        },
      ]}
      next={["Next: 02 CLARO ->", "claro"]}
      navigate={navigate}
    />
  )
}

function Claro({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <CaseStudy
      title="CLARO: An AI-Powered Mobile Application for Health-Informed Decision-Making on Filipino Canned Foods and Instant Noodles"
      meta={[
        ["Role", "Project Manager & AI Integrator"],
        ["Type", "Capstone project"],
        ["Date", "October 2026"],
        ["Team", "3 Members"],
      ]}
      sections={[
        [
          "Overview",
          "Led a 3-person team to build a Flutter and Firebase mobile app plus a React admin dashboard, successfully piloted with 50 shoppers at a Manila grocery store.",
        ],
        [
          "Model & Edge Deployment",
          "Trained YOLOv8s on 12,454 annotated images across 57 Filipino consumer product classes, reaching 98.55% mAP@50. Quantized into TensorFlow Lite for real-time offline edge inference on mobile devices.",
        ],
        [
          "Features & Usability",
          "Includes automated OCR nutrition label extraction, high-sodium dietary advisories, and a bilingual (Tagalog/English) voice assistant powered by Gemini API.",
        ],
        [
          "Field Results",
          "Tested with 50 shoppers: achieved a 4.68/5 average satisfaction score and 84% of participants completed complex dietary evaluation tasks completely independently.",
        ],
      ]}
      stats={[
        ["98.55%", "mAP@50 detection accuracy"],
        ["4.68/5", "average field satisfaction score"],
        ["84%", "completed tasks independently"],
        ["57", "distinct product classes trained"],
      ]}
      tools={[
        "Flutter",
        "Firebase",
        "React",
        "YOLOv8",
        "TensorFlow Lite",
        "Gemini API",
        "Mobile OCR",
      ]}
      showcase={
        <ProjectMediaViewer
          title="CLARO AI Mobile App"
          simulator={<ClaroMobileShowcase />}
          imageSrc="/images/claro-app.png"
          imageAlt="CLARO Mobile Application Detection & Grocery Field Testing"
        />
      }
      links={[
        {
          label: "GitHub Repository (Flutter & YOLOv8 Weights)",
          href: PORTFOLIO_CONFIG.projects.claro.githubUrl,
          external: true,
        },
      ]}
      next={["Next: 03 HNL Construction ->", "hnl"]}
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
      links={[
        {
          label: "Live Client Website (HNL Construction)",
          href: PORTFOLIO_CONFIG.projects.hnl.liveSiteUrl,
          external: true,
        },
        {
          label: "GitHub Repository (Next.js & Sanity Studio)",
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
    "Applied in: HNL Construction Website, CLARO Admin Dashboard, and personal portfolio.",
  ],
]

function Skills() {
  return (
    <>
      <Section>
        <SectionLabel>Skills</SectionLabel>
      </Section>
      {skillGroups.map(([label, tags, note]) => (
        <Section key={label}>
          <SectionLabel>{label}</SectionLabel>
          <div className="indented tags">
            {tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
          <p className="indented muted">{note}</p>
        </Section>
      ))}
      <Divider type="C" />
      <p className="soft-skills">
        Project management / Team leadership / Cross-functional collaboration /
        Problem solving / Analytical thinking / Technical communication
      </p>
    </>
  )
}

function Achievements() {
  return (
    <>
      <Section>
        <SectionLabel>Achievements &amp; Honors</SectionLabel>
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
        <SectionLabel>Certifications &amp; Training</SectionLabel>
        <div className="indented block-list">
          <p>&bull; R for Data Science, Great Learning Academy</p>
          <p>
            &bull; TOPCIT 2025 Participant, Technological Institute of the
            Philippines - Manila, 2025
          </p>
          <p>&bull; Microsoft Power BI Data Analyst Training (In Progress)</p>
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
      <SectionLabel>Curriculum Vitae / Resume</SectionLabel>
      <div
        className="indented"
        style={{ display: "flex", gap: "12px", alignItems: "center" }}
      >
        <BracketButton onClick={handlePrint}>
          Download CV / Print (PDF)
        </BracketButton>
        <span style={{ fontSize: "12px", color: "var(--ink-muted)" }}>
          (Opens standard browser PDF print dialog)
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
            <span>Oct 2026</span>
          </div>
          <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#444" }}>
            &bull; Trained YOLOv8s computer vision model on 12,454 annotated
            images (57 Filipino CPG classes) hitting 98.55% mAP@50.
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
  const [sent, setSent] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "", message: "" })

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_CONFIG.profile.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
    // Prefill mailto fallback link if desired
    const mailtoUrl = `mailto:${PORTFOLIO_CONFIG.profile.email}?subject=Portfolio Inquiry from ${encodeURIComponent(
      formData.name,
    )}&body=${encodeURIComponent(`From: ${formData.name} (${formData.email})\n\nMessage:\n${formData.message}`)}`
    window.location.href = mailtoUrl
  }

  return (
    <>
      <Section>
        <SectionLabel>Contact</SectionLabel>
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
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                border: "1px solid var(--ink-line)",
                background: copied ? "var(--ink-primary)" : "transparent",
                color: copied ? "var(--invert-text)" : "var(--ink-muted)",
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
        <BracketButton type="submit">
          Send Message via Email Client
        </BracketButton>
        {sent && (
          <p className="success">
            &gt; Opening default email client with your prefilled message. Thank
            you!
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
        "The project required harmonizing 18 distinct regional datasets with disparate time granularities. Using Python and Pandas, we built automated ETL routines to clean outlier data points from weather anomalies and applied Holt-Winters exponential smoothing. The resulting 3.6% backtest MAPE allowed regional planners to observe seasonal peaks with 95% confidence bands.",
    },
    {
      title: "Training YOLOv8 on 12,454 Filipino CPG products",
      summary:
        "Overcoming class imbalance in local supermarket packaging and compiling for TensorFlow Lite edge inference.",
      content:
        "Standard object detection models have high accuracy on generic items (apples, cups) but degrade on varied Philippine supermarket packaging like canned corned beef and instant noodles. We manually labeled and augmented 12,454 images across 57 classes, tuning anchor box ratios and using FP16 quantization to achieve 98.55% mAP@50 at 32 FPS on mobile devices.",
    },
    {
      title: "Connecting GitHub Works & Deploying Your Portfolio",
      summary:
        "Step-by-step documentation on keeping your portfolio code and repositories synchronized on GitHub.",
      content:
        "To connect your personal GitHub repositories, update `src/config.ts` with your GitHub username and project URLs. You can initialize a git repository locally with `git init`, add your GitHub remote with `git remote add origin https://github.com/<username>/portfolio.git`, and deploy to Vercel, Netlify, or GitHub Pages with automated CI/CD builds on every git push.",
    },
  ]

  return (
    <Section>
      <SectionLabel>Technical Notes &amp; Engineering Logs</SectionLabel>
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
                alignItems: "center",
                width: "100%",
              }}
            >
              <span>0{index + 1}</span>
              <strong style={{ flex: 1, marginLeft: "16px" }}>
                {note.title}
              </strong>
              <span>{openNote === index ? "[ CLOSE - ]" : "[ READ + ]"}</span>
            </div>
            <p
              style={{
                margin: "4px 0 0 36px",
                fontSize: "12px",
                color: "var(--ink-muted)",
              }}
            >
              {note.summary}
            </p>
            {openNote === index && (
              <div
                style={{
                  margin: "8px 0 0 36px",
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
        <span data-label="Return Home">[ Return Home ]</span>
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
