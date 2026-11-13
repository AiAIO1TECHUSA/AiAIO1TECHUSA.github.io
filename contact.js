document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("form");
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');

    const rules = {
        name: { test: v => v.trim().length > 0, error: "name-error" },
        email: { test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), error: "email-error" },
        message: { test: v => v.trim().length >= 10, error: "message-error" }
    };

    function check(field) {
        const rule = rules[field.name];
        if (!rule) return true;
        const ok = rule.test(field.value);
        const msg = document.getElementById(rule.error);
        field.setAttribute("aria-invalid", ok ? "false" : "true");
        if (msg) msg.hidden = ok;
        return ok;
    }

    Object.keys(rules).forEach(name => {
        const field = form.elements[name];
        if (field) field.addEventListener("blur", () => check(field));
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        let valid = true;
        Object.keys(rules).forEach(name => {
            const field = form.elements[name];
            if (field && !check(field)) valid = false;
        });
        if (!valid) return;

        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: new FormData(form)
            });
            const data = await response.json();
            if (response.ok && data.success) {
                window.location.href = "https://aiaio1techusa.github.io/thank-you.html?from=" + encodeURIComponent(window.location.href);
            } else {
                alert("Error: " + (data.message || "Please try again."));
            }
        } catch (error) {
            alert("Something went wrong. Please try again.");
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
