# Family Media Agent - Backend Server Setup

This guide explains how to set up and run the Node.js/Express backend server for video upload and management.

## Prerequisites

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)

## Installation

### 1. Install Dependencies

```bash
npm install
```

This installs:
- **express** - Web framework
- **express-fileupload** - File upload handling
- **cors** - Cross-Origin Resource Sharing
- **dotenv** - Environment configuration

### 2. Create Environment File

Copy the example configuration:

```bash
cp .env.example .env
```

Edit `.env` if needed (optional):

```
PORT=3000
UPLOAD_DIR=./uploads
NODE_ENV=development
```

### 3. Start the Server

#### Development (with auto-reload):
```bash
npm run dev
```

#### Production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Upload Video

**POST** `/api/upload-video`

Upload a video file to the server.

**Request:**
```
Content-Type: multipart/form-data
Body: video (file)
```

**Response (Success - 200):**
```json
{
  "success": true,
  "url": "/uploads/video-1699123456789.mp4",
  "filename": "video-1699123456789.mp4",
  "size": 52428800,
  "mimetype": "video/mp4"
}
```

**Response (Error - 400):**
```json
{
  "error": "Invalid file type",
  "details": "Expected video file, got image/jpeg"
}
```

### 2. Get Video List

**GET** `/api/videos`

Retrieve all uploaded videos.

**Response:**
```json
{
  "videos": [
    {
      "filename": "video-1699123456789.mp4",
      "url": "/uploads/video-1699123456789.mp4",
      "size": 52428800
    }
  ]
}
```

### 3. Delete Video

**DELETE** `/api/delete-video/{filename}`

Delete a video from the server.

**Response (Success):**
```json
{
  "success": true,
  "message": "Video deleted"
}
```

### 4. Health Check

**GET** `/health`

Check if server is running.

**Response:**
```json
{
  "status": "ok",
  "message": "Family Media Agent server is running"
}
```

## Frontend Integration

Use the provided API client in your HTML:

```html
<script src="family-media-agent-api-client.js"></script>
<script>
  const apiClient = new MediaAgentAPIClient('http://localhost:3000');

  // Upload a video
  async function uploadVideo(videoFile) {
    try {
      const result = await apiClient.uploadVideo(videoFile, (progress) => {
        console.log(`Upload progress: ${progress.toFixed(2)}%`);
      });
      console.log('Video uploaded:', result.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  // List videos
  async function showVideos() {
    const data = await apiClient.listVideos();
    console.log('Videos:', data.videos);
  }

  // Delete a video
  async function removeVideo(filename) {
    await apiClient.deleteVideo(filename);
    console.log('Video deleted');
  }
</script>
```

## Project Structure

```
family-media-agent/
├── server.js                      # Main Express server
├── package.json                   # Dependencies
├── .env                           # Configuration (created by you)
├── .env.example                   # Configuration template
├── family-media-agent.html        # Frontend
├── family-media-agent.js          # Frontend logic
├── family-media-agent.css         # Frontend styling
├── family-media-agent-api-client.js # API client
├── uploads/                       # Video storage (created by server)
└── README-SERVER.md               # This file
```

## Deployment Options

### Option 1: Heroku

```bash
heroku create your-app-name
heroku config:set UPLOAD_DIR=/tmp/uploads
git push heroku main
```

### Option 2: Netlify Functions

Requires a `netlify.toml` configuration and conversion to serverless format.

### Option 3: DigitalOcean / AWS / Google Cloud

Use Docker or direct Node.js deployment. Configure:
- Port forwarding
- File storage (local or cloud)
- SSL certificates

### Option 4: Replit

1. Create a new Node.js project
2. Upload files
3. Install dependencies: `npm install`
4. Set up `.env`
5. Run: `npm start`

## Security Best Practices

1. **Validate file types** - Only accept video files
2. **Limit file size** - Default 500MB, adjust as needed
3. **Sanitize filenames** - Use timestamps (already implemented)
4. **Use HTTPS** - In production, always use HTTPS
5. **Implement authentication** - Add user login/API keys
6. **CORS configuration** - Restrict to your frontend domain
7. **Rate limiting** - Prevent abuse with express-rate-limit

## Troubleshooting

### Port already in use
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :3000     # Windows
```

### File upload fails
- Check upload directory permissions
- Verify file size is under limit
- Ensure server has write access to `./uploads`

### CORS errors
- Update `.env` CORS_ORIGIN to match frontend URL
- Verify frontend is sending correct request headers

### Files not found after restart
- Uploads are stored locally in `./uploads/`
- For production, use cloud storage (S3, Google Cloud Storage, etc.)

## Performance Tips

1. Use a CDN for video delivery
2. Implement video compression/encoding
3. Use a dedicated storage service for large files
4. Add caching headers
5. Monitor server resources

## Support

For issues or questions, check:
- Express documentation: https://expressjs.com/
- File upload library: https://github.com/richardgirges/express-fileupload
- Node.js documentation: https://nodejs.org/docs/

---

**Family Media Agent** - Preserving precious family moments 🤖📸
