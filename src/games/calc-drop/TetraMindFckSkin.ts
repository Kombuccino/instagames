import Phaser from 'phaser'
import type { TetraMindFckScene } from './TetraMindFckScene'

type RuntimeScene = Phaser.Scene & { create: () => void }

type Aperture = { x: number; y: number; w: number; h: number }

const STAGE_WIDTH = 390
const STAGE_HEIGHT = 844

// Canonical gameplay geometry. These are the same logical apertures used by the scene.
const MAIN: Aperture = { x: 105.5, y: 122.5, w: 261, h: 503.5 }
const LEVEL: Aperture = { x: 24, y: 155.5, w: 64.5, h: 77 }
const TARGET: Aperture = { x: 24, y: 254, w: 64.5, h: 71.5 }
const NEXT: Aperture = { x: 24, y: 351.5, w: 64.5, h: 105.5 }
const NEXT2: Aperture = { x: 24, y: 484, w: 64.5, h: 105.5 }

const CREAM = 0xe9dcc3
const CREAM_LIGHT = 0xf4ead4
const CREAM_DARK = 0xb7aa91
const RAIL = 0x69645d
const CRT = 0x08281f
const CRT_EDGE = 0x315d4b
const PRINT = '#342f2a'

function destroyBrokenStructuralAssets(scene: RuntimeScene) {
  for (const child of [...scene.children.list]) {
    if (!(child instanceof Phaser.GameObjects.Image)) continue
    const key = child.texture.key
    if (key === 'tetra-shell' || key === 'tetra-crt') child.destroy()
  }
}

function drawCrt(scene: RuntimeScene, aperture: Aperture, radius = 8) {
  const graphics = scene.add.graphics().setDepth(2.6)
  graphics.fillStyle(CRT, 1)
    .fillRoundedRect(aperture.x, aperture.y, aperture.w, aperture.h, radius)
  graphics.lineStyle(1, CRT_EDGE, 0.95)
    .strokeRoundedRect(aperture.x + 0.5, aperture.y + 0.5, aperture.w - 1, aperture.h - 1, radius)
}

function drawCanonicalConsole(scene: RuntimeScene) {
  const shell = scene.add.graphics().setDepth(2)

  // One continuous physical body. No raster cut-outs, no independent shell geometry.
  shell.fillStyle(0x2d2925, 0.36)
    .fillRoundedRect(7, 76, 376, 720, 22)
  shell.fillStyle(CREAM_DARK, 1)
    .fillRoundedRect(8, 72, 374, 716, 22)
  shell.fillStyle(CREAM, 1)
    .fillRoundedRect(10, 70, 370, 714, 20)
  shell.lineStyle(2, CREAM_LIGHT, 0.8)
    .strokeRoundedRect(12, 72, 366, 710, 18)

  // Left instrument rail and control deck are part of the same console.
  shell.fillStyle(RAIL, 1)
    .fillRoundedRect(16, 143, 81, 458, 13)
  shell.fillStyle(CREAM, 1)
    .fillRoundedRect(13, 629, 364, 151, 12)
  shell.lineStyle(1, CREAM_DARK, 0.9)
    .lineBetween(15, 642, 375, 642)

  // Printed title strip: compact, no extra copy.
  scene.add.text(22, 88, 'TetraMindFck / Calc Drop', {
    fontFamily: 'Georgia, serif', fontSize: '15px', color: PRINT, fontStyle: 'bold italic',
  }).setDepth(2.8)
  scene.add.text(339, 91, 'MINIFUGG', {
    fontFamily: 'monospace', fontSize: '7px', color: PRINT, fontStyle: 'bold', letterSpacing: 1,
  }).setOrigin(1, 0).setDepth(2.8)

  // Exactly five CRT surfaces. Main CRT has NO scanline overlay: the only lines inside it
  // are the actual 10x20 board grid drawn by TetraMindFckScene.
  drawCrt(scene, MAIN, 12)
  drawCrt(scene, LEVEL)
  drawCrt(scene, TARGET)
  drawCrt(scene, NEXT)
  drawCrt(scene, NEXT2)

  // Subtle hardware separators; never cross a screen aperture.
  shell.lineStyle(1, CREAM_DARK, 0.65)
    .lineBetween(98, 119, 98, 609)
    .lineBetween(18, 241, 95, 241)
    .lineBetween(18, 338, 95, 338)
    .lineBetween(18, 470, 95, 470)
}

/**
 * Canonical structural skin. The illustrated background, gameplay tiles and physical
 * button sprites remain raster; the console body/CRT apertures are drawn from one
 * logical geometry so they cannot drift apart again.
 */
export function installTetraMindFckSkin(scene: TetraMindFckScene) {
  const runtime = scene as unknown as RuntimeScene
  const originalCreate = runtime.create.bind(scene)

  runtime.create = () => {
    originalCreate()
    destroyBrokenStructuralAssets(runtime)
    drawCanonicalConsole(runtime)
  }

  return scene
}
