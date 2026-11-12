(function () {
  const survey = window.SURVEY;
  // Each survey version has its own id, so drafts and sheet tabs don't mix.
  const SURVEY_ID = survey.id || "sirens-2026";
  const DRAFT_KEY = `${SURVEY_ID}-survey-draft`;
  const OTHER = "Other";
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
  document.getElementById("intro").innerHTML = introParagraphs().map((p) => `<p>${p}</p>`).join("");

  // Adds the closing date (from `closesAt`) as the last intro paragraph.
  function introParagraphs() {
    const paras = [...survey.intro];
    const closesAt = survey.closesAt && new Date(survey.closesAt);
    if (!closesAt || isNaN(closesAt)) return paras;
    const when = closesAt.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    paras.push(`<strong>The survey closes ${when} Pacific.</strong>`);
    return paras;
  }

  // ---- Closing ------------------------------------------------------------

  const CLOSED_ERROR = "Survey closed.";

  function isClosed() {
    if (new URLSearchParams(location.search).has("closed")) return true;
    if (!survey.closesAt) return false;
    const closesAt = new Date(survey.closesAt);
    return !isNaN(closesAt) && Date.now() >= closesAt.getTime();
  }

  function showClosed() {
    const closed = document.getElementById("closed");
    document.getElementById("closed-message").innerHTML = (survey.closedMessage || [])
      .map((p) => `<p>${p}</p>`)
      .join("");
    form.hidden = true;
    done.hidden = true;
    document.getElementById("intro").hidden = true;
    document.querySelector(".progress").hidden = true;
    closed.hidden = false;
    window.scrollTo({ top: 0 });
    closed.focus();
  }

  if (isClosed()) {
    showClosed();
    return;
  }

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

  // Shown instead of the rest of the survey when the gate question rules someone out.
  const gateMessage = survey.gate
    ? el("div", { class: "done gate-message", role: "status", hidden: true })
    : null;
  if (gateMessage) {
    gateMessage.innerHTML = survey.gate.message.map((p) => `<p>${p}</p>`).join("");
    form.insertBefore(gateMessage, form.querySelector(".submit-row"));
  }

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
      // A required text question shouldn't also say "Optional."
      q.type === "text" && q.required ? "" : q.max ? `Select up to ${q.max}.` : HINTS[q.type],
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
    if (q.type === "text") field.append(textArea(q.id, q.label, q.rows));
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
      list.append(el("label", { class: "choice", for: id }, input, choiceText(opt)));
    });
    if (q.other) {
      const id = `${q.id}-other`;
      const otherText = answers[`${q.id}_other`] || "";
      // Single-choice questions store "Other" as the answer; multi-choice ones only keep the text.
      const checked = kind === "radio" ? answers[q.id] === OTHER : !!otherText;
      const input = el("input", { type: kind, id, name: q.id, value: "__other", checked });
      const text = el("input", {
        type: "text",
        class: "other-text",
        "aria-label": `${q.label} — other`,
        placeholder: "Other (please specify)",
        value: otherText,
      });
      input.addEventListener("change", () => {
        if (kind === "radio") setAnswer(q.id, OTHER);
        if (input.checked) text.focus();
        else {
          text.value = "";
          setAnswer(`${q.id}_other`, "");
        }
      });
      text.addEventListener("input", () => {
        if (kind === "radio") {
          input.checked = true;
          answers[q.id] = OTHER;
        } else {
          input.checked = text.value.trim() !== "";
        }
        setAnswer(`${q.id}_other`, text.value);
      });
      list.append(el("label", { class: "choice choice-other", for: id }, input, text));
    }
    return list;
  }

  // Shows parentheticals such as section numbers in a softer color.
  function choiceText(opt) {
    const span = el("span");
    opt.split(/(\([^)]*\))/).forEach((part) => {
      if (!part) return;
      span.append(part.startsWith("(") ? el("span", { class: "choice-meta", text: part }) : part);
    });
    return span;
  }

  function onChoice(q, kind, opt, checked) {
    if (kind === "radio") {
      if (q.other) {
        form.querySelector(`#${q.id}-other`).parentNode.querySelector(".other-text").value = "";
        answers[`${q.id}_other`] = "";
      }
      return setAnswer(q.id, opt);
    }

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

  // For multi questions with `max`: once that many are picked (a filled-in "Other"
  // counts as one), the unchecked options are disabled until one is cleared.
  function applyMax({ q, node }) {
    if (q.type !== "multi" || !q.max) return;
    const count =
      (answers[q.id] || []).length + ((answers[`${q.id}_other`] || "").trim() ? 1 : 0);
    node.querySelectorAll(`input[name="${q.id}"]`).forEach((box) => {
      box.disabled = !box.checked && count >= q.max;
      if (box.value === "__other") {
        box.parentNode.querySelector(".other-text").disabled = box.disabled;
      }
    });
  }

  function textArea(key, label, rows = 4) {
    const area = el("textarea", { rows, "aria-label": label });
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
    questionNodes.forEach(applyMax);
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

  // With a `gate`, only the gate question shows until it has an allowed answer.
  function gateOpen() {
    return !survey.gate || survey.gate.allow.includes(answers[survey.gate.question]);
  }

  function gateClosed() {
    return !!survey.gate && !!answers[survey.gate.question] && !gateOpen();
  }

  function isVisible(q, section) {
    if (survey.gate && q.id !== survey.gate.question && !gateOpen()) return false;
    if (section.showIf && !section.showIf(answers)) return false;
    if (q.showIf && !q.showIf(answers)) return false;
    return true;
  }

  function updateVisibility() {
    sectionNodes.forEach(({ section, node }) => {
      node.hidden = !section.questions.some((q) => isVisible(q, section));
    });
    questionNodes.forEach(({ q, node, section }) => {
      node.hidden = !isVisible(q, section);
    });
    if (gateMessage) gateMessage.hidden = !gateClosed();
    form.querySelector(".submit-row").hidden = !gateOpen();
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
    return { survey: SURVEY_ID, submittedAt: new Date().toISOString(), answers: out };
  }

  // Flattens a response into spreadsheet columns. `columns` covers every question in
  // survey order (answered or not) so the sheet's header row stays stable.
  function toSheetRow(response) {
    const columns = [];
    const row = {};
    const header = (q, suffix) => `${q.id}. ${q.label}${suffix ? ` — ${suffix}` : ""}`;
    questionNodes.forEach(({ q }) => {
      const value = response.answers[q.id];
      if (q.type === "grid") {
        q.items.forEach((item) => {
          const h = header(q, item);
          columns.push(h);
          if (value && value[item]) row[h] = value[item];
        });
      } else {
        const h = header(q);
        columns.push(h);
        if (value != null) row[h] = Array.isArray(value) ? value.join("; ") : value;
      }
      if (q.other) {
        const h = header(q, "Other");
        columns.push(h);
        if (response.answers[`${q.id}_other`]) row[h] = response.answers[`${q.id}_other`];
      }
    });
    return { ...response, columns, row };
  }

  async function send(response) {
    const res = await fetch(survey.endpoint, {
      method: "POST",
      // text/plain keeps this a "simple" request, so Apps Script doesn't need to answer a CORS preflight.
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(toSheetRow(response)),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || "Submission failed");
  }

  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    // The page may have been left open past the closing time.
    if (isClosed()) return showClosed();
    if (!gateOpen()) return;
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

    if (survey.endpoint) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting…";
      try {
        await send(response);
      } catch (err) {
        if (err.message === CLOSED_ERROR) return showClosed();
        console.error("Survey submission failed", err);
        submitError.textContent =
          "Sorry, we couldn't submit your response. Your answers are saved in this browser — please try again in a moment.";
        submitButton.disabled = false;
        submitButton.textContent = "Submit survey";
        return;
      }
      document.getElementById("done-local").hidden = true;
    } else {
      // No backend configured: show the response so it can be collected manually.
      console.log("Survey response", response);
      const json = JSON.stringify(response, null, 2);
      document.getElementById("response-json").textContent = json;
      document.getElementById("download").href = URL.createObjectURL(
        new Blob([json], { type: "application/json" })
      );
      document.getElementById("done-sent").hidden = true;
    }
    clearDraft();

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
  questionNodes.forEach(applyMax);
})();
