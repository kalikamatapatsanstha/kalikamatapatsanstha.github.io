(function () {
  const keys = ["notices", "services", "branches"];

  const defaults = {
    notices: [],
    services: [
      {
        title: "बचत ठेव योजना",
        body: "नियमित बचतीसाठी बचत ठेव सुविधा. खाते उघडण्याच्या अटी कार्यालयात जाणून घ्या."
      },
      {
        title: "मुदत ठेव योजना",
        body: "निश्चित कालावधीसाठी रक्कम ठेवण्याची सुविधा. लागू कालावधी व व्याजदर संस्थेकडून तपासा."
      },
      {
        title: "आवर्ती ठेव योजना",
        body: "ठराविक अंतराने नियमित रक्कम जमा करून बचत करण्याची सुविधा."
      },
      {
        title: "दैनिक ठेव योजना",
        body: "योजनेच्या नियमानुसार दररोज किंवा ठरलेल्या वेळापत्रकानुसार बचत जमा करण्याची सुविधा."
      },
      {
        title: "कर्ज सुविधा",
        body: "सभासदांची पात्रता, आवश्यक कागदपत्रे आणि संस्थेच्या मंजुरीनुसार कर्ज सुविधा."
      },
      {
        title: "दैनिक संकलन सेवा",
        body: "संस्थेच्या अधिकृत प्रतिनिधीमार्फत सभासदांकडून दैनिक जमा रक्कम संकलित करण्याची सेवा."
      }
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
      return JSON.parse(
        localStorage.getItem("patsanstha_" + k) || "[]"
      );
    } catch (e) {
      return [];
    }
  };

  const set = (k, v) =>
    localStorage.setItem("patsanstha_" + k, JSON.stringify(v));

  // प्रथमच उघडताना आधीच्या वेबसाइटवरील माहिती भरा.
  keys.forEach(k => {
    if (localStorage.getItem("patsanstha_" + k) === null) {
      set(k, defaults[k]);
    }
  });

  const status = document.getElementById("status");
  const msg = t => status.textContent = t;

  const esc = s =>
    String(s ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));

  document.querySelectorAll("[data-tab]").forEach(b => {
    b.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(x =>
        x.classList.remove("active")
      );
      document.querySelectorAll(".admin-panel").forEach(x =>
        x.classList.remove("active")
      );
      b.classList.add("active");
      document.getElementById("panel-" + b.dataset.tab)
        .classList.add("active");
    });
  });

  function render(k) {
    const list = document.getElementById(
      k.slice(0, -1) + "-list"
    );
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
            <button type="button" data-edit="${k}" data-index="${i}">
              बदला
            </button>
            <button type="button" data-delete="${k}" data-index="${i}">
              काढून टाका
            </button>
          </div>
        </div>
      `).join("")
      : '<p class="muted">अद्याप कोणतीही नोंद नाही.</p>';
  }

  function refresh() {
    keys.forEach(render);
  }

  document.getElementById("notice-form").addEventListener("submit", e => {
    e.preventDefault();
    const a = get("notices");
    a.unshift({
      title: document.getElementById("notice-title").value.trim(),
      body: document.getElementById("notice-body").value.trim()
    });
    set("notices", a);
    e.target.reset();
    refresh();
    msg("सूचना स्थानिक ब्राउझरमध्ये जतन झाली.");
  });

  document.getElementById("service-form").addEventListener("submit", e => {
    e.preventDefault();
    const a = get("services");
    a.unshift({
      title: document.getElementById("service-title").value.trim(),
      body: document.getElementById("service-body").value.trim()
    });
    set("services", a);
    e.target.reset();
    refresh();
    msg("सेवा स्थानिक ब्राउझरमध्ये जतन झाली.");
  });

  document.getElementById("branch-form").addEventListener("submit", e => {
    e.preventDefault();
    const a = get("branches");
    a.unshift({
      title: document.getElementById("branch-title").value.trim(),
      address: document.getElementById("branch-address").value.trim(),
      phone: document.getElementById("branch-phone").value.trim()
    });
    set("branches", a);
    e.target.reset();
    refresh();
    msg("शाखेची माहिती स्थानिक ब्राउझरमध्ये जतन झाली.");
  });

  document.addEventListener("click", e => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-delete]");

    if (edit) {
      const k = edit.dataset.edit;
      const i = Number(edit.dataset.index);
      const a = get(k);
      const x = a[i];

      const title = prompt("नाव बदला:", x.title);
      if (title === null) return;

      const field = k === "branches" ? "address" : "body";
      const value = prompt(
        k === "branches" ? "पत्ता बदला:" : "वर्णन बदला:",
        x[field] || ""
      );
      if (value === null) return;

      x.title = title.trim();
      x[field] = value.trim();

      if (k === "branches") {
        const phone = prompt("मोबाईल क्रमांक बदला:", x.phone || "");
        if (phone === null) return;
        x.phone = phone.trim();
      }

      a[i] = x;
      set(k, a);
      refresh();
      msg("बदल स्थानिक ब्राउझरमध्ये जतन झाले.");
      return;
    }

    if (del) {
      const k = del.dataset.delete;
      const a = get(k);
      const i = Number(del.dataset.index);

      if (confirm("ही नोंद काढून टाकायची आहे का?")) {
        a.splice(i, 1);
        set(k, a);
        refresh();
        msg("नोंद काढून टाकली.");
      }
    }
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    const data = {};
    keys.forEach(k => data[k] = get(k));

    const blob = new Blob(
      [JSON.stringify(data, null, 2)],
      { type: "application/json" }
    );

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "patsanstha-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
    msg("बॅकअप डाउनलोड सुरू झाला.");
  });

  document.getElementById("import-file").addEventListener("change", async e => {
    const f = e.target.files[0];
    if (!f) return;

    try {
      const d = JSON.parse(await f.text());
      keys.forEach(k => {
        if (Array.isArray(d[k])) set(k, d[k]);
      });
      refresh();
      msg("बॅकअप आयात केला.");
    } catch (err) {
      msg("योग्य JSON बॅकअप निवडा.");
    }
    e.target.value = "";
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (confirm("स्थानिक सूचना, सेवा आणि शाखांची नोंद रिकामी करायची?")) {
      keys.forEach(k => set(k, []));
      refresh();
      msg("स्थानिक व्यवस्थापन डेटा रिकामा केला.");
    }
  });

  refresh();
})();
