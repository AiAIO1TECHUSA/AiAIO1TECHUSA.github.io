// Vercel / Netlify-compatible serverless function
// Deploy this file as /api/generate (Vercel) or as a Netlify function.
// Requires environment variable OPENAI_API_KEY to be set in the deployment.

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed, use POST' });
      return;
    }

    const { product_name, product_details } = req.body || {};
    if (!product_name || !product_details) {
      res.status(400).json({ error: 'product_name and product_details are required' });
      return;
    }

    const systemPrompt = `You are an expert e-commerce copywriter.`;

    const userPrompt = `Write a compelling product description for the following product:\n\n- Name: ${product_name}\n- Details: ${product_details}\n\nRequirements:\n- 80–150 words\n- Clear, persuasive, and easy to read\n- Highlight benefits, not just features\n- Use a professional but friendly tone`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      res.status(500).json({ error: 'OPENAI_API_KEY not configured on the server' });
      return;
    }

    const apiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 400,
        temperature: 0.7
      })
    });

    if (!apiResp.ok) {
      const text = await apiResp.text();
      res.status(apiResp.status).json({ error: 'OpenAI API error', detail: text });
      return;
    }

    const data = await apiResp.json();
    const generated = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : (data.choices && data.choices[0] && data.choices[0].text) || '';

    res.status(200).json({ text: generated.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};
