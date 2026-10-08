// Family Media Agent - Image Upload Handler
class FamilyMediaAgent {
  constructor() {
    this.images = [];
    this.currentTab = 'create';
    this.init();
  }

  init() {
    this.cacheElements();
    this.attachEventListeners();
    this.updateImageCount();
  }

  cacheElements() {
    this.imageInput = document.getElementById('imageInput');
    this.imageUploadZone = document.getElementById('imageUploadZone');
    this.imageCounter = document.getElementById('imageCount');
    this.imagePreview = document.getElementById('previewGrid');
    this.removeAllBtn = document.querySelector('.btn-clear-images');

    console.log('FamilyMediaAgent initialized:', {
      imageInput: !!this.imageInput,
      imageUploadZone: !!this.imageUploadZone,
      imageCounter: !!this.imageCounter,
      imagePreview: !!this.imagePreview,
      removeAllBtn: !!this.removeAllBtn
    });
  }

  attachEventListeners() {
    if (this.imageUploadZone && this.imageInput) {
      this.imageUploadZone.addEventListener('click', () => {
        this.imageInput.click();
      });
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
    if (!files || files.length === 0) {
      console.warn('No files selected');
      return;
    }

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

        console.log(`Image added: ${file.name} | total=${this.images.length}`);
        this.updateImageCount();
        this.renderImagePreview();
        this.showPreviewSections();
      };

      reader.onerror = () => {
        console.error(`Failed to read file: ${file.name}`);
      };

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
    if (!this.imagePreview) {
      console.warn('Preview grid not found');
      return;
    }

    if (this.images.length === 0) {
      this.imagePreview.innerHTML =
        '<p style="text-align:center; opacity:0.6; grid-column:1 / -1;">No images yet</p>';
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
}

// Global HTML helper used by the inline button
function clearImages() {
  if (window.mediaAgent) {
    window.mediaAgent.removeAllImages();
  }
}

// Tab switching function
function switchTab(tabName, event) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  if (event && event.target) {
    event.target.classList.add('active');
  }
}

// Create video slideshow
function createVideoSlideshow() {
  if (!window.mediaAgent || window.mediaAgent.images.length === 0) {
    alert('Please upload images first');
    return;
  }
  
  const videoName = document.getElementById('videoName').value || 'Family Memories';
  const duration = document.getElementById('imageDuration').value || 3;
  const quality = document.getElementById('videoQuality').value || '720';
  
  console.log('Creating video:', { videoName, duration, quality, imageCount: window.mediaAgent.images.length });
  alert(`Video creation started!\nName: ${videoName}\nImages: ${window.mediaAgent.images.length}\nDuration: ${duration}s each\nQuality: ${quality}p\n\nNote: This demo shows the UI. Actual video encoding requires a backend service.`);
}

// Reset agent
function resetAgent() {
  if (window.mediaAgent) {
    window.mediaAgent.removeAllImages();
    document.getElementById('videoName').value = 'Family Memories';
    document.getElementById('imageDuration').value = 3;
    document.getElementById('videoQuality').value = '720';
    document.getElementById('musicTrack').value = 'none';
    switchTab('create');
  }
}

// Update duration display
function updateDurationDisplay() {
  const duration = document.getElementById('imageDuration').value;
  const display = document.getElementById('durationDisplay');
  if (display) {
    display.textContent = duration + 's';
  }
  
  // Update estimated length
  if (window.mediaAgent) {
    const totalSeconds = window.mediaAgent.images.length * parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const estimatedLength = document.getElementById('estimatedLength');
    if (estimatedLength) {
      estimatedLength.textContent = `Estimated video length: ${minutes}m ${seconds}s`;
    }
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.mediaAgent = new FamilyMediaAgent();
});
