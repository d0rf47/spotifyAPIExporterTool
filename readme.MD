# 🎵 Spotify Liked Songs Exporter

A beautiful, modern web application to export all your Spotify "Liked Songs" with a single click. No credentials needed from users - just authenticate and export!

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-ISC-blue.svg)

## ✨ Features

### 🎨 Beautiful Web Interface
- **Modern UI** - Clean, Spotify-themed design with gradient backgrounds
- **Interactive Table** - View all your songs in a beautiful, scrollable table
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Real-time Progress** - Live updates as songs are being fetched

### 🔐 Secure Authentication
- **PKCE Flow** - Industry-standard OAuth 2.0 with PKCE (Proof Key for Code Exchange)
- **No Credentials Needed** - Users don't need their own Spotify API keys
- **One-Click Auth** - Simple Spotify login, that's it!
- **User-Initiated Export** - You control when to start fetching your songs

### 📊 Multiple Export Formats
- **📄 Simple TXT** - Clean list format (Track - Artist)
- **📋 Detailed TXT** - Complete information (album, duration, release date, popularity)
- **📊 CSV** - Spreadsheet-compatible for data analysis
- **🔗 Spotify URIs** - Track URIs for playlist import

### ⚡ Performance & Reliability
- **Smart Pagination** - Handles libraries of any size (100, 1,000, 10,000+ songs)
- **Rate Limiting Protection** - Polite delays to respect Spotify's API limits
- **Progress Indicators** - See exactly what's happening at each step
- **Error Handling** - Clear, helpful error messages

### 🏗️ Professional Architecture
- **EJS Templates** - Clean, component-based views
- **Modular Structure** - Organized routes, utilities, and views
- **Reusable Components** - Header and footer partials for consistency
- **Centralized Styling** - All CSS in one maintainable file

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Spotify account
- A Spotify Developer App (one-time setup)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <your-repo-url>
   cd SpotifyAPItool
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Spotify App** (One-time setup)
   
   a. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   
   b. Click "Create an App"
   
   c. Fill in:
      - App name: `Spotify Liked Songs Exporter`
      - App description: `Export liked songs to various formats`
      - Redirect URI: `http://127.0.0.1:8888/callback`
   
   d. Copy your **Client ID**
   
   e. Update `config/config.js`:
   ```javascript
   spotify: {
     clientId: 'YOUR_CLIENT_ID_HERE',  // ← Paste your Client ID here
     // ...
   }
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Use the app!**
   - Browser opens automatically
   - Login with your Spotify account
   - Click "Start Export" button
   - View your songs in a beautiful table
   - Download in your preferred format

## 📖 Usage

### Step-by-Step Guide

1. **Start the app**
   ```bash
   npm start
   ```

2. **Authenticate**
   - Browser opens to Spotify login
   - Grant permissions to read your liked songs
   - You'll see "Authentication Successful!"

3. **Start Export**
   - Click the green "Start Export" button
   - Wait while songs are fetched (progress shown)

4. **View Results**
   - See all your songs in an interactive table
   - Scroll through your entire library
   - Sort and browse easily

5. **Download**
   - Choose your preferred format:
     - 📄 **TXT** - Simple text list
     - 📊 **CSV** - Excel/spreadsheet format
     - 📋 **Detailed** - Complete song information
     - 🔗 **URIs** - Spotify track URIs

## 🏗️ Project Structure

```
SpotifyAPItool/
├── config/              # Application configuration
│   └── config.js        # Spotify Client ID, server settings
│
├── routes/              # Express route handlers
│   ├── auth.js          # Authentication & PKCE flow
│   ├── api.js           # API endpoints (loading, results)
│   └── downloads.js     # File download handlers
│
├── views/               # EJS templates
│   ├── partials/        # Reusable components
│   │   ├── header.ejs   # Common header
│   │   └── footer.ejs   # Common footer
│   ├── success.ejs      # Auth success page
│   ├── loading.ejs      # Loading page with spinner
│   └── results.ejs      # Results table
│
├── public/              # Static assets
│   ├── css/
│   │   └── styles.css   # Centralized stylesheet
│   └── js/
│       └── loading.js   # Loading page JavaScript
│
├── utils/               # Helper functions
│   ├── pkce.js          # PKCE authentication helpers
│   ├── spotify.js       # Spotify API utilities
│   └── formatters.js    # Export format generators
│
└── server.js            # Main application entry point
```

## 🎨 Customization

### Change Colors

Edit `public/css/styles.css`:

```css
/* Find and replace #1DB954 (Spotify green) with your color */
h1 {
  color: #1DB954;  /* Your color here */
}
```

### Modify Page Content

Edit EJS templates in `views/`:
- `success.ejs` - Authentication success page
- `loading.ejs` - Loading page
- `results.ejs` - Results table
- `error.ejs` - Error page

### Add New Export Formats

1. Add formatter in `utils/formatters.js`
2. Add route in `routes/downloads.js`
3. Add button in `views/results.ejs`

See `PROJECT_STRUCTURE.md` for detailed guidance.

## 🔧 Configuration

### Server Settings

Edit `config/config.js`:

```javascript
server: {
  port: 8888,        // Change server port
  host: '127.0.0.1'  // Change host
}
```

### Fetch Settings

```javascript
fetch: {
  limit: 50,    // Songs per request (max 50)
  delayMs: 100  // Delay between requests (ms)
}
```

## 📚 Documentation

- **`PROJECT_STRUCTURE.md`** - Complete project documentation
- **`EJS_GUIDE.md`** - EJS templates reference
- **`EJS_PARTIALS_GUIDE.md`** - Reusable components guide

## 🛠️ Development

### Run in Development Mode

```bash
npm run dev
```

Auto-reloads on file changes using nodemon.

### Project Commands

```bash
npm start       # Start production server
npm run dev     # Start development server with auto-reload
```

## ❓ Troubleshooting

### "Client ID not configured"
- Update `config/config.js` with your Spotify Client ID
- Make sure you created an app in Spotify Developer Dashboard

### "Invalid redirect URI"
- Add `http://127.0.0.1:8888/callback` to your Spotify app's redirect URIs
- Use `127.0.0.1` (not `localhost`)

