(function () {
  const survey = window.SURVEY;
  const DRAFT_KEY = "sirens-2026-survey-draft";
  const HINTS = {
    single: "Choose one.",
    multi: "Select all that apply.",
    grid: "Choose one for each.",
    text: "Optional.",
  };

  const answers = loadDraft();

  const form = document.getElementById("survey");
  const done = document.getElementById("done");
  const submitError = document.getElementById("submit-error");

  document.getElementById("title").textContent = survey.title;
  document.title = survey.title;
  document.getElementById("intro").innerHTML = survey.intro.map((p) => `<p>${p}</p>`).join("");

  // ---- Rendering ----------------------------------------------------------

  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (v === true) node.setAttribute(k, "");
      else if (v !== false && v != null) node.setAttribute(k, v);
    }
    node.append(...children.filter(Boolean));
    return node;
  };

  const sectionNodes = [];
  const questionNodes = [];

  survey.sections.forEach((section) => {
    const node = el(
      "section",
      { class: "section", "aria-labelledby": `sec-${section.id}` },
      el(
        "header",
        { class: "section-head" },
        el("h2", { id: `sec-${section.id}`, text: section.title })
      )
    );
    section.questions.forEach((q) => {
      const qNode = renderQuestion(q);
      node.append(qNode);
      questionNodes.push({ q, node: qNode, section });
    });
    form.insertBefore(node, form.querySelector(".submit-row"));
    sectionNodes.push({ section, node });
  });

  function renderQuestion(q) {
    const legend = el(
      "legend",
      { class: "q-label" },
      el("span", { class: "q-num", "aria-hidden": "true" }),
      el("span", { text: q.label })
    );
    const hint = el(
      "p",
      { class: "q-hint", id: `hint-${q.id}` },
      HINTS[q.type],
      q.required && el("span", { class: "q-required", text: "* Required" })
    );
    const field = el(
      "fieldset",
      { class: `question q-${q.type}`, id: `q-${q.id}`, "aria-describedby": hint.id },
      legend,
      hint
    );

    if (q.type === "single") field.append(choiceList(q, "radio"));
    if (q.type === "multi") field.append(choiceList(q, "checkbox"));
    if (q.type === "text") field.append(textArea(q.id, q.label));
    if (q.type === "grid") field.append(grid(q));
    if (q.required) field.append(el("p", { class: "q-error", id: `err-${q.id}`, role: "alert" }));
    return field;
  }

  function choiceList(q, kind) {
    const list = el("div", { class: "choices" });
    q.options.forEach((opt, i) => {
      const id = `${q.id}-${i}`;
      const checked = kind === "radio" ? answers[q.id] === opt : (answers[q.id] || []).includes(opt);
      const input = el("input", { type: kind, id, name: q.id, value: opt, checked });
      input.addEventListener("change", () => onChoice(q, kind, opt, input.checked));
      list.append(el("label", { class: "choice", for: id }, input, el("span", { text: opt })));
    });
    if (q.other) {
      const id = `${q.id}-other`;
      const otherText = answers[`${q.id}_other`] || "";
      const input = el("input", { type: "checkbox", id, name: q.id, value: "__other", checked: !!otherText });
      const text = el("input", {
        type: "text",
        class: "other-text",
        "aria-label": `${q.label} — other`,
        placeholder: "Other (please specify)",
        value: otherText,
      });
      input.addEventListener("change", () => {
        if (input.checked) text.focus();
        else {
          text.value = "";
          setAnswer(`${q.id}_other`, "");
        }
      });
      text.addEventListener("input", () => {
        input.checked = text.value.trim() !== "";
        setAnswer(`${q.id}_other`, text.value);
      });
      list.append(el("label", { class: "choice choice-other", for: id }, input, text));
    }
    return list;
  }

  function onChoice(q, kind, opt, checked) {
    if (kind === "radio") return setAnswer(q.id, opt);

    let selected = new Set(answers[q.id] || []);
    if (checked) {
      // "None"-style options can't be combined with anything else.
      const exclusive = q.exclusive || [];
      if (exclusive.includes(opt)) selected = new Set();
      else exclusive.forEach((x) => selected.delete(x));
      selected.add(opt);
    } else {
      selected.delete(opt);
    }
    form.querySelectorAll(`input[name="${q.id}"]`).forEach((box) => {
      if (box.value !== "__other") box.checked = selected.has(box.value);
    });
    setAnswer(q.id, q.options.filter((o) => selected.has(o)));
  }

  function textArea(key, label) {
    const area = el("textarea", { rows: 4, "aria-label": label });
    area.value = answers[key] || "";
    area.addEventListener("input", () => setAnswer(key, area.value));
    return area;
  }

  function grid(q) {
    const current = answers[q.id] || {};
    const table = el("table", { class: "grid" });
    table.append(
      el(
        "thead",
        {},
        el("tr", {}, el("th", { scope: "col" }), ...q.options.map((o) => el("th", { scope: "col", text: o })))
      )
    );
    const body = el("tbody");
    q.items.forEach((item, r) => {
      const name = `${q.id}-r${r}`;
      const row = el("tr", {}, el("th", { scope: "row", text: item }));
      q.options.forEach((opt) => {
        const input = el("input", {
          type: "radio",
          name,
          value: opt,
          checked: current[item] === opt,
          "aria-label": `${item}: ${opt}`,
        });
        input.addEventListener("change", () =>
          setAnswer(q.id, { ...(answers[q.id] || {}), [item]: opt })
        );
        // .grid-opt is only shown on narrow screens, where the header row is hidden.
        row.append(el("td", {}, el("label", {}, input, el("span", { class: "grid-opt", text: opt }))));
      });
      body.append(row);
    });
    table.append(body);
    return table;
  }

  // ---- State ----------------------------------------------------------------

  function setAnswer(key, value) {
    answers[key] = value;
    saveDraft();
    updateVisibility();
    updateProgress();
    // Once a question has been flagged, clear the flag as soon as it's answered.
    questionNodes.forEach((entry) => {
      if (entry.node.classList.contains("invalid")) checkRequired(entry);
    });
  }

  function checkRequired({ q, node }) {
    const ok = isAnswered(q);
    node.classList.toggle("invalid", !ok);
    node.querySelector(".q-error").textContent = ok ? "" : "Please answer this question.";
    return ok;
  }

  function isVisible(q, section) {
    if (section.showIf && !section.showIf(answers)) return false;
    if (q.showIf && !q.showIf(answers)) return false;
    return true;
  }

  function updateVisibility() {
    sectionNodes.forEach(({ section, node }) => {
      node.hidden = !!section.showIf && !section.showIf(answers);
    });
    questionNodes.forEach(({ q, node, section }) => {
      node.hidden = !isVisible(q, section);
    });
  }

  function isAnswered(q) {
    const v = answers[q.id];
    if (q.type === "multi") return (v && v.length > 0) || !!(answers[`${q.id}_other`] || "").trim();
    if (q.type === "grid") return v && Object.keys(v).length > 0;
    return typeof v === "string" && v.trim() !== "";
  }

  function updateProgress() {
    const visible = questionNodes.filter(({ q, section }) => isVisible(q, section));
    const answered = visible.filter(({ q }) => isAnswered(q)).length;
    const pct = visible.length ? Math.round((answered / visible.length) * 100) : 0;
    document.getElementById("progress-bar").style.width = `${pct}%`;
    document.getElementById("progress-text").textContent = `${answered} of ${visible.length} answered`;
  }

  function loadDraft() {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveDraft() {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    } catch {}
  }

  function clearDraft() {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {}
  }

  // ---- Submit ---------------------------------------------------------------

  function buildResponse() {
    const out = {};
    questionNodes.forEach(({ q, section }) => {
      if (!isVisible(q, section) || !isAnswered(q)) return;
      out[q.id] = typeof answers[q.id] === "string" ? answers[q.id].trim() : answers[q.id] ?? [];
      const other = (answers[`${q.id}_other`] || "").trim();
      if (q.other && other) out[`${q.id}_other`] = other;
    });
    return { survey: "sirens-2026", submittedAt: new Date().toISOString(), answers: out };
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let firstInvalid = null;
    questionNodes.forEach((entry) => {
      const { q, node, section } = entry;
      if (!q.required || !isVisible(q, section)) return;
      if (!checkRequired(entry) && !firstInvalid) firstInvalid = node;
    });
    submitError.textContent = firstInvalid ? "Please answer the required questions above." : "";
    if (firstInvalid) {
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      firstInvalid.querySelector("input")?.focus({ preventScroll: true });
      return;
    }

    const response = buildResponse();
    // No backend yet: the response is logged and shown so it can be collected manually.
    console.log("Survey response", response);
    clearDraft();

    const json = JSON.stringify(response, null, 2);
    document.getElementById("response-json").textContent = json;
    document.getElementById("download").href = URL.createObjectURL(
      new Blob([json], { type: "application/json" })
    );
    form.hidden = true;
    document.querySelector(".progress").hidden = true;
    done.hidden = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    done.focus();
  });

  document.getElementById("copy").addEventListener("click", async (e) => {
    try {
      await navigator.clipboard.writeText(document.getElementById("response-json").textContent);
      e.target.textContent = "Copied";
    } catch {
      e.target.textContent = "Copy failed";
    }
  });

  updateVisibility();
  updateProgress();
})();
