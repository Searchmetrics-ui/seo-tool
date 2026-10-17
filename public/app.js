/**
 * GeoPulse Frontend Client Application
 * Handles API calls, dynamic chart/gauge rendering, simulator controls, and exports.
 */

let currentAuditData = null;
let currentMode = 'url';

// Sample Presets for instant local testing
const PRESETS = {
  good: {
    url: 'https://example.com/guide/enterprise-cloud-security',
    query: 'What are the best enterprise cloud security practices for 2026?',
    text: `# Enterprise Cloud Security Guide: Best Practices for 2026

Enterprise cloud security is the unified governance framework of identity verification, posture automation, and cryptographic controls designed to prevent unauthorized access across hybrid and multi-cloud infrastructure. According to Gartner's 2025 Cloud Benchmark, over 82% of enterprise breaches stem from IAM misconfigurations rather than zero-day vulnerabilities, highlighting the urgent necessity for automated CSPM tooling.

## What is Zero Trust Architecture?
Zero trust architecture is a security paradigm that eliminates implicit trust by requiring continuous authentication for every session regardless of network perimeter. As noted by NIST SP 800-207 standards, continuous validation reduces insider compromise risk by 64%.

### Core Implementation Checklist:
- Enforce Ephemeral IAM Credentials: Limit session lifetimes to a maximum of 60 minutes.
- Automated Posture Drift Detection: Schedule automated daily scans against CIS Level 2 benchmarks.
- Encrypt Data at Rest and in Transit: Require AES-256 and TLS 1.3 encryption across all datastores.`
  },
  poor: {
    url: 'https://legacy-blog.org/general-cloud-thoughts',
    query: 'What are the best enterprise cloud security practices for 2026?',
    text: `# Some Thoughts on the Cloud

I have been thinking a lot about computers and cloud things lately. When you put your data in the cloud, you really have to hope the servers are working well and nobody can break into them. There are many different vendors you can choose from these days. In this blog post I will reflect on my personal journey with computers over the last fifteen years.

It is always important to remember that computers are complicated machines and when you connect them together over the internet, many strange things can happen. Many people say you should be careful with your passwords and maybe change them once in a while. In conclusion, cloud security is something that everyone should probably think about at least once a year.`
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Automatically load the high-scoring sample preset on first open
  loadSamplePreset('good');
});

function setMode(mode) {
  currentMode = mode;
  const urlBtn = document.getElementById('mode-url-btn');
  const textBtn = document.getElementById('mode-text-btn');
  const urlGroup = document.getElementById('input-group-url');
  const textGroup = document.getElementById('input-group-text');

  if (mode === 'url') {
    urlBtn.className = 'text-orange-600 border-b-2 border-orange-500 pb-1.5 flex items-center gap-1.5 font-bold';
    textBtn.className = 'text-charcoal-500 hover:text-charcoal-900 pb-1.5 flex items-center gap-1.5 font-semibold';
    urlGroup.classList.remove('hidden');
    textGroup.classList.add('hidden');
  } else {
    textBtn.className = 'text-orange-600 border-b-2 border-orange-500 pb-1.5 flex items-center gap-1.5 font-bold';
    urlBtn.className = 'text-charcoal-500 hover:text-charcoal-900 pb-1.5 flex items-center gap-1.5 font-semibold';
    textGroup.classList.remove('hidden');
    urlGroup.classList.add('hidden');
  }
}

async function triggerAudit() {
  const btn = document.getElementById('btn-audit');
  const btnText = document.getElementById('btn-audit-text');
  const btnIcon = document.getElementById('btn-audit-icon');

  const urlInput = document.getElementById('input-url').value.trim();
  const rawTextInput = document.getElementById('input-raw-text').value.trim();
  const query = currentMode === 'url' 
    ? document.getElementById('input-query').value.trim()
    : document.getElementById('input-query-text').value.trim();

  const payload = {
    url: currentMode === 'url' ? urlInput : '',
    text: currentMode === 'text' ? rawTextInput : '',
    query: query,
    brand: ''
  };

function getApiUrl(endpoint) {
  if (window.location.protocol === 'file:' || !window.location.host.includes(':3000')) {
    return `http://localhost:3000${endpoint}`;
  }
  return endpoint;
}

async function triggerAudit() {
  const btn = document.getElementById('btn-audit');
  const btnText = document.getElementById('btn-audit-text');
  const btnIcon = document.getElementById('btn-audit-icon');

  const urlInput = document.getElementById('input-url').value.trim();
  const rawTextInput = document.getElementById('input-raw-text').value.trim();
  const query = currentMode === 'url' 
    ? document.getElementById('input-query').value.trim()
    : document.getElementById('input-query-text').value.trim();

  const payload = {
    url: currentMode === 'url' ? urlInput : '',
    text: currentMode === 'text' ? rawTextInput : '',
    query: query,
    brand: ''
  };

  if (!payload.url && !payload.text) {
    showToast('Please enter a URL or paste raw text.');
    return;
  }

  // Set loading state
  btn.disabled = true;
  btnText.innerText = 'Analyzing...';
  btnIcon.classList.add('animate-spin');

  try {
    const apiUrl = getApiUrl('/api/analyze');
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      throw new Error(data.error || `HTTP ${res.status}: Failed to analyze URL`);
    }

    currentAuditData = data;
    renderAuditResults(data);
    showToast(`Audit complete for ${data.domain || 'page'}!`);
  } catch (err) {
    console.error('Audit Error:', err);
    showToast(`Error: ${err.message}. Ensure GeoPulse server is running.`);
  } finally {
    btn.disabled = false;
    btnText.innerText = 'Audit Page';
    btnIcon.classList.remove('animate-spin');
  }
}

