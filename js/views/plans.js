import { BaseView } from "./base.js";
import { UI } from "../ui.js";

const FILTERS = [
  { key: "all", label: "All", icon: "fa-layer-group" },
  { key: "holiday", label: "Holidays", icon: "fa-calendar-days" },
  { key: "event", label: "Events", icon: "fa-ticket" },
  { key: "longweekend", label: "Long Weekends", icon: "fa-umbrella-beach" },
];

const TYPE_STYLE = {
  holiday: { label: "Holiday", cls: "bg-emerald-100 text-emerald-700" },
  event: { label: "Event", cls: "bg-purple-100 text-purple-700" },
  longweekend: { label: "Long Weekend", cls: "bg-amber-100 text-amber-700" },
};

export class PlansView extends BaseView {
  constructor(app) {
    super(app, "My Plans", "Your saved holidays and events");
    this.filter = "all";
  }

  draw(page) {
    const plans = this.app.plans;
    const list = plans.getByType(this.filter);

    const banner = UI.banner({
      gradient: "from-pink-500 to-rose-600",
      icon: "fa-heart",
      title: "My Saved Plans",
      text: "Your saved holidays, events, and trip ideas all in one place",
      extra: `<button data-clear class="border border-white/70 rounded-xl px-5 py-2 font-semibold hover:bg-white/10">
                <i class="fa-solid fa-trash mr-2"></i>Clear All
              </button>`,
    });

    const tabs = FILTERS.map((f) => {
      const active = f.key === this.filter;
      const style = active
        ? "border-brand text-brand"
        : "border-slate-200 text-slate-600";
      return `
        <button data-filter="${f.key}" class="px-5 py-2 rounded-full bg-white border-2 font-semibold ${style}">
          <i class="fa-solid ${f.icon} mr-2"></i>${f.label}
          <span class="ml-2 text-sm bg-slate-100 px-2 py-0.5 rounded-full">${plans.count(f.key)}</span>
        </button>`;
    }).join("");

    let body;
    if (plans.count("all") === 0) {
      body = UI.empty({
        icon: "fa-heart-crack",
        title: "No Saved Plans Yet",
        text: "Start exploring and save holidays, events, or long weekends you like!",
        btn: "Start Exploring",
        btnIcon: "fa-compass",
      });
    } else if (list.length === 0) {
      body =
        '<p class="text-center text-slate-500 py-16">No plans in this category yet.</p>';
    } else {
      body =
        '<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">' +
        list
          .map((p) => {
            const style = TYPE_STYLE[p.type];
            const date = p.endDate
              ? `${UI.formatDate(p.date)} → ${UI.formatDate(p.endDate)}`
              : UI.formatDate(p.date);
            return `
          <div class="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div class="flex-1 min-w-0">
              <span class="text-xs font-semibold px-3 py-1 rounded-full ${style.cls}">${style.label}</span>
              <h3 class="font-bold mt-2 truncate">${p.title}</h3>
              <p class="text-sm text-slate-500 truncate">${p.subtitle}</p>
              <p class="text-xs text-slate-400 mt-1">${date} • ${p.country}</p>
            </div>
            <button data-delete="${p.id}" title="Delete"
              class="w-10 h-10 rounded-full bg-red-50 text-red-500 hover:bg-red-100">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>`;
          })
          .join("") +
        "</div>";
    }

    page.innerHTML = `${banner}<div class="flex flex-wrap gap-3 mb-6">${tabs}</div>${body}`;
  }

  async render(page) {
    this.draw(page);

    // One listener for filters, delete and clear
    page.addEventListener("click", (e) => {
      const filterBtn = e.target.closest("[data-filter]");
      const deleteBtn = e.target.closest("[data-delete]");
      const clearBtn = e.target.closest("[data-clear]");

      if (filterBtn) {
        this.filter = filterBtn.dataset.filter;
        this.draw(page);
      } else if (deleteBtn) {
        this.app.plans.remove(deleteBtn.dataset.delete);
        UI.toast("Plan deleted");
        this.draw(page);
      } else if (clearBtn) {
        if (this.app.plans.count("all") === 0) return;
        if (confirm("Delete all saved plans?")) {
          this.app.plans.clear();
          UI.toast("All plans cleared");
          this.draw(page);
        }
      }
    });
  }
}
