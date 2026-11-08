import { UI } from "../ui.js";

// Parent class 
export class BaseView {
  constructor(app, title, subtitle) {
    this.app = app;
    this.title = title;
    this.subtitle = subtitle;
    this.items = []; 
  }

  get selection() {
    return this.app.store.selection;
  }

  // One click listener for all heart buttons in the page
  bindSave(page) {
    page.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-save]");
      if (!btn) return;

      const plan = this.items[btn.dataset.save];
      const saved = this.app.plans.toggle(plan);

      btn.outerHTML = UI.saveBtn(btn.dataset.save, saved);
      UI.toast(saved ? "Saved to My Plans" : "Removed from My Plans");
    });
  }
}