### Songs not loading
- Check console for error messages
- Verify authentication was successful
- Try clicking "Start Export" again

### Port already in use
- Change the port in `config/config.js`
- Or stop the process using port 8888

## 🔒 Privacy & Security

- ✅ **No data stored** - Songs are fetched in memory only
- ✅ **No third-party servers** - Everything runs locally
- ✅ **No tracking** - Your data stays with you
- ✅ **Open source** - See exactly what the code does
- ✅ **PKCE authentication** - No client secret needed (more secure)

## 🎯 Technical Stack

- **Backend:** Node.js, Express.js
- **Templating:** EJS (Embedded JavaScript)
- **Styling:** Pure CSS (no frameworks)
- **API:** Spotify Web API Node.js wrapper
- **Auth:** OAuth 2.0 with PKCE

## 📝 Export Format Examples

### Simple Format
```
1. Song Name - Artist Name
2. Another Song - Another Artist
...
```

### Detailed Format
```
1.
   Track: Song Name
   Artist(s): Artist Name
   Album: Album Name
   Release Date: 2023-01-01
   Duration: 3:45
   Popularity: 85/100
```

### CSV Format
```csv
Track Name,Artist(s),Album,Release Date,Duration,Popularity,Spotify URL
"Song Name","Artist Name","Album Name",2023-01-01,3:45,85,https://...
```

### Spotify URI Format
```
spotify:track:xxxxxxxxxxxxxxxxxxxx
spotify:track:yyyyyyyyyyyyyyyyyyyy
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

ISC License - see LICENSE file for details

## 🙏 Acknowledgments

- Built with [Spotify Web API](https://developer.spotify.com/documentation/web-api/)
- Uses [spotify-web-api-node](https://github.com/thelinmichael/spotify-web-api-node)
- Inspired by the need to back up and analyze Spotify libraries

## 📧 Support

- Open an issue for bugs or feature requests
- Check `PROJECT_STRUCTURE.md` for detailed documentation
- Review `EJS_GUIDE.md` for template customization

---

**Made with 🎵 and ❤️ for music lovers**

*Star ⭐ this repo if you find it useful!*
