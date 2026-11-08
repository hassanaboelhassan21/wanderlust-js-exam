import { BaseView } from "./base.js";
import { UI } from "../ui.js";
import { getWeatherInfo } from "../config.js";

export class WeatherView extends BaseView {
  constructor(app) {
    super(app, "Weather", "Check forecasts for any destination");
  }

  async render(page) {
    const sel = this.selection;
    const banner = UI.banner({
      gradient: "from-sky-500 to-sky-600",
      icon: "fa-cloud-sun",
      title: "Weather Forecast",
      text: "Check 7-day weather forecasts for cities around the world",
    });

    if (!sel) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-circle-exclamation",
          title: "No City Selected",
          text: "Select a country and city from the dashboard to see the weather forecast",
        });
      return;
    }

    page.innerHTML = banner + UI.loading("Loading forecast...");

    const data = await this.app.api.getWeather(sel.lat, sel.lng);
    const cur = data.current;
    const info = getWeatherInfo(cur.weather_code);

    const metric = (icon, label, value) => `
      <div class="bg-white/15 rounded-2xl p-4 text-center">
        <i class="fa-solid ${icon} text-xl mb-2"></i>
        <p class="text-sm text-white/80">${label}</p>
        <p class="font-bold text-lg">${value}</p>
      </div>`;

    const currentCard = `
      <div class="bg-gradient-to-br from-sky-500 to-indigo-600 text-white rounded-3xl p-8 mb-6">
        <div class="flex flex-wrap items-center justify-between gap-6 mb-6">
          <div>
            <p class="text-white/80"><i class="fa-solid fa-location-dot mr-2"></i>${sel.city}, ${sel.countryName}</p>
            <p class="text-6xl font-bold mt-2">${Math.round(cur.temperature_2m)}°C</p>
            <p class="text-xl mt-1">${info.text}</p>
          </div>
          <i class="fa-solid ${info.icon} text-8xl text-white/90"></i>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          ${metric("fa-temperature-half", "Feels like", Math.round(cur.apparent_temperature) + "°C")}
          ${metric("fa-droplet", "Humidity", cur.relative_humidity_2m + "%")}
          ${metric("fa-wind", "Wind", cur.wind_speed_10m + " km/h")}
        </div>
      </div>`;

    const d = data.daily;
    const days = d.time
      .map((t, i) => {
        const dayInfo = getWeatherInfo(d.weather_code[i]);
        const label = new Date(t + "T00:00:00").toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        return `
        <div class="bg-white rounded-2xl p-5 shadow-sm text-center">
          <p class="font-semibold">${i === 0 ? "Today" : label}</p>
          <i class="fa-solid ${dayInfo.icon} text-4xl text-sky-500 my-4"></i>
          <p class="text-sm text-slate-500 mb-3">${dayInfo.text}</p>
          <p class="font-bold">${Math.round(d.temperature_2m_max[i])}° <span class="text-slate-400 font-normal">/ ${Math.round(d.temperature_2m_min[i])}°</span></p>
          <p class="text-xs text-slate-500 mt-3"><i class="fa-solid fa-umbrella mr-1"></i>${d.precipitation_probability_max[i] ?? 0}% rain</p>
          <p class="text-xs text-slate-500 mt-1"><i class="fa-solid fa-wind mr-1"></i>${d.wind_speed_10m_max[i]} km/h</p>
        </div>`;
      })
      .join("");

    page.innerHTML = `
      ${banner}
      ${currentCard}
      <h3 class="text-lg font-bold mb-4">7-Day Forecast</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">${days}</div>`;
  }
}
