// ===== GLOBAL VARIABLES =====
let currentCity = null; // Will be set when user searches
let weatherData = null;
let airQualityData = null;
let map = null; // Google Maps instance
let marker = null; // Map marker
let autocomplete = null; // Google Places Autocomplete
let googleMapsReady = false; // Flag to track if Google Maps is loaded

// ===== API KEYS =====
// OpenWeatherMap: Weather + Air Quality data
// Google Maps: Interactive maps and geocoding

const API_KEYS = {
    openWeather: "63eeefb285cd94e898abfd05116834aa",  // OpenWeatherMap API key
    googleMaps: "AIzaSyC_-Fnc-DHYiAf5nWP90frrHP32QA7L3so"  // Google Maps API key
};

// ===== GOOGLE MAPS CALLBACK =====
// This is called when Google Maps API finishes loading
function initGoogleMaps() {
    googleMapsReady = true;
    console.log("✅ Google Maps API loaded successfully");
    
    // Initialize map
    initializeGoogleMap();
    
    // Initialize autocomplete for search
    initializeAutocomplete();
}

// ===== INITIALIZATION =====
// This function runs when the page loads
function init() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // Update time every second
    
    // If Google Maps already loaded, initialize it
    if (typeof google !== 'undefined' && google.maps && google.maps.places) {
        initGoogleMaps();
    }
    
    // Show welcome message
    console.log("Smart City Dashboard Loaded!");
    console.log("APIs: OpenWeatherMap + Google Maps (with Places & Geocoding)");
    console.log("Search for a city to see real-time data!");
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
    let cityName = searchInput.value.trim();
    
    if (cityName === "") {
        alert("Please enter a city name!");
        return;
    }
    
    // If using Google Places autocomplete, extract just the city name
    // Remove country and other details if present
    const cityParts = cityName.split(',');
    cityName = cityParts[0].trim(); // Take first part (city name)
    
    currentCity = cityName;
    document.getElementById('selectedCity').textContent = cityName;
    
    console.log(`Fetching data for city: ${cityName}`);
    
    // Fetch real data from APIs
    fetchWeatherData(cityName);
    fetchAirQualityData(cityName);
    
    // Also try to get coordinates from Google Geocoding for better accuracy
    if (googleMapsReady) {
        geocodeCity(cityName);
    }
}

