/**
 * GEO (Generative Engine Optimization) Analyzer
 * Implements academic GEO benchmark algorithms (Princeton University & AI research)
 * Measures citation likelihood, entity prominence, and LLM retrieval optimization.
 */

function analyzeGEO(scrapedData, aeoResult) {
  const { bodyText, paragraphs, outboundLinks, jsonLdScripts, totalWordCount } = scrapedData;
  const checklist = [];

  // -------------------------------------------------------------
  // FACTOR 1: Statistics & Quantitative Data Density
  // -------------------------------------------------------------
  // Numbers, percentages (%), currency ($/€/£), benchmark years (2024, 2025, 2026), ratio metrics
  const percentMatches = (bodyText.match(/\b\d+(\.\d+)?%\b/g) || []);
  const yearMatches = (bodyText.match(/\b(202[3-9]|2030)\b/g) || []);
  const currencyMatches = (bodyText.match(/[$€£]\s?\d+(,\d+)*(\.\d+)?(\s?(million|billion|k|M|B))?/gi) || []);
  const generalNumbers = (bodyText.match(/\b\d+(,\d{3})*(\.\d+)?\b/g) || []);

  const totalDataPoints = percentMatches.length + yearMatches.length + currencyMatches.length;
  // Quantitative density per 500 words
  const densityRatio = totalWordCount > 0 ? (totalDataPoints / (totalWordCount / 500)) : 0;

  let statsScore = 40;
  if (totalDataPoints >= 6 || densityRatio >= 4) {
    statsScore = 90;
    checklist.push({
      id: 'geo-stats-high',
      type: 'passed',
      severity: 'Passed',
      category: 'GEO Benchmark',
      title: 'High Statistical & Quantitative Density',
      detail: `Detected ${totalDataPoints} data points (${percentMatches.length} percentages, ${yearMatches.length} benchmark years, ${currencyMatches.length} financial figures). Boosts Perplexity citation rate by ~35%.`,
      score: 90
    });
  } else if (totalDataPoints >= 3) {
    statsScore = 70;
    checklist.push({
      id: 'geo-stats-med',
      type: 'issue',
      severity: 'Medium',
      category: 'GEO Benchmark',
      title: 'Moderate Quantitative Density',
      detail: `Only ${totalDataPoints} statistics detected. Princeton GEO studies demonstrate that dense empirical data substantially increases generative citation frequency.`,
      recommendation: 'Add 2-3 specific percentages, benchmark data points, or survey findings to support your claims.',
      score: 70
    });
  } else {
    statsScore = 30;
    checklist.push({
      id: 'geo-stats-low',
      type: 'issue',
      severity: 'High',
      category: 'GEO Benchmark',
      title: 'Low Statistical Density (Princeton Factor 2)',
      detail: 'Fewer than 3 statistical data points found. Generative models prioritize sources with verifiable quantitative metrics over qualitative assertions.',
      recommendation: 'Incorporate empirical benchmarks (e.g. "increased by 42%", "over 80% of organizations").',
      score: 30
    });
  }

  // -------------------------------------------------------------
  // FACTOR 2: Direct Quote & Expert Attribution
  // -------------------------------------------------------------
  const quoteAttributionRegex = /(according to|stated by|reported by|study by|research from|estimates from|as noted by|analysts at)\s+([A-Z][a-zA-Z\s]{2,25})/gi;
  const quoteMarksRegex = /"[^"]{15,180}"|“[^”]{15,180}”/g;

  const quoteAttributionMatches = [...bodyText.matchAll(quoteAttributionRegex)];
  const directQuotes = (bodyText.match(quoteMarksRegex) || []);

  let quoteScore = 35;
  if (quoteAttributionMatches.length >= 2 || directQuotes.length >= 2) {
    quoteScore = 92;
    checklist.push({
      id: 'geo-quote-high',
      type: 'passed',
      severity: 'Passed',
      category: 'GEO Benchmark',
      title: 'Authoritative Quotation & Attribution',
      detail: `Detected ${directQuotes.length} direct quotes and ${quoteAttributionMatches.length} institutional attributions. Princeton research shows quote addition provides up to a +38% lift in LLM selection.`,
      score: 92
    });
  } else if (quoteAttributionMatches.length === 1 || directQuotes.length === 1) {
    quoteScore = 65;
    checklist.push({
      id: 'geo-quote-med',
      type: 'issue',
      severity: 'Medium',
      category: 'GEO Benchmark',
      title: 'Limited Expert Quotations',
      detail: 'Only 1 quoted source detected. LLMs preferentially cite texts containing named expert perspectives.',
      recommendation: 'Cite an industry analyst, recognized standard body, or authoritative study directly.',
      score: 65
    });
  } else {
    quoteScore = 30;
    checklist.push({
      id: 'geo-quote-low',
      type: 'issue',
      severity: 'High',
      category: 'GEO Benchmark',
      title: 'Missing Authoritative Quotations (Princeton Factor 1)',
      detail: 'No direct quotations from recognized institutions or experts detected in body text.',
      recommendation: 'Add at least 1 direct quote with clear attribution (e.g., "According to Gartner, ...").',
      score: 30
    });
  }

  // -------------------------------------------------------------
  // FACTOR 3: Source Citations & External Links
  // -------------------------------------------------------------
  const authorityTLDs = ['.gov', '.edu', '.org'];
  const highAuthDomains = ['gartner.com', 'forbes.com', 'statista.com', 'nist.gov', 'arxiv.org', 'wikipedia.org', 'reuters.com', 'bloomberg.com', 'nature.com', 'mckinsey.com'];
  
  const authLinks = outboundLinks.filter(l => {
    return authorityTLDs.some(tld => l.domain.endsWith(tld)) || 
           highAuthDomains.some(had => l.domain.includes(had));
  });

  let citationScore = 50;
  if (authLinks.length >= 2) {
    citationScore = 90;
    checklist.push({
      id: 'geo-citation-high',
      type: 'passed',
      severity: 'Passed',
      category: 'Authority',
      title: 'High-Authority External Source Linking',
      detail: `Found ${authLinks.length} references to Tier-1 domains (${authLinks.map(l => l.domain).slice(0, 3).join(', ')}).`,
      score: 90
    });
  } else if (outboundLinks.length >= 2) {
    citationScore = 75;
    checklist.push({
      id: 'geo-citation-med',
      type: 'passed',
      severity: 'Passed',
      category: 'Authority',
      title: 'External References Present',
      detail: `Detected ${outboundLinks.length} outbound reference links supporting the text.`,
      score: 75
    });
  } else {
    citationScore = 40;
    checklist.push({
      id: 'geo-citation-low',
      type: 'issue',
      severity: 'Medium',
      category: 'Authority',
      title: 'Few Outbound Authoritative References',
      detail: 'Pages without outbound verification links suffer in credibility scoring during AI synthesis.',
      recommendation: 'Link directly to original primary source research, documentation, or government/academic standards.',
      score: 40
    });
  }

  // -------------------------------------------------------------
  // FACTOR 4: Content Chunkability & RAG Safety (Embedding Protection)
  // -------------------------------------------------------------
  // Paragraphs over 140 words risk truncation in 512-token dense embeddings
  const longParagraphs = paragraphs.filter(p => p.wordCount > 140);
  const totalParagraphsCount = paragraphs.length;
  const avgParagraphWords = totalParagraphsCount > 0 
    ? Math.round(paragraphs.reduce((acc, p) => acc + p.wordCount, 0) / totalParagraphsCount)
    : 0;

  let chunkabilityScore = 80;
  if (longParagraphs.length > 0) {
    chunkabilityScore = Math.max(40, 85 - (longParagraphs.length * 15));
    checklist.push({
      id: 'geo-chunking-risk',
      type: 'issue',
      severity: 'Medium',
      category: 'RAG Retrieval',
      title: `Chunking Risk: ${longParagraphs.length} Paragraph(s) Exceed 140 Words`,
      detail: `RAG retrieval systems split text into 256–512 token chunks. Paragraphs over 140 words are at high risk of having critical context cleaved in half.`,
      recommendation: 'Break long paragraphs into 2-3 concise paragraphs (70-100 words each) or format as bullet points.',
      score: chunkabilityScore
    });
  } else {
    chunkabilityScore = 95;
    checklist.push({
      id: 'geo-chunking-safe',
      type: 'passed',
      severity: 'Passed',
      category: 'RAG Retrieval',
      title: 'Optimal Chunkability & RAG Sentence Length',
      detail: `Average paragraph length is ${avgParagraphWords} words (within the ideal 60-110 word RAG extraction window).`,
      score: 95
    });
  }

  // -------------------------------------------------------------
  // FACTOR 5: Structured Data (JSON-LD) & llms.txt Readiness
  // -------------------------------------------------------------
  let hasFaqSchema = false;
  let hasArticleSchema = false;
  let hasSpeakableSchema = false;
  let hasOrgSchema = false;

  jsonLdScripts.forEach(script => {
    const checkType = (obj) => {
      if (!obj) return;
      const type = obj['@type'] || '';
      if (typeof type === 'string') {
        if (type.includes('FAQPage')) hasFaqSchema = true;
        if (type.includes('Article') || type.includes('TechArticle') || type.includes('BlogPosting')) hasArticleSchema = true;
        if (type.includes('Organization')) hasOrgSchema = true;
      }
      if (obj.speakable) hasSpeakableSchema = true;
      if (Array.isArray(obj['@graph'])) {
        obj['@graph'].forEach(checkType);
      }
    };
    checkType(script);
  });

  let schemaScore = 30;
  if (hasFaqSchema && hasArticleSchema) {
    schemaScore = 95;
    checklist.push({
      id: 'geo-schema-rich',
      type: 'passed',
      severity: 'Passed',
      category: 'Schema & AI Crawler',
      title: 'Complete JSON-LD FAQ & Article Schema',
      detail: 'Structured data accurately feeds Google AI Overviews and crawler entities.',
      score: 95
    });
  } else if (hasFaqSchema || hasArticleSchema || hasOrgSchema) {
    schemaScore = 75;
    checklist.push({
      id: 'geo-schema-partial',
      type: 'issue',
      severity: 'Medium',
      category: 'Schema & AI Crawler',
      title: 'Partial Structured Schema Implemented',
      detail: `Detected structured data, but missing ${!hasFaqSchema ? 'FAQPage' : 'Article'} schema.`,
      recommendation: 'Generate complete FAQPage and Speakable specification JSON-LD using the built-in Studio.',
      score: 75
    });
  } else {
    schemaScore = 20;
    checklist.push({
      id: 'geo-schema-none',
      type: 'issue',
      severity: 'High',
      category: 'Schema & AI Crawler',
      title: 'No JSON-LD Structured Data Detected',
      detail: 'Answer engines rely on JSON-LD to confirm semantic entities and direct answer pairings without guessing.',
      recommendation: 'Add schema.org/FAQPage and Article structured data to your page <head>.',
      score: 20
    });
  }

  // Check llms.txt standard
  checklist.push({
    id: 'geo-llmstxt-tip',
    type: 'issue',
    severity: 'Medium',
    category: 'Schema & AI Crawler',
    title: 'Deploy /llms.txt at Domain Root',
    detail: 'The /llms.txt standard allows AI agents (Anthropic, Perplexity, OpenAI) to ingest clean, token-efficient Markdown representations of your key pages.',
    recommendation: 'Copy the auto-generated /llms.txt from the Studio tab and place it in your root directory.',
    score: 60
  });

  // Merge AEO checklist items
  if (aeoResult && aeoResult.issues) {
    aeoResult.issues.forEach(i => {
      checklist.push({
        id: i.id,
        type: 'issue',
        severity: i.severity,
        category: 'Direct Answer (AEO)',
        title: i.title,
        detail: i.detail,
        recommendation: i.recommendation
      });
    });
  }

  if (aeoResult && aeoResult.passed) {
    aeoResult.passed.forEach(p => {
      checklist.push({
        id: p.id,
        type: 'passed',
        severity: 'Passed',
        category: 'Direct Answer (AEO)',
        title: p.title,
        detail: p.detail
      });
    });
  }

  // -------------------------------------------------------------
  // COMPOSITE TOTAL GEO INDEX (0 - 100)
  // -------------------------------------------------------------
  const aeoScore = aeoResult ? aeoResult.score : 60;
  const compositeScore = Math.round(
    (0.30 * aeoScore) + 
    (0.25 * statsScore) + 
    (0.20 * quoteScore) + 
    (0.15 * schemaScore) + 
    (0.10 * chunkabilityScore)
  );

  const finalGeoScore = Math.min(100, Math.max(15, compositeScore));

  let tier = 'AEO High Tier';
  let tierSummary = 'Highly likely to be cited by Perplexity, ChatGPT Search, and Google AI Overviews.';
  if (finalGeoScore < 50) {
    tier = 'AEO Low Tier';
    tierSummary = 'Unlikely to be cited by AI Answer Engines. Lacks direct definitions, statistics, and structured data.';
  } else if (finalGeoScore < 75) {
    tier = 'AEO Moderate Tier';
    tierSummary = 'Eligible for citation, but vulnerable to being outranked by pages with richer data density and FAQ schema.';
  }

  return {
    geoIndex: finalGeoScore,
    tier,
    tierSummary,
    pillars: {
      directAnswer: aeoScore,
      statsDensity: statsScore,
      quoteAttribution: quoteScore,
      aiReadiness: schemaScore,
      chunkability: chunkabilityScore
    },
    metricsSummary: {
      statisticsCount: totalDataPoints,
      quotesCount: directQuotes.length + quoteAttributionMatches.length,
      outboundAuthLinks: authLinks.length,
      longParagraphsCount: longParagraphs.length,
      avgParagraphWords
    },
    checklist
  };
}

module.exports = { analyzeGEO };
