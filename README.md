#  Smart City Data Dashboard

A real-time data dashboard that displays weather conditions and air quality information for cities worldwide using open APIs.

##  Project Overview

This Smart City Dashboard fetches live data from public APIs and presents it in an interactive, user-friendly interface. Users can search for any city and view comprehensive environmental data including temperature, humidity, wind speed, air quality index, and more.

##  Features

###  Weather Information
- Real-time temperature and weather conditions
- "Feels like" temperature
- Humidity levels
- Wind speed and direction
- Atmospheric pressure
- Visibility range
- Sunrise and sunset times

### Air Quality Monitoring
- Air Quality Index (AQI) with color-coded status
- Detailed pollutant breakdown:
  - PM2.5 and PM10 (Particulate Matter)
  - CO (Carbon Monoxide)
  - NO2 (Nitrogen Dioxide)
  - O3 (Ozone)
  - SO2 (Sulphur Dioxide)
  - NH3 (Ammonia)

###  Data Visualization
- Interactive dashboard with multiple sections
- Charts section (ready for Chart.js integration)
- Map view with city coordinates
- Raw data tables for detailed analysis
- JSON viewer for API responses

###  Map Integration
- City location display
- Coordinates and timezone information
- Ready for TomTom interactive maps

##  Technologies Used

### Frontend
- **HTML5** - Structure and semantic markup
- **CSS3** - Styling with modern features (Grid, Flexbox, animations)
- **JavaScript (ES6+)** - Interactive functionality and API integration

### APIs
- **Google Maps Platform** (Primary)
  - Maps JavaScript API - Interactive maps
  - Geocoding API - City name to coordinates
  - Places API - Autocomplete search
  - Air Quality API - Real-time AQI data
- **OpenWeatherMap API** (Fallback)
  - Current Weather API
  - Air Pollution API
- **Google Gemini API** - AI-powered city descriptions

## File Structure

```
City_Data_Dashboard/
│
├── index.html          # Main HTML structure
├── style.css           # All styling and responsive design
├── script.js           # JavaScript logic and API integration

├── config.js           # Your API keys (DO NOT COMMIT - in .gitignore)
├── build-config.js      # Netlify build script (generates config.js from env vars)

├── .gitignore          # Git ignore rules (protects config.js)
├── DEPLOYMENT.md       # Detailed deployment guide
└── README.md          # Project documentation
```


### API Rate Limits:
- Google Maps: Varies by API (check your quota)
- OpenWeatherMap Free: 60 calls/minute, 1,000,000 calls/month
- Gemini API: Check your quota in Google AI Studio

## 💡 How It Works

### 1. User Searches for a City
```javascript
function searchCity() {
    // Gets city name from input
    // Calls fetchWeatherData() and fetchAirQualityData()
}
```

### 2. Fetch Weather Data
```javascript
async function fetchWeatherData(city) {
    // Makes API call to OpenWeatherMap
    // URL: api.openweathermap.org/data/2.5/weather
    // Returns: temperature, humidity, wind, etc.
}
```

### 3. Fetch Air Quality Data
```javascript
async function fetchAirQualityData(city) {
    // Gets coordinates from weather data
    // Makes API call to Air Pollution endpoint
    // Returns: AQI and pollutant levels
}
```

### 4. Update Display
```javascript
function updateWeatherDisplay(data) {
    // Updates HTML elements with received data
    // Uses document.getElementById() to target elements
}
```

## 🎓 Key Concepts Used

### JavaScript Concepts:
- **Async/Await** - For handling API requests
- **Fetch API** - For making HTTP requests
- **Template Literals** - For dynamic HTML generation
- **DOM Manipulation** - For updating page content
- **Error Handling** - Try-catch blocks for robust code

### CSS Concepts:
- **CSS Grid** - For layout structure
- **Flexbox** - For component alignment
- **Media Queries** - For responsive design
- **CSS Variables** - For consistent theming
- **Animations** - For smooth transitions

### HTML Concepts:
- **Semantic HTML** - Proper use of tags
- **Accessibility** - Clear structure and labels
- **Data Attributes** - For JavaScript interaction

## 🎯 API Endpoints Used

### OpenWeatherMap

**Current Weather:**
```
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric
```

**Air Pollution:**
```
https://api.openweathermap.org/data/2.5/air_pollution?lat={lat}&lon={lon}&appid={API_KEY}
```

## 📊 Response Format

### Weather API Response:
```json
{
  "coord": { "lon": -0.1257, "lat": 51.5085 },
  "weather": [{ "description": "clear sky" }],
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 72,
    "pressure": 1013
  },
  "wind": { "speed": 3.5, "deg": 210 },
  "visibility": 10000,
  "sys": { "sunrise": 1699594234, "sunset": 1699628567 }
}
```

