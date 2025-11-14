# Spotify Liked Songs Exporter

A simple Node.js CLI tool to export all your Spotify "Liked Songs" to a text file.

## Features

- 🔐 Secure OAuth 2.0 authentication
- 📥 Fetches ALL liked songs (handles pagination automatically)
- 📝 Multiple export formats:
  - Simple (Track - Artist)
  - Detailed (with album, duration, release date, etc.)
  - Spotify URIs (for playlist import)
- 🚀 Optimized for large datasets
- ✨ Clean, interactive CLI interface

## Setup Instructions

### 1. Get Spotify API Credentials

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Once created, you'll see your **Client ID** and **Client Secret**
6. Click "Edit Settings" and add `http://localhost:8888/callback` to **Redirect URIs**
7. Save the settings

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root and add your credentials:
