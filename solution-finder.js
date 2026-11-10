// solution-finder.js
// Combined routing agent: common-issue troubleshooting, sales service matching,
// Windows Server upgrade intel, and data sanitization guides. Keyword, synonym,
// combination, and single-edit typo matching. No external API.

const BOOKING_URL = "https://calendly.com/patlucero2026/30min";

const MIN_SCORE = 2;
const CLOSE_RATIO = 0.6;
const COMBINED_MIN = 3;
const ISSUE_LIMIT = 3;
const INTEL_MIN = 1;
const INTEL_LIMIT = 2;

const STOP = new Set([
    "a", "an", "and", "the", "of", "for", "to", "in", "on", "at", "is", "are",
    "my", "our", "your", "i", "we", "you", "it", "this", "that", "with", "need",
    "want", "help", "please", "can", "do", "does", "how", "what", "about", "some",
    "why", "keeps", "keep", "or"
]);

// Common English words one edit away from a concept. Exempt from typo matching.
const NO_FUZZY = new Set(["remove", "match", "matches", "setting", "settings", "driver", "drivers"]);

const SYNONYMS = {
    site: "website", webpage: "website", web: "website", page: "website",
    speed: "performance", slow: "performance", fast: "performance", loading: "performance",
    mobile: "responsive", phone: "responsive", tablet: "responsive", responsiveness: "responsive",
    seo: "search", google: "search", ranking: "search",
    html: "markup", html5: "markup", javascript: "markup", js: "markup",
    secure: "security", hack: "security", hacked: "security", malware: "security", virus: "security",
    backups: "backup", backing: "backup",
    restore: "recovery",
    pc: "workstation", laptop: "workstation", computer: "workstation", desktop: "workstation",
    windows: "workstation", os: "workstation",
    network: "network", wifi: "network", router: "network",
    cloud: "cloud",
    update: "upgrade", upgrading: "upgrade",
    install: "setup", installation: "setup",
    monitor: "monitoring"
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
        keywords: ["security", "threat", "firewall", "monitoring", "patch"],
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
        keywords: ["workstation", "software", "troubleshooting", "setup"],
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

// Each keyword belongs to one issue where possible, so routing is not split by duplicates.
const COMMON_ISSUES = [
    // ---------- Common hardware issues ----------
    {
        id: "hw-battery",
        category: "Common hardware issues",
        title: "Battery degradation",
        description: "Laptops and phones lose capacity over time, which shows up as shorter runtimes, unexpected shutdowns, or swollen batteries.",
        keywords: ["battery", "runtime", "drain", "shutdown", "shuts", "swollen", "swelling", "charge", "charging"],
        fix: "Check the battery health report (Windows: powercfg /batteryreport; macOS: System Information, Power). If the battery is swollen, replace it through a qualified repair service.",
        safetyNote: "Do not charge a swollen battery, and stop using the device until it has been inspected."
    },
    {
        id: "hw-storage",
        category: "Common hardware issues",
        title: "Storage running out",
        description: "Full drives slow everything down and can stop updates or apps from installing. Cloud sync clients that duplicate files are a frequent cause.",
        keywords: ["storage", "disk", "space", "full", "duplicate", "duplicates"],
        fix: "Review the largest folders and remove duplicates. Check whether a cloud sync client is storing local copies of everything, and switch to on-demand files if so."
    },
    {
        id: "hw-overheating",
        category: "Common hardware issues",
        title: "Overheating and fan noise",
        description: "Dust buildup, blocked vents, and dried thermal paste cause throttling and sudden shutdowns.",
        keywords: ["overheating", "overheat", "hot", "heat", "fan", "noise", "loud", "throttle", "throttling", "thermal"],
        fix: "Clear the vents and fan intakes with compressed air, use the device on a hard surface, and check CPU temperatures. If shutdowns continue, have the thermal paste replaced."
    },
    {
        id: "hw-failing-drive",
        category: "Common hardware issues",
        title: "Failing drives",
        description: "Aging hard drives show slow boots, clicking, or corrupted files. Replacing them with SSDs often fixes the performance problem.",
        keywords: ["hard", "drive", "hdd", "clicking", "click", "corrupt", "corrupted", "boot", "boots", "failing", "ssd"],
        fix: "Back up the data immediately. Run a SMART check (CrystalDiskInfo on Windows, Disk Utility on macOS). If the drive reports errors or clicks, replace it, ideally with an SSD."
    },
    {
        id: "hw-peripherals",
        category: "Common hardware issues",
        title: "Peripheral and dock problems",
        description: "USB-C docks, monitors, and webcams often fail after driver or firmware updates, or when a laptop wakes from sleep.",
        keywords: ["dock", "docking", "usb", "usb-c", "monitor", "display", "webcam", "peripheral", "wake", "sleep", "firmware"],
        fix: "Unplug the dock, restart the computer, and reconnect. Update the dock firmware and chipset or display drivers from the manufacturer. Test with a direct connection to isolate the fault."
    },

    // ---------- Common software and OS issues ----------
    {
        id: "sw-slow",
        category: "Common software and OS issues",
        title: "Slow performance",
        description: "Too many startup programs, background sync tools, and browser extensions are the usual culprits.",
        keywords: ["sluggish", "lag", "startup", "background", "performance"],
        fix: "Disable unneeded startup items (Task Manager, Startup tab), review browser extensions, and check which background processes use the most CPU and memory."
    },
    {
        id: "sw-updates",
        category: "Common software and OS issues",
        title: "Update failures",
        description: "Windows and macOS updates fail because of low disk space, corrupted update caches, or security software interference.",
        keywords: ["update", "updates", "upgrade", "failed", "install", "installation", "patch", "cache"],
        fix: "Free at least 20 GB of space, pause security software temporarily, and reset the update cache (Windows: stop the Windows Update service and clear SoftwareDistribution; macOS: restart and retry)."
    },
    {
        id: "sw-account",
        category: "Common software and OS issues",
        title: "Account and login problems",
        description: "Forgotten passwords, expired MFA tokens, and lockouts are the most common help-desk tickets, especially after a phone is replaced.",
        keywords: ["password", "login", "signin", "mfa", "authenticator", "locked", "lockout", "account", "otp", "token"],
        fix: "Confirm the account is not locked, reset the password through the verified recovery method, and re-register the authenticator app on the new phone."
    },
    {
        id: "sw-printer",
        category: "Common software and OS issues",
        title: "Printer and driver conflicts",
        description: "Print queues get stuck, and drivers break after OS upgrades.",
        keywords: ["printer", "print", "queue", "spooler", "driver", "drivers"],
        fix: "Clear the print queue, restart the print spooler service, and reinstall the driver from the manufacturer for the current OS version."
    },
    {
        id: "sw-malware",
        category: "Common software and OS issues",
        title: "Malware and phishing",
        description: "Fake browser pop-ups, credential-harvesting emails, and unwanted browser extensions are frequent, and they often start with a user clicking something they should not have.",
        keywords: ["malware", "virus", "popup", "phishing", "phish", "scam", "suspicious", "hacked", "ransomware", "extension"],
        fix: "Disconnect from the network, change passwords from a clean device, run a full scan with current security software, and remove unknown browser extensions. Report phishing emails to IT.",
        safetyNote: "Do not enter passwords on suspicious pages until the device has been scanned."
    },

    // ---------- App and connectivity issues ----------
    {
        id: "net-wifi-vpn",
        category: "App and connectivity issues",
        title: "Wi-Fi and VPN drops",
        description: "Unstable connections, DNS problems, and VPN clients that fail to reconnect after sleep are common, especially with remote work.",
        keywords: ["wifi", "wi-fi", "internet", "connection", "connect", "disconnect", "dns", "vpn", "drop", "drops", "network", "router"],
        fix: "Forget and rejoin the network, flush DNS (ipconfig /flushdns or sudo dscacheutil -flushcache), and reinstall or restart the VPN client after resuming from sleep."
    },
    {
        id: "app-license",
        category: "App and connectivity issues",
        title: "Software license and subscription errors",
        description: "Expired licenses, sign-in loops, and apps tied to the wrong account block access.",
        keywords: ["license", "licence", "subscription", "activation", "activate", "expired", "loop", "signed"],
        fix: "Confirm the subscription is active, sign out of the app completely, and sign in with the account that holds the license."
    },
    {
        id: "app-sync",
        category: "App and connectivity issues",
        title: "Sync conflicts",
        description: "OneDrive, Google Drive, iCloud, and Teams can produce duplicate files or stop syncing silently.",
        keywords: ["sync", "syncing", "onedrive", "icloud", "teams", "conflict", "conflicts"],
        fix: "Pause sync, resolve duplicate or conflicted files, then resume. Check the sync client status icon for errors and confirm the correct folders are selected."
    },
    {
        id: "app-compat",
        category: "App and connectivity issues",
        title: "Compatibility problems",
        description: "Older line-of-business apps often break after OS or browser upgrades.",
        keywords: ["compatibility", "compatible", "legacy", "broken", "break", "breaks", "lob", "older"],
        fix: "Run the app in compatibility mode, check the vendor for a patched version, and keep a tested OS or browser version for critical tools until a fix is available."
    },
    {
        id: "app-collab",
        category: "App and connectivity issues",
        title: "Collaboration tool glitches",
        description: "Video calls with poor audio, camera permission problems, and notification failures are routine.",
        keywords: ["calls", "audio", "microphone", "mic", "speaker", "camera", "permission", "permissions", "notifications", "notification", "zoom", "meet"],
        fix: "Check that the app has microphone and camera permission in system settings, select the correct input and output devices, and restart the app."
    },

    // ---------- Personal device specifics ----------
    {
        id: "personal-shared",
        category: "Personal device specifics",
        title: "Shared accounts and family devices",
        description: "Family members sharing accounts, storage full of photos, phones with unpatched apps, and smart home devices with weak default passwords.",
        keywords: ["family", "shared", "share", "photos", "photo", "smart", "home", "iot", "default"],
        fix: "Give each family member a separate account, move photos to a managed cloud library, install pending app and OS updates, and change default passwords on smart home devices and the router."
    }
];

// Windows Server 2012 R2 to 2025 upgrade knowledge base.
const UPGRADE_INTEL = [
    {
        id: "eol-2012r2",
        title: "Support Status",
        keywords: ["eol", "unsupported", "expired", "2012", "r2"],
        facts: [
            "Windows Server 2012 R2 reached the end of extended support on October 10, 2023, so it no longer receives security updates.",
            "The domain controller handles logins for every PC on the network, so this server is a priority to replace.",
            "On both 2012 R2 and 2025, AD DS is installed through Server Manager's Add Roles and Features wizard, then the server is promoted to a domain controller."
        ]
    },
    {
        id: "licensing",
        title: "Device Connections and Licensing",
        keywords: ["license", "licenses", "licensing", "cals", "essentials", "datacenter", "cores"],
        facts: [
            "Windows Server 2012 R2 Essentials supports up to 25 users and 50 devices without client access licenses (CALs).",
            "Windows Server 2012 R2 Standard has no fixed device cap, but each user or device requires a CAL.",
            "Windows Server 2025 Standard and Datacenter use per-core licensing plus CALs, with no fixed connection limit.",
            "Offices with fewer than 25 users usually save money with Essentials-style licensing, while growing businesses avoid a future migration by starting with Standard and CALs."
        ],
        verify: "Microsoft has changed Essentials availability in newer releases, so confirm current limits before purchasing."
    },
    {
        id: "authentication",
        title: "Kerberos and NTLM",
        keywords: ["kerberos", "ntlm", "ldap", "dmsa", "aes", "authentication", "logins"],
        facts: [
            "Windows Server 2012 R2 uses Kerberos for domain logins and NTLM as a fallback, and supports Kerberos armoring, the Protected Users group, and authentication policies.",
            "Windows Server 2025 keeps Kerberos as the primary protocol, adds AES-SHA2 encryption by default, and enforces stricter LDAP signing and channel binding.",
            "NTLM is being phased out, and Microsoft provides auditing tools to find applications that still depend on it.",
            "Delegated managed service accounts (dMSA) simplify service account management."
        ],
        verify: "Check Microsoft's documentation for the current NTLM phase-out timeline and auditing tools."
    },
    {
        id: "legacy-apps",
        title: "Legacy Application Risks",
        keywords: ["legacy", "printers", "unsigned", "compatibility"],
        facts: [
            "The main migration risk is legacy software. Applications, printers, and older devices that rely on NTLM or unsigned LDAP may fail on Windows Server 2025.",
            "Audit these devices and applications before cutover."
        ]
    },
    {
        id: "policy-rights",
        title: "Group Policy and User Rights",
        keywords: ["policy", "policies", "gpo", "gpos", "laps", "smb", "rights", "lockout"],
        facts: [
            "User rights such as Allow log on locally, Allow log on through Remote Desktop Services, and Deny access to this computer from the network are managed through Group Policy Management in both versions.",
            "Password and account lockout policies work the same way in both, applied through the Default Domain Policy or a dedicated GPO.",
            "Windows Server 2025 adds Windows LAPS for automatic, encrypted rotation of local administrator passwords, which 2012 R2 does not include.",
            "Windows Server 2025 enforces stronger SMB signing and encryption, and removes support for SMB 1.0 and NTLMv1."
        ]
    },
    {
        id: "upgrade-path",
        title: "Recommended Upgrade Path",
        keywords: ["migrate", "migration", "upgrade", "cutover", "controller", "fsmo", "backup"],
        facts: [
            "Back up Active Directory with a system state backup first.",
            "Install a new Windows Server 2025 machine and promote it as a second domain controller.",
            "Move the FSMO roles and file shares to the new server.",
            "Retire the 2012 R2 server."
        ],
        verify: "Check current schema and functional level requirements in Microsoft's documentation."
    }
];

// Data sanitization guides: explanation, steps, limitations, and FAQ.
const WIPE_GUIDES = [
    {
        id: "cipher-wipe",
        title: "Wiping Free Space with cipher /w",
        keywords: ["cipher", "wipe", "wiping", "erase", "erasing", "sanitize", "sanitization", "recover", "recoverable", "recycle", "recycling", "repurpose", "sell", "selling", "deleted", "delete", "deleting"],
        overview: [
            "The Windows cipher /w command overwrites the free space on a drive, making files you have already deleted much harder to recover.",
            "Deleting a file or emptying the Recycle Bin only removes its directory entry, and the data remains on the disk until those sectors are reused.",
            "Running cipher /w is a common step before selling, recycling, or repurposing a PC."
        ],
        steps: [
            "Empty the Recycle Bin first, because cipher /w only affects free space and leaves existing files untouched.",
            "Open Start, type cmd, right-click Command Prompt, and select Run as administrator. The command requires administrator rights.",
            "Run the command, replacing C:\\ with the drive letter you want to clean: cipher /w:C:\\",
            "The tool overwrites free space in three passes. Keep the computer powered on and avoid using the drive until it finishes, since it can take hours on a large drive."
        ],
        ssdLimitations: [
            "On solid-state drives, cipher /w may not reach every physical block that held deleted data, because SSDs use wear leveling and remap writes internally.",
            "For SSDs, enable BitLocker or device encryption, which renders existing data unreadable, or use the manufacturer's secure erase tool."
        ],
        faqs: [
            {
                question: "Does cipher /w speed up a slow computer?",
                answer: "No. A full Recycle Bin only uses disk space. If your computer is slow, check free disk space, background processes, and the health of the drive."
            },
            {
                question: "Is cipher /w a security monitoring tool?",
                answer: "No. It is a data sanitization tool. It reduces the chance of recovering deleted files, but it does not detect or prevent attacks."
            }
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

// Hyphenated terms are collapsed before splitting so "wi-fi" stays one token.
function normalizeTerms(text) {
    return String(text)
        .toLowerCase()
        .replace(/wi-fi/g, "wifi")
        .replace(/usb-c/g, "usbc")
        .replace(/pop-up/g, "popup");
}

// Keeps the original word and adds its synonym, so both "hacked" and "security" can match.
function tokenize(text) {
    return normalizeTerms(text)
        .split(/[^a-z0-9]+/)
        .filter(Boolean)
        .filter(word => !STOP.has(word))
        .flatMap(word => (SYNONYMS[word] ? [word, SYNONYMS[word]] : [word]));
}

// Keywords are normalized the same way as the query, so "wi-fi" and "usb-c" match.
function normalizeKeyword(keyword) {
    return normalizeTerms(keyword);
}

// Exact match, or a single-edit typo match for words of 5+ letters (not in NO_FUZZY).
function conceptMatches(token, concept) {
    if (token === concept) return true;
    if (NO_FUZZY.has(token)) return false;
    if (token.length >= 5 && concept.length >= 5) {
        return levenshtein(token, concept) <= 1;
    }
    return false;
}

function hasConcept(tokens, concept) {
    return tokens.some(token => conceptMatches(token, concept));
}

// ---------- troubleshooting matcher ----------

function findCommonIssues(tokens, limit = ISSUE_LIMIT) {
    return COMMON_ISSUES
        .map(issue => {
            const matched = issue.keywords
                .map(normalizeKeyword)
                .filter(keyword => hasConcept(tokens, keyword));
            return { issue, score: matched.length, matched };
        })
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
}

// ---------- sales matcher ----------

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

function rankSolutions(tokens) {
    return SOLUTIONS
        .map(solution => scoreSolution(solution, tokens))
        .filter(result => result.score >= MIN_SCORE)
        .sort((a, b) => b.score - a.score);
}

// Routes services only. Returns one of: none, combined, single.
function routeServices(tokens) {
    const ranked = rankSolutions(tokens);

    if (ranked.length === 0) {
        return { type: "none" };
    }

    const combined = ranked.filter(result => result.score >= COMBINED_MIN);
    if (combined.length >= 2) {
        return { type: "combined", items: combined };
    }

    const top = ranked[0];
    const alternatives = ranked
        .slice(1)
        .filter(result => result.score >= top.score * CLOSE_RATIO);

    return { type: "single", top, alternatives };
}

// Single routing pass: troubleshooting and services together.
function routeQuery(query) {
    if (!query || !query.trim()) {
        return { type: "empty", booking: BOOKING_URL };
    }

    const tokens = tokenize(query);
    if (tokens.length === 0) {
        return { type: "empty", booking: BOOKING_URL };
    }

    const issues = findCommonIssues(tokens);
    const services = routeServices(tokens);

    if (issues.length === 0 && services.type === "none") {
        return { type: "no-match", booking: BOOKING_URL };
    }

    return { type: "results", issues, services, booking: BOOKING_URL };
}

// ---------- upgrade intel matcher ----------
// Reconstructed from the described behavior: hasConcept over each entry's keywords,
// filtered by INTEL_MIN, sliced by INTEL_LIMIT. Verify against your version.

function findUpgradeIntel(tokens, limit = INTEL_LIMIT) {
    return UPGRADE_INTEL
        .map(entry => {
            const matched = entry.keywords
                .map(normalizeKeyword)
                .filter(keyword => hasConcept(tokens, keyword));
            return { entry, score: matched.length, matched };
        })
        .filter(result => result.score >= INTEL_MIN)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(result => result.entry);
}

// ---------- wipe guide matcher ----------
// Same matching as upgrade intel. Guides are few, so no slice limit is applied.

function findWipeGuides(tokens) {
    return WIPE_GUIDES
        .map(guide => {
            const matched = guide.keywords
                .map(normalizeKeyword)
                .filter(keyword => hasConcept(tokens, keyword));
            return { guide, score: matched.length };
        })
        .filter(result => result.score >= INTEL_MIN)
        .sort((a, b) => b.score - a.score)
        .map(result => result.guide);
}

// Wraps routeQuery and appends intel and guides. A no-match becomes results when either matches.
function routeQueryWithIntel(query) {
    const route = routeQuery(query);
    if (route.type === "empty") return route;

    const tokens = tokenize(query);
    const intel = findUpgradeIntel(tokens);
    const guides = findWipeGuides(tokens);

    if (route.type === "no-match") {
        if (intel.length === 0 && guides.length === 0) return route;
        return {
            type: "results",
            issues: [],
            services: { type: "none" },
            intel,
            guides,
            booking: BOOKING_URL
        };
    }

    return { ...route, intel, guides };
}

// ---------- rendering ----------

function describeMatch(needs) {
    const labels = {
        website: "website", upgrade: "upgrade", performance: "performance",
        responsive: "mobile-friendly design", markup: "HTML5 markup",
        search: "search visibility", security: "security", network: "network",
        monitoring: "monitoring", backup: "backup", cloud: "cloud",
        recovery: "recovery", workstation: "computer", setup: "setup",
        migration: "migration"
    };
    return needs.map(need => labels[need] || need).join(" and ");
}

function joinTitles(items) {
    const titles = items.map(item => item.solution.title);
    if (titles.length <= 1) return titles.join("");
    return titles.slice(0, -1).join(", ") + " and " + titles[titles.length - 1];
}

function renderServiceCard(result) {
    const s = result.solution;
    const matchText = result.bestPathNeeds
        ? `<p class="match-reason">Matched on: ${escapeHtml(describeMatch(result.bestPathNeeds))}</p>`
        : "";
    return `
        <div class="solution-card">
            <h3>${escapeHtml(s.title)}</h3>
            <p>${escapeHtml(s.summary)}</p>
            <p>${escapeHtml(s.details)}</p>
            ${matchText}
        </div>`;
}

function renderIssueCard({ issue }) {
    const safety = issue.safetyNote
        ? `<p><strong>Safety:</strong> ${escapeHtml(issue.safetyNote)}</p>`
        : "";
    return `
        <div class="solution-card">
            <h3>${escapeHtml(issue.title)}</h3>
            <p class="match-reason">${escapeHtml(issue.category)}</p>
            <p>${escapeHtml(issue.description)}</p>
            <p><strong>First step:</strong> ${escapeHtml(issue.fix)}</p>
            ${safety}
        </div>`;
}

// Reconstructed from the described behavior. Verify against your version.
function renderIntelCard(entry) {
    const facts = entry.facts.map(fact => `<li>${escapeHtml(fact)}</li>`).join("");
    const verify = entry.verify
        ? `<p><strong>To confirm:</strong> ${escapeHtml(entry.verify)}</p>`
        : "";
    return `
        <div class="solution-card">
            <h3>${escapeHtml(entry.title)}</h3>
            <p class="match-reason">Windows Server upgrade: 2012 R2 to 2025</p>
            <ul>${facts}</ul>
            ${verify}
        </div>`;
}

function renderWipeGuide(guide) {
    const overview = guide.overview.map(p => `<p>${escapeHtml(p)}</p>`).join("");
    const steps = guide.steps.map(step => `<li>${escapeHtml(step)}</li>`).join("");
    const limits = guide.ssdLimitations.map(p => `<li>${escapeHtml(p)}</li>`).join("");
    const faqs = guide.faqs
        .map(faq => `<p><strong>${escapeHtml(faq.question)}</strong><br>${escapeHtml(faq.answer)}</p>`)
        .join("");
    return `
        <div class="solution-card">
            <h3>${escapeHtml(guide.title)}</h3>
            <p class="match-reason">Data sanitization</p>
            ${overview}
            <p><strong>Run cipher /w step by step</strong></p>
            <ol>${steps}</ol>
            <p><strong>Limitations for SSDs</strong></p>
            <ul>${limits}</ul>
            <p><strong>Frequently asked questions</strong></p>
            ${faqs}
        </div>`;
}

function renderServices(services) {
    if (services.type === "combined") {
        const cards = services.items.map(renderServiceCard).join("");
        return `
            <p>Your request touches several areas. A combined plan covering ${escapeHtml(joinTitles(services.items))} would likely work best.</p>
            ${cards}`;
    }
    if (services.type === "single") {
        const altText = services.alternatives.length
            ? `<p>You may also want to look at:</p>${services.alternatives.map(renderServiceCard).join("")}`
            : "";
        return `
            <p>The best service match for your request is:</p>
            ${renderServiceCard(services.top)}
            ${altText}`;
    }
    return "";
}

function renderRoute(route) {
    const booking = `<p><a href="${escapeHtml(route.booking)}" target="_blank" rel="noopener">Book a free 30-minute consultation</a></p>`;

    if (route.type === "empty") {
        return `<p>Tell me a bit about what you need, such as a slow website, a security concern, backups, or computer problems.</p>${booking}`;
    }

    if (route.type === "no-match") {
        return `<p>I could not match that to a common issue or one of our services yet. Try describing the problem in a few more words, or book a call and we can talk it through.</p>${booking}`;
    }

    const issuesHtml = route.issues.length
        ? `<p>These common issues may match what you are seeing:</p>${route.issues.map(renderIssueCard).join("")}`
        : "";

    const servicesHtml = renderServices(route.services);

    const intelHtml = route.intel && route.intel.length
        ? `<p>Relevant Windows Server upgrade guidance:</p>${route.intel.map(renderIntelCard).join("")}`
        : "";

    const guidesHtml = route.guides && route.guides.length
        ? `<p>Here is a guide for securely erasing data:</p>${route.guides.map(renderWipeGuide).join("")}`
        : "";

    const closing = route.issues.length && route.services.type === "none"
        ? `<p>If these steps do not resolve the problem, a consultation can help narrow it down.</p>`
        : "";

    return `${issuesHtml}${servicesHtml}${intelHtml}${guidesHtml}${closing}${booking}`;
}

// ---------- wiring ----------

function handleSubmit(event) {
    event.preventDefault();
    const input = document.getElementById("solution-query");
    const output = document.getElementById("solution-output");
    if (!input || !output) return;

    const route = routeQueryWithIntel(input.value);
    output.innerHTML = renderRoute(route);
}

function init() {
    const form = document.getElementById("solution-form");
    if (form) {
        form.addEventListener("submit", handleSubmit);
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}
