// ===============================
// Full Corrected LLM‑AGENT (E‑commerce Optimized, Frontier Style)
// ===============================

// Core tag generator with dynamic keyword extraction
function generateProductTagDescription(productName, productDetails) {
    const keywordList = [
        "secure", "encrypted", "professional", "modern", "responsive",
        "ai", "automation", "workflow", "cyber", "payment", "stripe",
        "legal", "case", "document", "support", "tech"
    ];

    const detailsLower = productDetails.toLowerCase();
    const extracted = keywordList.filter(word => detailsLower.includes(word));

    const dynamicTags = extracted.length > 0 ? extracted.join(", ") : "";
    const baseTags = "premium, secure, professional, modern, responsive";

    const description =
        `${productName} — ${productDetails}. ` +
        `Tags: ${baseTags}` +
        (dynamicTags ? `, ${dynamicTags}` : "") +
        ".";

    return { description, extracted };
}

// Reasoning layer (with E‑commerce fallback)
function reasonAboutProduct(name, details) {
    const reasoning = [];
    const d = details.toLowerCase();

    if (d.includes("legal")) reasoning.push("This product fits legal-tech and paralegal workflows.");
    if (d.includes("secure") || d.includes("encrypted") || d.includes("cyber"))
        reasoning.push("Security and cybersecurity are key selling points.");
    if (d.includes("ai") || d.includes("automation"))
        reasoning.push("AI and automation increase efficiency and value.");
    if (d.includes("payment") || d.includes("stripe"))
        reasoning.push("Payment and Stripe integration suggest strong E‑commerce potential.");
    if (d.includes("responsive") || d.includes("modern"))
        reasoning.push("Modern, responsive design supports multi‑device usage.");

    if (reasoning.length === 0) {
        return "Reasoning: No domain-specific signals detected. Applying E‑commerce optimization heuristics to improve clarity, discoverability, and conversion potential.";
    }

    return "Reasoning: " + reasoning.join(" ");
}

// Frontier analysis layer (with E‑commerce fallback)
function frontierAnalysis(details) {
    const signals = [];
    const d = details.toLowerCase();

    if (d.includes("automation")) signals.push("Automation potential detected.");
    if (d.includes("workflow")) signals.push("Workflow enhancement possible.");
    if (d.includes("cyber")) signals.push("Cybersecurity relevance identified.");
    if (d.includes("responsive")) signals.push("Responsive design implications.");
    if (d.includes("stripe")) signals.push("Stripe E‑commerce integration frontier.");

    if (signals.length === 0) {
        return "Frontier Scan: Baseline E‑commerce scan complete. No specialized indicators detected. Optimization will focus on universal retail performance factors.";
    }

    return "Frontier Scan: " + signals.join(" | ");
}

// Best path selector (with universal E‑commerce fallback)
function chooseBestPath(details) {
    const d = details.toLowerCase();

    if (d.includes("legal")) return "Recommended Path: Legal-Tech & Paralegal Optimization.";
    if (d.includes("ai") || d.includes("automation")) return "Recommended Path: AI Automation Workflow.";
    if (d.includes("payment") || d.includes("stripe")) return "Recommended Path: Stripe E‑commerce Integration.";
    if (d.includes("cyber")) return "Recommended Path: Cybersecurity-First Design.";

    return "Recommended Path: Universal E‑commerce Optimization — ideal for products without strong domain-specific signals.";
}

// Confidence score (baseline 0.55 if no tags found)
function confidenceScore(extractedTags) {
    if (extractedTags.length === 0) {
        return "0.55";
    }
    const score = Math.min(1, extractedTags.length / 10);
    return score.toFixed(2);
}

// Main agent function
function runLLMAgent(productName, productDetails) {
    const { description, extracted } = generateProductTagDescription(productName, productDetails);
    const reasoning = reasonAboutProduct(productName, productDetails);
    const frontier = frontierAnalysis(productDetails);
    const bestPath = chooseBestPath(productDetails);
    const confidence = confidenceScore(extracted);

    return (
        description + "\n\n" +
        reasoning + "\n" +
        frontier + "\n" +
        bestPath + "\n" +
        "Confidence: " + confidence
    );
}

// UI hook (used by your frontier-style box)
function runLLM() {
    const name = document.getElementById("productName").value;
    const details = document.getElementById("productDetails").value;
    const result = runLLMAgent(name, details);
    document.getElementById("output").innerText = result;
}
