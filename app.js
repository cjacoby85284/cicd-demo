// ─────────────────────────────────────────────────────────────────────────────
// app.js  —  client-side logic for cicd-demo
//
// What this does:
//   1. Stamps the current time in the meta bar (as before)
//   2. Fetches the last 5 deployment records from Supabase
//   3. Renders them into the "Recent Deployments" section
//
// The Supabase anon key is intentionally public — it only has READ access to
// the deployments table (enforced by Row Level Security on the Supabase side).
// ─────────────────────────────────────────────────────────────────────────────

// ── Supabase connection details ───────────────────────────────────────────────
const SUPABASE_URL = 'https://ouuxueywkllggoyneiwm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91dXh1ZXl3a2xsZ2dveW5laXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3NzY4OTYsImV4cCI6MjA4NzM1Mjg5Nn0.5kg-1DIFl8qrhZ9UkDTjzx6a3ZDO7IHHBuRkZ1YI3bw';

document.addEventListener('DOMContentLoaded', () => {
    stampTimestamp();
    loadDeployments();
});

// ── Timestamp ─────────────────────────────────────────────────────────────────
function stampTimestamp() {
    const metaBox = document.querySelector('.meta-box');
    if (!metaBox) return;

    const item = document.createElement('div');
    item.className = 'meta-item';
    item.innerHTML = `
    <span class="meta-label">Page loaded</span>
    <span class="meta-value" id="timestamp"></span>
  `;
    metaBox.appendChild(item);

    const ts = document.getElementById('timestamp');
    const now = new Date();
    ts.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ── Deployments feed ──────────────────────────────────────────────────────────
async function loadDeployments() {
    const container = document.getElementById('deployments-list');
    if (!container) return;

    try {
        // Fetch the 5 most recent deployments, newest first.
        // This is a plain fetch() to the Supabase REST API — no SDK needed.
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/deployments?order=deployed_at.desc&limit=5`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const deployments = await response.json();

        if (deployments.length === 0) {
            container.innerHTML = `<p class="deploy-empty">No deployments recorded yet.</p>`;
            return;
        }

        container.innerHTML = deployments.map(d => {
            const date = new Date(d.deployed_at);
            const timeStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' })
                + '  '
                + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const sha = d.commit_sha ? d.commit_sha.slice(0, 7) : '???????';
            const msg = d.commit_message || 'No message';

            return `
        <div class="deploy-row">
          <span class="deploy-status">✅</span>
          <span class="deploy-time">${timeStr}</span>
          <span class="deploy-sha">${sha}</span>
          <span class="deploy-msg">${escapeHtml(msg)}</span>
        </div>
      `;
        }).join('');

    } catch (err) {
        container.innerHTML = `<p class="deploy-empty">Could not load deployments: ${err.message}</p>`;
        console.error('Deployments fetch error:', err);
    }
}

// Safety utility — never inject unsanitized text as HTML
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
