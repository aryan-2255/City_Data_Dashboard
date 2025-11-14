# 🔒 Security Setup - API Keys Configuration

## ⚠️ IMPORTANT: API Keys Security

All API keys have been moved to a separate configuration file for security.

---

## 📁 Files Structure

```
Project Open Source/
├── config.js              ⚠️ Contains API keys (NOT in git)
├── config.example.js      ✅ Template file (safe to commit)
├── .gitignore            ✅ Excludes config.js from git
└── script.js             ✅ Uses keys from config.js
```

---

## 🚀 Setup Instructions

### Step 1: Check if config.js exists

If `config.js` already exists, you're good to go!

### Step 2: If config.js doesn't exist

1. Copy the example file:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and add your API keys:
   ```javascript
   const API_CONFIG = {
       openWeather: {
           key: "YOUR_OPENWEATHER_API_KEY_HERE",
           // ...
       },
       googleMaps: {
           key: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
           // ...
       },
       climatiq: {
           key: "YOUR_CLIMATIQ_API_KEY_HERE",
           // ...
       }
   };
   ```

3. Save the file - it's already in `.gitignore` so it won't be committed

---

## 🔐 Security Notes

### ✅ Protected Files:
- `config.js` - **Excluded from git** (in `.gitignore`)
- Contains all sensitive API keys

### ✅ Safe to Commit:
- `config.example.js` - Template without real keys
- `script.js` - No hardcoded keys
- `index.html` - No hardcoded keys
- All other project files

### ⚠️ Important:
- **Never commit `config.js`** to version control
- **Never share `config.js`** publicly
- Keep `config.example.js` as a template
- Use `.gitignore` to prevent accidental commits

---

## 🔍 How It Works

1. **HTML loads** `config.js` first (line 279 in index.html)
2. **script.js** uses `API_CONFIG` from config.js
3. If `config.js` is missing, script.js shows an error

---

## 📝 Git Ignore

The `.gitignore` file includes:
```
config.js
.env
.env.local
```

This ensures sensitive files are never committed.

---

## ✅ Verification

After setup, verify:
1. ✅ `config.js` exists and has your API keys
2. ✅ `.gitignore` includes `config.js`
3. ✅ Open `index.html` - dashboard should work
4. ✅ Check git status - `config.js` should NOT appear

---

## 🛠️ Troubleshooting

### Error: "config.js file not found"
- **Solution**: Create `config.js` from `config.example.js`

### Error: "API key invalid"
- **Solution**: Check your API keys in `config.js`

### Keys visible in browser?
- **Note**: Frontend JavaScript runs in the browser, so API keys will be visible to users. This is normal for client-side apps.
- **Best Practice**: Use API key restrictions in your API provider's dashboard:
  - Google Cloud Console: Restrict by HTTP referrer
  - OpenWeatherMap: Use allowed IPs/domains
  - Climatiq: Restrict by domain/IP

---

*Last Updated: November 14, 2025*

