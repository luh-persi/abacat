import { useState, useEffect } from 'react'

/**
 * Removes the white background from the mascot PNG using canvas API.
 * Works with both white-background and transparent-background PNGs.
 */
export function useMascotImage(src: string): string {
  const [processed, setProcessed] = useState<string>(src)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        // Already transparent — skip
        if (data[i + 3] < 10) continue

        // Pure white or near-white → fully transparent
        if (r > 245 && g > 245 && b > 245) {
          data[i + 3] = 0
          continue
        }

        // Soft anti-aliased edge zone → semi-transparent
        if (r > 220 && g > 220 && b > 220) {
          const brightness = (r + g + b) / 3
          const alpha = Math.round(((255 - brightness) / 35) * 255)
          data[i + 3] = Math.max(0, Math.min(255, alpha))
        }
      }

      ctx.putImageData(imageData, 0, 0)
      setProcessed(canvas.toDataURL('image/png'))
    }

    img.onerror = () => setProcessed(src)
    img.src = src
  }, [src])

  return processed
}
