const STORAGE_KEY = 'family-media-agent-videos';

class FamilyMediaAgent {
  constructor() {
    this.images = [];
    this.videos = [];
    this.currentTab = 'create';
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
    if (!this.images || this.images.length === 0) {
      alert('Please upload at least one image first.');
      return;
    }

    const duration = Number(document.getElementById('imageDuration')?.value || 3);
    const quality = Number(document.getElementById('videoQuality')?.value || 720);
    const name = (document.getElementById('videoName')?.value || 'Family Memories').trim() || 'Family Memories';

    this.showProgress();
    this.setProgress(5, 'Preparing images...');

    const width = quality >= 1080 ? 1920 : quality >= 720 ? 1280 : 854;
    const height = quality >= 1080 ? 1080 : quality >= 720 ? 720 : 480;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    const frames = [];
    for (let i = 0; i < this.images.length; i++) {
      this.setProgress(Math.min(90, 10 + ((i / this.images.length) * 70)), `Loading photo ${i + 1}/${this.images.length}`);
      const img = await this.loadImage(this.images[i].data);
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

      const frame = await this.captureCanvasFrame(canvas);
      frames.push(frame);
    }

    const mimeType = this.getSupportedMimeType();
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks = [];

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) chunks.push(event.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType || 'video/mp4' });
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
      this.resetAgent();
      this.setProgress(100, 'Video ready!');
      setTimeout(() => this.hideProgress(), 1200);
      alert(`🎬 Slideshow created!\n\n"${cleanedName}" has been saved in My Videos.\n\nIt will also download automatically when opened.`);
      this.triggerDownload(videoDataUrl, cleanedName);
    };

    this.setProgress(95, 'Rendering video...');
    recorder.start();

    for (let i = 0; i < frames.length; i++) {
      const frame = frames[i];
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(frame, 0, 0, width, height);
      await this.wait(duration * 1000 / 2);
    }

    recorder.stop();
  }

  async loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  captureCanvasFrame(canvas) {
    return new Promise((resolve) => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(canvas, 0, 0);
      resolve(tempCanvas);
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
      'video/webm'
    ];

    return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  }

  setProgress(percent, text) {
    if (this.progressFill) this.progressFill.style.width = `${percent}%`;
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
