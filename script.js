// ================================
// Smart City Dashboard - script.js (with charts)
// Uses: WeatherAPI (forecast.json) & API-Ninjas (airquality)
// ================================
const API_KEYS = {
  weather: "be440ab1b3fa48619f4175507251411",
  airQuality: "j/L1uQjsdYt/ZmYEYXqKOw==lubbuGMHJ2DbZ3FF"
};

let currentCity = "Delhi";
let map, mapMarker;

// Chart instances
let tempChart = null;
let humidityChart = null;
let chartMode = "hourly"; // 'hourly' or 'weekly'

// DOM ready
window.addEventListener("DOMContentLoaded", () => {
  updateClock();
  setInterval(updateClock, 1000);
  initMap();
  setupSearch();
  document.getElementById("selectedCity").textContent = currentCity;
  document.getElementById("toggleChartBtn").addEventListener("click", toggleChartMode);
  fetchAllData(currentCity);
});

// clock and UI helpers
function updateClock() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  document.getElementById("currentTime").textContent = `${date} - ${time}`;
}

function showSection(section, el) {
  document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
  const target = document.getElementById(section);
  if (target) target.classList.add("active");
  document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
  if (el) el.classList.add("active");
}

function setupSearch() {
  const input = document.getElementById("citySearch");
  const btn = document.getElementById("searchBtn");
  btn.addEventListener("click", searchCity);
  input.addEventListener("keypress", e => { if (e.key === "Enter") searchCity(); });
}

function searchCity() {
  const city = document.getElementById("citySearch").value.trim();
  if (!city) return alert("Enter a city name!");
  currentCity = city;
  document.getElementById("selectedCity").textContent = city;
  fetchAllData(city);
}

// fetch orchestrator
async function fetchAllData(city) {
  try {
    // Weather: use forecast.json for hourly (days=1) and weekly (days=7)
    const [weatherDay, weatherWeek] = await Promise.all([
      fetchWeatherForecast(city, 1),
      fetchWeatherForecast(city, 7)
    ]);

    if (weatherDay) updateWeatherUI(weatherDay.current ? weatherDay : weatherDay);
    if (weatherWeek) updateAstronomyUI(weatherWeek.astronomy ? weatherWeek : weatherWeek);

    // AQI
    const aqi = await fetchAQI(city);
    if (aqi) updateAQIUI(aqi);

    // charts
    if (weatherDay) {
      const hourly = parseHourlyFromForecast(weatherDay);
      drawHourlyCharts(hourly);
    }
    if (weatherWeek) {
      const weekly = parseWeeklyFromForecast(weatherWeek);
      drawWeeklyCharts(weekly);
    }

    if (aqi) {
      const parsed = parseAQIData(aqi);
      drawAQIChart(parsed.labels, parsed.values);
    }

    document.getElementById("jsonData").textContent = JSON.stringify({ weatherDay: weatherDay, weatherWeek: weatherWeek, aqi }, null, 2);

    // Set toggle button label
    setToggleLabel();

  } catch (err) {
    console.error(err);
    alert("Failed to load data. See console.");
  }
}

// WeatherAPI forecast call
async function fetchWeatherForecast(city, days = 1) {
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEYS.weather}&q=${encodeURIComponent(city)}&days=${days}&aqi=no&alerts=no`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text().catch(()=>res.statusText);
      console.error("WeatherAPI error", res.status, txt);
      alert("Weather API error. Check console.");
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("fetchWeatherForecast", err);
    return null;
  }
}

// API-Ninjas AQI
async function fetchAQI(city) {
  try {
    const url = `https://api.api-ninjas.com/v1/airquality?city=${encodeURIComponent(city)}`;
    const res = await fetch(url, { headers: { "X-Api-Key": API_KEYS.airQuality } });
    if (!res.ok) {
      const txt = await res.text().catch(()=>res.statusText);
      console.error("AQI API error", res.status, txt);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("fetchAQI", err);
    return null;
  }
}

// parse hourly from forecast.json (days=1)
function parseHourlyFromForecast(forecastData) {
  // forecastData.forecast.forecastday[0].hour
  try {
    const hours = (forecastData.forecast && forecastData.forecast.forecastday && forecastData.forecast.forecastday[0].hour) || [];
    const labels = hours.map(h => {
      // show time in HH:MM or locale hour
      const t = h.time.split(" ")[1];
      return t;
    });
    const temps = hours.map(h => h.temp_c);
    const hums = hours.map(h => h.humidity);
    return { labels, temps, hums };
  } catch (err) {
    console.error("parseHourlyFromForecast", err);
    return { labels: [], temps: [], hums: [] };
  }
}

// parse weekly from forecast.json (days=7)
function parseWeeklyFromForecast(forecastData) {
  try {
    const days = (forecastData.forecast && forecastData.forecast.forecastday) || [];
    const labels = days.map(d => d.date);
    const maxTemps = days.map(d => d.day.maxtemp_c);
    const minTemps = days.map(d => d.day.mintemp_c);
    const avgHums = days.map(d => d.day.avghumidity || d.day.avghumidity === 0 ? d.day.avghumidity : ((d.hour && d.hour.reduce((s,h)=>s+h.humidity,0)/d.hour.length) || null));
    return { labels, maxTemps, minTemps, avgHums };
  } catch (err) {
    console.error("parseWeeklyFromForecast", err);
    return { labels: [], maxTemps: [], minTemps: [], avgHums: [] };
  }
}

