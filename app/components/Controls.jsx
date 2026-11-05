'use client'

export default function Controls({ isPlaying, onPlay, onPrevious, onNext }) {
  return (
    <div className="controls-row">
      <button className="controls-small-btn" onClick={onPrevious}>
        ⏪ -10s
      </button>
      <button className="controls-play-btn" onClick={onPlay}>
        {isPlaying ? '⏸ Pause' : '▶ Play'}
      </button>
      <button className="controls-small-btn" onClick={onNext}>
        +10s ⏩
      </button>
    </div>
  )
}
