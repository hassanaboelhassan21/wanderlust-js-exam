// Keeps the user choice (country, city, year)
export class Store {
  constructor() {
    this.key = "wanderlust_selection";
    this.selection = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key));
    } catch {
      return null;
    }
  }

  save(selection) {
    this.selection = selection;
    localStorage.setItem(this.key, JSON.stringify(selection));
  }
}

// Keeps the saved plans (My Plans page)
export class PlansStore {
  constructor() {
    this.key = "wanderlust_plans";
    this.plans = this.load();
  }

  load() {
    try {
      return JSON.parse(localStorage.getItem(this.key)) || [];
    } catch {
      return [];
    }
  }

  persist() {
    localStorage.setItem(this.key, JSON.stringify(this.plans));
  }

  has(id) {
    return this.plans.some((p) => p.id === id);
  }

  remove(id) {
    this.plans = this.plans.filter((p) => p.id !== id);
    this.persist();
  }

  // If saved -> remove it, if not -> add it. Returns true when saved
  toggle(plan) {
    if (this.has(plan.id)) {
      this.remove(plan.id);
      return false;
    }
    this.plans.push(plan);
    this.persist();
    return true;
  }

  clear() {
    this.plans = [];
    this.persist();
  }

  count(type) {
    return this.getByType(type).length;
  }

  getByType(type) {
    if (type === "all") return this.plans;
    return this.plans.filter((p) => p.type === type);
  }
}
