'use client'

import { useEffect, useRef, useState } from 'react'
import { EPISODES, formatTime, titleFromUrl } from '../lib/utils'
import { useTheme } from '../lib/ThemeContext'
import { getTranslation } from '../lib/i18n'
import EpisodeList from './EpisodeList'
import WaveformProgress from './WaveformProgress'
import Controls from './Controls'
import VolumeControl from './VolumeControl'
import DetailDropdown from './DetailDropdown'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import styles from './Player.module.css'

export default function Player() {
  const audioRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSec, setCurrentSec] = useState(0)
  const [totalSec, setTotalSec] = useState(0)
  const [volume, setVolume] = useState(70)
  const { language } = useTheme()

  const episode = EPISODES[currentIndex]

  // Load episode source and wire up events
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.src = episode.url
    audio.currentTime = 0
    setCurrentSec(0)

    if (isPlaying) {
      audio.play().catch(() => setIsPlaying(false))
    }

    const onTime = () => setCurrentSec(audio.currentTime)
    const onMeta = () => setTotalSec(audio.duration || 0)
    const onEnd = () => setCurrentIndex((i) => (i + 1) % EPISODES.length)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnd)
    }
  }, [currentIndex])

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100
  }, [volume])

  function togglePlay() {
    const audio = audioRef.current
    if (audio.paused) {
      audio.play()
      setIsPlaying(true)
    } else {
      audio.pause()
      setIsPlaying(false)
    }
  }

  function handleSelect(i) {
    if (i === currentIndex) {
      const audio = audioRef.current
      if (audio) {
        audio.currentTime = 0
        setCurrentSec(0)
        if (audio.paused) audio.play().catch(() => setIsPlaying(false))
        setIsPlaying(true)
      }
    } else {
      setCurrentIndex(i)
      setIsPlaying(true)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>🎙️ {getTranslation(language, 'title')}</h1>
          <p>{getTranslation(language, 'subtitle')}</p>
        </div>
        <div className={styles.toggles}>
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </header>

      <div className={styles.main}>
        <EpisodeList
          episodes={EPISODES}
          currentIndex={currentIndex}
          onSelect={handleSelect}
        />

        <div className={styles.player}>
          <div className={styles.nowPlaying}>
            <h3>{titleFromUrl(episode.url)}</h3>
          </div>

          <WaveformProgress
            audio={audioRef.current}
            current={currentSec}
            currentDisplay={formatTime(currentSec)}
            duration={formatTime(totalSec)}
            durationSeconds={totalSec}
            onSeek={(t) => { if (audioRef.current) audioRef.current.currentTime = t }}
          />

          <Controls
            isPlaying={isPlaying}
            onPlay={togglePlay}
            onPrevious={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10) }}
            onNext={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(audioRef.current.duration || Infinity, audioRef.current.currentTime + 10) }}
          />

          <VolumeControl
            volume={volume}
            onVolumeChange={setVolume}
          />

          {episode.notices && (
            <DetailDropdown notices={episode.notices} />
          )}
        </div>
      </div>

      <audio ref={audioRef} />
    </div>
  )
}
