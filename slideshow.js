// Slideshow Manager Class
class SlideshowManager {
  constructor() {
    // Pre-loaded video library
    this.videoLibrary = {
      sample1: 'https://www.example.com/videos/sample1.mp4', // Replace with your video URL
      sample2: 'https://www.example.com/videos/sample2.mp4', // Replace with your video URL
      sample3: 'https://www.example.com/videos/sample3.mp4'  // Replace with your video URL
    };

    this.uploadedVideos = []; // User-uploaded videos
    this.allVideos = [];
    this.currentIndex = 0;

    // DOM Elements
    this.videoElement = document.getElementById('main-video');
    this.videoSource = document.getElementById('video-source');
    this.uploadInput = document.getElementById('video-upload');
    this.dropZone = document.getElementById('drop-zone');
    this.prevBtn = document.getElementById('prev-btn');
    this.nextBtn = document.getElementById('next-btn');
    this.playBtn = document.getElementById('play-btn');
    this.videoCountDisplay = document.getElementById('video-count');
    this.currentVideoDisplay = document.getElementById('current-video');
    this.videoIndicator = document.getElementById('video-indicator');

    this.init();
  }

  init() {
    // File upload listeners
    this.uploadInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));
    this.dropZone.addEventListener('click', () => this.uploadInput.click());

    // Control buttons
    this.prevBtn.addEventListener('click', () => this.previousVideo());
    this.nextBtn.addEventListener('click', () => this.nextVideo());
    this.playBtn.addEventListener('click', () => this.togglePlay());

    // Video event listeners
    this.videoElement.addEventListener('play', () => this.updatePlayButton());
    this.videoElement.addEventListener('pause', () => this.updatePlayButton());

    this.updateUI();
  }

  handleFileSelect(e) {
    const files = Array.from(e.target.files);
    this.addVideos(files);
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.add('drag-over');
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove('drag-over');
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    
    if (videoFiles.length > 0) {
      this.addVideos(videoFiles);
    } else {
      alert('Please drop video files only (MP4, WebM, etc.)');
    }
  }

  addVideos(files) {
    if (files.length === 0) {
      alert('No video files selected');
      return;
    }

    files.forEach(file => {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        alert(`${file.name} is too large (max 100MB)`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.uploadedVideos.push({
          name: file.name,
          src: e.target.result,
          size: (file.size / (1024 * 1024)).toFixed(2), // MB
          type: 'uploaded'
        });
        this.updateAllVideos();
      };
      
      reader.onerror = () => {
        alert(`Error reading file: ${file.name}`);
      };
      
      reader.readAsDataURL(file);
    });
  }

  updateAllVideos() {
    this.allVideos = [...this.uploadedVideos];
    
    if (this.allVideos.length > 0) {
      this.currentIndex = 0;
      this.playVideo();
    }
    
    this.updateUI();
  }

  playVideo() {
    if (this.allVideos.length === 0) {
      alert('No videos available to play');
      return;
    }

    const video = this.allVideos[this.currentIndex];
    this.videoSource.src = video.src;
    this.videoElement.load();
    this.videoElement.play();
    this.updateUI();
  }

  previousVideo() {
    if (this.allVideos.length === 0) return;
    this.currentIndex = (this.currentIndex - 1 + this.allVideos.length) % this.allVideos.length;
    this.playVideo();
  }

  nextVideo() {
    if (this.allVideos.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.allVideos.length;
    this.playVideo();
  }

  togglePlay() {
    if (this.videoElement.paused) {
      this.videoElement.play();
    } else {
      this.videoElement.pause();
    }
  }

  updatePlayButton() {
    this.playBtn.textContent = this.videoElement.paused ? '▶ Play' : '⏸ Pause';
  }

  updateUI() {
    const uploadedCount = this.uploadedVideos.length;
    
    if (this.videoCountDisplay) {
      this.videoCountDisplay.textContent = `Videos loaded: ${uploadedCount}`;
    }

    if (this.videoIndicator && this.allVideos.length > 0) {
      this.videoIndicator.textContent = `${this.currentIndex + 1} / ${this.allVideos.length}`;
    }

    if (this.currentVideoDisplay && this.allVideos.length > 0) {
      this.currentVideoDisplay.textContent = `${this.allVideos[this.currentIndex].name}`;
    }

    // Disable/enable navigation buttons
    if (this.prevBtn) this.prevBtn.disabled = this.allVideos.length === 0;
    if (this.nextBtn) this.nextBtn.disabled = this.allVideos.length === 0;
    if (this.playBtn) this.playBtn.disabled = this.allVideos.length === 0;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SlideshowManager();
});
