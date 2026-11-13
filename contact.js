document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector(".contact-form");
    if (!form) return;

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

    form.addEventListener("submit", function (e) {
        let valid = true;
        Object.keys(rules).forEach(name => {
            const field = form.elements[name];
            if (field && !check(field)) valid = false;
        });
        if (!valid) e.preventDefault();
    });
});
          
