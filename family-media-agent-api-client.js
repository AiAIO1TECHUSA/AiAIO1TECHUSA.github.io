// Family Media Agent - API Client for Backend Communication
// Add this to your frontend to connect with the server

class MediaAgentAPIClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.videoUrl = null;
  }

  async uploadVideo(videoFile, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const endpoints = [
        `${this.baseUrl}/upload-video`,
        `${this.baseUrl}/api/upload-video`
      ];

      let lastError = null;

      for (const endpoint of endpoints) {
        try {
          const xhr = new XMLHttpRequest();

          if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
              if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
              }
            });
          }

          const response = await new Promise((resolve, reject) => {
            xhr.addEventListener('load', () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const data = JSON.parse(xhr.responseText || '{}');
                  resolve(data);
                } catch (e) {
                  reject(new Error('Invalid server response'));
                }
              } else {
                reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
              }
            });

            xhr.addEventListener('error', () => reject(new Error('Network error during upload')));
            xhr.open('POST', endpoint);
            xhr.send(formData);
          });

          if (response && response.success === false) {
            throw new Error(response.error || 'Upload failed');
          }

          this.videoUrl = response && response.url ? response.url : null;
          return response;
        } catch (error) {
          lastError = error;
        }
      }

      throw lastError || new Error('Upload failed');
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async listVideos() {
    try {
      const response = await fetch(`${this.baseUrl}/api/videos`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('List videos error:', error);
      throw error;
    }
  }

  async deleteVideo(filename) {
    try {
      const response = await fetch(`${this.baseUrl}/api/delete-video/${filename}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Delete video error:', error);
      throw error;
    }
  }

  async isServerReady() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.warn('Server not ready:', error.message);
      return false;
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaAgentAPIClient;
}
