export const translations = {
  en: {
    title: 'News Station',
    subtitle: 'Listen to your favorite podcasts',
    theme: 'Theme',
    language: 'Language',
    dark: 'Dark',
    light: 'Light',
    system: 'System',
    nowPlaying: 'Now Playing',
    episodes: 'Episodes',
    volume: 'Volume',
    previous: 'Previous',
    next: 'Next',
    play: 'Play',
    pause: 'Pause',
  },
  ko: {
    title: '뉴스 스테이션',
    subtitle: '좋아하는 팟캐스트를 들어보세요',
    theme: '테마',
    language: '언어',
    dark: '어두운',
    light: '밝은',
    system: '시스템',
    nowPlaying: '현재 재생 중',
    episodes: '에피소드',
    volume: '볼륨',
    previous: '이전',
    next: '다음',
    play: '재생',
    pause: '일시 중지',
  },
}

export function getTranslation(lang, key) {
  return translations[lang]?.[key] || translations.en[key] || key
}
