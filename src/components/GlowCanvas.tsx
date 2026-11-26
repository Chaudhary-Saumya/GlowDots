import { forwardRef, useEffect, useRef, type CSSProperties } from 'react'
import { COMMON_DEFAULTS, effectDefs, mountEffect, type EffectDef, type EffectInstance } from 'glowdots'
import { shapeDefs } from 'glowdots/shapes'

export const ALL_EFFECT_DEFS: Record<string, EffectDef> = {
  ...effectDefs,
  ...shapeDefs
}

export function getDefaultsForShape(name: string): Record<string, any> {
  const def = ALL_EFFECT_DEFS[name]
  return { ...COMMON_DEFAULTS, ...(def?.defaults || {}) }
}

interface GlowCanvasProps {
  type: string
  options?: Record<string, any>
  className?: string
  style?: CSSProperties
  onReady?: (instance: EffectInstance) => void
}

export const GlowCanvas = forwardRef<EffectInstance | null, GlowCanvasProps>(
  ({ type, options = {}, className = '', style, onReady }, ref) => {
    const hostRef = useRef<HTMLDivElement>(null)
    const instRef = useRef<EffectInstance | null>(null)
    const latestOpts = useRef(options)
    latestOpts.current = options

    useEffect(() => {
      const el = hostRef.current
      const def = ALL_EFFECT_DEFS[type] ?? effectDefs.sphere
      if (!el || !def) return

      // If the live instance already morphed to `type` via morphTo(), keep it alive without remounting (zero flash).
      if (instRef.current && instRef.current.canvas?.getAttribute('data-glowdots') === type) {
        return
      }

      instRef.current?.destroy()
      const inst = mountEffect(def, el, latestOpts.current)
      instRef.current = inst
      if (typeof ref === 'function') ref(inst)
      else if (ref) ref.current = inst
      onReady?.(inst)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type])

    useEffect(() => {
      return () => {
        instRef.current?.destroy()
        instRef.current = null
        if (typeof ref === 'function') ref(null)
        else if (ref) ref.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const optsKey = JSON.stringify(options, (_k, v) => (typeof v === 'function' ? undefined : v))
    useEffect(() => {
      instRef.current?.update(latestOpts.current)
    }, [optsKey])

    return <div ref={hostRef} className={className} style={{ position: 'relative', ...style }} />
  }
)

GlowCanvas.displayName = 'GlowCanvas'
