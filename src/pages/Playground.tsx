import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Copy,
  MousePointerClick,
  Pause,
  Play,
  RotateCcw,
  Shapes,
  Upload,
  Wand2
} from 'lucide-react'
import { PALETTES, effectDefs, type EffectInstance } from 'glowdots'
import { shapeDefs } from 'glowdots/shapes'
import { ALL_EFFECT_DEFS, GlowCanvas, getDefaultsForShape } from '../components/GlowCanvas'

type InspectorTab = 'shape' | 'physics' | 'polish' | 'export'

const SHAPE_SLIDERS: Record<string, [number, number, number]> = {
  band: [0, 0.3, 0.01], turbulence: [0, 2, 0.05], rim: [0, 1, 0.05],
  arms: [1, 8, 1], twist: [0, 8, 0.1], thickness: [0, 3, 0.1],
  rings: [1, 10, 1], spread: [0.2, 3, 0.1],
  amplitude: [0, 0.8, 0.02], frequency: [0.5, 6, 0.1],
  p: [1, 7, 1], q: [1, 7, 1], tube: [0.3, 3, 0.1],
  ribbons: [1, 10, 1], flowSpeed: [0, 3, 0.1],
  depth: [0.1, 3, 0.05], spin: [0, 3, 0.1],
  roughness: [0, 2, 0.05], ridges: [1, 8, 1],
  m: [1, 20, 1], n1: [0.1, 5, 0.1], n2: [0.1, 5, 0.1], n3: [0.1, 5, 0.1],
  curl: [0, 3, 0.1], morph: [0, 1, 0.01], threshold: [0.05, 0.85, 0.05]
}

const ALL_SHAPE_NAMES = Object.keys(ALL_EFFECT_DEFS)

const DEFAULT_CFG: Record<string, any> = {
  clickBurst: true,
  trailMemory: 0.6,
  bloom: 0.45
}

interface PlaygroundProps {
  initialType?: string
  initialOptions?: Record<string, any>
}

