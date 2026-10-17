const express = require('express');
const path = require('path');
const { scrapeContent } = require('./lib/scraper');
const { analyzeAEO } = require('./lib/aeo-analyzer');
const { analyzeGEO } = require('./lib/geo-analyzer');
const { generateRewrites } = require('./lib/rewriter');
const { simulateAnswerEngines } = require('./lib/simulator');
const { generateLlmsTxt, generateJsonLd } = require('./lib/schema-builder');
const { generateMarkdownReport } = require('./lib/exporter');
const { determineTargetQuery } = require('./lib/gemini');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Enable CORS for all origins (allows access from file:/// or localhost)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

/**
 * Endpoint to auto-determine query using Gemini API
 */
app.post('/api/generate-query', async (req, res) => {
  try {
    const { url = '', text = '' } = req.body;
    const scraped = await scrapeContent(url, text);
    const queryInfo = await determineTargetQuery(scraped);
    res.json({ success: true, ...queryInfo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Full AEO & GEO Audit API (with Gemini AI Target Query)
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { url = '', text = '', query = '', brand = '' } = req.body;

    if (!url && !text) {
      return res.status(400).json({
        success: false,
        error: 'Please provide either a Target URL or Raw Text to analyze.'
      });
    }

    // Step 1: Ingest and parse content
    const scraped = await scrapeContent(url, text);

    // Step 2: Determine target query using Google Gemini API
    const queryResult = await determineTargetQuery(scraped, query);
    const resolvedQuery = queryResult.query;

    // Step 3: Run AEO direct answer analysis
    const aeoResult = analyzeAEO(scraped, resolvedQuery);

    // Step 4: Run GEO multi-factor algorithm
    const geoResult = analyzeGEO(scraped, aeoResult);

    // Step 5: Generate contextual rewrites
    const rewrites = generateRewrites(scraped, aeoResult, resolvedQuery);

    // Step 6: Simulate Answer Engine citations
    const simulator = simulateAnswerEngines(scraped, geoResult, resolvedQuery);

    // Step 7: Generate schema & llms.txt
    const llmsTxt = generateLlmsTxt(scraped, resolvedQuery);
    const jsonLd = generateJsonLd(scraped, resolvedQuery);

    const fullResult = {
      success: true,
      url: scraped.url,
      domain: scraped.domain,
      title: scraped.title,
      targetQuery: resolvedQuery,
      querySource: queryResult.source,
      geminiStatus: queryResult.geminiStatus,
      totalWordCount: scraped.totalWordCount,
      geoIndex: geoResult.geoIndex,
      tier: geoResult.tier,
      tierSummary: geoResult.tierSummary,
      pillars: geoResult.pillars,
      metricsSummary: geoResult.metricsSummary,
      checklist: geoResult.checklist,
      rewrites,
      simulator,
      standards: {
        llmsTxt,
        jsonLd
      }
    };

    res.json(fullResult);
  } catch (err) {
    console.error('Audit Error:', err);
    res.status(500).json({
      success: false,
      error: err.message || 'An error occurred while analyzing the content.'
    });
  }
});

/**
 * Export Markdown Report API
 */
app.post('/api/export', (req, res) => {
  try {
    const auditData = req.body;
    const markdown = generateMarkdownReport(auditData);
    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', 'attachment; filename="geopulse-audit-report.md"');
    res.send(markdown);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate export report.' });
  }
});

// Fallback to index.html for client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`GeoPulse AEO & GEO Engine running at http://localhost:${PORT}`);
});
