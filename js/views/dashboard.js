import { BaseView } from "./base.js";
import { UI } from "../ui.js";

export class DashboardView extends BaseView {
  constructor(app) {
    super(app, "Dashboard", "Welcome back! Ready to plan your next adventure?");
  }

  statCard(icon, color, id, value, label) {
    return `
      <div class="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-sm">
        <div class="w-14 h-14 rounded-xl flex items-center justify-center text-xl ${color}">
          <i class="fa-solid ${icon}"></i>
        </div>
        <div>
          <p id="${id}" class="text-3xl font-bold">${value}</p>
          <p class="text-slate-500 text-sm">${label}</p>
        </div>
      </div>`;
  }

  infoHTML(sel) {
    const c = sel.country;
    const item = (label, value) => `
      <div class="bg-slate-50 rounded-xl p-4">
        <p class="text-xs uppercase text-slate-400 font-semibold">${label}</p>
        <p class="font-semibold mt-1">${value}</p>
      </div>`;

    return `
      <div class="flex items-center gap-5 mb-6">
        <img src="${c.flag}" alt="Flag" class="w-24 rounded-lg shadow" />
        <div>
          <h4 class="text-2xl font-bold">${c.name}</h4>
          <p class="text-slate-500">${c.official}</p>
          <p class="text-sm text-slate-500 mt-1"><i class="fa-solid fa-location-dot mr-1"></i>${sel.city}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        ${item("Capital", c.capital)}
        ${item("Population", c.population.toLocaleString())}
        ${item("Area", c.area.toLocaleString() + " km²")}
        ${item("Region", c.region + (c.subregion ? " / " + c.subregion : ""))}
        ${item("Languages", c.languages.join(", ") || "-")}
        ${item("Currency", c.currencies.join(", ") || "-")}
        ${item("Timezone", c.timezones[0] || "-")}
        ${item("Borders", c.borders.length + " countries")}
      </div>
      <div class="flex flex-wrap gap-3">
        <a href="#/holidays" class="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 font-semibold">Holidays</a>
        <a href="#/events" class="px-4 py-2 rounded-xl bg-purple-100 text-purple-700 font-semibold">Events</a>
        <a href="#/weather" class="px-4 py-2 rounded-xl bg-sky-100 text-sky-700 font-semibold">Weather</a>
        <a href="#/long-weekends" class="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 font-semibold">Long Weekends</a>
      </div>`;
  }

