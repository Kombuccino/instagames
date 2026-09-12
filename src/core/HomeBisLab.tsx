import { useEffect, useMemo, useRef, useState } from 'react'
import { PlatformCoverShell } from './PlatformCoverShell'
import { gameRegistry } from './gameRegistry'
import { readWelcomeBestScore } from './welcomeProgress'
import type { InstagameDefinition } from './types'
import './homeBisLab.css'

type MagazineSection = 'feature' | 'comments' | 'ranking'
type PageMotion = 'still' | 'incoming-forward' | 'incoming-backward' | 'outgoing-forward' | 'outgoing-backward'

type HomeBisLabProps = {
  handoffArm?: string | null
}

type HomeBisGame = {
  id: 'tetramindfck' | 'vlads-skewers' | 'linefugg'
  title: string
  kicker: string
  copy: string
  issue: string
  release: string
  updated: string
  cover: string
  showcase: string
  accent: string
  rules: string[]
}

const HOME_BIS_GAMES: HomeBisGame[] = [
  {
    id: 'tetramindfck',
    title: 'TetraMindFck',
    kicker: 'ARITHMETIC HAS NEVER BEEN THIS RUDE',
    copy: 'Complete rows, chain operators and turn a falling-block puzzle into an escalating mental trap. Every placement can rescue the board or ruin the next calculation.',
    issue: 'LEGACY ALPHA',
    release: 'NOT PUBLISHED',
    updated: 'SEP 2026',
    cover: '/assets/imported/tetramindfck/welcome/variants/v3-graphic-poster.png',
    showcase: '/assets/generated/platform/home-bis-v1/tetramindfck-showcase.png',
    accent: '#1468a8',
    rules: ['Complete a horizontal row.', 'Read every calculation from left to right.', 'Clear several rows to create stronger bonuses.'],
  },
  {
    id: 'vlads-skewers',
    title: "Vlad's Skewers",
    kicker: 'FIVE INGREDIENTS. ONE VERY SHARP SERVICE.',
    copy: 'Build the order from the tip of Vlad’s skewer, dodge the garlic and keep impatient guests fed. Clean upward hits reward timing, beauty and a brutal chain multiplier.',
    issue: '0.2.0',
    release: 'FIRST TRACKED 2026',
    updated: 'SEP 8, 2026',
    cover: '/assets/imported/vlads-skewers/welcome/vlad-cover-c-graphic-poster-approved-2026-09-07.png',
    showcase: '/assets/generated/platform/home-bis-v1/vlads-skewers-showcase.png',
    accent: '#ac1d2a',
    rules: ['Skewer ingredients in the exact order.', 'Only an upward hit can capture food.', 'Serve before the customer loses patience.'],
  },
  {
    id: 'linefugg',
    title: 'LineFugg',
    kicker: 'THREE LINES. ONE GLORIOUS TOTAL.',
    copy: 'Trace three arrows through a celestial number board. Direction changes the calculation, intersections create opportunities and every cell asks how greedy you feel today.',
    issue: 'FUGG BUILD',
    release: 'FIRST TRACKED 2026',
    updated: 'SEP 7, 2026',
    cover: '/assets/imported/linefugg/welcome/variants/linefugg-cover-a-pulp-euro-approved-2026-09-07.png',
    showcase: '/assets/generated/platform/home-bis-v1/linefugg-showcase.png',
    accent: '#d45722',
    rules: ['Draw three lines of up to five cells.', 'Calculate in the direction of each arrow.', 'Cross two lines on one cell to combine routes.'],
  },
]

const SAMPLE_COMMENTS = [
  ['NovaPixel', 'The board becomes dangerous much faster than it first appears.'],
  ['bricks&coffee', 'One more run turned into twelve. That is probably the correct amount.'],
  ['ArcadeMoth', 'The tiny decisions are where the panic starts.'],
]

const SAMPLE_RANKING = [
  ['01', 'MOIGOD', '12,480'],
  ['02', 'NOVAPIXEL', '11,930'],
  ['03', 'BRICKS&COFFEE', '10,760'],
  ['04', 'ARCADEMOTH', '9,420'],
  ['05', 'TINYBOSS', '8,875'],
]

