// standards-2027-2.js
// Core registration, calendar, and contact management

class RegistrationManager {
    constructor() {
        this.storageKey = 'registerStatus_legal_memo';
        this.expirationDays = 7;
        this.calendarUrl = 'https://calendly.com/patlucero2026';
    }

    // ============================================
    // REGISTRATION FUNCTIONS
    // ============================================
    
    registerUser(name, email) {
        const expirationTime = Date.now() + (this.expirationDays * 24 * 60 * 60 * 1000);
        const registrationData = {
            name: name,
            email: email,
            timestamp: Date.now(),
            expiration: expirationTime
        };
        localStorage.setItem(this.storageKey, JSON.stringify(registrationData));
        return true;
    }

    isRegistered() {
        const data = JSON.parse(localStorage.getItem(this.storageKey));
        if (!data) return false;
        
        if (Date.now() > data.expiration) {
            localStorage.removeItem(this.storageKey);
            return false;
        }
        return true;
    }

    getStoredEmail() {
        const data = JSON.parse(localStorage.getItem(this.storageKey));
        return data ? data.email : null;
    }

    // ============================================
    // CALENDAR FUNCTIONS
    // ============================================

    openCalendar() {
        window.open(this.calendarUrl, '_blank');
    }

    setCalendarUrl(url) {
        this.calendarUrl = url;
    }

    // ============================================
    // CONTACT FORM TOGGLE
    // ============================================

    initContactToggle() {
    const checkbox = document.getElementById('wantContact');
    const form = document.getElementById('contactForm');
    const emailField = document.getElementById('contactEmail');
    const calendarLink = document.getElementById('calendarLink');

    if (checkbox && form) {
        checkbox.addEventListener('change', () => {
            form.style.display = checkbox.checked ? 'block' : 'none';
        });

        // Auto-populate email from registration
const storedEmail = this.getStoredEmail();
if (storedEmail && emailField) {
    emailField.value = storedEmail;
    // DON'T set readOnly — let it be editable if needed
}

        // Set calendar link to your Calendly profile
        if (calendarLink) {
            calendarLink.href = 'https://calendly.com/patlucero2026';
            calendarLink.target = '_blank';
            calendarLink.rel = 'noopener noreferrer';
        }
    }
}


    // ============================================
    // PRINT & REDIRECT
    // ============================================

    printAndClose() {
        window.print();
        // Optionally redirect after print
        // window.location.href = 'legal-memo-interactive.htm';
    }
}

// Initialize on page load
const regManager = new RegistrationManager();
document.addEventListener('DOMContentLoaded', () => {
    regManager.initContactToggle();
});
