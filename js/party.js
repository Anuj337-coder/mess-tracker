// ===== PARTY.JS — Party Organizer Dashboard Logic =====

if (!requireAuth('PARTY')) { /* redirect */ }

const user = Auth.getUser();
let partyNgos = JSON.parse(localStorage.getItem('ngos') || '[]');
let partyEstimates = JSON.parse(localStorage.getItem('party_estimates') || '[]');
let partyDonations = JSON.parse(localStorage.getItem('party_donations') || '[]');

// Food quantity formulas per person (grams)
const FORMULAS = {
  FULL: {
    'Rice': 150, 'Dal / Curry': 150, 'Roti / Naan': 120,
    'Sabzi / Dry Veg': 100, 'Salad': 50, 'Dessert': 80, 'Papad / Pickle': 20
  },
  BREAKFAST: {
    'Poha / Upma': 150, 'Bread / Toast': 80, 'Fruits': 100,
    'Tea / Coffee': 200, 'Namkeen / Snacks': 60
  },
  SNACKS: {
    'Samosa / Kachori': 100, 'Pakoda': 80, 'Sweets': 70,
    'Tea / Coffee': 200, 'Biscuits': 50
  }
};

// Event type multipliers
const MULTIPLIERS = { WEDDING: 1.15, BIRTHDAY: 1.05, CORPORATE: 1.0, CASUAL: 0.95 };
const EVENT_NAMES = { WEDDING: '💍 Wedding', BIRTHDAY: '🎂 Birthday', CORPORATE: '💼 Corporate', CASUAL: '🎊 Casual' };

window.addEventListener('DOMContentLoaded', () => {
  const name = user?.name || 'Party Organizer';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('navUserName').textContent = name;
  document.getElementById('eventDate').value = new Date().toISOString().split('T')[0];
  loadNGOs();
  renderEstHistory();
  renderDonHistory();
});

function showSection(name, el) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  document.getElementById('sec-' + name).style.display = 'block';
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
  if (name === 'ngo') loadNGOs();
}

// ---- ESTIMATOR ----
let currentEstimate = null;

document.getElementById('estimatorForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const guests = parseInt(document.getElementById('guestCount').value);
  const eventType = document.getElementById('eventType').value;
  const mealType = document.getElementById('estMealType').value;
  const formula = FORMULAS[mealType];
  const multiplier = MULTIPLIERS[eventType] || 1;

  const results = {};
  let totalGrams = 0;
  Object.entries(formula).forEach(([item, gramsPer]) => {
    const qty = Math.ceil((guests * gramsPer * multiplier) / 100) / 10; // kg
    results[item] = qty;
    totalGrams += qty;
  });
  currentEstimate = { guests, eventType, mealType, results, totalKg: totalGrams.toFixed(1), date: document.getElementById('eventDate').value };

  renderEstimateResult(results, guests, totalGrams, eventType, mealType);
});