// ===== FETCH WEATHER DATA FROM OPENWEATHERMAP =====
async function fetchWeatherData(city) {
    try {
        // Show loading state
        document.getElementById('temperature').textContent = "...";
        document.getElementById('weatherDesc').textContent = "Loading...";
        
        // API endpoint for current weather
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.openWeather}&units=metric`;
        
        console.log(`Fetching weather for: ${city}`);
        
        // Fetch data from API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.cod === 200) {
            weatherData = data;
            updateWeatherDisplay(data);
            updateRawDataTables(data, 'weather');
            console.log("✅ Weather data fetched successfully!", data);
        } else {
            console.error("Weather API Error:", data.message);
            alert(`Error: ${data.message}. Try another city name.`);
            // Reset to loading state
            document.getElementById('weatherDesc').textContent = "City not found";
        }
    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to fetch weather data. Check your internet connection.");
    }
}

// ===== FETCH AIR QUALITY DATA FROM OPENWEATHERMAP =====
async function fetchAirQualityData(city) {
    try {
        // First, we need coordinates from the city name
        // We'll get this from the weather data if available
        if (!weatherData || !weatherData.coord) {
            console.log("Waiting for weather data to get coordinates...");
            // If weather data not available yet, try getting it
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEYS.openWeather}`;
            const weatherResponse = await fetch(weatherUrl);
            const weatherInfo = await weatherResponse.json();
            
            if (weatherInfo.cod !== 200) {
                console.error("Cannot get coordinates for air quality");
                return;
            }
            weatherData = weatherInfo;
        }
        
        const { lat, lon } = weatherData.coord;
        
        // Show loading state
        document.getElementById('aqiValue').textContent = "...";
        document.getElementById('aqiStatus').textContent = "Loading...";
        
        // OpenWeatherMap Air Pollution API endpoint
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEYS.openWeather}`;
        
        console.log(`Fetching air quality for coordinates: ${lat}, ${lon}`);
        
        // Fetch data from API
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.list && data.list.length > 0) {
            airQualityData = data.list[0];
            updateAirQualityDisplay(airQualityData);
            updateRawDataTables(airQualityData, 'aqi');
            console.log("✅ Air quality data fetched successfully!", airQualityData);
        } else {
            console.error("No air quality data available");
            document.getElementById('aqiStatus').textContent = "Data not available";
        }
    } catch (error) {
        console.error("Error fetching air quality data:", error);
        document.getElementById('aqiStatus').textContent = "Failed to load";
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
    document.getElementById('timezone').textContent = `UTC ${data.timezone / 3600 > 0 ? '+' : ''}${(data.timezone / 3600).toFixed(1)}`;
    
    // Update Google Map with city location
    updateGoogleMap(data.coord.lat, data.coord.lon, data.name);
    
    // Fetch population data from Google Places API
    fetchCityPopulation(data.name, data.coord.lat, data.coord.lon);
    
    // Fetch moon phase from API (using a free API)
    fetchMoonPhase(data.coord.lat, data.coord.lon);
}

// ===== UPDATE AIR QUALITY DISPLAY =====
function updateAirQualityDisplay(data) {
    // OpenWeatherMap returns AQI in data.main.aqi (1-5 scale)
    // 1 = Good, 2 = Fair, 3 = Moderate, 4 = Poor, 5 = Very Poor
    const aqi = data.main.aqi;
    
    // Convert to US AQI scale (0-500) for display
    // This is an approximation
    let aqiValue, aqiStatus, aqiClass;
    
    switch(aqi) {
        case 1:
            aqiValue = 25;
            aqiStatus = "Good - Air quality is excellent";
            aqiClass = "aqi-good";
            break;
        case 2:
            aqiValue = 60;
            aqiStatus = "Fair - Air quality is acceptable";
            aqiClass = "aqi-good";
            break;
        case 3:
            aqiValue = 100;
            aqiStatus = "Moderate - May affect sensitive people";
            aqiClass = "aqi-moderate";
            break;
        case 4:
            aqiValue = 150;
            aqiStatus = "Poor - Health effects for everyone";
            aqiClass = "aqi-unhealthy";
            break;
        case 5:
            aqiValue = 250;
            aqiStatus = "Very Poor - Serious health effects";
            aqiClass = "aqi-unhealthy";
            break;
        default:
            aqiValue = "--";
            aqiStatus = "Unknown";
            aqiClass = "aqi-good";
    }
    
    const aqiValueElement = document.getElementById('aqiValue');
    const aqiStatusElement = document.getElementById('aqiStatus');
    
    // Update AQI value
    aqiValueElement.textContent = aqiValue;
    
    // Remove all AQI classes
    aqiValueElement.classList.remove('aqi-good', 'aqi-moderate', 'aqi-unhealthy');
    
    // Add appropriate class
    aqiValueElement.classList.add(aqiClass);
    aqiStatusElement.textContent = aqiStatus;
}

// ===== UPDATE RAW DATA TABLES =====
function updateRawDataTables(data, type) {
    if (type === 'weather') {
        const tableBody = document.getElementById('weatherDataTable');
        tableBody.innerHTML = `
            <tr>
                <td>Temperature</td>
                <td>${Math.round(data.main.temp)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Feels Like</td>
                <td>${Math.round(data.main.feels_like)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Min Temperature</td>
                <td>${Math.round(data.main.temp_min)}</td>
                <td>°C</td>
            </tr>
            <tr>
                <td>Max Temperature</td>
                <td>${Math.round(data.main.temp_max)}</td>
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
                <td>Wind Direction</td>
                <td>${data.wind.deg || 'N/A'}</td>
                <td>degrees</td>
            </tr>
            <tr>
                <td>Visibility</td>
                <td>${(data.visibility / 1000).toFixed(1)}</td>
                <td>km</td>
            </tr>
            <tr>
                <td>Cloudiness</td>
                <td>${data.clouds.all}</td>
                <td>%</td>
            </tr>
        `;
        
        // Update JSON display with weather data
        document.getElementById('jsonData').textContent = JSON.stringify(data, null, 2);
    }
    
    if (type === 'aqi') {
        const tableBody = document.getElementById('aqiDataTable');
        const components = data.components;
        
        let tableHTML = '';
        
        // Define pollutant names and their units
        const pollutants = {
            'co': { name: 'Carbon Monoxide (CO)', unit: 'μg/m³' },
            'no': { name: 'Nitrogen Monoxide (NO)', unit: 'μg/m³' },
            'no2': { name: 'Nitrogen Dioxide (NO2)', unit: 'μg/m³' },
            'o3': { name: 'Ozone (O3)', unit: 'μg/m³' },
            'so2': { name: 'Sulphur Dioxide (SO2)', unit: 'μg/m³' },
            'pm2_5': { name: 'PM2.5', unit: 'μg/m³' },
            'pm10': { name: 'PM10', unit: 'μg/m³' },
            'nh3': { name: 'Ammonia (NH3)', unit: 'μg/m³' }
        };
        
        for (let pollutant in components) {
            const value = components[pollutant];
            const pollutantInfo = pollutants[pollutant] || { name: pollutant.toUpperCase(), unit: 'μg/m³' };
            
            // Determine status based on value (simplified)
            let status = 'Good';
            if (value > 50) status = 'Moderate';
            if (value > 100) status = 'Unhealthy';
            
            tableHTML += `
                <tr>
                    <td>${pollutantInfo.name}</td>
                    <td>${value.toFixed(2)} ${pollutantInfo.unit}</td>
                    <td>${status}</td>
                </tr>
            `;
        }
        
        tableBody.innerHTML = tableHTML || '<tr><td colspan="3" class="no-data">No air quality data available</td></tr>';
    }
}

// ===== GOOGLE MAPS INTEGRATION =====
// Initialize Google Map (empty map on load)
function initializeGoogleMap() {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    
    const mapContainer = document.getElementById('mapContainer');
    
    if (!mapContainer) {
        console.error("Map container not found");
        return;
    }
    
    // Default center (world view)
    const defaultCenter = { lat: 20.0, lng: 0.0 };
    
    try {
        // Initialize map
        map = new google.maps.Map(mapContainer, {
            center: defaultCenter,
            zoom: 2,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true
        });
        
        console.log("✅ Google Map initialized successfully");
    } catch (error) {
        console.error("Error initializing Google Map:", error);
    }
}

// Update map with city location
function updateGoogleMap(lat, lon, cityName) {
    // Check if Google Maps API is loaded
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API not loaded");
        return;
    }
    
    // If map not initialized, initialize it now
    if (!map) {
        initializeGoogleMap();
    }
    
    if (!map) {
        console.error("Map not initialized");
        return;
    }
    
    const location = { lat: lat, lng: lon };
    
    try {
        // Center map on city
        map.setCenter(location);
        map.setZoom(12);
        
        // Remove existing marker if any
        if (marker) {
            marker.setMap(null);
        }
        
        // Add new marker
        marker = new google.maps.Marker({
            position: location,
            map: map,
            title: cityName,
            animation: google.maps.Animation.DROP
        });
        
        // Add info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="padding: 10px;">
                    <h3 style="margin: 0 0 5px 0; color: #667eea;">${cityName}</h3>
                    <p style="margin: 0; color: #666;">Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}</p>
                </div>
            `
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        console.log(`✅ Map updated for ${cityName} at ${lat}, ${lon}`);
    } catch (error) {
        console.error("Error updating map:", error);
    }
}

