# Project Structure Documentation

## 📁 Organized File Structure

```
SpotifyAPItool/
├── config/
│   └── config.js              # Application configuration (Client ID, ports, etc.)
│
├── utils/
│   ├── pkce.js                # PKCE authentication helpers
│   ├── spotify.js             # Spotify API utilities
│   └── formatters.js          # Content formatters (TXT, CSV, etc.)
│
├── views/
│   ├── layout.ejs             # Unified layout template (header, footer, structure)
│   └── content/               # Page-specific content (injected into layout)
│       ├── success.ejs        # Authentication success content
│       ├── error.ejs          # Error page content
│       ├── loading.ejs        # Loading page content
│       └── results.ejs        # Results table content
│
├── routes/
│   ├── auth.js                # Authentication routes & flow
│   ├── api.js                 # API endpoints (status, results)
│   └── downloads.js           # Download endpoints (TXT, CSV, etc.)
│
├── public/                    # Static assets
│   ├── css/
│   │   └── styles.css         # Centralized stylesheet
│   └── js/
│       └── loading.js         # Loading page JavaScript
│
├── server.js                  # Main application entry point ⭐
│
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies and scripts
└── README.md                  # User documentation
```

## 🎯 Key Files Explained

### Configuration (`config/`)

**`config/config.js`**

- Centralized configuration
- Spotify Client ID and settings
- Server port configuration
- Easy to update in one place

### Utilities (`utils/`)

**`pkce.js`**

- Generate PKCE code verifier
- Generate code challenge
- Complete PKCE pair generation

**`spotify.js`**

- Fetch all liked songs with pagination
- Exchange authorization code for token
- Create authorization URLs

**`formatters.js`**

- Create TXT format (simple)
- Create TXT format (detailed)
- Create CSV format
- Create Spotify URI format
- HTML escaping utilities
- Duration formatting

### Views (`views/`)

**Unified Layout System with EJS Templates**

- **layout.ejs** - Master template with header, footer, and structure
- **content/** - Page-specific content injected into layout
- Automatic layout rendering via middleware
- Consistent structure across all pages
- Clean separation of layout and content

**How It Works:**

1. Routes render content templates: `res.render('success', options)`
2. Middleware automatically wraps content in layout
3. Layout receives content as `body` variable
4. Options passed to render control layout behavior

**Layout Options:**
- `pageTitle` - Page title (default: "Spotify Liked Songs Exporter")
- `bodyClass` - CSS class for body tag (e.g., "centered", "results-page")
- `containerClass` - CSS class for container div
- `extraHead` - Additional head content (scripts, meta tags)
- `extraScript` - Additional scripts before closing body tag
- `flexWrapper` - Adds flex wrapper div (for vertical centering)

**Content Templates:**

**`content/success.ejs`** - Authentication success with "Start Export" button
**`content/error.ejs`** - Error messages
**`content/loading.ejs`** - Loading spinner with progress
**`content/results.ejs`** - Interactive song table with download buttons

**Example Usage:**
```javascript
// In routes
res.render('success', {
  pageTitle: 'Authentication Successful',
  bodyClass: 'centered',
  containerClass: 'success-container',
  flexWrapper: true,
  extraScript: '<script>...</script>'
});
```

### Public Assets (`public/`)

**Static files served by Express**

**`css/styles.css`**
- Centralized stylesheet for all pages
- Responsive design
- Spotify-themed colors (#1DB954)
- Common components and page-specific styles

**`js/loading.js`**
- Loading page status checker
- Auto-redirects when songs are fetched
- Polls API every 2 seconds

### Routes (`routes/`)

**`auth.js`**

- `/callback` - OAuth callback handler
- Authentication flow management
- PKCE token exchange

**`api.js`**

- `/loading` - Loading page
- `/results` - Results page with table
- `/api/songs/status` - Check if songs are loaded

**`downloads.js`**

- `/download/txt` - Simple text format
- `/download/csv` - CSV format
- `/download/detailed` - Detailed text format
- `/download/uris` - Spotify URI format

## 🚀 Running the Application

```bash
npm start          # Production
npm run dev        # Development with auto-reload
```

That's it! Just one simple command to run the application.

## ⚙️ Configuration

### Update Spotify Client ID

**File:** `config/config.js`

```javascript
spotify: {
  clientId: 'YOUR_CLIENT_ID_HERE',  // ← Change this
  redirectUri: 'http://127.0.0.1:8888/callback',
  scopes: ['user-library-read']
}
```

### Change Server Port

**File:** `config/config.js`

```javascript
server: {
  port: 8888,        // ← Change this
  host: '127.0.0.1'
}
```

## 🎨 Customizing Styles and Views

### Customizing Styles

All styles are centralized in `public/css/styles.css`.

**Example: Change the Spotify green color**

**File:** `public/css/styles.css`

```css
/* Find and replace #1DB954 with your color */
h1 {
  color: #1DB954;  /* Change to: #FF0000 for red */
}

