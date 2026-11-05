// The catalog is served by the standalone NestJS server (see ../server).
// During local development it lives at http://localhost:4000; override with
// NEXT_PUBLIC_API_BASE if you deploy the server to another origin.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

export async function fetchEpisodes() {
  const res = await fetch(`${API_BASE}/route`, { cache: 'no-store' })
  if (!res.ok) {
    throw new Error(`Failed to load episodes (HTTP ${res.status})`)
  }
  const data = await res.json()
  // Resolve SPA-facing URLs against the server origin.
  return (data.episodes ?? []).map((ep) => ({
    ...ep,
    url: new URL(ep.url, API_BASE).toString(),
  }))
}

export function titleFromUrl(url) {
  const name = url.split('/').pop().replace(/\.[^.]+$/, '')
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function getAudioDuration(url) {
  return new Promise((resolve) => {
    const audio = new Audio()
    audio.onloadedmetadata = () => {
      resolve(formatTime(audio.duration))
    }
    audio.onerror = () => {
      resolve('0:00')
    }
    audio.src = url
  })
}

export function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
