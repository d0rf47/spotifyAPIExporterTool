# EJS Templates Quick Reference

## 🎯 What is EJS?

**EJS (Embedded JavaScript)** is a simple templating language that lets you generate HTML with plain JavaScript.

### Why EJS?
- ✅ **Better syntax highlighting** - Your editor knows it's HTML
- ✅ **Cleaner code** - Separate HTML from logic
- ✅ **Industry standard** - Used by millions of developers
- ✅ **Easy to learn** - Just HTML + a few tags

## 📝 EJS Syntax

### 1. Output (Escaped)
```ejs
<h1><%= title %></h1>
```
- Outputs and **escapes** HTML characters
- Safe to use with user input
- **Use this 99% of the time**

### 2. Output (Unescaped)
```ejs
<div><%- htmlContent %></div>
```
- Outputs **raw** HTML
- ⚠️ Use carefully - can be unsafe!
- Only use with trusted content

### 3. JavaScript Code
```ejs
<% if (user.loggedIn) { %>
  <p>Welcome back!</p>
<% } %>
```
- Execute JavaScript code
- Doesn't output anything
- Use for loops, conditionals, etc.

### 4. Comments
```ejs
<%# This is a comment - won't be rendered %>
```
- Comments that won't appear in HTML
- Use for notes to other developers

## 🔄 Common Patterns

### Variables
```ejs
<h1><%= pageTitle %></h1>
<p><%= userName %></p>
<span><%= songCount %></span>
```

### Conditionals
```ejs
<% if (songs.length > 0) { %>
  <p>You have <%= songs.length %> songs!</p>
<% } else { %>
  <p>No songs found.</p>
<% } %>
```

### Loops
```ejs
<ul>
  <% songs.forEach(song => { %>
    <li><%= song.name %> - <%= song.artist %></li>
  <% }); %>
</ul>
```

### Array with Index
```ejs
<table>
  <% songs.forEach((song, index) => { %>
    <tr>
      <td><%= index + 1 %></td>
      <td><%= song.name %></td>
    </tr>
  <% }); %>
</table>
```

## 📂 File Structure

### Template File
**`views/mypage.ejs`**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title><%= title %></title>
</head>
<body>
  <h1><%= heading %></h1>
  <p>Total items: <%= items.length %></p>
  
  <ul>
    <% items.forEach(item => { %>
      <li><%= item.name %></li>
    <% }); %>
  </ul>
</body>
</html>
```

### Route Handler
**`routes/myroutes.js`**
```javascript
router.get('/mypage', (req, res) => {
  res.render('mypage', {
    title: 'My Page',
    heading: 'Welcome!',
    items: [
      { name: 'Item 1' },
      { name: 'Item 2' }
    ]
  });
});
```

## 🎨 Real Examples from This Project

### Success Page
**`views/success.ejs`**
```html
<h1>✓ Authentication Successful!</h1>
<p>You're all set!</p>
```
- No variables needed
- Pure HTML

### Error Page
**`views/error.ejs`**
```html
<h1>❌ Authentication Failed!</h1>
<p class="error-message">Error: <%= errorMessage %></p>
```
- One variable: `errorMessage`
- Displays dynamic error

### Results Page
**`views/results.ejs`**
```html
<h1>🎵 Your Spotify Liked Songs</h1>
<div class="stats">
  Total Songs: <strong><%= songs.length %></strong>
</div>

<table>
  <% songs.forEach((item, index) => { %>
    <% const track = item.track; %>
    <% const artists = track.artists.map(a => a.name).join(', '); %>
    <tr>
      <td><%= index + 1 %></td>
      <td><%= track.name %></td>
      <td><%= artists %></td>
    </tr>
  <% }); %>
</table>
```
- Loop through songs array
- Calculate values inline
- Display dynamic content

## 🔧 Configuration in Express

**`server2-organized.js`**
```javascript
const express = require('express');
const path = require('path');
const app = express();

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Render a template
app.get('/mypage', (req, res) => {
  res.render('mypage', { 
    title: 'My Page',
    data: 'Some data'
  });
});
```

## 💡 Tips & Best Practices

### 1. Pass All Data in render()
```javascript
// ✅ Good
res.render('results', { 
  songs: fetchedSongs,
  exportDate: new Date().toLocaleString()
});

// ❌ Bad - trying to access global variables
res.render('results');
```

### 2. Keep Logic Simple
```ejs
<!-- ✅ Good -->
<% const artistName = track.artists.map(a => a.name).join(', '); %>
<td><%= artistName %></td>

<!-- ❌ Too complex - move to route -->
<td><%= calculateComplexValue(track, options, settings) %></td>
```

### 3. Always Escape User Input
```ejs
<!-- ✅ Good - escaped -->
<p><%= userInput %></p>

<!-- ❌ Dangerous - unescaped -->
<p><%- userInput %></p>
```

### 4. Use Comments
```ejs
<%# Loop through all songs and display in table %>
<% songs.forEach(song => { %>
  <tr>...</tr>
<% }); %>
```

## 🆚 Comparison: Template Literals vs EJS

### Template Literals (Before)
```javascript
function renderResults(songs) {
  return `
    <html>
      <body>
        <h1>Songs: ${songs.length}</h1>
        ${songs.map(s => `
          <div>${s.name}</div>
        `).join('')}
      </body>
    </html>
  `;
}
```

### EJS (After)
```html
<html>
  <body>
    <h1>Songs: <%= songs.length %></h1>
    <% songs.forEach(song => { %>
      <div><%= song.name %></div>
    <% }); %>
  </body>
</html>
```

**Benefits:**
- ✅ Syntax highlighting
- ✅ Cleaner HTML
- ✅ Better editor support
- ✅ Easier for designers

## 📚 Learn More

- **Official Docs:** https://ejs.co/
- **Express + EJS:** https://expressjs.com/en/guide/using-template-engines.html

## 🚀 Quick Start

1. **Install EJS:**
```bash
npm install ejs
```

2. **Configure Express:**
```javascript
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
```

3. **Create template:**
```html
<!-- views/hello.ejs -->
<h1>Hello <%= name %>!</h1>
```

4. **Render it:**
```javascript
app.get('/hello', (req, res) => {
  res.render('hello', { name: 'World' });
});
```

**That's it!** You're now using EJS! 🎉