export function Playground({ initialType = 'sphere', initialOptions }: PlaygroundProps) {
  const fxRef = useRef<EffectInstance | null>(null)
  const [type, setType] = useState<string>(initialType)
  const [cfg, setCfg] = useState<Record<string, any>>(initialOptions ?? DEFAULT_CFG)
  const [tab, setTab] = useState<InspectorTab>('shape')
  const [paused, setPaused] = useState(false)
  const [morphing, setMorphing] = useState(false)
  const [copyFramework, setCopyFramework] = useState<'react' | 'vanilla' | 'element'>('react')
  const [copied, setCopied] = useState(false)

  const defaults = getDefaultsForShape(type)
  const val = (k: string) => (cfg[k] !== undefined ? cfg[k] : defaults[k])
  const setOpt = (k: string, v: any) => setCfg((prev) => ({ ...prev, [k]: v }))

  const isLightMode =
    val('blend') === 'normal' && ['daylight', 'frost', 'earth'].includes(val('palette'))

  const togglePause = () => {
    if (!fxRef.current) return
    if (paused) fxRef.current.resume()
    else fxRef.current.pause()
    setPaused(!paused)
  }

  const handleMorph = async (targetName: string) => {
    const targetDef = ALL_EFFECT_DEFS[targetName]
    if (!fxRef.current || !targetDef || morphing) return
    if (paused) {
      fxRef.current.resume()
      setPaused(false)
    }
    setMorphing(true)
    try {
      await fxRef.current.morphTo(targetDef, { duration: 0.7 })
      setType(targetName)
    } finally {
      setMorphing(false)
    }
  }

  const stepCarousel = (dir: -1 | 1) => {
    const idx = ALL_SHAPE_NAMES.indexOf(type)
    const nextIdx = (idx + dir + ALL_SHAPE_NAMES.length) % ALL_SHAPE_NAMES.length
    handleMorph(ALL_SHAPE_NAMES[nextIdx])
  }

  const buildCode = () => {
    const clean: Record<string, any> = {}
    for (const [k, v] of Object.entries(cfg)) {
      if (defaults[k] !== v && v !== 0 && v !== false) clean[k] = v
    }
    const isShape = type in shapeDefs
    const pkg = isShape ? 'glowdots/shapes' : 'glowdots'
    if (copyFramework === 'vanilla') {
      return `import { ${type} } from '${pkg}'\n\n${type}('#hero', ${JSON.stringify(clean, null, 2)})`
    }
    if (copyFramework === 'react') {
      const comp = type.charAt(0).toUpperCase() + type.slice(1)
      if (isShape) {
        return `import { useEffect, useRef } from 'react'\nimport { mountEffect } from 'glowdots'\nimport { ${type}Def } from 'glowdots/shapes'\n\n// Inside component:\nmountEffect(${type}Def, ref.current, ${JSON.stringify(clean, null, 2)})`
      }
      const props = Object.entries(clean)
        .map(([k, v]) => (typeof v === 'string' ? `${k}="${v}"` : v === true ? k : `${k}={${JSON.stringify(v)}}`))
        .join('\n  ')
      return `import { ${comp} } from 'glowdots/react'\n\n<${comp}\n  ${props}\n  style={{ height: '100vh' }}\n/>`
    }
    const attrs = Object.entries(clean)
      .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}="${String(v)}"`)
      .join(' ')
    return `<script type="module">import 'https://esm.sh/glowdots/element'</script>\n<glow-dots type="${type}" ${attrs} style="height:100vh"></glow-dots>`
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const shapeKeys = Object.keys(SHAPE_SLIDERS).filter((k) => k in defaults)
  const coreNames = Object.keys(effectDefs)
  const packNames = Object.keys(shapeDefs)

  return (
    <div className="grid h-[calc(100vh-4rem)] grid-cols-1 grid-rows-[46vh_1fr] lg:grid-rows-1 lg:grid-cols-[1fr_360px] overflow-hidden">
      {/* Stage Canvas */}
      <div className={`relative overflow-hidden transition-colors duration-300 ${isLightMode ? 'bg-zinc-100' : 'bg-[#050507]'}`}>
        <GlowCanvas
          ref={fxRef}
          type={type}
          options={{ ...cfg, pointerTarget: 'container' }}
          className="h-full w-full"
        />

        {/* Minimal Floating Play/Pause Control */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={togglePause}
          className="absolute left-5 top-5 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/60 text-zinc-300 backdrop-blur-md hover:border-white/25 hover:text-white transition cursor-pointer"
          title={paused ? 'Resume' : 'Pause'}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>

        {/* Sleek Floating Shape Carousel */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute bottom-6 left-1/2 z-20 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/15 bg-black/80 p-1.5 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => stepCarousel(-1)}
            disabled={morphing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-200 hover:bg-white hover:text-black disabled:opacity-40 transition cursor-pointer"
            title="Previous shape"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <div className="flex min-w-[160px] flex-col items-center px-3 text-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={type}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
                className="text-xs font-semibold tracking-wide text-white"
              >
                {type}
              </motion.span>
            </AnimatePresence>
            <span className="font-mono text-[9px] text-zinc-500">
              {ALL_SHAPE_NAMES.indexOf(type) + 1} / {ALL_SHAPE_NAMES.length}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => stepCarousel(1)}
            disabled={morphing}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400 text-black hover:bg-cyan-300 disabled:opacity-40 transition cursor-pointer"
            title="Next shape"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Organized Tabbed Studio Inspector */}
      <aside className="flex flex-col overflow-hidden border-t border-white/10 bg-[#0b0b0e] lg:border-l lg:border-t-0">
        {/* Inspector Tabs */}
        <div className="grid grid-cols-4 border-b border-white/10 bg-[#0e0e12] p-1.5 gap-1">
          {[
            { id: 'shape', label: 'Shape', icon: Shapes },
            { id: 'physics', label: 'Physics', icon: MousePointerClick },
            { id: 'polish', label: 'Polish', icon: Wand2 },
            { id: 'export', label: 'Export', icon: Code2 }
          ].map((t) => {
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as InspectorTab)}
                className={`relative flex flex-col items-center gap-1 rounded-lg py-2 text-[10px] font-medium transition cursor-pointer ${
                  active ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="studio-tab-bg"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    className="absolute inset-0 rounded-lg bg-white/10 border border-white/10"
                  />
                )}
                <t.icon className={`relative z-10 h-3.5 w-3.5 ${active ? 'text-cyan-400' : ''}`} />
                <span className="relative z-10">{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {tab === 'shape' && (
            <>
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-400">Active Shape</label>
                  <span className="font-mono text-[10px] text-zinc-500">43 total</span>
                </div>
                <select
                  value={type}
                  onChange={(e) => handleMorph(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#141418] px-3 py-2.5 text-xs font-medium text-white outline-none focus:border-cyan-400/50"
                >
                  <optgroup label="Core Effects (13)">
                    {coreNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </optgroup>
                  <optgroup label="glowdots/shapes (30)">
                    {packNames.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Visual Palette Swatch Picker */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[11px] font-medium text-zinc-400">Palette</label>
                  <span className="font-mono text-[10px] text-cyan-400">{val('palette')}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PALETTES).map(([name, colors]) => {
                    const active = val('palette') === name
                    return (
                      <button
                        key={name}
                        onClick={() => setOpt('palette', name)}
                        className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition cursor-pointer ${
                          active
                            ? 'border-cyan-400 bg-cyan-400/10 text-white'
                            : 'border-white/10 bg-[#141418] text-zinc-400 hover:border-white/25'
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-white/20"
                          style={{
                            background: `linear-gradient(135deg, ${colors[0]}, ${colors[Math.min(2, colors.length - 1)]})`
                          }}
                        />
                        <span className="truncate text-[11px] font-medium">{name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Blend Mode Segmented Control */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-zinc-400">Background Blend</label>
                <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-white/10 bg-[#141418] p-1">
                  {[
                    { id: 'additive', label: 'Dark (Additive)' },
                    { id: 'normal', label: 'Light (Normal)' }
                  ].map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setOpt('blend', b.id)}
                      className={`rounded-lg py-1.5 text-[11px] font-medium transition cursor-pointer ${
                        val('blend') === b.id ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Text / Logo Controls */}
              {type === 'text' && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                  <label className="block text-[11px] font-medium text-zinc-300">Text String</label>
                  <input
                    type="text"
                    value={val('text') ?? 'FX'}
                    onChange={(e) => setOpt('text', e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white outline-none focus:border-cyan-400/50"
                  />
                  <SliderRow label="fontSize" min={60} max={300} step={10} value={val('fontSize') ?? 180} onChange={(v) => setOpt('fontSize', v)} />
                </div>
              )}

              {type === 'logo' && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                  <ToggleRow label="Preserve RGB colors" checked={val('preserveColors') ?? true} onChange={(v) => setOpt('preserveColors', v)} />
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-white/20 bg-black/40 px-3 py-2.5 text-xs text-zinc-300 hover:border-cyan-400/60 hover:text-white transition">
                    <Upload className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Upload PNG / SVG / WebP</span>
                    <input
                      type="file"
                      accept="image/*,.svg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (!f) return
                        const reader = new FileReader()
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setOpt('source', reader.result)
                        }
                        reader.readAsDataURL(f)
                      }}
                    />
                  </label>
                </div>
              )}

              {/* Shape-specific parameters */}
              {shapeKeys.length > 0 && (
                <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Shape Parameters</p>
                  {shapeKeys.map((k) => {
                    const [min, max, step] = SHAPE_SLIDERS[k]
                    return <SliderRow key={k} label={k} min={min} max={max} step={step} value={val(k)} onChange={(v) => setOpt(k, v)} />
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'physics' && (
            <>
              <div>
                <label className="mb-2 block text-[11px] font-medium text-zinc-400">Cursor Mode</label>
                <div className="grid grid-cols-5 gap-1 rounded-xl border border-white/10 bg-[#141418] p-1">
                  {['repel', 'attract', 'swirl', 'ripple', 'none'].map((m) => (
                    <button
                      key={m}
                      onClick={() => setOpt('interaction', m)}
                      className={`rounded-lg py-1.5 text-[10px] font-medium capitalize transition cursor-pointer ${
                        val('interaction') === m ? 'bg-cyan-400 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                <SliderRow label="interactionStrength" min={0} max={2} step={0.05} value={val('interactionStrength')} onChange={(v) => setOpt('interactionStrength', v)} />
                <SliderRow label="interactionRadius" min={0.1} max={1} step={0.02} value={val('interactionRadius')} onChange={(v) => setOpt('interactionRadius', v)} />
                <SliderRow label="trailMemory" min={0} max={3} step={0.1} value={val('trailMemory') ?? 0} onChange={(v) => setOpt('trailMemory', v)} />
                <SliderRow label="speed" min={0} max={3} step={0.05} value={val('speed')} onChange={(v) => setOpt('speed', v)} />
                <SliderRow label="rotationSpeed" min={0} max={0.5} step={0.01} value={val('rotationSpeed')} onChange={(v) => setOpt('rotationSpeed', v)} />
              </div>

              <div className="space-y-2 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-500">Interactive Features</p>
                <ToggleRow label="Click shockwave" checked={Boolean(val('clickBurst'))} onChange={(v) => setOpt('clickBurst', v)} />
                <ToggleRow label="Hold to charge" checked={Boolean(val('holdCharge'))} onChange={(v) => setOpt('holdCharge', v)} />
                <ToggleRow label="360° Drag Orbit" checked={Boolean(val('orbit'))} onChange={(v) => setOpt('orbit', v)} />
                <ToggleRow label="Orbit wheel zoom" checked={Boolean(val('orbitZoom'))} onChange={(v) => setOpt('orbitZoom', v)} />
                <ToggleRow label="Idle ghost cursor" checked={val('idleMotion') ?? true} onChange={(v) => setOpt('idleMotion', v)} />
              </div>
            </>
          )}

          {tab === 'polish' && (
            <>
              <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Particles</p>
                <SliderRow label="count" min={1000} max={100000} step={500} value={val('count')} onChange={(v) => setOpt('count', v)} />
                <SliderRow label="size" min={0.5} max={5} step={0.1} value={val('size')} onChange={(v) => setOpt('size', v)} />
                <SliderRow label="intensity" min={0.2} max={3} step={0.05} value={val('intensity')} onChange={(v) => setOpt('intensity', v)} />
                <SliderRow label="softness" min={0} max={1} step={0.05} value={val('softness')} onChange={(v) => setOpt('softness', v)} />
                <SliderRow label="scale" min={0.5} max={2} step={0.05} value={val('scale')} onChange={(v) => setOpt('scale', v)} />
              </div>

              <div className="space-y-3 rounded-xl border border-white/10 bg-[#121216] p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Post-Processing &amp; Optical</p>
                <SliderRow label="bloom" min={0} max={2} step={0.05} value={val('bloom') ?? 0} onChange={(v) => setOpt('bloom', v)} />
                <SliderRow label="bloomRadius" min={1} max={24} step={1} value={val('bloomRadius') ?? 8} onChange={(v) => setOpt('bloomRadius', v)} />
                <SliderRow label="depthOfField" min={0} max={1.5} step={0.05} value={val('depthOfField') ?? 0} onChange={(v) => setOpt('depthOfField', v)} />
                <SliderRow label="vignette" min={0} max={1} step={0.05} value={val('vignette') ?? 0} onChange={(v) => setOpt('vignette', v)} />
                <SliderRow label="grain" min={0} max={0.5} step={0.01} value={val('grain') ?? 0} onChange={(v) => setOpt('grain', v)} />
                <ToggleRow label="Color drift" checked={Boolean(val('colorDrift'))} onChange={(v) => setOpt('colorDrift', v)} />
              </div>
            </>
          )}

          {tab === 'export' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-white/10 bg-[#141418] p-1 text-[11px]">
                {(['react', 'vanilla', 'element'] as const).map((fw) => (
                  <button
                    key={fw}
                    onClick={() => setCopyFramework(fw)}
                    className={`rounded-lg py-1.5 font-medium capitalize transition cursor-pointer ${
                      copyFramework === fw ? 'bg-cyan-400 text-black font-semibold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {fw === 'element' ? '<glow-dots>' : fw}
                  </button>
                ))}
              </div>

              <pre className="overflow-x-auto rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-[11px] leading-relaxed text-zinc-200">
                <code>{buildCode()}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="flex items-center gap-2 border-t border-white/10 bg-[#0e0e12] p-3.5">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-400 py-2.5 text-xs font-bold text-black hover:bg-cyan-300 transition cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied Snippet!' : `Copy ${copyFramework} Code`}
          </motion.button>
          <button
            onClick={() => setCfg(DEFAULT_CFG)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
            title="Reset to defaults"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </div>
  )
}

function SliderRow({
  label,
  min,
  max,
  step,
  value,
  onChange
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  const display = Number.isInteger(step) ? Math.round(value) : Number(value).toFixed(2)
  return (
    <div>
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="text-zinc-400">{label}</span>
        <span className="font-mono text-[10px] text-cyan-400">{display}</span>
      </div>
      <input
        type="range"
        className="studio-range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

function ToggleRow({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-0.5 text-[11px] text-zinc-300">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer ${
          checked ? 'bg-cyan-500' : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}
