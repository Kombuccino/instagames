import { useEffect, useMemo, useRef, useState } from 'react'
import { PlatformCoverShell } from './PlatformCoverShell'
import { gameRegistry } from './gameRegistry'
import { readWelcomeBestScore } from './welcomeProgress'
import type { InstagameDefinition } from './types'
import './homeBisLab.css'

type MagazineSection = 'feature' | 'comments' | 'ranking'

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

function MagazinePage({ item, section, onSection }: { item: HomeBisGame, section: MagazineSection, onSection: (section: MagazineSection) => void }) {
  return (
    <article className="mf-home-bis-magazine" style={{ '--mag-accent': item.accent } as React.CSSProperties}>
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

function HomeBisPhone({ game, catalog, active, onChangeGame, onMagazineSection }: {
  game: InstagameDefinition
  catalog: InstagameDefinition[]
  active: boolean
  onChangeGame: () => void
  onMagazineSection: (section: MagazineSection) => void
}) {
  const [playing, setPlaying] = useState(false)
  const [restartToken, setRestartToken] = useState(0)
  const [finishedScore, setFinishedScore] = useState<number | null>(null)
  const Game = game.component

  useEffect(() => {
    if (!active) {
      setPlaying(false)
      setFinishedScore(null)
    }
  }, [active])

  const start = () => {
    setFinishedScore(null)
    setRestartToken((value) => value + 1)
    setPlaying(true)
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
          <button className="mf-home-bis-return" type="button" onClick={() => { setPlaying(false); setFinishedScore(null) }} aria-label="Return to cover">↩</button>
          {finishedScore !== null && (
            <div className="mf-home-bis-result">
              <small>FINAL SCORE</small><strong>{finishedScore.toLocaleString('en-US')}</strong>
              <button type="button" onClick={start}>PLAY AGAIN</button>
              <button type="button" onClick={() => { setPlaying(false); setFinishedScore(null) }}>BACK TO COVER</button>
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

export function HomeBisLab() {
  const [section, setSection] = useState<MagazineSection>('feature')
  const [activeIndex, setActiveIndex] = useState(0)
  const scroller = useRef<HTMLDivElement>(null)
  const labGames = useMemo(() => HOME_BIS_GAMES.map((item) => {
    const game = gameRegistry.find((candidate) => candidate.id === item.id)
    return game ? withLabCover(game, item) : null
  }), [])

  useEffect(() => {
    document.title = 'Home bis · MiniFugg'
  }, [])

  useEffect(() => {
    const root = scroller.current
    if (!root) return
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible) setActiveIndex(Number((visible.target as HTMLElement).dataset.index || 0))
    }, { root, threshold: [0.55, 0.8] })
    root.querySelectorAll('[data-index]').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    Object.assign(window, {
      render_game_to_text: () => JSON.stringify({ lab: 'home-bis', activeGame: HOME_BIS_GAMES[activeIndex].id, magazineSection: section }),
      advanceTime: () => undefined,
    })
  }, [activeIndex, section])

  const goTo = (index: number) => scroller.current?.children[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <main className="mf-home-bis" style={{ '--room-accent': HOME_BIS_GAMES[activeIndex].accent } as React.CSSProperties}>
      <aside className="mf-home-bis-nav" aria-label="Games">
        {HOME_BIS_GAMES.map((item, index) => <button key={item.id} className={index === activeIndex ? 'is-active' : ''} onClick={() => goTo(index)} aria-label={`Show ${item.title}`}><span>{index + 1}</span>{item.title}</button>)}
      </aside>
      <div className="mf-home-bis-scroller" ref={scroller}>
        {HOME_BIS_GAMES.map((item, index) => {
          const game = labGames[index]
          if (!game) return null
          return (
            <section className="mf-home-bis-scene" key={item.id} data-index={index} data-game={item.id}>
              <div className="mf-home-bis-wall" aria-hidden="true"><i className="mf-home-bis-lamp" /><i className="mf-home-bis-cat" /></div>
              <div className="mf-home-bis-desk" aria-hidden="true" />
              <div className="mf-home-bis-layout">
                <MagazinePage item={item} section={section} onSection={setSection} />
                <div className="mf-home-bis-phone-wrap">
                  <div className="mf-home-bis-hand" aria-hidden="true"><i /><i /><i /><i /><b /></div>
                  <div className="mf-home-bis-phone">
                    <HomeBisPhone
                      game={game}
                      catalog={labGames.filter(Boolean) as InstagameDefinition[]}
                      active={activeIndex === index}
                      onChangeGame={() => goTo((index + 1) % HOME_BIS_GAMES.length)}
                      onMagazineSection={setSection}
                    />
                  </div>
                </div>
              </div>
              <p className="mf-home-bis-scroll-cue">SCROLL FOR NEXT FUGG <span>↓</span></p>
            </section>
          )
        })}
      </div>
    </main>
  )
}
