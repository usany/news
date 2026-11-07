'use client'

import { useEffect, useState } from 'react'
import { getAudioDuration, titleFromUrl } from '../lib/utils'

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
    <div className="episode-list-container">
      <h2>Episodes</h2>
      <div className="episode-list">
        {episodes.map((ep, i) => (
          <div
            key={i}
            className={`episode-list-item ${i === currentIndex ? 'episode-list-active' : ''}`}
          >
            <div className="episode-content" onClick={() => onSelect(i)}>
              <div className="episode-title">{titleFromUrl(ep.url)}</div>
              <div className="episode-duration">⏱ {durations[i] || '0:00'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
