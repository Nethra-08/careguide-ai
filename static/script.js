/* ==========================================================================
CareGuide AI - Backend Connector
========================================================================== */
const departmentsData = [
{ name: "Cardiology", desc: "Deals with conditions affecting the heart and blood vessels." },
{ name: "Neurology", desc: "Brain, spine, nervous system, chronic migraines, and vertigo." },
{ name: "Orthopedics", desc: "Bones, joints, ligament injuries, and musculoskeletal pain." },
{ name: "ENT", desc: "Ear pain, sinus pressure, throat infections, and hearing problems." },
{ name: "Gastroenterology", desc: "Stomach issues, acid reflux, and digestive conditions." },
{ name: "Dermatology", desc: "Skin rashes, hives, allergic eczema, and nail disorders." }
];
const commonSymptoms = [
"ear pain",
"blocked ear",
"difficulty hearing",
"chest pain",
"shortness of breath",
"severe headache",
"knee joint pain",
"stomach ache",
"skin rash and itching"
];
// Screen navigation
function navigateTo(viewId) {
document.querySelectorAll('.page-view').forEach(view => {
view.classList.remove('active');
});
const target = document.getElementById(`view-${viewId}`);
if (target) {
target.classList.add('active');
}
document.querySelectorAll('.nav-link').forEach(btn => {
btn.classList.toggle('active', btn.getAttribute('data-nav') === viewId);
});
window.scrollTo({ top: 0, behavior: 'smooth' });
}
// Chip click toggler
function toggleChip(chip, text) {
chip.classList.toggle('selected');
const textarea = document.getElementById('userSymptomInput');
const selectedChips = Array.from(document.querySelectorAll('.symptom-chip.selected')).map(c => c.dataset.val);
textarea.value = selectedChips.join(', ');
}
// Initial UI population
function init() {
const homeDepts = document.getElementById('homeDepts');
const allDepts = document.getElementById('allDepts');
const symptomGrid = document.getElementById('symptomGrid');
if (homeDepts) {
homeDepts.innerHTML = departmentsData.slice(0, 4).map(d => `
<div class="dept-card">
<h3>${d.name}</h3>
<p>${d.desc}</p>
</div>
`).join('');
}
if (allDepts) {
allDepts.innerHTML = departmentsData.map(d => `
<div class="dept-card">
<h3>${d.name}</h3>
<p>${d.desc}</p>
</div>
`).join('');
}
if (symptomGrid) {
symptomGrid.innerHTML = commonSymptoms.map(sym => `
<div class="symptom-chip" data-val="${sym}" onclick="toggleChip(this, '${sym}')">
${sym}
</div>
`).join('');
}
}
// ==========================================================================
// Flask API Connection: POST /analyze
// ==========================================================================
async function requestAnalysis() {
const textarea = document.getElementById('userSymptomInput');
const symptoms = textarea.value.trim();
if (!symptoms) {
alert("Please enter or select at least one symptom.");
return;
}
const btn = document.getElementById('analyzeBtn');
btn.disabled = true;
btn.textContent = "AI Analyzing...";
try {
const response = await fetch("/analyze", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
symptoms: symptoms
})
});
if (!response.ok) {
throw new Error(`Server status: ${response.status}`);
}
const result = await response.json();
// Handling backend response structure: { "result": "{ ...AI JSON... }" }
let aiData;
if (typeof result.result === "string") {
aiData = JSON.parse(result.result);
} else {
aiData = result.result || result;
}
// Exact IDs assignment
document.getElementById("department").textContent = aiData.department || "General Medicine";
document.getElementById("urgency").textContent = aiData.urgency || "Moderate";
// Reasons array format mapping to explanation
if (Array.isArray(aiData.reasons)) {
    document.getElementById("explanation").textContent =
        "• " + aiData.reasons.join("\n• ");
} else {
    document.getElementById("explanation").textContent =
        aiData.reasons || "Evaluation completed.";
}
document.getElementById("nextStep").textContent = aiData.recommendation || "Consult with a medical specialist.";
// Navigate to results screen
navigateTo('result');
} catch (err) {
console.error("Backend Error:", err);
alert("Could not connect to Flask backend! Make sure `python app.py` is running.");
} finally {
btn.disabled = false;
btn.textContent = "Analyze Symptoms →";
}
}
document.addEventListener("DOMContentLoaded", init);