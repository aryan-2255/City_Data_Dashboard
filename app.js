// ===== GLOBAL VARIABLES =====
let currentCity = "Delhi"; // Default city
let weatherData = null;
let airQualityData = null;

// ===== API KEYS (You need to add your own API keys here) =====
// Get free API keys from:
// Weather: https://openweathermap.org/api
// Air Quality: https://aqicn.org/api/

const API_KEYS = {
    weather: "YOUR_WEATHER_API_KEY_HERE",  // OpenWeatherMap API key
    airQuality: "YOUR_AIR_QUALITY_API_KEY_HERE"  // AQI API key
};

// ===== INITIALIZATION =====
// This function runs when the page loads
function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // Update time every second
    
    // Show welcome message
    console.log("Smart City Dashboard Loaded!");
    console.log("To connect APIs, add your API keys in script.js");
    
    // Load sample data for demonstration
    loadSampleData();
}

// ===== UPDATE CURRENT TIME =====
function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentTime').textContent = `${dateString} - ${timeString}`;
}

// ===== NAVIGATION BETWEEN SECTIONS =====
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active menu item
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });
    
    event.currentTarget.classList.add('active');
    
    console.log(`Switched to ${sectionName} section`);
}

// ===== SEARCH CITY =====
function searchCity() {
    const searchInput = document.getElementById('citySearch');
    const cityName = searchInput.value.trim();
    
    if (cityName === "") {
        alert("Please enter a city name!");
        return;
    }
    
    currentCity = cityName;
    document.getElementById('selectedCity').textContent = cityName;
    
    console.log(`Searching for city: ${cityName}`);
    
    // When you add your API keys, uncomment these lines:
    // fetchWeatherData(cityName);
    // fetchAirQualityData(cityName);
    
    // For now, load sample data
    loadSampleData();
    
    alert(`Searching data for ${cityName}...`);
}

// ===== FETCH WEATHER DATA (Real API - Add your key) =====
async function fetchWeatherData(city) {
    // Check if API key is added
    if (API_KEYS.weather === "YOUR_WEATHER_API_KEY_HERE") {
        console.log("Please add your OpenWeatherMap API key!");
        return;
    }
    
    try {
        // API endpoint
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.weather}&units=metric`;
        
        // Fetch data from API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            weatherData = data;
            updateWeatherDisplay(data);
            updateRawDataTables(data, 'weather');
            console.log("Weather data fetched successfully!");
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data. Check console for details.");
    }
}

// ===== FETCH AIR QUALITY DATA (Real API - Add your key) =====
async function fetchAirQualityData(city) {
    // Check if API key is added
    if (API_KEYS.airQuality === "YOUR_AIR_QUALITY_API_KEY_HERE") {
        console.log("Please add your Air Quality API key!");
        return;
    }
    
    try {
        // API endpoint
        const url = `https://api.waqi.info/feed/${city}/?token=${API_KEYS.airQuality}`;
        
        // Fetch data from API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === "ok") {
            airQualityData = data.data;
            updateAirQualityDisplay(data.data);
            updateRawDataTables(data.data, 'aqi');
            console.log("Air quality data fetched successfully!");
        } else {
            alert("Error fetching air quality data");
        }
    } catch (error) {
        console.error("Error fetching air quality data:", error);
        alert("Failed to fetch air quality data. Check console for details.");
    }
}

// ===== UPDATE WEATHER DISPLAY =====
function updateWeatherDisplay(data) {
    // Temperature
    document.getElementById('temperature').textContent = Math.round(data.main.temp);
    document.getElementById('feelsLike').textContent = Math.round(data.main.feels_like);
    
    // Weather description
    document.getElementById('weatherDesc').textContent = data.weather[0].description.toUpperCase();
    
    // Other weather info
    document.getElementById('windSpeed').textContent = `${data.wind.speed} km/h`;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;
    
    // Sunrise and Sunset
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    document.getElementById('sunrise').textContent = sunrise;
    document.getElementById('sunset').textContent = sunset;
    
    // Last update time
    const lastUpdate = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('lastUpdate').textContent = lastUpdate;
    
    // Map location data
    document.getElementById('mapCity').textContent = data.name;
    document.getElementById('coordinates').textContent = `${data.coord.lat.toFixed(2)}, ${data.coord.lon.toFixed(2)}`;
    document.getElementById('timezone').textContent = `UTC ${data.timezone / 3600}`;
}

// ===== UPDATE AIR QUALITY DISPLAY =====
function updateAirQualityDisplay(data) {
    const aqi = data.aqi;
    const aqiValueElement = document.getElementById('aqiValue');
    const aqiStatusElement = document.getElementById('aqiStatus');
    
    // Update AQI value
    aqiValueElement.textContent = aqi;
    
    // Remove all AQI classes
    aqiValueElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy');
    
    // Determine AQI status and color
    if (aqi <= 50) {
        aqiValueElement.classList.add('aqi-good');
        aqiStatusElement.textContent = "Good - Air quality is satisfactory";
    } else if (aqi <= 100) {
        aqiValueElement.classList.add('aqi-moderate');
        aqiStatusElement.textContent = "Moderate - Acceptable air quality";
    } else {
        aqiValueElement.classList.add('aqi-unhealthy');
        aqiStatusElement.textContent = "Unhealthy - May cause health issues";
    }
}

