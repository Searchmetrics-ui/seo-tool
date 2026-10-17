const cheerio = require('cheerio');

/**
 * Scrapes and parses webpage content or raw text
 * @param {string} url - Target URL or empty if raw text
 * @param {string} rawText - Raw text or markdown content
 * @returns {Promise<Object>} Extracted content metadata and text structure
 */
async function scrapeContent(url, rawText = '') {
  let html = '';
  let finalUrl = url;

  if (url && url.trim().startsWith('http')) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (GeoPulse AEO Auditor)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: HTTP ${response.status} ${response.statusText}`);
      }

      html = await response.text();
      finalUrl = response.url || url;
    } catch (err) {
      // If live fetch fails, fall back to analyzing url or erroring gracefully
      throw new Error(`Could not access ${url}: ${err.message}`);
    }
  } else if (rawText && rawText.trim().length > 0) {
    // Wrap raw text or markdown in simple semantic HTML
    const formattedParagraphs = rawText
      .split(/\n\s*\n/)
      .map(p => `<p>${p.trim()}</p>`)
      .join('\n');
    html = `<html><head><title>Raw Text Input</title></head><body><h1>Content Draft</h1>${formattedParagraphs}</body></html>`;
  } else {
    throw new Error('Please provide either a valid URL (starting with http:// or https://) or raw text content to analyze.');
  }

  const $ = cheerio.load(html);

  // Remove scripts, styles, iframes, and nav clutter for clean text extraction
  $('script:not([type="application/ld+json"])').remove();
  $('style, noscript, svg, nav, footer, header').remove();

  // Extract metadata
  const title = $('title').text().trim() || $('h1').first().text().trim() || 'Untitled Page';
  const metaDescription = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || finalUrl;

  // Extract structured schemas
  const jsonLdScripts = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const parsed = JSON.parse($(el).html());
      jsonLdScripts.push(parsed);
    } catch (e) {
      // ignore malformed JSON-LD
    }
  });

  // Extract headings
  const h1 = [];
  $('h1').each((_, el) => h1.push($(el).text().trim()));

  const h2 = [];
  $('h2').each((_, el) => h2.push($(el).text().trim()));

  const h3 = [];
  $('h3').each((_, el) => h3.push($(el).text().trim()));

  // Extract paragraphs with word counts
  const paragraphs = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 20) {
      const words = text.split(/\s+/).filter(Boolean);
      paragraphs.push({
        text,
        wordCount: words.length
      });
    }
  });

  // Extract lists and tables
  const listItemsCount = $('ul li, ol li').length;
  const tablesCount = $('table').length;

  // Extract external links / citations
  const outboundLinks = [];
  let domain = '';
  try {
    if (finalUrl && finalUrl.startsWith('http')) {
      domain = new URL(finalUrl).hostname.replace('www.', '');
    }
  } catch (e) {}

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http')) {
      try {
        const linkDomain = new URL(href).hostname.replace('www.', '');
        if (domain && linkDomain !== domain) {
          outboundLinks.push({
            href,
            domain: linkDomain,
            anchor: $(el).text().trim()
          });
        }
      } catch (e) {}
    }
  });

  // Full clean body text
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const allWords = bodyText.split(/\s+/).filter(Boolean);
  const first100Words = allWords.slice(0, 100).join(' ');

  return {
    url: finalUrl,
    domain: domain || 'yourbrand.com',
    title,
    metaDescription,
    canonical,
    h1,
    h2,
    h3,
    paragraphs,
    listItemsCount,
    tablesCount,
    outboundLinks,
    jsonLdScripts,
    totalWordCount: allWords.length,
    first100Words,
    bodyText
  };
}

module.exports = { scrapeContent };
