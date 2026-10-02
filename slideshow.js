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
    this.totalSizeDisplay = document.getElementById('total-size');
    this.currentVideoDisplay = document.getElementById('current-video');
    this.videoIndicator = document.getElementById('video-indicator');
    this.statusMessage = document.getElementById('status-message');
    this.quickSelectBtns = document.querySelectorAll('.quick-select-btn');

    this.init();
  }

  init() {
    // File upload listeners
    this.uploadInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('drop', (e) => this.handleDrop(e));

    // Control buttons
    this.prevBtn.addEventListener('click', () => this.previousVideo());
    this.nextBtn.addEventListener('click', () => this.nextVideo());
    this.playBtn.addEventListener('click', () => this.togglePlay());

    // Quick select buttons
    this.quickSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => this.loadQuickVideo(btn.dataset.video));
    });

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
    this.dropZone.style.background = 'rgba(255, 255, 255, 0.3)';
  }

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.style.background = 'rgba(255, 255, 255, 0.1)';
    
    const files = Array.from(e.dataTransfer.files);
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    this.addVideos(videoFiles);
  }

  addVideos(files) {
    if (files.length === 0) {
      this.updateStatus('No video files selected', 'empty');
      return;
    }

    files.forEach(file => {
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
      reader.readAsDataURL(file);
    });

    this.updateStatus('Videos processing...', 'processing');
  }

  loadQuickVideo(videoKey) {
    if (this.videoLibrary[videoKey]) {
      this.allVideos = [{
        name: videoKey.replace(/([A-Z])/g, ' $1'),
        src: this.videoLibrary[videoKey],
        type: 'library'
      }];
      this.currentIndex = 0;
      this.playVideo();
      this.updateStatus('🤖 Library video loaded', 'active');
    }
  }

  updateAllVideos() {
    // Combine library videos (on demand) with uploaded videos
    this.allVideos = [
      ...Object.entries(this.videoLibrary).map(([key, url]) => ({
        name: key.replace(/([A-Z])/g, ' $1'),
        src: url,
        type: 'library'
      })),
      ...this.uploadedVideos
    ];

    this.updateUI();
    this.updateStatus('✅ Videos ready to play', 'active');
  }

  playVideo() {
    if (this.allVideos.length === 0) {
      this.updateStatus('No videos available', 'empty');
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
    const libraryCount = Object.keys(this.videoLibrary).length;
    const totalCount = uploadedCount + libraryCount;

    this.videoCountDisplay.textContent = `Videos loaded: ${uploadedCount}`;
    
    const totalSize = this.uploadedVide
