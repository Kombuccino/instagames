import Phaser from 'phaser'

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