// Initialize Google Places Autocomplete for search input
function initializeAutocomplete() {
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn("Google Places API not available");
        return;
    }
    
    const searchInput = document.getElementById('citySearch');
    if (!searchInput) {
        console.error("Search input not found");
        return;
    }
    
    try {
        // Create autocomplete object
        autocomplete = new google.maps.places.Autocomplete(searchInput, {
            types: ['(cities)'], // Restrict to cities only
            fields: ['name', 'geometry', 'formatted_address']
        });
        
        // When user selects a place from autocomplete
        autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                console.warn("No geometry found for place");
                return;
            }
            
            // Extract city name
            const cityName = place.name || place.formatted_address.split(',')[0];
            
            // Update search input
            searchInput.value = cityName;
            
            // Get coordinates
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            console.log(`📍 Place selected: ${cityName} at ${lat}, ${lng}`);
            
            // Update map immediately with Google coordinates
            updateGoogleMap(lat, lng, cityName);
            
            // Fetch weather and air quality using city name
            currentCity = cityName;
            document.getElementById('selectedCity').textContent = cityName;
            fetchWeatherData(cityName);
            fetchAirQualityData(cityName);
        });
        
        console.log("✅ Google Places Autocomplete initialized");
    } catch (error) {
        console.error("Error initializing autocomplete:", error);
    }
}

