(function () {
  const keys = ["notices", "services", "branches"];

  const defaults = {
    notices: [],
    services: [
      { title: "बचत ठेव योजना", body: "नियमित बचतीसाठी बचत ठेव सुविधा." },
      { title: "मुदत ठेव योजना", body: "निश्चित कालावधीसाठी ठेव सुविधा." },
      { title: "आवर्ती ठेव योजना", body: "नियमित रक्कम जमा करून बचत करण्याची सुविधा." },
      { title: "दैनिक ठेव योजना", body: "दैनिक किंवा ठरलेल्या वेळापत्रकानुसार बचत जमा करण्याची सुविधा." },
      { title: "कर्ज सुविधा", body: "सभासदांच्या पात्रतेनुसार कर्ज सुविधा." },
      { title: "दैनिक संकलन सेवा", body: "अधिकृत प्रतिनिधीमार्फत दैनिक रक्कम संकलन सेवा." }
    ],
    branches: [
      {
        title: "श्री कालिकामाता नागरी सहकारी पतसंस्था मर्यादित, कालवार",
        address: "शिवकृपा सोसायटी, दुसरा मजला, 1263/A-14, अंजूरफाटा, सरवणा हॉटेलच्या वर, रहनाळ, भिवंडी, महाराष्ट्र 421302",
        phone: "7020461002"
      }
    ]
  };

  function get(k) {
    try {
      const data = JSON.parse(localStorage.getItem("patsanstha_" + k));
      return Array.isArray(data) ? data : defaults[k].slice();
    } catch {
      return defaults[k].slice();
    }
  }

  function set(k, data) {
    localStorage.setItem("patsanstha_" + k, JSON.stringify(data));
  }

  const esc = s => String(s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));

  const listIds = {
    notices: "notice-list",
    services: "service-list",
    branches: "branch-list"
  };

  const config = {
    notices: {
      form: "notice-form",
      fields: ["notice-title", "notice-body"],
      names: ["title", "body"]
    },
    services: {
      form: "service-form",
      fields: ["service-title", "service-body"],
      names: ["title", "body"]
    },
    branches: {
      form: "branch-form",
      fields: ["branch-title", "branch-address", "branch-phone"],
      names: ["title", "address", "phone"]
    }
  };

  const editing = { notices: null, services: null, branches: null };

  function render(k) {
    const list = document.getElementById(listIds[k]);
    if (!list) return;

    const items = get(k);
    list.innerHTML = items.length ? items.map((x, i) => `
      <div class="item-row">
        <div>
          <b>${esc(x.title)}</b>
          <p>${esc(x.body || x.address || "")}</p>
          ${x.phone ? `<small>${esc(x.phone)}</small>` : ""}
        </div>
        <div class="admin-actions">
          <button type="button" data-edit="${k}" data-index="${i}">बदला</button>
          <button type="button" data-delete="${k}" data-index="${i}">काढून टाका</button>
        </div>
      </div>
    `).join("") : "<p>अद्याप कोणतीही नोंद नाही.</p>";
  }

  function refresh() {
    Object.keys(config).forEach(render);
  }

  Object.keys(config).forEach(k => {
    const c = config[k];
    const form = document.getElementById(c.form);
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();

      const item = {};
      c.fields.forEach((id, i) => {
        item[c.names[i]] = document.getElementById(id).value.trim();
      });

      if (!item.title) return;

      const items = get(k);
      if (editing[k] !== null) {
        items[editing[k]] = item;
        editing[k] = null;
      } else {
        items.unshift(item);
      }

      set(k, items);
      form.reset();
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = "जोडा";
      refresh();
    });
  });

  document.addEventListener("click", e => {
    const edit = e.target.closest("[data-edit]");
    if (edit) {
      const k = edit.dataset.edit;
      const i = Number(edit.dataset.index);
      const item = get(k)[i];
      const c = config[k];
      if (!item) return;

      editing[k] = i;
      c.fields.forEach((id, n) => {
        document.getElementById(id).value = item[c.names[n]] || "";
      });
      const form = document.getElementById(c.form);
      const btn = form.querySelector('button[type="submit"]');
      if (btn) btn.textContent = "बदल जतन करा";
      form.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const del = e.target.closest("[data-delete]");
    if (del) {
      const k = del.dataset.delete;
      const i = Number(del.dataset.index);
      if (!confirm("ही नोंद काढून टाकायची आहे का?")) return;
      const items = get(k);
      items.splice(i, 1);
      set(k, items);
      editing[k] = null;
      refresh();
    }
  });

  document.querySelectorAll("[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(x => x.classList.remove("active"));
      document.querySelectorAll(".admin-panel").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById("panel-" + btn.dataset.tab);
      if (panel) panel.classList.add("active");
    });
  });

  const exportBtn = document.getElementById("export-btn");
  if (exportBtn) exportBtn.addEventListener("click", () => {
    const data = {};
    keys.forEach(k => data[k] = get(k));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "patsanstha-backup.json";
    a.click();
  });

  const importFile = document.getElementById("import-file");
  if (importFile) importFile.addEventListener("change", async e => {
    try {
      const data = JSON.parse(await e.target.files[0].text());
      keys.forEach(k => { if (Array.isArray(data[k])) set(k, data[k]); });
      refresh();
      alert("बॅकअप आयात झाला.");
    } catch {
      alert("बॅकअप फाईल योग्य नाही.");
    }
    e.target.value = "";
  });

  const resetBtn = document.getElementById("reset-btn");
  if (resetBtn) resetBtn.addEventListener("click", () => {
    if (!confirm("मूळ सहा सेवा आणि मुख्य कार्यालय पुन्हा आणायचे?")) return;
    keys.forEach(k => set(k, defaults[k]));
    refresh();
  });

  keys.forEach(k => {
    if (localStorage.getItem("patsanstha_" + k) === null) {
      set(k, defaults[k]);
    }
  });

  refresh();
})();
