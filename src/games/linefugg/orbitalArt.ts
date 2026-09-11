import Phaser from 'phaser'

const IMPORTED_WEBP_RUNTIME = new Set([
  '/assets/imported/linefugg/ui/orbital-board.png',
  '/assets/imported/linefugg/props/orbital-armillary-key.png',
  '/assets/imported/linefugg/ui/orbital-cell-multiply-v3.png',
  '/assets/imported/linefugg/ui/orbital-cell-divide-v3.png',
  '/assets/imported/linefugg/ui/orbital-validate-ready-v5.png',
  '/assets/imported/linefugg/ui/orbital-validate-disabled-v5.png',
  '/assets/imported/linefugg/ui/orbital-history-row-v5.png',
])

function runtimeAssetUrl(url: string) {
  return IMPORTED_WEBP_RUNTIME.has(url) ? url.replace(/\.png$/i, '.webp') : url
}

/** Load the optimized runtime derivative when one exists, then keep the same
 * display-resolution cap for generated PNG fallbacks. Canonical sources stay untouched.
 */
export class OrbitalImageFile extends Phaser.Loader.FileTypes.ImageFile {
  constructor(loader: Phaser.Loader.LoaderPlugin, key: string, url: string, private readonly maxEdge: number) {
    super(loader, key, runtimeAssetUrl(url))
  }

  onProcess() {
    this.state = Phaser.Loader.FILE_PROCESSING
    const source = new Image()
    if (!this.xhrLoader) { this.onProcessError(); return }
    const url = URL.createObjectURL(this.xhrLoader.response as Blob)
    source.onload = () => {
      URL.revokeObjectURL(url)
      const ratio = Math.min(1, this.maxEdge / Math.max(source.width, source.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(source.width * ratio)
      canvas.height = Math.round(source.height * ratio)
      const context = canvas.getContext('2d')
      if (!context) { this.onProcessError(); return }
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(source, 0, 0, canvas.width, canvas.height)
      this.data = canvas
      this.onProcessComplete()
    }
    source.onerror = () => { URL.revokeObjectURL(url); this.onProcessError() }
    source.src = url
  }
}

/** Frame coordinates are measured in the untouched original, not alpha margins. */
export function artFrame(scene: Phaser.Scene, key: string, name: string, rect: readonly number[], sourceWidth: number) {
  const texture = scene.textures.get(key)
  if (!texture.has(name)) {
    const ratio = texture.getSourceImage().width / sourceWidth
    const [x, y, width, height] = rect.map(value => Math.round(value * ratio))
    texture.add(name, 0, x, y, width, height)
  }
  return name
}

export function fitText(text: Phaser.GameObjects.Text, width: number) {
  text.setScale(Math.min(1, width / Math.max(1, text.width)))
}

/** Center visible glyph pixels rather than the font's asymmetric line box.
 * Called only when score text changes, never in the animation loop. */
export function centerTextInk(text: Phaser.GameObjects.Text) {
  const { width, height } = text.canvas
  const pixels = text.context.getImageData(0, 0, width, height).data
  let top = height, bottom = -1
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] > 32) { top = Math.min(top, y); bottom = y; break }
    }
  }
  if (bottom >= top) text.setOrigin(0.5, (top + bottom + 1) / (2 * height))
}
