// ===============================
// Military‑Aware LLM‑AGENT (Plain English, E‑commerce + USMC Apparel)
// ===============================

// Core tag generator with dynamic keyword extraction
function generateProductTagDescription(productName, productDetails) {
    const keywordList = [
        "secure", "encrypted", "professional", "modern", "responsive",
        "ai", "automation", "workflow", "cyber", "payment", "stripe",
        "legal", "case", "document", "support", "tech",
        "usmc", "marine", "marines", "military", "veteran", "patriotic"
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

// Plain-English reasoning (includes military apparel awareness)
function reasonAboutProduct(name, details) {
    const reasoning = [];
    const d = details.toLowerCase();

    // Legal / tech / security / AI / payments
    if (d.includes("legal")) reasoning.push("This looks like a legal or paralegal tool.");
    if (d.includes("secure") || d.includes("encrypted") || d.includes("cyber"))
        reasoning.push("Security seems important for this product.");
    if (d.includes("ai") || d.includes("automation"))
        reasoning.push("AI or automation is part of the value.");
    if (d.includes("payment") || d.includes("stripe"))
        reasoning.push("This product is connected to online payments or Stripe.");
    if (d.includes("responsive") || d.includes("modern"))
        reasoning.push("It’s designed to work well on modern devices.");

    // Military / USMC apparel
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines") ||
        d.includes("military") || d.includes("veteran") || d.includes("patriotic")) {
        reasoning.push("This is military-themed apparel with strong emotional and heritage appeal.");
    }

    if (reasoning.length === 0) {
        return "What I see: This looks like a general product. I’ll focus on making it easier to find and understand online.";
    }

    return "Identity read: " + reasoning.join("; ");

}

// Simple “scan” explanation (includes military signals)
function frontierAnalysis(details) {
    const signals = [];
    const d = details.toLowerCase();

    if (d.includes("automation")) signals.push("It could help automate work.");
    if (d.includes("workflow")) signals.push("It might improve how people manage their tasks.");
    if (d.includes("cyber")) signals.push("There’s a cybersecurity angle here.");
    if (d.includes("responsive")) signals.push("It should work well on phones and tablets.");
    if (d.includes("stripe")) signals.push("It fits into an online store or payment setup.");

    // Military / USMC apparel frontier signals
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines"))
        signals.push("Strong Marine Corps heritage and identity signal.");
    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic"))
        signals.push("Appeals to military pride, service, and patriotic buyers.");

    if (signals.length === 0) {
        return "Quick scan: Nothing super specific jumps out, but it can still be sold as a solid, reliable product.";
    }

    return "Scan results: " + signals.join("; ");

}

function chooseBestPath(name, details) {
    const d = (name + " " + details).toLowerCase();

    // Military / USMC apparel path
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines"))
        return "Recommended angle: Position this as a vintage Marine Corps heritage piece — built on pride, tradition, and Recon identity.";

    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic"))
        return "Recommended angle: Frame this as patriotic military apparel that connects directly to service, sacrifice, and national pride.";

    // Other domains
    if (d.includes("legal"))
        return "Recommended angle: Present this as a legal‑tech or paralegal support tool designed for clarity, speed, and reliability.";

    if (d.includes("ai") || d.includes("automation"))
        return "Recommended angle: Emphasize time‑saving automation and AI‑driven workflow efficiency.";

    if (d.includes("payment") || d.includes("stripe"))
        return "Recommended angle: Highlight secure, frictionless online payment capability.";

    if (d.includes("cyber"))
        return "Recommended angle: Lead with cybersecurity, protection, and modern digital resilience.";

    // Default fallback
    return "Recommended angle: Present this as a clean, dependable product with clear value and straightforward purpose.";
}

function confidenceScore(extractedTags) {
    if (extractedTags.length === 0) {
        return "0.55"; // baseline confidence
    }

    // Weighted confidence: tags matter more when they are military or identity-based
    const weight = extractedTags.length * 0.12;
    const score = Math.min(1, 0.55 + weight);

    return score.toFixed(2);
}

// Main agent function with a clear recommendation action
function runLLMAgent(productName, productDetails) {
    const { description, extracted } = generateProductTagDescription(productName, productDetails);
    const reasoning = reasonAboutProduct(productName, productDetails);
    const frontier = frontierAnalysis(productDetails);
    const bestPath = chooseBestPath(productDetails);
    const confidence = confidenceScore(extracted);

    const action =
        "Next step: Use these tags in your product listing and write 2–3 short sentences that match the “best angle” above.";

    return (
    "IDENTITY READ — " + description + "\n\n" +
    "SITUATION — " + reasoning + "\n" +
    "FRONTIER SCAN — " + frontier + "\n" +
    "BEST ANGLE — " + bestPath + "\n" +
    "CONFIDENCE — " + confidence + "\n\n" +
    "ACTION — Deliver a tight, mission‑ready product listing. Lead with identity, reinforce heritage, and close with a clear value statement."
);
}
