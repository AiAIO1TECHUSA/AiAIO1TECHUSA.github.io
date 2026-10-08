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
  }

  cacheElements() {
    // Match actual HTML IDs and selectors
    this.imageInput = document.getElementById('imageInput');
    this.imageUploadZone = document.getElementById('imageUploadZone');
    this.imageCounter = document.getElementById('imageCount'); // HTML uses 'imageCount' not 'imageCounter'
    this.imagePreview = document.getElementById('previewGrid'); // HTML uses 'previewGrid' not 'imagePreview'
    this.removeAllBtn = document.querySelector('button[onclick="clearImages()"]'); // Target the actual clear button
    
    // Log missing elements for debugging
    console.log('FamilyMediaAgent initialized:', {
      imageInput: !!this.imageInput,
      imageUploadZone: !!this.imageUploadZone,
      imageCounter: !!this.imageCounter,
      imagePreview: !!this.imagePreview,
      removeAllBtn: !!this.removeAllBtn
    });
    
    if (!this.imageInput) console.error('Missing: #imageInput');
    if (!this.imageUploadZone) console.error('Missing: #imageUploadZone');
    if (!this.imageCounter) console.error('Missing: #imageCount');
    if (!this.imagePreview) console.error('Missing: #previewGrid');
  }

  attachEventListeners() {
    // Click to upload
    if (this.imageUploadZone && this.imageInput) {
      this.imageUploadZone.addEventListener('click', () => {
        this.imageInput.click();
      });
    }

    // File input change
    if (this.imageInput) {
      this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // Drag and drop
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
        this.handleImageUpload({ target: { files: e.dataTransfer.files } });
      });
    }
  }

  handleImageUpload(event) {
    const files = event.target?.files;
    
    if (!files || files.length === 0) {
      console.warn('No files selected');
      return;
    }
    
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({
            name: file.name,
            data: e.target.result,
            timestamp: Date.now()
          });
          console.log(`Image added: ${file.name} (Total: ${this.images.length})`);
          this.updateImageCount();
          this.renderImagePreview();
          this.showPreviewSection();
        };
        reader.onerror = () => {
          console.error(`Failed to read file: ${file.name}`);
        };
        reader.readAsDataURL(file);
      } else {
        console.warn(`Skipped non-image file: ${file.name}`);
      }
    }
  }

  updateImageCount() {
    if (this.imageCounter) {
      this.imageCounter.textContent = `📷 Images loaded: ${this.images.length}`;
    }
    
    // Show/hide image stats and preview sections
    const imageStats = document.getElementById('imageStats');
    const previewSection = document.getElementById('previewSection');
    const videoSettingsSection = document.getElementById('videoSettingsSection');
    
    if (this.images.length > 0) {
      if (imageStats) imageStats.style.display = 'block';
      if (previewSection) previewSection.style.display = 'block';
      if (videoSettingsSection) videoSettingsSection.style.display = 'block';
    } else {
      if (imageStats) imageStats.style.display = 'none';
      if (previewSection) previewSection.style.display = 'none';
      if (videoSettingsSection) videoSettingsSection.style.display = 'none';
    }
  }

  showPreviewSection() {
    const previewSection = document.getElementById('previewSection');
    if (previewSection) {
      previewSection.style.display = 'block';
    }
  }

  renderImagePreview() {
    if (!this.imagePreview) {
      console.warn('Preview grid element not found');
      return;
    }
    
    if (this.images.length === 0) {
      this.imagePreview.innerHTML = '<p style="text-align: center; opacity: 0.6; grid-column: 1/-1;">No images yet</p>';
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

// Global helper function for HTML onclick
function clearImages() {
  if (window.mediaAgent) {
    window.mediaAgent.removeAllImages();
  }
}

// Tab switching function
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Highlight active button
  if (event && event.target) {
    event.target.classList.add('active');
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.mediaAgent = new FamilyMediaAgent();
});
