import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowUpRight,
  Menu,
  X,
  ExternalLink,
  GitFork,
  Star,
  BookOpen,
  Moon,
  Sun,
  Command,
  Code2,
  Database,
  Wrench,
} from 'lucide-react'
import { profile } from '../data/profile'
import { codingProfiles, featuredRepoNames, type CodingProfileKey } from '../data/codingProfiles'
import { skills } from '../data/portfolio'
import { InteractiveAvatar } from './InteractiveAvatar'

type Theme = 'dark' | 'light'

const links = [
  ['About', '#about'],
  ['Work', '#work'],
  ['Journey', '#journey'],
  ['Contact', '#contact'],
]

const languageColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  'Jupyter Notebook': '#DA5B0B',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'C++': '#f34b7d',
  C: '#555555',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('')
  const menuToggleRef = useRef<HTMLButtonElement>(null)
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem('portfolio-theme-v3') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('portfolio-theme-v3', theme)
    } catch {
      // The selected theme still applies when storage is unavailable.
    }
  }, [theme])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    const sections = ['about', 'work', 'journey', 'contact']
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -50% 0px' }
    )

    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      menuToggleRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [open])

  const closeMobileMenu = () => {
    setOpen(false)
    if (window.matchMedia('(max-width: 900px)').matches) menuToggleRef.current?.focus()
  }

  return (
    <header className={`nav-wrap ${scrolled ? 'is-scrolled' : ''}`}>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#home" aria-label={`${profile.name} home`}>
          s<span>.</span>
        </a>

        <button
          ref={menuToggleRef}
          className="menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="primary-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div id="primary-navigation" className={`nav-links ${open ? 'open' : ''}`}>
          {links.map(([label, href]) => {
            const targetId = href.replace('#', '')
            const isActive = activeSection === targetId
            return (
              <a
                key={label}
                href={href}
                className={isActive ? 'is-active' : ''}
                aria-current={isActive ? 'location' : undefined}
                onClick={closeMobileMenu}
              >
                {label}
              </a>
            )
          })}
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <a
            className="command-trigger"
            href="#"
            onClick={(event) => {
              event.preventDefault()
              window.dispatchEvent(new CustomEvent('portfolio:open-command'))
            }}
            aria-label="Open command palette"
          >
            <Command size={14} />
            <kbd>K</kbd>
          </a>
          <a className="nav-cta" href="#contact" onClick={closeMobileMenu}>
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </div>
      </nav>
    </header>
  )
}

export function Hero() {
  useEffect(() => {
    const hero = document.getElementById('home')
    if (!hero) return
    const syncVisibility = () => {
      document.documentElement.toggleAttribute('data-page-hidden', document.hidden)
    }
    syncVisibility()
    document.addEventListener('visibilitychange', syncVisibility)
    return () => document.removeEventListener('visibilitychange', syncVisibility)
  }, [])

  return (
    <section className="hero" id="home">
      <div className="hero-ambient" aria-hidden="true">
        <div className="hero-grain" />
      </div>

      <div className="hero-content shell">
        <div className="hero-main">
          <div className="hero-copy">
            <div className="hero-status eyebrow">
              <span className="status-dot" aria-hidden="true" />
              <span>{profile.availability}</span>
            </div>

            <p className="hero-kicker">HELLO, I’M {profile.name.toUpperCase()}</p>
            <div className="hero-role-tag">{profile.role}</div>

            <h1>
              Developer<span className="hero-period">.</span>
              <br />
              <span className="hero-highlight">Daydreamer.</span>
            </h1>

            <div className="hero-location" aria-label={`Based in ${profile.location}`}>
              <span className="location-pulse" aria-hidden="true" />
              <span>{profile.location}</span>
            </div>

            <p className="hero-intro">{profile.intro}</p>

            <div className="hero-actions">
              <a className="button button-dark" href="#work">
                <span>View Work</span>
                <ArrowDown size={16} />
              </a>
              <a className="button button-ghost" href={`mailto:${profile.email}`}>
                <span>Contact Me</span>
                <ArrowUpRight size={16} />
              </a>
            </div>

            <nav className="hero-socials" aria-label="Social profiles">
              {Object.entries(profile.socials).map(([platform, url]) => (
                <a key={platform} href={url} target="_blank" rel="noopener noreferrer">
                  <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                  <ArrowUpRight size={14} aria-hidden="true" />
                </a>
              ))}
            </nav>
          </div>

          <div className="hero-avatar-pane">
            <InteractiveAvatar />
          </div>
        </div>

        <div className="hero-bottom" aria-hidden="true">
          <span>SCROLL TO EXPLORE</span>
          <span className="hero-bottom-line" />
          <span>01 — 05</span>
        </div>
      </div>
    </section>
  )
}

