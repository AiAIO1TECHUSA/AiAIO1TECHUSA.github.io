// Simple tag description
function generateProductTagDescription(name, details) {
    const base = (name + " " + details).toLowerCase();
    const tags = [];

    if (base.includes("usmc") || base.includes("marine") || base.includes("marines"))
        tags.push("marine-corps", "heritage", "military");
    if (base.includes("veteran")) tags.push("veteran");
    if (base.includes("patriotic")) tags.push("patriotic");
    if (base.includes("legal")) tags.push("legal-tech", "paralegal");
    if (base.includes("ai")) tags.push("ai", "automation");
    if (base.includes("cyber")) tags.push("cybersecurity");

    const description = `Product identity: ${name}. Tags: ${tags.join(", ") || "none detected"}.`;
    return { description, extracted: tags };
}

// Reasoning
function reasonAboutProduct(name, details) {
    return `This product appears to be: ${name}, described as: ${details}. Core use: identity, utility, and clear value.`;
}

// Frontier scan
function frontierAnalysis(text) {
    if (text.toLowerCase().includes("usmc") || text.toLowerCase().includes("marine"))
        return "Strong Marine Corps heritage and identity signal detected.";
    if (text.toLowerCase().includes("legal"))
        return "Legal-tech or paralegal support context detected.";
    return "Standard product context with no extreme frontier signals.";
}

// Best path (includes military angle)
function chooseBestPath(name, details) {
    const d = (name + " " + details).toLowerCase();

    // Military / USMC apparel path
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines"))
        return "Position this as a vintage Marine Corps heritage piece built on pride, tradition, and service.";

    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic"))
        return "Frame this as patriotic military apparel that connects to service, sacrifice, and national pride.";

    // Other domains
    if (d.includes("legal"))
        return "Present this as a legal-tech or paralegal support tool focused on clarity and reliability.";

    if (d.includes("ai") || d.includes("automation"))
        return "Highlight time-saving automation and AI-driven workflow efficiency.";

    if (d.includes("payment") || d.includes("stripe"))
        return "Present it as a smooth, secure online payment or store solution.";

    if (d.includes("cyber"))
        return "Emphasize security, protection, and digital resilience as the main benefit.";

    return "Present this as a clean, dependable product with clear value and straightforward purpose.";
}

// Confidence score
function confidenceScore(tags) {
    if (!tags || !tags.length) return 0.5;
    if (tags.length <= 2) return 0.7;
    if (tags.length <= 4) return 0.85;
    return 0.95;
}

// On-the-spot sales copy
function generateSalesCopy(name, details, bestPath) {
    const d = (name + " " + details).toLowerCase();

    if (d.includes("usmc") || d.includes("marine") || d.includes("marines")) {
        return "SALES COPY — Show your Marine Corps pride with this vintage-inspired piece. Built for Marines, veterans, and supporters who carry the Corps spirit.";
    }

    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic")) {
        return "SALES COPY — A patriotic, military-inspired tee for those who honor service and sacrifice. Everyday comfort with a bold identity.";
    }

    if (d.includes("legal")) {
        return "SALES COPY — A reliable legal-tech support tool designed to keep workflows clear, fast, and professional.";
    }

    if (d.includes("ai") || d.includes("automation")) {
        return "SALES COPY — Streamline your workflow with AI-powered automation that saves time and reduces manual effort.";
    }

    if (d.includes("cyber")) {
        return "SALES COPY — A cybersecurity-focused product built for protection, reliability, and modern digital defense.";
    }

    return "SALES COPY — A clean, dependable product designed for everyday use with clear, straightforward value.";
}

// Main agent
function runLLMAgent(productName, productDetails) {
    const { description, extracted } = generateProductTagDescription(productName, productDetails);
    const reasoning = reasonAboutProduct(productName, productDetails);
    const frontier = frontierAnalysis(productName + " " + productDetails);
    const bestPath = chooseBestPath(productName, productDetails);
    const confidence = confidenceScore(extracted);
    const salesCopy = generateSalesCopy(productName, productDetails, bestPath);

    return (
        "IDENTITY READ — " + description + "\n\n" +
        "SITUATION — " + reasoning + "\n" +
        "FRONTIER SCAN — " + frontier + "\n" +
        "BEST ANGLE — " + bestPath + "\n" +
        "CONFIDENCE — " + confidence + "\n\n" +
        salesCopy + "\n\n" +
        "ACTION — Use this output as your product listing draft. Lead with identity, reinforce the angle, and close with clear value."
    );
}
