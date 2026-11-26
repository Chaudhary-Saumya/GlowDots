import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Copy, Upload } from 'lucide-react'
import type { EffectInstance } from 'glowdots'
import { ALL_EFFECT_DEFS, GlowCanvas } from '../components/GlowCanvas'
import { LogoMark } from '../components/LogoMark'
import type { Page } from '../components/Navbar'

interface HomeProps {
  onNavigate: (page: Page) => void
}

const MORPH_TABS = [
  { id: 'sphere', label: 'SPHERE', palette: 'ember' },
  { id: 'galaxy', label: 'GALAXY', palette: 'aurora' },
  { id: 'blackHole', label: 'BLACK HOLE', palette: 'ember' },
  { id: 'dna', label: 'DNA HELIX', palette: 'ocean' }
] as const

const LOGO_SAMPLES = [
  {
    label: 'Hex Emblem',
    svg: undefined
  },
  {
    label: 'Orbit Star',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f5e11c"/><stop offset="100%" stop-color="#ff5d8f"/></linearGradient></defs><path d="M100 18 L120 80 L182 100 L120 120 L100 182 L80 120 L18 100 L80 80 Z" fill="url(#s)"/></svg>`
  },
  {
    label: 'Wave Ring',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="68" fill="none" stroke="#22d3ee" stroke-width="14"/><circle cx="100" cy="100" r="36" fill="none" stroke="#a855f7" stroke-width="12"/><circle cx="100" cy="100" r="14" fill="#ffffff"/></svg>`
  }
]

export function Home({ onNavigate }: HomeProps) {
  const morphFxRef = useRef<EffectInstance | null>(null)
  const [morphTab, setMorphTab] = useState<string>('sphere')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [logoSource, setLogoSource] = useState<string | undefined>(undefined)
  const [logoLabel, setLogoLabel] = useState<string>('Hex Emblem')
  const [preserveColors, setPreserveColors] = useState(true)

  const handleLogoFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoSource(reader.result)
        setLogoLabel(file.name)
      }
    }
    reader.readAsDataURL(file)
  }

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const switchMorphShowcase = async (id: string, palette: string) => {
    setMorphTab(id)
    const def = ALL_EFFECT_DEFS[id]
    if (morphFxRef.current && def) {
      morphFxRef.current.update({ palette })
      await morphFxRef.current.morphTo(def, { duration: 0.85 })
    }
  }

  return (
    <div className="bg-[#08080a] text-zinc-100">
      {/* 1. Full-Viewport Motion-style Hero */}
      <section className="relative flex min-h-screen flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <GlowCanvas
            type="sphere"
            className="h-full w-full"
            options={{
              palette: 'ember',
              count: 34000,
              size: 1.4,
              intensity: 1.55,
              softness: 0.28,
              rim: 0.9,
              band: 0.085,
              turbulence: 0.55,
              bloom: 0.55,
              bloomRadius: 9,
              trailMemory: 0.6,
              clickBurst: true,
              holdCharge: true,
              entranceDuration: 1.2,
              scale: 0.82
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-14 pt-32 sm:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-lg">
              <button
                onClick={() => onNavigate('examples')}
                className="mb-4 inline-flex items-center gap-2 bg-[#3ee98a] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase text-black hover:bg-[#5ef39f] transition cursor-pointer"
              >
                <span>V2.0 · 43 GPU SHAPES &amp; AUDIO</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-[42px] leading-[1.08]">
                The particle engine loved by designers and devs alike.
              </h1>
              <p className="mt-3.5 max-w-md text-[13px] leading-relaxed text-zinc-400">
                WebGL2 spheres, galaxies, SVG logos, bloom, and tactile cursor physics for React, Vanilla JS, and Web Components.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 lg:items-end">
              <span className="text-[11px] text-zinc-500">
                Free and open source · Zero dependencies · ~16.8 kB brotli
              </span>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => copy('install', 'npm install glowdots')}
                  className="inline-flex items-center gap-3 border border-white/15 bg-black/75 px-4 py-2.5 font-mono text-xs text-zinc-200 backdrop-blur-md hover:border-white/30 transition cursor-pointer"
                >
                  <span>npm install glowdots</span>
                  {copiedKey === 'install' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </button>
                <button
                  onClick={() => onNavigate('docs')}
                  className="inline-flex items-center gap-2 bg-[#f5e11c] px-5 py-2.5 text-[11px] font-bold tracking-[0.12em] uppercase text-black hover:bg-[#ffe938] transition cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Editorial Interactive Showcases (Motion.dev-inspired rhythm) */}
      <div className="mx-auto max-w-6xl px-6 py-24 sm:px-10">
        <div className="mb-16 max-w-md border-b border-white/10 pb-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl leading-tight">
            Small APIs.
            <br />
            Expressive particles.
          </h2>
          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
            It only takes a few lines of glowdots to turn a static hero into a living 60fps WebGL2 canvas in React, Vanilla JS, or HTML.
          </p>
        </div>

        {/* Showcase A: Any-to-Any Shape Morphing */}
        <section className="mb-24">
          <h3 className="mb-5 text-lg font-semibold tracking-tight text-white">
            Shape morphing
          </h3>
          <div className="relative h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0e]">
            <GlowCanvas
              ref={morphFxRef}
              type="sphere"
              className="h-full w-full"
              options={{
                palette: 'ember',
                count: 18000,
                bloom: 0.45,
                clickBurst: true,
                trailMemory: 0.5,
                pointerTarget: 'container'
              }}
            />
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-md border border-white/10 bg-black/80 p-1 backdrop-blur-md">
              {MORPH_TABS.map((t) => {
                const active = morphTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => switchMorphShowcase(t.id, t.palette)}
                    className={`relative px-3 py-1.5 text-[10px] font-bold tracking-[0.1em] uppercase transition cursor-pointer ${
                      active ? 'text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="home-morph-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 rounded bg-white"
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div>
              <p className="text-xs leading-relaxed text-zinc-400">
                Morph smoothly between any of the 43 built-in effects and custom shapes using dual-shader GPU blending with zero context reset.
              </p>
              <div className="mt-4 flex gap-5 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                <button onClick={() => onNavigate('docs')} className="hover:text-cyan-400 transition cursor-pointer">
                  Morph Docs →
                </button>
                <button onClick={() => onNavigate('playground')} className="hover:text-cyan-400 transition cursor-pointer">
                  Try in Studio →
                </button>
              </div>
            </div>

            <CodeBox
              code={`const fx = sphere('#hero', { bloom: 0.45 })\n\nawait fx.morphTo('${morphTab}', {\n  duration: 0.85\n})`}
              copied={copiedKey === 'morph'}
              onCopy={() =>
                copy('morph', `const fx = sphere('#hero', { bloom: 0.45 })\n\nawait fx.morphTo('${morphTab}', { duration: 0.85 })`)
              }
            />
          </div>
        </section>

        {/* Showcase B: Gesture, Hold-to-Charge & 360° Orbit */}
        <section className="mb-24 border-t border-white/10 pt-16">
          <h3 className="mb-5 text-lg font-semibold tracking-tight text-white">
            Gesture &amp; hold-charge physics
          </h3>
          <div className="relative h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0e]">
            <GlowCanvas
              type="torusKnot"
              className="h-full w-full"
              options={{
                palette: 'sunset',
                count: 18000,
                bloom: 0.5,
                holdCharge: true,
                orbit: true,
                clickBurst: true,
                trailMemory: 0.6,
                pointerTarget: 'container'
              }}
            />
            <span className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/75 px-3 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
              hold to implode &amp; release · drag to 360° orbit
            </span>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div>
              <p className="text-xs leading-relaxed text-zinc-400">
                Cursor velocity wake, lingering trail memory, hold-to-charge implosion cores, and spring-inertia 360° orbit work out of the box.
              </p>
              <div className="mt-4 flex gap-5 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                <button onClick={() => onNavigate('examples')} className="hover:text-cyan-400 transition cursor-pointer">
                  All 43 Examples →
                </button>
              </div>
            </div>

            <CodeBox
              code={`<TorusKnot\n  palette="sunset"\n  bloom={0.5}\n  holdCharge\n  orbit\n  trailMemory={0.6}\n/>`}
              copied={copiedKey === 'gesture'}
              onCopy={() =>
                copy('gesture', `<TorusKnot palette="sunset" bloom={0.5} holdCharge orbit trailMemory={0.6} />`)
              }
            />
          </div>
        </section>

        {/* Showcase C: Interactive Upload Image / Logo to Particles */}
        <section className="border-t border-white/10 pt-16">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-lg font-semibold tracking-tight text-white">
              Upload any image or logo → live particles
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {LOGO_SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setLogoSource(s.svg)
                    setLogoLabel(s.label)
                  }}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium transition cursor-pointer ${
                    logoLabel === s.label
                      ? 'bg-white text-black font-semibold'
                      : 'border border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/25 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-cyan-400 px-3.5 py-1 text-[11px] font-bold text-black hover:bg-cyan-300 transition">
                <Upload className="h-3 w-3" />
                <span>Upload PNG / SVG</span>
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleLogoFile(e.dataTransfer.files?.[0])
            }}
            className="relative h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#0b0b0e]"
          >
            <GlowCanvas
              type="logo"
              className="h-full w-full"
              options={{
                source: logoSource,
                preserveColors,
                count: 18000,
                bloom: 0.4,
                clickBurst: true,
                trailMemory: 0.6,
                pointerTarget: 'container'
              }}
            />
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <span className="rounded-full border border-white/10 bg-black/75 px-3 py-1 font-mono text-[10px] text-zinc-400 backdrop-blur-md">
                drag &amp; drop any PNG / SVG here · hover &amp; click to scatter
              </span>
              <button
                onClick={() => setPreserveColors((v) => !v)}
                className="pointer-events-auto rounded-full border border-white/15 bg-black/75 px-3 py-1 text-[11px] font-medium text-zinc-200 backdrop-blur-md hover:border-cyan-400/50 transition cursor-pointer"
              >
                RGB Colors: <span className={preserveColors ? 'text-cyan-400' : 'text-zinc-400'}>{preserveColors ? 'Original' : 'Palette'}</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div>
              <p className="text-xs leading-relaxed text-zinc-400">
                Drop any PNG, WebP, URL, or inline SVG string. Particles sample true brand RGB colors automatically and scatter interactively on hover and click.
              </p>
              <div className="mt-4 flex gap-5 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
                <button onClick={() => onNavigate('playground')} className="hover:text-cyan-400 transition cursor-pointer">
                  Open in Studio →
                </button>
              </div>
            </div>

            <CodeBox
              code={`import { logo } from 'glowdots'\n\nlogo('#brand', {\n  source: '/logo.svg',\n  preserveColors: ${preserveColors},\n  bloom: 0.4,\n  clickBurst: true\n})`}
              copied={copiedKey === 'logo'}
              onCopy={() =>
                copy('logo', `import { logo } from 'glowdots'\n\nlogo('#brand', { source: '/logo.svg', preserveColors: ${preserveColors}, bloom: 0.4, clickBurst: true })`)
              }
            />
          </div>
        </section>
      </div>

      {/* Minimal Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-zinc-500 sm:px-10">
          <div className="flex items-center gap-2">
            <LogoMark className="h-5 w-5" />
            <span className="font-semibold text-zinc-300">glowdots</span>
          </div>
          <div className="flex gap-6">
            <button onClick={() => onNavigate('docs')} className="hover:text-white transition cursor-pointer">Docs</button>
            <button onClick={() => onNavigate('examples')} className="hover:text-white transition cursor-pointer">Examples</button>
            <button onClick={() => onNavigate('playground')} className="hover:text-white transition cursor-pointer">Playground</button>
            <a href="https://www.npmjs.com/package/glowdots" target="_blank" rel="noreferrer" className="hover:text-white transition">npm</a>
          </div>
          <span>MIT License · WebGL2</span>
        </div>
      </footer>
    </div>
  )
}

function CodeBox({
  code,
  copied,
  onCopy
}: {
  code: string
  copied: boolean
  onCopy: () => void
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-white/10 bg-[#0d0d10]">
      <button
        onClick={onCopy}
        className="absolute right-3 top-3 inline-flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-zinc-300 hover:bg-white/10 transition cursor-pointer"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  )
}
