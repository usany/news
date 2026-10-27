'use client'

import styles from './ProgressBar.module.css'

export default function ProgressBar({ current, currentDisplay, duration, durationSeconds, onSeek }) {
  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * durationSeconds
    onSeek(newTime)
  }

  const progress = durationSeconds ? (current / durationSeconds) * 100 : 0

  return (
    <div className={styles.container}>
      <div className={styles.bar} onClick={handleSeek}>
        <div className={styles.fill} style={{ width: `${progress}%` }} />
      </div>
      <div className={styles.times}>
        <span>{currentDisplay}</span>
        <span>{duration}</span>
      </div>
    </div>
  )
}
