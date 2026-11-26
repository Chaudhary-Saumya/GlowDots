import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Copy, Heart, Play, Search, Sliders, Sparkles } from 'lucide-react'
import { PALETTES } from 'glowdots'
import { GlowCanvas } from '../components/GlowCanvas'
import { ShapeSnapshot } from '../components/ShapeSnapshot'
import type { Page } from '../components/Navbar'

type Category =
  | 'Core Effects'
  | 'Cosmic'
  | 'Attractors'
  | 'Geometry'
  | 'Bio & Quantum'
  | 'Kinetic'

interface ShapeCard {
  id: string
  title: string
  category: Category
  palette: string
  desc: string
  options: Record<string, any>
}

const ALL_EXAMPLES: ShapeCard[] = [
  // Core Effects (13)
  { id: 'sphere', title: 'Sphere', category: 'Core Effects', palette: 'ember', desc: 'Rim-lit particle sphere with equatorial turbulence.', options: { palette: 'ember', bloom: 0.45, clickBurst: true } },
  { id: 'galaxy', title: 'Galaxy', category: 'Core Effects', palette: 'aurora', desc: 'Multi-arm spiral galaxy with luminous core bulge.', options: { palette: 'aurora', bloom: 0.45, orbit: true } },
  { id: 'ring', title: 'Ring', category: 'Core Effects', palette: 'ocean', desc: 'Concentric harmonic rings with radial ripple.', options: { palette: 'ocean', bloom: 0.4 } },
  { id: 'wave', title: 'Wave', category: 'Core Effects', palette: 'ocean', desc: 'Fluid undulating particle wave field.', options: { palette: 'ocean', bloom: 0.35 } },
  { id: 'torusKnot', title: 'Torus Knot', category: 'Core Effects', palette: 'sunset', desc: 'Twisting 3D (p,q) torus knot with rim glow.', options: { palette: 'sunset', bloom: 0.45, holdCharge: true, orbit: true } },
  { id: 'aurora', title: 'Aurora', category: 'Core Effects', palette: 'aurora', desc: 'Flowing northern-lights ribbons.', options: { palette: 'aurora', bloom: 0.5 } },
  { id: 'vortex', title: 'Vortex', category: 'Core Effects', palette: 'neon', desc: 'Camera-through-tunnel spiral steered by cursor.', options: { palette: 'neon', bloom: 0.4 } },
  { id: 'terrain', title: 'Terrain', category: 'Core Effects', palette: 'ocean', desc: 'Multi-octave topographic ridges and valleys.', options: { palette: 'ocean', bloom: 0.3 } },
  { id: 'supershape', title: 'Supershape', category: 'Core Effects', palette: 'sunset', desc: 'Organic 3D superformula morphing geometry.', options: { palette: 'sunset', bloom: 0.45, orbit: true } },
  { id: 'smoke', title: 'Smoke', category: 'Core Effects', palette: 'mono', desc: 'Curl-noise ink-in-water particle swirl.', options: { palette: 'mono', bloom: 0.3 } },
  { id: 'text', title: 'Text Cloud', category: 'Core Effects', palette: 'ember', desc: 'Rasterize any typography into interactive particles.', options: { palette: 'ember', text: 'GLOW', bloom: 0.35, clickBurst: true } },
  { id: 'logo', title: 'Logo / SVG', category: 'Core Effects', palette: 'aurora', desc: 'Turn any PNG or SVG into RGB particles.', options: { preserveColors: true, bloom: 0.35, clickBurst: true } },
  { id: 'morph', title: 'Morph', category: 'Core Effects', palette: 'ember', desc: 'Scroll-linked sphere-to-disc transition.', options: { palette: 'ember', morph: 0.4, bloom: 0.4 } },

  // Strange Attractors (6)
  { id: 'lorenz', title: 'Lorenz Attractor', category: 'Attractors', palette: 'ember', desc: 'Iconic double-scroll butterfly chaos ribbon.', options: { palette: 'ember', bloom: 0.45, orbit: true } },
  { id: 'aizawa', title: 'Aizawa Attractor', category: 'Attractors', palette: 'aurora', desc: 'Luminous 3D sphere-torus chaotic spine.', options: { palette: 'aurora', bloom: 0.45, orbit: true } },
  { id: 'halvorsen', title: 'Halvorsen Knot', category: 'Attractors', palette: 'sunset', desc: 'Symmetrical 3-wing organic strange attractor.', options: { palette: 'sunset', bloom: 0.45 } },
  { id: 'thomas', title: 'Thomas Lattice', category: 'Attractors', palette: 'ocean', desc: 'Cyclically symmetric flowing 3D loops.', options: { palette: 'ocean', bloom: 0.4 } },
  { id: 'rossler', title: 'Rössler Ribbon', category: 'Attractors', palette: 'neon', desc: 'Spiraling folded chaos ribbon.', options: { palette: 'neon', bloom: 0.4 } },
  { id: 'dadras', title: 'Dadras Multi-Scroll', category: 'Attractors', palette: 'aurora', desc: 'Double-wing tangled silk attractor.', options: { palette: 'aurora', bloom: 0.45 } },

  // Cosmic & Space (6)
  { id: 'nebula', title: 'Cosmic Nebula', category: 'Cosmic', palette: 'sunset', desc: 'Multi-cloud filamentary gas and star core.', options: { palette: 'sunset', bloom: 0.55 } },
  { id: 'blackHole', title: 'Black Hole', category: 'Cosmic', palette: 'ember', desc: 'Accretion disk with gravitational lensing halo.', options: { palette: 'ember', bloom: 0.55, orbit: true, orbitZoom: true } },
  { id: 'quasar', title: 'Quasar Jets', category: 'Cosmic', palette: 'ocean', desc: 'Accretion ring with twin relativistic polar jets.', options: { palette: 'ocean', bloom: 0.5 } },
  { id: 'saturn', title: 'Saturn Rings', category: 'Cosmic', palette: 'ember', desc: 'Planetary core with Cassini-gap rings.', options: { palette: 'ember', bloom: 0.4, orbit: true } },
  { id: 'pulsar', title: 'Magnetic Pulsar', category: 'Cosmic', palette: 'neon', desc: 'Dipole magnetic field lines & polar beams.', options: { palette: 'neon', bloom: 0.5 } },
  { id: 'constellation', title: 'Constellation', category: 'Cosmic', palette: 'mono', desc: 'Clustered star nodes with filament bridges.', options: { palette: 'mono', bloom: 0.35 } },

  // Sacred Geometry (6)
  { id: 'mobius', title: 'Möbius Strip', category: 'Geometry', palette: 'aurora', desc: 'Twisting single-sided infinite ribbon.', options: { palette: 'aurora', bloom: 0.4, orbit: true } },
  { id: 'klein', title: 'Klein Bottle', category: 'Geometry', palette: 'ocean', desc: '4D-projected figure-8 non-orientable surface.', options: { palette: 'ocean', bloom: 0.45 } },
  { id: 'lissajous', title: '3D Lissajous', category: 'Geometry', palette: 'neon', desc: 'Harmonic frequency knot in 3D space.', options: { palette: 'neon', bloom: 0.45 } },
  { id: 'hyperboloid', title: 'Hyperboloid', category: 'Geometry', palette: 'mono', desc: 'Architectural ruled-surface hourglass tower.', options: { palette: 'mono', bloom: 0.35 } },
  { id: 'fibonacciTorus', title: 'Fibonacci Torus', category: 'Geometry', palette: 'sunset', desc: 'Golden-angle spiral woven onto a torus.', options: { palette: 'sunset', bloom: 0.45 } },
  { id: 'icosahedron', title: 'Geodesic Crystal', category: 'Geometry', palette: 'ocean', desc: 'Faceted 20-face crystal edge lattice.', options: { palette: 'ocean', bloom: 0.45 } },

  // Bio & Quantum (6)
  { id: 'dna', title: 'DNA Double Helix', category: 'Bio & Quantum', palette: 'aurora', desc: 'Twin twisted backbones with base-pair rungs.', options: { palette: 'aurora', bloom: 0.45, orbit: true } },
  { id: 'neuron', title: 'Neural Synapse', category: 'Bio & Quantum', palette: 'neon', desc: 'Soma core with branching dendritic filaments.', options: { palette: 'neon', bloom: 0.45 } },
  { id: 'quantumOrbital', title: 'Quantum Orbital', category: 'Bio & Quantum', palette: 'ocean', desc: '3D hydrogen d-orbital probability cloud.', options: { palette: 'ocean', bloom: 0.45 } },
  { id: 'jellyfish', title: 'Medusa Jellyfish', category: 'Bio & Quantum', palette: 'aurora', desc: 'Bioluminescent pulsing bell and tentacles.', options: { palette: 'aurora', bloom: 0.5, depthOfField: 0.6 } },
  { id: 'coral', title: 'Brain Coral', category: 'Bio & Quantum', palette: 'sunset', desc: 'Reaction-diffusion organic ridges on a sphere.', options: { palette: 'sunset', bloom: 0.4 } },
  { id: 'wing', title: 'Phoenix Wings', category: 'Bio & Quantum', palette: 'ember', desc: 'Symmetrical feathered particle arcs.', options: { palette: 'ember', bloom: 0.45 } },

  // Kinetic & Editorial (6)
  { id: 'prism', title: 'Refracting Prism', category: 'Kinetic', palette: 'neon', desc: 'Triangular crystal with dispersed spectrum beam.', options: { palette: 'neon', bloom: 0.5 } },
  { id: 'hourglass', title: 'Hourglass', category: 'Kinetic', palette: 'ember', desc: 'Dual-cone particle flow.', options: { palette: 'ember', bloom: 0.4 } },
  { id: 'fountain', title: 'Particle Fountain', category: 'Kinetic', palette: 'ocean', desc: 'Parabolic rising and cascading arcs.', options: { palette: 'ocean', bloom: 0.4 } },
  { id: 'fireflies', title: 'Firefly Swarm', category: 'Kinetic', palette: 'ember', desc: 'Soft bokeh meadow swarm with gentle drift.', options: { palette: 'ember', bloom: 0.6 } },
  { id: 'crown', title: 'Solar Crown', category: 'Kinetic', palette: 'ember', desc: 'Radiating solar corona magnetic peaks.', options: { palette: 'ember', bloom: 0.5 } },
  { id: 'rose', title: 'Mathematical Rose', category: 'Kinetic', palette: 'sunset', desc: 'Layered phyllotaxis petal bloom.', options: { palette: 'sunset', bloom: 0.45 } }
]

