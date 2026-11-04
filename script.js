const episodes = [
    { title: "Episode 1: Getting Started", podcast: "Tech Talk Daily", duration: "18:42", url: "https://www.soundhelix.com/sounds/mp3/SoundHelix-Song-1.mp3" },
    { title: "Episode 2: Advanced Topics", podcast: "Tech Talk Daily", duration: "25:15", url: "https://www.soundhelix.com/sounds/mp3/SoundHelix-Song-2.mp3" },
    { title: "Episode 3: Q&A Session", podcast: "Tech Talk Daily", duration: "22:30", url: "https://www.soundhelix.com/sounds/mp3/SoundHelix-Song-3.mp3" },
    { title: "Episode 1: Introduction", podcast: "Code Weekly", duration: "15:45", url: "https://www.soundhelix.com/sounds/mp3/SoundHelix-Song-4.mp3" },
    { title: "Episode 2: Best Practices", podcast: "Code Weekly", duration: "29:10", url: "https://www.soundhelix.com/sounds/mp3/SoundHelix-Song-5.mp3" },
];

let currentEpisodeIndex = 0;
const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeControl = document.getElementById('volumeControl');
const progressFill = document.getElementById('progressFill');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentTitleEl = document.getElementById('currentTitle');
const currentPodcastEl = document.getElementById('currentPodcast');
const episodesList = document.getElementById('episodesList');

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function renderEpisodes() {
    episodesList.innerHTML = episodes.map((ep, i) => `
        <div class="episode-item ${i === currentEpisodeIndex ? 'active' : ''}" onclick="selectEpisode(${i})">
            <div class="episode-title">${ep.title}</div>
            <div class="episode-podcast">${ep.podcast}</div>
            <div class="episode-duration">⏱ ${ep.duration}</div>
        </div>
    `).join('');
}

function selectEpisode(index) {
    currentEpisodeIndex = index;
    const episode = episodes[index];

    audio.src = episode.url;
    currentTitleEl.textContent = episode.title;
    currentPodcastEl.textContent = episode.podcast;
    playBtn.textContent = '▶ Play';

    renderEpisodes();
}

playBtn.addEventListener('click', () => {
    if (audio.src === '') selectEpisode(0);

    if (audio.paused) {
        audio.play();
        playBtn.textContent = '⏸ Pause';
    } else {
        audio.pause();
        playBtn.textContent = '▶ Play';
    }
});

prevBtn.addEventListener('click', () => {
    currentEpisodeIndex = (currentEpisodeIndex - 1 + episodes.length) % episodes.length;
    selectEpisode(currentEpisodeIndex);
    audio.play();
    playBtn.textContent = '⏸ Pause';
});

nextBtn.addEventListener('click', () => {
    currentEpisodeIndex = (currentEpisodeIndex + 1) % episodes.length;
    selectEpisode(currentEpisodeIndex);
    audio.play();
    playBtn.textContent = '⏸ Pause';
});

volumeControl.addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
});

audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = progress + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
    currentEpisodeIndex = (currentEpisodeIndex + 1) % episodes.length;
    selectEpisode(currentEpisodeIndex);
    audio.play();
});

audio.volume = 0.7;
renderEpisodes();
