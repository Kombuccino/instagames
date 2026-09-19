import Phaser from 'phaser'
import type { TetraMindFckScene } from './TetraMindFckScene'

type RuntimeScene = Phaser.Scene & { create: () => void }
type Aperture = { x: number; y: number; w: number; h: number }

const MAIN: Aperture = { x: 93, y: 114, w: 289, h: 560 }
const LEVEL: Aperture = { x: 10, y: 148, w: 72, h: 82 }
const MASCOT: Aperture = { x: 10, y: 244, w: 72, h: 82 }
const NEXT: Aperture = { x: 10, y: 340, w: 72, h: 112 }
const NEXT2: Aperture = { x: 10, y: 466, w: 72, h: 112 }

const CREAM = 0xe9dcc3
const CREAM_LIGHT = 0xf4ead4
const CREAM_DARK = 0xb7aa91
const RAIL = 0x69645d
const CRT = 0x08281f
const CRT_EDGE = 0x315d4b
const PRINT = '#342f2a'

function drawCrt(scene: RuntimeScene, aperture: Aperture, radius = 8) {
  const graphics = scene.add.graphics().setDepth(2.6)
  graphics.fillStyle(CRT, 1).fillRoundedRect(aperture.x, aperture.y, aperture.w, aperture.h, radius)
  graphics.lineStyle(1, CRT_EDGE, 0.95).strokeRoundedRect(aperture.x + 0.5, aperture.y + 0.5, aperture.w - 1, aperture.h - 1, radius)
}

function drawButtonLabels(scene: RuntimeScene) {
  const label = (x: number, y: number, value: string) => scene.add.text(x, y, value, {
    fontFamily: 'monospace', fontSize: '8px', color: PRINT, fontStyle: 'bold', align: 'center', lineSpacing: -1,
  }).setOrigin(0.5, 0).setDepth(22)
  label(53.5, 763, 'LEFT')
  label(147.5, 763, 'RIGHT')
  label(241.5, 763, 'ROTATE\nLEFT')
  label(335.5, 763, 'ROTATE\nRIGHT')
  label(102, 834, 'DOWN')
}

function drawCanonicalConsole(scene: RuntimeScene) {
  const shell = scene.add.graphics().setDepth(2)
  shell.fillStyle(0x2d2925, 0.34).fillRoundedRect(0, 60, 390, 790, 22)
  shell.fillStyle(CREAM_DARK, 1).fillRoundedRect(0, 57, 390, 789, 22)
  shell.fillStyle(CREAM, 1).fillRoundedRect(0, 55, 390, 795, 20)
  shell.lineStyle(2, CREAM_LIGHT, 0.82).strokeRoundedRect(2, 57, 386, 791, 18)
  shell.fillStyle(RAIL, 1).fillRoundedRect(5, 138, 82, 451, 13)
  shell.fillStyle(CREAM, 1).fillRoundedRect(0, 686, 390, 164, 8)
  shell.lineStyle(1, CREAM_DARK, 0.88).lineBetween(0, 688, 390, 688)
  scene.add.text(12, 69, 'TetraMindFck', { fontFamily: 'Georgia, serif', fontSize: '17px', color: PRINT, fontStyle: 'bold italic' }).setDepth(2.8)
  drawCrt(scene, MAIN, 12)
  drawCrt(scene, LEVEL)
  drawCrt(scene, MASCOT)
  drawCrt(scene, NEXT)
  drawCrt(scene, NEXT2)
  shell.lineStyle(1, CREAM_DARK, 0.55)
    .lineBetween(88, 138, 88, 589)
    .lineBetween(7, 237, 85, 237)
    .lineBetween(7, 333, 85, 333)
    .lineBetween(7, 459, 85, 459)
  drawButtonLabels(scene)
}

export function installTetraMindFckSkin(scene: TetraMindFckScene) {
  const runtime = scene as unknown as RuntimeScene
  const originalCreate = runtime.create.bind(scene)
  runtime.create = () => {
    originalCreate()
    drawCanonicalConsole(runtime)
  }
  return scene
}
