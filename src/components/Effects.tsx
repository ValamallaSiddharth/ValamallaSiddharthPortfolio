import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { ArrowUpRight, Search, X } from 'lucide-react'

const paletteItems = [
  { label: 'Home', href: '#home', hint: 'Start here' },
  { label: 'About', href: '#about', hint: 'A little about me' },
  { label: 'Skills', href: '#skills', hint: 'What I bring' },
  { label: 'Coding profiles', href: '#profiles', hint: 'Where I build & practice' },
  { label: 'Selected work', href: '#work', hint: 'Projects' },
  { label: 'Journey', href: '#journey', hint: 'Education & milestones' },
  { label: 'Contact', href: '#contact', hint: 'Say hello' },
]

export function SiteEffects() {
  useEffect(() => {
    const root = document.documentElement
    const targets = document.querySelectorAll<HTMLElement>(
      '.hero-copy, .section-heading, .about-grid, .about-facts, .skills-layout, .skill-group, .skills-marquee, .profiles-heading, .coding-dashboard, .work-intro, .project-card, .work-footnote, .journey-grid, .contact-shell, .footer-inner'
    )
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion || !('IntersectionObserver' in window)) return

    root.classList.add('motion-ready')
    targets.forEach((target) => target.setAttribute('data-visible', 'false'))
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.setAttribute('data-visible', 'true')
          currentObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -7% 0px' }
    )
    targets.forEach((target) => observer.observe(target))
    return () => {
      observer.disconnect()
      root.classList.remove('motion-ready')
    }
  }, [])

  return null
}
export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const matches = paletteItems.filter((item) =>
    `${item.label} ${item.hint}`.toLowerCase().includes(query.trim().toLowerCase())
  )

  const rememberFocus = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement && !dialogRef.current?.contains(active)) {
      returnFocusRef.current = active
    }
  }

  const handleDialogKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      setOpen(false)
      return
    }
    if (event.key !== 'Tab') return

    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    if (!focusable?.length) {
      event.preventDefault()
      return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && (document.activeElement === first || !dialogRef.current?.contains(document.activeElement))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (!open) rememberFocus()
        setOpen((current) => !current)
      }
      if (event.key === 'Escape' && open) setOpen(false)
    }
    const onOpenPalette = () => {
      rememberFocus()
      setOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('portfolio:open-command', onOpenPalette)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('portfolio:open-command', onOpenPalette)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const background = document.querySelector<HTMLElement>('.site-shell')
    const wasInert = background?.inert ?? false
    document.body.style.overflow = 'hidden'
    if (background) background.inert = true
    inputRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      if (background) background.inert = wasInert
      const returnFocus = returnFocusRef.current
      if (returnFocus?.isConnected) requestAnimationFrame(() => returnFocus.focus())
      setQuery('')
    }
  }, [open])

  if (!open) return null
  return (
    <div className="palette-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
      <div ref={dialogRef} className="command-palette" role="dialog" aria-modal="true" aria-labelledby="command-palette-title" onKeyDown={handleDialogKeyDown}>
        <h2 id="command-palette-title" className="sr-only">Jump to a section</h2>
        <div className="palette-search">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && matches[0]) {
                window.location.hash = matches[0].href
                setOpen(false)
              }
            }}
            placeholder="Jump to a section…"
            aria-label="Search portfolio sections"
          />
          <button type="button" onClick={() => setOpen(false)} aria-label="Close command palette">
            <X size={17} />
          </button>
        </div>
        <p className="palette-label">NAVIGATION</p>
        <div className="palette-results">
          {matches.map((item) => (
            <a href={item.href} key={item.href} onClick={() => setOpen(false)}>
              <span><strong>{item.label}</strong><small>{item.hint}</small></span>
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          ))}
          {!matches.length && <p className="palette-empty">No matching sections</p>}
        </div>
        <div className="palette-foot"><span><kbd>ESC</kbd> to close</span><span><kbd>ENTER</kbd> to jump</span></div>
      </div>
    </div>
  )
}

