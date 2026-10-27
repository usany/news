'use client'

import styles from './VolumeControl.module.css'

export default function VolumeControl({ volume, onVolumeChange }) {
  return (
    <div className={styles.control}>
      <span>🔊</span>
      <input
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
      />
    </div>
  )
}