function loadSamplePreset(type) {
  const preset = PRESETS[type];
  const btnGood = document.getElementById('btn-preset-good');
  const btnPoor = document.getElementById('btn-preset-poor');

  if (type === 'good') {
    btnGood.className = 'px-3 py-1.5 rounded-lg font-bold bg-orange-600 text-white transition shadow-sm';
    btnPoor.className = 'px-3 py-1.5 rounded-lg font-bold text-charcoal-600 hover:text-charcoal-950 transition';
  } else {
    btnPoor.className = 'px-3 py-1.5 rounded-lg font-bold bg-rose-600 text-white transition shadow-sm';
    btnGood.className = 'px-3 py-1.5 rounded-lg font-bold text-charcoal-600 hover:text-charcoal-950 transition';
  }

  document.getElementById('input-url').value = preset.url;
  document.getElementById('input-query').value = preset.query;
  document.getElementById('input-raw-text').value = preset.text;
  document.getElementById('input-query-text').value = preset.query;

  // Run audit against the preset text
  fetch(getApiUrl('/api/analyze'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: '',
      text: preset.text,
      query: preset.query
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Overwrite domain for aesthetic presentation
      data.domain = type === 'good' ? 'example.com' : 'legacy-blog.org';
      currentAuditData = data;
      renderAuditResults(data);
    }
  })
  .catch(err => console.error(err));
}

function renderAuditResults(data) {
  const { geoIndex, tier, tierSummary, pillars, metricsSummary, checklist, standards, simulator, rewrites } = data;

  // 1. Update Gauge & Badge
  const scoreNum = document.getElementById('score-number');
  const scoreCircle = document.getElementById('score-circle');
  const scoreBadge = document.getElementById('score-badge');
  const scoreSummary = document.getElementById('score-summary');

  scoreNum.innerText = geoIndex;
  scoreCircle.setAttribute('stroke-dasharray', `${geoIndex}, 100`);

  if (geoIndex >= 75) {
    scoreCircle.className = 'text-orange-500 transition-all duration-700 ease-out';
    scoreBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-800 border border-orange-200';
    scoreBadge.innerText = tier;
  } else if (geoIndex >= 50) {
    scoreCircle.className = 'text-amber-500 transition-all duration-700 ease-out';
    scoreBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200';
    scoreBadge.innerText = tier;
  } else {
    scoreCircle.className = 'text-rose-500 transition-all duration-700 ease-out';
    scoreBadge.className = 'px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-200';
    scoreBadge.innerText = tier;
  }

  scoreSummary.innerText = tierSummary;
  document.getElementById('stat-summary-1').innerText = `${metricsSummary.statisticsCount} Statistical metrics & quotes detected`;
  document.getElementById('stat-summary-2').innerText = `${checklist.filter(c => c.severity === 'Passed').length} Standard checks passed`;
  document.getElementById('stat-answer-match').innerText = `${pillars.directAnswer}%`;
  document.getElementById('stat-citation-pot').innerText = geoIndex >= 70 ? 'Very High' : (geoIndex >= 50 ? 'Moderate' : 'Low');

  // 2. Update Pillar Progress Bars
  document.getElementById('metric-answer-badge').innerText = `${pillars.directAnswer}%`;
  document.getElementById('metric-answer-bar').style.width = `${pillars.directAnswer}%`;

  document.getElementById('metric-stats-badge').innerText = `${pillars.statsDensity}%`;
  document.getElementById('metric-stats-bar').style.width = `${pillars.statsDensity}%`;
  document.getElementById('metric-stats-desc').innerText = `${metricsSummary.statisticsCount} quantitative metrics, ${metricsSummary.quotesCount} quote citations.`;

  document.getElementById('metric-schema-badge').innerText = `${pillars.aiReadiness}%`;
  document.getElementById('metric-schema-bar').style.width = `${pillars.aiReadiness}%`;

  // 3. Render Checklist with Rewrites
  renderChecklist(checklist, rewrites);

  // 4. Render Simulator
  renderSimulator(simulator, data.domain);

  // 5. Render Standards Studio (llms.txt & schema)
  document.getElementById('code-llmstxt').innerText = standards.llmsTxt;
  document.getElementById('code-schema').innerText = standards.jsonLd;

  // 6. Render Princeton Breakdown
  renderPrincetonBreakdown(pillars, metricsSummary);
}

