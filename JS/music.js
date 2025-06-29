// DOM Elements
const audioElement = document.getElementById('audio-element');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const volumeSlider = document.getElementById('volume-slider');
const shuffleBtn = document.getElementById('shuffle-btn');
const currentTimeDisplay = document.getElementById('current-time');
const totalTimeDisplay = document.getElementById('total-time');

// Player State
let isPlaying = false;
let currentTrackIndex = 0;
let isShuffled = false;
let shuffleHistory = [];

// Your Music Library - Replace with your actual tracks
const musicLibrary = [
    { title: "Rainy Window", artist: "Lo-Fi Vibes", path: "Assets/Tracks/2.mp3" },
    { title: "Night Lights", artist: "Lo-Fi Vibes", path: "Assets/Tracks/3.mp3" },
    { title: "Midnight Drizzle", artist: "Lo-Fi Vibes", path: "Assets/Tracks/4.mp3" },
    { title: "Espresso Memories", artist: "Lo-Fi Vibes", path: "Assets/Tracks/5.mp3" },
    { title: "Fading Streetlights", artist: "Lo-Fi Vibes", path: "Assets/Tracks/6.mp3" },
    { title: "Rainy Café Window", artist: "Lo-Fi Vibes", path: "Assets/Tracks/7.mp3" },
    { title: "Old Bookstore Vibes", artist: "Lo-Fi Vibes", path: "Assets/Tracks/8.mp3" },
    { title: "Warm Blanket Jazz", artist: "Lo-Fi Vibes", path: "Assets/Tracks/9.mp3" },
    { title: "Tea-Stained Melodies", artist: "Lo-Fi Vibes", path: "Assets/Tracks/10.mp3" },
    { title: "Sleepless in the City", artist: "Lo-Fi Vibes", path: "Assets/Tracks/11.mp3" },
    { title: "Distant Train Whistle", artist: "Lo-Fi Vibes", path: "Assets/racks/12.mp3" },
    { title: "Lofi Sunday", artist: "Lo-Fi Vibes", path: "Assets/Tracks/14.mp3" },
    
];

// Format time (seconds to MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Initialize Player
function initPlayer() {
    // Create initial playlist (in order)
    playlist = [...musicLibrary];
    
    // Load saved state from localStorage
    loadPlayerState();
    
    // Set initial volume
    audioElement.volume = volumeSlider.value;
    
    // Load first track
    if (playlist.length > 0) {
        loadTrack(currentTrackIndex);
    } else {
        trackTitle.textContent = "No tracks available";
        trackArtist.textContent = "Add tracks to your library";
    }
}

// Load a track by index
function loadTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    currentTrackIndex = index;
    const track = playlist[currentTrackIndex];
    
    audioElement.src = track.path;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    
    // Save current state
    savePlayerState();
    
    // Auto-play if player was playing
    if (isPlaying) {
        audioElement.play().catch(error => {
            console.error("Playback failed:", error);
            isPlaying = false;
            updatePlayButton();
        });
    }
    
    // Update time display when metadata loads
    audioElement.addEventListener('loadedmetadata', () => {
        totalTimeDisplay.textContent = formatTime(audioElement.duration);
    });
}

