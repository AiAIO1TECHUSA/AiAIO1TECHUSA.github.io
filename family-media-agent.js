// Family Media Agent - Main Controller
class FamilyMediaAgent {
  constructor() {
    this.images = [];
    this.currentTab = 'create';
    this.initElements();
    this.attachListeners();
  }

  initElements() {
    this.imageInput = document.getElementById('imageInput');
    this.imageUploadZone = document.getElementById('imageUploadZone');
  }

  attachListeners() {
    // Click to upload
    if (this.imageUploadZone) {
      this.imageUploadZone.addEventListener('click', () => this.imageInput.click());
    }

    // File input change
    if (this.imageInput) {
      this.imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }

    // Drag and drop
    if (this.imageUploadZone) {
      this.imageUploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.imageUploadZone.style.background = 'rgba(102, 126, 234, 0.1)';
      });

      this.imageUploadZone.addEventListener('dragleave', () => {
        this.imageUploadZone.style.background = '';
      });

      this.imageUploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.imageUploadZone.style.background = '';
        this.handleImageUpload({ target: { files: e.dataTransfer.files } });
      });
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
    const counter = document.getElementById('imageCounter');
    if (counter) {
      counter.textContent = `📷 Images loaded: ${this.images.length}`;
    }
  }

  renderImagePreview() {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;
    
    preview.innerHTML = this.images.map((img, idx) => `
      <div class="image-item">
        <img src="${img.data}" alt="${img.name}">
        <button class="remove-btn" onclick="mediaAgent.removeImage(${idx})">✕</button>
      </div>
    `).join('');
  }

  removeImage(index) {
    this.images.splice(index, 1);
    this.updateImageCount();
    this.renderImagePreview();
  }
}

// Tab switching
function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Remove active class from buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab
  const selectedTab = document.getElementById(tabName + 'Tab');
  if (selectedTab) selectedTab.classList.add('active');
  
  // Highlight active button
  event.target.classList.add('active');
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.mediaAgent = new FamilyMediaAgent();
});
