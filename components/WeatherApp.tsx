'use client';

import { useState } from "react";
import axios from "axios";

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!city) return;
    setLoading(true);
    setError("");
    try {
      // Get latitude and longitude for the city using Open-Meteo geocoding
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      if (!geoRes.data.results || geoRes.data.results.length === 0) {
        setError("City not found");
        setWeather(null);
        setLoading(false);
        return;
      }
      const { latitude, longitude, name, country } = geoRes.data.results[0];
      // Get current weather for the coordinates
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      setWeather({
        city: name,
        country,
        ...weatherRes.data.current_weather
      });
    } catch (err) {
      setError("City not found or API error");
      setWeather(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6">Weather Dashboard</h1>
      <div className="flex w-full max-w-md gap-2">
        <input
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-grow p-2 rounded-lg border border-gray-300"
        />
        <button
          onClick={fetchWeather}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {weather && (
        <div className="mt-6 p-6 bg-white rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-semibold">{weather.city}, {weather.country}</h2>
          <p className="text-4xl font-bold">{weather.temperature}°C</p>
          <div className="flex justify-around mt-4 text-sm">
            <p>💨 {weather.windspeed} m/s</p>
            <p>🧭 {weather.winddirection}°</p>
            <p>🌦️ Code: {weather.weathercode}</p>
          </div>
        </div>
      )}
    </div>
  );
}
