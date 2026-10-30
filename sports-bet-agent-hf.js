/**
 * Sports Wager Agent - HuggingFace Inference API Edition
 * Integrates Llama 2 chat model for sports pick analysis
 * No backend required - client-side only
 */

// ============================================================================
// CONFIGURATION & CONSTANTS
// ============================================================================

const CONFIG = {
    HF_API_ENDPOINT: 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf',
    THESPORTSDB_ENDPOINT: 'https://www.thesportsdb.com/api/v1/json/1',
    CACHE_TTL: 3600000, // 1 hour in milliseconds
    CACHE_MAX_SIZE: 500,
    MODEL_NAME: 'Llama-2-7b-chat-hf',
    TIMEOUT: 30000 // 30 seconds
};

// ============================================================================
// CACHE MANAGER
// ============================================================================

class CacheManager {
    constructor(maxSize = CONFIG.CACHE_MAX_SIZE) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.loadFromStorage();
    }

    set(key, value, ttl = CONFIG.CACHE_TTL) {
        const now = Date.now();
        const expiry = now + ttl;

        // Clean up expired entries
        this.prune();

        // If cache is full, remove oldest entry
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        this.cache.set(key, {
            value,
            expiry,
            created: now
        });

        this.saveToStorage();
    }

    get(key) {
        const entry = this.cache.get(key);
        if (!entry) return null;

        // Check if expired
        if (Date.now() > entry.expiry) {
            this.cache.delete(key);
            this.saveToStorage();
            return null;
        }

        return entry.value;
    }

    prune() {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiry) {
                this.cache.delete(key);
            }
        }
        this.saveToStorage();
    }

    clear() {
        this.cache.clear();
        localStorage.removeItem('sportsBetAgentCache');
    }

    saveToStorage() {
        try {
            const cacheData = Array.from(this.cache.entries());
            localStorage.setItem('sportsBetAgentCache', JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Failed to save cache to localStorage:', e);
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('sportsBetAgentCache');
            if (stored) {
                const cacheData = JSON.parse(stored);
                this.cache = new Map(cacheData);
                this.prune();
            }
        } catch (e) {
            console.warn('Failed to load cache from localStorage:', e);
        }
    }
}

const cacheManager = new CacheManager();

// ============================================================================
// SPORTS DATA LAYER
// ============================================================================

