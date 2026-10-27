'use client'

import styles from './Controls.module.css'

export default function Controls({ isPlaying, onPlay, onPrevious, onNext }) {
  return (
    <div className={styles.controls}>
      <button className={styles.smallBtn} onClick={onPrevious}>
        ⏪ -10s
      </button>
      <button className={styles.playBtn} onClick={onPlay}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button className={styles.smallBtn} onClick={onNext}>
        +10s ⏩
      </button>
    </div>
  )
}
