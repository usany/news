import newsConfig from '../../config/news.json' with { type: 'json' }

export const EPISODES = newsConfig.episodes

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
