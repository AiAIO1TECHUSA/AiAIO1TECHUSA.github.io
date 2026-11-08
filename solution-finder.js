"use strict";

/* ---------- Configuration ---------- */

const BOOKING_URL = "https://calendly.com/patlucero2026/30min";
const MIN_SCORE = 2;          // a path needs at least one combination or two concepts
const CLOSE_RATIO = 0.6;      // secondary paths must reach 60% of the best score
const COMBINED_MIN = 3;       // a second solution must score this high to form a combined route

const STOP = new Set([
    "a", "an", "the", "and", "or", "of", "to", "for", "with", "my", "our",
    "your", "i", "we", "you", "is", "are", "need", "want", "help", "can",
    "how", "what", "do", "it", "in", "on", "be", "some", "any", "please",
    "still", "keeps", "keep", "really", "very", "so", "not", "because"
]);

/* Informal words mapped to canonical concepts. */
const SYNONYMS = {
    site: "website", webpage: "website", web: "website",
    seo: "search", ranking: "search", rank: "search", google: "search",
    speed: "performance", fast: "performance", slow: "performance",
    loads: "performance", loading: "performance", lag: "performance",
    phone: "mobile", phones: "mobile", tablet: "mobile", responsive: "mobile",
    hack: "security", hacked: "security", virus: "security",
    malware: "security", breach: "security",
    backups: "backup", restore: "recovery", recover: "recovery",
    wifi: "network", router: "network", internet: "network",
    printer: "workstation", computer: "workstation", laptop: "workstation",
    pc: "workstation", cloud: "cloud"
};

/*
 * Each solution has:
 *  - keywords: single concepts (weight 1 each)
 *  - paths: combinations of concepts; every concept in "needs" must be present.
 *    Higher weight means a more specific route.
 */
const SOLUTIONS = [
    {
        id: "website-upgrade",
        title: "Website Upgrade: Responsive, HTML5 & JavaScript",
        summary: "Modern, mobile-friendly pages with clean markup and faster load times.",
        details: "We audit and upgrade markup, page speed, and responsive layout so your site works well on phones and ranks better in search.",
        keywords: ["website", "design", "html", "javascript", "markup"],
        paths: [
            { needs: ["website", "performance"], weight: 4 },
            { needs: ["website", "mobile"], weight: 4 },
            { needs: ["mobile", "performance"], weight: 3 },
            { needs: ["website", "search"], weight: 3 }
        ]
    },
    {
        id: "managed-security",
        title: "Managed Security",
        summary: "Ongoing protection against threats and unauthorized access.",
        details: "Continuous monitoring, patching, and hardening to keep your systems and data protected.",
        keywords: ["security", "protection", "threat", "monitoring", "firewall"],
        paths: [
            { needs: ["security", "website"], weight: 4 },
            { needs: ["security", "network"], weight: 3 }
        ]
    },
    {
        id: "cloud-backup",
        title: "Cloud Backup & Recovery",
        summary: "Automatic backups with tested recovery when something goes wrong.",
        details: "Scheduled cloud backups and documented recovery steps so you can restore files and systems quickly.",
        keywords: ["backup", "recovery", "disaster", "data"],
        paths: [
            { needs: ["backup", "cloud"], weight: 4 },
            { needs: ["backup", "recovery"], weight: 3 }
        ]
    },
    {
        id: "workstation-support",
        title: "Workstation Support",
        summary: "Help with computers, software, and everyday IT problems.",
        details: "Setup, troubleshooting, and maintenance for desktops, laptops, and business software.",
        keywords: ["workstation", "software", "troubleshooting", "setup"],
        paths: [
            { needs: ["workstation", "setup"], weight: 3 },
            { needs: ["workstation", "performance"], weight: 3 }
        ]
    },
    {
        id: "cloud-network",
        title: "Cloud & Network Setup",
        summary: "Reliable networks and cloud services configured for your business.",
        details: "Network design, Wi-Fi and router configuration, and cloud account setup.",
        keywords: ["network", "cloud", "setup", "server"],
        paths: [
            { needs: ["network", "setup"], weight: 3 },
            { needs: ["cloud", "network"], weight: 4 }
        ]
    }
];

/* ---------- Text processing ---------- */

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
}

/* Returns the set of canonical concepts present in the query. */
function extractConcepts(query) {
    const concepts = new Set();
    for (const token of normalize(query)) {
        if (STOP.has(token)) continue;
        concepts.add(SYNONYMS[token] || token);
    }
    return concepts;
}

