'use client'

export default function VolumeControl({ volume, onVolumeChange }) {
  return (
    <div className="volume-control-row">
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
