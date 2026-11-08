// All APIS urls and keys in one places
export const CONFIG = {
  NAGER: "https://date.nager.at/api/v3",
  COUNTRIES: "https://api.restcountries.com/countries/v5",
  RC_KEY: "rc_live_73ecffdaef87467bbec2e4e2b90f88e3",
  METEO: "https://api.open-meteo.com/v1",
  GEO: "https://geocoding-api.open-meteo.com/v1",
  SUN: "https://api.sunrise-sunset.org/json",
  CITIES: "https://countriesnow.space/api/v0.1/countries/cities",
  TICKETMASTER: "https://app.ticketmaster.com/discovery/v2",
  TM_KEY: "PUT_YOUR_TICKETMASTER_KEY_HERE",
  EXCHANGE: "https://v6.exchangerate-api.com/v6",
  EX_KEY: "3c437add07f0bf008c3a10ae",
};

// Turn weather code into text and Icon
export function getWeatherInfo(code) {
  if (code === 0) return { text: "Clear sky", icon: "fa-sun" };
  if (code <= 2) return { text: "Partly cloudy", icon: "fa-cloud-sun" };
  if (code === 3) return { text: "Overcast", icon: "fa-cloud" };
  if (code <= 48) return { text: "Fog", icon: "fa-smog" };
  if (code <= 57) return { text: "Drizzle", icon: "fa-cloud-rain" };
  if (code <= 67) return { text: "Rain", icon: "fa-cloud-showers-heavy" };
  if (code <= 77) return { text: "Snow", icon: "fa-snowflake" };
  if (code <= 82)
    return { text: "Rain showers", icon: "fa-cloud-showers-heavy" };
  if (code <= 86) return { text: "Snow showers", icon: "fa-snowflake" };
  return { text: "Thunderstorm", icon: "fa-bolt" };
}
