const STORAGE_KEY = 'family-media-agent-videos';

class FamilyMediaAgent {
  constructor() {
    this.images = [];
    this.videos = [];
    this.currentTab = 'create';
    this.isCreating = false;
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.updateImageCount();
    this.loadVideosFromStorage();
    this.updateDurationDisplay();
  }

  cacheElements() {
    this.imageInput = document.getElementById('imageInput');
    this.imageUploadZone = document.getElementById('imageUploadZone');
    this.imageCounter = document.getElementById('imageCount');
    this.imagePreview = document.getElementById('previewGrid');
    this.removeAllBtn = document.querySelector('.btn-clear-images');
    this.videosList = document.getElementById('videosList');
    this.creationProgress = document.getElementById('creationProgress');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
  }

  attachEventListeners() {
    if (this.imageUploadZone && this.imageInput) {
      this.imageUploadZone.addEventListener('click', () => this.imageInput.click());
    }

    if (this.imageInput) {
      this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    if (this.imageUploadZone) {
      this.imageUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.imageUploadZone.classList.add('drag-over');
      });

      this.imageUploadZone.addEventListener('dragleave', () => {
        this.imageUploadZone.classList.remove('drag-over');
      });

      this.imageUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.imageUploadZone.classList.remove('drag-over');
        const files = e.dataTransfer && e.dataTransfer.files ? e.dataTransfer.files : [];
        this.handleImageUpload({ target: { files } });
      });
    }

    if (this.removeAllBtn) {
      this.removeAllBtn.addEventListener('click', () => this.removeAllImages());
    }
  }

  handleImageUpload(event) {
    const files = event && event.target && event.target.files ? event.target.files : [];
    if (!files || files.length === 0) return;

    for (const file of files) {
      if (!file || !file.type || !file.type.startsWith('image/')) {
        console.warn('Skipped non-image file:', file && file.name ? file.name : 'unknown');
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.images.push({
          name: file.name,
          data: e.target.result,
          timestamp: Date.now()
        });

        this.updateImageCount();
        this.renderImagePreview();
        this.showPreviewSections();
      };
      reader.onerror = () => console.error(`Failed to read file: ${file.name}`);
      reader.readAsDataURL(file);
    }
  }

  updateImageCount() {
    if (this.imageCounter) {
      this.imageCounter.textContent = `📷 Images loaded: ${this.images.length}`;
    }

    const imageStats = document.getElementById('imageStats');
    const previewSection = document.getElementById('previewSection');
    const videoSettingsSection = document.getElementById('videoSettingsSection');
    const controlButtons = document.getElementById('controlButtons');

    if (this.images.length > 0) {
      if (imageStats) imageStats.style.display = 'block';
      if (previewSection) previewSection.style.display = 'block';
      if (videoSettingsSection) videoSettingsSection.style.display = 'block';
      if (controlButtons) controlButtons.style.display = 'flex';
    } else {
      if (imageStats) imageStats.style.display = 'none';
      if (previewSection) previewSection.style.display = 'none';
      if (videoSettingsSection) videoSettingsSection.style.display = 'none';
      if (controlButtons) controlButtons.style.display = 'none';
    }
  }

  showPreviewSections() {
    const previewSection = document.getElementById('previewSection');
    const videoSettingsSection = document.getElementById('videoSettingsSection');
    const controlButtons = document.getElementById('controlButtons');

    if (previewSection) previewSection.style.display = 'block';
    if (videoSettingsSection) videoSettingsSection.style.display = 'block';
    if (controlButtons) controlButtons.style.display = 'flex';
  }

  renderImagePreview() {
    if (!this.imagePreview) return;

    if (this.images.length === 0) {
      this.imagePreview.innerHTML = '<p class="empty-message" style="grid-column:1/-1;">No images yet</p>';
      return;
    }

    this.imagePreview.innerHTML = this.images.map((img, idx) => `
      <div class="preview-item" data-index="${idx}">
        <img src="${img.data}" alt="${img.name}">
        <span class="preview-item-number">${idx + 1}</span>
        <button class="preview-item-remove" type="button" onclick="mediaAgent.removeImage(${idx})">×</button>
      </div>
    `).join('');
  }

  removeImage(index) {
    if (index < 0 || index >= this.images.length) return;
    this.images.splice(index, 1);
    this.updateImageCount();
    this.renderImagePreview();
  }

  removeAllImages() {
    this.images = [];
    this.updateImageCount();
    this.renderImagePreview();
  }

  updateDurationDisplay() {
    const duration = Number(document.getElementById('imageDuration')?.value || 3);
    const display = document.getElementById('durationDisplay');
    if (display) display.textContent = `${duration}s`;

    const estimatedLength = document.getElementById('estimatedLength');
    const totalSeconds = this.images.length * duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (estimatedLength) {
      estimatedLength.textContent = `Estimated video length: ${minutes}m ${seconds}s`;
    }

    const estimatedSize = document.getElementById('estimatedSize');
    if (estimatedSize) {
      const qualityMultiplier = {
        480: 0.4,
        720: 0.8,
        1080: 1.2
      };
      const qualityKey = Number(document.getElementById('videoQuality')?.value || 720);
      const sizeMB = ((this.images.length * duration * qualityMultiplier[qualityKey] || 1) / 2).toFixed(1);
      estimatedSize.textContent = `Estimated file size: ${sizeMB} MB`;
    }
  }

  async createVideoSlideshow() {
    if (this.isCreating) {
      alert('Video creation already in progress. Please wait.');
      return;
    }

    if (!this.images || this.images.length === 0) {
      alert('Please upload at least one image first.');
      return;
    }

    this.isCreating = true;
    const duration = Number(document.getElementById('imageDuration')?.value || 3);
    const quality = Number(document.getElementById('videoQuality')?.value || 720);
    const name = (document.getElementById('videoName')?.value || 'Family Memories').trim() || 'Family Memories';

    this.showProgress();
    this.setProgress(5, 'Preparing images...');

    const width = quality >= 1080 ? 1920 : quality >= 720 ? 1280 : 854;
    const height = quality >= 1080 ? 1080 : quality >= 720 ? 720 : 480;
    const fps = 30;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Check if captureStream is supported
      if (!canvas.captureStream) {
        throw new Error('Canvas recording not supported in this browser. Please use Chrome, Firefox, or Edge.');
      }

      // Preload all images
      const loadedImages = [];
      for (let i = 0; i < this.images.length; i++) {
        this.setProgress(Math.min(20, 5 + ((i / this.images.length) * 15)), `Loading photo ${i + 1}/${this.images.length}`);
        const img = await this.loadImage(this.images[i].data);
        loadedImages.push(img);
      }

      this.setProgress(25, 'Initializing video encoder...');

      // Setup MediaRecorder with proper MIME type
      const mimeType = this.getSupportedMimeType();
      const stream = canvas.captureStream(fps);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      // Promise wrapper for recorder stop event
      const recordingComplete = new Promise((resolve) => {
        recorder.onstop = () => {
          resolve(chunks);
        };
      });

      recorder.start();
      this.setProgress(30, 'Rendering frames...');

      // Render frames with proper timing
      let frameCount = 0;
      const totalFrames = this.images.length * duration * fps;

      for (let i = 0; i < this.images.length; i++) {
        const img = loadedImages[i];
        
        // Draw image on canvas
        const maxDim = Math.max(img.width, img.height);
        const scale = Math.min(width / maxDim, height / maxDim);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const x = (width - drawW) / 2;
        const y = (height - drawH) / 2;

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, x, y, drawW, drawH);

        // Display frame for the specified duration
        const frameDurationMs = 1000 / fps; // milliseconds per frame
        const totalFramesPerImage = duration * fps;

        for (let f = 0; f < totalFramesPerImage; f++) {
          frameCount++;
          const progress = 30 + ((frameCount / totalFrames) * 65);
          this.setProgress(Math.min(95, progress), `Rendering frames... ${frameCount}/${totalFrames}`);
          
          await this.wait(frameDurationMs);
        }
      }

      this.setProgress(96, 'Finalizing video...');
      recorder.stop();

      // Wait for recording to complete
      const videoChunks = await recordingComplete;

      this.setProgress(98, 'Creating download link...');

      // Create video blob
      const blob = new Blob(videoChunks, { type: mimeType || 'video/mp4' });
      
      if (blob.size === 0) {
        throw new Error('Video recording produced empty file. Please try again.');
      }

      const videoDataUrl = URL.createObjectURL(blob);
      const extension = mimeType && mimeType.includes('webm') ? 'webm' : 'mp4';
      const cleanedName = `${name.replace(/\s+/g, '-') || 'family-memories'}-${Date.now()}.${extension}`;

      const videoRecord = {
        name: cleanedName,
        dataUrl: videoDataUrl,
        createdAt: new Date().toISOString(),
        size: blob.size
      };

      const stored = this.readStoredVideos();
      stored.unshift(videoRecord);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored.slice(0, 20)));
      this.videos = stored.slice(0, 20);
      this.renderVideosList();
      
      this.setProgress(100, 'Video ready!');
      await this.wait(500);
      this.hideProgress();
      
      this.resetAgent();
      alert(`🎬 Slideshow created!\n\n"${cleanedName}" has been saved in My Videos.\n\nFile size: ${this.formatBytes(blob.size)}\n\nIt will now download to your device.`);
      this.triggerDownload(videoDataUrl, cleanedName);

    } catch (error) {
      console.error('Video creation failed:', error);
      this.hideProgress();
      alert(`❌ Error creating video:\n\n${error.message}\n\nPlease try:\n1. Using a different browser (Chrome, Firefox, Edge)\n2. Reducing the number of photos\n3. Reducing video quality\n4. Checking browser console for more details`);
    } finally {
      this.isCreating = false;
    }
  }

  async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src.substring(0, 50)}...`));
      img.src = src;
    });
  }

  wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getSupportedMimeType() {
    const types = [
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    for (const type of types) {
      try {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log('Using MIME type:', type);
          return type;
        }
      } catch (e) {
        console.warn('Error checking MIME type:', type, e);
      }
    }
    
    console.warn('No supported MIME type found, using default');
    return '';
  }

  setProgress(percent, text) {
    if (this.progressFill) this.progressFill.style.width = `${Math.round(percent)}%`;
    if (this.progressText) this.progressText.textContent = `${text} ${Math.round(percent)}%`;
  }

  showProgress() {
    if (this.creationProgress) this.creationProgress.style.display = 'block';
  }

  hideProgress() {
    if (this.creationProgress) this.creationProgress.style.display = 'none';
  }

  readStoredVideos() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn('Could not read stored videos:', error);
      return [];
    }
  }

  loadVideosFromStorage() {
    this.videos = this.readStoredVideos();
    this.renderVideosList();
  }

  renderVideosList() {
    if (!this.videosList) return;

    const videos = this.readStoredVideos();
    if (!videos || videos.length === 0) {
      this.videosList.innerHTML = '<p class="empty-message">No videos created yet. Go to "Create Slideshow" to get started!</p>';
      return;
    }

    this.videosList.innerHTML = videos.map((video) => `
      <div class="video-card">
        <div class="video-player">
          <video controls width="100%" playsinline autoplay="${this.isAutoplayEnabled()}" loop="${this.isLoopEnabled()}"></video>
        </div>
        <div class="video-info">
          <p class="video-name">${video.name}</p>
          <p class="video-size">${this.formatBytes(video.size || 0)}</p>
          <div class="video-actions">
            <a href="${video.dataUrl}" download="${video.name}" class="btn-download">📥 Download</a>
            <button class="btn-delete" type="button" onclick="mediaAgent.deleteVideo('${video.name}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    const videoElements = this.videosList.querySelectorAll('video');
    videos.forEach((videoItem, index) => {
      const videoElement = videoElements[index];
      if (!videoElement) return;
      videoElement.src = videoItem.dataUrl;
      videoElement.autoplay = this.isAutoplayEnabled();
      videoElement.loop = this.isLoopEnabled();
    });
  }

  isAutoplayEnabled() {
    return document.getElementById('autoplayVideos')?.checked !== false;
  }

  isLoopEnabled() {
    return document.getElementById('loopVideos')?.checked !== false;
  }

  formatBytes(bytes) {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }

  deleteVideo(name) {
    const videos = this.readStoredVideos().filter((video) => video.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(videos));
    this.videos = videos;
    this.renderVideosList();
  }

  triggerDownload(dataUrl, fileName) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  resetAgent() {
    this.images = [];
    this.updateImageCount();
    this.renderImagePreview();
    const videoName = document.getElementById('videoName');
    if (videoName) videoName.value = 'Family Memories';
    const duration = document.getElementById('imageDuration');
    if (duration) duration.value = 3;
    const quality = document.getElementById('videoQuality');
    if (quality) quality.value = '720';
    const track = document.getElementById('musicTrack');
    if (track) track.value = 'none';
    this.updateDurationDisplay();
    switchTab('create');
  }
}

function clearImages() {
  if (window.mediaAgent) {
    window.mediaAgent.removeAllImages();
  }
}

function createVideoSlideshow() {
  if (window.mediaAgent) {
    window.mediaAgent.createVideoSlideshow();
  }
}

function updateDurationDisplay() {
  if (window.mediaAgent) {
    window.mediaAgent.updateDurationDisplay();
  }
}

function switchTab(tabName, event) {
  document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));

  const selectedTab = document.getElementById(`${tabName}Tab`);
  if (selectedTab) selectedTab.classList.add('active');

  if (event && event.target) {
    event.target.classList.add('active');
  }

  if (tabName === 'gallery' && window.mediaAgent) {
    window.mediaAgent.loadVideosFromStorage();
  }
}

function resetAgent() {
  if (window.mediaAgent) {
    window.mediaAgent.resetAgent();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.mediaAgent = new FamilyMediaAgent();
  updateDurationDisplay();
});
