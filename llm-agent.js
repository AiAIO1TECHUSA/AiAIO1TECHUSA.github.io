function generateSalesCopy(name, details, bestPath) {
    const d = (name + " " + details).toLowerCase();

    // USMC / Recon / Military apparel
    if (d.includes("usmc") || d.includes("marine") || d.includes("marines") || d.includes("recon")) {
        return (
            "SALES COPY — " +
            "Show your Marine Corps pride with this vintage Force Recon tee. Built for Marines, veterans, and supporters who carry the Recon spirit. " +
            "Classic red, heritage‑driven design — perfect for daily wear, gym sessions, or honoring the Corps at events."
        );
    }

    if (d.includes("military") || d.includes("veteran") || d.includes("patriotic")) {
        return (
            "SALES COPY — " +
            "A patriotic, military‑inspired tee designed for those who honor service and sacrifice. Clean design, bold identity, everyday comfort."
        );
    }

    // Legal / tech / AI / cyber
    if (d.includes("legal")) {
        return (
            "SALES COPY — " +
            "A reliable legal‑tech support tool built for clarity, speed, and professional workflow efficiency."
        );
    }

    if (d.includes("ai") || d.includes("automation")) {
        return (
            "SALES COPY — " +
            "Streamline your workflow with AI‑powered automation designed to save time and boost productivity."
        );
    }

    if (d.includes("cyber")) {
        return (
            "SALES COPY — " +
            "A modern cybersecurity‑focused product built for protection, reliability, and digital resilience."
        );
    }

    // Generic fallback
    return (
        "SALES COPY — " +
        "A clean, dependable product designed for everyday use with clear value and straightforward purpose."
    );
}
