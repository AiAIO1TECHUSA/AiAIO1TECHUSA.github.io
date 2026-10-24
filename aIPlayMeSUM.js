// ========== #PlayMeSUM Interactive Playlist System ==========

const playlistsData = {
  vol1: [
    "Becky G. ft. Bad Bunny – Mayores",
    "Selena Gomez & The Scene – Love You Like a Love Song",
    "Fifth Harmony – Work from Home ft. Ty Dolla $ign",
    "Shawn Mendes & Hailee Steinfeld – Stitches",
    "Taylor Swift – ME! ft. Brendon Urie",
    "Dua Lipa – X Jaguar Pace Remix",
    "Dua Lipa – Last Dance",
    "Dua Lipa – Electricity",
    "Luis Fonsi – Despacito ft. Daddy Yankee",
    "Taylor Swift – Shape of You",
    "Can't Stop the Feeling",
    "Let Her Go",
    "Wake Me Up",
    "If I Die Young",
    "Fight Song",
    "1,000 Ships",
    "What Doesn't Kill You",
    "Cheap Thrills",
    "La Sonora Carruseles – La Salsa Llegó",
    "J Balvin & Pitbull – Hey Ma ft. Camila Cabello",
    "One Republic – Counting Stars"
  ],
  vol2: [
    "Maroon 5 – What Lovers Do",
    "Avicii, Rita Ora – Lonely Together",
    "Coldplay – Hymn for the Weekend",
    "Marian Hill – Down",
    "Haim – I Want You Back",
    "Taylor Swift – Shake It Off",
    "Taylor Swift – Delicate",
    "Rachel Platten – A Better Place",
    "Camila Cabello – Real Friends",
    "Pitbull – Don't Stop the Party",
    "Sweet Dreams",
    "Coldplay – Adventure of a Lifetime",
    "Camila Cabello – Never Be the Same",
    "David Guetta ft. Sia – Titanium",
    "Dua Lipa – Be The One",
    "Kesha – This Is Me"
  ],
  vol3: [
    "La Sonora Discos Fuentes – Arranca En Fa",
    "Fruko y sus Tesos – Cachondea Del los Cueros",
    "Fruko y sus Tesos – Vengo Caliente",
    "Oscar De Leon – Llorarás",
    "Marc Anthony – Flor Pálida",
    "Marc Anthony – Vivir Mi Vida",
    "Daddy Yankee – Dura (REMIX) ft. Bad Bunny, Natti Natasha & Becky G"
  ],
  vol4: [
    "Kylie Minogue – Stop Me from Falling",
    "Enrique Iglesias – Bailando",
    "Rachel Platten – Siempre Estaré Ahí",
    "Sophia Reyes – 1, 2, 3",
    "Daddy Yankee – Dura",
    "Becky G – Mayores",
    "Camila Cabello – Havana",
    "J Balvin – Mi Gente"
  ],
  vol5: [
    "Maroon 5 – Girls Like You ft. Cardi B",
    "Ed Sheeran – Thinking Out Loud",
    "Ed Sheeran – Shape of You",
    "Ed Sheeran – Perfect",
    "Christina Perri – A Thousand Years",
    "Bruno Mars – Marry You",
    "Bruno Mars – Grenade",
    "Bruno Mars – Locked out of Heaven",
    "Bruno Mars – Just the Way You Are"
  ]
};

// ========== Play Song on Spotify ==========
function playSongSpotify(songName) {
  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(songName)}`;
  window.open(spotifySearchUrl, '_blank');
}

// ========== Load Playlist ==========
function loadPlaylist(volumeKey) {
  const playlistDisplay = document.querySelector('[data-playlist-display]');
  const songs = playlistsData[volumeKey] || [];
  
  playlistDisplay.innerHTML = '';
  
  songs.forEach((song, index) => {
    const item = document.createElement('div');
    item.className = 'playlist-item';
    item.innerHTML = `
      <span class="playlist-item-title">${index + 1}. ${song}</span>
      <button class="play-btn" onclick="playSongSpotify('${song.replace(/'/g, "\\'")}')">🎵 Play</button>
    `;
    playlistDisplay.appendChild(item);
  });
  
  // Update active tab
  document.querySelectorAll('.playlist-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-volume="${volumeKey}"]`).classList.add('active');
}

// ========== Initialize Ticker Animation ==========
function initTickerAnimation() {
  const tickerContent = document.querySelector('.ticker-content');
  if (!tickerContent) return;
  
  const clone = tickerContent.cloneNode(true);
  tickerContent.parentElement.appendChild(clone);
}

// ========== Initialize YouTube Integration ==========
function initYouTubeIntegration() {
  const youtubeSection = document.querySelector('[data-youtube-section]');
  if (!youtubeSection) return;
  
  youtubeSection.innerHTML = `
    <a href="https://www.youtube.com/@AiAiO1TECHUSA?sub_confirmation=1" 
       class="youtube-subscribe-btn" 
       target="_blank">
      Subscribe on YouTube → @AiAiO1TECHUSA
    </a>
    
    <iframe 
      width="100%" 
      height="315" 
      src="https://www.youtube.com/embed/SvXfIarbGJs" 
      title="YouTube video player" 
      frameborder="0" 
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
      allowfullscreen>
    </iframe>
  `;
}

// ========== Initialize All Systems ==========
document.addEventListener('DOMContentLoaded', () => {
  // Load default playlist (Vol. 1)
  loadPlaylist('vol1');
  
  // Setup playlist tabs
  document.querySelectorAll('.playlist-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      loadPlaylist(e.target.dataset.volume);
    });
  });
  
  // Initialize animations & integrations
  initTickerAnimation();
  initYouTubeIntegration();
});