const CATEGORIES: Category[] = [
  'Core Effects',
  'Cosmic',
  'Attractors',
  'Geometry',
  'Bio & Quantum',
  'Kinetic'
]

interface ExamplesProps {
  onOpenInStudio: (type: string, options: Record<string, any>) => void
  onNavigate?: (page: Page) => void
}

export function Examples({ onOpenInStudio, onNavigate }: ExamplesProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category>('Core Effects')
  const [onlyFavs, setOnlyFavs] = useState(false)
  const [pageIdx, setPageIdx] = useState(1)
  const PAGE_SIZE = 9
  const [favs, setFavs] = useState<Set<string>>(() => new Set(['sphere', 'blackHole', 'logo']))
  const [activeLiveId, setActiveLiveId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sidebarShapeIdx, setSidebarShapeIdx] = useState(0)
  const SIDEBAR_SHAPES = ['torusKnot', 'dna', 'saturn', 'nebula'] as const

  const toggleFav = (id: string) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const counts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const ex of ALL_EXAMPLES) {
      map[ex.category] = (map[ex.category] || 0) + 1
    }
    return map
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ALL_EXAMPLES.filter((ex) => {
      if (!q && !onlyFavs && ex.category !== category) return false
      if (onlyFavs && !favs.has(ex.id)) return false
      if (!q) return true
      return (
        ex.title.toLowerCase().includes(q) ||
        ex.id.toLowerCase().includes(q) ||
        ex.desc.toLowerCase().includes(q) ||
        ex.category.toLowerCase().includes(q)
      )
    })
  }, [query, category, onlyFavs, favs])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(pageIdx, totalPages)
  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  )

  const selectCategory = (cat: Category) => {
    setCategory(cat)
    setQuery('')
    setOnlyFavs(false)
    setPageIdx(1)
  }

  const copyCode = async (ex: ShapeCard) => {
    const isCore = ex.category === 'Core Effects'
    const pkg = isCore ? 'glowdots' : 'glowdots/shapes'
    const code = `import { ${ex.id} } from '${pkg}'\n\n${ex.id}('#hero', ${JSON.stringify(ex.options, null, 2)})`
    await navigator.clipboard.writeText(code)
    setCopiedId(ex.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100">
      {/* Production Dotted Gradient Hero Banner */}
      <div className="relative overflow-hidden border-b border-white/15 bg-gradient-to-r from-[#1e3a8a] via-[#2563eb] to-[#0891b2]">
        <div
          className="pointer-events-none absolute inset-0 opacity-45"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.85) 1.2px, transparent 1.2px)',
            backgroundSize: '18px 18px'
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '72px 72px'
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-10 sm:px-10">
          <div className="rounded-2xl border border-white/20 bg-[#08080a]/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-cyan-400">
              <span>EXAMPLE LIBRARY</span>
              <span className="text-zinc-400">{ALL_EXAMPLES.length} GPU PATTERNS</span>
            </div>
            <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Examples
              </h1>
              <p className="max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">
                Every shape from <code className="text-cyan-300">glowdots</code> and <code className="text-cyan-300">glowdots/shapes</code> rendered in real 3D. Hover any card to interact live or open in Studio.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[230px_1fr]">
        {/* Left Filter Sidebar */}
        <aside className="space-y-6 text-xs">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPageIdx(1)
              }}
              placeholder="FILTER // name, category"
              className="w-full rounded-lg border border-white/15 bg-[#0d0d10] py-2 pl-9 pr-3 font-mono text-[11px] text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-cyan-400/50 transition"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 border-b border-white/10 pb-4 text-[11px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white">
            <input
              type="checkbox"
              checked={onlyFavs}
              onChange={(e) => {
                setOnlyFavs(e.target.checked)
                setPageIdx(1)
              }}
              className="accent-cyan-400"
            />
            <span>Favourites ({favs.size})</span>
          </label>

          <div>
            <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500">
              Categories
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const active = !query && !onlyFavs && category === cat
                return (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`relative flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-xs transition cursor-pointer ${
                      active ? 'font-semibold text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="example-cat-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded-lg bg-[#2563eb]"
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                    <span className="relative z-10 font-mono text-[10px] opacity-80">{counts[cat] || 0}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Live Interactive Shape Showcase in Sidebar */}
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c10]">
            <div className="relative h-40 w-full border-b border-white/10 bg-[#050507]">
              <GlowCanvas
                type={SIDEBAR_SHAPES[sidebarShapeIdx]}
                className="h-full w-full"
                options={{
                  palette: 'aurora',
                  count: 6500,
                  bloom: 0.45,
                  orbit: true,
                  clickBurst: true
                }}
              />
              <button
                onClick={() => setSidebarShapeIdx((i) => (i + 1) % SIDEBAR_SHAPES.length)}
                className="absolute right-2.5 top-2.5 rounded-full border border-white/15 bg-black/70 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-cyan-300 backdrop-blur-md hover:border-cyan-400/50 transition cursor-pointer"
              >
                Next ↻
              </button>
              <span className="pointer-events-none absolute bottom-2 left-2.5 font-mono text-[10px] text-zinc-400">
                {SIDEBAR_SHAPES[sidebarShapeIdx]}
              </span>
            </div>
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>43 Shapes Studio</span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-zinc-400">
                Tune bloom, depth of field, and export framework code.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onNavigate?.('playground')}
                className="mt-3 flex w-full items-center justify-between rounded-lg bg-cyan-400 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-black hover:bg-cyan-300 transition cursor-pointer"
              >
                <span>Open Studio</span>
                <ArrowRight className="h-3 w-3" />
              </motion.button>
            </div>
          </div>
        </aside>

        {/* Main Gallery */}
        <div className="min-w-0 space-y-10">
          {/* Spotlight Card */}
          <section>
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-white">Spotlight</h2>
            <div className="grid overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d10] md:grid-cols-[1.15fr_1fr]">
              <div className="relative min-h-[280px] border-b border-white/10 bg-[#050507] md:border-b-0 md:border-r">
                <GlowCanvas
                  type="blackHole"
                  className="h-full w-full"
                  options={{
                    palette: 'ember',
                    count: 16000,
                    bloom: 0.55,
                    orbit: true,
                    orbitZoom: true,
                    clickBurst: true
                  }}
                />
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
                  drag to orbit · click shockwave
                </span>
              </div>

              <div className="flex flex-col justify-between">
                <div className="bg-[#2563eb] px-5 py-2 text-[10px] font-mono font-semibold uppercase tracking-[0.14em] text-white">
                  ★ FEATURED · SPOTLIGHT
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white">
                      Black Hole &amp; Accretion Orbit
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">
                      Gravitational lensing photon ring with 360° spring-inertia orbit, wheel zoom, and multi-pass Gaussian bloom from <code className="text-cyan-300">glowdots/shapes</code>.
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                      REACT · JS · ELEMENT
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFav('blackHole')}
                        className="rounded-lg border border-white/10 p-2 text-zinc-400 hover:text-rose-400 transition cursor-pointer"
                        title="Favourite"
                      >
                        <Heart className={`h-3.5 w-3.5 ${favs.has('blackHole') ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() =>
                          onOpenInStudio('blackHole', {
                            palette: 'ember',
                            bloom: 0.55,
                            orbit: true,
                            orbitZoom: true,
                            clickBurst: true
                          })
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[#2563eb] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white hover:bg-blue-500 transition cursor-pointer"
                      >
                        <span>Open</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Paginated Category Gallery (9 per page) */}
          <section>
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2.5">
              <h2 className="text-lg font-semibold tracking-tight text-white">
                {onlyFavs ? 'Favourites' : query ? `Search: "${query}"` : category}
              </h2>
              <span className="font-mono text-[11px] text-zinc-500">
                {filtered.length} SHAPES · PAGE {currentPage}/{totalPages}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {paginated.map((ex, idx) => {
                const isLive = activeLiveId === ex.id
                const pal = PALETTES[ex.palette] || PALETTES.ember
                return (
                  <motion.div
                    key={ex.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: Math.min(idx * 0.02, 0.2) }}
                    whileHover={{ y: -4 }}
                    onMouseEnter={() => setActiveLiveId(ex.id)}
                    onMouseLeave={() => {
                      if (activeLiveId === ex.id) setActiveLiveId(null)
                    }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-[#0b0b0e] hover:border-cyan-400/40 hover:shadow-[0_12px_40px_-12px_rgba(34,211,238,0.18)] transition-all"
                  >
                    <div className="relative h-48 w-full overflow-hidden border-b border-white/10 bg-[#060608]">
                      {isLive ? (
                        <GlowCanvas
                          type={ex.id}
                          options={{ ...ex.options, count: 7500 }}
                          className="h-full w-full"
                        />
                      ) : (
                        <ShapeSnapshot id={ex.id} palette={ex.palette} />
                      )}

                      <span className="pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-300 backdrop-blur-md">
                        {ex.category}
                      </span>

                      <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/65 px-2 py-1 backdrop-blur-md">
                        {pal.slice(0, 3).map((c) => (
                          <span key={c} className="h-2 w-2 rounded-full" style={{ backgroundColor: c }} />
                        ))}
                      </div>

                      {!isLive && (
                        <span className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/75 px-2.5 py-0.5 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition backdrop-blur-md">
                          <Play className="h-2.5 w-2.5 fill-current text-cyan-400" /> Interactive
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold text-white">{ex.title}</h3>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={() => toggleFav(ex.id)}
                            className="text-zinc-500 hover:text-rose-400 transition cursor-pointer"
                            title="Favourite"
                          >
                            <Heart className={`h-3.5 w-3.5 ${favs.has(ex.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </motion.button>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-zinc-400">
                          {ex.desc}
                        </p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => onOpenInStudio(ex.id, ex.options)}
                          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] py-1.5 text-[11px] font-medium text-zinc-200 hover:bg-cyan-400 hover:text-black transition cursor-pointer"
                        >
                          <Sliders className="h-3 w-3" />
                          Studio
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => copyCode(ex)}
                          className="inline-flex items-center justify-center gap-1 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] text-zinc-300 hover:border-white/25 transition cursor-pointer"
                        >
                          {copiedId === ex.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedId === ex.id ? 'Copied' : 'Code'}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Pagination Bar */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                <button
                  onClick={() => setPageIdx((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-35 transition cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setPageIdx(n)}
                      className={`h-8 w-8 rounded-lg font-mono text-xs transition cursor-pointer ${
                        currentPage === n
                          ? 'bg-cyan-400 font-bold text-black'
                          : 'border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPageIdx((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10 disabled:opacity-35 transition cursor-pointer"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