function withLabCover(game: InstagameDefinition, item: HomeBisGame): InstagameDefinition {
  return {
    ...game,
    migration: { ...game.migration, cover: 'current' },
    welcome: {
      variants: [{ id: 'home-bis', label: `${item.title} cover`, image: item.cover, unlockScore: 0 }],
      selection: 'first',
      motion: 'none',
    },
  }
}

function MagazinePage({ item, section, onSection, motion = 'still' }: { item: HomeBisGame, section: MagazineSection, onSection: (section: MagazineSection) => void, motion?: PageMotion }) {
  return (
    <article className={`mf-home-bis-magazine is-${motion}`} style={{ '--mag-accent': item.accent } as React.CSSProperties}>
      <div className="mf-home-bis-cover-curl" style={{ backgroundImage: `url(${item.cover})` }} aria-hidden="true" />
      <div className="mf-home-bis-page">
        <header className="mf-home-bis-masthead">
          <span>MINIFUGG RETRO GAMING</span>
          <nav aria-label="Magazine sections">
            {(['feature', 'comments', 'ranking'] as MagazineSection[]).map((name) => (
              <button key={name} type="button" className={section === name ? 'is-active' : ''} onClick={() => onSection(name)}>{name}</button>
            ))}
          </nav>
        </header>

        {section === 'feature' && (
          <div className="mf-home-bis-feature">
            <div className="mf-home-bis-editorial">
              <p className="mf-home-bis-section-label">FEATURE</p>
              <h1>{item.title}</h1>
              <h2>{item.kicker}</h2>
              <p className="mf-home-bis-copy">{item.copy}</p>
              <dl className="mf-home-bis-facts">
                <div><dt>VERSION</dt><dd>{item.issue}</dd></div>
                <div><dt>FIRST RELEASE</dt><dd>{item.release}</dd></div>
                <div><dt>LAST UPDATE</dt><dd>{item.updated}</dd></div>
              </dl>
            </div>
            <div className="mf-home-bis-side-column">
              <figure><img src={item.showcase} alt={`Advanced ${item.title} game in progress`} /><figcaption>IN PLAY — A RUN ALREADY IN TROUBLE</figcaption></figure>
              <section className="mf-home-bis-how">
                <h3>HOW TO PLAY</h3>
                <ul>{item.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul>
              </section>
              <p className="mf-home-bis-byline">A MINIFUGG GAME</p>
            </div>
          </div>
        )}

        {section === 'comments' && (
          <div className="mf-home-bis-section-content">
            <p className="mf-home-bis-section-label">COMMENTS</p>
            <h1>THE ARCADE TALKS BACK</h1>
            <p className="mf-home-bis-intro">The same community data as the phone panel, reset inside a readable magazine column.</p>
            <div className="mf-home-bis-comments">
              {SAMPLE_COMMENTS.map(([name, comment], index) => <blockquote key={name}><span>0{index + 1}</span><p>{comment}</p><cite>{name}</cite></blockquote>)}
            </div>
            <small>LAB PREVIEW — LIVE COMMENTS WILL REPLACE THESE SAMPLES.</small>
          </div>
        )}

        {section === 'ranking' && (
          <div className="mf-home-bis-section-content">
            <p className="mf-home-bis-section-label">RANKING</p>
            <h1>THE FIVE TO BEAT</h1>
            <p className="mf-home-bis-intro">A full ranking view in exactly the same physical page. No fold-out and no change of scale.</p>
            <ol className="mf-home-bis-ranking">
              {SAMPLE_RANKING.map(([rank, name, score]) => <li key={rank}><b>{rank}</b><span>{name}</span><strong>{score}</strong></li>)}
            </ol>
            <small>LAB PREVIEW — OFFICIAL SCORES REMAIN SERVER-AUTHORITATIVE.</small>
          </div>
        )}
      </div>
    </article>
  )
}

function HomeBisPhone({ game, catalog, active, onChangeGame, onMagazineSection, onPlayingChange }: {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  active: boolean
  onChangeGame: () => void
  onMagazineSection: (section: MagazineSection) => void
  onPlayingChange: (playing: boolean) => void
}) {
  const [playing, setPlaying] = useState(false)
  const [restartToken, setRestartToken] = useState(0)
  const [finishedScore, setFinishedScore] = useState<number | null>(null)
  const Game = game.component

  useEffect(() => {
    if (!active) {
      setPlaying(false)
      setFinishedScore(null)
      onPlayingChange(false)
    }
  }, [active, onPlayingChange])

  useEffect(() => () => onPlayingChange(false), [onPlayingChange])

  const start = () => {
    setFinishedScore(null)
    setRestartToken((value) => value + 1)
    setPlaying(true)
    onPlayingChange(true)
  }

  const returnToCover = () => {
    setPlaying(false)
    setFinishedScore(null)
    onPlayingChange(false)
  }

  return (
    <div className="mf-home-bis-phone-screen">
      {playing ? (
        <div className="mf-home-bis-game-stage">
          <Game
            active={active && finishedScore === null}
            seed={1}
            restartToken={restartToken}
            session={{ setScore: () => undefined, finish: ({ score }) => setFinishedScore(score) }}
          />
          <button className="mf-home-bis-return" type="button" onClick={returnToCover} aria-label="Return to cover">↩</button>
          {finishedScore !== null && (
            <div className="mf-home-bis-result">
              <small>FINAL SCORE</small><strong>{finishedScore.toLocaleString('en-US')}</strong>
              <button type="button" onClick={start}>PLAY AGAIN</button>
              <button type="button" onClick={returnToCover}>BACK TO COVER</button>
            </div>
          )}
        </div>
      ) : (
        <PlatformCoverShell
          game={game} catalog={catalog} active={active} seed={0} coins={500} cost={2}
          social={{ loved: false, loves: 842, comments: 126, bookmarked: false, bookmarks: 311, plays: 4_931 }} comments={[]}
          bestScore={readWelcomeBestScore(game.id)} panel={null} nickname="Player" commentText="" launchError=""
          onPanel={(panel) => onMagazineSection(panel === 'comments' ? 'comments' : 'feature')} onClosePanel={() => undefined}
          onToggleLove={() => undefined} onToggleBookmark={() => undefined} onPlay={start}
          onChangeGame={onChangeGame} onShare={() => undefined} onNicknameChange={() => undefined}
          onCommentTextChange={() => undefined} onPostComment={() => undefined}
          onOpenLeaderboard={() => onMagazineSection('ranking')} onSelectCover={() => undefined}
        />
      )}
    </div>
  )
}

export function HomeBisLab({ handoffArm = null }: HomeBisLabProps) {
  const [section, setSection] = useState<MagazineSection>('feature')
  const [activeIndex, setActiveIndex] = useState(0)
  const [previousIndex, setPreviousIndex] = useState<number | null>(null)
  const [turnDirection, setTurnDirection] = useState<'forward' | 'backward'>('forward')
  const [transitionId, setTransitionId] = useState(0)
  const [gamePlaying, setGamePlaying] = useState(false)
  const transitionTimer = useRef<number | null>(null)
  const wheelLockedUntil = useRef(0)
  const labGames = useMemo(() => HOME_BIS_GAMES.map((item) => {
    const game = gameRegistry.find((candidate) => candidate.id === item.id)
    return game ? withLabCover(game, item) : null
  }), [])

  useEffect(() => {
    document.title = 'Home bis · MiniFugg'
    return () => {
      if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    }
  }, [])

  useEffect(() => {
    const readLabState = () => JSON.stringify({ lab: 'home-bis', activeGame: HOME_BIS_GAMES[activeIndex].id, magazineSection: section, phone: gamePlaying ? 'playing' : 'cover' })
    Object.assign(window, {
      render_game_to_text: readLabState,
      render_home_bis_to_text: readLabState,
      advanceTime: () => undefined,
    })
  }, [activeIndex, gamePlaying, section])

  const changeGame = (nextIndex: number, direction?: 'forward' | 'backward') => {
    if (gamePlaying || nextIndex === activeIndex) return
    const normalized = (nextIndex + HOME_BIS_GAMES.length) % HOME_BIS_GAMES.length
    const resolvedDirection = direction ?? (normalized > activeIndex ? 'forward' : 'backward')
    if (transitionTimer.current !== null) window.clearTimeout(transitionTimer.current)
    setPreviousIndex(activeIndex)
    setTurnDirection(resolvedDirection)
    setActiveIndex(normalized)
    setTransitionId((value) => value + 1)
    transitionTimer.current = window.setTimeout(() => {
      transitionTimer.current = null
      setPreviousIndex(null)
    }, 560)
  }

  const onWheel = (event: React.WheelEvent<HTMLElement>) => {
    if (gamePlaying || Math.abs(event.deltaY) < 24 || Date.now() < wheelLockedUntil.current) return
    wheelLockedUntil.current = Date.now() + 650
    changeGame(activeIndex + (event.deltaY > 0 ? 1 : -1), event.deltaY > 0 ? 'forward' : 'backward')
  }

  const item = HOME_BIS_GAMES[activeIndex]
  const game = labGames[activeIndex]
  const handoffCutout = handoffArm?.replace('/arms/', '/arms-screen-cutout/') ?? null
  const previousItem = previousIndex === null ? null : HOME_BIS_GAMES[previousIndex]
  if (!game) return null

  return (
    <main
      className={`mf-home-bis${gamePlaying ? ' is-playing' : ''}`}
      style={{ '--room-accent': item.accent } as React.CSSProperties}
      onWheel={onWheel}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown' || event.key === 'PageDown') changeGame(activeIndex + 1, 'forward')
        if (event.key === 'ArrowUp' || event.key === 'PageUp') changeGame(activeIndex - 1, 'backward')
      }}
      tabIndex={-1}
    >
      <aside className="mf-home-bis-nav" aria-label="Games">
        {HOME_BIS_GAMES.map((candidate, index) => <button key={candidate.id} disabled={gamePlaying} className={index === activeIndex ? 'is-active' : ''} onClick={() => changeGame(index)} aria-label={`Show ${candidate.title}`}><span>{index + 1}</span>{candidate.title}</button>)}
      </aside>
      <section className="mf-home-bis-scene" data-game={item.id}>
        <div className="mf-home-bis-production-plate" aria-hidden="true" />
        <div className="mf-home-bis-layout">
          <div className="mf-home-bis-magazine-stack" aria-live="polite">
            {previousItem && <MagazinePage key={`previous-${transitionId}`} item={previousItem} section={section} onSection={setSection} motion={`outgoing-${turnDirection}`} />}
            <MagazinePage key={`current-${item.id}-${transitionId}`} item={item} section={section} onSection={setSection} motion={previousItem ? `incoming-${turnDirection}` : 'still'} />
          </div>
          <div className="mf-home-bis-phone-wrap">
            <div className="mf-home-bis-phone">
              <HomeBisPhone
                key={`${game.id}-${transitionId}`}
                game={game}
                catalog={labGames.filter(Boolean) as InstagameDefinition[]}
                active
                onChangeGame={() => changeGame(activeIndex + 1, 'forward')}
                onMagazineSection={setSection}
                onPlayingChange={setGamePlaying}
              />
            </div>
            {!handoffArm && (
              <picture className="mf-home-bis-hand" aria-hidden="true">
                <source srcSet="/assets/generated/platform/home-bis-v1/production/canonical-hand-cutout-v2.webp" type="image/webp" />
                <img src="/assets/generated/platform/home-bis-v1/production/canonical-hand-cutout-v2.png" alt="" />
              </picture>
            )}
          </div>
        </div>
        {handoffCutout && (
          <div className="mf-home-bis-handoff-rig" aria-hidden="true">
            <picture>
              <source srcSet={handoffCutout.replace('.png', '.webp')} type="image/webp" />
              <img src={handoffCutout} alt="" draggable={false} />
            </picture>
          </div>
        )}
        <p className="mf-home-bis-scroll-cue">{gamePlaying ? 'GAME CONTROLS ACTIVE' : 'WHEEL OR CHANGE GAME'} <span>{gamePlaying ? '●' : '↕'}</span></p>
      </section>
    </main>
  )
}
