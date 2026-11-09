import { useState, type FormEvent } from 'react'
import { ArrowUpRight, ExternalLink, Heart, Copy, Check } from 'lucide-react'
import { achievements, education, projects } from '../data/portfolio'
import { profile } from '../data/profile'

const projectImageUrl = (image: string, width: number) =>
  `https://images.unsplash.com/${image}?auto=format&fit=crop&w=${width}&h=${Math.round(width * 0.75)}&q=78`

const projectStamps: Record<string, [string, string]> = {
  '01': ['GOOD', 'IDEAS'],
  '02': ['MADE WITH', 'CURIOSITY'],
  '03': ['IN PROGRESS', '✳'],
}

export function Projects() {
  return (
    <section className="section work-section" id="work">
      <div className="shell">
        <div className="section-heading">
          <span className="section-index">04 / SELECTED WORK</span>
          <span className="heading-rule" />
          <span className="section-aside">A FEW THINGS I’VE MADE</span>
        </div>

        <div className="work-intro">
          <h2>
            Ideas, meet <span className="serif">execution.</span>
          </h2>
          <p>
            A collection of experiments, side projects, and products made with
            care. Some are concepts — the best way to learn is to make.
          </p>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.number}>
              <a
                href={project.href}
                className={`project-visual ${project.color}`}
                target="_blank"
                rel="noreferrer"
                aria-label={`View ${project.title}`}
              >
                <img
                  className="project-image"
                  src={projectImageUrl(project.image, 1200)}
                  srcSet={[480, 800, 1200].map((width) => `${projectImageUrl(project.image, width)} ${width}w`).join(', ')}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  width="1200"
                  height="900"
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                />
                <span className="project-number">{project.number} / 03</span>
                <span className="project-open" aria-hidden="true">
                  <ArrowUpRight size={18} />
                </span>
                <span className="project-stamp" aria-hidden="true">
                  {projectStamps[project.number]?.[0]}
                  <br />
                  {projectStamps[project.number]?.[1]}
                </span>
              </a>

              <div className="project-details">
                <div>
                  <span className="project-type">{project.type}</span>
                  <h3>{project.title}</h3>
                </div>
                <a
                  className="project-link"
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${project.title} source on GitHub`}
                >
                  <span className="social-mark">gh</span>
                </a>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-stack">
                {project.stack.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="work-footnote">
          <span className="footnote-star" aria-hidden="true">✳</span>
          <span>More experiments are always in progress.</span>
          <a href={profile.socials.github} target="_blank" rel="noreferrer">
            <span>Find me on GitHub</span>
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  )
}

export function Journey() {
  return (
    <section className="section journey-section" id="journey">
      <div className="shell">
        <div className="section-heading">
          <span className="section-index">05 / THE JOURNEY SO FAR</span>
          <span className="heading-rule" />
        </div>

        <div className="journey-grid">
          <div>
            <h2>
              Still becoming
              <br />
              <span className="serif">who I’ll be.</span>
            </h2>
            <p className="section-blurb">
              A little context for the path that brought me here.
            </p>
          </div>

          <div className="journey-content">
            <div className="timeline">
              {education.map((item) => (
                <article className="timeline-item" key={item.degree}>
                  <span className="timeline-period">{item.period}</span>
                  <div className="timeline-card">
                    <h3>{item.degree}</h3>
                    <p className="timeline-school">{item.school}</p>
                    <p className="timeline-note">{item.note}</p>
                  </div>
                  <span className="timeline-dot" aria-hidden="true" />
                </article>
              ))}
            </div>

            <div className="achievement-row">
              {achievements.map((item) => (
                <div className="achievement" key={item.title}>
                  <span className="achievement-value">{item.value}</span>
                  <h3>{item.title}</h3>
                  <p>{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Contact() {
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // The mailto form remains available if clipboard access is blocked.
    }
  }

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const email = String(formData.get('email') ?? '').trim()
    const message = String(formData.get('message') ?? '').trim()
    const subject = encodeURIComponent(`Portfolio message from ${name}`)
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)
    // TODO: Update the email value in src/data/profile.ts to your real address.
    window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`
  }

  return (
    <section className="contact-section" id="contact">
      <div className="shell contact-shell">
        <div className="contact-copy">
          <div className="contact-top">
            <span className="section-index">A GOOD THING CAN START HERE</span>
            <span className="contact-spark" aria-hidden="true">✳</span>
          </div>

          <h2>
            Have a good
            <br />
            <span className="serif">one in mind?</span>
          </h2>

          <p>
            I’m always up for a thoughtful conversation, a new challenge, or a
            really good question.
          </p>
        </div>

        <form className="contact-form" onSubmit={handleContactSubmit}>
          <div className="form-field">
            <input
              id="contact-name"
              name="name"
              type="text"
              placeholder=" "
              autoComplete="name"
              required
            />
            <label htmlFor="contact-name">Name</label>
          </div>
          <div className="form-field">
            <input
              id="contact-email"
              name="email"
              type="email"
              placeholder=" "
              autoComplete="email"
              required
            />
            <label htmlFor="contact-email">Email</label>
          </div>
          <div className="form-field">
            <textarea
              id="contact-message"
              name="message"
              placeholder=" "
              rows={4}
              required
            />
            <label htmlFor="contact-message">Message</label>
          </div>
          <div className="contact-form-actions">
            <button className="button button-glow" type="submit">
              <span>Send message</span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="button button-ghost" onClick={handleCopyEmail}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              <span>{copied ? 'Copied to clipboard!' : 'Copy email'}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
export function Footer() {
  return (
    <footer className="footer">
      <div className="shell footer-inner">
        <a className="brand footer-brand" href="#home" aria-label="Back to top">
          s<span>.</span>
        </a>

        <span className="footer-credits">
          Designed & built with care{' '}
          <Heart size={12} className="footer-heart" aria-hidden="true" fill="currentColor" /> ·{' '}
          {new Date().getFullYear()}
        </span>

        <nav className="footer-nav" aria-label="Footer quick links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#work">Work</a>
          <a href="#journey">Journey</a>
          <a href="#contact">Contact</a>
        </nav>

        <div className="footer-links">
          <a href={profile.socials.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={profile.socials.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={`mailto:${profile.email}`}>
            Email <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  )
}
