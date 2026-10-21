document.addEventListener('DOMContentLoaded', function() {
  const fileInput = document.getElementById('fileInput');
  const uploadButton = document.getElementById('uploadButton');
  const videoContainer = document.getElementById('videoContainer');
  const videoCount = document.getElementById('videoCount');

  // Button click opens file picker
  uploadButton.addEventListener('click', function() {
    fileInput.click();
  });

  // Handle file selection
  fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    videoCount.textContent = files.length;
    
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = function(event) {
        const videoData = event.target.result;
        const videoId = `video_${Date.now()}_${index}`;
        
        // Save to localStorage
        localStorage.setItem(videoId, videoData);
        
        // Display video
        displayVideo(videoId, file.name, videoData);
      };
      reader.readAsDataURL(file);
    });
  });

  // Display video in grid
  function displayVideo(videoId, fileName, videoData) {
    const videoItem = document.createElement('div');
    videoItem.className = 'video-item';
    videoItem.innerHTML = `
      <video controls>
        <source src="${videoData}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div class="video-item-info">
        <p class="video-item-title">${fileName}</p>
        <button class="video-item-delete" type="button">Delete</button>
      </div>
    `;
    
    // Add delete functionality
    const deleteBtn = videoItem.querySelector('.video-item-delete');
    deleteBtn.addEventListener('click', function() {
      localStorage.removeItem(videoId);
      videoItem.remove();
    });
    
    videoContainer.appendChild(videoItem);
  }

  // Load videos from localStorage on page load
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('video_')) {
      const videoData = localStorage.getItem(key);
      displayVideo(key, `Video ${count + 1}`, videoData);
      count++;
    }
  }
  videoCount.textContent = count;
});
