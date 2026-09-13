export type GameplayDaLabAsset = {
  id: string
  gameId: string
  label: string
  image: string
  note?: string
}

/**
 * Exact, repository-backed gameplay DA references exposed in the calibration lab.
 * Add a validated/reference image here when a new DA pass is delivered. The lab
 * also accepts local files for an immediate review before repository integration.
 */
export const GAMEPLAY_DA_LAB_ASSETS: GameplayDaLabAsset[] = [
  {
    id: 'linefugg/orbital-stage-master-v1',
    gameId: 'linefugg',
    label: 'LineFugg · Orbital Accounting',
    image: '/assets/imported/linefugg/concepts/orbital-stage-master-v1.png',
    note: 'Master de référence approuvé ; les éléments dynamiques restent à séparer.',
  },
]
