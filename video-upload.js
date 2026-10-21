let videoArray = [];
let currentVideoIndex = 0;
let playAllMode = false;

document.addEventListener('DOMContentLoaded', function() {
  const uploadArea = document.querySelector('.video-upload-area'); // Use class selector
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadButton'); // FIXED: was 'uploadBtn'
  const mainVideoDisplay = document.getElementById('mainVideoDisplay');
  const videoContainer = document.getElementById('videoContainer');
  const videoCounter = document.getElementById('videoCounter');
  const prevVideoBtn = document.getElementById('prevVideoBtn');
  const nextVideoBtn = document.getElementById('nextVideoBtn');
  const playAllBtn = document.createElement('button');

  // Validate all elements exist
  if (!uploadArea || !fileInput || !uploadBtn || !mainVideoDisplay || !videoContainer) {
    console.error('Missing required elements. Check IDs in HTML.');
    return;
  }

  // Create "Play All" button
  playAllBtn.id = 'playAllBtn';
  playAllBtn.textContent = 'Play All';
  playAllBtn.style.cssText = `
    padding: 10px 20px;
    background: linear-gradient(135deg, #BF0A30, #002868);
    color: #fff;
    border: 2px solid #FFB81C;
    cursor: pointer;
    font-weight: bold;
    margin-top: 10px;
    border-radius: 4px;
  `;
  uploadArea.parentElement.insertBefore(playAllBtn, uploadArea.nextSibling);

  // Upload button click
  uploadBtn.addEventListener('click', () => fileInput.click());

  // File input change
  fileInput.addEventListener('change', handleFileUpload);

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#FFB81C';
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#BF0A30';
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#BF0A30';
    handleFileUpload({ target: { files: e.dataTransfer.files } });
  });

  // Handle file upload
  function handleFileUpload(e) {
    const files = e.target.files;
    for (let file of files) {
      if (file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          videoArray.push({
            name: file.name,
            data: event.target.result
          });
          renderVideos();
          updateCounter();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Render video thumbnails
  function renderVideos() {
    videoContainer.innerHTML = '';
    videoArray.forEach((video, index) => {
      const videoItem = document.createElement('div');
      videoItem.style.cssText = `
        position: relative;
        width: 120px;
        height: 90px;
        margin: 10px;
        cursor: pointer;
        border: 2px solid #FFB81C;
        background: #002868;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        text-align: center;
        padding: 5px;
        box-sizing: border-box;
      `;
      videoItem.innerHTML = `<span>${video.name}</span>`;
      
      // Play video on thumbnail click
      videoItem.addEventListener('click', () => {
        currentVideoIndex = index;
        mainVideoDisplay.src = video.data;
        mainVideoDisplay.play();
        updateCounter();
      });

      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '✕';
      deleteBtn.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        background: #BF0A30;
        color: #fff;
        border: none;
        cursor: pointer;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        font-size: 12px;
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        videoArray.splice(index, 1);
        renderVideos();
        updateCounter();
      });
      videoItem.appendChild(deleteBtn);
      videoContainer.appendChild(videoItem);
    });
  }

  // Update counter
  function updateCounter() {
    const total = videoArray.length;
    const current = total > 0 ? currentVideoIndex + 1 : 0;
    videoCounter.textContent = `${current} / ${total}`;
  }

  // Play All button
  playAllBtn.addEventListener('click', () => {
    playAllMode = !playAllMode;
    playAllBtn.textContent = playAllMode ? 'Playing All ⏸' : 'Play All';
    playAllBtn.style.background = playAllMode 
      ? 'linear-gradient(135deg, #FFB81C, #002868)' 
      : 'linear-gradient(135deg, #BF0A30, #002868)';
    
    if (playAllMode && videoArray.length > 0) {
      currentVideoIndex = 0;
      mainVideoDisplay.src = videoArray[0].data;
      mainVideoDisplay.play();
      updateCounter();
    }
  });

  // Auto-advance on video end (continuous playback)
  mainVideoDisplay.addEventListener('ended', () => {
    if (playAllMode && videoArray.length > 0) {
      currentVideoIndex = (currentVideoIndex + 1) % videoArray.length;
      mainVideoDisplay.src = videoArray[currentVideoIndex].data;
      mainVideoDisplay.play();
      updateCounter();
    }
  });

  // Navigation buttons
  prevVideoBtn.addEventListener('click', () => {
    if (videoArray.length > 0) {
      currentVideoIndex = (currentVideoIndex - 1 + videoArray.length) % videoArray.length;
      mainVideoDisplay.src = videoArray[currentVideoIndex].data;
      mainVideoDisplay.play();
      updateCounter();
    }
  });

  nextVideoBtn.addEventListener('click', () => {
    if (videoArray.length > 0) {
      currentVideoIndex = (currentVideoIndex + 1) % videoArray.length;
      mainVideoDisplay.src = videoArray[currentVideoIndex].data;
      mainVideoDisplay.play();
      updateCounter();
    }
  });
});
