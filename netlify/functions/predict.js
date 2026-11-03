'use strict';

const DEFAULT_MODEL = 'meta-llama/Llama-2-7b-chat-hf';
const MAX_PROMPT_LENGTH = 20000;
const REQUEST_TIMEOUT_MS = 25000;

function jsonResponse(statusCode, payload) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload)
  };
}

function log(level, message, metadata = {}) {
  console[level](JSON.stringify({
    function: 'predict',
    message,
    ...metadata
  }));
}

exports.handler = async (event, context) => {
  const requestId = context?.awsRequestId || event?.headers?.['x-nf-request-id'] || 'unknown';

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method Not Allowed' });
  }

  let body;
  try {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body || '', 'base64').toString('utf8')
      : event.body;
    body = typeof rawBody === 'string' ? JSON.parse(rawBody || '{}') : (rawBody || {});
  } catch (error) {
    log('warn', 'Invalid JSON request body', { requestId, error: error.message });
    return jsonResponse(400, { error: 'Request body must be valid JSON.' });
  }

  const prompt = body?.prompt;
  if (typeof prompt !== 'string' || !prompt.trim()) {
    return jsonResponse(400, { error: 'A non-empty prompt is required.' });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonResponse(413, { error: `Prompt must be no longer than ${MAX_PROMPT_LENGTH} characters.` });
  }

  const token = process.env.HUGGINGFACE_API_KEY;
  if (!token) {
    log('error', 'HUGGINGFACE_API_KEY is not configured', { requestId });
    return jsonResponse(500, { error: 'The prediction service is not configured. Set HUGGINGFACE_API_KEY in Netlify environment variables.' });
  }

  const model = process.env.HUGGINGFACE_MODEL || DEFAULT_MODEL;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  log('info', 'Sending inference request', { requestId, model });

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 1024 }
      }),
      signal: controller.signal
    });

    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { error: responseText.slice(0, 1000) || 'The inference service returned an invalid response.' };
    }

    const durationMs = Date.now() - startedAt;
    if (!response.ok) {
      const detail = typeof data.error === 'string'
        ? data.error.slice(0, 1000)
        : `Hugging Face returned HTTP ${response.status}.`;
      log('error', 'Inference provider returned an error', {
        requestId,
        model,
        statusCode: response.status,
        durationMs,
        detail
      });
      return jsonResponse(502, { error: 'The inference provider rejected the request.', detail });
    }

    const generated = Array.isArray(data)
      ? data[0]?.generated_text
      : data?.generated_text || data?.text;
    if (typeof generated !== 'string' || !generated.trim()) {
      const detail = typeof data?.error === 'string' ? data.error.slice(0, 1000) : 'The provider returned no generated text.';
      log('error', 'Inference response did not contain generated text', { requestId, model, durationMs, detail });
      return jsonResponse(502, { error: 'The inference provider returned an empty response.', detail });
    }

    log('info', 'Inference request completed', { requestId, model, durationMs });
    return jsonResponse(200, { text: generated.trim() });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const timedOut = error.name === 'AbortError';
    log('error', timedOut ? 'Inference request timed out' : 'Inference request failed', {
      requestId,
      model,
      durationMs,
      errorName: error.name,
      error: error.message,
      stack: error.stack
    });
    return jsonResponse(timedOut ? 504 : 502, {
      error: timedOut ? 'The inference provider timed out. Please try again.' : 'The prediction request failed.',
      requestId
    });
  } finally {
    clearTimeout(timeout);
  }
};