// ===== UPDATE RAW DATA TABLES =====
function updateRawDataTables(data, type) {
    if (type === 'weather') {
        const tableBody = document.getElementById('weatherDataTable');
        tableBody.innerHTML = `
            <tr>
                <td>Temperature</td>
                <td>${data.main.temp}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Feels Like</td>
                <td>${data.main.feels_like}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Humidity</td>
                <td>${data.main.humidity}</td>
                <td>%</td>
            </tr>
            <tr>
                <td>Pressure</td>
                <td>${data.main.pressure}</td>
                <td>hPa</td>
            </tr>
            <tr>
                <td>Wind Speed</td>
                <td>${data.wind.speed}</td>
                <td>m/s</td>
            </tr>
            <tr>
                <td>Visibility</td>
                <td>${data.visibility}</td>
                <td>meters</td>
            </tr>
        `;
        
        // Update JSON display
        document.getElementById('jsonData').textContent = JSON.stringify(data, null, 2);
    }
    
    if (type === 'aqi') {
        const tableBody = document.getElementById('aqiDataTable');
        const iaqi = data.iaqi;
        
        let tableHTML = '';
        for (let pollutant in iaqi) {
            const value = iaqi[pollutant].v;
            let status = 'Good';
            if (value > 50) status = 'Moderate';
            if (value > 100) status = 'Unhealthy';
            
            tableHTML += `
                <tr>
                    <td>${pollutant.toUpperCase()}</td>
                    <td>${value}</td>
                    <td>${status}</td>
                </tr>
            `;
        }
        
        tableBody.innerHTML = tableHTML;
    }
}

// ===== LOAD SAMPLE DATA (For demonstration without API) =====
function loadSampleData() {
    // Sample weather data
    const sampleWeather = {
        main: {
            temp: 25,
            feels_like: 27,
            humidity: 65,
            pressure: 1013
        },
        weather: [
            { description: "Partly Cloudy" }
        ],
        wind: {
            speed: 3.5
        },
        visibility: 8000,
        sys: {
            sunrise: Date.now() / 1000 - 21600,
            sunset: Date.now() / 1000 + 21600
        },
        name: currentCity,
        coord: {
            lat: 28.6139,
            lon: 77.2090
        },
        timezone: 19800
    };
    
    // Sample AQI data
    const sampleAQI = {
        aqi: 75,
        iaqi: {
            pm25: { v: 65 },
            pm10: { v: 80 },
            o3: { v: 45 },
            no2: { v: 30 },
            so2: { v: 15 },
            co: { v: 20 }
        }
    };
    
    // Update displays with sample data
    updateWeatherDisplay(sampleWeather);
    updateAirQualityDisplay(sampleAQI);
    updateRawDataTables(sampleWeather, 'weather');
    updateRawDataTables(sampleAQI, 'aqi');
    
    // Add moon phase (sample)
    document.getElementById('moonPhase').textContent = "Waxing Crescent";
    
    // Add population (sample)
    document.getElementById('population').textContent = "~10 Million";
    
    console.log("Sample data loaded successfully!");
}

// ===== HELPER FUNCTIONS =====

// Function to convert Unix timestamp to readable time
function unixToTime(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Function to capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// ===== EVENT LISTENERS =====

// Allow search on Enter key press
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('citySearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchCity();
            }
        });
    }
    
    // Initialize the dashboard
    init();
});

// ===== INSTRUCTIONS FOR ADDING REAL APIs =====
/*
TO CONNECT REAL APIs:

1. WEATHER API (OpenWeatherMap):
   - Go to: https://openweathermap.org/api
   - Sign up for free account
   - Get your API key
   - Replace "YOUR_WEATHER_API_KEY_HERE" with your actual key
   - Uncomment fetchWeatherData() call in searchCity() function

2. AIR QUALITY API (WAQI):
   - Go to: https://aqicn.org/api/
   - Request API token (free)
   - Replace "YOUR_AIR_QUALITY_API_KEY_HERE" with your actual token
   - Uncomment fetchAirQualityData() call in searchCity() function

3. FOR CHARTS:
   - Add Chart.js library: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
   - Create chart instances in the chart section
   - Example code available in Chart.js documentation

4. FOR MAP:
   - Add Leaflet library: 
     <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
     <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   - Initialize map with coordinates from weather data

SAMPLE QUESTIONS MENTORS MIGHT ASK:

Q: How does the fetch API work?
A: Fetch is used to make HTTP requests to APIs. It returns a Promise that resolves 
   to the response. We use async/await to handle the asynchronous code.

Q: What is JSON?
A: JSON (JavaScript Object Notation) is a format for storing and transporting data.
   APIs send data in JSON format, which we parse in JavaScript.

Q: How do you update HTML dynamically?
A: We use document.getElementById() to select elements, then change their 
   textContent or innerHTML properties.

Q: What are template literals?
A: Template literals use backticks (``) and allow us to embed variables 
   in strings using ${variable} syntax.

Q: Why use async/await?
A: Async/await makes asynchronous code easier to read and write. It waits 
   for API responses before continuing execution.
*/

console.log("Smart City Dashboard JavaScript Loaded!");
console.log("Check the code comments for instructions on connecting real APIs");

