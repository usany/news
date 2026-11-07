'use client'

export default function ProgressBar({ current, currentDisplay, duration, durationSeconds, onSeek }) {
  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * durationSeconds
    onSeek(newTime)
  }

  const progress = durationSeconds ? (current / durationSeconds) * 100 : 0

  return (
    <div className="progress-bar-container">
      <div className="progress-bar-track" onClick={handleSeek}>
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>
      <div className="progress-bar-times">
        <span>{currentDisplay}</span>
        <span>{duration}</span>
      </div>
    </div>
  )
}
