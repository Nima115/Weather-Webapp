'use client';

import { useState, useEffect } from "react";
import axios from "axios";

export default function WeatherApp() {
  // Progress state och indikator för fakta
  const facts = [
    "Sverige har över 100 000 sjöar.",
    "Australien har flest giftiga djurarter i världen.",
    "Japan har över 6 800 öar.",
    "Brasilien har världens största regnskog, Amazonas.",
    "Kanada har flest sjöar av alla länder.",
    "Egypten har världens längsta flod, Nilen.",
    "Finland har flest bastur per person.",
    "Indien har världens största demokrati.",
    "Kina har världens största befolkning.",
    "Norge har världens längsta fjord, Sognefjorden."
  ];
  const [factIndex, setFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // Rulla vidare till nästa fakta var 5:e sekund
  useEffect(() => {
    const timer = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [factIndex]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch city suggestions as user types
  const handleCityChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCity(value);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(value)}&count=10`);
      if (res.data.results) {
        // Filter out duplicates based on name and country
        const unique = [];
        const seen = new Set();
        const inputLower = value.toLowerCase();
        for (const s of res.data.results) {
          const key = s.name + '_' + s.country;
          // Only show cities whose name starts with the input
          if (!seen.has(key) && s.name.toLowerCase().startsWith(inputLower)) {
            unique.push(s);
            seen.add(key);
          }
        }
        setSuggestions(unique);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // When user clicks a suggestion
  const handleSuggestionClick = (name: string) => {
    setCity(name);
    setSuggestions([]);
    setShowSuggestions(false);
  };
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
      <h1 className="text-3xl font-bold mb-2">Weather Dashboard</h1>
      <div className="mb-6 text-center text-gray-700 text-sm animate-fade">
        <span className="font-semibold">Visste du:</span> {facts[factIndex]}
        <div className="w-full h-2 bg-gray-200 rounded mt-2">
          <div
            className="h-2 bg-blue-400 rounded"
            style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
          ></div>
        </div>
      </div>
      <div className="flex w-full max-w-md gap-2 relative">
        <input
          type="text"
          placeholder="Ange stad"
          value={city}
          onChange={handleCityChange}
          className="flex-grow p-2 rounded-lg border border-gray-300"
          autoComplete="off"
        />
        <button
          onClick={fetchWeather}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Sök
        </button>
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.id}
                className="p-2 cursor-pointer hover:bg-blue-100"
                onClick={() => handleSuggestionClick(s.name)}
              >
                {s.name}, {s.country}
              </li>
            ))}
          </ul>
        )}
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
