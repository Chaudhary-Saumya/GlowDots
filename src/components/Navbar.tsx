import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Terminal } from 'lucide-react'
import { LogoMark } from './LogoMark'

export type Page = 'home' | 'docs' | 'examples' | 'playground'

interface NavbarProps {
  page: Page
  onNavigate: (page: Page) => void
}

export function Navbar({ page, onNavigate }: NavbarProps) {
  const isHome = page === 'home'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page])

  const navItem = (id: Page, label: string) => {
    const active = page === id
    return (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        className={`relative py-1 text-[11px] font-medium tracking-[0.14em] uppercase transition-colors cursor-pointer ${
          active ? 'text-white' : 'text-zinc-400 hover:text-white'
        }`}
      >
        {label}
        {active && (
          <motion.span
            layoutId="nav-active-underline"
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute inset-x-0 -bottom-0.5 h-[1.5px] bg-[#3ee98a]"
          />
        )}
      </button>
    )
  }

  const showBackdrop = !isHome || scrolled

  return (
    <header
      className={`${isHome ? 'fixed inset-x-0 top-0' : 'sticky top-0'} z-50 transition-colors duration-300 ${
        showBackdrop ? 'bg-[#08080a]/90 backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-10">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left cursor-pointer group shrink-0"
        >
          <LogoMark className="h-6 w-6 transition-transform duration-300 group-hover:rotate-45" />
          <span className="text-sm font-bold tracking-tight text-white">glowdots</span>
        </motion.button>

        <nav className="flex items-center gap-4 sm:gap-9">
          {navItem('docs', 'Docs')}
          {navItem('examples', 'Examples')}
          {navItem('playground', 'Playground')}
        </nav>

        <div className="hidden sm:flex items-center gap-3 shrink-0">
          <motion.a
            whileHover={{ y: -1 }}
            href="https://www.npmjs.com/package/glowdots"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 hover:text-white transition"
          >
            <Terminal className="h-3.5 w-3.5" />
            npm
          </motion.a>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate('playground')}
            className="border border-white/20 bg-transparent px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white hover:bg-white hover:text-black transition cursor-pointer"
          >
            Studio
          </motion.button>
        </div>
      </div>
    </header>
  )
}