  async render(page) {
    const sel = this.selection;
    const api = this.app.api;
    const thisYear = new Date().getFullYear();
    const selectedYear = sel ? sel.year : thisYear;
    const selectClass =
      "w-full border border-slate-200 rounded-xl px-4 py-3 bg-white";

    const yearOptions = [thisYear - 1, thisYear, thisYear + 1, thisYear + 2]
      .map(
        (y) =>
          `<option value="${y}" ${y === selectedYear ? "selected" : ""}>${y}</option>`,
      )
      .join("");

    page.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        ${this.statCard("fa-globe", "bg-sky-100 text-sky-700", "stat-countries", "90+", "Countries Available")}
        ${this.statCard("fa-calendar-check", "bg-emerald-100 text-emerald-600", "stat-holidays", "-", "Holidays This Year")}
        ${this.statCard("fa-star", "bg-amber-100 text-amber-600", "stat-events", "500+", "Events Worldwide")}
        ${this.statCard("fa-heart", "bg-rose-100 text-rose-600", "stat-plans", this.app.plans.count("all"), "Saved Plans")}
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 class="text-lg font-bold mb-1"><i class="fa-solid fa-globe text-brand mr-2"></i>Select Your Destination</h3>
        <p class="text-slate-500 text-sm mb-5">Choose a country to explore holidays, events, weather, and more</p>
        <div class="bg-sky-50 border border-sky-100 rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_160px_auto] gap-4 items-end">
          <div>
            <label class="block text-sm font-semibold mb-2">Country</label>
            <select id="country" class="${selectClass}"><option value="">Loading...</option></select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">City (Optional)</label>
            <select id="city" class="${selectClass}" disabled><option value="">Capital city (default)</option></select>
          </div>
          <div>
            <label class="block text-sm font-semibold mb-2">Year</label>
            <select id="year" class="${selectClass}">${yearOptions}</select>
          </div>
          <button id="explore" class="bg-brand text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90">
            <i class="fa-solid fa-magnifying-glass mr-2"></i>Explore
          </button>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-6 shadow-sm">
        <h3 class="text-lg font-bold mb-4"><i class="fa-solid fa-flag text-brand mr-2"></i>Country Information</h3>
        <div id="info"></div>
      </div>`;

    const countrySelect = page.querySelector("#country");
    const citySelect = page.querySelector("#city");
    const yearSelect = page.querySelector("#year");
    const exploreBtn = page.querySelector("#explore");
    const info = page.querySelector("#info");

    const emptyInfo = `
      <div class="text-center text-slate-500 py-12">
        <div class="w-24 h-24 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-400 mb-4">
          <i class="fa-solid fa-globe"></i>
        </div>
        Select a country to view detailed information
      </div>`;

    // Fill the cities select for a country
    const loadCities = async () => {
      const countryName =
        countrySelect.options[countrySelect.selectedIndex].text;
      const defaultOption = '<option value="">Capital city (default)</option>';

      if (!countrySelect.value) {
        citySelect.innerHTML = defaultOption;
        citySelect.disabled = true;
        return;
      }

      citySelect.disabled = true;
      citySelect.innerHTML = '<option value="">Loading cities...</option>';

      try {
        const cities = await api.getCities(countryName);
        cities.sort((a, b) => a.localeCompare(b));
        citySelect.innerHTML =
          defaultOption +
          cities.map((c) => `<option value="${c}">${c}</option>`).join("");
      } catch {
        citySelect.innerHTML = defaultOption; 
      }
      citySelect.disabled = false;
    };

    // Show how many holidays in the stat card
    const updateHolidayStat = async (s) => {
      try {
        const list = await api.getHolidays(s.year, s.code);
        page.querySelector("#stat-holidays").textContent = list.length;
      } catch {
        page.querySelector("#stat-holidays").textContent = "-";
      }
    };

    // Click on Explore
    const explore = async () => {
      const code = countrySelect.value;
      if (!code) {
        UI.toast("Please select a country first", "error");
        return;
      }

      exploreBtn.disabled = true;
      info.innerHTML = UI.loading("Loading country information...");

      try {
        const c = await api.getCountryDetails(code);
        const cityName = citySelect.value || (c.capital ? c.capital[0] : "");

        // Get city location. 
        let place = null;
        if (cityName)
          place = await api.geocode(cityName, code).catch(() => null);

        const latlng = place
          ? [place.latitude, place.longitude]
          : (c.capitalInfo && c.capitalInfo.latlng) || [0, 0];

        const newSelection = {
          code,
          countryName: c.name.common,
          city: cityName,
          lat: latlng[0],
          lng: latlng[1],
          timezone: place ? place.timezone : "UTC",
          year: Number(yearSelect.value),
          country: {
            name: c.name.common,
            official: c.name.official,
            capital: c.capital ? c.capital[0] : "N/A",
            population: c.population,
            area: c.area,
            region: c.region,
            subregion: c.subregion || "",
            languages: Object.values(c.languages || {}),
            currencies: Object.values(c.currencies || {}).map((x) => x.name),
            timezones: c.timezones || [],
            flag: c.flags.svg,
            borders: c.borders || [],
          },
        };

        this.app.store.save(newSelection);
        info.innerHTML = this.infoHTML(newSelection);
        updateHolidayStat(newSelection);
        UI.toast(`Exploring ${newSelection.countryName}`);
      } catch (err) {
        console.error(err);
        info.innerHTML = UI.error("Could not load country information.");
      }
      exploreBtn.disabled = false;
    };

    countrySelect.addEventListener("change", loadCities);
    exploreBtn.addEventListener("click", explore);

    // Load the countries list
    try {
      const countries = await api.getCountries();
      const sorted = [...countries].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      countrySelect.innerHTML =
        '<option value="">Select Country</option>' +
        sorted
          .map((c) => `<option value="${c.countryCode}">${c.name}</option>`)
          .join("");
      page.querySelector("#stat-countries").textContent = sorted.length;
    } catch {
      countrySelect.innerHTML =
        '<option value="">Could not load countries</option>';
    }

    // If the user already chose before, show it again
    if (sel) {
      countrySelect.value = sel.code;
      await loadCities();
      citySelect.value = sel.city;
      info.innerHTML = this.infoHTML(sel);
      updateHolidayStat(sel);
    } else {
      info.innerHTML = emptyInfo;
    }
  }
}
