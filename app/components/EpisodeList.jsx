'use client'

import { useEffect, useState } from 'react'
import { getAudioDuration } from '../lib/utils'
import styles from './EpisodeList.module.css'

export default function EpisodeList({ episodes, currentIndex, onSelect }) {
  const [durations, setDurations] = useState({})

  useEffect(() => {
    episodes.forEach(async (ep, i) => {
      if (!durations[i]) {
        const duration = await getAudioDuration(ep.url)
        setDurations(prev => ({ ...prev, [i]: duration }))
      }
    })
  }, [episodes, durations])

  return (
    <div className={styles.container}>
      <h2>Episodes</h2>
      <div className={styles.list}>
        {episodes.map((ep, i) => (
          <div
            key={i}
            className={`${styles.item} ${i === currentIndex ? styles.active : ''}`}
          >
            <div className={styles.episodeContent} onClick={() => onSelect(i)}>
              <div className={styles.title}>{ep.title}</div>
              <div className={styles.duration}>⏱ {durations[i] || '0:00'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
