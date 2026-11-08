import { BaseView } from "./base.js";
import { UI } from "../ui.js";

export class SunTimesView extends BaseView {
  constructor(app) {
    super(app, "Sun Times", "Check sunrise and sunset times worldwide");
  }

  async render(page) {
    const sel = this.selection;
    const banner = UI.banner({
      gradient: "from-red-600 to-orange-500",
      icon: "fa-sun",
      title: "Sunrise & Sunset Times",
      text: "Plan your activities around golden hour - perfect for photographers and early risers",
    });

    if (!sel) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-sun",
          title: "No City Selected",
          text: "Select a country and city from the dashboard to see sunrise and sunset times",
        });
      return;
    }

    page.innerHTML = banner + UI.loading("Loading sun times...");

    const today = new Date().toISOString().slice(0, 10);
    const data = await this.app.api.getSunTimes(sel.lat, sel.lng, today);
    if (data.status !== "OK") throw new Error("Sun API error");
    const r = data.results;

    // Show UTC time in the city timezone
    const fmt = (date) =>
      new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: sel.timezone,
      });

    const hours = Math.floor(r.day_length / 3600);
    const minutes = Math.floor((r.day_length % 3600) / 60);

    // Golden hour = about 1 hour after sunrise and 1 hour before sunset
    const hour = 3600000;
    const sunrise = new Date(r.sunrise).getTime();
    const sunset = new Date(r.sunset).getTime();

    const card = (icon, color, label, value) => `
      <div class="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-xl ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <p class="text-sm text-slate-500">${label}</p>
          <p class="text-2xl font-bold">${value}</p>
        </div>
      </div>`;

    page.innerHTML = `
      ${banner}
      <p class="font-semibold mb-4"><i class="fa-solid fa-location-dot text-orange-500 mr-2"></i>${sel.city}, ${sel.countryName} • ${UI.formatDate(today)}</p>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${card("fa-sun", "bg-amber-100 text-amber-600", "Sunrise", fmt(r.sunrise))}
        ${card("fa-moon", "bg-indigo-100 text-indigo-600", "Sunset", fmt(r.sunset))}
        ${card("fa-circle-half-stroke", "bg-sky-100 text-sky-600", "Solar Noon", fmt(r.solar_noon))}
        ${card("fa-hourglass-half", "bg-emerald-100 text-emerald-600", "Day Length", `${hours}h ${minutes}m`)}
        ${card("fa-camera", "bg-orange-100 text-orange-600", "Morning Golden Hour", `${fmt(sunrise)} - ${fmt(sunrise + hour)}`)}
        ${card("fa-camera-retro", "bg-rose-100 text-rose-600", "Evening Golden Hour", `${fmt(sunset - hour)} - ${fmt(sunset)}`)}
      </div>`;
  }
}
