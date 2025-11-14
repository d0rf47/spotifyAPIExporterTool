# EJS Partials Guide

## 🧩 What are Partials?

**Partials** (also called **includes**) are reusable EJS components that can be included in multiple templates. Think of them as building blocks for your pages.

## ✨ Benefits

- ✅ **DRY** (Don't Repeat Yourself) - Write once, use everywhere
- ✅ **Consistency** - Same header/footer on all pages
- ✅ **Maintainability** - Update one file, changes apply everywhere
- ✅ **Organization** - Keep common code in one place

## 📁 Structure

```
views/
├── partials/
│   ├── header.ejs       # Reusable header
│   └── footer.ejs       # Reusable footer
├── success.ejs          # Uses partials
├── error.ejs            # Uses partials
├── loading.ejs          # Uses partials
└── results.ejs          # Uses partials
```

## 🔧 How to Use Partials

### Basic Syntax

```ejs
<%- include('partials/header') %>
<!-- Your page content here -->
<%- include('partials/footer') %>
```

**Note:** Use `<%-` (not `<%=`) to include partials - this renders HTML without escaping.

### Passing Data to Partials

```ejs
<%- include('partials/header', { 
  pageTitle: 'My Page Title',
  customData: 'Some value'
}) %>
```

The partial can then access these variables:

```ejs
<!-- partials/header.ejs -->
<title><%= pageTitle %></title>
```

## 📝 Examples from This Project

### 1. Header Partial

**File:** `views/partials/header.ejs`

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
```

**Features:**
- Default title if none provided
- Optional extra head content (meta tags, scripts, etc.)
- Links to centralized stylesheet

### 2. Footer Partial

**File:** `views/partials/footer.ejs`

```ejs
  <footer class="app-footer">
    <p>Made with 🎵 using Spotify Web API</p>
    <p class="footer-links">
      <a href="https://developer.spotify.com" target="_blank">Spotify Developer</a> • 
      <a href="https://github.com" target="_blank">GitHub</a>
    </p>
  </footer>
</body>
</html>
```

**Features:**
- Consistent footer across all pages
- Closes body and html tags
- Links to external resources

## 🎯 Using Partials in Pages

### Example 1: Simple Include

```ejs
<!-- views/error.ejs -->
<%- include('partials/header', { pageTitle: 'Authentication Failed' }) %>
<body class="centered">
  <div class="container error-container">
    <h1>❌ Authentication Failed!</h1>
    <p class="error-message">Error: <%= errorMessage %></p>
  </div>
<%- include('partials/footer') %>
```

### Example 2: With Extra Head Content

```ejs
<!-- views/success.ejs -->
<%- include('partials/header', { 
  pageTitle: 'Authentication Successful',
  extraHead: '<meta http-equiv="refresh" content="2;url=/loading">'
}) %>
<body class="centered">
  <!-- Page content -->
<%- include('partials/footer') %>
```

### Example 3: With Script Tag

```ejs
<!-- views/loading.ejs -->
<%- include('partials/header', { 
  pageTitle: 'Loading Songs...',
  extraHead: '<script src="/js/loading.js" defer></script>'
}) %>
<body class="centered">
  <!-- Page content -->
<%- include('partials/footer') %>
```

## 🆕 Creating New Partials

### Step 1: Create the Partial

Create a file in `views/partials/`:

```bash
views/partials/navbar.ejs
```

### Step 2: Write the Component

```ejs
<!-- views/partials/navbar.ejs -->
<nav class="navbar">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </ul>
</nav>
```

### Step 3: Include It

```ejs
<!-- views/somepage.ejs -->
<%- include('partials/header', { pageTitle: 'My Page' }) %>
<body>
  <%- include('partials/navbar') %>
  <main>
    <!-- Your content -->
  </main>
<%- include('partials/footer') %>
```

## 💡 Advanced Patterns

### Conditional Partials

```ejs
<% if (user.isLoggedIn) { %>
  <%- include('partials/user-menu') %>
<% } else { %>
  <%- include('partials/login-button') %>
<% } %>
```

### Nested Partials

Partials can include other partials:

```ejs
<!-- partials/layout.ejs -->
<%- include('partials/header') %>
<%- include('partials/navbar') %>
<main>
  <!-- Content will go here -->
</main>
<%- include('partials/footer') %>
```

### Passing Complex Data

```ejs
<%- include('partials/user-card', { 
  user: {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/images/john.jpg'
  }
}) %>
```

## 🎨 Best Practices

### 1. Use Descriptive Names
```
✅ partials/header.ejs
✅ partials/navigation.ejs
✅ partials/song-card.ejs

❌ partials/comp1.ejs
❌ partials/thing.ejs
```

### 2. Keep Partials Focused
Each partial should do ONE thing well.

```
✅ header.ejs - Just the header
✅ footer.ejs - Just the footer
✅ navbar.ejs - Just navigation

❌ header-and-nav-and-sidebar.ejs - Too many responsibilities
```

### 3. Provide Default Values
```ejs
<% const title = typeof pageTitle !== 'undefined' ? pageTitle : 'Default' %>
<title><%= title %></title>
```

### 4. Document Parameters
Add comments to explain what data your partial expects:

```ejs
<!-- 
  User Card Partial
  
  Required parameters:
  - user.name (string)
  - user.email (string)
  
  Optional parameters:
  - user.avatar (string) - defaults to placeholder
-->
```

## 🔄 Common Use Cases

### Use Case 1: Consistent Layout
```ejs
<%- include('partials/header') %>
<body>
  <%- include('partials/navbar') %>
  <main>
    <!-- Page-specific content -->
  </main>
  <%- include('partials/sidebar') %>
  <%- include('partials/footer') %>
</body>
```

### Use Case 2: Repeated Components
```ejs
<% songs.forEach(song => { %>
  <%- include('partials/song-card', { song: song }) %>
<% }) %>
```

### Use Case 3: Different Layouts
```ejs
<!-- Public page -->
<%- include('partials/public-header') %>

<!-- Admin page -->
<%- include('partials/admin-header') %>
```

## 📚 Project Examples

### Current Structure

**Before partials:**
```ejs
<!-- views/success.ejs -->
<!DOCTYPE html>
<html>
<head>
  <title>Success</title>
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <!-- content -->
</body>
</html>
```

**After partials:**
```ejs
<!-- views/success.ejs -->
<%- include('partials/header', { pageTitle: 'Success' }) %>
<body>
  <!-- content -->
<%- include('partials/footer') %>
```

### Benefits Achieved

- ✅ 4 lines instead of 8+ per page
- ✅ Consistent structure across all pages
- ✅ Easy to add new features (analytics, fonts, etc.)
- ✅ One place to update meta tags, stylesheets, scripts

## 🚀 Quick Reference

```ejs
<!-- Include a partial -->
<%- include('partials/header') %>

<!-- Include with data -->
<%- include('partials/header', { pageTitle: 'My Page' }) %>

<!-- Include with multiple parameters -->
<%- include('partials/card', { 
  title: 'Card Title',
  content: 'Card content',
  buttonText: 'Click Me'
}) %>

<!-- Conditional include -->
<% if (showFooter) { %>
  <%- include('partials/footer') %>
<% } %>

<!-- Include in a loop -->
<% items.forEach(item => { %>
  <%- include('partials/item', { item: item }) %>
<% }) %>
```

## 📖 Further Reading

- **EJS Documentation:** https://ejs.co/#docs
- **Includes:** https://ejs.co/#includes

---

**Now you can create reusable components and build pages faster!** 🎉

