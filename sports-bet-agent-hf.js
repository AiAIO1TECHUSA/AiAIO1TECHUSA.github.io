/* Sports Wager Agent — serverless front-end client.
 * The Hugging Face credential must stay in the serverless function's environment;
 * this browser code only calls the function endpoint.
 */

const CONFIG = Object.freeze({
    // GitHub Pages can't run functions (POSTs there return 405), so call the
    // Netlify-hosted function by absolute URL unless already on Netlify.
    PREDICT_ENDPOINT: window.SPORTS_BET_PREDICT_ENDPOINT ||
        (window.location.hostname.endsWith('netlify.app') || window.location.hostname === 'localhost'
            ? '/.netlify/functions/predict'
            : 'https://inspiring-licorice-2c7129.netlify.app/.netlify/functions/predict'),
    TIMEOUT: 30000
});

class HuggingFaceClient {
    constructor(endpoint = CONFIG.PREDICT_ENDPOINT) {
        this.endpoint = endpoint;
    }

    async generatePick(prompt) {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), CONFIG.TIMEOUT);

        try {
            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
                signal: controller.signal
            });

            const body = await response.json().catch(() => null);
            if (!response.ok) {
                const detail = body?.error || body?.message || `HTTP ${response.status}`;
                throw new Error(detail);
            }
            if (body?.error) {
                throw new Error(typeof body.error === 'string' ? body.error : 'The inference service returned an error.');
            }

            const generated = typeof body?.text === 'string'
                ? body.text
                : Array.isArray(body)
                    ? body[0]?.generated_text
                    : body?.generated_text;

            if (typeof generated !== 'string' || !generated.trim()) {
                throw new Error('The serverless inference service returned an empty response.');
            }
            return generated.trim();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('The analysis request timed out. Please try again.');
            }
            if (error instanceof TypeError) {
                throw new Error('Could not reach the serverless prediction function. Confirm it is deployed at ' + this.endpoint + '.');
            }
            throw error;
        } finally {
            window.clearTimeout(timeoutId);
        }
    }
}

class SportsPickAgent {
    constructor(client) {
        this.client = client;
    }

    async analyzeWager(game) {
        const prompt = `You are an assistant providing educational sports-wager analysis, not a guarantee or financial advice. Do not invent current statistics, injuries, odds, or other facts. Clearly say when information is missing. Analyze the wager and its risks, and avoid encouraging the user to bet more than they can afford.\n\n` +
            `MATCHUP\nHome team: ${game.homeTeam}\nAway team: ${game.awayTeam}\nSport: ${game.sport}\nWager type: ${game.wagerType}\nOdds/line: ${game.oddsLine}\nGame date/time: ${game.gameDate || 'Not provided'}\nAdditional context: ${game.context || 'None provided'}\n\n` +
            `Respond with: 1) what the wager means, 2) potential value and assumptions, 3) key risks and missing information, 4) a plausible opposing view. Do not present a confidence percentage as a measured probability.`;
        return this.client.generatePick(prompt);
    }
}

class UIController {
    constructor() {
        this.form = document.getElementById('wagerForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loading = document.getElementById('loading');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.errorSection = document.getElementById('errorSection');
        this.errorMessage = document.getElementById('errorMessage');
        this.agent = new SportsPickAgent(new HuggingFaceClient());

        if (!this.form) {
            console.warn('Wager form not found on this page.');
            return;
        }

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));
        this.form.addEventListener('reset', () => {
            this.hide(this.resultsSection);
            this.hide(this.errorSection);
        });
    }

    getValue(id) {
        return document.getElementById(id)?.value?.trim() || '';
    }

    async handleSubmit(event) {
        event.preventDefault();
        this.hide(this.errorSection);
        this.hide(this.resultsSection);

        if (!this.form.reportValidity()) return;

        const game = {
            homeTeam: this.getValue('homeTeam'),
            awayTeam: this.getValue('awayTeam'),
            sport: this.getValue('sport'),
            wagerType: this.getValue('wagerType'),
            oddsLine: this.getValue('oddsLine'),
            gameDate: this.getValue('gameDate'),
            context: this.getValue('additionalContext')
        };

        if (!game.homeTeam || !game.awayTeam || !game.sport || !game.wagerType || !game.oddsLine) {
            this.showError('Please complete all required fields.');
            return;
        }

        this.setBusy(true);
        this.show(this.loading);
        try {
            const analysis = await this.agent.analyzeWager(game);
            this.displayResults(analysis);
            this.show(this.resultsSection);
        } catch (error) {
            console.error('Wager analysis request failed:', error);
            this.showError(error.message || 'Analysis failed. Please try again.');
        } finally {
            this.hide(this.loading);
            this.setBusy(false);
        }
    }

    displayResults(text) {
        if (!this.resultsContainer) return;
        const card = document.createElement('div');
        card.className = 'result-card';
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.style.whiteSpace = 'pre-wrap';
        card.appendChild(paragraph);
        this.resultsContainer.replaceChildren(card);
    }

    showError(message) {
        if (this.errorMessage) this.errorMessage.textContent = message;
        this.show(this.errorSection);
    }

    setBusy(busy) {
        if (this.submitBtn) this.submitBtn.disabled = busy;
        if (this.form) this.form.setAttribute('aria-busy', String(busy));
    }

    show(element) {
        if (element) element.style.display = 'block';
    }

    hide(element) {
        if (element) element.style.display = 'none';
    }
}

function initializeSportsWagerUI() {
    if (!window.sportsWagerUIController) {
        window.sportsWagerUIController = new UIController();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSportsWagerUI, { once: true });
} else {
    initializeSportsWagerUI();
}