.download-btn {
  background: #1DB954;  /* Change to: #3498db for blue */
}
```

**Style Organization:**
- Base styles - Universal resets and typography
- Common components - Shared elements across pages
- Page-specific styles - Unique to each page
- Responsive design - Mobile-friendly breakpoints

### Customizing Views

All views are in `views/` folder using EJS templates.

**Example: Change the loading message**

**File:** `views/loading.ejs`

```html
<p>Fetching all your liked songs from Spotify...</p>
<!-- Change to: -->
<p>Loading your awesome music collection...</p>
```

**EJS Syntax:**

- `<%= variable %>` - Output escaped value
- `<%- html %>` - Output raw HTML (use carefully!)
- `<% code %>` - Execute JavaScript code
- `<%# comment %>` - Comments (not rendered)

## 📦 Benefits of This Structure

### ✅ Better Organization

- Clear separation of concerns
- Easy to find specific functionality
- Follows industry best practices

### ✅ Maintainability

- Changes isolated to specific files
- Easier to debug
- Simpler to add new features

### ✅ Professional Templates

- Using EJS (industry standard)
- Better syntax highlighting
- Easier for designers to edit
- Cleaner HTML structure

### ✅ Scalability

- Easy to add new routes
- Easy to add new export formats
- Easy to add new views

## 🎯 Project Architecture

The application uses a **modular architecture** with clear separation of concerns:

- **Configuration** (`config/`) - Centralized settings
- **Utilities** (`utils/`) - Reusable helper functions
- **Views** (`views/`) - EJS templates for UI
- **Routes** (`routes/`) - Express route handlers
- **Main** (`server.js`) - Application entry point

This structure provides excellent maintainability and scalability.

## 📝 Adding New Features

### Add a New Export Format

1. **Add formatter function** in `utils/formatters.js`:

```javascript
function createJSONFormat(songs) {
  return JSON.stringify(songs, null, 2);
}
```

2. **Add download route** in `routes/downloads.js`:

```javascript
router.get("/download/json", async (req, res) => {
  const content = createJSONFormat(getSongsFunction());
  res.setHeader("Content-Type", "application/json");
  res.send(content);
});
```

3. **Add button** in `views/results.js`:

```html
<a href="/download/json" class="download-btn">📋 Download JSON</a>
```

### Add a New Page

1. **Create view** in `views/mypage.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= heading %></h1>
    <p>Content here...</p>
  </body>
</html>
```

2. **Add route** in `routes/api.js`:

```javascript
router.get("/mypage", (req, res) => {
  res.render("mypage", {
    title: "My Page",
    heading: "Welcome!",
  });
});
```

## 🛠️ Troubleshooting

### Server won't start

- Check if port 8888 is already in use
- Update port in `config/config.js`

### Authentication fails

- Verify Client ID in `config/config.js`
- Check redirect URI in Spotify Dashboard
- Must be: `http://127.0.0.1:8888/callback`

### Songs not loading

- Check console for error messages
- Verify authentication was successful
- Check network connection

## 📚 Code Style

### EJS Templates

- Use `.ejs` file extension
- `<%= value %>` for escaped output
- `<% code %>` for JavaScript logic
- Use proper HTML structure with DOCTYPE

### Module Exports

```javascript
// Single export
module.exports = { functionName };

// Multiple exports
module.exports = {
  function1,
  function2,
};
```

### Route Handlers

```javascript
router.get("/path", (req, res) => {
  // Handle request
  res.send("Response");
});
```

## 🎉 Summary

This organized structure provides:

- ✅ Clean, maintainable code
- ✅ Easy customization
- ✅ Professional project structure
- ✅ EJS templates with syntax highlighting
- ✅ Industry-standard approach
- ✅ Ready for growth

**Run the application:**

```bash
npm start        # or npm run dev for auto-reload
```

### Dependencies

- ✅ `express` - Web server
- ✅ `spotify-web-api-node` - Spotify API wrapper
- ✅ `ejs` - Template engine
- ✅ `open` - Browser launcher
