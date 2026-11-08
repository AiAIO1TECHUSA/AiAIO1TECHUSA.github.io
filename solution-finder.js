// solution-finder.js
// Sales routing agent: keyword and combination-based matching with no external API.

const BOOKING_URL = "https://calendly.com/patlucero2026/30min";

const MIN_SCORE = 2;
const CLOSE_RATIO = 0.6;
const COMBINED_MIN = 3;

const STOP = new Set([
    "a", "an", "and", "the", "of", "for", "to", "in", "on", "at", "is", "are",
    "my", "our", "your", "i", "we", "you", "it", "this", "that", "with", "need",
    "want", "help", "please", "can", "do", "does", "how", "what", "about", "some"
]);

const SYNONYMS = {
    site: "website", webpage: "website", web: "website", page: "website",
    speed: "performance", slow: "performance", fast: "performance", loading: "performance",
    mobile: "responsive", phone: "responsive", tablet: "responsive", responsiveness: "responsive",
    seo: "search", google: "search", ranking: "search",
    html: "markup", html5: "markup", javascript: "markup", js: "markup",
    secure: "security", hack: "security", hacked: "security", malware: "security", virus: "security",
    backups: "backup", backing: "backup", restore: "recovery",
    pc: "workstation", laptop: "workstation", computer: "workstation", desktop: "workstation",
    network: "network", wifi: "network", router: "network", cloud: "cloud",
    windows: "workstation", os: "workstation",
    update: "upgrade", upgrading: "upgrade",
    install: "setup", installation: "setup"
};

const SOLUTIONS = [
    {
        id: "website-upgrade",
        title: "Website Upgrade: Responsive, HTML5 & JavaScript",
        summary: "Modernize your site so it loads fast, works on phones, and ranks better.",
        details: "Semantic HTML5 markup, responsive layouts, Core Web Vitals tuning, structured data, and clean JavaScript.",
        keywords: ["website", "responsive", "performance", "markup", "search", "mobile"],
        paths: [
            { needs: ["website", "upgrade"], weight: 4 },
            { needs: ["website", "performance"], weight: 3 },
            { needs: ["responsive", "markup"], weight: 3 },
            { needs: ["website", "search"], weight: 3 }
        ]
    },
    {
        id: "managed-security",
        title: "Managed Security",
        summary: "Ongoing protection against threats, intrusions, and data exposure.",
        details: "Monitoring, patching, HTTPS and header hardening, endpoint protection, and incident response.",
        keywords: ["security", "malware", "threat", "firewall", "monitoring", "patch"],
        paths: [
            { needs: ["security", "website"], weight: 3 },
            { needs: ["security", "network"], weight: 3 },
            { needs: ["security", "monitoring"], weight: 3 }
        ]
    },
    {
        id: "cloud-backup",
        title: "Cloud Backup & Recovery",
        summary: "Automated backups and tested recovery so you can bounce back from data loss.",
        details: "Scheduled offsite backups, versioning, restore testing, and disaster recovery planning.",
        keywords: ["backup", "recovery", "cloud", "restore", "data", "disaster"],
        paths: [
            { needs: ["backup", "cloud"], weight: 4 },
            { needs: ["backup", "recovery"], weight: 3 },
            { needs: ["backup", "website"], weight: 3 }
        ]
    },
    {
        id: "workstation-support",
        title: "Workstation Support",
        summary: "Help with computers, operating systems, software, and everyday IT problems.",
        details: "Windows and operating system upgrades, setup, troubleshooting, and maintenance for desktops, laptops, and business software.",
        keywords: ["workstation", "software", "troubleshooting", "setup", "windows"],
        paths: [
            { needs: ["workstation", "upgrade"], weight: 4 },
            { needs: ["workstation", "setup"], weight: 3 },
            { needs: ["workstation", "performance"], weight: 3 }
        ]
    },
    {
        id: "cloud-network",
        title: "Cloud & Network Setup",
        summary: "Design and configure reliable cloud services and business networks.",
        details: "Cloud migration, network configuration, Wi-Fi and router setup, and secure remote access.",
        keywords: ["network", "cloud", "wifi", "router", "migration", "remote"],
        paths: [
            { needs: ["cloud", "setup"], weight: 4 },
            { needs: ["network", "setup"], weight: 3 },
            { needs: ["cloud", "migration"], weight: 3 }
        ]
    }
];

// ---------- helpers ----------

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
        const curr = [i];
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        }
        prev = curr;
    }
    return prev[n];
}