/* Levenshtein distance, used only for one-edit typos. */
function editDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        }
    }
    return dp[a.length][b.length];
}

/* Fixes one-letter typos in longer words by snapping them to a known concept. */
function snapTypos(concepts, vocabulary) {
    const fixed = new Set();
    for (const concept of concepts) {
        if (vocabulary.has(concept) || concept.length < 5) {
            fixed.add(concept);
            continue;
        }
        const match = [...vocabulary].find(
            word => word.length >= 5 && editDistance(concept, word) === 1
        );
        fixed.add(match || concept);
    }
    return fixed;
}

function buildVocabulary() {
    const vocab = new Set(Object.values(SYNONYMS));
    for (const solution of SOLUTIONS) {
        solution.keywords.forEach(k => vocab.add(k));
        solution.paths.forEach(p => p.needs.forEach(n => vocab.add(n)));
    }
    return vocab;
}

const VOCABULARY = buildVocabulary();

/* ---------- Path scoring ---------- */

/* A path matches only when every concept it needs is present. */
function scorePaths(concepts, solution) {
    let best = { weight: 0, needs: [] };

    for (const path of solution.paths) {
        const allPresent = path.needs.every(n => concepts.has(n));
        if (allPresent && path.weight > best.weight) {
            best = path;
        }
    }

    const singles = solution.keywords.filter(k => concepts.has(k)).length;

    return {
        solution,
        score: best.weight + singles,
        path: best.weight ? best.needs : [],
        singles
    };
}

/* ---------- Routing ---------- */

function routeQuery(query) {
    const raw = extractConcepts(query);

    if (raw.size === 0) {
        return { status: "empty", results: [] };
    }

    const concepts = snapTypos(raw, VOCABULARY);

    const scored = SOLUTIONS
        .map(solution => scorePaths(concepts, solution))
        .filter(result => result.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
        return { status: "no-match", results: [] };
    }

    const best = scored[0];
    const close = scored.filter(r => r.score >= best.score * CLOSE_RATIO);

    /* If two solutions both score strongly, offer a combined route. */
    const combined =
        scored.length >= 2 &&
        scored[0].score >= COMBINED_MIN &&
        scored[1].score >= COMBINED_MIN
            ? [scored[0].solution, scored[1].solution]
            : null;

    return {
        status: "ok",
        results: close,
        combined
    };
}

/* ---------- Rendering ---------- */

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function renderOutput(output, query) {
    const { status, results, combined } = routeQuery(query);

    if (status === "empty") {
        output.innerHTML =
            `<p>Describe the problem you are facing, for example "my site loads slowly on phones."</p>`;
        return;
    }

    if (status === "no-match") {
        output.innerHTML =
            `<p>I could not match that to one of our services. ` +
            `<a href="${BOOKING_URL}" target="_blank" rel="noopener">Book a 30-minute consultation</a> ` +
            `and we can talk it through.</p>`;
        return;
    }

    const best = results[0];
    const top = best.solution;
    const pathLabel = best.path.length
        ? ` (matched: ${best.path.map(escapeHtml).join(" + ")})`
        : "";

    let html =
        `<p>The best path for your request is <strong>${escapeHtml(top.title)}</strong>${pathLabel}.</p>` +
        `<article class="solution solution--expanded">` +
        `<h3>${escapeHtml(top.title)}</h3>` +
        `<p>${escapeHtml(top.details)}</p>` +
        `<a href="${BOOKING_URL}" target="_blank" rel="noopener">Book a 30-minute consultation</a>` +
        `</article>`;

    if (combined) {
        const names = combined.map(s => escapeHtml(s.title)).join(" and ");
        html +=
            `<p>Your request touches more than one area. A combined plan covering ${names} ` +
            `is likely the best route. <a href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a> to scope it.</p>`;
    }

    const others = results.slice(1).map(({ solution }) =>
        `<article class="solution"><h4>${escapeHtml(solution.title)}</h4>` +
        `<p>${escapeHtml(solution.summary)}</p></article>`
    ).join("");

    output.innerHTML = html + others;
}

/* ---------- Startup ---------- */

function initSolutionFinder() {
    const form = document.getElementById("solution-form");
    const input = document.getElementById("solution-query");
    const output = document.getElementById("solution-output");

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
