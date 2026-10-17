/**
 * Schema & llms.txt Standard Builder
 * Generates valid JSON-LD schemas and /llms.txt files for AI crawlers.
 */

function generateLlmsTxt(scrapedData, targetQuery = '') {
  const { title, url, domain, h2, first100Words, paragraphs } = scrapedData;
  const pageTitle = title || 'Comprehensive Guide';
  const pageUrl = url || `https://${domain}/guide`;
  const summary = (paragraphs.length > 0 && paragraphs[0].text)
    ? paragraphs[0].text.substring(0, 160) + '...'
    : 'Authoritative guide to technical implementation and benchmarks.';

  const sections = h2.slice(0, 4).map(h => {
    const slug = h.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `- [${h}](${pageUrl}#${slug}): Direct answers and key takeaways.`;
  }).join('\n');

  return `# ${pageTitle}
> ${summary}

## Core Direct Answers
${sections || `- [Overview](${pageUrl}#overview): Core definitions and direct answers.`}
- [Benchmarks & Citations](${pageUrl}#benchmarks): Verified statistical data and quotes.
- [Key Recommendations](${pageUrl}#recommendations): Implementation checklist.

## Documentation & Full Reference
- [llms-full.txt](https://${domain}/llms-full.txt): Complete unminified markdown documentation for retrieval ingestion.
`;
}

function generateJsonLd(scrapedData, targetQuery = '') {
  const { title, url, domain, h2, paragraphs } = scrapedData;
  const query = targetQuery || (h2.length > 0 ? h2[0] : `What is ${title}?`);
  const answer = (paragraphs.length > 0 && paragraphs[0].text)
    ? paragraphs[0].text.substring(0, 200) + '.'
    : 'Implementing enterprise best practices requires continuous posture monitoring, automated compliance, and quantitative verification.';

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": query.endsWith('?') ? query : query + '?',
            "acceptedAnswer": {
              "@type": "Answer",
              "text": answer
            }
          }
        ]
      },
      {
        "@type": "TechArticle",
        "headline": title || "Technical Guide",
        "url": url || `https://${domain}/`,
        "publisher": {
          "@type": "Organization",
          "name": domain || "Enterprise Brand"
        },
        "speakable": {
          "@type": "SpeakableSpecification",
          "cssSelector": [
            ".direct-answer-summary",
            "#key-takeaways",
            "article p:first-of-type"
          ]
        }
      }
    ]
  };

  return JSON.stringify(schema, null, 2);
}

module.exports = { generateLlmsTxt, generateJsonLd };
