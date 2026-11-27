import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Check, Copy, Sparkles, Upload } from 'lucide-react'
import type { EffectInstance } from 'glowdots'
import { GlowScrollStory, type ReactScrollStage } from 'glowdots/react'
import { shapeDefs } from 'glowdots/shapes'
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
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="68" fill="none" stroke="#3ee98a" stroke-width="14"/><circle cx="100" cy="100" r="36" fill="none" stroke="#f5e11c" stroke-width="12"/><circle cx="100" cy="100" r="14" fill="#ffffff"/></svg>`
  }
]

const STORY_STAGE_LABELS = [
  '01 · Sphere',
  '02 · Galaxy',
  '03 · Black Hole'
] as const

type StoryCodeTab = 'react-component' | 'react-hook' | 'vanilla'

const STORY_CODE_SNIPPETS: Record<StoryCodeTab, string> = {
  'react-component': `'use client'
import { useRef } from 'react'
import { GlowScrollStory } from 'glowdots/react'
import { blackHoleDef } from 'glowdots/shapes'

export function Page() {
  const hero = useRef<HTMLElement>(null)
  const cosmos = useRef<HTMLElement>(null)
  const singularity = useRef<HTMLElement>(null)

  return (
    <GlowScrollStory
      smoothing={0.13}
      dwell={0.36}
      velocityStrength={1.05}
      stages={[
        { trigger: hero,        effect: 'sphere',     options: { palette: 'ember',  offset: [0, 0] } },
        { trigger: cosmos,      effect: 'galaxy',     options: { palette: 'aurora', offset: [0.34, 0] } },
        { trigger: singularity, effect: blackHoleDef, options: { palette: 'ember',  offset: [-0.32, 0] } }
      ]}
    />
  )
}`,
  'react-hook': `import { useRef } from 'react'
import { Sphere, useScrollStory } from 'glowdots/react'
import type { EffectInstance } from 'glowdots'

export function StoryBg() {
  const fxRef = useRef<EffectInstance | null>(null)
  const { stageIndex } = useScrollStory(fxRef, {
    dwell: 0.36,
    velocityStrength: 1.0,
    stages: [
      { trigger: '#hero',   effect: 'sphere', options: { palette: 'ember' } },
      { trigger: '#middle', effect: 'galaxy', options: { palette: 'aurora', offset: [0.34, 0] } },
      { trigger: '#end',    effect: 'vortex', options: { palette: 'ocean',  offset: [-0.32, 0] } }
    ]
  })
  return <Sphere ref={fxRef} className="fixed inset-0 pointer-events-none" />
}`,
  vanilla: `import { sphere, scrollStory } from 'glowdots'
import { blackHoleDef } from 'glowdots/shapes'

const fx = sphere('#bg', { count: 24000, bloom: 0.5 })

