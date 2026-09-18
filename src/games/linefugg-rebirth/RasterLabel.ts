import Phaser from 'phaser'
import { ATLAS_KEY, FRAMES, GLYPHS } from './art'

/** Phaser Canvas does not tint images: bake just the glyph once; preserve its source alpha. */
export function tintImage(scene: Phaser.Scene, image: Phaser.GameObjects.Image, frameName: string, tint: number) {
  if (scene.game.renderer.type !== Phaser.CANVAS) return image.setTexture(ATLAS_KEY, frameName).setTint(tint)
  const key = `rebirth-ink:${frameName}:${tint.toString(16)}`
  if (!scene.textures.exists(key)) {
    const frame = scene.textures.getFrame(ATLAS_KEY, frameName)
    const canvas = scene.textures.createCanvas(key, frame.cutWidth, frame.cutHeight)
    if (!canvas) throw new Error(`Cannot create bitmap glyph ${frameName}`)
    const context = canvas.getContext()
    context.drawImage(frame.source.image as HTMLImageElement, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight)
    context.globalCompositeOperation = 'source-in'
    context.fillStyle = `#${tint.toString(16).padStart(6, '0')}`
    context.fillRect(0, 0, frame.cutWidth, frame.cutHeight)
    context.globalCompositeOperation = 'source-over'
    canvas.refresh()
  }
  return image.setTexture(key).clearTint()
}

export class RasterLabel extends Phaser.GameObjects.Container {
  private glyphImages: Phaser.GameObjects.Image[] = []
  value = ''
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y)
    scene.add.existing(this)
  }
  setValue(value: string, cap: number, tint: number, maxWidth: number, align: 'left' | 'center' | 'right' = 'center') {
    this.value = value
    const items = [...value].map(char => {
      const glyph = GLYPHS[char]
      if (!glyph) throw new Error(`Missing Rebirth glyph: ${char}`)
      const frame = FRAMES[glyph[0]]
      const scale = /[0-9]/.test(char) ? cap / glyph[1] : cap / 52
      return { frame: glyph[0], width: frame[2] * scale, height: frame[3] * scale, char }
    })
    const gap = cap * 0.14
    const natural = items.reduce((n, item) => n + item.width, 0) + Math.max(0, items.length - 1) * gap
    const fit = Math.min(1, maxWidth / Math.max(1, natural))
    const width = natural * fit
    let x = align === 'left' ? 0 : align === 'right' ? -width : -width / 2
    items.forEach((item, i) => {
      let image = this.glyphImages[i]
      if (!image) { image = this.scene.add.image(0, 0, ATLAS_KEY); this.add(image); this.glyphImages.push(image) }
      const y = item.char === '.' ? (cap / 2 - item.height) * fit : -item.height * fit / 2
      tintImage(this.scene, image, item.frame, tint).setOrigin(0).setPosition(x, y)
        .setDisplaySize(item.width * fit, item.height * fit).setVisible(true)
      x += (item.width + gap) * fit
    })
    this.glyphImages.slice(items.length).forEach(image => image.setVisible(false))
    this.setSize(width, cap * fit)
    return this
  }
}

