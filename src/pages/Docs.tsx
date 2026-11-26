import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import {
  ArrowRight,
  Atom,
  Blocks,
  Check,
  ChevronRight,
  Copy,
  FileCode2,
  Image as ImageIcon,
  Music,
  Search,
  Sparkles,
  Wand2
} from 'lucide-react'
import { GlowCanvas } from '../components/GlowCanvas'
import type { Page } from '../components/Navbar'

interface DocsProps {
  onNavigate: (page: Page) => void
}

interface DocTopic {
  id: string
  title: string
  category: string
  previewType: string
  previewOpts: Record<string, any>
  summary: string
  code: string
}

const TOPICS: DocTopic[] = [
  {
    id: 'react',
    title: 'Glowdots for React & Next.js',
    category: 'Platform',
    previewType: 'sphere',
    previewOpts: { palette: 'ember', bloom: 0.45, count: 12000, holdCharge: true },
    summary: 'SSR-safe client components with automatic ResizeObserver, StrictMode cleanup, and ref access to morphTo().',
    code: `import { Sphere, Logo } from 'glowdots/react'

export function Hero() {
  return (
    <Sphere palette="ember" bloom={0.5} holdCharge orbit style={{ height: '100vh' }}>
      <h1>Your content on top</h1>
    </Sphere>
  )
}`
  },
  {
    id: 'js',
    title: 'Glowdots for Vanilla JS / TS',
    category: 'Platform',
    previewType: 'torusKnot',
    previewOpts: { palette: 'ocean', bloom: 0.45, count: 12000, orbit: true },
    summary: 'Zero-dependency imperative API. Mount into any selector or HTMLElement, update options smoothly, or morphTo() any shape.',
    code: `import { sphere } from 'glowdots'

const fx = sphere('#hero', {
  palette: 'ember',
  count: 30000,
  bloom: 0.45,
  clickBurst: true,
  trailMemory: 0.6
})

await fx.morphTo('galaxy', { duration: 1.2 })
fx.destroy()`
  },
  {
    id: 'element',
    title: 'Glowdots Web Component',
    category: 'Platform',
    previewType: 'galaxy',
    previewOpts: { palette: 'aurora', bloom: 0.45, count: 14000, clickBurst: true },
    summary: 'Drop <glow-dots> into HTML, Astro, Vue, or Svelte with zero build step and reactive kebab-case attributes.',
    code: `<script type="module">
  import 'https://esm.sh/glowdots/element'
</script>

<glow-dots
  type="galaxy"
  palette="aurora"
  bloom="0.45"
  click-burst="true"
  style="height: 100vh"
></glow-dots>`
  },
  {
    id: 'logo',
    title: 'Logo / SVG / Image to Particles',
    category: 'Guide',
    previewType: 'logo',
    previewOpts: { preserveColors: true, bloom: 0.35, count: 12000, clickBurst: true },
    summary: 'Rasterize any PNG, WebP, SVG string, or URL with automatic alpha/background detection and RGB color preservation.',
    code: `import { logo } from 'glowdots'

logo('#brand', {
  source: '/logo.svg',
  preserveColors: true,
  threshold: 0.18,
  bloom: 0.35,
  clickBurst: true
})`
  },
  {
    id: 'audio',
    title: 'Audio Reactivity (glowdots/audio)',
    category: 'Guide',
    previewType: 'aurora',
    previewOpts: { palette: 'neon', bloom: 0.5, count: 12000 },
    summary: 'Tree-shakeable Web Audio AnalyserNode adapter for <audio>, <video>, or MediaStream microphones.',
    code: `import { sphere } from 'glowdots'
import { bindAudio } from 'glowdots/audio'

const fx = sphere('#stage', { bloom: 0.25, orbit: true })
const audio = bindAudio(fx, document.querySelector('audio'), {
  map: { scale: 0.35, intensity: 0.9, bloom: 0.6 },
  onBeat: (energy) => console.log('beat', energy)
})
await audio.start()`
  },
  {
    id: 'custom',
    title: 'Custom Shapes (defineShape)',
    category: 'Guide',
    previewType: 'dna',
    previewOpts: { palette: 'aurora', bloom: 0.45, count: 12000, orbit: true },
    summary: 'Create GPU-animated shapes with zero GLSL boilerplate using built-in motion presets (float, swirl, pulse, wave).',
    code: `import { defineShape, mountEffect } from 'glowdots'

const custom = defineShape({
  name: 'customRing',
  motion: 'pulse',
  generate(n, _opts, rnd, put) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const r = 0.6 + Math.sin(a * 6) * 0.2
      put(Math.cos(a) * r, (rnd() - 0.5) * 0.08, Math.sin(a) * r, i / n)
    }
  }
})
mountEffect(custom, '#hero', { bloom: 0.4 })`
  },
  {
    id: 'shapes',
    title: '30 Aesthetic Shapes (glowdots/shapes)',
    category: 'Guide',
    previewType: 'nebula',
    previewOpts: { palette: 'sunset', bloom: 0.5, count: 14000, orbit: true },
    summary: 'Strange attractors, cosmic black holes, DNA, jellyfish, and sacred geometry in a separate tree-shakeable export.',
    code: `import { blackHole, nebula, lorenz, dna, jellyfish, mobius } from 'glowdots/shapes'

blackHole('#hero', { bloom: 0.5, orbit: true, orbitZoom: true })`
  }
]

