# Unified Layout System Guide

## 🎨 What is a Unified Layout System?

A **unified layout system** is a template architecture where all pages share a common layout (header, footer, structure) with only the content changing between pages. This creates consistency and makes maintenance much easier.

## ✨ Benefits

- ✅ **DRY Principle** - Write layout code once, use everywhere
- ✅ **Consistency** - Same header, footer, and structure on all pages
- ✅ **Maintainability** - Update one file to change all pages
- ✅ **Flexibility** - Easy to customize per-page behavior
- ✅ **Clean Code** - Separation of layout and content

## 📁 Structure

```
views/
├── layout.ejs          # Master layout template
└── content/            # Page-specific content
    ├── success.ejs
    ├── error.ejs
    ├── loading.ejs
    └── results.ejs
```

## 🏗️ How It Works

### 1. The Layout Template

**File:** `views/layout.ejs`

```ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><%= typeof pageTitle !== 'undefined' ? pageTitle : 'Default Title' %></title>
  <link rel="stylesheet" href="/css/styles.css">
  <% if (typeof extraHead !== 'undefined') { %>
    <%- extraHead %>
  <% } %>
</head>
<body class="<%= typeof bodyClass !== 'undefined' ? bodyClass : '' %>">
  <% if (typeof flexWrapper !== 'undefined' && flexWrapper) { %>
    <div style="flex-grow:1">
  <% } %>
  
  <div class="container <%= typeof containerClass !== 'undefined' ? containerClass : '' %>">
    <%- body %>  <!-- Content gets injected here -->
  </div>
  
  <% if (typeof flexWrapper !== 'undefined' && flexWrapper) { %>
    </div>
  <% } %>
  
  <% if (typeof extraScript !== 'undefined') { %>
    <%- extraScript %>
  <% } %>
  
  <footer class="app-footer">
    <p>Made with 🎵 using Spotify Web API</p>
  </footer>
</body>
</html>
```

### 2. Content Templates

**File:** `views/content/success.ejs`

```ejs
<h1>✓ Authentication Successful!</h1>
<p>You're all set!</p>
<button class="start-btn">Start Export</button>
```

**Note:** Content templates contain ONLY the page-specific content, no HTML structure.

### 3. The Middleware

**File:** `server.js`

```javascript
// Add layout rendering middleware
app.use((req, res, next) => {
  const originalRender = res.render.bind(res);
  
  res.render = (view, options = {}, callback) => {
    // Render the content view first
    app.render(`content/${view}`, options, (err, html) => {
      if (err) {
        return callback ? callback(err) : next(err);
      }
      
      // Now render the layout with the content
      const layoutData = {
        body: html,  // Inject content as 'body'
        ...options   // Pass all other options
      };
      
      originalRender('layout', layoutData, callback);
    });
  };
  
  next();
});
```

### 4. Route Usage

**File:** `routes/api.js`

```javascript
router.get('/loading', (req, res) => {
  res.render('loading', {
    pageTitle: 'Loading Songs...',
    bodyClass: 'centered',
    containerClass: 'loading-container',
    extraHead: '<script src="/js/loading.js" defer></script>'
  });
});
```

## 🎯 Layout Options

### Required Options

None! The layout works with zero options and provides defaults.

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageTitle` | string | "Spotify Liked Songs Exporter" | Page title in `<title>` tag |
| `bodyClass` | string | "" | CSS class(es) for `<body>` tag |
| `containerClass` | string | "" | CSS class(es) for container `<div>` |
| `extraHead` | string | undefined | Additional HTML in `<head>` |
| `extraScript` | string | undefined | Additional HTML before `</body>` |
| `flexWrapper` | boolean | false | Adds flex wrapper for centering |

### Any Other Options

All other options are passed through to the content template, so you can use custom variables:

```javascript
res.render('results', {
  songs: fetchedSongs,           // Custom data
  exportDate: new Date(),        // Custom data
  pageTitle: 'Your Songs',       // Layout option
  bodyClass: 'results-page'      // Layout option
});
```

## 📝 Examples

### Example 1: Simple Page

```javascript
// Route
res.render('success');

