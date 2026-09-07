import Phaser from 'phaser'

/** Decode the canonical source once, upload only the useful display resolution.
 * Source files stay untouched. Scene restarts reuse the texture cache.
 */
export class OrbitalImageFile extends Phaser.Loader.FileTypes.ImageFile {
  constructor(loader: Phaser.Loader.LoaderPlugin, key: string, url: string, private readonly maxEdge: number) {
    super(loader, key, url)
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
