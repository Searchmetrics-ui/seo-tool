/**
 * Google Gemini API Client
 * Automatically synthesizes the high-intent target search query for AEO/GEO analysis.
 */

const fs = require('fs');
const path = require('path');

// Auto-load .env if available
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = process.env[key] || value.trim();
      }
    });
  }
} catch (e) {}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

/**
 * Automatically determine the ideal user search query for the given content using Gemini API
 * @param {Object} scrapedData - Extracted webpage data
 * @param {string} userProvidedQuery - Optional manual query
 * @returns {Promise<Object>} { query, source: 'gemini' | 'heuristic', geminiStatus }
 */
async function determineTargetQuery(scrapedData, userProvidedQuery = '') {
  // If user explicitly provided a custom query and wants to use it, prioritize it
  if (userProvidedQuery && userProvidedQuery.trim().length > 5 && !userProvidedQuery.includes('enterprise cloud security')) {
    return {
      query: userProvidedQuery.trim(),
      source: 'user',
      geminiStatus: { active: true }
    };
  }

  const { title, h1, h2, first100Words, domain } = scrapedData;

  const contentSummary = `
Page Title: ${title || ''}
Primary Heading (H1): ${h1.join(' | ') || ''}
Subheadings (H2): ${h2.slice(0, 5).join(' | ') || ''}
Introductory Snippet: ${first100Words || ''}
Domain: ${domain || ''}
`.trim();

  const prompt = `You are an Answer Engine Optimization (AEO) and Generative Engine Optimization (GEO) expert.
Analyze the following webpage content and determine the single most likely, natural, high-intent question that a user would ask an AI Answer Engine (like Perplexity, ChatGPT Search, or Google AI Overviews) for which this specific webpage is the direct, authoritative answer.

Requirements:
1. Return ONLY the search query/question.
2. Formulate it as a concise, natural question (e.g. "What is X?", "What are the best X?", "How to do X in [City]?").
3. Keep it under 12 words.
4. Do NOT include quotation marks, markdown formatting, prefixes, or explanations.

Webpage Content:
${contentSummary}`;

  // Attempt Gemini API call
  try {
    const model = 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 60
        }
      }),
      signal: AbortSignal.timeout(10000)
    });

    const data = await response.json();

    if (response.ok && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      let generatedQuery = data.candidates[0].content.parts[0].text.trim();
      // Clean quotes and formatting
      generatedQuery = generatedQuery.replace(/^["'`]+|["'`]+$/g, '').trim();

      if (!generatedQuery.endsWith('?')) {
        generatedQuery += '?';
      }

      return {
        query: generatedQuery,
        source: 'gemini',
        geminiStatus: {
          active: true,
          model: model,
          status: 'success'
        }
      };
    } else {
      // Handle API error gracefully (e.g., API service disabled in GCP project)
      const errorMsg = data.error?.message || response.statusText;
      console.warn('Gemini API Notice:', errorMsg);

      const fallback = extractHeuristicQuery(scrapedData);
      return {
        query: fallback,
        source: 'heuristic',
        geminiStatus: {
          active: false,
          error: errorMsg,
          enableUrl: 'https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview?project=634209061560',
          notice: 'Gemini API key is configured. Enable Generative Language API in Google Cloud Console or create an AI Studio key to activate live Gemini query generation.'
        }
      };
    }
  } catch (err) {
    console.warn('Gemini fetch failed:', err.message);
    const fallback = extractHeuristicQuery(scrapedData);
    return {
      query: fallback,
      source: 'heuristic',
      geminiStatus: {
        active: false,
        error: err.message
      }
    };
  }
}

/**
 * Fallback heuristic query extractor if API is offline
 */
function extractHeuristicQuery(scrapedData) {
  const { title, h1, h2 } = scrapedData;
  const candidate = (h1.length > 0 && h1[0].length > 10) ? h1[0] : title;

  if (!candidate) return 'What are the best practices for this topic?';

  let clean = candidate.replace(/\s*[|\-–—].*$/, '').trim(); // Remove brand suffix like "| Elixify Clinic"
  
  if (clean.toLowerCase().startsWith('what') || clean.toLowerCase().startsWith('how') || clean.endsWith('?')) {
    return clean.endsWith('?') ? clean : clean + '?';
  }

  if (clean.toLowerCase().includes('best') || clean.toLowerCase().includes('top')) {
    return `What are the ${clean.toLowerCase()}?`;
  }

  return `What is ${clean}?`;
}

module.exports = { determineTargetQuery, GEMINI_API_KEY };
