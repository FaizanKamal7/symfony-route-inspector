# Quick Start - Test Your Bundle Visually

## 🚀 Fastest Way to See Your Bundle in Action

### Step 1: Run the Setup Script

Open Command Prompt and run:

```bash
cd "d:\Software And Games (E)\Side Hustles\symfony-route-inspector"
setup-test-app.bat
```

This will:
- Create a `test-app` directory next to your bundle
- Install your bundle as a local dependency
- Configure everything automatically
- Create sample routes for testing

### Step 2: Start the Server

```bash
cd ..\test-app
symfony server:start
```

Or if you don't have Symfony CLI:

```bash
php -S localhost:8000 -t public
```

### Step 3: Open Your Browser

Visit: **http://localhost:8000/_route_inspector/dashboard**

You should see your beautiful dashboard! 🎉

---

## 🎨 Making Visual Improvements

### Edit CSS (Styling)

1. Open `d:\Software And Games (E)\Side Hustles\symfony-route-inspector\public\dashboard.css`
2. Make changes (colors, fonts, spacing, etc.)
3. **Save**
4. **Refresh browser** - changes appear immediately!

Example changes to try:
```css
/* Change primary color from blue to purple */
.stat-primary { color: #8b5cf6; }

/* Make cards more rounded */
.stat-card {
    border-radius: 20px;
}

/* Add hover effect to tables */
.routes-table tbody tr:hover {
    background: #334155;
    transform: scale(1.01);
    transition: all 0.2s;
}
```

### Edit JavaScript (Functionality)

1. Open `d:\Software And Games (E)\Side Hustles\symfony-route-inspector\public\dashboard.js`
2. Make changes to Vue.js logic
3. **Save**
4. **Hard refresh browser** (Ctrl+Shift+R)

Example changes to try:
```javascript
// Add a new computed property
computed: {
    // ... existing computeds
    totalSecuredRoutes() {
        return this.routes.filter(r => r.security).length;
    }
}

// Add new method
methods: {
    // ... existing methods
    exportToCSV() {
        const csv = this.routes.map(r =>
            `${r.name},${r.path},${r.methods.join('|')}`
        ).join('\n');
        console.log(csv);
    }
}
```

### Edit Twig Template (Structure)

1. Open `d:\Software And Games (E)\Side Hustles\symfony-route-inspector\templates\dashboard.html.twig`
2. Make changes to HTML structure
3. **Save**
4. **Refresh browser**

---

## 🔍 Browser Developer Tools

### Open DevTools (F12)

**Console Tab:**
- See JavaScript errors
- Test Vue data: `$vm0.$data`

**Network Tab:**
- Check API calls to your endpoints
- Debug slow requests

**Elements Tab:**
- Inspect CSS styles
- Make live edits to test ideas
- Copy changes back to your CSS file

**Vue DevTools Extension:**
Install from:
- Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

---

## 🎯 Quick Improvements to Try

### 1. Change Color Scheme

Edit `dashboard.css`:
```css
/* Background colors */
body { background: #1a1a2e; }
.dashboard-header { background: #16213e; }

/* Accent colors */
.tab-button.active { background: #0f3460; }
.stat-primary { color: #e94560; }
```

### 2. Add Route Count Badge

Edit `dashboard.js` template section:
```javascript
template: `
    ...
    <h1 class="dashboard-title">
        🔍 Symfony Route Inspector
        <span style="background: #3b82f6; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 1rem;">
            {{ statistics.total }} routes
        </span>
    </h1>
    ...
`
```

### 3. Add Search Highlight

Edit `dashboard.js` methods:
```javascript
methods: {
    highlightSearch(text) {
        if (!this.searchQuery) return text;
        const regex = new RegExp(`(${this.searchQuery})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
}
```

### 4. Add Loading Animation

Edit `dashboard.css`:
```css
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.loading {
    animation: pulse 2s infinite;
}
```

---

## 📁 File Structure Reference

```
Your Bundle:
d:\Software And Games (E)\Side Hustles\symfony-route-inspector\
├─ public/
│  ├─ dashboard.css      ← Edit styles here
│  └─ dashboard.js       ← Edit JavaScript here
├─ templates/
│  └─ dashboard.html.twig ← Edit HTML structure here
└─ src/
   └─ Service/
      └─ RouteInspectorService.php ← Edit backend logic here

Test App:
d:\Software And Games (E)\Side Hustles\test-app\
├─ public/
│  └─ bundles/
│     └─ routeinspector/  ← Symlinked assets (auto-updated)
└─ vendor/
   └─ faizankamal/
      └─ symfony-route-inspector/ ← Symlinked to your bundle
```

---

## 🐛 Troubleshooting

### Dashboard shows blank page

**Check browser console (F12):**
- Look for JavaScript errors
- Check if API calls are successful

**Check Symfony logs:**
```bash
cd test-app
tail -f var/log/dev.log
```

### CSS changes not appearing

**Clear Symfony cache:**
```bash
cd test-app
php bin/console cache:clear
```

**Hard refresh browser:**
- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### Routes not showing

**Debug router:**
```bash
cd test-app
php bin/console debug:router | grep route_inspector
```

Should show 6 routes starting with `route_inspector_`

---

## 🎨 Recommended Improvements

### Beginner:
- [ ] Change color scheme
- [ ] Adjust spacing and padding
- [ ] Change font sizes
- [ ] Add hover effects
- [ ] Customize badge colors

### Intermediate:
- [ ] Add dark/light theme toggle
- [ ] Improve mobile responsiveness
- [ ] Add animations and transitions
- [ ] Add tooltips
- [ ] Add export buttons

### Advanced:
- [ ] Add route dependency graph
- [ ] Add real-time search with highlighting
- [ ] Add route testing interface
- [ ] Add performance metrics
- [ ] Add custom filters

---

## 💡 Pro Tips

1. **Keep browser DevTools open** - See changes in real-time
2. **Use Vue DevTools** - Debug Vue components easily
3. **Test with real routes** - Add more controllers to test-app
4. **Check different screen sizes** - Use responsive mode in DevTools
5. **Test API responses** - Use Network tab to see JSON data

---

## 🚀 Next Steps

1. Run `setup-test-app.bat`
2. Open http://localhost:8000/_route_inspector/dashboard
3. Open `public/dashboard.css` in your editor
4. Make changes and refresh browser
5. Iterate until perfect!

**Have fun building! 🎉**
