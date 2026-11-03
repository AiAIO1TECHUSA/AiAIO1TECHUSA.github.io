import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

// Allow the page to call this function when it is served from GitHub Pages
// as well as from the Netlify site itself.
const ALLOWED_ORIGINS = [
  'https://aiaio1techusa.github.io',
  'https://inspiring-licorice-2c7129.netlify.app'
];

function corsHeaders(req) {
  const origin = req.headers.get('origin') || '';
  const allowed = ALLOWED_ORIGINS.includes(origin) || origin.endsWith('--inspiring-licorice-2c7129.netlify.app');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin'
  };
}

export default async (req) => {
  const headers = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405, headers });
  }

  let prompt;
  try {
    ({ prompt } = await req.json());
  } catch {
    return Response.json({ error: 'Request body must be JSON.' }, { status: 400, headers });
  }
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return Response.json({ error: 'A prompt is required.' }, { status: 400, headers });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-5-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt.slice(0, 8000) }]
    });
    const text = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');
    return Response.json({ text }, { headers });
  } catch (err) {
    console.error('Prediction failed:', err);
    return Response.json({ error: 'The analysis service is unavailable. Please try again.' }, { status: 502, headers });
  }
};
