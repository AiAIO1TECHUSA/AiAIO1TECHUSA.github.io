"use strict";

// --- DATA ---
const standards2027 = [
  {
    id: "mental-state",
    category: "Capital Sentencing",
    title: "Mental-state and diminished-culpability review",
    status: "Review required",
    authority: "Eighth Amendment; Lockett v. Ohio; Eddings v. Oklahoma",
    summary: "Review whether evidence of severe mental illness, psychosis, impaired judgment, or diminished capacity was meaningfully considered.",
    questions: [
      "Was the evidence presented to the sentencing authority?",
      "Was expert mental-health testimony obtained?",
      "Was mitigating evidence individually considered?",
      "Was the evidence documented in the sentencing record?"
    ],
    source: ""
  },
  {
    id: "intellectual-disability",
    category: "Capital Sentencing",
    title: "Intellectual-disability analysis",
    status: "Authority dependent",
    authority: "Atkins v. Virginia",
    summary: "Determine whether the record contains evidence relevant to intellectual disability and whether the applicable jurisdictional standard was followed.",
    questions: [
      "Was an assessment conducted by a qualified professional?",
      "Were adaptive-functioning limitations evaluated?",
      "Was the onset requirement addressed?",
      "Did the court apply the controlling jurisdictional test?"
    ],
    source: ""
  },
  {
    id: "disclosure",
    category: "Disclosure",
    title: "Disclosure and preservation of favorable evidence",
    status: "Review required",
    authority: "Brady v. Maryland; Giglio v. United States",
    summary: "Review whether favorable evidence, impeachment material, and relevant expert or law-enforcement information were disclosed and preserved.",
    questions: [
      "Was favorable evidence identified?",
      "Was impeachment evidence disclosed?",
      "Were disclosure decisions documented?",
      "Was the evidence available in time for meaningful use?"
    ],
    source: ""
  },
  {
    id: "expert-review",
    category: "Expert Evidence",
    title: "Independent expert review",
    status: "Recommended",
    authority: "Applicable procedural and evidentiary rules",
    summary: "Confirm that mental-health, medical, forensic, and pharmacological opinions were independently evaluated.",
    questions: [
      "Was the expert qualified for the specific opinion?",
      "Were the underlying records complete?",
      "Were competing opinions addressed?",
      "Were limitations and uncertainty disclosed?"
    ],
    source: ""
  },
  {
    id: "execution-reliability",
    category: "Execution Protocol",
    title: "Execution-protocol reliability review",
    status: "Jurisdiction dependent",
    authority: "Applicable state and federal law",
    summary: "Evaluate whether the proposed execution method, protocol, personnel, and contingency procedures satisfy the controlling legal standards.",
    questions: [
      "Was the current protocol obtained?",
      "Were medical risks independently assessed?",
      "Were contingency procedures disclosed?",
      "Were constitutional objections preserved?"
    ],
    source: ""
  }
];

const state = {
  query: "",
  category: "All",
  openItems: new Set()
};

// --- UTILS ---
function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getCategories() {
  return ["All", ...new Set(standards2027.map(item => item.category))];
}

function filteredStandards() {
  const query = state.query.trim().toLowerCase();
  return standards2027.filter(item => {
    const matchesCategory = state.category === "All" || item.category === state.category;
    const searchableText = [
      item.title, item.category, item.status, item.authority, item.summary, ...item.questions
    ].join(" ").toLowerCase();
    return matchesCategory && (!query || searchableText.includes(query));
  });
}

// --- UI COMPONENTS ---
function standardCard(item) {
  const isOpen = state.openItems.has(item.id);
  const questions = item.questions.map(q => `<li>${escapeHTML(q)}</li>`).join("");

  return `
    <article class="standard-card ${isOpen ? "is-open" : ""}">
      <button class="standard-card-header" type="button" data-action="toggle" data-id="${escapeHTML(item.id)}" aria-expanded="${isOpen}" aria-controls="details-${escapeHTML(item.id)}">
        <span><small>${escapeHTML(item.category)}</small> <strong>${escapeHTML(item.title)}</strong></span>
        <span class="standard-status">${escapeHTML(item.status)}</span>
      </button>
      <div id="details-${escapeHTML(item.id)}" class="standard-card-details" ${isOpen ? "" : "hidden"}>
        <p>${escapeHTML(item.summary)}</p>
        <p><strong>Authority:</strong> ${escapeHTML(item.authority)}</p>
        <h4>Review questions</h4>
        <ul>${questions}</ul>
        ${item.source ? `<p><a href="${escapeHTML(item.source)}" target="_blank" rel="noopener">Open source</a></p>` : `<p class="source-placeholder">Add a verified primary source before publication.</p>`}
        <button class="copy-standard" type="button" data-action="copy" data-id="${escapeHTML(item.id)}">Copy standard</button>
      </div>
    </article>`;
}

