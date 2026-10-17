/**
 * AEO (Answer Engine Optimization) Engine
 * Analyzes direct answer extraction readiness for Perplexity, ChatGPT Search, and Google AI Overviews.
 */

function analyzeAEO(scrapedData, targetQuery = '') {
  const { title, h1, h2, paragraphs, first100Words, bodyText, totalWordCount } = scrapedData;
  const issues = [];
  const passed = [];

  let directAnswerScore = 0;
  const queryTerms = targetQuery
    ? targetQuery.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w.length > 2)
    : [];

  // 1. First-100 Word Definition Test
  // Answer engines prioritize articles that define the core concept within the first 100 words.
  const definitionRegex = /\b(is a|is an|refers to|defined as|means|consists of|represents|is the process of|serves as|is designed to)\b/i;
  const hasDefinitionInOpening = definitionRegex.test(first100Words);

  let openingWordsCount = 0;
  if (paragraphs.length > 0) {
    openingWordsCount = paragraphs[0].wordCount;
  }

  if (hasDefinitionInOpening && openingWordsCount >= 25 && openingWordsCount <= 65) {
    directAnswerScore += 35;
    passed.push({
      id: 'first-100-def',
      title: 'Concise Definition in First 100 Words',
      detail: `Your opening paragraph (${openingWordsCount} words) provides an immediate, extraction-ready answer to the core topic.`,
      impact: 'High'
    });
  } else if (hasDefinitionInOpening) {
    directAnswerScore += 25;
    passed.push({
      id: 'first-100-def',
      title: 'Definition Present in Opening',
      detail: `Definition statement detected, but opening paragraph is ${openingWordsCount} words (ideal length: 30-50 words).`,
      impact: 'Medium'
    });
  } else {
    directAnswerScore += 10;
    issues.push({
      id: 'missing-opening-def',
      severity: 'High',
      title: 'Missing Direct Definition in First 100 Words',
      detail: 'AI answer engines struggle to extract a concise answer snippet when the opening paragraph is narrative or conversational rather than definitive.',
      recommendation: 'Add a clear 35-50 word direct definition sentence immediately beneath your H1.'
    });
  }

  // 2. Question-Style Headings (What, How, Why, Best)
  const questionWords = ['what', 'how', 'why', 'when', 'who', 'best', 'can', 'should', 'is', 'are', 'vs', 'guide'];
  const allHeadings = [...h1, ...h2];
  let questionHeadingsCount = 0;
  let queryMatchedHeadings = 0;

  allHeadings.forEach(h => {
    const lower = h.toLowerCase();
    const hasQWord = questionWords.some(qw => lower.startsWith(qw) || lower.includes(` ${qw} `));
    const hasQMark = lower.includes('?');
    if (hasQWord || hasQMark) {
      questionHeadingsCount++;
    }

    if (queryTerms.length > 0) {
      const matchCount = queryTerms.filter(term => lower.includes(term)).length;
      if (matchCount >= 2 || (queryTerms.length === 1 && matchCount === 1)) {
        queryMatchedHeadings++;
      }
    }
  });

  if (questionHeadingsCount >= 2) {
    directAnswerScore += 25;
    passed.push({
      id: 'question-headings',
      title: 'Query-Aligned Heading Structure',
      detail: `Detected ${questionHeadingsCount} headings structured as direct questions or prompt queries.`,
      impact: 'High'
    });
  } else {
    directAnswerScore += 10;
    issues.push({
      id: 'few-question-headings',
      severity: 'Medium',
      title: 'Few Question-Formatted Headings',
      detail: `Only ${questionHeadingsCount} heading(s) use question phrasing. AI agents prefer explicit Q&A mapping for section retrieval.`,
      recommendation: 'Reframe key H2 headings into explicit questions (e.g. "What is X?" or "How does X work?").'
    });
  }

  // 3. Target Query Semantic Alignment
  let queryRelevanceScore = 75; // default benchmark
  if (queryTerms.length > 0) {
    const queryMatchesInBody = queryTerms.filter(t => bodyText.toLowerCase().includes(t)).length;
    const matchRatio = queryMatchesInBody / queryTerms.length;

    if (matchRatio >= 0.8) {
      directAnswerScore += 25;
      queryRelevanceScore = 94;
      passed.push({
        id: 'query-relevance',
        title: 'Target Search Prompt Match',
        detail: `Content covers ${Math.round(matchRatio * 100)}% of key entities in your target prompt.`,
        impact: 'High'
      });
    } else if (matchRatio >= 0.5) {
      directAnswerScore += 15;
      queryRelevanceScore = 72;
      issues.push({
        id: 'partial-query-match',
        severity: 'Medium',
        title: 'Partial Target Prompt Alignment',
        detail: `Content covers only ${Math.round(matchRatio * 100)}% of your target prompt terms.`,
        recommendation: `Include missing concepts from your prompt: ${queryTerms.filter(t => !bodyText.toLowerCase().includes(t)).join(', ')}`
      });
    } else {
      directAnswerScore += 5;
      queryRelevanceScore = 45;
      issues.push({
        id: 'poor-query-match',
        severity: 'High',
        title: 'Weak Target Prompt Alignment',
        detail: 'The page text does not sufficiently address the specific query keywords provided.',
        recommendation: 'Incorporate the exact query context into the introductory heading and opening answer paragraph.'
      });
    }
  } else {
    directAnswerScore += 20;
  }

  // 4. Bulleted Lists and Snippet Format
  if (scrapedData.listItemsCount >= 3) {
    directAnswerScore += 15;
    passed.push({
      id: 'lists-presence',
      title: 'Extraction-Friendly Bullet Points',
      detail: `Found ${scrapedData.listItemsCount} bulleted/numbered items, allowing answer engines to generate step-by-step citations.`,
      impact: 'Medium'
    });
  } else {
    directAnswerScore += 5;
    issues.push({
      id: 'missing-lists',
      severity: 'Medium',
      title: 'No Bulleted or Numbered Takeaways',
      detail: 'Answer engines prioritize bulleted lists when synthesizing multi-point answers.',
      recommendation: 'Convert key points or sequential steps into unordered or ordered HTML lists.'
    });
  }

  // Normalize score 0-100
  const finalScore = Math.min(100, Math.max(10, directAnswerScore));

  return {
    score: finalScore,
    queryRelevanceScore,
    hasDefinitionInOpening,
    questionHeadingsCount,
    queryMatchedHeadings,
    first100Words,
    issues,
    passed
  };
}

module.exports = { analyzeAEO };
