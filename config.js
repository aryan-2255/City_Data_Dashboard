// ===== API CONFIGURATION TEMPLATE =====
// Copy this file to config.js and add your actual API keys
// config.js is ignored by git for security

const API_CONFIG = {
    // PRIMARY: Google APIs
    googleMaps: {
        key: "AIzaSyC_-Fnc-DHYiAf5nWP90frrHP32QA7L3so",
        libraries: ["places"],
        baseUrl: "https://maps.googleapis.com/maps/api"
    },
    googleAirQuality: {
        key: "AIzaSyC_-Fnc-DHYiAf5nWP90frrHP32QA7L3so",
        baseUrl: "https://airquality.googleapis.com/v1"
    },
    gemini: {
        key: "AIzaSyDv0soPsOenopzpgbiYQYquhBpimY65hlQ",
        baseUrl: "https://generativelanguage.googleapis.com/v1",
        model: "gemini-1.5-flash" // Try gemini-1.5-flash (fastest) or gemini-2.0-flash-exp
    },
    // FALLBACK: OpenWeatherMap (for weather data)
    openWeather: {
        key: "63eeefb285cd94e898abfd05116834aa",
        baseUrl: "https://api.openweathermap.org/data/2.5",
        endpoints: {
            weather: "/weather",
            airPollution: "/air_pollution"
        }
    }
};

// Backward compatibility
const API_KEYS = {
    openWeather: API_CONFIG.openWeather.key,
    googleMaps: API_CONFIG.googleMaps.key
};