export function About() {
  return (
    <section className="section about-section" id="about">
      <div className="shell">
        <div className="section-heading">
          <span className="section-index">01 / ABOUT</span>
          <span className="heading-rule" />
        </div>

        <div className="about-grid">
          <h2>
            Good work starts
            <br />
            with <span className="serif">good questions.</span>
          </h2>
          <div className="about-text">
            <p>
              I’m a {profile.role.toLowerCase()} who enjoys working across the
              stack and making the complex feel simple. I bring curiosity, care,
              and a healthy respect for the tiny details.
            </p>
            <p>
              When I’m away from the keyboard, you’ll probably find me learning
              something new, collecting ideas, or looking for a good cup of chai.
            </p>
            <a className="text-link" href={profile.resumeUrl}>
              <span>A little more about me</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="about-facts">
          {[
            ['01', 'Thoughtful', 'by default'],
            ['02', 'Always learning', 'something new'],
            ['03', 'Details matter.', 'People matter more.'],
          ].map(([num, l1, l2]) => (
            <div key={num}>
              <span>{num}</span>
              <p>{l1}<br />{l2}</p>
            </div>
          ))}
          <div className="about-doodle" aria-hidden="true">
            ✳
          </div>
        </div>
      </div>
    </section>
  )
}

const techBadges = [
  { name: 'React', cat: 'Frontend', color: '#21F1A8' },
  { name: 'TypeScript', cat: 'Language', color: '#42f4b7' },
  { name: 'Node.js', cat: 'Backend', color: '#21F1A8' },
  { name: 'REST APIs', cat: 'Architecture', color: '#16b87e' },
  { name: 'SQL & Data', cat: 'Database', color: '#21F1A8' },
  { name: 'JavaScript', cat: 'Language', color: '#42f4b7' },
  { name: 'Responsive UI', cat: 'Frontend', color: '#21F1A8' },
  { name: 'Authentication', cat: 'Security', color: '#16b87e' },
  { name: 'Data Modeling', cat: 'Backend', color: '#42f4b7' },
  { name: 'Git & GitHub', cat: 'Workflow', color: '#21F1A8' },
  { name: 'Figma', cat: 'Design', color: '#16b87e' },
  { name: 'Testing', cat: 'Quality', color: '#42f4b7' },
  { name: 'Accessibility', cat: 'A11y', color: '#21F1A8' },
  { name: 'Agile Teamwork', cat: 'Craft', color: '#42f4b7' },
]

