import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { Navbar, Hero, About, Skills, CodingProfiles } from './components/TopSections'
import { Projects, Journey, Contact, Footer } from './components/Sections'
import { CommandPalette, SiteEffects } from './components/Effects'
import './styles/global.css'
import './styles/animations.css'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 350)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      className="back-to-top"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll back to top"
    >
      <ArrowUp size={18} />
    </button>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteEffects />
      <div className="site-background-orb" aria-hidden="true" />
      <div className="site-shell">
        <Navbar />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <About />
          <Skills />
          <CodingProfiles />
          <Projects />
          <Journey />
          <Contact />
        </main>
        <Footer />
        <BackToTop />
      </div>
      <CommandPalette />
    </>
  )
}
