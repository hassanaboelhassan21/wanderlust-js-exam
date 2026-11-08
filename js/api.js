import { CONFIG } from "./config.js";

export class ApiService {
  constructor() {
    this.countriesCache = null; 
    this.ratesCache = null; 
  }

  //  GET request 
  async get(url, headers = {}) {
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error("Request failed: " + res.status);
    return res.json();
  }

  async getCountries() {
    if (!this.countriesCache) {
      this.countriesCache = await this.get(
        `${CONFIG.NAGER}/AvailableCountries`,
      );
    }
    return this.countriesCache;
  }

  async getCities(countryName) {
    const res = await fetch(CONFIG.CITIES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ country: countryName }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.msg);
    return data.data;
  }

  // get a name from item
  pickName(item) {
    if (typeof item === "string") return item;
    if (!item || typeof item !== "object") return "";
    const keys = Object.keys(item);
    const key =
      keys.find((k) => /english/i.test(k)) ||
      keys.find((k) => /name/i.test(k) && !/native/i.test(k));
    return key && typeof item[key] === "string" ? item[key] : "";
  }

  // Turn the new v5
  normalizeCountry(c, code) {
    const toList = (x) => (Array.isArray(x) ? x : Object.values(x || {}));

    const capital = c.capitals && c.capitals.length ? c.capitals[0] : null;
    const center =
      c.coordinates && c.coordinates.lat != null ? c.coordinates : null;
    const capCoords =
      capital && capital.coordinates && capital.coordinates.lat != null
        ? capital.coordinates
        : center;

    const languages = toList(c.languages)
      .map((l) => this.pickName(l))
      .filter(Boolean);
    const currencies = Array.isArray(c.currencies)
      ? c.currencies.map((x) => this.pickName(x)).filter(Boolean)
      : Object.entries(c.currencies || {}).map(
          ([k, v]) => this.pickName(v) || k,
        );

    return {
      name: { common: c.names.common, official: c.names.official },
      capital: capital && capital.name ? [capital.name] : null,
      capitalInfo: capCoords
        ? { latlng: [capCoords.lat, capCoords.lng] }
        : null,
      population: c.population || 0,
      area: c.area ? c.area.kilometers || 0 : 0,
      region: c.region || "",
      subregion: c.subregion || "",
      languages: Object.fromEntries(languages.map((n, i) => [i, n])),
      currencies: Object.fromEntries(
        currencies.map((n, i) => [i, { name: n }]),
      ),
      timezones: c.timezones || [],
      flags: {
        svg:
          (c.flag && (c.flag.url_svg || c.flag.url_png)) ||
          `https://flagcdn.com/w320/${code.toLowerCase()}.png`,
      },
      borders: c.borders || [],
    };
  }

  // Try REST Countries v5
  async getCountryDetails(code) {
    const hasKey = CONFIG.RC_KEY && !CONFIG.RC_KEY.includes("PUT_YOUR");

    if (hasKey) {
      try {
        const url = `${CONFIG.COUNTRIES}/codes.alpha_2/${code}`;
        const data = await this.get(url, {
          Authorization: `Bearer ${CONFIG.RC_KEY}`,
        });
        const raw = data.data.objects[0];
        console.log("RC raw:", raw); // check the real
        return this.normalizeCountry(raw, code);
      } catch (err) {
        console.warn("REST Countries v5 failed, using backup:", err);
      }
    }

    return this.getCountryBackup(code);
  }

  // Backup
  async getCountryBackup(code) {
    const info = await this.get(`${CONFIG.NAGER}/CountryInfo/${code}`);
    return {
      name: { common: info.commonName, official: info.officialName },
      capital: null,
      capitalInfo: null,
      population: 0,
      area: 0,
      region: info.region,
      subregion: "",
      languages: {},
      currencies: {},
      timezones: [],
      flags: { svg: `https://flagcdn.com/w320/${code.toLowerCase()}.png` },
      borders: info.borders ? info.borders.map((b) => b.countryCode) : [],
    };
  }

  // Get latitude, longitude 
  async geocode(city, code) {
    const url = `${CONFIG.GEO}/search?name=${encodeURIComponent(city)}&count=1&countryCode=${code}`;
    const data = await this.get(url);
    return data.results ? data.results[0] : null;
  }

  getHolidays(year, code) {
    return this.get(`${CONFIG.NAGER}/PublicHolidays/${year}/${code}`);
  }

  getLongWeekends(year, code) {
    return this.get(`${CONFIG.NAGER}/LongWeekend/${year}/${code}`);
  }

  getWeather(lat, lng) {
    const url =
      `${CONFIG.METEO}/forecast?latitude=${lat}&longitude=${lng}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code` +
      `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max` +
      `&timezone=auto&forecast_days=7`;
    return this.get(url);
  }

  getSunTimes(lat, lng, date) {
    return this.get(
      `${CONFIG.SUN}?lat=${lat}&lng=${lng}&date=${date}&formatted=0`,
    );
  }

  async getEvents(city, code, segmentId = "") {
    let url =
      `${CONFIG.TICKETMASTER}/events.json?apikey=${CONFIG.TM_KEY}` +
      `&city=${encodeURIComponent(city)}&countryCode=${code}&size=20&sort=date,asc`;
    if (segmentId) url += `&segmentId=${segmentId}`;
    const data = await this.get(url);
    return data._embedded ? data._embedded.events : [];
  }

  async getRates() {
    if (!this.ratesCache) {
      const data = await this.get(
        `${CONFIG.EXCHANGE}/${CONFIG.EX_KEY}/latest/USD`,
      );
      this.ratesCache = data.conversion_rates;
    }
    return this.ratesCache;
  }
}
