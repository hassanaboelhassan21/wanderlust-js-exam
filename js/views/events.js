import { BaseView } from "./base.js";
import { UI } from "../ui.js";

const SEGMENTS = [
  { label: "All", id: "" },
  { label: "Music", id: "KZFzniwnSyZfZ7v7nJ" },
  { label: "Sports", id: "KZFzniwnSyZfZ7v7nE" },
  { label: "Arts & Theatre", id: "KZFzniwnSyZfZ7v7na" },
];

export class EventsView extends BaseView {
  constructor(app) {
    super(app, "Events", "Find concerts, sports, and entertainment");
    this.segment = "";
  }

  // Convert Ticketmaster event to our shape
  formatEvent(e, sel) {
    const venue =
      e._embedded && e._embedded.venues
        ? e._embedded.venues[0].name
        : "Venue to be announced";
    return {
      id: `event-${e.id}`,
      type: "event",
      title: e.name,
      subtitle: venue,
      date: e.dates.start.localDate,
      time: e.dates.start.localTime ? e.dates.start.localTime.slice(0, 5) : "",
      category: e.classifications ? e.classifications[0].segment.name : "Event",
      image: e.images && e.images.length ? e.images[0].url : "",
      url: e.url,
      country: sel.countryName,
    };
  }

  // Fake events if the API fails or returns nothing
  mockEvents(sel) {
    const samples = [
      ["Live Music Night", "Music"],
      ["City Football Match", "Sports"],
      ["Theatre Show", "Arts & Theatre"],
      ["Jazz Festival", "Music"],
      ["Stand-up Comedy Night", "Arts & Theatre"],
      ["Basketball Final", "Sports"],
    ];
    return samples.map(([title, category], i) => {
      const d = new Date();
      d.setDate(d.getDate() + (i + 1) * 5);
      return {
        id: `event-mock-${sel.code}-${i}`,
        type: "event",
        title,
        subtitle: `${sel.city} Arena`,
        date: d.toISOString().slice(0, 10),
        time: "20:00",
        category,
        image: "",
        url: "",
        country: sel.countryName,
      };
    });
  }

  drawFilters(page) {
    page.querySelector("#filters").innerHTML = SEGMENTS.map((s) => {
      const active = s.id === this.segment;
      const style = active
        ? "bg-purple-600 text-white"
        : "bg-white text-slate-600 hover:bg-purple-50";
      return `<button data-segment="${s.id}" class="px-5 py-2 rounded-full font-semibold shadow-sm ${style}">${s.label}</button>`;
    }).join("");
  }

  async loadEvents(page) {
    const sel = this.selection;
    const list = page.querySelector("#list");
    list.innerHTML = UI.loading("Loading events...");

    let events = [];
    let isMock = false;

    try {
      const raw = await this.app.api.getEvents(
        sel.city,
        sel.code,
        this.segment,
      );
      events = raw.map((e) => this.formatEvent(e, sel));
    } catch (err) {
      console.error(err);
    }

    if (events.length === 0) {
      events = this.mockEvents(sel);
      isMock = true;
    }

    this.items = events;

    const cards = events
      .map((item, i) => {
        const image = item.image
          ? `<img src="${item.image}" alt="" class="w-full h-44 object-cover" />`
          : `<div class="w-full h-44 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-5xl"><i class="fa-solid fa-ticket"></i></div>`;
        const tickets = item.url
          ? `<a href="${item.url}" target="_blank" class="text-sm font-semibold text-purple-600 hover:underline">Tickets <i class="fa-solid fa-arrow-up-right-from-square ml-1"></i></a>`
          : "<span></span>";

        return `
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
          ${image}
          <div class="p-5 flex-1 flex flex-col">
            <span class="self-start text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 mb-3">${item.category}</span>
            <h3 class="font-bold mb-2">${item.title}</h3>
            <p class="text-sm text-slate-500"><i class="fa-regular fa-calendar mr-2"></i>${UI.formatDate(item.date)} ${item.time}</p>
            <p class="text-sm text-slate-500 mt-1"><i class="fa-solid fa-location-dot mr-2"></i>${item.subtitle}</p>
            <div class="flex items-center justify-between mt-auto pt-4">
              ${tickets}
              ${UI.saveBtn(i, this.app.plans.has(item.id))}
            </div>
          </div>
        </div>`;
      })
      .join("");

    const notice = isMock
      ? `<p class="mb-4 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3"><i class="fa-solid fa-circle-info mr-2"></i>No live events found. Showing sample events.</p>`
      : "";

    list.innerHTML =
      notice +
      `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">${cards}</div>`;
  }

  async render(page) {
    const sel = this.selection;
    const banner = UI.banner({
      gradient: "from-purple-500 to-violet-600",
      icon: "fa-ticket",
      title: "Events Explorer",
      text: "Discover concerts, sports, theatre and more in cities worldwide",
    });

    if (!sel) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-ticket",
          title: "No City Selected",
          text: "Select a country and city from the dashboard to discover events",
        });
      return;
    }

    this.segment = "";
    page.innerHTML = `
      ${banner}
      <p class="font-semibold mb-4"><i class="fa-solid fa-location-dot text-purple-600 mr-2"></i>${sel.city}, ${sel.countryName}</p>
      <div id="filters" class="flex flex-wrap gap-3 mb-6"></div>
      <div id="list"></div>`;

    this.drawFilters(page);
    this.bindSave(page);

    // Click on a filter button
    page.addEventListener("click", (e) => {
      const chip = e.target.closest("[data-segment]");
      if (!chip) return;
      this.segment = chip.dataset.segment;
      this.drawFilters(page);
      this.loadEvents(page);
    });

    await this.loadEvents(page);
  }
}