type OptionCategory = 'All' | 'Design' | 'Polish' | 'Physics' | 'Events'

const OPTIONS_LIST: Array<{
  name: string
  type: string
  def: string
  cat: Exclude<OptionCategory, 'All'>
  desc: string
}> = [
  { name: 'palette', type: 'string | string[]', def: "'ember'", cat: 'Design', desc: 'ember, aurora, mono, ocean, sunset, neon, daylight, frost, earth, or 2–8 hex colors.' },
  { name: 'count', type: 'number', def: 'per effect', cat: 'Design', desc: 'Main particle count (100 to 500,000).' },
  { name: 'blend', type: "'additive' | 'normal'", def: "'additive'", cat: 'Design', desc: "Use 'normal' with daylight/frost palettes on light backgrounds." },
  { name: 'bloom / bloomRadius', type: 'number', def: '0 / 8', cat: 'Polish', desc: 'Multi-pass Gaussian bloom intensity and blur kernel radius.' },
  { name: 'depthOfField', type: 'number', def: '0', cat: 'Polish', desc: 'Optical circle-of-confusion blur and energy conservation by depth.' },
  { name: 'vignette / grain', type: 'number', def: '0 / 0', cat: 'Polish', desc: 'Edge darkening and animated film grain overlay.' },
  { name: 'entranceDuration', type: 'number', def: '0', cat: 'Polish', desc: 'Particles assemble from chaos on load (seconds).' },
  { name: 'colorDrift', type: 'boolean', def: 'false', cat: 'Polish', desc: 'Slowly cycles the active color palette over time.' },
  { name: 'clickBurst', type: 'boolean', def: 'false', cat: 'Physics', desc: 'Expanding radial shockwave ripple on click or tap.' },
  { name: 'holdCharge', type: 'boolean', def: 'false', cat: 'Physics', desc: 'Hold pointer down to implode & charge; release for supercharged shockwave.' },
  { name: 'trailMemory', type: 'number', def: '0', cat: 'Physics', desc: 'Lingering cursor wake along recent pointer path (seconds).' },
  { name: 'orbit / orbitZoom', type: 'boolean', def: 'false', cat: 'Physics', desc: '360° drag camera with spring inertia and optional wheel zoom.' },
  { name: 'scrollProgress / scrollSync', type: 'number / boolean', def: '— / false', cat: 'Physics', desc: 'Drive morph or global parallax/dispersion from scroll (0..1).' },
  { name: 'on', type: 'Partial<Record<FxEvent, fn>>', def: '{}', cat: 'Events', desc: 'ready, morph:done, charge:release, asset:loaded, fpsdrop, contextlost.' }
]