// Update play/pause button
function updatePlayButton() {
    playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Toggle play/pause
function togglePlay() {
    if (playlist.length === 0) return;
    
    if (isPlaying) {
        audioElement.pause();
    } else {
        audioElement.play().catch(error => {
            console.error("Playback failed:", error);
        });
    }
    isPlaying = !isPlaying;
    updatePlayButton();
}

// Play next track (random if shuffled)
function playNextTrack() {
    if (playlist.length === 0) return;
    
    let nextIndex;
    
    if (isShuffled) {
        // Get a random track that hasn't been played recently
        const availableTracks = playlist.map((_, index) => index)
            .filter(index => !shuffleHistory.includes(index));
        
        if (availableTracks.length === 0) {
            // All tracks have been played, reset history
            shuffleHistory = [];
            nextIndex = Math.floor(Math.random() * playlist.length);
        } else {
            nextIndex = availableTracks[Math.floor(Math.random() * availableTracks.length)];
        }
        
        // Keep track of played songs (last 10)
        shuffleHistory.push(nextIndex);
        if (shuffleHistory.length > 10) {
            shuffleHistory.shift();
        }
    } else {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    
    loadTrack(nextIndex);
}

// Play previous track
function playPreviousTrack() {
    if (playlist.length === 0) return;
    
    let prevIndex;
    
    if (isShuffled) {
        // In shuffle mode, go back through history
        if (shuffleHistory.length > 1) {
            shuffleHistory.pop(); // Remove current
            prevIndex = shuffleHistory.pop(); // Get previous
            loadTrack(prevIndex);
        } else {
            // No history, just pick random
            prevIndex = Math.floor(Math.random() * playlist.length);
            loadTrack(prevIndex);
        }
    } else {
        prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        loadTrack(prevIndex);
    }
}

// Toggle shuffle mode
function toggleShuffle() {
    isShuffled = !isShuffled;
    
    // Update UI
    shuffleBtn.classList.toggle('active', isShuffled);
    shuffleBtn.querySelector('span').textContent = isShuffled ? 'Shuffle On' : 'Shuffle Off';
    
    // Reset shuffle history when turning on
    if (isShuffled) {
        shuffleHistory = [currentTrackIndex];
    }
    
    savePlayerState();
}

// Update progress bar and time display
function updateProgress() {
    if (isNaN(audioElement.duration)) return;
    
    // Update progress bar
    const progressPercent = (audioElement.currentTime / audioElement.duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Update time display
    currentTimeDisplay.textContent = formatTime(audioElement.currentTime);
    totalTimeDisplay.textContent = formatTime(audioElement.duration);
}

// Seek in track
function seekTrack(e) {
    if (isNaN(audioElement.duration)) return;
    
    const seekPosition = (e.offsetX / progressContainer.clientWidth) * audioElement.duration;
    audioElement.currentTime = seekPosition;
}

// Save player state to localStorage
function savePlayerState() {
    const playerState = {
        currentTrackIndex,
        isShuffled,
        volume: volumeSlider.value,
        isPlaying
    };
    localStorage.setItem('lofiPlayerState', JSON.stringify(playerState));
}

// Load player state from localStorage
function loadPlayerState() {
    const savedState = localStorage.getItem('lofiPlayerState');
    if (savedState) {
        const state = JSON.parse(savedState);
        currentTrackIndex = state.currentTrackIndex || 0;
        isShuffled = state.isShuffled || false;
        volumeSlider.value = state.volume || 0.7;
        isPlaying = state.isPlaying || false;
        
        // Update shuffle button if needed
        if (isShuffled) {
            shuffleBtn.classList.add('active');
            shuffleBtn.querySelector('span').textContent = 'Shuffle On';
            shuffleHistory = [currentTrackIndex];
        }
        
        updatePlayButton();
    }
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNextTrack);
prevBtn.addEventListener('click', playPreviousTrack);
audioElement.addEventListener('timeupdate', updateProgress);
audioElement.addEventListener('ended', playNextTrack);
progressContainer.addEventListener('click', seekTrack);
volumeSlider.addEventListener('input', () => {
    audioElement.volume = volumeSlider.value;
    savePlayerState();
});
shuffleBtn.addEventListener('click', toggleShuffle);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return; // Ignore if typing in input
    
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowRight':
            playNextTrack();
            break;
        case 'ArrowLeft':
            playPreviousTrack();
            break;
        case 'KeyS':
            toggleShuffle();
            break;
    }
});

// Initialize the player when DOM is loaded
document.addEventListener('DOMContentLoaded', initPlayer);
