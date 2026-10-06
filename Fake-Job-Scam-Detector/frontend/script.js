
/**
 * ScamShield – Fake Job & Internship Scam Detector
 * script.js | Frontend Logic
 *
 * Responsibilities:
 *  1. Navbar scroll behaviour & mobile menu
 *  2. Character counter for textarea
 *  3. Smooth scroll + active nav highlighting
 *  4. Form validation
 *  5. POST to Flask /predict endpoint
 *  6. Render prediction result (meter, warnings, features)
 *  7. GET /metrics from Flask → populate model comparison table
 */

// ─────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────
const API_BASE = "http://127.0.0.1:5000";   // Flask backend URL

// ─────────────────────────────────────────────────────────
// 1. Navbar – scroll effect + mobile toggle
// ─────────────────────────────────────────────────────────
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
  highlightActiveNavLink();
});

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("open");
});

// Close mobile menu on link click
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => navLinks.classList.remove("open"));
});

// ─────────────────────────────────────────────────────────
// 2. Active nav link based on scroll position
// ─────────────────────────────────────────────────────────
function highlightActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPos = window.scrollY + 80;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const link   = document.querySelector(`.nav-link[href="#${section.id}"]`);
    if (link) {
      link.classList.toggle("active", scrollPos >= top && scrollPos < bottom);
    }
  });
}

// ─────────────────────────────────────────────────────────
// 3. Character counter for textarea
// ─────────────────────────────────────────────────────────
const descTextarea = document.getElementById("jobDescription");
const charCount    = document.getElementById("charCount");

descTextarea.addEventListener("input", () => {
  const len = descTextarea.value.length;
  charCount.textContent = `${len.toLocaleString()} character${len !== 1 ? "s" : ""}`;
  charCount.style.color = len < 50 ? "#f43f5e" : len < 150 ? "#f59e0b" : "#10b981";
});

// ─────────────────────────────────────────────────────────
// 4. Clear form button
// ─────────────────────────────────────────────────────────
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("jobForm").reset();
  charCount.textContent = "0 characters";
  charCount.style.color = "";
  resetResultPanel();
});

document.getElementById("reAnalyzeBtn").addEventListener("click", () => {
  resetResultPanel();
  document.getElementById("formCard").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("jobTitle").focus();
});

// ─────────────────────────────────────────────────────────
// 5. Form submission → API call
// ─────────────────────────────────────────────────────────
const jobForm    = document.getElementById("jobForm");
const analyzeBtn = document.getElementById("analyzeBtn");
const btnText    = analyzeBtn.querySelector(".btn-text");
const btnLoader  = analyzeBtn.querySelector(".btn-loader");

jobForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Basic validation
  const title       = document.getElementById("jobTitle").value.trim();
  const company     = document.getElementById("companyName").value.trim();
  const description = descTextarea.value.trim();

  if (!title || !company || !description) {
    showFormError("Please fill in Job Title, Company Name, and Job Description (required fields).");
    return;
  }
  if (description.length < 20) {
    showFormError("Job Description is too short. Please provide at least 20 characters for accurate analysis.");
    return;
  }

  // Build payload
  const payload = {
    job_title:   title,
    company:     company,
    description: description,
    salary:      document.getElementById("salary").value.trim(),
    location:    document.getElementById("location").value.trim(),
    experience:  document.getElementById("experience").value,
    job_url:     document.getElementById("jobUrl").value.trim(),
  };

  // Set loading state
  setLoadingState(true);

  try {
    const response = await fetch(`${API_BASE}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Server error ${response.status}`);
    }

    const data = await response.json();
    renderResult(data);

  } catch (err) {
    showApiError(err.message);
  } finally {
    setLoadingState(false);
  }
});