export function Skills() {
  const groupIcons = [<Code2 size={15} />, <Database size={15} />, <Wrench size={15} />]

  return (
    <section className="section skills-section" id="skills">
      <div className="shell skills-layout">
        <div>
          <span className="section-index">02 / SKILLS & TOOLKIT</span>
          <h2>
            A toolkit for
            <br />
            <span className="serif">making things.</span>
          </h2>
          <p className="section-blurb">The tools change. The curiosity stays.</p>
        </div>

        <div className="skill-groups">
          {skills.map((group, index) => (
            <div className="skill-group" key={group.group}>
              <h3>
                {groupIcons[index]}
                {group.group}
              </h3>
              <div className="skill-tags">
                {group.items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-marquee" aria-label="Technology skills marquee" tabIndex={0}>
        <div className="skills-marquee-track" aria-hidden="true">
          {[...techBadges, ...techBadges].map((tech, index) => (
            <div className="tech-badge-card" key={`${tech.name}-${index}`}>
              <span
                className="tech-badge-dot"
                style={{ backgroundColor: tech.color, boxShadow: `0 0 10px ${tech.color}` }}
              />
              <span className="tech-badge-name">{tech.name}</span>
              <span className="tech-badge-cat">{tech.cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const platformIcons: Record<CodingProfileKey, string> = {
  github: 'https://cdn.simpleicons.org/github/f5f7ff',
  leetcode: 'https://cdn.simpleicons.org/leetcode/f5f7ff',
  codechef: 'https://cdn.simpleicons.org/codechef/f5f7ff',
  hackerrank: 'https://cdn.simpleicons.org/hackerrank/f5f7ff',
  linkedin: 'https://cdn.simpleicons.org/linkedin/f5f7ff',
}

type GithubRepo = {
  id: number
  name: string
  html_url: string
  description: string | null
  stargazers_count: number
  forks_count: number
  language: string | null
}

const fallbackRepos: GithubRepo[] = [
  { id: 1, name: 'PS-4', html_url: `https://github.com/${codingProfiles.github.username}/PS-4`, description: 'Interactive JavaScript web project', stargazers_count: 0, forks_count: 0, language: 'JavaScript' },
  { id: 2, name: 'OpenCV', html_url: `https://github.com/${codingProfiles.github.username}/OpenCV`, description: 'Computer vision algorithms & image processing', stargazers_count: 0, forks_count: 0, language: 'Jupyter Notebook' },
  { id: 3, name: 'AutoFaceLock', html_url: `https://github.com/${codingProfiles.github.username}/AutoFaceLock`, description: 'Real-time facial recognition security lock system', stargazers_count: 0, forks_count: 0, language: 'Python' },
  { id: 4, name: 'Body-measurement', html_url: `https://github.com/${codingProfiles.github.username}/Body-measurement`, description: 'Automated computer vision body measurement system', stargazers_count: 0, forks_count: 0, language: 'Python' },
]

export function CodingProfiles() {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [repoState, setRepoState] = useState<'loading' | 'ready' | 'empty' | 'unavailable'>('loading')
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    let started = false
    const loadRepositories = () => {
      if (started) return
      started = true
      fetch(
        `https://api.github.com/users/${codingProfiles.github.username}/repos?per_page=30&type=owner`,
        {
          headers: { Accept: 'application/vnd.github+json' },
          signal: controller.signal,
        }
      )
        .then((response) => {
          if (!response.ok) throw new Error('GitHub API unavailable')
          return response.json() as Promise<GithubRepo[]>
        })
        .then((data) => {
          const repoMap = new Map(data.map((r) => [r.name.toLowerCase(), r]))
          const prioritized = featuredRepoNames
            .map((name) => repoMap.get(name.toLowerCase()))
            .filter((r): r is GithubRepo => Boolean(r && r.html_url))
          const remaining = data.filter((r) => r.name && r.html_url && !prioritized.some((p) => p.id === r.id))
          const visible = [...prioritized, ...remaining].slice(0, 4)
          setRepos(visible.length ? visible : fallbackRepos)
          setRepoState('ready')
        })
        .catch((error: unknown) => {
          if (error instanceof Error && error.name === 'AbortError') return
          setRepos(fallbackRepos)
          setRepoState('ready')
        })
    }

    const section = sectionRef.current
    if (!section || !('IntersectionObserver' in window)) {
      loadRepositories()
      return () => controller.abort()
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect()
          loadRepositories()
        }
      },
      { rootMargin: '320px 0px' }
    )
    observer.observe(section)

    return () => {
      observer.disconnect()
      controller.abort()
    }
  }, [])

  return (
    <section ref={sectionRef} className="profiles-strip" id="profiles">
      <div className="shell">
        <div className="profiles-heading">
          <div>
            <span className="section-index">03 / WHERE I BUILD & PRACTICE</span>
            <h2>
              Curiosity, in <span className="serif">the open.</span>
            </h2>
          </div>
          <p>Find my work, follow my progress, or say hello on the platforms I use.</p>
        </div>

        <div className="coding-dashboard">
          <div className="profile-links">
            {(
              Object.entries(codingProfiles) as [
                CodingProfileKey,
                (typeof codingProfiles)[CodingProfileKey],
              ][]
            ).map(([key, p]) => (
              <a
                className={`profile-card profile-${key}`}
                href={p.url}
                key={key}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="profile-icon"
                  data-fallback={p.name === 'LinkedIn' ? 'in' : p.name.slice(0, 2).toUpperCase()}
                >
                  <img
                    src={platformIcons[key]}
                    alt=""
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true
                      event.currentTarget.parentElement?.setAttribute(
                        'data-icon-fallback',
                        'true'
                      )
                    }}
                  />
                </span>
                <span className="profile-card-copy">
                  <span className="profile-name">
                    {p.name}
                    <ArrowUpRight size={15} />
                  </span>
                  <span className="profile-handle">@{p.username}</span>
                  <span className="profile-detail">{p.description}</span>
                </span>
                <ExternalLink className="profile-external" size={15} />
              </a>
            ))}
          </div>

          <div className="github-panel">
            <div className="github-panel-heading">
              <div className="github-title">
                <span className="github-icon">
                  <img src={platformIcons.github} alt="" />
                </span>
                <div>
                  <span className="github-label">LATEST PUBLIC REPOSITORIES</span>
                  <span className="github-subtitle">From GitHub’s public API</span>
                </div>
              </div>
              <a
                className="github-all-link"
                href={codingProfiles.github.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>All repositories</span>
                <ArrowUpRight size={14} />
              </a>
            </div>

            {repoState !== 'ready' && (
              <p className="repo-message">
                {repoState === 'loading' && <span className="repo-pulse" aria-hidden="true" />}
                <span>
                  {repoState === 'loading'
                    ? 'Checking public repositories…'
                    : repoState === 'empty'
                    ? 'No public repositories are available to show yet.'
                    : 'Repository details are unavailable right now. Visit GitHub to explore the profile.'}
                </span>
              </p>
            )}

            {repoState === 'ready' && (
              <div className="repo-list">
                {repos.map((repo) => (
                  <a
                    className="repo-item"
                    href={repo.html_url}
                    key={repo.id}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="repo-item-main">
                      <span className="repo-name">
                        {repo.name}
                        <ArrowUpRight size={13} />
                      </span>
                      <span className="repo-description">
                        {repo.description || 'Public repository'}
                      </span>
                    </span>
                    <span className="repo-stats">
                      {repo.language && (
                        <span className="repo-lang">
                          <span
                            className="repo-lang-dot"
                            style={{
                              backgroundColor: languageColors[repo.language] || '#8d9484',
                            }}
                            aria-hidden="true"
                          />
                          {repo.language}
                        </span>
                      )}
                      <span>
                        <Star size={13} />
                        {repo.stargazers_count}
                      </span>
                      <span>
                        <GitFork size={13} />
                        {repo.forks_count}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            )}

            <div className="github-panel-foot">
              <BookOpen size={14} />
              <span>Profile stats stay off unless reliable platform data is available.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