// Word-boundary tokens, stop words removed, synonyms applied.
function tokenize(text) {
    return String(text)
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .filter(word => !STOP.has(word))
        .map(word => SYNONYMS[word] || word);
}

// Exact match, or a single-edit typo match for words of 5+ letters.
function conceptMatches(token, concept) {
    if (token === concept) return true;
    if (token.length >= 5 && concept.length >= 5) {
        return levenshtein(token, concept) <= 1;
    }
    return false;
}

function hasConcept(tokens, concept) {
    return tokens.some(token => conceptMatches(token, concept));
}

// ---------- ranking ----------

function scoreSolution(solution, tokens) {
    let bestPathWeight = 0;
    let bestPathNeeds = null;

    for (const path of solution.paths) {
        const allPresent = path.needs.every(need => hasConcept(tokens, need));
        if (allPresent && path.weight > bestPathWeight) {
            bestPathWeight = path.weight;
            bestPathNeeds = path.needs;
        }
    }

    const keywordHits = solution.keywords.filter(keyword => hasConcept(tokens, keyword)).length;
    const score = bestPathWeight + keywordHits;

    return { solution, score, bestPathNeeds, keywordHits };
}

function rankSolutions(query) {
    const tokens = tokenize(query);
    return SOLUTIONS
        .map(solution => scoreSolution(solution, tokens))
        .filter(result => result.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);
}

// Returns a routing decision the renderer can display.
function routeQuery(query) {
    if (!query || !query.trim()) {
        return { type: "empty", booking: BOOKING_URL };
    }

    const ranked = rankSolutions(query);

    if (ranked.length === 0) {
        return { type: "no-match", booking: BOOKING_URL };
    }

    const top = ranked[0];
    const combined = ranked.filter(result => result.score >= COMBINED_MIN);

    if (combined.length >= 2) {
        return { type: "combined", items: combined, booking: BOOKING_URL };
    }

    const alternatives = ranked
        .slice(1)
        .filter(result => result.score >= top.score * CLOSE_RATIO);

    return { type: "single", top, alternatives, booking: BOOKING_URL };
}

// ---------- rendering ----------

function renderCard(result) {
    const s = result.solution;
    const pathText = result.bestPathNeeds
        ? `<p class="match-reason">Matched on: ${escapeHtml(result.bestPathNeeds.join(" + "))}</p>`
        : "";
    return `
        <div class="solution-card">
            <h3>${escapeHtml(s.title)}</h3>
            <p>${escapeHtml(s.summary)}</p>
            <p>${escapeHtml(s.details)}</p>
            ${pathText}
        </div>`;
}

function renderRoute(route) {
    const booking = `<p><a href="${escapeHtml(route.booking)}" target="_blank" rel="noopener">Book a free 30-minute consultation</a></p>`;

    if (route.type === "empty") {
        return `<p>Tell me a bit about what you need, such as a slow website, a security concern, backups, or computer problems.</p>${booking}`;
    }

    if (route.type === "no-match") {
        return `<p>I could not match that to one of our services yet. Try describing the problem in a few more words, or book a call and we can talk it through.</p>${booking}`;
    }

    if (route.type === "combined") {
        const names = route.items.map(item => item.solution.title).join(" and ");
        const cards = route.items.map(renderCard).join("");
        return `
            <p>Your request touches several areas. A combined plan covering ${escapeHtml(names)} would likely work best.</p>
            ${cards}
            ${booking}`;
    }

    // single
    const altText = route.alternatives.length
        ? `<p>You may also want to look at:</p>${route.alternatives.map(renderCard).join("")}`
        : "";
    return `
        <p>The best match for your request is:</p>
        ${renderCard(route.top)}
        ${altText}
        ${booking}`;
}

// ---------- wiring ----------

function handleSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("solution-query");
    const output = document.getElementById("solution-output");
    if (!input || !output) return;

    const route = routeQuery(input.value);
    output.innerHTML = renderRoute(route);
}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("solution-form");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }
});
ion-output");

    if (!form || !input || !output) {
        console.warn("Solution finder: required elements not found.");
        return;
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        try {
            renderOutput(output, input.value);
        } catch (error) {
            console.error("Solution finder error:", error);
            output.innerHTML =
                `<p>Something went wrong. Please <a href="${BOOKING_URL}" target="_blank" rel="noopener">book a consultation</a> instead.</p>`;
        }
    });
}

document.addEventListener("DOMContentLoaded", initSolutionFinder);
