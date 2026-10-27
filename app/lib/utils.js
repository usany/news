export const EPISODES = [
  { url: "/api/storage/2026_10_w5_full_news.wav" },
  { url: "/api/storage/2026_10_w4_full_news.wav" },
  { url: "/api/storage/full_news_full_news.wav" },
  { url: "/api/storage/week5_broadcast_audio.wav" },
  { url: "/api/storage/2026_07_w3_full_news.wav" },
  { url: "/api/storage/2026_07_w3.wav" },
  { url: "/api/storage/2026_08_w1_full_news.wav" },
  { url: "/api/storage/2026_08_w2_full_news.wav" },
  { url: "/api/storage/Newsfront.mp3" },
]

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
