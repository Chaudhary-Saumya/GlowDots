import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { AnimatePresence, motion } from 'motion/react'
import { Navbar, type Page } from './components/Navbar'
import { Home } from './pages/Home'
import { Examples } from './pages/Examples'
import { Playground } from './pages/Playground'
import { Docs } from './pages/Docs'

export function App() {
  const [page, setPage] = useState<Page>('home')
  const [studioPreset, setStudioPreset] = useState<{ type: string; options?: Record<string, any> }>({
    type: 'sphere'
  })
  const lenisRef = useRef<Lenis | null>(null)

  // Lenis smooth scrolling across scrolling pages (home, docs, examples)
  useEffect(() => {
    if (page === 'playground') {
      lenisRef.current?.destroy()
      lenisRef.current = null
      return
    }
    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    })
    lenisRef.current = lenis

    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [page])

  const navigate = (next: Page) => {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }

  const openInStudio = (type: string, options: Record<string, any>) => {
    setStudioPreset({ type, options })
    navigate('playground')
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#08080a] text-zinc-100">
      <Navbar page={page} onNavigate={navigate} />
      <AnimatePresence mode="wait">
        <motion.main
          key={page}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          {page === 'home' && <Home onNavigate={navigate} />}
          {page === 'examples' && <Examples onOpenInStudio={openInStudio} onNavigate={navigate} />}
          {page === 'playground' && (
            <Playground
              key={`${studioPreset.type}-${JSON.stringify(studioPreset.options || {})}`}
              initialType={studioPreset.type}
              initialOptions={studioPreset.options}
            />
          )}
          {page === 'docs' && <Docs onNavigate={navigate} />}
        </motion.main>
      </AnimatePresence>
    </div>
  )
}

export default App
