/**
 * Client for the FeedMind trained NLP model API (v2).
 * The model server exposes:
 *   POST /analyze-feedback  – sentiment + suggestion + keywords for a single text
 *   GET  /health            – liveness / readiness probe
 */

const NLP_API_URL = (process.env.NLP_API_URL || 'http://localhost:8000').replace(/\/$/, '');

/**
 * Analyse a single piece of feedback text using the trained model.
 * @param {string} feedbackText - Raw text to analyse.
 * @param {number} rating - Star rating 1-5 (defaults to 3).
 * @param {string} category - Optional product category hint (e.g. "ui").
 * @returns {Promise<Object>} NlpFeedbackResult
 */
export async function analyzeFeedback(feedbackText, rating = 3, category) {
  const body = {
    feedback_text: feedbackText.trim(),
    rating: Math.max(1, Math.min(5, Math.round(rating))),
  };
  if (category) body.category = category;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(`${NLP_API_URL}/analyze-feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let message = res.statusText;
      try {
        const err = await res.json();
        message = err?.detail?.message ?? err?.message ?? message;
      } catch {}
      throw new Error(`NLP API ${res.status}: ${message}`);
    }

    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Analyse multiple feedback texts in parallel.
 * @param {Array} items - Array of {text, rating, category}
 * @param {number} concurrency - Max parallel requests (default: 5)
 * @returns {Promise<Array>} Array of NlpFeedbackResults
 */
export async function analyzeFeedbackBatch(items, concurrency = 5) {
  const results = new Array(items.length);

  // Process in chunks of `concurrency`
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    const chunkResults = await Promise.all(
      chunk.map((item) => analyzeFeedback(item.text, item.rating ?? 3, item.category))
    );
    chunkResults.forEach((r, j) => {
      results[i + j] = r;
    });
  }

  return results;
}

/**
 * Returns true if the NLP model server is up and the model is loaded.
 * @returns {Promise<boolean>}
 */
export async function checkNlpHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${NLP_API_URL}/health`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await res.json();
    return data?.model_loaded === true;
  } catch {
    return false;
  }
}
