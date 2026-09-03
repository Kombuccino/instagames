import { gameSfxPalettes, sfxCatalog, type SfxDefinition } from '../audio/sfxCatalog'
import { playGameSfx, previewSfxById } from '../audio/sfxEngine'
import './soundDesignLab.css'

const TETRA = gameSfxPalettes.tetramindfck

function SoundCard({ sound }: { sound: SfxDefinition }) {
  const tetraUsesSound = Object.values(TETRA.events).includes(sound.key)

  return (
    <article className="mf-sfx-card" data-scope={sound.scope}>
      <div className="mf-sfx-card__id">
        <b>{sound.id}</b>
        <span>{sound.scope === 'common' ? 'COMMUN' : sound.gameTitle}</span>
      </div>
      <div className="mf-sfx-card__copy">
        <small>{sound.event.toUpperCase()}</small>
        <h3>{sound.name}</h3>
        <p>{sound.summary}</p>
      </div>
      <div className="mf-sfx-card__actions">
        <button type="button" onClick={() => void previewSfxById(sound.id)}>▶ BASE</button>
        {tetraUsesSound && sound.scope === 'common' ? (
          <button type="button" onClick={() => void playGameSfx('tetramindfck', sound.event, { ignoreCooldown: true })}>▶ TETRA</button>
        ) : null}
      </div>
    </article>
  )
}

export function SoundDesignLab() {
  const common = sfxCatalog.sounds.filter((sound) => sound.scope === 'common')
  const tetra = sfxCatalog.sounds.filter((sound) => sound.gameId === 'tetramindfck')

  return (
    <section className="mf-sfx-lab" aria-labelledby="mf-sfx-title">
      <header className="mf-sfx-lab__head">
        <div>
          <small>SOUND DESIGN / VOCABULAIRE MINIFUGG</small>
          <h2 id="mf-sfx-title">SFX LAB</h2>
          <p>Les sons communs forment un langage partagé. Chaque jeu peut les transposer, les assombrir ou les alléger avant d’ajouter ses sons réellement spécifiques.</p>
        </div>
        <div className="mf-sfx-lab__count"><b>{sfxCatalog.sounds.length}</b><span>SONS CONSERVÉS</span></div>
      </header>

      <div className="mf-sfx-lab__section-title"><strong>VOCABULAIRE COMMUN</strong><span>base + accent Tetra quand disponible</span></div>
      <div className="mf-sfx-lab__grid">{common.map((sound) => <SoundCard sound={sound} key={sound.id} />)}</div>

      <div className="mf-sfx-lab__section-title"><strong>TETRA MINDFUCK / SPÉCIFIQUE</strong><span>calcul, bonus et gros impacts</span></div>
      <div className="mf-sfx-lab__grid">{tetra.map((sound) => <SoundCard sound={sound} key={sound.id} />)}</div>

      <footer className="mf-sfx-lab__rule"><strong>RÈGLE SFX</strong><span>{sfxCatalog.rule}</span></footer>
    </section>
  )
}
