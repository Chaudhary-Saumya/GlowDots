import { useEffect, useRef } from 'react'
import { PALETTES, mulberry32 } from 'glowdots'
import { ALL_EFFECT_DEFS, getDefaultsForShape } from './GlowCanvas'

const snapshotCache = new Map<string, string>()

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function renderShapeSnapshot(id: string, paletteName: string): string {
  const key = `${id}::${paletteName}`
  const cached = snapshotCache.get(key)
  if (cached) return cached

  const def = ALL_EFFECT_DEFS[id]
  if (!def) return ''

  const w = 480
  const h = 300
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const defaults = getDefaultsForShape(id)
  const palColors = (PALETTES[paletteName] || PALETTES.ember).map(hexToRgb)

  // Subtle radial ambient backdrop
  const mid = palColors[Math.min(1, palColors.length - 1)]
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, w * 0.48)
  bgGrad.addColorStop(0, `rgba(${mid[0]}, ${mid[1]}, ${mid[2]}, 0.14)`)
  bgGrad.addColorStop(1, 'rgba(6, 6, 8, 0)')
  ctx.fillStyle = '#060608'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = bgGrad
  ctx.fillRect(0, 0, w, h)

  const n = 2600
  const pts: Array<[number, number, number, number, number, number, number]> = []
  const rnd = mulberry32(defaults.seed ?? 1337)
  def.generate(n, defaults, rnd, (x, y, z, kind = 0, r = -1, g = -1, b = -1) => {
    pts.push([x, y, z, kind, r, g, b])
  })

  const pitch = defaults.tilt ?? 0.25
  const yaw = 0.45
  const cy = Math.cos(yaw), sy = Math.sin(yaw)
  const cp = Math.cos(pitch), sp = Math.sin(pitch)
  const scale = (defaults.scale ?? 1) * 0.92
  const camZ = 3.2
  const focal = 2.7475
  const halfH = h * 0.5

  ctx.globalCompositeOperation = 'lighter'

  for (let i = 0; i < pts.length; i++) {
    const [bx, by, bz, kind, cr, cg, cb] = pts[i]
    const px = bx * scale
    const py = by * scale
    const pz = bz * scale

    // rotY then rotX
    const rx = cy * px + sy * pz
    const rz0 = -sy * px + cy * pz
    const ry = cp * py - sp * rz0
    const rz = sp * py + cp * rz0

    const dist = Math.max(0.4, camZ - rz)
    const sx = (rx * focal) / dist
    const syScreen = (ry * focal) / dist

    const cx = w * 0.5 + sx * halfH
    const cyScreen = h * 0.5 - syScreen * halfH
    if (cx < -10 || cx > w + 10 || cyScreen < -10 || cyScreen > h + 10) continue

    let R: number, G: number, B: number
    if (cr >= 0) {
      R = Math.round(cr * 255)
      G = Math.round(cg * 255)
      B = Math.round(cb * 255)
    } else {
      const t = Math.max(0, Math.min(1, kind > 0 ? kind : (rx * 0.45 + 0.5)))
      const f = t * (palColors.length - 1)
      const i0 = Math.floor(f)
      const i1 = Math.min(i0 + 1, palColors.length - 1)
      const frac = f - i0
      R = Math.round(palColors[i0][0] + (palColors[i1][0] - palColors[i0][0]) * frac)
      G = Math.round(palColors[i0][1] + (palColors[i1][1] - palColors[i0][1]) * frac)
      B = Math.round(palColors[i0][2] + (palColors[i1][2] - palColors[i0][2]) * frac)
    }

    const depthAlpha = Math.max(0.18, Math.min(0.85, (rz + 1.2) * 0.35))
    const radius = Math.max(0.8, (1.1 + rnd() * 0.9) * (camZ / dist))
    ctx.fillStyle = `rgba(${R}, ${G}, ${B}, ${depthAlpha.toFixed(2)})`
    ctx.beginPath()
    ctx.arc(cx, cyScreen, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const url = canvas.toDataURL('image/png')
  snapshotCache.set(key, url)
  return url
}

export function ShapeSnapshot({ id, palette }: { id: string; palette: string }) {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const url = renderShapeSnapshot(id, palette)
    if (imgRef.current && url) {
      imgRef.current.src = url
    }
  }, [id, palette])

  return (
    <img
      ref={imgRef}
      alt={id}
      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
    />
  )
}