export function Docs({ onNavigate }: DocsProps) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string>('element')
  const [optCategory, setOptCategory] = useState<OptionCategory>('All')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const activeTopic = useMemo(
    () => TOPICS.find((t) => t.id === selectedId) ?? TOPICS[0],
    [selectedId]
  )

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase()
    return OPTIONS_LIST.filter((o) => {
      if (optCategory !== 'All' && o.cat !== optCategory) return false
      if (!q) return true
      return o.name.toLowerCase().includes(q) || o.desc.toLowerCase().includes(q)
    })
  }, [query, optCategory])

  const copyText = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const jumpToTopic = (id: string) => {
    setSelectedId(id)
    document.getElementById('topic-reader')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="relative overflow-hidden bg-[#08080a] text-zinc-100">
      {/* Large aesthetic galaxy shape in top-left corner behind Docs header */}
      <div className="pointer-events-none absolute -left-36 -top-28 h-[560px] w-[560px] opacity-90">
        <GlowCanvas
          type="galaxy"
          className="h-full w-full"
          options={{
            palette: 'ember',
            count: 26000,
            size: 1.5,
            intensity: 1.65,
            bloom: 0.65,
            bloomRadius: 10,
            scale: 1.2,
            tilt: 0.85,
            idleMotion: false,
            interaction: 'none'
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16 sm:px-10">
        {/* Header Row */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-10 md:flex-row md:items-end">
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-7xl">Docs</h1>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="font-mono text-[11px] text-zinc-500">v2.0.1</span>
            <div className="relative w-full md:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search options & guides..."
                className="w-full border border-white/15 bg-black/70 py-2 pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-cyan-400/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Top Index Columns */}
        <div className="grid gap-8 py-10 text-xs sm:grid-cols-2 lg:grid-cols-4">
          <p className="leading-relaxed text-zinc-400">
            Guides, API reference, and examples for React, Vanilla JS, and Web Components.
          </p>

          <div>
            <p className="mb-3 font-medium text-zinc-500">Platforms</p>
            <ul className="space-y-2 text-zinc-200">
              <li>
                <button onClick={() => jumpToTopic('react')} className="inline-flex items-center gap-2 hover:text-cyan-300 transition cursor-pointer">
                  <Atom className="h-3.5 w-3.5 text-cyan-400" /> React / Next.js
                </button>
              </li>
              <li>
                <button onClick={() => jumpToTopic('js')} className="inline-flex items-center gap-2 hover:text-yellow-300 transition cursor-pointer">
                  <FileCode2 className="h-3.5 w-3.5 text-yellow-400" /> JavaScript / TS
                </button>
              </li>
              <li>
                <button onClick={() => jumpToTopic('element')} className="inline-flex items-center gap-2 hover:text-emerald-300 transition cursor-pointer">
                  <Blocks className="h-3.5 w-3.5 text-emerald-400" /> Web Component
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-medium text-zinc-500">Guides</p>
            <ul className="space-y-2 text-zinc-200">
              <li>
                <button onClick={() => jumpToTopic('logo')} className="inline-flex items-center gap-2 hover:text-white transition cursor-pointer">
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" /> Logo / SVG Particles
                </button>
              </li>
              <li>
                <button onClick={() => jumpToTopic('audio')} className="inline-flex items-center gap-2 hover:text-white transition cursor-pointer">
                  <Music className="h-3.5 w-3.5 text-pink-400" /> Audio Reactivity
                </button>
              </li>
              <li>
                <button onClick={() => jumpToTopic('custom')} className="inline-flex items-center gap-2 hover:text-white transition cursor-pointer">
                  <Wand2 className="h-3.5 w-3.5 text-cyan-400" /> Custom defineShape()
                </button>
              </li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-medium text-zinc-500">Tools</p>
            <ul className="space-y-2 text-zinc-200">
              <li>
                <button onClick={() => onNavigate('playground')} className="hover:text-cyan-300 transition cursor-pointer">
                  Glowdots Studio (43 Shapes)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('examples')} className="hover:text-cyan-300 transition cursor-pointer">
                  Live Examples Gallery
                </button>
              </li>
              <li>
                <button onClick={() => jumpToTopic('shapes')} className="hover:text-cyan-300 transition cursor-pointer">
                  30 Aesthetic Shapes Pack
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Featured Studio Banner */}
        <div className="grid overflow-hidden border border-white/10 bg-[#101114] lg:grid-cols-[200px_1fr_280px]">
          <div className="flex flex-col justify-between bg-[#3ee98a] p-6 text-black">
            <span className="text-[10px] font-bold uppercase tracking-[0.12em]">GLOWDOTS STUDIO</span>
            <div className="my-6 inline-flex h-10 w-10 items-center justify-center border border-black/30 bg-black text-white">
              <Sparkles className="h-4 w-4 text-[#3ee98a]" />
            </div>
            <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.1em]">
              FREE · OPEN SOURCE
              <br />
              43 GPU SHAPES
            </span>
          </div>

          <div className="flex flex-col justify-between p-7">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.14em] text-zinc-500">
                INTERACTIVE WEBGL2 SANDBOX
              </span>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Build &amp; morph particle heroes faster.
              </h2>
              <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
                Tune bloom, depth of field, hold-to-charge, 360° orbit, and export ready-to-paste React, Vanilla, or Web Component snippets.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-4">
              <div className="flex gap-6 text-[10px] font-mono uppercase text-zinc-400">
                <div><span className="block text-white text-xs font-bold">43</span>Shapes</div>
                <div><span className="block text-white text-xs font-bold">9</span>Palettes</div>
                <div><span className="block text-white text-xs font-bold">16.5 kB</span>Core</div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('playground')}
                className="inline-flex items-center gap-2 bg-[#3ee98a] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-black hover:bg-[#5ef39f] transition cursor-pointer"
              >
                Open Studio
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>

          <div className="relative hidden min-h-[220px] border-l border-white/10 bg-[#060608] lg:block">
            <GlowCanvas
              type="blackHole"
              className="h-full w-full"
              options={{ palette: 'ember', count: 10000, bloom: 0.45, orbit: true }}
            />
          </div>
        </div>

        {/* Platforms 3-Column Grid */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Platforms</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                id: 'react',
                icon: Atom,
                color: 'text-cyan-400',
                title: 'Glowdots for React',
                desc: 'Mount SSR-safe particle components with React refs and StrictMode support.',
                snippet: `<Sphere\n  palette="ember"\n  bloom={0.5}\n  holdCharge\n/>`,
                links: ['Sphere & Core Effects', 'morphTo() via Ref', 'Logo RGB Component', 'Next.js App Router']
              },
              {
                id: 'js',
                icon: FileCode2,
                color: 'text-yellow-400',
                title: 'Glowdots for JavaScript',
                desc: 'Mount into any DOM element with smooth option interpolation and zero deps.',
                snippet: `sphere('#hero', {\n  palette: 'ember',\n  clickBurst: true,\n  orbit: true\n})`,
                links: ['mountEffect() Engine', 'trailMemory & Physics', 'Audio Reactivity', 'Context-Loss Recovery']
              },
              {
                id: 'element',
                icon: Blocks,
                color: 'text-emerald-400',
                title: 'Glowdots Web Component',
                desc: 'Drop <glow-dots> into HTML, Astro, Vue, or Svelte with reactive attributes.',
                snippet: `<glow-dots\n  type="galaxy"\n  palette="aurora"\n  bloom="0.45"\n/>`,
                links: ['CDN / esm.sh Usage', 'Kebab-Case Attributes', 'JSON Options Prop', 'Custom Tag Name']
              }
            ].map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.18 }}
                className="flex flex-col border border-white/10 bg-[#0c0c0f] p-6 hover:border-white/20 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <p.icon className={`h-4 w-4 ${p.color}`} />
                  <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-zinc-400">{p.desc}</p>

                <pre className="mt-5 overflow-x-auto bg-black/50 p-3.5 font-mono text-[11px] leading-relaxed text-cyan-200">
                  <code>{p.snippet}</code>
                </pre>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => jumpToTopic(p.id)}
                  className="mt-4 flex w-full items-center justify-between bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-black hover:bg-zinc-200 transition cursor-pointer"
                >
                  <span>Get Started</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </motion.button>

                <button
                  onClick={() => copyText(p.id, 'npm install glowdots')}
                  className="mt-2 flex w-full items-center justify-between border border-white/15 bg-black/40 px-3.5 py-2 font-mono text-[11px] text-zinc-300 hover:border-white/30 transition cursor-pointer"
                >
                  <span>npm install glowdots</span>
                  {copiedKey === p.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-zinc-500" />}
                </button>

                <div className="mt-5 divide-y divide-white/10 border-t border-white/10 text-xs">
                  {p.links.map((l) => (
                    <button
                      key={l}
                      onClick={() => jumpToTopic(p.id)}
                      className="flex w-full items-center justify-between py-2.5 text-left text-zinc-300 hover:text-white transition cursor-pointer"
                    >
                      <span>{l}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Guides 3-Column Grid */}
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold tracking-tight text-white">Guides</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { id: 'logo', icon: ImageIcon, color: 'text-purple-400', title: 'Logo / SVG to Particles', desc: 'Rasterize PNGs or inline SVGs with brand RGB color preservation.' },
              { id: 'audio', icon: Music, color: 'text-pink-400', title: 'Audio Reactivity', desc: 'Drive scale, bloom, and beats from <audio> or microphone streams.' },
              { id: 'custom', icon: Wand2, color: 'text-cyan-400', title: 'Custom defineShape()', desc: 'Author GPU-animated shapes with zero GLSL boilerplate.' }
            ].map((g) => (
              <motion.button
                key={g.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => jumpToTopic(g.id)}
                className="group flex flex-col items-start border border-white/10 bg-[#0c0c0f] p-5 text-left hover:border-white/25 transition cursor-pointer"
              >
                <div className="flex w-full items-center justify-between">
                  <g.icon className={`h-4 w-4 ${g.color}`} />
                  <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">{g.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{g.desc}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* Interactive Split Code + Live Preview Showcase */}
        <section id="topic-reader" className="mt-16 overflow-hidden border border-white/10 bg-[#0c0c0f]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="rounded bg-cyan-400/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
                {activeTopic.category}
              </span>
              <h3 className="text-base font-semibold text-white">{activeTopic.title}</h3>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/50 p-1">
              {TOPICS.map((t) => {
                const active = selectedId === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedId(t.id)}
                    className={`relative px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                      active ? 'text-black font-semibold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="topic-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded bg-white"
                      />
                    )}
                    <span className="relative z-10">{t.id}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-[320px_1fr]">
            {/* Left: Live Interactive WebGL2 Preview */}
            <div className="flex flex-col justify-between border-b border-white/10 bg-[#070709] lg:border-b-0 lg:border-r">
              <div className="relative h-56 w-full">
                <GlowCanvas
                  type={activeTopic.previewType}
                  options={activeTopic.previewOpts}
                  className="h-full w-full"
                />
                <span className="pointer-events-none absolute bottom-2.5 left-3 rounded-full border border-white/10 bg-black/70 px-2.5 py-0.5 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
                  live preview · {activeTopic.previewType}
                </span>
              </div>
              <p className="border-t border-white/10 p-5 text-xs leading-relaxed text-zinc-400">
                {activeTopic.summary}
              </p>
            </div>

            {/* Right: Sleek Editor Window */}
            <div className="relative flex flex-col bg-[#0a0a0d]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                  <span className="ml-2 font-mono text-[11px] text-zinc-500">{activeTopic.id}.example</span>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copyText('topic', activeTopic.code)}
                  className="inline-flex items-center gap-1.5 rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                >
                  {copiedKey === 'topic' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  {copiedKey === 'topic' ? 'Copied' : 'Copy'}
                </motion.button>
              </div>
              <pre className="flex-1 overflow-x-auto p-6 font-mono text-xs leading-relaxed text-zinc-200">
                <code>{activeTopic.code}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Production Options Reference with Category Tabs */}
        <section className="mt-16">
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Options Reference</h2>
              <p className="mt-1 text-xs text-zinc-500">All options are reactive via <code className="text-zinc-300">fx.update(opts)</code> with smooth interpolation.</p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-[#0c0c0f] p-1">
              {(['All', 'Design', 'Polish', 'Physics', 'Events'] as const).map((cat) => {
                const active = optCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setOptCategory(cat)}
                    className={`relative px-3 py-1 text-[11px] font-medium transition cursor-pointer ${
                      active ? 'text-black font-semibold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="opt-cat-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded bg-cyan-400"
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="divide-y divide-white/10 border border-white/10 bg-[#0c0c0f]">
            {filteredOptions.map((o) => (
              <div
                key={o.name}
                className="grid gap-2 px-5 py-3.5 text-xs transition-colors hover:bg-white/[0.02] sm:grid-cols-[220px_140px_1fr] sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-2">
                  <code className="font-mono font-semibold text-cyan-300">{o.name}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/5 px-2 py-0.5 font-mono text-[10px] text-zinc-400">
                    {o.def}
                  </span>
                  <span className="text-[10px] text-zinc-600">{o.type}</span>
                </div>
                <p className="text-zinc-400">{o.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
