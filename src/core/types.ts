import type { ComponentType } from 'react'

export type GameSessionApi = {
  setScore: (score: number) => void
}

export type GameComponentProps = {
  active: boolean
  seed: number
  session: GameSessionApi
}

export type InstagameDefinition = {
  id: string
  title: string
  description: string
  author?: string
  component: ComponentType<GameComponentProps>
}
