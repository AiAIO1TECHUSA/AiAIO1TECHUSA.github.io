"use strict";

/* Edit these entries to match your real solutions */
const SOLUTIONS = [
  {
    name: "Website Upgrade: Responsive, HTML5 & JavaScript",
    keywords: ["website", "site", "web", "responsive", "mobile", "phone", "tablet", "screen", "layout",
               "html", "css", "javascript", "interactive", "upgrade", "modern", "accessible",
               "accessibility", "navigation", "menu", "form", "animation", "broken"],
    problem: "Sites that don't adapt to phones and tablets lose visitors, and outdated code limits what you can offer.",
    fix: "We modernize your site with responsive design, semantic HTML5, and lightweight JavaScript for interactive features like menus, forms, and dynamic content.",
    outcome: "A site that looks right on every screen, loads faster, and meets accessibility standards.",
  },
  {
    name: "Managed Security",
    keywords: ["security", "phishing", "malware", "virus", "hack", "password", "firewall", "threat"],
    problem: "Threats, phishing, and unpatched systems put your business at risk.",
    fix: "We monitor, patch, and defend your endpoints and email around the clock.",
    outcome: "Fewer incidents, documented protection, and a team that sleeps better.",
  },
  {
    name: "Cloud Backup & Recovery",
    keywords: ["backup", "recovery", "restore", "deleted", "ransomware", "disaster", "lost"],
    problem: "One failed drive or ransomware attack can erase months of work.",
    fix: "Automated, encrypted backups with tested restore procedures.",
    outcome: "Recover files and systems in hours instead of weeks.",
  },
  {
    name: "Workstation Support",
    keywords: ["laptop", "computer", "printer", "device", "crash", "freeze", "driver", "hardware", "slow"],
    problem: "Slow or failing equipment drains productivity every day.",
    fix: "Proactive maintenance, updates, and fast hands-on repair.",
    outcome: "Reliable devices and fewer interruptions for your staff.",
  },
  {
    name: "Cloud & Network Setup",
    keywords: ["cloud", "network", "wifi", "internet", "vpn", "remote", "server", "hosting"],
    problem: "Remote work and growing teams need a network that keeps up.",
    fix: "Secure cloud, VPN, and network design built around how you work.",
    outcome: "Staff connect safely from anywhere with consistent performance.",
  },
];

const CALENDLY = "https://calendly.com/patlucero2026/30min";

/* Stricter matching: minimum score to count, and only close runners-up are shown */
const MIN_SCORE = 1;
const CLOSE_RATIO = 0.6;   // other matches must score at least 60% of the top score

const STOP = new Set(["a","an","and","are","as","at","be","by","for","from","i","in","is","it","my","of","on","or",
  "the","to","we","with","our","when","how","do","help","doesn't","dont","not","work","works","make","need","want",
  "can","cant","get","this","that"]);

const SYNONYMS = {
  webpage: "website", webpages: "website", websites: "website", sites: "site",
  phones: "phone", smartphone: "phone", mobiles: "mobile", tablets: "tablet", ipad: "tablet",
  html5: "html", js: "javascript", redesign: "upgrade", redesigned: "upgrade", upgrading: "upgrade",
  interactivity: "interactive", laptops: "laptop", computers: "computer", viruses: "virus",
  wireless: "wifi", hacks: "hack", backups: "backup",
};

function normalize(word) {
  let w = word.toLowerCase();
  if (SYNONYMS[w]) return SYNONYMS[w];
  if (w.length > 4 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  return SYNONYMS[w] || w;
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+(?:'[a-z]+)?/g) || [])
    .filter(w => !STOP.has(w))
    .map(normalize);
}

function rankSolutions(query) {
  const words = new Set(tokenize(query));
  const scored = SOLUTIONS
    .map(sol => {
      const kw = new Set(sol.keywords.map(normalize));
      let score = 0;
      words.forEach(w => { if (kw.has(w)) score++; });
      return { sol, score };
    })
    .filter(r => r.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];
  const top = scored[0].score;
  return scored.filter(r => r.score >= top * CLOSE_RATIO);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

function card(sol, expanded) {
  return `
    <div class="card">
      <h3>${escapeHtml(sol.name)}</h3>
      ${expanded ? `
        <p><strong>The problem:</strong> ${escapeHtml(sol.problem)}</p>
        <p><strong>How we fix it:</strong> ${escapeHtml(sol.fix)}</p>
        <p><strong>What you get:</strong> ${escapeHtml(sol.outcome)}</p>
        <p><a href="${CALENDLY}" target="_blank" rel="noopener"><strong>Book a 30-minute consultation</strong></a></p>
      ` : `<p>${escapeHtml(sol.problem)}</p>`}
    </div>`;
}

function runAgent() {
  const query = document.getElementById("agent-input").value.trim();
  const status = document.getElementById("agent-status");
  const out = document.getElementById("agent-output");

  if (!query) { status.textContent = "Type a problem to search."; out.innerHTML = ""; return; }

  const matches = rankSolutions(query);
  if (matches.length === 0) {
    status.textContent = "No direct match. Here are our core solutions:";
    out.innerHTML = SOLUTIONS.map(s => card(s, false)).join("");
    return;
  }

  status.textContent = `Found ${matches.length} matching solution${matches.length > 1 ? "s" : ""}.`;
  out.innerHTML = matches.map((m, i) => card(m.sol, i === 0)).join("");
}

document.getElementById("agent-btn").addEventListener("click", runAgent);
document.getElementById("agent-input").addEventListener("keydown", e => { if (e.key === "Enter") runAgent(); });