// ----------------- Charts drawing -----------------

// Toggle mode (hourly / weekly)
function toggleChartMode() {
  chartMode = chartMode === "hourly" ? "weekly" : "hourly";
  setToggleLabel();
  // refetch appropriate data from existing JSON in DOM if available
  // easiest: call fetchAllData to refresh charts (but we can reuse last fetched in memory if needed)
  fetchAllData(currentCity);
}

function setToggleLabel() {
  const btn = document.getElementById("toggleChartBtn");
  btn.textContent = chartMode === "hourly" ? "Show: Hourly" : "Show: Weekly";
}

// Draw hourly charts (Chart.js)
function drawHourlyCharts(hourly) {
  if (chartMode !== "hourly") {
    // If mode is weekly, don't draw hourly charts as main view — but we still keep data available.
    drawTempChartWeeklyPlaceholder(); // ensure placeholder until weekly arrives
    return;
  }
  // temperature line
  drawTempChart(hourly.labels, hourly.temps, "Hourly Temperature (°C)");
  // humidity line
  drawHumidityChart(hourly.labels, hourly.hums, "Hourly Humidity (%)");
}

// Draw weekly charts
function drawWeeklyCharts(weekly) {
  if (chartMode !== "weekly") {
    // if mode is hourly, keep weekly data ready but do not overwrite
    return;
  }
  // temp: show max and min lines
  drawTempChart(weekly.labels, weekly.maxTemps, "Weekly Max Temperature (°C)", weekly.minTemps);
  // humidity: use avg humidity for week
  drawHumidityChart(weekly.labels, weekly.avgHums, "Weekly Avg Humidity (%)");
}

