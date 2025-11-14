# 🎵 FFMPEG Setup Guide

This guide will help you configure FFMPEG for MP3 downloads in the Spotify Liked Songs Exporter.

## 📋 Prerequisites

You need to have FFMPEG installed on your system to download songs as MP3 files.

### Installing FFMPEG

#### Windows
1. **Download FFMPEG**:
   - Visit [ffmpeg.org](https://ffmpeg.org/download.html)
   - Or use [gyan.dev builds](https://www.gyan.dev/ffmpeg/builds/)
   - Download the "ffmpeg-release-essentials.zip"

2. **Extract the files**:
   - Extract to a location like `C:\ffmpeg`

3. **Option A: Add to PATH** (Recommended):
   - Open System Properties → Environment Variables
   - Edit the "Path" variable
   - Add: `C:\ffmpeg\bin`
   - Restart your terminal/IDE

4. **Option B: Use full path in .env**:
   - Keep the extracted location
   - Configure in `.env` file (see below)

#### Mac
```bash
# Using Homebrew
brew install ffmpeg
```

#### Linux
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg

# Arch
sudo pacman -S ffmpeg
```

---

## ⚙️ Configuration with .env

### Step 1: Create .env File

Create a file named `.env` in the project root directory:

```
SpotifyAPItool/
├── config/
├── utils/
├── .env          ← Create this file
└── ...
```

### Step 2: Add FFMPEG Configuration

**Option A: FFMPEG in System PATH** (Recommended)

If you added FFMPEG to your system PATH, simply use:

```env
# .env file
FFMPEG_PATH=ffmpeg
```

**Option B: Full Path to FFMPEG**

If FFMPEG is not in your PATH, provide the full path:

**Windows:**
```env
# .env file
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
```

**Mac/Linux:**
```env
# .env file
FFMPEG_PATH=/usr/local/bin/ffmpeg
```

### Step 3: (Optional) Custom Downloads Directory

By default, MP3 files are downloaded to `./downloads`. To change this:

```env
# .env file
FFMPEG_PATH=ffmpeg
DOWNLOADS_PATH=C:\\Users\\YourName\\Music\\SpotifyDownloads
```

---

## ✅ Verify Installation

### 1. Check FFMPEG Installation

Open a terminal and run:

```bash
ffmpeg -version
```

You should see version information. If you get "command not found", FFMPEG is not in your PATH.

### 2. Test the Application

1. Start the server:
   ```bash
   npm start
   ```

2. Authenticate and export your songs

3. Try downloading an MP3 for any song

---

## 🔧 Troubleshooting

### Error: "ffmpeg not found"

**Solution**: 
- Verify FFMPEG is installed: `ffmpeg -version`
- Check your `.env` file has correct path
- Restart your terminal/IDE after adding FFMPEG to PATH

### Error: "Failed to download MP3"

**Possible causes**:
1. **Invalid YouTube video ID**
   - Make sure you're entering a valid YouTube video ID or URL
   
2. **FFMPEG path incorrect**
   - Double-check the path in your `.env` file
   - Use double backslashes `\\` on Windows
   
3. **Permissions issue**
   - Ensure the app has write permissions to the downloads directory

### Error: "Downloads directory not created"

**Solution**:
- Check `DOWNLOADS_PATH` in `.env` is a valid path
- Ensure you have write permissions to that location
- The app will try to create the directory automatically

---

## 📁 Complete .env Example

```env
# ============================================
# ENVIRONMENT CONFIGURATION
# ============================================

# FFMPEG Configuration
# Path to ffmpeg binary. Options:
# - "ffmpeg" if ffmpeg is in your system PATH
# - Full path to ffmpeg.exe (Windows): "C:\\path\\to\\ffmpeg\\bin\\ffmpeg.exe"
# - Full path to ffmpeg (Mac/Linux): "/usr/local/bin/ffmpeg"
FFMPEG_PATH=ffmpeg

# Downloads Directory (optional, defaults to ./downloads)
# DOWNLOADS_PATH=./downloads
```

---

## 🎯 How It Works

1. **Configuration Loading**: 
   - The app loads `.env` file on startup via `dotenv`
   
2. **Config Priority**:
   - Environment variables take priority
   - Falls back to defaults if not set
   
3. **Download Process**:
   - Uses `@distube/ytdl-core` to stream audio from YouTube
   - Uses `fluent-ffmpeg` to convert stream to MP3 format
   - Saves to configured downloads directory
   - Higher quality audio (128kbps MP3)
   
4. **Cleanup**:
   - Temporary files are automatically cleaned up after download

## 🔄 Recent Improvements

The app now uses:
- **ytdl-mp3** (v5.2.2) - Simplified all-in-one YouTube to MP3 downloader
- **Built-in conversion** - Handles download and MP3 conversion automatically
- **Fewer dependencies** - Simpler, more reliable implementation

**Note:** ytdl-mp3 still requires FFMPEG to be installed on your system for audio conversion. The setup instructions remain the same.

---

## 🔐 Security Note

- The `.env` file is already in `.gitignore`
- Never commit your `.env` file to version control
- Keep your file paths secure

---

## 📚 Additional Resources

- [FFMPEG Official Documentation](https://ffmpeg.org/documentation.html)
- [FFMPEG Download Page](https://ffmpeg.org/download.html)
- [ytdl-mp3 NPM Package](https://www.npmjs.com/package/ytdl-mp3)

---

Need help? Check the main [README.md](./readme.MD) or open an issue on GitHub!

