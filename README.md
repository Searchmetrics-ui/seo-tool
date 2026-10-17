# GeoPulse — AEO & Generative Engine Optimization (GEO) Suite

> Complete Answer Engine Optimization (AEO) and Generative Search Visibility analysis tool. Audit your web content against Perplexity Pro, ChatGPT Search, Google Gemini AI Overviews, and Claude 3.7 Search.

---

## ⚡ Key Features

- **Multi-Pillar AEO & GEO Scoring (0 - 100 Index):**
  - **Direct Answerability (AEO):** First-100 word definition test, direct Q&A heading alignment, definition snippets.
  - **Princeton GEO Benchmarks:** Statistical density (percentages, currency, metrics), authoritative quotation attribution, and outbound verification links.
  - **RAG Chunkability Safety:** Identifies paragraphs exceeding 140 words that risk token truncation in 512-token vector embedding retrieval.
  - **Structured Data & AI Readiness:** JSON-LD detection (`FAQPage`, `Article`, `SpeakableSpecification`) and `/llms.txt` crawler standard verification.
- **Actionable Optimization Checklist:** High, Medium, and Passed priority tasks with side-by-side **AI Rewrite Suggestions**.
- **AI Answer Engine Simulator:** Real-time visual simulation showing how Perplexity, ChatGPT Search, and Google AI Overviews cite and synthesize your content with numbered citation pills `[1]`.
- **`llms.txt` & Schema Studio:** Instant one-click copyable generator for `/llms.txt`, `/llms-full.txt`, and Schema.org JSON-LD markup.
- **Export Reports:** One-click download of audit findings as Markdown or JSON reports.
- **100% Local Heuristic Processing:** Operates out-of-the-box with zero mandatory paid API keys.

---

## 🚀 Getting Started

### 1. Start the Server
```bash
npm start
# Or
node server.js
```

### 2. Open the Dashboard in Your Browser
Navigate to:
```
http://localhost:3000
```

---

## 📂 Project Architecture

```
c:\SEO Tool\
├── server.js               # Express API backend & static file server
├── public/
│   ├── index.html          # Responsive single-page dashboard (White & Orange Theme)
│   └── app.js              # Client controller, API client & dynamic renderers
├── lib/
│   ├── scraper.js          # URL content scraper & DOM sanitizer (Cheerio)
│   ├── aeo-analyzer.js     # Direct answer extraction readiness engine
│   ├── geo-analyzer.js     # Academic Princeton GEO multi-factor algorithm
│   ├── rewriter.js         # Contextual AI content rewrite generator
│   ├── simulator.js        # Answer engine citation simulator
│   ├── schema-builder.js   # JSON-LD & /llms.txt standard generator
│   └── exporter.js         # Markdown and JSON report exporter
├── package.json
└── README.md
```

---

## 🔬 Scoring Methodology

$$\text{GEO Index} = 0.30 \times S_{\text{AEO}} + 0.25 \times S_{\text{Stats}} + 0.20 \times S_{\text{Quotes}} + 0.15 \times S_{\text{Schema}} + 0.10 \times S_{\text{Chunk}}$$

- **$S_{\text{AEO}}$**: Evaluates whether the target question is concisely answered (30–60 words) immediately below the H1/H2.
- **$S_{\text{Stats}}$**: Evaluates empirical metrics, percentages, benchmark years, and quantitative figures.
- **$S_{\text{Quotes}}$**: Evaluates expert quotations with accredited institutional attribution.
- **$S_{\text{Schema}}$**: Validates JSON-LD (`FAQPage`, `Speakable`) and presence of `/llms.txt`.
- **$S_{\text{Chunk}}$**: Penalizes dense blocks over 140 words that truncate in RAG embeddings.
