import { BaseView } from "./base.js";
import { UI } from "../ui.js";

export class HolidaysView extends BaseView {
  constructor(app) {
    super(app, "Holidays", "Explore public holidays around the world");
  }

  async render(page) {
    const sel = this.selection;
    const banner = UI.banner({
      gradient: "from-emerald-500 to-emerald-600",
      icon: "fa-calendar-days",
      title: "Public Holidays Explorer",
      text: "Browse public holidays for any country and plan your trips around them",
    });

    if (!sel) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-calendar-xmark",
          title: "No Country Selected",
          text: "Select a country from the dashboard to explore public holidays",
        });
      return;
    }

    page.innerHTML = banner + UI.loading("Loading holidays...");

    const holidays = await this.app.api.getHolidays(sel.year, sel.code);

    // Convert API data to our plan shape
    this.items = holidays.map((h) => ({
      id: `holiday-${sel.code}-${h.date}-${h.name}`,
      type: "holiday",
      title: h.name,
      subtitle: h.localName,
      date: h.date,
      country: sel.countryName,
    }));

    const cards = this.items
      .map((item, i) => {
        const d = new Date(item.date + "T00:00:00");
        const month = d.toLocaleDateString("en-US", { month: "short" });
        const saved = this.app.plans.has(item.id);
        return `
        <div class="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div class="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-700 flex flex-col items-center justify-center shrink-0">
            <span class="text-xs font-semibold uppercase">${month}</span>
            <span class="text-2xl font-bold leading-none">${d.getDate()}</span>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-bold truncate">${item.title}</h3>
            <p class="text-sm text-slate-500 truncate">${item.subtitle}</p>
            <p class="text-xs text-slate-400 mt-1">${UI.formatDate(item.date)}</p>
          </div>
          ${UI.saveBtn(i, saved)}
        </div>`;
      })
      .join("");

    page.innerHTML = `
      ${banner}
      <div class="flex items-center gap-3 mb-5">
        <img src="${UI.flag(sel.code, 40)}" alt="" class="w-8 rounded" />
        <p class="font-semibold">${sel.countryName} • ${sel.year} • ${this.items.length} holidays</p>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">${cards}</div>`;

    this.bindSave(page);
  }
}