// generic temp chart: if secondary dataset (minTemps) provided, plot both
function drawTempChart(labels, dataPrimary, labelPrimary, dataSecondary = null) {
  const container = document.getElementById("tempChart");
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (tempChart) tempChart.destroy();

  const datasets = [{
    label: labelPrimary,
    data: dataPrimary,
    fill: false,
    tension: 0.2,
    borderWidth: 2
  }];

  if (dataSecondary) {
    datasets.push({
      label: "Min Temperature (°C)",
      data: dataSecondary,
      fill: false,
      tension: 0.2,
      borderWidth: 2
    });
  }

  tempChart = new Chart(ctx, {
    type: "line",
    data: { labels: labels, datasets },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

// humidity chart
function drawHumidityChart(labels, data, label = "Humidity (%)") {
  const container = document.getElementById("humidityChart");
  container.innerHTML = "";
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (humidityChart) humidityChart.destroy();

  humidityChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        fill: true,
        tension: 0.2,
        borderWidth: 1,
        backgroundColor: 'rgba(102,126,234,0.12)'
      }]
    },
    options: {
      responsive: true,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// placeholder helper when charts aren't ready
function drawTempChartWeeklyPlaceholder() {
  const container = document.getElementById("tempChart");
  container.innerHTML = `<div style="padding:1rem;color:#777">Weekly data will appear when you switch to Weekly mode.</div>`;
}

// AQI parse & Plotly draw
function parseAQIData(aqi) {
  // api-ninjas returns pollutant keys as objects with concentration
  const pollutantKeys = ["CO", "NO2", "O3", "SO2", "PM2.5", "PM10", "PM1"];
  const labels = [];
  const values = [];

  // sometimes keys are lowercased; normalize
  for (const k of Object.keys(aqi)) {
    const normalized = k.toUpperCase();
    // Accept keys like PM2.5 or pm25
    const valueObj = aqi[k];
    if (valueObj && typeof valueObj === "object" && valueObj.concentration !== undefined) {
      labels.push(normalized);
      values.push(valueObj.concentration);
    } else if (typeof valueObj === "number" && isFinite(valueObj)) {
      labels.push(normalized);
      values.push(valueObj);
    }
  }

  return { labels, values };
}

function drawAQIChart(labels, values) {
  const container = document.getElementById("aqiChart");
  container.innerHTML = "";
  const trace = {
    x: labels,
    y: values,
    type: "bar",
    marker: { color: 'rgba(102,126,234,0.7)' }
  };
  const layout = {
    margin: { t: 30, b: 50 },
    yaxis: { title: 'Concentration' },
    xaxis: { title: 'Pollutant' }
  };
  Plotly.newPlot(container, [trace], layout, { responsive: true });
}

// ----------------- UI updates for weather/aqi/map -----------------

function updateWeatherUI(data) {
  // data is forecast.json; it includes .location and .current
  const loc = data.location || {};
  const cur = data.current || {};

  document.getElementById("temperature").textContent = cur.temp_c !== undefined ? Math.round(cur.temp_c) : "--";
  document.getElementById("feelsLike").textContent = cur.feelslike_c !== undefined ? Math.round(cur.feelslike_c) : "--";
  document.getElementById("weatherDesc").textContent = cur.condition ? cur.condition.text : "--";
  document.getElementById("windSpeed").textContent = cur.wind_kph !== undefined ? `${cur.wind_kph} km/h` : "--";
  document.getElementById("humidity").textContent = cur.humidity !== undefined ? `${cur.humidity}%` : "--";
  document.getElementById("visibility").textContent = cur.vis_km !== undefined ? `${cur.vis_km} km` : "--";
  document.getElementById("pressure").textContent = cur.pressure_mb !== undefined ? `${cur.pressure_mb} hPa` : "--";
  document.getElementById("lastUpdate").textContent = cur.last_updated || "--";

  document.getElementById("mapCity").textContent = loc.name || currentCity;
  document.getElementById("coordinates").textContent = (loc.lat !== undefined && loc.lon !== undefined) ? `${loc.lat}, ${loc.lon}` : "--, --";
  document.getElementById("timezone").textContent = loc.tz_id || "--";

  if (loc.lat !== undefined && loc.lon !== undefined) updateMap(loc.lat, loc.lon, loc.name || currentCity);

  // Update weather table with current values
  const tbody = document.getElementById("weatherDataTable");
  tbody.innerHTML = `
    <tr><td>Temperature</td><td>${cur.temp_c ?? "--"}</td><td>°C</td></tr>
    <tr><td>Feels Like</td><td>${cur.feelslike_c ?? "--"}</td><td>°C</td></tr>
    <tr><td>Humidity</td><td>${cur.humidity ?? "--"}</td><td>%</td></tr>
    <tr><td>Pressure</td><td>${cur.pressure_mb ?? "--"}</td><td>hPa</td></tr>
    <tr><td>Wind Speed</td><td>${cur.wind_kph ?? "--"}</td><td>km/h</td></tr>
    <tr><td>Visibility</td><td>${cur.vis_km ?? "--"}</td><td>km</td></tr>
  `;
}

function updateAstronomyUI(forecastData) {
  // forecastData.forecast.forecastday[0].astro exists when days>=1
  try {
    const astro = (forecastData.forecast && forecastData.forecast.forecastday && forecastData.forecast.forecastday[0].astro) || {};
    document.getElementById("sunrise").textContent = astro.sunrise || "--";
    document.getElementById("sunset").textContent = astro.sunset || "--";
    document.getElementById("moonPhase").textContent = astro.moon_phase || "--";
  } catch (err) {
    console.warn("updateAstronomyUI", err);
  }
}

function updateAQIUI(aqi) {
  const aqiValueEl = document.getElementById("aqiValue");
  const aqiStatusEl = document.getElementById("aqiStatus");
  const table = document.getElementById("aqiDataTable");

  // API-ninjas may return overall_aqi or flat pollutant keys
  let overall = aqi.overall_aqi ?? aqi.overall ?? null;
  if (overall == null && aqi.aqi) overall = aqi.aqi;

  aqiValueEl.classList.remove("aqi-good","aqi-moderate","aqi-unhealthy");
  const displayVal = overall ?? "--";
  aqiValueEl.textContent = displayVal;

  if (displayVal === "--") aqiStatusEl.textContent = "No Data";
  else if (displayVal <= 50) { aqiStatusEl.textContent = "Good"; aqiValueEl.classList.add("aqi-good"); }
  else if (displayVal <= 100) { aqiStatusEl.textContent = "Moderate"; aqiValueEl.classList.add("aqi-moderate"); }
  else { aqiStatusEl.textContent = "Unhealthy"; aqiValueEl.classList.add("aqi-unhealthy"); }

  // populate pollutant table
  let rows = "";
  for (const key in aqi) {
    const value = aqi[key];
    if (value && typeof value === "object" && value.concentration !== undefined) {
      rows += `<tr><td>${key.toUpperCase()}</td><td>${value.concentration}</td><td>${determineAQIStatus(value.concentration)}</td></tr>`;
    } else if ((key.toLowerCase().includes("pm") || ["co","no2","o3","so2"].includes(key.toLowerCase())) && typeof value === "number") {
      rows += `<tr><td>${key.toUpperCase()}</td><td>${value}</td><td>${determineAQIStatus(value)}</td></tr>`;
    }
  }
  table.innerHTML = rows || `<tr><td colspan='3' class='no-data'>Not Available</td></tr>`;
}

function determineAQIStatus(val) {
  if (val === null || val === undefined || isNaN(Number(val))) return "Unknown";
  if (val <= 50) return "Good";
  if (val <= 100) return "Moderate";
  return "Unhealthy";
}

// ----------------- Map -----------------
function initMap() {
  try {
    map = L.map("mapContainer").setView([28.6139, 77.2090], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap"
    }).addTo(map);
  } catch (err) {
    console.warn("Leaflet init failed", err);
  }
}

function updateMap(lat, lon, label) {
  if (!map) return;
  if (mapMarker) map.removeLayer(mapMarker);
  map.setView([lat, lon], 11);
  mapMarker = L.marker([lat, lon]).addTo(map).bindPopup(label).openPopup();
}
