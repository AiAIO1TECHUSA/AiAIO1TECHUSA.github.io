// Family Media Agent - Node.js/Express Backend Server
// Install dependencies: npm install express express-fileupload cors dotenv

const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

app.use(cors());
app.use(express.json());
app.use(fileUpload({
  limits: { fileSize: 500 * 1024 * 1024 },
  abortOnLimit: true,
  responseOnLimit: 'File size exceeds the maximum limit of 500MB'
}));

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Family Media Agent server is running' });
});

function handleVideoUpload(req, res) {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({
        error: 'No video file provided',
        details: 'Video file is required in the request'
      });
    }

    const video = req.files.video;

    if (!video.mimetype || !video.mimetype.startsWith('video/')) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: `Expected video file, got ${video.mimetype || 'unknown'}`
      });
    }

    if (video.size > 500 * 1024 * 1024) {
      return res.status(413).json({
        error: 'File too large',
        details: 'Maximum file size is 500MB'
      });
    }

    const timestamp = Date.now();
    const ext = path.extname(video.name || '.mp4');
    const filename = `video-${timestamp}${ext}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    video.mv(filepath, (err) => {
      if (err) {
        console.error('File upload error:', err);
        return res.status(500).json({
          error: 'File upload failed',
          details: err.message
        });
      }

      const fileUrl = `/uploads/${filename}`;
      console.log(`Video uploaded: ${filename} (${video.size} bytes)`);

      res.json({
        success: true,
        url: fileUrl,
        filename,
        size: video.size,
        mimetype: video.mimetype
      });
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}

app.post('/upload-video', handleVideoUpload);
app.post('/api/upload-video', handleVideoUpload);

app.delete('/api/delete-video/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(UPLOAD_DIR, filename);

    if (!filepath.startsWith(path.resolve(UPLOAD_DIR))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    fs.unlinkSync(filepath);
    console.log(`Video deleted: ${filename}`);
    res.json({ success: true, message: 'Video deleted' });
  } catch (error) {
    console.error('Delete endpoint error:', error);
    res.status(500).json({
      error: 'Failed to delete video',
      details: error.message
    });
  }
});

app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(UPLOAD_DIR);
    const videos = files
      .filter(f => f.startsWith('video-'))
      .map(f => ({
        filename: f,
        url: `/uploads/${f}`,
        size: fs.statSync(path.join(UPLOAD_DIR, f)).size
      }));

    res.json({ videos });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({
      error: 'Failed to list videos',
      details: error.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    details: err.message
  });
});

app.listen(PORT, () => {
  console.log(`\n🤖 Family Media Agent Server running on http://localhost:${PORT}`);
  console.log(`📁 Upload directory: ${path.resolve(UPLOAD_DIR)}`);
  console.log(`✅ Ready to accept video uploads\n`);
});
