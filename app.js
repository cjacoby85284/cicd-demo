// A tiny bit of JS to make the page feel alive.
// In a real app this could fetch live data from an API,
// but since we're purely static, we just animate the "build time."

document.addEventListener('DOMContentLoaded', () => {
    // Stamp the current date/time to show this is a real deployment
    const metaBox = document.querySelector('.meta-box');
    if (metaBox) {
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
});
