import { BaseView } from "./base.js";
import { UI } from "../ui.js";

const QUICK = ["EUR", "GBP", "EGP", "AED", "SAR", "JPY", "USD"];

export class CurrencyView extends BaseView {
  constructor(app) {
    super(app, "Currency", "Convert currencies with live exchange rates");
    //  (EGP -> Egyptian Pound)
    this.names = new Intl.DisplayNames(["en"], { type: "currency" });
  }

  name(code) {
    try {
      return this.names.of(code) || code;
    } catch {
      return code;
    }
  }

  async render(page) {
    const banner = UI.banner({
      gradient: "from-orange-700 to-amber-500",
      icon: "fa-money-bill-transfer",
      title: "Currency Converter",
      text: "Convert between currencies with live exchange rates - essential for travel planning",
    });

    page.innerHTML = banner + UI.loading("Loading rates...");

    let rates;
    try {
      rates = await this.app.api.getRates();
    } catch {
      page.innerHTML =
        banner +
        UI.error("Could not load rates. Check your ExchangeRate API key.");
      return;
    }

    const codes = Object.keys(rates);
    const options = (selected) =>
      codes
        .map(
          (c) =>
            `<option value="${c}" ${c === selected ? "selected" : ""}>${c} - ${this.name(c)}</option>`,
        )
        .join("");
    const selectClass =
      "w-full border border-slate-200 rounded-xl px-4 py-3 bg-white";

    page.innerHTML = `
      ${banner}
      <div class="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm p-8 mb-6">
        <label class="block text-center text-sm font-medium mb-2">Amount</label>
        <input id="amount" type="number" min="0" value="100"
          class="block w-full max-w-sm mx-auto text-center text-4xl font-bold border border-slate-200 rounded-2xl py-5" />

        <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-end mt-6">
          <div>
            <label class="block text-center text-sm font-medium mb-2">From</label>
            <select id="from" class="${selectClass}">${options("USD")}</select>
          </div>
          <button id="swap" class="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 mx-auto">
            <i class="fa-solid fa-right-left"></i>
          </button>
          <div>
            <label class="block text-center text-sm font-medium mb-2">To</label>
            <select id="to" class="${selectClass}">${options("EUR")}</select>
          </div>
        </div>

        <button id="convert" class="w-full bg-brand text-white font-semibold py-4 rounded-xl mt-6 hover:opacity-90">
          <i class="fa-solid fa-calculator mr-2"></i>Convert
        </button>
        <div id="result" class="mt-6 text-center"></div>
      </div>

      <div class="bg-white rounded-3xl shadow-sm p-6">
        <h3 class="font-bold mb-4"><i class="fa-solid fa-star text-brand mr-2"></i>Quick Convert</h3>
        <div id="quick" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4"></div>
      </div>`;

    const amountInput = page.querySelector("#amount");
    const fromSelect = page.querySelector("#from");
    const toSelect = page.querySelector("#to");
    const result = page.querySelector("#result");
    const quick = page.querySelector("#quick");

    // Convert using 
    const convert = () => {
      const amount = parseFloat(amountInput.value);
      if (isNaN(amount) || amount < 0) {
        UI.toast("Enter a valid amount", "error");
        return;
      }
      const from = fromSelect.value;
      const to = toSelect.value;
      const rate = rates[to] / rates[from];
      const total = amount * rate;

      result.innerHTML = `
        <p class="text-slate-500">${amount.toLocaleString()} ${from} =</p>
        <p class="text-4xl font-bold text-brand my-2">${total.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${to}</p>
        <p class="text-sm text-slate-400">1 ${from} = ${rate.toFixed(4)} ${to}</p>`;
    };

    // Small cards 
    const drawQuick = () => {
      const from = fromSelect.value;
      quick.innerHTML = QUICK.filter((c) => c !== from && rates[c])
        .map(
          (c) => `
        <button data-code="${c}" class="bg-slate-50 hover:bg-sky-50 rounded-2xl p-4 text-left transition">
          <p class="font-bold">${c}</p>
          <p class="text-xs text-slate-500 truncate">${this.name(c)}</p>
          <p class="font-bold text-brand mt-2">${(rates[c] / rates[from]).toFixed(4)}</p>
        </button>`,
        )
        .join("");
    };

    page.querySelector("#convert").addEventListener("click", convert);

    page.querySelector("#swap").addEventListener("click", () => {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      drawQuick();
      convert();
    });

    fromSelect.addEventListener("change", drawQuick);

    quick.addEventListener("click", (e) => {
      const card = e.target.closest("[data-code]");
      if (!card) return;
      toSelect.value = card.dataset.code;
      convert();
    });

    drawQuick();
    convert();
  }
}
