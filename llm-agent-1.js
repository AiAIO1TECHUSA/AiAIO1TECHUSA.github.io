/* ============================================================
   PRODUCT FRONTIER AGENT
   Product identity + image intelligence + SEO + Stripe metadata
   ============================================================ */

"use strict";

/* ---------- Utilities ---------- */

function clean(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
}

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function slugify(value) {
    return clean(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .substring(0, 80);
}

/* ---------- Product classification ---------- */

function detectProductSignals(name, details, imageDescription = "") {
    const base = [
        name,
        details,
        imageDescription
    ].join(" ").toLowerCase();

    const tags = [];
    const categories = [];

    const rules = [
        {
            words: ["usmc", "marine corps", "marines", "marine"],
            tags: ["marine-corps", "military", "heritage"],
            category: "Military Heritage Apparel"
        },
        {
            words: ["veteran", "veterans"],
            tags: ["veteran", "military-heritage"],
            category: "Veteran Apparel"
        },
        {
            words: ["air force"],
            tags: ["air-force", "military"],
            category: "Military Heritage Apparel"
        },
        {
            words: ["navy", "seal team", "naval"],
            tags: ["navy", "military"],
            category: "Military Heritage Apparel"
        },
        {
            words: ["coast guard"],
            tags: ["coast-guard", "military"],
            category: "Military Heritage Apparel"
        },
        {
            words: ["cyber", "cybersecurity"],
            tags: ["cybersecurity", "security"],
            category: "Cybersecurity"
        },
        {
            words: ["legal", "paralegal", "law firm"],
            tags: ["legal-tech", "paralegal"],
            category: "Legal Technology"
        },
        {
            words: ["ai", "artificial intelligence", "automation"],
            tags: ["ai", "automation"],
            category: "AI & Automation"
        }
    ];

    for (const rule of rules) {
        if (rule.words.some(word => base.includes(word))) {
            tags.push(...rule.tags);
            categories.push(rule.category);
        }
    }

    return {
        tags: [...new Set(tags)],
        categories: [...new Set(categories)],
        primaryCategory:
            [...new Set(categories)][0] || "General Product"
    };
}

/* ---------- Image analysis ---------- */

/*
 * This function reads information that the browser itself can obtain:
 * dimensions, file size, MIME type and filename.
 *
 * For actual visual understanding (objects, logos, text, etc.),
 * send the image to YOUR secure server endpoint.
 *
 * Do NOT put an AI API secret directly in browser JavaScript.
 */

async function inspectProductImage(file) {
    if (!file) {
        return {
            available: false,
            description: "",
            metadata: {}
        };
    }

    const metadata = {
        filename: file.name,
        type: file.type,
        sizeBytes: file.size
    };

    const localUrl = URL.createObjectURL(file);

    try {
        const image = new Image();

        await new Promise((resolve, reject) => {
            image.onload = resolve;
            image.onerror = reject;
            image.src = localUrl;
        });

        metadata.width = image.naturalWidth;
        metadata.height = image.naturalHeight;
        metadata.aspectRatio =
            Number((image.naturalWidth / image.naturalHeight).toFixed(3));

        /*
         * Optional secure vision endpoint.
         *
         * Your backend should accept:
         * multipart/form-data
         * field name: image
         *
         * and return:
         *
         * {
         *   "description": "...",
         *   "objects": [],
         *   "text": [],
         *   "visualTags": []
         * }
         */

        let vision = {
            description: "",
            objects: [],
            text: [],
            visualTags: []
        };

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("/api/describe-image", {
                method: "POST",
                body: formData
            });

            if (response.ok) {
                vision = await response.json();
            }
        } catch (visionError) {
            console.warn(
                "Image vision service unavailable:",
                visionError
            );
        }

        return {
            available: true,
            url: localUrl,
            metadata,
            description: clean(vision.description),
            objects: Array.isArray(vision.objects)
                ? vision.objects
                : [],
            text: Array.isArray(vision.text)
                ? vision.text
                : [],
            visualTags: Array.isArray(vision.visualTags)
                ? vision.visualTags
                : []
        };

    } catch (error) {
        URL.revokeObjectURL(localUrl);

        return {
            available: false,
            description: "",
            metadata,
            error: "Unable to read product image."
        };
    }
}

