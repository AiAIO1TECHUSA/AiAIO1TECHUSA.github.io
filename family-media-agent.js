// Family Media Agent - Complete Frontend Upload Flow
class FamilyMediaAgent {
  constructor() {
    this.images = [];
    this.videos = [];
    this.currentTab = 'create';
    this.apiClient = new MediaAgentAPIClient('http://localhost:3000');
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.updateImageCount();
    this.loadVideos();
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

    console.log('FamilyMediaAgent initialized');
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
        this.imageUploadZone.style.borderColor = '#667eea';
        this.imageUploadZone.style.background = 'rgba(102, 126, 234, 0.1)';
      });

      this.imageUploadZone.addEventListener('dragleave', () => {
        this.imageUploadZone.style.borderColor = '';
        this.imageUploadZone.style.background = '';
      });

      this.imageUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.imageUploadZone.style.borderColor = '';
        this.imageUploadZone.style.background = '';
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

    let imageCount = 0;

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

        imageCount++;
        console.log(`Image added: ${file.name} (Total: ${this.images.length})`);
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
      this.imagePreview.innerHTML = '<p style="text-align:center; opacity:0.6; grid-column:1 / -1;">No images yet</p>';
      return;
    }

    this.imagePreview.innerHTML = this.images.map((img, idx) => `
      <div class="image-item" draggable="true" data-index="${idx}">
        <img src="${img.data}" alt="${img.name}" loading="lazy">
        <div class="image-info">${img.name}</div>
        <button class="remove-btn" type="button" onclick="mediaAgent.removeImage(${idx})">✕</button>
      </div>
    `).join('');
  }

  removeImage(index) {
    if (index < 0 || index >= this.images.length) return;
    this.images.splice(index, 1);
    this.updateImageCount();
    this.renderImagePreview();
    console.log(`Image removed. Remaining: ${this.images.length}`);
  }

  removeAllImages() {
    this.images = [];
    this.updateImageCount();
    this.renderImagePreview();
    console.log('All images cleared');
  }

  async createVideoSlideshow() {
    if (!this.images || this.images.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    const videoName = document.getElementById('videoName')?.value || 'Family Memories';
    const duration = document.getElementById('imageDuration')?.value || 3;

    try {
      if (this.creationProgress) this.creationProgress.style.display = 'block';
      this.updateProgress(0, 'Creating video...');

      // Create mock video blob
      const blob = this.createMockVideo(videoName, this.images.length, duration);
      this.updateProgress(10, 'Preparing file...');

      // Try to upload to backend if available
      let uploadSuccess = false;
      try {
        this.updateProgress(20, 'Uploading to server...');
        const result = await this.apiClient.uploadVideo(blob, (progress) => {
          this.updateProgress(Math.min(90, 20 + (progress / 100) * 70), 'Uploading...');
        });

        if (result && result.success) {
          uploadSuccess = true;
          this.updateProgress(100, 'Upload complete!');
          console.log('Video uploaded:', result);
        }
      } catch (uploadError) {
        console.warn('Server upload failed, falling back to local download:', uploadError.message);
      }

      setTimeout(() => {
        this.resetAgent();

        if (uploadSuccess) {
          this.loadVideos();
          alert(`✅ Video "${videoName}" created and uploaded!\\n\\nView it in the "My Videos" tab.`);
        } else {
          // Offer local download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = blob.name;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          alert(`📥 Video "${videoName}" created!\\n\\nFile download started (check your Downloads folder).\\n\\nNote: Server upload is only available when running the Node.js backend locally.`);
        }
      }, 1200);

    } catch (error) {
      console.error('Video creation failed:', error);
      this.updateProgress(0, 'Creation failed');
      alert(`❌ Failed to create video: ${error.message}`);
      if (this.creationProgress) this.creationProgress.style.display = 'none';
    }
  }

  createMockVideo(name, imageCount, duration) {
    const text = `Family Memories\\n${imageCount} photos\\n${duration}s each\\nCreated: ${new Date().toLocaleString()}`;
    const blob = new Blob([text], { type: 'video/mp4' });
    blob.name = `${name.replace(/\\s+/g, '-')}-${Date.now()}.mp4`;
    return blob;
  }

  updateProgress(percent, text) {
    if (this.progressFill) this.progressFill.style.width = percent + '%';
    if (this.progressText) this.progressText.textContent = text + ` ${Math.round(percent)}%`;
  }

  async loadVideos() {
    try {
      const data = await this.apiClient.listVideos();
      this.videos = data.videos || [];
      this.renderVideosList();
    } catch (error) {
      console.warn('Failed to load videos from server:', error.message);
      this.videos = [];
      this.renderVideosList();
    }
  }

  renderVideosList() {
    if (!this.videosList) return;

    if (this.videos.length === 0) {
      this.videosList.innerHTML = '<p class="empty-message">No videos uploaded to server yet.\\n\\nNote: Videos created locally will download to your device (check Downloads folder). To see them here, run the Node.js backend server.</p>';
      return;
    }

    this.videosList.innerHTML = this.videos.map(video => `
      <div class="video-card">
        <div class="video-player">
          <video controls width="100%">
            <source src="${video.url}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="video-info">
          <p class="video-name">${video.filename}</p>
          <p class="video-size">${(video.size / 1024 / 1024).toFixed(2)} MB</p>
          <div class="video-actions">
            <a href="${video.url}" download class="btn-download">📥 Download</a>
            <button class="btn-delete" onclick="mediaAgent.deleteVideo('${video.filename}')">🗑️ Delete</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  async deleteVideo(filename) {
    if (!confirm(`Delete "${filename}"?`)) return;

    try {
      await this.apiClient.deleteVideo(filename);
      console.log('Video deleted:', filename);
      this.loadVideos();
    } catch (error) {
      console.error('Delete failed:', error);
      alert(`Failed to delete video: ${error.message}`);
    }
  }
}

// Global helpers
function clearImages() {
  if (window.mediaAgent) window.mediaAgent.removeAllImages();
}

function switchTab(tabName, event) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) selectedTab.classList.add('active');

  if (event && event.target) event.target.classList.add('active');

  if (tabName === 'gallery' && window.mediaAgent) {
    window.mediaAgent.loadVideos();
  }
}

function createVideoSlideshow() {
  if (window.mediaAgent) window.mediaAgent.createVideoSlideshow();
}

function resetAgent() {
  if (window.mediaAgent) {
    window.mediaAgent.removeAllImages();
    document.getElementById('videoName').value = 'Family Memories';
    document.getElementById('imageDuration').value = 3;
    document.getElementById('videoQuality').value = '720';
    document.getElementById('musicTrack').value = 'none';
    document.getElementById('creationProgress').style.display = 'none';
    switchTab('create');
  }
}

function updateDurationDisplay() {
  const duration = document.getElementById('imageDuration').value;
  const display = document.getElementById('durationDisplay');
  if (display) display.textContent = duration + 's';

  if (window.mediaAgent) {
    const totalSeconds = window.mediaAgent.images.length * parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const estimatedLength = document.getElementById('estimatedLength');
    if (estimatedLength) estimatedLength.textContent = `Estimated video length: ${minutes}m ${seconds}s`;
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.mediaAgent = new FamilyMediaAgent();
});