function renderChecklist(checklist, rewrites) {
  const container = document.getElementById('checklist-container');
  const titleEl = document.getElementById('tab-checklist-title');
  const badgesContainer = document.getElementById('checklist-badges');

  const highCount = checklist.filter(c => c.severity === 'High').length;
  const medCount = checklist.filter(c => c.severity === 'Medium').length;
  const passCount = checklist.filter(c => c.severity === 'Passed').length;

  titleEl.innerText = `Actionable Fix Checklist (${checklist.length})`;
  badgesContainer.innerHTML = `
    <span class="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">${highCount} High Priority</span>
    <span class="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">${medCount} Medium</span>
    <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">${passCount} Passed</span>
  `;

  let html = '';

  checklist.forEach((item, idx) => {
    const isPassed = item.severity === 'Passed';
    const isHigh = item.severity === 'High';

    const cardBorder = isPassed 
      ? 'border-emerald-200 bg-white' 
      : (isHigh ? 'border-rose-200 bg-white' : 'border-amber-200 bg-white');

    const badgeBg = isPassed
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : (isHigh ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-100 text-amber-800 border-amber-200');

    // Check if we have an associated rewrite suggestion
    const rewrite = rewrites && rewrites[idx % rewrites.length];

    html += `
      <div class="p-5 rounded-2xl border ${cardBorder} shadow-sm space-y-3">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-start gap-3">
            <span class="px-2.5 py-0.5 text-[11px] font-black rounded-full ${badgeBg} border uppercase mt-0.5">
              ${item.severity}
            </span>
            <div>
              <h4 class="text-sm font-bold text-charcoal-950">${item.title}</h4>
              <p class="text-xs text-charcoal-600 mt-1">${item.detail}</p>
              ${item.recommendation ? `<p class="text-xs font-semibold text-charcoal-800 mt-1.5"><span class="text-orange-600 font-bold">Fix:</span> ${item.recommendation}</p>` : ''}
            </div>
          </div>
          ${!isPassed && rewrite ? `
            <button onclick="toggleExpand('fix-rewrite-${idx}')" class="text-xs font-bold text-orange-700 hover:text-orange-800 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 flex-shrink-0 transition">
              View AI Rewrite ↓
            </button>
          ` : ''}
        </div>

        ${!isPassed && rewrite ? `
          <div id="fix-rewrite-${idx}" class="hidden pt-3 border-t border-charcoal-100 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="bg-charcoal-50 p-3.5 rounded-xl border border-charcoal-200">
              <span class="text-charcoal-500 font-bold uppercase tracking-wider block mb-1">Current Text</span>
              <p class="text-charcoal-800 italic">"${rewrite.original}"</p>
            </div>
            <div class="bg-orange-50/80 p-3.5 rounded-xl border border-orange-300">
              <span class="text-orange-900 font-bold uppercase tracking-wider block mb-1 flex items-center justify-between">
                <span>Optimized GEO Format (Recommended)</span>
                <button onclick="copyRawText('${escapeHtml(rewrite.optimized)}')" class="text-orange-700 hover:underline">Copy</button>
              </span>
              <p class="text-orange-950 whitespace-pre-line">${rewrite.optimized}</p>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  });

  container.innerHTML = html;
}

function renderSimulator(simulator, domain) {
  if (!simulator) return;

  document.getElementById('prob-perplexity').innerText = `${simulator.probabilities.perplexity}% Probability`;
  document.getElementById('prob-chatgpt').innerText = `${simulator.probabilities.chatgpt}% Probability`;
  document.getElementById('prob-gemini').innerText = `${simulator.probabilities.gemini}% Probability`;
  document.getElementById('prob-claude').innerText = `${simulator.probabilities.claude}% Probability`;

  const sourcesContainer = document.getElementById('sim-sources-container');
  sourcesContainer.innerHTML = simulator.sources.map(s => {
    if (s.isUserSite) {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-100 text-orange-900 border border-orange-300 text-xs font-bold">
          <span class="w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center text-[10px] font-black">${s.id}</span>
          ${s.domain} (Your Domain)
        </span>
      `;
    } else {
      return `
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white text-charcoal-700 border border-charcoal-200 text-xs font-medium">
          <span class="w-4 h-4 rounded-full bg-charcoal-200 text-charcoal-800 flex items-center justify-center text-[10px]">${s.id}</span>
          ${s.domain}
        </span>
      `;
    }
  }).join('');

  const answerBody = document.getElementById('sim-answer-body');
  answerBody.innerHTML = `
    ${simulator.paragraphs.map(p => `<p>${p}</p>`).join('')}
    <p class="font-bold text-charcoal-950 pt-2">Key Extracted Takeaways:</p>
    <ul class="list-disc pl-5 space-y-1.5">
      ${simulator.keyPoints.map(kp => `
        <li>${kp.text} <span class="bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded border border-orange-200 font-mono font-bold">[${kp.citation}]</span></li>
      `).join('')}
    </ul>
  `;

  document.getElementById('sim-user-status').innerText = simulator.isPrimarySource 
    ? 'Your Site Cited as Source [1]' 
    : 'Lower Visibility (Source [2] or Uncited)';
}

function renderPrincetonBreakdown(pillars, metrics) {
  const container = document.getElementById('princeton-cards-container');
  const factors = [
    { title: '1. Quote Addition', score: pillars.quoteAttribution, detail: `${metrics.quotesCount} direct quotes & attributions.` },
    { title: '2. Statistics Addition', score: pillars.statsDensity, detail: `${metrics.statisticsCount} quantitative metrics & years.` },
    { title: '3. Source Citations', score: Math.round(pillars.aiReadiness * 0.95), detail: `${metrics.outboundAuthLinks} authority external links.` },
    { title: '4. Fluency & Structure', score: pillars.directAnswer, detail: 'H1 > H2 heading hierarchy and bullet formatting.' },
    { title: '5. Technical Terminology', score: Math.round(pillars.directAnswer * 0.9), detail: 'Topic entity density and clear phrasing.' },
    { title: '6. Chunkability / Length', score: pillars.chunkability, detail: `${metrics.avgParagraphWords} avg words/paragraph (${metrics.longParagraphsCount} over 140w).` }
  ];

  container.innerHTML = factors.map(f => `
    <div class="bg-charcoal-50 p-4 rounded-xl border border-charcoal-200 space-y-2">
      <div class="flex justify-between items-center">
        <span class="font-bold text-charcoal-900">${f.title}</span>
        <span class="font-black text-xs ${f.score >= 75 ? 'text-orange-600' : (f.score >= 50 ? 'text-amber-600' : 'text-rose-600')}">${f.score}%</span>
      </div>
      <p class="text-charcoal-600">${f.detail}</p>
    </div>
  `).join('');
}

function renderSimulatorEngine() {
  const select = document.getElementById('engine-select');
  const nameEl = document.getElementById('sim-engine-name');
  const engineNames = {
    perplexity: 'Synthesized AI Response (Perplexity Pro)',
    chatgpt: 'Synthesized AI Response (ChatGPT Search)',
    gemini: 'Synthesized AI Response (Google Gemini AI Overview)',
    claude: 'Synthesized AI Response (Claude 3.7 Search)'
  };
  nameEl.innerText = engineNames[select.value] || 'Synthesized AI Response';
}

function switchTab(tabId) {
  const tabs = ['tab-checklist', 'tab-simulator', 'tab-schema', 'tab-inspector'];
  tabs.forEach(t => {
    const el = document.getElementById(t);
    const btn = document.getElementById('btn-' + t);
    if (t === tabId) {
      el.classList.remove('hidden');
      btn.classList.add('tab-active');
      btn.classList.remove('border-transparent', 'text-charcoal-600');
    } else {
      el.classList.add('hidden');
      btn.classList.remove('tab-active');
      btn.classList.add('border-transparent', 'text-charcoal-600');
    }
  });
}

function toggleExpand(id) {
  const el = document.getElementById(id);
  el.classList.toggle('hidden');
}

function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).innerText;
  copyRawText(text);
}

function copyRawText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  });
}

function downloadReport() {
  if (!currentAuditData) {
    showToast('Run an audit first before exporting.');
    return;
  }

  fetch(getApiUrl('/api/export'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentAuditData)
  })
  .then(res => res.blob())
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geopulse-audit-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Audit report downloaded as Markdown!');
  })
  .catch(err => {
    console.error(err);
    showToast('Could not download report.');
  });
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.innerText = msg;
  toast.classList.remove('translate-y-20', 'opacity-0');
  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2500);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