/* ---------- Product identity ---------- */

function buildProductIdentity({
    name,
    details,
    productId,
    stripeUrl,
    imageAnalysis
}) {
    const imageDescription =
        imageAnalysis?.description || "";

    const signals = detectProductSignals(
        name,
        details,
        imageDescription
    );

    const identityText = [
        name,
        details,
        imageDescription
    ].join(" ");

    const sku =
        clean(productId) ||
        `AUTO-${slugify(name).toUpperCase()}`;

    return {
        productId: sku,
        name: clean(name),
        details: clean(details),
        stripeUrl: clean(stripeUrl),
        imageDescription,
        tags: signals.tags,
        categories: signals.categories,
        primaryCategory: signals.primaryCategory,
        identityText
    };
}

/* ---------- Product description ---------- */

function generateProductDescription(product) {
    const parts = [];

    if (product.name) {
        parts.push(product.name);
    }

    if (product.details) {
        parts.push(product.details);
    }

    if (product.imageDescription) {
        parts.push(product.imageDescription);
    }

    let description = clean(parts.join(" — "));

    if (!description) {
        description =
            "Product listing with clear identity and product information.";
    }

    /*
     * Keep SEO description around the useful search-snippet range.
     */
    if (description.length > 300) {
        description = description.substring(0, 297) + "...";
    }

    return description;
}

/* ---------- SEO metadata ---------- */

function buildMetaDescription(product) {
    const description = generateProductDescription(product);

    return description.length > 160
        ? description.substring(0, 157) + "..."
        : description;
}

function buildSEO(product, imageAnalysis) {
    const description = buildMetaDescription(product);

    return {
        title: `${product.name} | #1TechUSA`,
        description,
        image: imageAnalysis?.url || "",
        productId: product.productId
    };
}

/* ---------- JSON-LD ---------- */

function buildProductSchema(product, imageAnalysis) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": generateProductDescription(product),
        "sku": product.productId,
        "category": product.primaryCategory
    };

    if (imageAnalysis?.url) {
        schema.image = imageAnalysis.url;
    }

    if (product.stripeUrl) {
        schema.offers = {
            "@type": "Offer",
            "url": product.stripeUrl,
            "priceCurrency": "USD"
        };
    }

    return schema;
}

/* ---------- Dynamic metadata ---------- */

function updatePageMetadata(product, imageAnalysis) {
    const seo = buildSEO(product, imageAnalysis);

    document.title = seo.title;

    setMeta("description", seo.description);
    setMeta("og:title", seo.title, "property");
    setMeta("og:description", seo.description, "property");

    if (seo.image) {
        setMeta("og:image", seo.image, "property");
    }

    setMeta(
        "product:id",
        product.productId,
        "property"
    );

    setMeta(
        "product:category",
        product.primaryCategory,
        "property"
    );

    /*
     * Add / replace Product JSON-LD.
     */
    let schemaNode =
        document.getElementById("dynamic-product-schema");

    if (!schemaNode) {
        schemaNode = document.createElement("script");
        schemaNode.type = "application/ld+json";
        schemaNode.id = "dynamic-product-schema";
        document.head.appendChild(schemaNode);
    }

    schemaNode.textContent = JSON.stringify(
        buildProductSchema(product, imageAnalysis),
        null,
        2
    );
}

function setMeta(name, content, attribute = "name") {
    if (!content) return;

    let node = document.head.querySelector(
        `meta[${attribute}="${CSS.escape(name)}"]`
    );

    if (!node) {
        node = document.createElement("meta");
        node.setAttribute(attribute, name);
        document.head.appendChild(node);
    }

    node.setAttribute("content", content);
}

/* ---------- Stripe validation ---------- */

function validateStripeUrl(url) {
    if (!url) {
        return {
            valid: false,
            message: "No Stripe Payment Link supplied."
        };
    }

    try {
        const parsed = new URL(url);

        const valid =
            parsed.hostname === "buy.stripe.com" ||
            parsed.hostname.endsWith(".stripe.com");

        return {
            valid,
            message: valid
                ? "Stripe payment link detected."
                : "URL does not appear to be a Stripe payment link."
        };

    } catch {
        return {
            valid: false,
            message: "Invalid payment URL."
        };
    }
}