class SportsDataLayer {
    static async getTeamData(teamName, sport) {
        const cacheKey = `team_${teamName}_${sport}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            // Search for team in TheSportsDB
            const response = await fetch(
                `${CONFIG.THESPORTSDB_ENDPOINT}/search_all_teams.php?l=${this.encodeLeague(sport)}`,
                { signal: AbortSignal.timeout(CONFIG.TIMEOUT) }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            if (!data.teams) return null;

            // Find matching team (case-insensitive, partial match)
            const team = data.teams.find(t =>
                t.strTeam.toLowerCase().includes(teamName.toLowerCase()) ||
                teamName.toLowerCase().includes(t.strTeam.toLowerCase())
            );

            if (team) {
                const teamData = {
                    id: team.idTeam,
                    name: team.strTeam,
                    logo: team.strTeamBadge,
                    founded: team.intFormedYear,
                    stadium: team.strStadium,
                    description: team.strDescriptionEN
                };
                cacheManager.set(cacheKey, teamData);
                return teamData;
            }

            return null;
        } catch (error) {
            console.error(`Error fetching team data for ${teamName}:`, error);
            return null;
        }
    }

    static async getLeagueStandings(sport) {
        const cacheKey = `standings_${sport}`;
        const cached = cacheManager.get(cacheKey);
        if (cached) return cached;

        try {
            const leagueId = this.getSportLeagueId(sport);
            if (!leagueId) return null;

            const response = await fetch(
                `${CONFIG.THESPORTSDB_ENDPOINT}/eventslast.php?id=${leagueId}`,
                { signal: AbortSignal.timeout(CONFIG.TIMEOUT) }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();

            cacheManager.set(cacheKey, data.results || []);
            return data.results || [];
        } catch (error) {
            console.error(`Error fetching standings for ${sport}:`, error);
            return [];
        }
    }

    static encodeLeague(sport) {
        const leagues = {
            'NFL': 'NFL',
            'NBA': 'NBA',
            'MLB': 'MLB',
            'NHL': 'NHL',
            'College Football': 'American_Football',
            'College Basketball': 'Basketball',
            'Soccer': 'English Premier League'
        };
        return encodeURIComponent(leagues[sport] || sport);
    }

    static getSportLeagueId(sport) {
        const leagueIds = {
            'NFL': '133602',
            'NBA': '133603',
            'MLB': '133602',
            'NHL': '133604'
        };
        return leagueIds[sport] || null;
    }
}

// ============================================================================
// HUGGINGFACE INFERENCE CLIENT
// ============================================================================

class HuggingFaceClient {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.endpoint = 'https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf';
    }

    async generatePick(prompt) {
        if (!this.apiKey) {
            throw new Error('HuggingFace API key not configured. Please set HUGGINGFACE_API_KEY in localStorage.');
        }
// ADD THIS:
    console.log('API Key first 10 chars:', this.apiKey.substring(0, 10));
    console.log('API Key last 10 chars:', this.apiKey.substring(this.apiKey.length - 10));
    console.log('API Key total length:', this.apiKey.length);
    
    try {
        alert('Step 1: About to fetch\nEndpoint: ' + this.endpoint + '\nAPI Key length: ' + this.apiKey.length);
        try {
            alert('Step 1: About to fetch\nEndpoint: ' + this.endpoint + '\nAPI Key length: ' + this.apiKey.length);

            const response = await fetch(this.endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 1024,
                        temperature: 0.7,
                        top_p: 0.95,
                        do_sample: true,
                        return_full_text: false
                    }
                }),
                signal: AbortSignal.timeout(30000)
            });

            alert('Step 2: Fetch completed\nStatus: ' + response.status);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`HuggingFace API Error: ${error.error || response.statusText}`);
            }

            const data = await response.json();
            alert('Step 3: Got response data');

            const text = Array.isArray(data)
                ? data[0].generated_text
                : data.generated_text || '';

            return text.trim();
        } catch (error) {
            alert('❌ ERROR:\nType: ' + error.name + '\nMessage: ' + error.message);
            throw error;
        }
    }
}


// ============================================================================
// SPORTS PICK AGENT
// ============================================================================

class SportsPickAgent {
    constructor(hfClient) {
        this.hfClient = hfClient;
        this.sportAdapters = {
            'NFL': this.createNFLAdapter(),
            'NBA': this.createNBAAdapter(),
            'MLB': this.createMLBAdapter(),
            'NHL': this.createNHLAdapter()
        };
    }

    async generatePick(gameData) {
        try {
            if (!gameData.homeTeam || !gameData.awayTeam || !gameData.sport) {
                throw new Error('Missing required game data: homeTeam, awayTeam, sport');
            }

            const adapter = this.sportAdapters[gameData.sport] || this.createGenericAdapter();
            const prompt = this.buildPrompt(gameData, adapter);

            console.log('Sending prompt to HuggingFace:', prompt);

            const response = await this.hfClient.generatePick(prompt);
            const pick = this.parseResponse(response, gameData);

            return pick;
        } catch (error) {
            console.error('Error generating pick:', error);
            throw error;
        }
    }

    async analyzeWager(prompt) {
        try {
            console.log('Agent object:', this); // ← STEP 2
            console.log('analyzeWager method:', this.analyzeWager); // ← STEP 2
            
            console.log('📤 Calling HuggingFace with prompt:', prompt);
            const response = await this.hfClient.generatePick(prompt);
            console.log('✅ Response received:', response);
            return response;
        } catch (error) {
            console.error('❌ Error in analyzeWager:', error);
            throw error;
        }
    }

    buildPrompt(gameData, adapter) {
        const { homeTeam, awayTeam, sport, wagerType, oddsLine, gameDate, additionalContext } = gameData;

        return `You are a professional sports analyst. Analyze this matchup and provide a single sports pick.

MATCHUP:
- Home Team: ${homeTeam}
- Away Team: ${awayTeam}
- Sport: ${sport}
- Wager Type: ${wagerType}
- Line/Odds: ${oddsLine}
- Game Time: ${gameDate || 'TBD'}
${additionalContext ? `- Context: ${additionalContext}` : ''}

SPORT-SPECIFIC FACTORS TO CONSIDER:
${adapter.factors.join('\n')}

REQUIRED ANALYSIS FORMAT:
1. **Pick**: State your pick clearly (e.g., "Take Home Team" or "Under")
2. **Confidence**: Rate 0-100 (e.g., "Confidence: 72%")
3. **Reasoning**: 2-3 sentences explaining your pick
4. **Risk Factors**: List 2-3 key risks
5. **Contrarian Angle**: Explain the opposite take

Be concise and actionable. Focus on data-driven analysis, not emotion.`;
    }

    parseResponse(response, gameData) {
        // Extract pick information from response
        const lines = response.split('\n').filter(line => line.trim());

        // Default values
        let pick = gameData.homeTeam;
        let confidence = 50;
        let reasoning = '';
        let riskFactors = [];
        let contrarian = '';
        let pickType = gameData.wagerType;

        // Parse response text
        let currentSection = '';
        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            if (lowerLine.includes('pick:')) {
                currentSection = 'pick';
                const pickText = line.split(':')[1]?.trim() || '';
                if (pickText.includes(gameData.awayTeam) || pickText.includes('away') || pickText.includes('under')) {
                    pick = gameData.awayTeam;
                }
            } else if (lowerLine.includes('confidence:')) {
                currentSection = 'confidence';
                const confText = line.match(/\d+/);
                if (confText) confidence = parseInt(confText[0]);
            } else if (lowerLine.includes('reasoning:')) {
                currentSection = 'reasoning';
                reasoning = line.split(':')[1]?.trim() || '';
            } else if (lowerLine.includes('risk')) {
                currentSection = 'risk';
            } else if (lowerLine.includes('contrarian')) {
                currentSection = 'contrarian';
            } else if (currentSection === 'reasoning' && reasoning.length < 500) {
                reasoning += ' ' + line.trim();
            } else if (currentSection === 'risk' && line.trim()) {
                riskFactors.push(line.replace(/^[-•*]\s*/, '').trim());
            } else if (currentSection === 'contrarian' && line.trim()) {
                contrarian += ' ' + line.trim();
            }
        }

        return {
            gameId: `${gameData.homeTeam}_vs_${gameData.awayTeam}_${Date.now()}`,
            league: gameData.sport,
            pick: pick,
            confidence: Math.min(100, Math.max(0, confidence)),
            pickType: pickType,
            reasoning: reasoning.trim() || 'Pick generated from AI analysis',
            riskFactors: riskFactors.length > 0 ? riskFactors : ['Limited historical data', 'Market volatility'],
            contrarian: contrarian.trim() || 'Consider the opposite bet if line value is favorable',
            homeTeam: gameData.homeTeam,
            awayTeam: gameData.awayTeam,
            oddsLine: gameData.oddsLine,
            timestamp: new Date().toISOString()
        };
    }

    createNFLAdapter() {
        return {
            factors: [
                '- Home field advantage: ~3 points',
                '- Quarterback health and performance trends',
                '- Weather conditions (wind, rain impact on passing)',
                '- Recent offensive/defensive line injuries',
                '- Divisional rivalry implications',
                '- Rest days and travel fatigue'
            ]
        };
    }

    createNBAAdapter() {
        return {
            factors: [
                '- Home court advantage: ~3 points',
                '- Star player availability and rest management',
                '- Bench depth and role player contributions',
                '- Pace of play and defensive efficiency',
                '- Back-to-back game fatigue',
                '- Three-point shooting trends'
            ]
        };
    }

    createMLBAdapter() {
        return {
            factors: [
                '- Pitcher quality and health (era, recent form)',
                '- Altitude effects (Denver/Arizona parks)',
                '- Weather: temperature, wind direction/speed',
                '- Home run factors and ballpark dimensions',
                '- Bullpen depth and recent usage',
                '- Day game vs. night game performance'
            ]
        };
    }

    createNHLAdapter() {
        return {
            factors: [
                '- Home ice advantage: ~1.5 points',
                '- Goalie matchup and recent save percentage',
                '- Travel fatigue and time zone changes',
                '- Back-to-back games and rest days',
                '- Injury status of key defensemen',
                '- Power play and penalty kill efficiency'
            ]
        };
    }

    createGenericAdapter() {
        return {
            factors: [
                '- Home team advantage',
                '- Recent form and momentum',
                '- Head-to-head historical matchups',
                '- Player injuries and roster health',
                '- Playoff/championship implications',
                '- Public perception vs. sharp money'
            ]
        };
    }
}
// ============================================================================
// UI CONTROLLER
// ============================================================================

class UIController {
    constructor() {
        this.form = document.getElementById('wagerForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.loading = document.getElementById('loading');
        this.resultsSection = document.getElementById('resultsSection');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.errorSection = document.getElementById('errorSection');
        this.errorTitle = document.getElementById('errorTitle');
        this.errorMessage = document.getElementById('errorMessage');
        this.hfClient = null;
        this.agent = null;

        this.init();
    }

    init() {
        this.checkAPIKey();
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // The reset button already clears the form by default (type="reset")
        // But we add extra cleanup:
        this.form.addEventListener('reset', () => this.onFormReset());
    }

    checkAPIKey() {
        // Load API key from injected config file
        const apiKey = window.HUGGINGFACE_API_KEY;

        if (apiKey) {
            this.hfClient = new HuggingFaceClient(apiKey);
            this.agent = new SportsPickAgent(this.hfClient);
            this.submitBtn.disabled = false;
            console.log('✅ API key loaded from environment.');
        } else {
            // Fallback: Check localStorage (for local development)
            const localApiKey = localStorage.getItem('HUGGINGFACE_API_KEY');
            if (localApiKey) {
                this.hfClient = new HuggingFaceClient(localApiKey);
                this.agent = new SportsPickAgent(this.hfClient);
                this.submitBtn.disabled = false;
                console.log('✅ API key loaded from localStorage.');
            } else {
                console.warn('❌ No API key found. Configure HUGGINGFACE_API_KEY.');
                this.submitBtn.disabled = true;
                this.showError('API key not configured. Please set HUGGINGFACE_API_KEY in GitHub Secrets.');
            }
        }
    }

    async handleSubmit(e) {
        e.preventDefault(); // FIXED: Added parentheses

        // Validate form inputs
        const homeTeam = document.getElementById('homeTeam').value.trim();
        const awayTeam = document.getElementById('awayTeam').value.trim();
        const sport = document.getElementById('sport').value;
        const wagerType = document.getElementById('wagerType').value;
        const oddsLine = document.getElementById('oddsLine').value.trim(); // FIXED: oddsLine, not odds
        const gameDate = document.getElementById('gameDate').value;
        const context = document.getElementById('additionalContext').value.trim();

        if (!homeTeam || !awayTeam || !sport || !wagerType || !oddsLine || !gameDate) {
            this.showError('Please fill in all required fields.');
            return;
        }

        // Validate API client is ready
        if (!this.agent) {
            this.showError('AI agent not initialized. Please configure your API key.');
            return;
        }
alert('STEP 0: All validations passed. Agent exists.');
        // Show loading state
        this.loading.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';

        try {
            // Build prompt for agent
            const prompt = `Analyze this sports wager:
Home Team: ${homeTeam}
Away Team: ${awayTeam}
Sport: ${sport}
Wager Type: ${wagerType}
Odds/Line: ${oddsLine}
Game Date: ${gameDate}
Additional Context: ${context || 'None provided'}

Provide a detailed analysis on the wager's value and risk factors.`;

            console.log('📤 Sending analysis request to HuggingFace...');
            
            // Call agent
            const response = await this.agent.analyzeWager(prompt);

            console.log('✅ Received response from AI.');
            
            // Display results
            this.displayResults(response);
            this.resultsSection.style.display = 'block';
        } catch (error) {
            console.error('❌ Error analyzing wager:', error);
            this.showError(`Error analyzing wager: ${error.message}`);
        } finally {
            this.loading.style.display = 'none';
        }
    }

    onFormReset() {
        // Clear results when user clicks reset button
        this.resultsSection.style.display = 'none';
        this.errorSection.style.display = 'none';
        console.log('🧹 Form cleared.');
    }

    displayResults(response) {
        this.resultsContainer.innerHTML = `
            <div class="result-card">
                <p>${response}</p>
            </div>
        `;
        this.resultsSection.style.display = 'block';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorSection.style.display = 'block';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new UIController();
});
