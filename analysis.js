/*=========================================
   ResumeAI Pro - Dynamic JS Logic Fix
=========================================*/

let currentAnalysisData = null;

document.addEventListener("DOMContentLoaded", () => {
    checkUploadAndLoadData();
});

function checkUploadAndLoadData() {
    const rawData = localStorage.getItem("latest_analysis");

    const noDataBanner = document.getElementById("noDataBanner");
    const dashboardContent = document.getElementById("dashboardContent");

    if (!rawData) {
        if (noDataBanner) noDataBanner.style.display = "block";
        if (dashboardContent) dashboardContent.style.display = "none";
        return;
    }

    if (noDataBanner) noDataBanner.style.display = "none";
    if (dashboardContent) dashboardContent.style.display = "block";

    currentAnalysisData = JSON.parse(rawData);
    renderDashboard(currentAnalysisData);
    renderHistoryTable();
}

function renderDashboard(data) {
    // 1. File Name & Score setup
    document.getElementById("fileTag").innerHTML = `<i class="fa-solid fa-file-lines"></i> ${data.fileName || 'Resume.pdf'}`;
    const score = data.score || 0;
    updateScoreUI(score);

    // 2. Dynamic Skills Parsing
    const foundSkills = Array.isArray(data.foundSkills) ? data.foundSkills : (data.skills || []);
    const missingSkills = Array.isArray(data.missingSkills) ? data.missingSkills : [];
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];

    // REAL Counts Mapping
    document.getElementById("countFound").innerText = foundSkills.length;
    document.getElementById("countMissing").innerText = missingSkills.length;
    document.getElementById("countSuggestions").innerText = suggestions.length;

    // 3. Render Badges
    const foundContainer = document.getElementById("foundSkillsContainer");
    foundContainer.innerHTML = foundSkills.length > 0 
        ? foundSkills.map(s => `<span class="skill-tag found"><i class="fa-solid fa-check"></i> ${s}</span>`).join("")
        : `<p style="color: #94a3b8; font-size: 13px;">No skills extracted.</p>`;

    const missingContainer = document.getElementById("missingSkillsContainer");
    missingContainer.innerHTML = missingSkills.length > 0
        ? missingSkills.map(s => `<span class="skill-tag missing"><i class="fa-solid fa-xmark"></i> ${s}</span>`).join("")
        : `<p style="color: #94a3b8; font-size: 13px;">No missing skills detected.</p>`;

    // 4. Render Suggestions
    const suggestionsGrid = document.getElementById("suggestionsGrid");
    suggestionsGrid.innerHTML = suggestions.length > 0
        ? suggestions.map(s => `
            <div class="suggestion-card">
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <p>${s}</p>
            </div>
        `).join("")
        : `<p style="color: #94a3b8; font-size: 13px;">No recommendations available.</p>`;
}

function updateScoreUI(score) {
    document.getElementById("scoreValue").innerText = score + "%";
    
    const circle = document.getElementById("scoreRing");
    const circumference = 2 * Math.PI * 52; 
    const offset = circumference - (score / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    const scoreTitle = document.getElementById("scoreTitle");
    if (score >= 80) {
        scoreTitle.innerText = "Excellent Match!";
        scoreTitle.style.color = "#10b981";
    } else if (score >= 60) {
        scoreTitle.innerText = "Moderate Match";
        scoreTitle.style.color = "#d97706";
    } else {
        scoreTitle.innerText = "Needs Optimization";
        scoreTitle.style.color = "#ef4444";
    }
}

/* History Table Logic & Delete Item */
function renderHistoryTable() {
    const history = JSON.parse(localStorage.getItem("resume_history") || "[]");
    const tbody = document.getElementById("historyTableBody");

    if (!tbody) return;

    if (history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#94a3b8; padding:20px;">No history records found.</td></tr>`;
        return;
    }

    tbody.innerHTML = history.map((item, index) => `
        <tr>
            <td><strong><i class="fa-solid fa-file-pdf" style="color:#ef4444; margin-right:8px;"></i> ${item.fileName}</strong></td>
            <td style="color:#64748b;">${item.date || 'Recent'}</td>
            <td><span class="skill-tag found">${item.score}% Match</span></td>
            <td><span style="color:#10b981; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Processed</span></td>
            <td>
                <button class="btn-delete" onclick="deleteHistoryItem(${index})"><i class="fa-solid fa-trash"></i> Delete</button>
            </td>
        </tr>
    `).join("");
}

function deleteHistoryItem(index) {
    let history = JSON.parse(localStorage.getItem("resume_history") || "[]");
    history.splice(index, 1);
    localStorage.setItem("resume_history", JSON.stringify(history));
    renderHistoryTable();
}

function clearAllHistory() {
    if (confirm("Are you sure you want to clear all history records?")) {
        localStorage.removeItem("resume_history");
        renderHistoryTable();
    }
}

/* Modal View */
function openModal(type) {
    if (!currentAnalysisData) return;

    const modal = document.getElementById("detailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalBody = document.getElementById("modalBody");

    if (type === 'found') {
        modalTitle.innerText = "Matched Skills Details";
        const skills = currentAnalysisData.foundSkills || currentAnalysisData.skills || [];
        modalBody.innerHTML = `<div class="badge-container">${skills.map(s => `<span class="skill-tag found">${s}</span>`).join("")}</div>`;
    } else if (type === 'missing') {
        modalTitle.innerText = "Missing Skills Details";
        const missing = currentAnalysisData.missingSkills || [];
        modalBody.innerHTML = `<div class="badge-container">${missing.map(s => `<span class="skill-tag missing">${s}</span>`).join("")}</div>`;
    } else if (type === 'suggestions') {
        modalTitle.innerText = "AI Action Items";
        const suggestions = currentAnalysisData.suggestions || [];
        modalBody.innerHTML = suggestions.map((s, i) => `<div style="padding:10px; background:#f8fafc; border-radius:10px; margin-bottom:8px; font-weight:600;">${i+1}. ${s}</div>`).join("");
    }

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("detailModal").style.display = "none";
}