(function () {
  const keys = ["notices", "services", "branches"];

  const defaults = {
    notices: [],
    services: [
      { title: "बचत ठेव योजना", body: "नियमित बचतीसाठी बचत ठेव सुविधा. खाते उघडण्याच्या अटी कार्यालयात जाणून घ्या." },
      { title: "मुदत ठेव योजना", body: "निश्चित कालावधीसाठी रक्कम ठेवण्याची सुविधा. लागू कालावधी व व्याजदर संस्थेकडून तपासा." },
      { title: "आवर्ती ठेव योजना", body: "ठराविक अंतराने नियमित रक्कम जमा करून बचत करण्याची सुविधा." },
      { title: "दैनिक ठेव योजना", body: "योजनेच्या नियमानुसार दररोज किंवा ठरलेल्या वेळापत्रकानुसार बचत जमा करण्याची सुविधा." },
      { title: "कर्ज सुविधा", body: "सभासदांची पात्रता, आवश्यक कागदपत्रे आणि संस्थेच्या मंजुरीनुसार कर्ज सुविधा." },
      { title: "दैनिक संकलन सेवा", body: "संस्थेच्या अधिकृत प्रतिनिधीमार्फत सभासदांकडून दैनिक जमा रक्कम संकलित करण्याची सेवा." }
    ],
    branches: [
      {
        title: "श्री कालिकामाता नागरी सहकारी पतसंस्था मर्यादित, कालवार",
        address: "शिवकृपा सोसायटी, दुसरा मजला, 1263/A-14, अंजूरफाटा, सरवणा हॉटेलच्या वर, रहनाळ, भिवंडी, महाराष्ट्र – 421302.\nकार्यालयीन वेळ: सकाळी ९:३० ते सायंकाळी ५:३०",
        phone: "7020461002"
      }
    ]
  };

  const get = k => {
    try {
      const value = JSON.parse(localStorage.getItem("patsanstha_" + k));
      return Array.isArray(value) ? value : [];
    } catch (e) {
      return [];
    }
  };

  const set = (k, value) =>
    localStorage.setItem("patsanstha_" + k, JSON.stringify(value));

  const status = document.getElementById("status");
  const msg = t => {
    if (status) status.textContent = t;
  };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  }[c]));

  // प्रथमच मूळ सेवा आणि मुख्य कार्यालय दाखवा
  const initialized = "patsanstha_admin_initialized_v2";

  if (!localStorage.getItem(initialized)) {
    const allEmpty = keys.every(k => get(k).length === 0);

    if (allEmpty) {
      keys.forEach(k => set(k, defaults[k]));
    }

    localStorage.setItem(initialized, "yes");
  }

  const listIds = {
    notices: "notice-list",
    services: "service-list",
    branches: "branch-list"
  };

  const forms = {
    notices: {
      form: document.getElementById("notice-form"),
      fields: ["notice-title", "notice-body"],
      names: ["title", "body"]
    },
    services: {
      form: document.getElementById("service-form"),
      fields: ["service-title", "service-body"],
      names: ["title", "body"]
    },
    branches: {
      form: document.getElementById("branch-form"),
      fields: ["branch-title", "branch-address", "branch-phone"],
      names: ["title", "address", "phone"]
    }
  };

  const editing = {
    notices: null,
    services: null,
    branches: null
  };

  function render(k) {
    const list = document.getElementById(listIds[k]);
    if (!list) return;

    const items = get(k);

    list.innerHTML = items.length
      ? items.map((x, i) => `
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
      `).join("")
      : '<p class="muted">अद्याप कोणतीही नोंद नाही.</p>';
  }

  function refresh() {
    keys.forEach(render);
  }

  function finishEdit(k) {
    const config = forms[k];
    editing[k] = null;
    config.form.reset();

    const button = config.form.querySelector("button");
    if (button) button.textContent = k === "notices"
      ? "सूचना जोडा"
      : k === "services" ? "सेवा जोडा" : "शाखा जोडा";

    const cancel = config.form.querySelector(".cancel-edit");
    if (cancel) cancel.remove();
  }

  function startEdit(k, index) {
    const config = forms[k];
    const item = get(k)[index];
    if (!item) return;

    editing[k] = index;

    config.fields.forEach((id, i) => {
      document.getElementById(id).value = item[config.names[i]] || "";
    });

    const button = config.form.querySelector("button");
    if (button) button.textContent = "बदल जतन करा";

    if (!config.form.querySelector(".cancel-edit")) {
      const cancel = document.createElement("button");
      cancel.type = "button";
      cancel.className = "btn secondary cancel-edit";
      cancel.textContent = "रद्द करा";
      cancel.addEventListener("click", () => finishEdit(k));
      config.form.querySelector(".admin-actions").appendChild(cancel);
    }

    config.form.scrollIntoView({ behavior: "smooth", block: "center" });
    msg("माहिती बदला आणि 'बदल जतन करा' क्लिक करा.");
  }

  // सूचना, सेवा आणि शाखा Add / Update
  keys.forEach(k => {
    const config = forms[k];

    config.form.addEventListener("submit", e => {
      e.preventDefault();

      const item = {};
      config.fields.forEach((id, i) => {
        item[config.names[i]] =
          document.getElementById(id).value.trim();
      });

      if (!item.title) return;

      const items = get(k);

      if (editing[k] !== null) {
        items[editing[k]] = item;
        set(k, items);
        finishEdit(k);
        msg("माहिती यशस्वीपणे अपडेट झाली.");
      } else {
        items.unshift(item);
        set(k, items);
        config.form.reset();
        msg("नवीन माहिती जोडली गेली.");
      }

      refresh();
    });
  });

  // Update आणि Delete बटणे
  document.addEventListener("click", e => {
    const editButton = e.target.closest("[data-edit]");

    if (editButton) {
      startEdit(
        editButton.dataset.edit,
        Number(editButton.dataset.index)
      );
      return;
    }

    const deleteButton = e.target.closest("[data-delete]");
    if (!deleteButton) return;

    const k = deleteButton.dataset.delete;
    const index = Number(deleteButton.dataset.index);

    if (!confirm("ही नोंद कायमची काढून टाकायची आहे का?")) return;

    const items = get(k);
    items.splice(index, 1);
    set(k, items);

    if (editing[k] === index) {
      finishEdit(k);
    }

    refresh();
    msg("नोंद काढून टाकली.");
  });

  // Tabs
  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(x =>
        x.classList.remove("active")
      );

      document.querySelectorAll(".admin-panel").forEach(x =>
        x.classList.remove("active")
      );

      button.classList.add("active");
      document.getElementById(
        "panel-" + button.dataset.tab
      ).classList.add("active");
    });
  });

  // Backup Download
  document.getElementById("export-btn").addEventListener("click", () => {
    const data = {};
    keys.forEach(k => data[k] = get(k));

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = "patsanstha-backup.json";
    a.click();
    URL.revokeObjectURL(url);

    msg("बॅकअप डाउनलोड सुरू झाला.");
  });

  // Backup Import
  document.getElementById("import-file").addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = JSON.parse(await file.text());

      keys.forEach(k => {
        if (Array.isArray(data[k])) set(k, data[k]);
      });

      refresh();
      msg("बॅकअप आयात केला.");
    } catch (error) {
      msg("योग्य JSON बॅकअप फाईल निवडा.");
    }

    e.target.value = "";
  });

  // Reset to original demo data
  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("मूळ सहा सेवा आणि मुख्य कार्यालयाची माहिती पुन्हा आणायची?")) return;

    keys.forEach(k => set(k, defaults[k]));
    keys.forEach(finishEdit);
    refresh();
    msg("मूळ माहिती पुन्हा आणली.");
  });

  refresh();
})();
