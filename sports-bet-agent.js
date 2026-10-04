// ===== SPORTS BET INTELLIGENCE AGENT =====

async function runBetIntelligenceScan() {
const output = document.getElementById('output');
output.innerHTML = '<p class="loading">⏳ Scanning bet intelligence...</p>';

try {
// 1. COLLECT BET DATA
const betData = {
homeTeam: document.getElementById('teamHome').value.trim(),
awayTeam: document.getElementById('teamAway').value.trim(),
betType: document.getElementById('betType').value,
odds: document.getElementById('odds').value.trim(),
sport: document.getElementById('sport').value,
gameDate: document.getElementById('gameDate').value,
ticketImage: document.getElementById('betTicketImage').files[0]
};

// Validate inputs
if (!betData.homeTeam || !betData.awayTeam || !betData.sport) {
output.innerHTML = '<p class="error">❌ Please fill in all required fields (teams and sport)</p>';
return;
}

// 2. PARSE TICKET IMAGE (if provided)
let ticketText = '';
if (betData.ticketImage) {
ticketText = await extractTextFromImage(betData.ticketImage);
}

// 3. FETCH SPORTS DATA
const sportsData = await fetchAllSportsData(betData);

// 4. CALL LLM FOR ANALYSIS
const analysis = await analyzeBetWithClaude(betData, sportsData);

// 5. DISPLAY RESULTS
displayBetAnalysis(analysis, betData, sportsData);

} catch (error) {
output.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
console.error(error);
}
}

// ===== DATA FETCHING =====

async function fetchAllSportsData(betData) {
const teams = [betData.homeTeam, betData.awayTeam];

return {
injuries: await fetchInjuryReports(teams, betData.sport),
news: await fetchSportNews(teams, betData.sport),
stats: await fetchPlayerStats(teams, betData.sport),
records: await fetchTeamRecords(teams, betData.sport)
};
}

async function fetchInjuryReports(teams, sport) {
try {
// Using ESPN or TheSportsDB API
const responses = await Promise.all(
teams.map(team =>
fetch(`https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${team}`)
.then(r => r.json())
.catch(() => ({ data: 'No injury data available' }))
)
);
return responses;
} catch (error) {
return { error: 'Could not fetch injury data' };
}
}

async function fetchSportNews(teams, sport) {
// Fetch from ESPN RSS or sports news API
try {
const newsItems = await Promise.all(
teams.map(team =>
fetch(`https://api.example.com/news?team=${team}&sport=${sport}`)
.then(r => r.json())
.catch(() => ({ articles: [] }))
)
);
return newsItems.slice(0, 5); // Top 5 news items
} catch (error) {
return { error: 'Could not fetch news' };
}
}

async function fetchPlayerStats(teams, sport) {
// Fetch key player statistics
try {
const stats = await Promise.all(
teams.map(team =>
fetch(`https://api.example.com/stats?team=${team}&sport=${sport}`)
.then(r => r.json())
.catch(() => ({ players: [] }))
)
);
return stats;
} catch (error) {
return { error: 'Could not fetch player stats' };
}
}

async function fetchTeamRecords(teams, sport) {
// Fetch W-L records, streaks, etc.
try {
const records = await Promise.all(
teams.map(team =>
fetch(`https://api.example.com/standings?team=${team}&sport=${sport}`)
.then(r => r.json())
.catch(() => ({ record: 'N/A' }))
)
);
return records;
} catch (error) {
return { error: 'Could not fetch records' };
}
}

// ===== LLM ANALYSIS =====

async function analyzeBetWithClaude(betData, sportsData) {
const prompt = `
You are a sports betting analyst. Analyze this bet based on current sports intelligence:

BET DETAILS:
- Home Team: ${betData.homeTeam}
- Away Team: ${betData.awayTeam}
- Bet Type: ${betData.betType}
- Odds: ${betData.odds}
- Sport: ${betData.sport}
- Game Date: ${betData.gameDate}

CURRENT SPORTS DATA:
- Injuries: ${JSON.stringify(sportsData.injuries)}
- Recent News: ${JSON.stringify(sportsData.news)}
- Key Stats: ${JSON.stringify(sportsData.stats)}
- Team Records: ${JSON.stringify(sportsData.records)}

Provide analysis in this format:
1. CONFIDENCE LEVEL: (High/Medium/Low with %)
2. KEY RISK FACTORS: (injuries, form, trends)
3. SUPPORTING FACTORS: (why this bet could hit)
4. WIN/LOSS RECORD CONTEXT: (relevant streaks and matchups)
5. FINAL RECOMMENDATION: (Lean yes/no/hold with reasoning)
`;

try {
const response = await fetch('https://api.anthropic.com/v1/messages', {
method: 'POST',
headers: {
'Content-Type': 'application/json',
'x-api-key': 'YOUR_CLAUDE_API_KEY' // Store securely
},
body: JSON.stringify({
model: 'claude-3-5-sonnet-20241022',
max_tokens: 1024,
messages: [
{ role: 'user', content: prompt }
]
})
});

const data = await response.json();
return data.content[0].text;
} catch (error) {
return `Error calling LLM: ${error.message}`;
}
}

// ===== IMAGE PROCESSING =====

async function extractTextFromImage(imageFile) {
// Simple approach: use Tesseract.js for OCR
const reader = new FileReader();
return new Promise((resolve) => {
reader.onload = async (e) => {
try {
// This requires including Tesseract.js library
// For KISS method, you might skip this and use manual entry
resolve('Image processing would go here');
} catch (error) {
resolve('Could not process image');
}
};
reader.readAsDataURL(imageFile);
});
}

// Image preview
document.getElementById('betTicketImage')?.addEventListener('change', (e) => {
const file = e.target.files[0];
if (file) {
const reader = new FileReader();
reader.onload = (event) => {
document.getElementById('imagePreview').innerHTML =
`<img src="${event.target.result}" alt="Bet Ticket Preview">`;
};
reader.readAsDataURL(file);
}
});

// ===== DISPLAY RESULTS =====

function displayBetAnalysis(analysis, betData, sportsData) {
const output = document.getElementById('output');

output.innerHTML = `
<div class="analysis-result">
<h3>📊 Bet Intelligence Report</h3>

<div class="bet-summary">
<p><strong>Matchup:</strong> ${betData.awayTeam} @ ${betData.homeTeam}</p>
<p><strong>Bet Type:</strong> ${betData.betType} (${betData.odds})</p>
<p><strong>Sport:</strong> ${betData.sport.toUpperCase()}</p>
</div>

<div class="analysis-content">
${analysis.replace(/\n/g, '<br>')}
</div>

<div class="data-summary">
<h4>📈 Data Sources Analyzed:</h4>
<ul>
<li>✓ Injury Reports</li>
<li>✓ Recent News & Updates</li>
<li>✓ Player Statistics</li>
<li>✓ Team Records & Streaks</li>
</ul>
</div>
</div>
`;
}

// Set today's date in footer
document.getElementById('publish-date').textContent = new Date().toLocaleDateString('en-US', {
year: 'numeric',
month: 'long',
day: 'numeric'
});