/* ---------- Confidence ---------- */

function calculateConfidence(product, imageAnalysis) {
    let score = 0;

    if (product.name) score += 0.20;
    if (product.details) score += 0.20;
    if (product.productId) score += 0.15;
    if (product.stripeUrl) score += 0.15;
    if (imageAnalysis?.available) score += 0.10;
    if (product.imageDescription) score += 0.10;
    if (product.tags.length) score += 0.10;

    return Math.min(0.99, Number(score.toFixed(2)));
}

/* ---------- Frontier analysis ---------- */

function frontierAnalysis(product, imageAnalysis) {
    const signals = [];

    if (product.tags.includes("marine-corps")) {
        signals.push(
            "Marine Corps heritage identity detected."
        );
    }

    if (product.tags.includes("military")) {
        signals.push(
            "Military heritage/product identity detected."
        );
    }

    if (product.tags.includes("veteran")) {
        signals.push(
            "Veteran-oriented identity signal detected."
        );
    }

    if (product.tags.includes("cybersecurity")) {
        signals.push(
            "Cybersecurity product context detected."
        );
    }

    if (product.tags.includes("legal-tech")) {
        signals.push(
            "Legal technology context detected."
        );
    }

    if (product.tags.includes("ai")) {
        signals.push(
            "AI/automation context detected."
        );
    }

    if (imageAnalysis?.description) {
        signals.push(
            "Visual description available for listing enrichment."
        );
    }

    return signals.length
        ? signals
        : ["Standard product context detected."];
}

/* ---------- Sales/listing copy ---------- */

function generateSalesCopy(product) {
    const category = product.primaryCategory;

    if (category === "Military Heritage Apparel") {
        return (
            `${product.name} is presented as a vintage-inspired ` +
            `military heritage item with a clearly defined visual identity. ` +
            `The listing emphasizes the product design, heritage context, ` +
            `and everyday collectibility.`
        );
    }

    if (category === "Veteran Apparel") {
        return (
            `${product.name} is presented as veteran-oriented heritage ` +
            `apparel with emphasis on its visual design, identity, and ` +
            `collectible character.`
        );
    }

    if (category === "Cybersecurity") {
        return (
            `${product.name} is positioned around digital security, ` +
            `protection, reliability, and practical technology use.`
        );
    }

    if (category === "Legal Technology") {
        return (
            `${product.name} is positioned as a practical legal-technology ` +
            `solution focused on organization, clarity, and workflow support.`
        );
    }

    if (category === "AI & Automation") {
        return (
            `${product.name} is positioned around AI-assisted automation, ` +
            `workflow efficiency, and reducing repetitive work.`
        );
    }

    return (
        `${product.name} is presented with a clear product identity, ` +
        `descriptive information, and straightforward customer value.`
    );
}

/* ---------- Complete agent ---------- */

async function runLLMAgent({
    productName,
    productDetails,
    productId,
    stripeUrl,
    imageFile
}) {
    const imageAnalysis =
        await inspectProductImage(imageFile);

    const product = buildProductIdentity({
        name: productName,
        details: productDetails,
        productId,
        stripeUrl,
        imageAnalysis
    });

    const stripe = validateStripeUrl(
        product.stripeUrl
    );

    const confidence =
        calculateConfidence(
            product,
            imageAnalysis
        );

    const frontier =
        frontierAnalysis(
            product,
            imageAnalysis
        );

    const salesCopy =
        generateSalesCopy(product);

    updatePageMetadata(
        product,
        imageAnalysis
    );

    return {
        identity: {
            productId: product.productId,
            name: product.name,
            category: product.primaryCategory,
            tags: product.tags
        },

        description:
            generateProductDescription(product),

        image: {
            description:
                imageAnalysis.description || "No visual description returned.",
            metadata:
                imageAnalysis.metadata || {},
            detectedText:
                imageAnalysis.text || [],
            visualTags:
                imageAnalysis.visualTags || []
        },

        stripe: {
            paymentLink:
                product.stripeUrl,
            valid:
                stripe.valid,
            status:
                stripe.message
        },

        seo: buildSEO(
            product,
            imageAnalysis
        ),

        schema:
            buildProductSchema(
                product,
                imageAnalysis
            ),

        frontier,

        confidence,

        salesCopy
    };
}