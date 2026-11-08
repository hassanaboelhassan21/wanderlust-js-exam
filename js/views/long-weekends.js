import { BaseView } from "./base.js";
import { UI } from "../ui.js";

export class LongWeekendsView extends BaseView {
  constructor(app) {
    super(app, "Long Weekends", "Find the perfect mini-trip opportunities");
  }

  async render(page) {
    const sel = this.selection;
    const banner = UI.banner({
      gradient: "from-amber-500 to-orange-600",
      icon: "fa-umbrella-beach",
      title: "Long Weekend Finder",
      text: "Find holidays near weekends - perfect for planning mini-trips!",
    });

    if (!sel) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-umbrella-beach",
          title: "No Country Selected",
          text: "Select a country from the dashboard to discover long weekend opportunities",
        });
      return;
    }

    page.innerHTML = banner + UI.loading("Finding long weekends...");

    const list = await this.app.api.getLongWeekends(sel.year, sel.code);

    if (list.length === 0) {
      page.innerHTML =
        banner +
        UI.empty({
          icon: "fa-umbrella-beach",
          title: "No Long Weekends",
          text: `No long weekends found for ${sel.countryName} in ${sel.year}`,
          btn: "Change Selection",
        });
      return;
    }

    this.items = list.map((lw) => ({
      id: `longweekend-${sel.code}-${lw.startDate}`,
      type: "longweekend",
      title: `${lw.dayCount}-Day Long Weekend`,
      subtitle: lw.needBridgeDay
        ? "Needs a bridge day off"
        : "No bridge day needed",
      date: lw.startDate,
      endDate: lw.endDate,
      country: sel.countryName,
    }));

    const cards = this.items
      .map(
        (item, i) => `
      <div class="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div class="w-16 h-16 rounded-xl bg-amber-100 text-amber-700 flex flex-col items-center justify-center shrink-0">
          <span class="text-2xl font-bold leading-none">${list[i].dayCount}</span>
          <span class="text-xs font-semibold uppercase">Days</span>
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-bold">${UI.formatDate(item.date)} → ${UI.formatDate(item.endDate)}</h3>
          <p class="text-sm ${list[i].needBridgeDay ? "text-orange-600" : "text-emerald-600"} mt-1">${item.subtitle}</p>
        </div>
        ${UI.saveBtn(i, this.app.plans.has(item.id))}
      </div>`,
      )
      .join("");

    page.innerHTML = `
      ${banner}
      <div class="flex items-center gap-3 mb-5">
        <img src="${UI.flag(sel.code, 40)}" alt="" class="w-8 rounded" />
        <p class="font-semibold">${sel.countryName} • ${sel.year} • ${list.length} long weekends</p>
      </div>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">${cards}</div>`;

    this.bindSave(page);
  }
}
