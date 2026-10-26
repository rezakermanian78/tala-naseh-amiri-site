/**
 * Resizes an image in the browser and re-encodes it as WebP (JPEG on browsers that can't
 * encode WebP), so uploads stay small no matter what the phone camera produced.
 */
export async function compressImage(
  file: File,
  maxSize = 1600,
  quality = 0.85,
): Promise<{ blob: Blob; ext: 'webp' | 'jpg' }> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode() // modern browsers apply the photo's EXIF rotation here

    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas is not available')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, w, h)

    const encode = (type: string) =>
      new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
    const webp = await encode('image/webp')
    if (webp && webp.type === 'image/webp') return { blob: webp, ext: 'webp' }
    const jpeg = await encode('image/jpeg')
    if (!jpeg) throw new Error('Could not process the image')
    return { blob: jpeg, ext: 'jpg' }
  } finally {
    URL.revokeObjectURL(url)
  }
}
