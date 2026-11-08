// Small helpers that return HTML or show messages
export const UI = {
  flag(code, size = 80) {
    return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
  },

  formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  },

  loading(text = "Loading...") {
    return `
      <div class="flex flex-col items-center justify-center py-24 text-slate-500">
        <i class="fa-solid fa-spinner fa-spin text-3xl mb-4"></i>
        <p>${text}</p>
      </div>`;
  },

  error(message = "Something went wrong. Please try again.") {
    return `
      <div class="flex flex-col items-center justify-center py-24 text-red-500">
        <i class="fa-solid fa-circle-exclamation text-4xl mb-4"></i>
        <p>${message}</p>
      </div>`;
  },

  // Colored banner at the top of every page
  banner({ gradient, icon, title, text, extra = "" }) {
    return `
      <div class="rounded-3xl p-8 mb-6 text-white flex items-center justify-between bg-gradient-to-r ${gradient}">
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div>
            <h2 class="text-3xl font-bold">${title}</h2>
            <p class="text-white/90 mt-1">${text}</p>
          </div>
        </div>
        ${extra}
      </div>`;
  },

  // Empty state with a button
  empty({
    icon,
    title,
    text,
    btn = "Go to Dashboard",
    href = "#/dashboard",
    btnIcon = "fa-globe",
  }) {
    return `
      <div class="flex flex-col items-center text-center py-20">
        <div class="w-28 h-28 rounded-full bg-slate-200/70 flex items-center justify-center text-4xl text-slate-400 mb-6">
          <i class="fa-solid ${icon}"></i>
        </div>
        <h3 class="text-2xl font-bold mb-2">${title}</h3>
        <p class="text-slate-500 max-w-md mb-6">${text}</p>
        <a href="${href}" class="bg-brand text-white font-semibold px-6 py-3 rounded-xl shadow hover:opacity-90">
          <i class="fa-solid ${btnIcon} mr-2"></i>${btn}
        </a>
      </div>`;
  },

  // Heart button (filled when saved)
  saveBtn(index, saved) {
    const style = saved
      ? "bg-rose-500 text-white"
      : "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-500";
    return `
      <button data-save="${index}" title="Save to My Plans"
        class="w-10 h-10 rounded-full flex items-center justify-center transition ${style}">
        <i class="fa-${saved ? "solid" : "regular"} fa-heart"></i>
      </button>`;
  },

  // Small message at the bottom of the screen
  toast(message, type = "success") {
    const box = document.createElement("div");
    const color = type === "error" ? "bg-red-600" : "bg-emerald-600";
    box.className = `fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white shadow-lg ${color}`;
    box.textContent = message;
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 2500);
  },
};
