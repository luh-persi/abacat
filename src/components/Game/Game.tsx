import { Canvas } from '@react-three/fiber'
import { memo, useCallback, useRef, useState } from 'react'
import { Runner, type GameBridge, type Hud } from './Runner'
import styles from './Game.module.css'

const CANVAS_GL = { antialias: true, alpha: false, powerPreference: 'high-performance' as const }
const CANVAS_CAMERA = { position: [0, 2.4, 5.55] as [number, number, number], fov: 40 }
const CANVAS_STYLE = { width: '100%', height: '100%', touchAction: 'none' as const }
const CANVAS_DPR: [number, number] = [1, 1.5]

function tuneCanvas({ gl }: { gl: { setClearColor: (color: string) => void; toneMappingExposure: number } }) {
  gl.setClearColor('#e7f3c8')
  gl.toneMappingExposure = 1.08
}

const StageCanvas = memo(function StageCanvas({ bridge }: { bridge: { current: GameBridge } }) {
  return (
    <Canvas
      dpr={CANVAS_DPR}
      frameloop="always"
      gl={CANVAS_GL}
      camera={CANVAS_CAMERA}
      style={CANVAS_STYLE}
      onCreated={tuneCanvas}
    >
      <Runner bridge={bridge} />
    </Canvas>
  )
})

type Phase = 'idle' | 'playing' | 'gameover'

export function Game() {
  const stageRef = useRef<HTMLDivElement>(null)
  const jumpRef = useRef<() => void>(() => {})
  const bridge = useRef<GameBridge>({
    playing: false,
    run: 0,
    jumpRef,
    onHud: () => {},
    onCrash: () => {},
    onShield: () => {},
  })
  const phaseRef = useRef<Phase>('idle')
  const hudRef = useRef<Hud>({ score: 0, meters: 0, combo: 1, shield: false })
  const [phase, setPhase] = useState<Phase>('idle')
  const [hud, setHud] = useState<Hud>({ score: 0, meters: 0, combo: 1, shield: false })
  const [flash, setFlash] = useState(0)
  const [shieldFlash, setShieldFlash] = useState(0)

  const onHud = useCallback((next: Hud) => {
    const prev = hudRef.current
    if (
      prev.score === next.score &&
      prev.meters === next.meters &&
      prev.combo === next.combo &&
      prev.shield === next.shield
    ) return
    hudRef.current = next
    if (phaseRef.current === 'playing') setHud(next)
  }, [])

  const onCrash = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    phaseRef.current = 'gameover'
    setPhase('gameover')
    setFlash((n) => n + 1)
  }, [])

  const onShield = useCallback(() => {
    if (phaseRef.current !== 'playing') return
    setShieldFlash((n) => n + 1)
  }, [])

  const startGame = useCallback(() => {
    const fresh = { score: 0, meters: 0, combo: 1, shield: false }
    phaseRef.current = 'playing'
    hudRef.current = fresh
    setHud(fresh)
    setPhase('playing')
    bridge.current.run += 1
  }, [])

  bridge.current.playing = phase === 'playing'
  bridge.current.onHud = onHud
  bridge.current.onCrash = onCrash
  bridge.current.onShield = onShield

  const won = hud.score >= 140
  const pitch = hud.score >= 280
    ? 'Você praticamente é um Abacat.'
    : hud.score >= 140
      ? 'Bom. A gente desvia mais rápido.'
      : 'Precisa de ajuda? A Abacat tá aqui.'

  return (
    <div className={styles.gameContainer}>
      <div
        ref={stageRef}
        className={styles.stage}
        aria-label="Mini-jogo 3D Corre. Troque de faixa, pule e abaixe para desviar o Abacat."
      >
        <StageCanvas bridge={bridge} />

        {phase === 'playing' && (
          <div className={styles.hud}>
            <span className={styles.lives}>
              {hud.shield ? 'escudo · ' : ''}
              {hud.meters} m
              {hud.combo > 1 ? ` · x${hud.combo}` : ''}
            </span>
            <span className={styles.score}>{hud.score} pts</span>
          </div>
        )}
        {flash > 0 && phase === 'gameover' && (
          <div key={flash} className={styles.flashBad} />
        )}
        {shieldFlash > 0 && phase === 'playing' && (
          <div key={shieldFlash} className={styles.flashOk} />
        )}

        {phase !== 'playing' && (
          <div className={styles.banner}>
            <strong className={phase === 'gameover' && !won ? styles.bannerBad : undefined}>
              {phase === 'idle' ? 'CORRE' : won ? 'Incrível!' : 'Game over'}
            </strong>
            <p>
              {phase === 'idle'
                ? 'Pula cerca e caixote, abaixa na placa e sai da frente do carrinho.'
                : `Você fez ${hud.score} pontos em ${hud.meters} m`}
            </p>
            {phase === 'idle' && <p className={styles.hint}>Arraste ou ← → · toque ou ↑ pula · ↓ abaixa</p>}
            {phase === 'gameover' && <p className={styles.hint}>{pitch}</p>}
          </div>
        )}
      </div>

      {phase === 'idle' && (
        <button className={styles.overlayBtn} onClick={startGame}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M5 3l11 6-11 6V3z" fill="currentColor"/>
          </svg>
          Jogar agora
        </button>
      )}
      {phase === 'gameover' && (
        <button className={styles.overlayBtn} onClick={startGame}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M14 8A6 6 0 1 1 4 4.5M4 2v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Jogar de novo
        </button>
      )}
    </div>
  )
}

export function GameSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={`${styles.header} reveal`}>
          <span className="tag-label" style={{ color: 'rgba(200,216,50,0.6)' }}>// bonus level</span>
          <h2 className={styles.heading}>
            Resolver problemas é<br />
            <span className={styles.accent}>o que a gente faz.</span>
          </h2>
          <p className={styles.sub}>
            Mas antes de ir embora — testa se você consegue também.
            <span style={{ color: 'var(--text-muted)' }}> (não tem certo ou errado, juro)</span>
          </p>
        </div>
        <div className={`${styles.gameWrap} reveal reveal-delay-2`}>
          <Game />
        </div>
        <p className={`${styles.note} reveal reveal-delay-3`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1v12M1 7h12" stroke="var(--lime-flash)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Resolver problemas de negócio de verdade é ainda mais satisfatório.{' '}
          <a
            href="https://wa.me/5500000000000?text=Oi!%20Joguei%20o%20jogo%20no%20site%20e%20quero%20conversar."
            target="_blank" rel="noopener noreferrer"
            className={styles.noteLink}
          >
            Fala com a gente →
          </a>
        </p>
      </div>
    </section>
  )
}
