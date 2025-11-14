// ===== API CONFIGURATION TEMPLATE =====
// Copy this file to config.js and add your actual API keys
// config.js is ignored by git for security

const API_CONFIG = {
    openWeather: {
        key: "YOUR_OPENWEATHER_API_KEY_HERE",
        baseUrl: "https://api.openweathermap.org/data/2.5",
        endpoints: {
            weather: "/weather",
            airPollution: "/air_pollution"
        }
    },
    googleMaps: {
        key: "YOUR_GOOGLE_MAPS_API_KEY_HERE",
        libraries: ["places"],
        baseUrl: "https://maps.googleapis.com/maps/api"
    },
    climatiq: {
        key: "YOUR_CLIMATIQ_API_KEY_HERE",
        baseUrl: "https://api.climatiq.io",
        endpoints: {
            energy: "/energy/v1.2/electricity"
        }
    }
};

// Backward compatibility
const API_KEYS = {
    openWeather: API_CONFIG.openWeather.key,
    googleMaps: API_CONFIG.googleMaps.key
};