function render() {
  const root = document.querySelector("#standards-2027");
  if (!root) {
    console.warn('standards-2027.js: Add <div id="standards-2027"></div> to the HTML.');
    return;
  }

  const results = filteredStandards();

  root.innerHTML = `
    <section class="standards-panel" aria-labelledby="standards-2027-title">
      <div class="standards-heading">
        <div>
          <p class="eyebrow">Interactive review tool</p>
          <h2 id="standards-2027-title">2027 Standards Review</h2>
          <p>Use this tool to identify issues requiring legal, factual, medical, or procedural verification.</p>
        </div>
        <span class="standards-date">Updated ${new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date())}</span>
      </div>
      <div class="standards-controls">
        <label for="standards-search">Search standards</label>
        <input id="standards-search" type="search" placeholder="Search by topic, authority, or question" value="${escapeHTML(state.query)}"/>
        <label for="standards-category">Category</label>
        <select id="standards-category">
          ${getCategories().map(cat => `<option value="${escapeHTML(cat)}" ${state.category === cat ? "selected" : ""}>${escapeHTML(cat)}</option>`).join("")}
        </select>
      </div>
      <p class="standards-count" aria-live="polite">Showing ${results.length} of ${standards2027.length} standards</p>
      <div class="standards-list">
        ${results.length ? results.map(standardCard).join("") : `<p class="no-results">No matching standards found.</p>`}
      </div>
    </section>`;

  attachEvents(root);
}

function attachEvents(root) {
  root.querySelector("#standards-search")?.addEventListener("input", event => {
    state.query = event.target.value;
    render();
    const input = document.querySelector("#standards-search");
    input?.focus();
    input?.setSelectionRange(state.query.length, state.query.length);
  });

  root.querySelector("#standards-category")?.addEventListener("change", event => {
    state.category = event.target.value;
    render();
  });

  root.querySelectorAll('[data-action="toggle"]').forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.id;
      state.openItems.has(id) ? state.openItems.delete(id) : state.openItems.add(id);
      render();
    });
  });

  root.querySelectorAll('[data-action="copy"]').forEach(button => {
    button.addEventListener("click", async () => {
      const item = standards2027.find(s => s.id === button.dataset.id);
      if (!item) return;
      const text = [
        item.title,
        `Category: ${item.category}`,
        `Status: ${item.status}`,
        `Authority: ${item.authority}`,
        item.summary,
        "Review questions:",
        ...item.questions.map(q => `- ${q}`)
      ].join("\n");
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = "Copy standard"; }, 1500);
      } catch {
        button.textContent = "Copy unavailable";
      }
    });
  });
}

// --- GLOBAL FEATURES ---
function initializeFocusMode() {
  const focusButton = document.querySelector("#focusModeButton");
  if (!focusButton) return;
  focusButton.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("focus-mode");
    focusButton.setAttribute("aria-pressed", String(enabled));
    focusButton.textContent = enabled ? "Exit focus mode" : "Focus mode";
  });
}

function initializeDocumentSearch() {
  const searchBox = document.querySelector("#memoSearch");
  const searchButton = document.querySelector("#searchButton");
  const searchStatus = document.querySelector("#searchStatus");
  const documentRoot = document.querySelector("#memoDocument") || document.body;

  if (!searchBox) {
    console.warn("Document search input #memoSearch was not found.");
    return;
  }

  function setStatus(message) {
    if (searchStatus) searchStatus.textContent = message;
  }

  function clearHighlights() {
    documentRoot.querySelectorAll("mark.search-highlight").forEach(mark => {
      mark.replaceWith(document.createTextNode(mark.textContent || ""));
    });
  }

  function isExcluded(node) {
    const parent = node.parentElement;
    return !parent || Boolean(parent.closest("script, style, noscript, textarea, input, select, option, mark.search-highlight"));
  }

  function runSearch() {
    const query = searchBox.value.trim();
    clearHighlights();

    if (query.length < 2) {
      setStatus(query ? "Enter at least 2 characters." : "Ready");
      return;
    }

    const normalizedQuery = query.toLocaleLowerCase();
    const walker = document.createTreeWalker(documentRoot, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isExcluded(node)) return NodeFilter.FILTER_REJECT;
        return node.nodeValue.toLocaleLowerCase().includes(normalizedQuery)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const matchingNodes = [];
    let node;
    while ((node = walker.nextNode())) matchingNodes.push(node);

    let firstHighlight = null;
    let matchCount = 0;

    matchingNodes.forEach(textNode => {
      const text = textNode.nodeValue;
      const lowerText = text.toLocaleLowerCase();
      const fragment = document.createDocumentFragment();
      let position = 0;
      let matchIndex;

      while ((matchIndex = lowerText.indexOf(normalizedQuery, position)) !== -1) {
        fragment.appendChild(document.createTextNode(text.slice(position, matchIndex)));
        const mark = document.createElement("mark");
        mark.className = "search-highlight";
        mark.textContent = text.slice(matchIndex, matchIndex + query.length);
        fragment.appendChild(mark);
        if (!firstHighlight) firstHighlight = mark;
        matchCount += 1;
        position = matchIndex + query.length;
      }

      fragment.appendChild(document.createTextNode(text.slice(position)));
      textNode.parentNode.replaceChild(fragment, textNode);
    });

    setStatus(`${matchCount} ${matchCount === 1 ? "match" : "matches"} found.`);
    if (firstHighlight) firstHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Do not search on every keystroke. Searching on each input event causes
  // the page to scroll to partial values such as "ju" or "ju" before the
  // user has finished typing "jury instructions" or "judgement".
  searchButton?.addEventListener("click", runSearch);
  searchBox.addEventListener("search", runSearch);
  searchBox.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      runSearch();
    }
  });
}

// --- START APP ---
document.addEventListener("DOMContentLoaded", () => {
  render();
  initializeFocusMode();
  initializeDocumentSearch();
});
