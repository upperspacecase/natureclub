const WMO_DESCRIPTIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm + hail",
    99: "Severe thunderstorm",
};

const WMO_ICONS = {
    0: "sun",
    1: "sun",
    2: "cloud-sun",
    3: "cloud",
    45: "cloud",
    48: "cloud",
    51: "cloud-rain",
    53: "cloud-rain",
    55: "cloud-rain",
    61: "cloud-rain",
    63: "cloud-rain",
    65: "cloud-rain",
    71: "cloud-snow",
    73: "cloud-snow",
    75: "cloud-snow",
    77: "cloud-snow",
    80: "cloud-rain",
    81: "cloud-rain",
    82: "cloud-rain",
    85: "cloud-snow",
    86: "cloud-snow",
    95: "cloud-bolt",
    96: "cloud-bolt",
    99: "cloud-bolt",
};

// Forecasts move slowly and pages that show them are force-dynamic (which
// disables Next's fetch cache), so keep an in-process cache of the raw
// Open-Meteo payload. Rounding the coordinates lets every event at the same
// park share one entry.
const FORECAST_TTL_MS = 30 * 60 * 1000;
const FORECAST_TIMEOUT_MS = 2500;
const forecastCache = new Map();

async function fetchForecast(lat, lng) {
    const key = `${Number(lat).toFixed(2)},${Number(lng).toFixed(2)}`;
    const hit = forecastCache.get(key);
    if (hit && Date.now() - hit.at < FORECAST_TTL_MS) return hit.data;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto`;

    // A slow forecast should cost us nothing -- the page renders without it.
    const res = await fetch(url, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(FORECAST_TIMEOUT_MS),
    });
    if (!res.ok) return null;

    const data = await res.json();
    forecastCache.set(key, { at: Date.now(), data });
    if (forecastCache.size > 200) {
        forecastCache.delete(forecastCache.keys().next().value);
    }
    return data;
}

/**
 * Fetch weather forecast for a specific date and location.
 * Uses Open-Meteo (free, no API key).
 * Returns null if the date is too far out (>16 days) or on error.
 */
export async function getWeatherForDate(lat, lng, dateStr) {
    try {
        const eventDate = new Date(dateStr);
        const now = new Date();
        const daysOut = Math.ceil((eventDate - now) / (1000 * 60 * 60 * 24));

        // Open-Meteo only forecasts 16 days ahead
        if (daysOut > 16 || daysOut < 0) return null;

        const data = await fetchForecast(lat, lng);
        if (!data) return null;
        const targetDate = dateStr.slice(0, 10); // YYYY-MM-DD
        const idx = data.daily?.time?.indexOf(targetDate);
        if (idx === -1 || idx === undefined) return null;

        const code = data.daily.weather_code[idx];

        return {
            tempHigh: Math.round(data.daily.temperature_2m_max[idx]),
            tempLow: Math.round(data.daily.temperature_2m_min[idx]),
            weatherCode: code,
            description: WMO_DESCRIPTIONS[code] || "Unknown",
            icon: WMO_ICONS[code] || "cloud",
            precipChance: data.daily.precipitation_probability_max[idx] || 0,
        };
    } catch {
        return null;
    }
}