const story = scrollStory(fx, {
  smoothing: 0.13,
  dwell: 0.36,
  velocityStrength: 1.05,
  stages: [
    { trigger: '#hero',   effect: 'sphere',     options: { palette: 'ember',  offset: [0, 0] } },
    { trigger: '#cosmos', effect: 'galaxy',     options: { palette: 'aurora', offset: [0.34, 0] } },
    { trigger: '#cta',    effect: blackHoleDef, options: { palette: 'ember',  offset: [-0.32, 0] } }
  ]
})`
}

export function Home({ onNavigate }: HomeProps) {
  const morphFxRef = useRef<EffectInstance | null>(null)
  const heroStageRef = useRef<HTMLElement>(null)
  const storyStageRef = useRef<HTMLElement>(null)
  const blackHoleStageRef = useRef<HTMLElement>(null)
  const interactiveZoneRef = useRef<HTMLDivElement>(null)

  const [morphTab, setMorphTab] = useState<string>('sphere')
  const [physicsPalette, setPhysicsPalette] = useState<string>('sunset')
  const [storyTab, setStoryTab] = useState<StoryCodeTab>('react-component')
  const [activeStoryStage, setActiveStoryStage] = useState(0)
  const [storyProgress, setStoryProgress] = useState(0)
  const [storyVisible, setStoryVisible] = useState(true)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [logoSource, setLogoSource] = useState<string | undefined>(undefined)
  const [logoLabel, setLogoLabel] = useState<string>('Hex Emblem')
  const [preserveColors, setPreserveColors] = useState(true)

  // Cleanly fade out the fixed Scroll Storyteller canvas once the visitor enters the Interactive Showcases
  // so background particles never clash behind foreground WebGL canvases.
  useEffect(() => {
    const onScroll = () => {
      const zone = interactiveZoneRef.current
      if (!zone) return
      const top = zone.getBoundingClientRect().top
      setStoryVisible(top > window.innerHeight * 0.45)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const storyStages = useMemo<ReactScrollStage[]>(
    () => [
      {
        trigger: heroStageRef,
        effect: 'sphere',
        options: {
          palette: 'ember',
          scale: 0.82,
          bloom: 0.55,
          rim: 0.9,
          turbulence: 0.55,
          offset: [0, 0],
          rotationSpeed: 0.1
        }
      },
      {
        trigger: storyStageRef,
        effect: 'galaxy',
        options: {
          palette: 'aurora',
          scale: 0.95,
          bloom: 0.6,
          offset: [0.34, 0],
          tilt: 0.36,
          rotationSpeed: 0.16
        }
      },
      {
        trigger: blackHoleStageRef,
        effect: shapeDefs.blackHole,
        options: {
          palette: 'ember',
          scale: 0.95,
          bloom: 0.65,
          offset: [-0.32, 0],
          tilt: 0.3,
          rotationSpeed: 0.2
        }
      }
    ],
    []
  )

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

  const jumpToStage = (idx: number) => {
    const refs = [heroStageRef, storyStageRef, blackHoleStageRef]
    refs[idx]?.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="relative bg-[#08080a] text-zinc-100">
      {/* Persistent Scroll Storyteller Background (active across Hero + Story Runway, fades cleanly before Showcases) */}
      <GlowScrollStory
        fixed
        stages={storyStages}
        smoothing={0.13}
        dwell={0.36}
        velocityStrength={1.05}
        options={{
          count: 26000,
          size: 1.4,
          intensity: 1.45,
          softness: 0.28,
          bloom: 0.55,
          bloomRadius: 9,
          trailMemory: 0.5,
          entranceDuration: 1.1
        }}
        onStageChange={setActiveStoryStage}
        onProgress={setStoryProgress}
        style={{
          zIndex: 0,
          opacity: storyVisible ? 0.95 : 0,
          transition: 'opacity 0.45s ease'
        }}
      />

      {/* Minimal Right-Edge Chapter Rail (visible only in Scroll Story runway) */}
      <nav
        aria-label="Scroll Story Stages"
        className={`fixed right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-2.5 transition-opacity duration-300 xl:flex ${
          storyVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {STORY_STAGE_LABELS.map((label, idx) => {
          const active = activeStoryStage === idx
          return (
            <button
              key={label}
              onClick={() => jumpToStage(idx)}
              className="group flex items-center gap-2.5 py-0.5 cursor-pointer"
            >
              <span
                className={`font-mono text-[10px] tracking-wider uppercase transition ${
                  active ? 'text-white' : 'text-zinc-600 opacity-0 group-hover:opacity-100 group-hover:text-zinc-300'
                }`}
              >
                {label}
              </span>
              <span
                className={`block rounded-full transition-all ${
                  active ? 'h-5 w-1 bg-[#3ee98a]' : 'h-2 w-1 bg-white/20 group-hover:bg-white/50'
                }`}
              />
            </button>
          )
        })}
        <span className="mt-1 font-mono text-[10px] text-zinc-500">
          {Math.round(storyProgress * 100)}%
        </span>
      </nav>

      {/* 1. Full-Viewport Hero */}
      <section ref={heroStageRef} className="relative z-10 flex min-h-screen flex-col justify-end">
        <div className="mx-auto w-full max-w-7xl px-6 pb-14 pt-32 sm:px-10">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-lg">
              <button
                onClick={() => jumpToStage(1)}
                className="mb-4 inline-flex items-center gap-2 bg-[#3ee98a] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase text-black hover:bg-[#5ef39f] transition cursor-pointer"
              >
                <span>V2.1 · SCROLL STORYTELLER &amp; 43 GPU SHAPES</span>
                <ArrowRight className="h-3 w-3" />
              </button>
              <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-[42px] leading-[1.08]">
                The particle engine loved by designers and devs alike.
              </h1>
              <p className="mt-3.5 max-w-md text-[13px] leading-relaxed text-zinc-400">
                Scroll down to watch this sphere morph live into a galaxy and black hole — powered by WebGL2 &amp; <code className="text-zinc-200">glowdots/react</code>.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2.5 lg:items-end">
              <span className="text-[11px] text-zinc-400">
                Free and open source · Zero dependencies · ~18.7 kB brotli
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

      {/* 2. Scroll Storyteller Runway (Stage 2 Left -> Galaxy Right, Stage 3 Right -> Black Hole Left) */}
      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10">
        <section ref={storyStageRef} className="flex min-h-[82vh] items-center py-20">
          <div className="w-full max-w-xl min-w-0">
            <span className="inline-flex items-center gap-1.5 bg-[#3ee98a] px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] uppercase text-black">
              <Sparkles className="h-3 w-3" />
              New in v2.1 · Scroll Storyteller
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl leading-[1.1]">
              One canvas.
              <br />
              Infinite scroll choreography.
            </h2>
            <p className="mt-3.5 text-[13px] leading-relaxed text-zinc-400">
              The hero sphere morphs into a <span className="text-zinc-200">Galaxy</span> on the right using <code className="text-zinc-200">&lt;GlowScrollStory /&gt;</code> — with zero VBO re-uploads per scroll tick.
            </p>

            <div className="mt-6 mb-3 flex flex-wrap gap-1.5">
              {([
                ['react-component', 'React <GlowScrollStory />'],
                ['react-hook', 'useScrollStory()'],
                ['vanilla', 'Vanilla JS']
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setStoryTab(key)}
                  className={`px-3 py-1.5 font-mono text-[11px] transition cursor-pointer ${
                    storyTab === key
                      ? 'bg-white text-black font-semibold'
                      : 'border border-white/15 bg-black/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <CodeBox
              code={STORY_CODE_SNIPPETS[storyTab]}
              copied={copiedKey === `story-${storyTab}`}
              onCopy={() => copy(`story-${storyTab}`, STORY_CODE_SNIPPETS[storyTab])}
            />
          </div>
        </section>

        <section ref={blackHoleStageRef} className="flex min-h-[78vh] items-center justify-end py-20">
          <div className="w-full max-w-md">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-[#3ee98a]">
              03 · Singularity Choreography
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl leading-[1.1]">
              Dwell, momentum &amp; zero-hitch shaders.
            </h2>
            <ul className="mt-5 space-y-3 text-xs leading-relaxed text-zinc-400">
              <li>
                <strong className="text-white">Dwell &amp; quintic easing</strong> — locks each shape while visitors read, then transitions smoothly.
              </li>
              <li>
                <strong className="text-white">Scroll-velocity energy</strong> — fast flicks inject liquid GPU flow turbulence that settles when stopped.
              </li>
              <li>
                <strong className="text-white">Idle shader pre-warming</strong> — adjacent stage pairs compile in idle frames for zero first-scroll stutter.
              </li>
            </ul>
            <div className="mt-6 flex gap-5 text-[11px] font-mono uppercase tracking-wider text-zinc-300">
              <button onClick={() => onNavigate('docs')} className="hover:text-[#3ee98a] transition cursor-pointer">
                Scroll Story Docs →
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Motion.dev-Style Full-Bleed Interactive Stages + Mint Stats Block */}
      <div ref={interactiveZoneRef} className="relative z-10 border-t border-white/10 bg-[#08080a]">
        {/* Stage A: Shape Morphing (Motion.dev Gallery layout) */}
        <section className="mx-auto max-w-7xl border-b border-white/10 px-6 py-16 sm:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">Shape Morphing</h2>
            <button
              onClick={() => copy('morph', `const fx = sphere('#hero', { bloom: 0.45 })\nawait fx.morphTo('${morphTab}', { duration: 0.85 })`)}
              className="inline-flex items-center gap-1.5 border border-white/15 bg-black px-3 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/35 hover:text-white transition cursor-pointer"
            >
              {copiedKey === 'morph' ? <Check className="h-3 w-3 text-[#3ee98a]" /> : <Copy className="h-3 w-3" />}
              <span>{copiedKey === 'morph' ? 'Copied' : `morphTo('${morphTab}')`}</span>
            </button>
          </div>

          <div className="relative h-[460px] w-full overflow-hidden">
            <GlowCanvas
              ref={morphFxRef}
              type="sphere"
              className="h-full w-full"
              options={{
                palette: 'ember',
                count: 20000,
                bloom: 0.5,
                clickBurst: true,
                trailMemory: 0.5,
                pointerTarget: 'container'
              }}
            />

            <span className="pointer-events-none absolute bottom-4 left-0 bg-[#3ee98a] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-black">
              DUAL-SHADER GPU MORPHING
            </span>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 border border-white/15 bg-black/90 p-1 backdrop-blur-md">
              {MORPH_TABS.map((t) => {
                const active = morphTab === t.id
                return (
                  <button
                    key={t.id}
                    onClick={() => switchMorphShowcase(t.id, t.palette)}
                    className={`relative px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase transition cursor-pointer ${
                      active ? 'text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="home-morph-pill"
                        transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                        className="absolute inset-0 bg-white"
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => onNavigate('playground')}
              className="absolute bottom-4 right-0 hidden font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white transition sm:inline-flex cursor-pointer"
            >
              Open in Studio →
            </button>
          </div>
        </section>

        {/* Stage B: Physics & 360° Orbit */}
        <section className="mx-auto max-w-7xl border-b border-white/10 px-6 py-16 sm:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">Physics &amp; 360° Orbit</h2>
            <button
              onClick={() => copy('gesture', `<TorusKnot palette="${physicsPalette}" bloom={0.5} holdCharge orbit trailMemory={0.6} />`)}
              className="inline-flex items-center gap-1.5 border border-white/15 bg-black px-3 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/35 hover:text-white transition cursor-pointer"
            >
              {copiedKey === 'gesture' ? <Check className="h-3 w-3 text-[#3ee98a]" /> : <Copy className="h-3 w-3" />}
              <span>{copiedKey === 'gesture' ? 'Copied' : '<TorusKnot holdCharge orbit />'}</span>
            </button>
          </div>

          <div className="relative h-[460px] w-full overflow-hidden">
            <GlowCanvas
              type="torusKnot"
              className="h-full w-full"
              options={{
                palette: physicsPalette,
                count: 20000,
                bloom: 0.55,
                holdCharge: true,
                orbit: true,
                clickBurst: true,
                trailMemory: 0.6,
                pointerTarget: 'container'
              }}
            />

            <span className="pointer-events-none absolute bottom-4 left-0 bg-[#f5e11c] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-black">
              HOLD TO IMPLODE · DRAG TO ORBIT
            </span>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 border border-white/15 bg-black/90 p-1 backdrop-blur-md">
              {(['sunset', 'ember', 'mono', 'neon'] as const).map((pal) => (
                <button
                  key={pal}
                  onClick={() => setPhysicsPalette(pal)}
                  className={`px-3.5 py-1.5 font-mono text-[10px] font-bold tracking-[0.12em] uppercase transition cursor-pointer ${
                    physicsPalette === pal ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {pal}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('examples')}
              className="absolute bottom-4 right-0 hidden font-mono text-[11px] uppercase tracking-wider text-zinc-400 hover:text-white transition sm:inline-flex cursor-pointer"
            >
              All 43 Examples →
            </button>
          </div>
        </section>

        {/* Stage C: Logo / Image to Particles */}
        <section className="mx-auto max-w-7xl px-6 py-16 sm:px-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-white">Logo &amp; Image to Particles</h2>
            <button
              onClick={() => copy('logo', `import { logo } from 'glowdots'\nlogo('#brand', { source: '/logo.svg', preserveColors: ${preserveColors}, bloom: 0.45 })`)}
              className="inline-flex items-center gap-1.5 border border-white/15 bg-black px-3 py-1.5 font-mono text-[11px] text-zinc-300 hover:border-white/35 hover:text-white transition cursor-pointer"
            >
              {copiedKey === 'logo' ? <Check className="h-3 w-3 text-[#3ee98a]" /> : <Copy className="h-3 w-3" />}
              <span>{copiedKey === 'logo' ? 'Copied' : 'logo("#brand")'}</span>
            </button>
          </div>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleLogoFile(e.dataTransfer.files?.[0])
            }}
            className="relative h-[460px] w-full overflow-hidden"
          >
            <GlowCanvas
              type="logo"
              className="h-full w-full"
              options={{
                source: logoSource,
                preserveColors,
                count: 20000,
                bloom: 0.45,
                clickBurst: true,
                trailMemory: 0.6,
                pointerTarget: 'container'
              }}
            />

            <span className="pointer-events-none absolute bottom-4 left-0 bg-[#3ee98a] px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-black">
              DRAG &amp; DROP PNG / SVG
            </span>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-wrap items-center gap-1 border border-white/15 bg-black/90 p-1 backdrop-blur-md">
              {LOGO_SAMPLES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => {
                    setLogoSource(s.svg)
                    setLogoLabel(s.label)
                  }}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase transition cursor-pointer ${
                    logoLabel === s.label ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <label className="inline-flex cursor-pointer items-center gap-1.5 bg-[#f5e11c] px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.1em] uppercase text-black hover:bg-[#ffe938] transition">
                <Upload className="h-3 w-3" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*,.svg"
                  className="hidden"
                  onChange={(e) => handleLogoFile(e.target.files?.[0])}
                />
              </label>
            </div>

            <button
              onClick={() => setPreserveColors((v) => !v)}
              className="absolute bottom-4 right-0 hidden border border-white/15 bg-black px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-zinc-300 hover:border-white/35 sm:inline-flex cursor-pointer"
            >
              RGB: {preserveColors ? 'Original' : 'Palette'}
            </button>
          </div>
        </section>

        {/* Bold Motion.dev-style #3ee98a Mint Metrics & CTA Block */}
        <section className="mx-auto max-w-7xl px-6 pb-24 pt-6 sm:px-10">
          <div className="bg-[#3ee98a] p-8 text-black sm:p-12">
            <div className="mb-10 flex items-center gap-2">
              <div className="inline-flex h-8 w-8 items-center justify-center bg-black text-white">
                <LogoMark className="h-5 w-5" />
              </div>
              <span className="border border-black/30 px-2 py-1 font-mono text-xs font-bold">+</span>
            </div>

            <div className="grid gap-8 border-black/15 sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-black/15">
              <div className="lg:pr-6">
                <div className="text-4xl font-bold tracking-tight sm:text-5xl">43+</div>
                <div className="mt-2 text-xs font-medium text-black/75">GPU Particle Shapes</div>
              </div>
              <div className="lg:px-6">
                <div className="text-4xl font-bold tracking-tight sm:text-5xl">18.7 kB</div>
                <div className="mt-2 text-xs font-medium text-black/75">Core Brotli Bundle</div>
              </div>
              <div className="lg:px-6">
                <div className="text-4xl font-bold tracking-tight sm:text-5xl">60fps</div>
                <div className="mt-2 text-xs font-medium text-black/75">WebGL2 Dual-Shader</div>
              </div>
              <div className="lg:pl-6">
                <div className="text-4xl font-bold tracking-tight sm:text-5xl">3</div>
                <div className="mt-2 text-xs font-medium text-black/75">React · JS · Web Component</div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('playground')}
                className="inline-flex items-center gap-3 bg-black px-5 py-3 font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-white hover:bg-zinc-900 transition cursor-pointer"
              >
                <span>Explore Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onNavigate('docs')}
                className="inline-flex items-center gap-3 border border-black/25 px-5 py-3 font-mono text-[11px] font-bold tracking-[0.12em] uppercase text-black hover:bg-black/5 transition cursor-pointer"
              >
                <span>Read Docs</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Minimal Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-[#08080a] py-10">
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
