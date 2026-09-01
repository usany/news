export const EPISODES = [
  // { title: "Newsfront", podcast: "News Podcast", duration: "1:00", url: "/Newsfront.mp3" },
  { title: "KHU Weekly News Broadcast - Week 5", podcast: "KHU News", duration: "2:37", url: "/week5_broadcast_audio.wav" },
  { title: "KHU Full News - 2026 Week 3 (July)", podcast: "KHU News", duration: "8:42", url: "/2026_07_w3_full_news.wav" },
  { title: "KHU News - 2026 Week 3 (July)", podcast: "KHU News", duration: "6:08", url: "/2026_07_w3.wav" },
  { title: "KHU Full News - 2026 Week 1 (August)", podcast: "KHU News", duration: "10:10", url: "/2026_08_w1_full_news.wav" },
  { title: "KHU Full News - 2026 Week 2 (August)", podcast: "KHU News", duration: "7:13", url: "/2026_08_w2_full_news.wav" },
]
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
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}
