// Family Media Agent - API Client for Backend Communication
// Add this to your frontend to connect with the server

class MediaAgentAPIClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
    this.videoUrl = null;
  }

  /**
   * Upload video to server
   * @param {File} videoFile - The video file to upload
   * @param {Function} onProgress - Callback for upload progress
   * @returns {Promise} - Resolves with upload response
   */
  async uploadVideo(videoFile, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }

      return new Promise((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            this.videoUrl = response.url;
            resolve(response);
          } else {
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', `${this.baseUrl}/api/upload-video`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Get list of uploaded videos
   * @returns {Promise} - Resolves with list of videos
   */
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

  /**
   * Delete a video from server
   * @param {String} filename - The filename to delete
   * @returns {Promise} - Resolves with delete response
   */
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

  /**
   * Check if server is running
   * @returns {Promise<Boolean>}
   */
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

// Export for use in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MediaAgentAPIClient;
}