### Air Quality Response:
```json
{
  "list": [{
    "main": { "aqi": 2 },
    "components": {
      "pm2_5": 15.5,
      "pm10": 22.3,
      "o3": 45.2,
      "no2": 12.8
    }
  }]
}
```

## 🔍 Common Mentor Questions & Answers

### Q: How does the Fetch API work?
**A:** Fetch is a modern JavaScript method for making HTTP requests. It returns a Promise that resolves with the response. We use `async/await` syntax to wait for the API response before processing the data.

### Q: What is JSON and how do you use it?
**A:** JSON (JavaScript Object Notation) is a text format for transmitting data. APIs send data in JSON format. We parse it using `response.json()` which converts the JSON string into a JavaScript object we can work with.

### Q: How do you update HTML dynamically?
**A:** We use `document.getElementById('elementId')` to select elements and update their `textContent` or `innerHTML` properties. For example: `document.getElementById('temperature').textContent = "25°C";`

### Q: Why use async/await instead of callbacks?
**A:** Async/await makes asynchronous code more readable by making it look synchronous. It avoids "callback hell" and makes error handling easier with try-catch blocks.

### Q: How do API keys work?
**A:** API keys authenticate your application with the API service. They're included in the request URL as a parameter, allowing the API provider to track usage and enforce rate limits.

### Q: What happens if the API fails?
**A:** We wrap API calls in try-catch blocks. If the request fails, the catch block handles the error gracefully, showing a user-friendly message instead of crashing the application.

### Q: How is the air quality calculated?
**A:** OpenWeatherMap provides AQI on a 1-5 scale (1=Good, 5=Very Poor). We convert this to a more familiar 0-500 scale and apply color coding to make it easy to understand at a glance.

## 🎨 Design Features

- **Modern gradient background** - Purple to blue gradient
- **Card-based layout** - Clean, organized sections
- **Responsive design** - Works on desktop, tablet, and mobile
- **Color-coded AQI** - Green (good), Orange (moderate), Red (unhealthy)
- **Smooth animations** - Fade-in effects when switching sections
- **Professional styling** - Box shadows, rounded corners, hover effects

## 🔧 Future Enhancements

### Potential Additions:
1. **Chart Integration** - Add Chart.js for visual data representation
2. **Interactive Maps** - Integrate TomTom Maps SDK
3. **Weather Forecast** - Add 7-day forecast
4. **Historical Data** - Show data trends over time
5. **Multiple Cities** - Compare data across cities
6. **Notifications** - Alert for poor air quality
7. **Dark Mode** - Theme toggle option
8. **Geolocation** - Auto-detect user's city

## 📱 Responsive Breakpoints

- **Desktop**: > 768px (Full sidebar + content)
- **Mobile**: ≤ 768px (Stacked layout)

## 🐛 Troubleshooting

### API Key Issues:
- **401 Error**: API key may take up to 2 hours to activate after creation
- **Rate Limit**: Free tier has usage limits - avoid making too many requests

### City Not Found:
- Check spelling of city name
- Try adding country code (e.g., "London, UK")
- Use major city names for better results

### Data Not Loading:
- Check internet connection
- Open browser console (F12) to see error messages
- Verify API keys are still valid

## 📚 Learning Resources

- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [TomTom Developer Portal](https://developer.tomtom.com/)
- [MDN Web Docs - Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [JavaScript Async/Await](https://javascript.info/async-await)

## 👨‍💻 Development Notes

### Code Structure:
- **Initialization**: `init()` function runs on page load
- **Event Handlers**: Search bar accepts Enter key press
- **Error Handling**: All API calls wrapped in try-catch
- **Loading States**: Shows "..." while data is being fetched
- **Comments**: Extensive comments for easy understanding

### Best Practices Used:
- ✅ Semantic HTML5 elements
- ✅ Consistent naming conventions
- ✅ Modular function structure
- ✅ Error handling for all async operations
- ✅ Responsive design principles
- ✅ Clean, readable code

## 📄 License

This project is created for educational purposes as part of a Smart City Data Dashboard assignment.

## 🙏 Credits

- **Weather Data**: OpenWeatherMap (fallback)
- **Maps & Air Quality**: Google Maps Platform
- **AI Descriptions**: Google Gemini API
- **Charts**: Chart.js
- **Design Inspiration**: Modern dashboard UI/UX patterns

---

**Built with ❤️ for the Smart Cities Project**

**Last Updated**: November 2025

