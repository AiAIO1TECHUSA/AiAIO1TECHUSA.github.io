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

    return "What I see: " + reasoning.join(" ");
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

    return "Quick scan: " + signals.join(" ");
}

// Recommended path in normal language (includes military angle)
function chooseBestPath(details) {
    const d = details.toLowerCase();

    // Military / USMC apparel path
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines"))
        return "Best angle: Present this as a vintage Marine Corps heritage tee that honors tradition, pride, and service.";
    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic"))
        return "Best angle: Sell this as patriotic military apparel that connects to service, sacrifice, and national pride.";

    // Other domains
    if (d.includes("legal")) return "Best angle: Sell this as a legal-tech or paralegal support tool.";
    if (d.includes("ai") || d.includes("automation")) return "Best angle: Highlight how it saves time with AI or automation.";
    if (d.includes("payment") || d.includes("stripe")) return "Best angle: Present it as a smooth, secure online payment or store solution.";
    if (d.includes("cyber")) return "Best angle: Emphasize security and protection as the main benefit.";

    return "Best angle: Position this as a trustworthy, easy-to-use product that improves everyday work.";
}

// Confidence score (baseline 0.55 if no tags found)
function confidenceScore(extractedTags) {
    if (extractedTags.length === 0) {
        return "0.55";
    }
    const score = Math.min(1, extractedTags.length / 10);
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
        description + "\n\n" +
        reasoning + "\n" +
        frontier + "\n" +
        bestPath + "\n" +
        "Confidence (0–1): " + confidence + "\n" +
        action
    );
}

// UI hook
function runLLM() {
    const name = document.getElementById("productName").value;
    const details = document.getElementById("productDetails").value;
    const result = runLLMAgent(name, details);
    document.getElementById("output").innerText = result;
}
,
