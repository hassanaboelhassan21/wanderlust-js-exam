import { Store, PlansStore } from "./store.js";
import { ApiService } from "./api.js";
import { Router } from "./router.js";
import { DashboardView } from "./views/dashboard.js";
import { HolidaysView } from "./views/holidays.js";
import { EventsView } from "./views/events.js";
import { WeatherView } from "./views/weather.js";
import { LongWeekendsView } from "./views/long-weekends.js";
import { CurrencyView } from "./views/currency.js";
import { SunTimesView } from "./views/sun-times.js";
import { PlansView } from "./views/plans.js";

const NAV = [
  {
    section: "Main",
    links: [{ path: "/dashboard", label: "Dashboard", icon: "fa-house" }],
  },
  {
    section: "Explore",
    links: [
      { path: "/holidays", label: "Holidays", icon: "fa-calendar-days" },
      { path: "/events", label: "Events", icon: "fa-ticket" },
      { path: "/weather", label: "Weather", icon: "fa-cloud-sun" },
      {
        path: "/long-weekends",
        label: "Long Weekends",
        icon: "fa-umbrella-beach",
      },
    ],
  },
  {
    section: "Travel Tools",
    links: [
      { path: "/currency", label: "Currency", icon: "fa-money-bill-transfer" },
      { path: "/sun-times", label: "Sun Times", icon: "fa-sun" },
    ],
  },
  {
    section: "Personal",
    links: [{ path: "/plans", label: "My Plans", icon: "fa-heart" }],
  },
];

class App {
  constructor() {
    // Shared objects that every page can use
    this.store = new Store();
    this.plans = new PlansStore();
    this.api = new ApiService();
  }

  renderNav() {
    document.getElementById("nav").innerHTML = NAV.map(
      (group) => `
      <p class="text-xs font-semibold tracking-widest text-blue-300 px-3 mt-5 mb-2 uppercase">${group.section}</p>
      ${group.links
        .map(
          (l) => `
        <a href="#${l.path}" data-nav="${l.path}"
          class="flex items-center gap-4 px-4 py-3 rounded-xl text-blue-200 hover:bg-white/10 transition">
          <i class="fa-solid ${l.icon} w-5 text-center"></i>${l.label}
        </a>`,
        )
        .join("")}
    `,
    ).join("");
  }

  startClock() {
    const clock = document.getElementById("clock");
    const update = () => {
      clock.textContent = new Date().toLocaleString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    };
    update();
    setInterval(update, 30000);
  }

  start() {
    this.renderNav();
    this.startClock();

    const routes = {
      "/dashboard": new DashboardView(this),
      "/holidays": new HolidaysView(this),
      "/events": new EventsView(this),
      "/weather": new WeatherView(this),
      "/long-weekends": new LongWeekendsView(this),
      "/currency": new CurrencyView(this),
      "/sun-times": new SunTimesView(this),
      "/plans": new PlansView(this),
    };

    new Router(routes, document.getElementById("view")).start();
  }
}

new App().start();
