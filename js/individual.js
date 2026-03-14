// ===== INDIVIDUAL.JS — Individual Donor Dashboard =====

if (!requireAuth('INDIVIDUAL')) { /* redirect */ }

const user = Auth.getUser();
let indNgos = JSON.parse(localStorage.getItem('ngos') || '[]');
let indDonations = JSON.parse(localStorage.getItem('ind_donations') || '[]');

// Seed NGOs if empty
if (indNgos.length === 0) {
  indNgos = [
    { id:1, name:'Hope Foundation', location:'Bhopal, MP', accepts:'Cooked meals, packaged food', rating:4.8, emoji:'🌟' },
    { id:2, name:'Roti Bank India', location:'Indore, MP', accepts:'Rotis, Rice, Dal', rating:4.6, emoji:'💛' },
    { id:3, name:'Annapurna Trust', location:'Bhopal, MP', accepts:'All cooked food', rating:4.9, emoji:'🏆' },
    { id:4, name:'Feed India Society', location:'Jabalpur, MP', accepts:'Dry rations, cooked meals', rating:4.3, emoji:'🤝' },
  ];
  localStorage.setItem('ngos', JSON.stringify(indNgos));
}

window.addEventListener('DOMContentLoaded', () => {
  const name = user?.name || 'Individual';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('navUserName').textContent = name;
  loadNGOs();
  updateStats();
  renderHistory();
});

function showSection(name, el) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  document.getElementById('sec-' + name).style.display = 'block';
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
}

function updateStats() {
  document.getElementById('statMyDon').textContent = indDonations.length;
  document.getElementById('statAvailNgos').textContent = indNgos.length;
  const totalKg = indDonations.reduce((s, d) => s + (d.quantityKg || 0), 0);
  document.getElementById('statKgDon').textContent = totalKg.toFixed(1) + ' kg';
  document.getElementById('statAccepted').textContent = indDonations.filter(d => d.status === 'ACCEPTED').length;
}

async function loadNGOs() {
  try { indNgos = await API.ngo.getAll(); localStorage.setItem('ngos', JSON.stringify(indNgos)); } catch {}
  renderNGOGrid(indNgos);
  const sel = document.getElementById('indDonNGO');
  if (sel) sel.innerHTML = '<option value="">Select an NGO</option>' + indNgos.map(n => `<option value="${n.id}">${n.emoji||'🏥'} ${n.name} — ${n.location}</option>`).join('');
}

function renderNGOGrid(list) {
  const grid = document.getElementById('indNGOGrid');
  if (!grid) return;
  grid.innerHTML = list.map(n => `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div class="ngo-avatar">${n.emoji||'🏥'}</div>
        <div><div class="ngo-name">${n.name}</div><div class="ngo-location">📍 ${n.location}</div></div>
      </div>
      <div class="ngo-meta">
        <span class="badge badge-ngo">Verified ✓</span>
        <span class="star-rating">${'★'.repeat(Math.round(n.rating||5))} <span style="color:var(--text-light)">(${n.rating||5})</span></span>
      </div>
      <p class="ngo-accepts">🍽️ Accepts: ${n.accepts}</p>
      <button class="btn btn-success btn-sm btn-block" onclick="goToDonate(${n.id})">💚 Donate to ${n.name}</button>
    </div>`).join('');
}

function filterNGOs() {
  const q = document.getElementById('ngoSearch')?.value.toLowerCase();
  const filtered = q ? indNgos.filter(n => n.name.toLowerCase().includes(q) || n.location.toLowerCase().includes(q) || n.accepts.toLowerCase().includes(q)) : indNgos;
  renderNGOGrid(filtered);
}

function goToDonate(ngoId) {
  showSection('donate', document.querySelector('[onclick*=donate]'));
  setTimeout(() => { document.getElementById('indDonNGO').value = ngoId; }, 50);
}

document.getElementById('indDonForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = document.getElementById('indDonBtn');
  const ngoId = parseInt(document.getElementById('indDonNGO').value);
  const ngo = indNgos.find(n => n.id === ngoId);
  const entry = {
    id: Date.now(), receiptCode: 'FC-' + Date.now().toString().slice(-6),
    ngoId, ngoName: ngo?.name || 'NGO',
    foodDesc: document.getElementById('indFoodDesc').value,
    quantityKg: parseFloat(document.getElementById('indQty').value),
    address: document.getElementById('indAddress').value,
    pickupTime: document.getElementById('indPickupTime').value,
    status: 'PENDING', date: new Date().toISOString().split('T')[0]
  };
  btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
  try { await API.donation.submit({ ...entry, donorId: user?.id }); } catch {}
  indDonations.push(entry);
  localStorage.setItem('ind_donations', JSON.stringify(indDonations));
  document.getElementById('indDonForm').reset();
  updateStats(); renderHistory();
  showToast(`Donation request sent to ${ngo?.name}! 💚`, 'success');
  showSection('history', document.querySelector('[onclick*=history]'));
  btn.innerHTML = '💚 Submit Donation Request'; btn.disabled = false;
});

function renderHistory() {
  const tbody = document.getElementById('indHistoryBody');
  if (!tbody) return;
  if (indDonations.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text-light)">No donations yet. Browse NGOs to start!</td></tr>'; return; }
  tbody.innerHTML = indDonations.slice().reverse().map(d => {
    const b = d.status==='ACCEPTED'?'badge-success':d.status==='REJECTED'?'badge-danger':'badge-pending';
    return `<tr>
      <td><code style="font-size:0.78rem;background:var(--bg);padding:3px 8px;border-radius:4px">${d.receiptCode}</code></td>
      <td>${d.ngoName}</td><td>${d.foodDesc}</td>
      <td>${d.quantityKg} kg</td><td>${d.date}</td>
      <td><span class="badge ${b}">${d.status}</span></td>
    </tr>`;
  }).join('');
}
