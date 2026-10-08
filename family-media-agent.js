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
    this.imageInput = document.getElementById('imageInput');
    this.imageUploadZone = document.getElementById('imageUploadZone');
    this.imageCounter = document.getElementById('imageCounter');
    this.imagePreview = document.getElementById('imagePreview');
    this.removeAllBtn = document.querySelector('.remove-all-btn');
  }

  attachEventListeners() {
    // Click to upload
    if (this.imageUploadZone) {
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

    // Remove all button
    if (this.removeAllBtn) {
      this.removeAllBtn.addEventListener('click', () => this.removeAllImages());
    }
  }

  handleImageUpload(event) {
    const files = event.target.files;
    
    for (let file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.images.push({
            name: file.name,
            data: e.target.result,
            timestamp: Date.now()
          });
          this.updateImageCount();
          this.renderImagePreview();
        };
        reader.readAsDataURL(file);
      }
    }
  }

  updateImageCount() {
    if (this.imageCounter) {
      this.imageCounter.textContent = `📷 Images loaded: ${this.images.length}`;
    }
  }

  renderImagePreview() {
    if (!this.imagePreview) return;
    
    if (this.images.length === 0) {
      this.imagePreview.innerHTML = '<p style="text-align: center; opacity: 0.6;">No images yet</p>';
      return;
    }

    this.imagePreview.innerHTML = this.images.map((img, idx) => `
      <div class="image-item" draggable="true" data-index="${idx}">
        <img src="${img.data}" alt="${img.name}">
        <div class="image-info">${img.name}</div>
        <button class="remove-btn" onclick="mediaAgent.removeImage(${idx})">✕</button>
      </div>
    `).join('');
  }

  removeImage(index) {
    this.images.splice(index, 1);
    this.updateImageCount();
    this.renderImagePreview();
  }

  removeAllImages() {
    this.images = [];
    this.updateImageCount();
    this.renderImagePreview();
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