// Geocode city name to get coordinates (backup method)
async function geocodeCity(cityName) {
    if (!googleMapsReady) {
        return;
    }
    
    try {
        const geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({ address: cityName }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                
                console.log(`✅ Geocoded ${cityName}: ${lat}, ${lng}`);
                
                // Update map if not already updated
                if (map && (!marker || marker.getPosition().lat() !== lat)) {
                    updateGoogleMap(lat, lng, cityName);
                }
                
                // Update location details
                document.getElementById('coordinates').textContent = `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
                
                // Fetch city details
                fetchCityPopulation(cityName, lat, lng);
            } else {
                console.warn(`Geocoding failed for ${cityName}: ${status}`);
            }
        });
    } catch (error) {
        console.error("Error geocoding city:", error);
    }
}

// Fetch city population using Google Places API
async function fetchCityPopulation(cityName, lat, lon) {
    try {
        // Using Google Geocoding API to get place details
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEYS.googleMaps}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results.length > 0) {
            // Get formatted address
            const result = data.results[0];
            const formattedAddress = result.formatted_address;
            
            // Update population field with formatted address
            document.getElementById('population').textContent = formattedAddress || cityName;
        } else {
            document.getElementById('population').textContent = cityName;
        }
    } catch (error) {
        console.error("Error fetching city details:", error);
        document.getElementById('population').textContent = cityName;
    }
}

// Fetch moon phase using USNO API
async function fetchMoonPhase(lat, lon) {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        
        // USNO API for moon phase data
        const moonPhaseUrl = `https://api.usno.navy.mil/rstt/oneday?date=${year}-${month}-${day}&coords=${lat},${lon}`;
        
        const response = await fetch(moonPhaseUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.properties && data.properties.data && data.properties.data.moonphase) {
            document.getElementById('moonPhase').textContent = data.properties.data.moonphase;
        } else {
            document.getElementById('moonPhase').textContent = "Data unavailable";
        }
        
    } catch (error) {
        console.error("Error fetching moon phase:", error);
        document.getElementById('moonPhase').textContent = "Data unavailable";
    }
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

// Allow search on Enter key press (set up when DOM is ready)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupEventListeners);
} else {
    setupEventListeners();
}

function setupEventListeners() {
    const searchInput = document.getElementById('citySearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                searchCity();
            }
        });
    }
}

// ===== API DOCUMENTATION & MENTOR Q&A =====
/*
API INTEGRATION COMPLETE:

1. OPENWEATHERMAP API - Provides:
   - Current weather data (temperature, humidity, wind, etc.)
   - Air quality index (AQI) with pollutant breakdown
   - Sunrise/sunset times
   - API Docs: https://openweathermap.org/api

2. GOOGLE MAPS API - Provides:
   - Interactive maps
   - Geocoding services
   - Places API
   - API Docs: https://developers.google.com/maps

COMMON MENTOR QUESTIONS & ANSWERS:

Q: How does the fetch API work?
A: Fetch is a JavaScript function for making HTTP requests to APIs. It returns 
   a Promise that resolves to the response. We use async/await to handle the 
   asynchronous nature of network requests.

Q: What is JSON?
A: JSON (JavaScript Object Notation) is a lightweight data format that APIs 
   use to send data. We parse it using response.json() and access the data 
   like regular JavaScript objects.

Q: How do you update HTML dynamically?
A: We use document.getElementById() to select HTML elements by their ID, 
   then update their textContent or innerHTML properties with new data.

Q: What are template literals?
A: Template literals use backticks (``) instead of quotes and allow us to 
   embed variables directly in strings using ${variable} syntax, making 
   string concatenation easier.

Q: Why use async/await?
A: Async/await makes asynchronous code look synchronous and easier to read. 
   The 'await' keyword pauses execution until the Promise resolves, avoiding 
   callback hell and making error handling simpler with try-catch blocks.

Q: What's the difference between let, const, and var?
A: 'let' is block-scoped and can be reassigned. 'const' is block-scoped but 
   cannot be reassigned (though object properties can change). 'var' is 
   function-scoped and has hoisting issues - we avoid it in modern code.

Q: How does the API key work?
A: The API key is a unique identifier that authenticates our application with 
   the API service. It's included in the URL as a query parameter, allowing 
   the API server to track usage and apply rate limits.

Q: What happens if the API request fails?
A: We wrap API calls in try-catch blocks. If the network fails, the catch 
   block handles the error. We also check the response status code (cod === 200) 
   to ensure the API returned valid data before processing it.
*/

console.log("✅ Smart City Dashboard Loaded Successfully!");
console.log("🌍 APIs Connected: OpenWeatherMap + Google Maps");
console.log("🔍 Search for any city to see real-time data!");

