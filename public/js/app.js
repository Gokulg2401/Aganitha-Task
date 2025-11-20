const API_URL = "/api/links";

// DOM Elements
const createForm = document.getElementById("create-form");
const linksTableBody = document.getElementById("links-table-body");
const urlInput = document.getElementById("url-input");
const codeInput = document.getElementById("code-input");
const formMessage = document.getElementById("form-message");
const searchInput = document.getElementById("search-input");

// State
let links = [];

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;

  if (createForm) {
    console.log(`\n🏠 Dashboard Page - GET / \n📍 Path: /\n🔐 Auth: Public\n`);
    fetchLinks();
    createForm.addEventListener("submit", handleCreateLink);
    searchInput.addEventListener("input", handleSearch);
    // Removed auto-refresh - only fetch when user interacts
  } else {
    // Stats page logic
    const code = currentPath.split("/").pop();
    console.log(
      `\n📊 Stats Page - GET /code/:code\n📍 Path: /code/${code}\n🔐 Auth: Public\n`
    );
    loadStats();
    // Removed auto-refresh - only load when page loads
  }
});

// Expose fetchLinks for the refresh button
window.fetchLinks = fetchLinks;

// Fetch all links
async function fetchLinks() {
  try {
    console.log(`📡 GET /api/links - Fetching all links...`);
    const res = await fetch(API_URL);
    links = await res.json();
    console.log(`✅ GET /api/links - Retrieved ${links.length} links`);
    renderLinks(links);
  } catch (error) {
    console.error("❌ GET /api/links - Failed to fetch links:", error);
  }
}

// Render links table
function renderLinks(linksToRender) {
  linksTableBody.innerHTML = "";

  if (linksToRender.length === 0) {
    linksTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="text-center" style="padding: 3rem; color: var(--text-secondary);">
                    No links found. Create one above!
                </td>
            </tr>
        `;
    return;
  }

  linksToRender.forEach((link) => {
    const tr = document.createElement("tr");
    const shortUrl = `${window.location.origin}/${link.code}`;

    tr.innerHTML = `
            <td>
                <a href="/${link.code}" target="_blank" class="short-link">${link.code}</a>
                <button class="copy-btn" onclick="copyToClipboard('${shortUrl}')" title="Copy">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
            </td>
            <td><a href="${link.originalUrl}" target="_blank" class="original-url" title="${link.originalUrl}">${link.originalUrl}</a></td>
            <td>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="deleteLink('${link.code}')" class="btn-icon btn-delete" title="Delete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        `;
    linksTableBody.appendChild(tr);
  });
}

// Create Link
async function handleCreateLink(e) {
  e.preventDefault();
  const url = urlInput.value;
  const code = codeInput.value.trim();

  const submitBtn = createForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Creating...";
  formMessage.textContent = "";
  formMessage.className = "";

  try {
    console.log(`📡 POST /api/links - Creating link`, {
      url,
      code: code || "auto-generated",
    });
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, code: code || undefined }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(`❌ POST /api/links - Error (${res.status}):`, data);
      throw new Error(data.error || "Something went wrong");
    }

    console.log(`✅ POST /api/links - Link created successfully`, data);

    // Success
    urlInput.value = "";
    codeInput.value = "";
    fetchLinks();
    showMessage("Link created successfully!", "success");
  } catch (error) {
    console.error(`❌ POST /api/links - Failed:`, error.message);
    showMessage(error.message, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Shorten URL";
  }
}

// Delete Link
async function deleteLink(code) {
  if (!confirm("Are you sure you want to delete this link?")) return;

  try {
    console.log(`📡 DELETE /api/links/${code} - Deleting link...`);
    const res = await fetch(`${API_URL}/${code}`, { method: "DELETE" });
    if (res.ok) {
      console.log(`✅ DELETE /api/links/${code} - Link deleted successfully`);
      fetchLinks();
    } else {
      console.error(`❌ DELETE /api/links/${code} - Failed (${res.status})`);
      alert("Failed to delete link");
    }
  } catch (error) {
    console.error(`❌ DELETE /api/links/${code} - Error:`, error);
  }
}

// Search/Filter
function handleSearch(e) {
  const term = e.target.value.toLowerCase();
  const filtered = links.filter(
    (link) =>
      link.code.toLowerCase().includes(term) ||
      link.originalUrl.toLowerCase().includes(term)
  );
  renderLinks(filtered);
}

// Stats Page Logic
async function loadStats() {
  const pathParts = window.location.pathname.split("/");
  const code = pathParts[pathParts.length - 1];

  try {
    console.log(`📡 GET /api/links/${code} - Fetching stats for code...`);
    const res = await fetch(`${API_URL}/${code}`);
    if (!res.ok) {
      console.error(`❌ GET /api/links/${code} - Not found (${res.status})`);
      window.location.href = "/404.html";
      return;
    }

    const link = await res.json();
    console.log(`✅ GET /api/links/${code} - Stats loaded:`, {
      code: link.code,
      originalUrl: link.originalUrl,
      createdAt: link.createdAt,
    });

    document.getElementById("stats-code").textContent = link.code;
    document.getElementById("stats-url").textContent = link.originalUrl;
    document.getElementById("stats-url").href = link.originalUrl;
    document.getElementById("stats-clicks").textContent = link.clicks;
    document.getElementById("stats-created").textContent = formatDate(
      link.createdAt
    );
    document.getElementById("stats-last").textContent = formatDate(
      link.lastClickedAt
    );

    // Update QR Code (using an external API for simplicity)
    const qrImg = document.getElementById("qr-code");
    if (qrImg) {
      qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${window.location.origin}/${link.code}`;
    }
  } catch (error) {
    console.error(`❌ GET /api/links/${code} - Error:`, error);
  }
}

// Utilities
function formatDate(dateString) {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function showMessage(msg, type) {
  formMessage.textContent = msg;
  formMessage.className =
    type === "error" ? "error-message" : "success-message";
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text);
  // Could show a small toast here
}