// ─────────────────────────────────────────────────────────
// 6. Render result into the result panel
// ─────────────────────────────────────────────────────────
function renderResult(data) {
  /* Expected data shape from Flask /predict:
  {
    prediction:        "fake" | "suspicious" | "genuine",
    fraud_probability: 0.0 – 1.0,
    confidence:        0.0 – 1.0,
    risk_level:        "Low" | "Medium" | "High" | "Very High",
    warnings:          ["string", ...],
    risk_factors:      [{ label: "string", score: 0.0–1.0 }, ...],
    recommendation:    "string",
    model_used:        "string"
  }
  */

  // Show result panel
  document.getElementById("resultEmpty").classList.add("hidden");
  document.getElementById("resultContent").classList.remove("hidden");

  const pred = data.prediction || "genuine";
  const prob = Math.round((data.fraud_probability || 0) * 100);
  const conf = Math.round((data.confidence || 0) * 100);

  // ── Verdict header ──
  const verdictIconEl = document.getElementById("verdictIcon");
  const verdictIconSym = document.getElementById("verdictIconSymbol");
  const verdictTitle   = document.getElementById("verdictTitle");
  const verdictSub     = document.getElementById("verdictSubtitle");
  const verdictBadge   = document.getElementById("verdictBadge");

  verdictIconEl.className = "verdict-icon";

  if (pred === "fake") {
    verdictIconEl.classList.add("icon-fake");
    verdictIconSym.className  = "fas fa-circle-xmark";
    verdictTitle.textContent  = "⚠ Likely FAKE / SCAM";
    verdictTitle.style.color  = "var(--clr-fake)";
    verdictSub.textContent    = "High probability of employment fraud detected.";
    verdictBadge.textContent  = "SCAM";
    verdictBadge.className    = "verdict-badge badge-fake";
  } else if (pred === "suspicious") {
    verdictIconEl.classList.add("icon-susp");
    verdictIconSym.className  = "fas fa-triangle-exclamation";
    verdictTitle.textContent  = "🔶 SUSPICIOUS Posting";
    verdictTitle.style.color  = "var(--clr-susp)";
    verdictSub.textContent    = "Several red flags found. Proceed with caution.";
    verdictBadge.textContent  = "SUSPICIOUS";
    verdictBadge.className    = "verdict-badge badge-susp";
  } else {
    verdictIconEl.classList.add("icon-safe");
    verdictIconSym.className  = "fas fa-circle-check";
    verdictTitle.textContent  = "✅ Appears GENUINE";
    verdictTitle.style.color  = "var(--clr-safe)";
    verdictSub.textContent    = "No major red flags detected in this posting.";
    verdictBadge.textContent  = "GENUINE";
    verdictBadge.className    = "verdict-badge badge-safe";
  }

  // ── Probability meter ──
  const meterFill = document.getElementById("meterFill");
  const probValue = document.getElementById("probValue");
  // Animate after a short delay so CSS transition fires
  setTimeout(() => {
    meterFill.style.width = `${prob}%`;
  }, 100);
  probValue.textContent = `${prob}%`;

  // ── Risk level + confidence pills ──
  const riskPill = document.getElementById("riskPill");
  riskPill.textContent = data.risk_level || "Unknown";
  riskPill.className = "risk-pill";
  if (data.risk_level === "Very High" || data.risk_level === "High") {
    riskPill.classList.add("pill-red");
  } else if (data.risk_level === "Medium") {
    riskPill.classList.add("pill-amber");
  } else {
    riskPill.classList.add("pill-green");
  }

  const confPill = document.getElementById("confidencePill");
  confPill.textContent = `${conf}% Confidence`;

  // ── Warnings ──
  const warningsList  = document.getElementById("warningsList");
  const warningsCount = document.getElementById("warningsCount");
  warningsList.innerHTML = "";
  const warnings = data.warnings || [];
  warningsCount.textContent = warnings.length;

  if (warnings.length === 0) {
    warningsList.innerHTML = '<li><i class="fas fa-check-circle" style="color:var(--clr-safe)"></i> No specific red flags detected.</li>';
  } else {
    warnings.forEach(w => {
      const li = document.createElement("li");
      li.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${escapeHtml(w)}`;
      warningsList.appendChild(li);
    });
  }

  // ── Risk factors / feature bars ──
  const featuresList = document.getElementById("featuresList");
  featuresList.innerHTML = "";
  const factors = data.risk_factors || [];

  if (factors.length === 0) {
    featuresList.innerHTML = '<p style="font-size:0.83rem;color:var(--clr-text-3)">No detailed factor breakdown available.</p>';
  } else {
    factors.forEach(f => {
      const pct   = Math.round(f.score * 100);
      const cls   = pct >= 70 ? "bar-high" : pct >= 40 ? "bar-mid" : "bar-low";
      const item  = document.createElement("div");
      item.className = "feature-item";
      item.innerHTML = `
        <div class="feature-label">
          <span>${escapeHtml(f.label)}</span>
          <span class="feature-pct">${pct}%</span>
        </div>
        <div class="feature-bar-track">
          <div class="feature-bar-fill ${cls}" style="width:0%" data-target="${pct}%"></div>
        </div>`;
      featuresList.appendChild(item);
    });
    // Animate bars
    setTimeout(() => {
      document.querySelectorAll(".feature-bar-fill[data-target]").forEach(bar => {
        bar.style.width = bar.dataset.target;
      });
    }, 200);
  }

  // ── Recommendation ──
  const recText = document.getElementById("recText");
  recText.textContent = data.recommendation ||
    "Please review the job posting carefully and verify through official company channels.";

  // Change rec icon colour based on prediction
  const recIcon = document.getElementById("recIcon");
  recIcon.style.background = pred === "fake"
    ? "rgba(239,68,68,0.12)" : pred === "suspicious"
    ? "rgba(245,158,11,0.12)"
    : "rgba(16,185,129,0.12)";
  recIcon.style.color = pred === "fake"
    ? "var(--clr-fake)" : pred === "suspicious"
    ? "var(--clr-susp)" : "var(--clr-safe)";

  // Scroll result panel into view
  document.getElementById("resultPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─────────────────────────────────────────────────────────
// 7. Model metrics table  (GET /metrics)
// ─────────────────────────────────────────────────────────
async function loadModelMetrics() {
  const tbody = document.getElementById("statsTableBody");
  try {
    const response = await fetch(`${API_BASE}/metrics`);
    if (!response.ok) throw new Error("Backend not running");
    const data = await response.json();

    tbody.innerHTML = "";
    let bestModel = data.best_model || "";

    (data.metrics || []).forEach(m => {
      const isBest = m.model === bestModel;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(m.model)} ${isBest ? '<span class="best-badge"><i class="fas fa-star"></i>Best</span>' : ""}</td>
        <td>${(m.accuracy  * 100).toFixed(2)}%</td>
        <td>${(m.precision * 100).toFixed(2)}%</td>
        <td>${(m.recall    * 100).toFixed(2)}%</td>
        <td>${(m.f1_score  * 100).toFixed(2)}%</td>
        <td>${(m.roc_auc   * 100).toFixed(2)}%</td>
        <td>${isBest ? '<span style="color:var(--clr-safe);font-weight:700">✓ Active</span>' : '<span style="color:var(--clr-text-3)">Trained</span>'}</td>`;
      tbody.appendChild(tr);
    });
  } catch {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:1.5rem;color:var(--clr-text-3);font-size:0.85rem">
          <i class="fas fa-plug-circle-xmark" style="color:var(--clr-rose);margin-right:0.5rem"></i>
          Could not load metrics – make sure the Flask backend is running (<code>python backend/app.py</code>)
          and the model is trained (<code>python backend/train.py</code>).
        </td>
      </tr>`;
  }
}

// Load metrics when page loads
window.addEventListener("DOMContentLoaded", loadModelMetrics);

// ─────────────────────────────────────────────────────────
// Helper: UI states
// ─────────────────────────────────────────────────────────
function setLoadingState(loading) {
  analyzeBtn.disabled = loading;
  btnText.classList.toggle("hidden", loading);
  btnLoader.classList.toggle("hidden", !loading);
}

function resetResultPanel() {
  document.getElementById("resultEmpty").classList.remove("hidden");
  document.getElementById("resultContent").classList.add("hidden");
  document.getElementById("meterFill").style.width = "0%";
}

function showFormError(msg) {
  alert("⚠ " + msg);   // Simple – replace with a toast if desired
}

function showApiError(msg) {
  const panel = document.getElementById("resultPanel");
  document.getElementById("resultEmpty").classList.add("hidden");
  document.getElementById("resultContent").classList.add("hidden");

  // Inject temporary error message
  let errDiv = document.getElementById("apiError");
  if (!errDiv) {
    errDiv = document.createElement("div");
    errDiv.id = "apiError";
    errDiv.style.cssText = "padding:2rem;text-align:center;";
    panel.appendChild(errDiv);
  }
  errDiv.innerHTML = `
    <div style="font-size:2rem;margin-bottom:1rem;color:var(--clr-rose)">
      <i class="fas fa-circle-xmark"></i>
    </div>
    <strong style="color:var(--clr-rose)">Connection Error</strong>
    <p style="font-size:0.85rem;color:var(--clr-text-2);margin-top:0.5rem">${escapeHtml(msg)}</p>
    <p style="font-size:0.8rem;color:var(--clr-text-3);margin-top:0.75rem">
      Make sure Flask is running:<br>
      <code style="background:var(--clr-surface2);padding:0.2rem 0.5rem;border-radius:4px">python backend/app.py</code>
    </p>`;
  panel.scrollIntoView({ behavior: "smooth" });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