function renderEstimateResult(results, guests, total, eventType, mealType) {
  document.getElementById('resultPanel').style.display = 'block';
  document.getElementById('resultSubtitle').textContent = `For ${guests} guests · ${EVENT_NAMES[eventType]}`;
  document.getElementById('estimateResults').innerHTML = Object.entries(results).map(([item, qty]) => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.15)">
      <span style="font-size:0.875rem;color:rgba(255,255,255,0.9)">${item}</span>
      <strong style="color:white">${qty} kg</strong>
    </div>`).join('') +
    `<div style="display:flex;justify-content:space-between;margin-top:12px;padding-top:10px;border-top:2px solid rgba(255,255,255,0.3)">
       <span style="font-weight:700;color:white">Total Estimated</span>
       <strong style="color:white;font-size:1.1rem">${total.toFixed(1)} kg</strong>
     </div>`;
  initPartyChart(Object.keys(results), Object.values(results));
}

function saveEstimate() {
  if (!currentEstimate) return;
  try { API.party.estimate({ ...currentEstimate, userId: user?.id }); } catch {}
  partyEstimates.push({ id: Date.now(), ...currentEstimate });
  localStorage.setItem('party_estimates', JSON.stringify(partyEstimates));
  renderEstHistory();
  showToast('Estimate saved! 💾', 'success');
}

function renderEstHistory() {
  const tbody = document.getElementById('estHistoryBody');
  if (!tbody) return;
  if (partyEstimates.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text-light)">No estimates saved yet</td></tr>'; return; }
  tbody.innerHTML = partyEstimates.slice().reverse().map(e => `
    <tr>
      <td>${e.date}</td>
      <td><span class="badge badge-warning">${EVENT_NAMES[e.eventType] || e.eventType}</span></td>
      <td>${e.guests}</td>
      <td>${e.mealType}</td>
      <td><strong>${e.totalKg} kg</strong></td>
    </tr>`).join('');
}

// ---- NGO ----
async function loadNGOs() {
  try { partyNgos = await API.ngo.getAll(); localStorage.setItem('ngos', JSON.stringify(partyNgos)); } catch {}
  if (partyNgos.length === 0) {
    partyNgos = JSON.parse(localStorage.getItem('ngos') || '[{"id":1,"name":"Hope Foundation","location":"Bhopal","accepts":"All cooked food","rating":4.8,"emoji":"🌟"}]');
  }
  const grid = document.getElementById('partyNGOGrid');
  const sel = document.getElementById('pdNGO');
  if (grid) grid.innerHTML = partyNgos.map(n => `
    <div class="ngo-card">
      <div class="ngo-card-header"><div class="ngo-avatar">${n.emoji||'🏥'}</div>
        <div><div class="ngo-name">${n.name}</div><div class="ngo-location">📍 ${n.location}</div></div></div>
      <div class="ngo-meta"><span class="badge badge-ngo">Verified ✓</span>
        <span class="star-rating">${'★'.repeat(Math.round(n.rating||5))} <span style="color:var(--text-light)">(${n.rating||5})</span></span></div>
      <p class="ngo-accepts">🍽️ ${n.accepts}</p>
      <button class="btn btn-primary btn-sm btn-block" onclick="document.getElementById('pdNGO').value=${n.id}">Select this NGO</button>
    </div>`).join('');
  if (sel) sel.innerHTML = '<option value="">Select NGO</option>' + partyNgos.map(n => `<option value="${n.id}">${n.emoji||'🏥'} ${n.name}</option>`).join('');
}

document.getElementById('partyDonForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = e.submitter;
  const ngoId = parseInt(document.getElementById('pdNGO').value);
  const ngo = partyNgos.find(n => n.id === ngoId);
  const entry = {
    id: Date.now(), receiptCode: 'FC-' + Date.now().toString().slice(-6),
    ngoId, ngoName: ngo?.name || 'NGO',
    foodDesc: document.getElementById('pdFoodDesc').value,
    quantityKg: parseFloat(document.getElementById('pdQty').value),
    note: document.getElementById('pdNote').value,
    status: 'PENDING', date: new Date().toISOString().split('T')[0]
  };
  btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
  try { await API.donation.submit({ ...entry, donorId: user?.id }); } catch {}
  partyDonations.push(entry);
  localStorage.setItem('party_donations', JSON.stringify(partyDonations));
  document.getElementById('partyDonForm').reset();
  showToast(`Request sent to ${ngo?.name}! 🎉`, 'success');
  renderDonHistory();
  btn.innerHTML = '🤝 Send Donation Request'; btn.disabled = false;
});

function renderDonHistory() {
  const tbody = document.getElementById('partyDonHistory');
  if (!tbody) return;
  if (partyDonations.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-light)">No donations yet</td></tr>'; return; }
  tbody.innerHTML = partyDonations.slice().reverse().map(d => {
    const b = d.status==='ACCEPTED'?'badge-success':d.status==='REJECTED'?'badge-danger':'badge-pending';
    return `<tr>
      <td><code style="font-size:0.78rem;background:var(--bg);padding:3px 8px;border-radius:4px">${d.receiptCode}</code></td>
      <td>${d.ngoName}</td><td>${d.foodDesc}</td>
      <td>${d.quantityKg} kg</td><td>${d.date}</td>
      <td><span class="badge ${b}">${d.status}</span></td>
    </tr>`;
  }).join('');
}
