import { UI } from "./ui.js";

export class Router {
  constructor(routes, container) {
    this.routes = routes; // { '/weather': WeatherView, ... }
    this.container = container; // the <main> element
  }

  start() {
    window.addEventListener("hashchange", () => this.handle());
    this.handle();
  }

  async handle() {
    const path = location.hash.slice(1); // "#/weather" -> "/weather"

    // Unknown url -> go to dashboard
    if (!this.routes[path]) {
      location.hash = "#/dashboard";
      return;
    }

    const view = this.routes[path];

    // Update header
    document.getElementById("page-title").textContent = view.title;
    document.getElementById("page-subtitle").textContent = view.subtitle;

    // Highlight the active link
    document.querySelectorAll("[data-nav]").forEach((link) => {
      const active = link.dataset.nav === path;
      link.classList.toggle("bg-white/20", active);
      link.classList.toggle("text-white", active);
      link.classList.toggle("text-blue-200", !active);
    });

    // Every visit gets a fresh empty page element
    const page = document.createElement("div");
    this.container.replaceChildren(page);
    this.container.scrollTop = 0;

    try {
      await view.render(page);
    } catch (err) {
      console.error(err);
      page.innerHTML = UI.error();
    }
  }
}
