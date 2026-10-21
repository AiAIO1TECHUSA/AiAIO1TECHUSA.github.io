document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const uploadButton = document.getElementById('uploadButton');
  const videoContainer = document.getElementById('videoContainer');
  const mainVideoDisplay = document.getElementById('mainVideoDisplay');
  const videoCount = document.getElementById('videoCount');
  const prevBtn = document.getElementById('prevVideoBtn');
  const nextBtn = document.getElementById('nextVideoBtn');
  const videoCounter = document.getElementById('videoCounter');

  let videos = []; // Array to store video objects
  let currentVideoIndex = 0;

  // Button click opens file picker
  uploadButton.addEventListener('click', function() {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        const videoData = event.target.result;
        const videoId = `video_${Date.now()}_${Math.random()}`;
        
        // Save to localStorage
        localStorage.setItem(videoId, videoData);
        
        // Add to videos array
        videos.push({
          id: videoId,
          name: file.name,
          data: videoData
        });

        // Display video
        displayVideo(videoId, file.name, videoData);
        updateCounter();
        displayMainVideo(0); // Show first video in main display
      };
      reader.readAsDataURL(file);
    });
  });

  // Display video as thumbnail in grid
  function displayVideo(videoId, fileName, videoData) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.dataset.videoId = videoId;
    videoItem.innerHTML = `
      <video>
        <source src="${videoData}" type="video/mp4">
      </video>
      <div class="video-item-info">
        <p class="video-item-title">${fileName}</p>
        <button class="video-item-delete" type="button">Delete</button>
      </div>
    `;
    
    // Thumbnail click switches main video
    videoItem.addEventListener('click', function(e) {
      if (!e.target.classList.contains('video-item-delete')) {
        const index = videos.findIndex(v => v.id === videoId);
        if (index !== -1) {
          currentVideoIndex = index;
          displayMainVideo(currentVideoIndex);
        }
      }
    });
    
    // Delete button
    const deleteBtn = videoItem.querySelector('.video-item-delete');
    deleteBtn.addEventListener('click', function() {
      localStorage.removeItem(videoId);
      videos = videos.filter(v => v.id !== videoId);
      videoItem.remove();
      updateCounter();
      
      // Reset main video if needed
      if (currentVideoIndex >= videos.length && videos.length > 0) {
        currentVideoIndex = videos.length - 1;
      }
      displayMainVideo(currentVideoIndex);
    });
    
    videoContainer.appendChild(videoItem);
  }

  // Display video in main player
  function displayMainVideo(index) {
    if (videos.length === 0) {
      mainVideoDisplay.innerHTML = '<p style="text-align: center; padding: 2rem; color: #002868;">No videos uploaded yet</p>';
      return;
    }

    if (index < 0) currentVideoIndex = 0;
    if (index >= videos.length) currentVideoIndex = videos.length - 1;

    const video = videos[currentVideoIndex];
    mainVideoDisplay.innerHTML = `
      <video controls>
        <source src="${video.data}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="main-video-info">
        <p class="main-video-title">${video.name}</p>
      </div>
    `;

    updateNavButtons();
  }

  // Update counter and nav buttons
  function updateCounter() {
    videoCount.textContent = videos.length;
    videoCounter.textContent = `${currentVideoIndex + 1} / ${videos.length}`;
    updateNavButtons();
  }

  function updateNavButtons() {
    prevBtn.disabled = currentVideoIndex === 0;
    nextBtn.disabled = currentVideoIndex === videos.length - 1;
  }

  // Navigation
  prevBtn.addEventListener('click', function() {
    if (currentVideoIndex > 0) {
      currentVideoIndex--;
      displayMainVideo(currentVideoIndex);
      updateCounter();
    }
  });

  nextBtn.addEventListener('click', function() {
    if (currentVideoIndex < videos.length - 1) {
      currentVideoIndex++;
      displayMainVideo(currentVideoIndex);
      updateCounter();
    }
  });

  // Load videos from localStorage on page load
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('video_')) {
      const videoData = localStorage.getItem(key);
      videos.push({
        id: key,
        name: `Video ${videos.length + 1}`,
        data: videoData
      });
    }
  }

  // Display all videos
  videos.forEach((video) => {
    displayVideo(video.id, video.name, video.data);
  });

  updateCounter();
  if (videos.length > 0) {
    displayMainVideo(0);
  } else {
    mainVideoDisplay.innerHTML = '<p style="text-align: center; padding: 2rem; color: #002868;">No videos uploaded yet</p>';
  }
});