// Result: Uses all defaults
// - Title: "Spotify Liked Songs Exporter"
// - No body class
// - No container class
```

### Example 2: Centered Page

```javascript
// Route
res.render('error', {
  errorMessage: 'Something went wrong',  // Custom data
  pageTitle: 'Error',                    // Layout option
  bodyClass: 'centered',                 // Layout option
  containerClass: 'error-container'      // Layout option
});
```

### Example 3: Page with Scripts

```javascript
// Route
res.render('loading', {
  pageTitle: 'Loading...',
  bodyClass: 'centered',
  extraHead: '<script src="/js/loading.js" defer></script>'
});
```

### Example 4: Complex Page

```javascript
// Route
res.render('results', {
  songs: fetchedSongs,
  exportDate: new Date().toLocaleString(),
  pageTitle: 'Your Liked Songs',
  bodyClass: 'results-page',
  containerClass: 'results-container',
  extraScript: `
    <script>
      console.log('Results page loaded');
    </script>
  `
});
```

## 🔧 Creating New Pages

### Step 1: Create Content Template

Create `views/content/mypage.ejs`:

```ejs
<h1>Welcome to <%= pageName %></h1>
<p>This is my custom content.</p>
<button class="my-btn">Click Me</button>
```

### Step 2: Add Route

In your routes file:

```javascript
router.get('/mypage', (req, res) => {
  res.render('mypage', {
    pageName: 'My Page',           // For content template
    pageTitle: 'My Custom Page',   // For layout
    bodyClass: 'centered',         // For layout
    containerClass: 'my-container' // For layout
  });
});
```

### Step 3: Done!

The middleware automatically wraps your content in the layout. No need to manually include header/footer!

## 💡 Advanced Patterns

### Conditional Layout Elements

**In layout.ejs:**

```ejs
<% if (typeof showHeader !== 'undefined' && showHeader) { %>
  <header>
    <nav>...</nav>
  </header>
<% } %>
```

**In route:**

```javascript
res.render('mypage', {
  showHeader: true  // Controls layout behavior
});
```

### Multiple Layouts

If you need different layouts, you can create multiple layout files:

**views/admin-layout.ejs**
**views/public-layout.ejs**

And modify the middleware to select based on a parameter:

```javascript
const layoutData = {
  body: html,
  ...options
};

const layoutName = options.layout || 'layout';
originalRender(layoutName, layoutData, callback);
```

### Nested Content

You can include partials within content templates:

**views/content/dashboard.ejs**

```ejs
<h1>Dashboard</h1>
<%- include('../partials/stats', { data: stats }) %>
<%- include('../partials/chart', { data: chartData }) %>
```

## 🆚 Before vs After

### Before (Without Unified Layout)

**views/success.ejs** (50 lines)
```ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Success</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body class="centered">
  <div class="container">
    <h1>Success!</h1>
    <p>Content here</p>
  </div>
  <footer>...</footer>
</body>
</html>
```

**views/error.ejs** (50 lines - duplicated structure)
**views/loading.ejs** (50 lines - duplicated structure)
**views/results.ejs** (50 lines - duplicated structure)

**Total:** ~200 lines with lots of duplication

### After (With Unified Layout)

**views/layout.ejs** (35 lines - ONE TIME)

**views/content/success.ejs** (5 lines)
```ejs
<h1>Success!</h1>
<p>Content here</p>
```

**views/content/error.ejs** (3 lines)
**views/content/loading.ejs** (4 lines)
**views/content/results.ejs** (20 lines)

**Total:** ~70 lines, no duplication

## ✅ Best Practices

### 1. Keep Content Templates Clean

```ejs
<!-- ✅ Good - Just content -->
<h1>Title</h1>
<p>Content</p>

<!-- ❌ Bad - Don't add structure -->
<!DOCTYPE html>
<html>
  <h1>Title</h1>
</html>
```

### 2. Use Semantic Class Names

```javascript
// ✅ Good
res.render('error', {
  bodyClass: 'centered',
  containerClass: 'error-container'
});

// ❌ Bad
res.render('error', {
  bodyClass: 'red-background'
});
```

### 3. Provide Defaults

```ejs
<!-- In layout.ejs -->
<title><%= typeof pageTitle !== 'undefined' ? pageTitle : 'Default' %></title>
```

### 4. Document Layout Options

Add comments in layout.ejs explaining available options:

```ejs
<%#
  Available options:
  - pageTitle (string): Page title
  - bodyClass (string): Body CSS class
  - containerClass (string): Container CSS class
  ...
%>
```

## 🐛 Troubleshooting

### Content not showing

**Problem:** Page is blank or shows only layout
**Solution:** Make sure your content template is in `views/content/` folder

### Variables undefined

**Problem:** `Cannot read property 'X' of undefined`
**Solution:** Use typeof checks in layout:
```ejs
<% if (typeof myVar !== 'undefined') { %>
```

### Layout not applied

**Problem:** Page shows raw content without layout
**Solution:** Check middleware is installed before routes:
```javascript
// Middleware FIRST
app.use((req, res, next) => { ... });

// Routes AFTER
app.use('/', myRoutes);
```

## 📚 Further Reading

- **EJS Documentation:** https://ejs.co/
- **Express Middleware:** https://expressjs.com/en/guide/using-middleware.html
- **Template Patterns:** Design patterns for template systems

## 🎉 Summary

The unified layout system provides:

- ✅ One layout, all pages
- ✅ Automatic content injection
- ✅ Flexible per-page options
- ✅ Clean, maintainable code
- ✅ Easy to extend

**You now have a professional, scalable template architecture!**

---

**Made with ❤️ for clean, maintainable code**

