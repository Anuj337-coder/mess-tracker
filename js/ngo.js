// ===== NGO.JS — NGO Dashboard Logic =====

if (!requireAuth('NGO')) { /* redirect */ }

const user = Auth.getUser();
let requests = JSON.parse(localStorage.getItem('ngo_requests') || '[]');
let notifLog = JSON.parse(localStorage.getItem('ngo_notifs') || '[]');
let ngoProfile = JSON.parse(localStorage.getItem('ngo_profile') || 'null');
let rejectTargetId = null;

// Seed some demo requests
function seedRequests() {
  if (requests.length === 0) {
    requests = [
      { id:1, receiptCode:'FC-001234', donorName:'Sunrise Mess', donorRole:'MESS', foodDesc:'Rice + Dal + Paneer', quantityKg:18, date:'2025-03-13', status:'PENDING', note:'Available after 3 PM' },
      { id:2, receiptCode:'FC-001235', donorName:'Rahul Sharma', donorRole:'INDIVIDUAL', foodDesc:'Home cooked food', quantityKg:3.5, date:'2025-03-13', status:'PENDING', note:'Near Arera Colony, Bhopal' },
      { id:3, receiptCode:'FC-001233', donorName:'Royal Events', donorRole:'PARTY', foodDesc:'Biryani, Sweets', quantityKg:35, date:'2025-03-12', status:'ACCEPTED', note:'Collected' },
    ];
    localStorage.setItem('ngo_requests', JSON.stringify(requests));
  }
}

window.addEventListener('DOMContentLoaded', () => {
  seedRequests();
  const name = ngoProfile?.name || user?.name || 'NGO Partner';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('navUserName').textContent = name;
  updateStats();
  renderOverviewPending();
  renderRequests('ALL');
  renderNotifLog();
  loadProfile();
});

function showSection(name, el) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  document.getElementById('sec-' + name).style.display = 'block';
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');
}

function updateStats() {
  const pending = requests.filter(r => r.status === 'PENDING');
  const accepted = requests.filter(r => r.status === 'ACCEPTED');
  const totalKg = accepted.reduce((s, r) => s + r.quantityKg, 0);
  document.getElementById('statPending').textContent = pending.length;
  document.getElementById('statAccepted').textContent = accepted.length;
  document.getElementById('statTotalKg').textContent = totalKg.toFixed(1) + ' kg';
  document.getElementById('statRating').textContent = ngoProfile?.rating || '4.8 ⭐';
  document.getElementById('pendingCount').textContent = pending.length;
}

function renderOverviewPending() {
  const el = document.getElementById('overviewPending');
  if (!el) return;
  const pending = requests.filter(r => r.status === 'PENDING').slice(0, 3);
  if (pending.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">✅</div><h4>All caught up!</h4><p>No pending requests right now</p></div>';
    return;
  }
  el.innerHTML = pending.map(r => requestCard(r, true)).join('');
}

function renderRequests(filter = 'ALL') {
  const el = document.getElementById('requestsList');
  if (!el) return;
  const filtered = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);
  if (filtered.length === 0) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><h4>No requests</h4><p>No ' + filter.toLowerCase() + ' requests found</p></div>';
    return;
  }
  el.innerHTML = filtered.slice().reverse().map(r => requestCard(r, false)).join('');
}

function filterRequests(status) { renderRequests(status); }

const ROLE_ICONS = { MESS: '🍛', PARTY: '🎉', INDIVIDUAL: '🙋' };
function requestCard(r, compact) {
  const badge = r.status === 'ACCEPTED' ? 'badge-success' : r.status === 'REJECTED' ? 'badge-danger' : 'badge-pending';
  return `
  <div style="background:white;border-radius:var(--radius);border:1px solid var(--border);padding:20px;margin-bottom:12px;box-shadow:var(--shadow)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
          <span style="font-size:1.2rem">${ROLE_ICONS[r.donorRole]||'👤'}</span>
          <strong style="font-size:0.95rem">${r.donorName}</strong>
          <span class="badge badge-primary" style="font-size:0.72rem">${r.donorRole}</span>
        </div>
        <div style="font-size:0.82rem;color:var(--text-light)">📋 ${r.receiptCode} &nbsp;|&nbsp; 📅 ${r.date}</div>
      </div>
      <span class="badge ${badge}">${r.status}</span>
    </div>
    <div style="display:flex;gap:20px;font-size:0.875rem;color:var(--text-mid);margin-bottom:${r.status==='PENDING'?'14px':'0'}">
      <span>🍽️ ${r.foodDesc}</span>
      <span>⚖️ ${r.quantityKg} kg</span>
      ${r.note ? `<span>📝 ${r.note}</span>` : ''}
    </div>
    ${r.status === 'PENDING' ? `
    <div style="display:flex;gap:10px">
      <button class="btn btn-success btn-sm" onclick="acceptRequest(${r.id})">✅ Accept & Collect</button>
      <button class="btn btn-danger btn-sm" onclick="openReject(${r.id})">❌ Reject</button>
    </div>` : ''}
  </div>`;
}

async function acceptRequest(id) {
  const req = requests.find(r => r.id === id);
  if (!req) return;
  try { await API.donation.updateStatus(id, 'ACCEPTED', ''); } catch {}
  req.status = 'ACCEPTED';
  localStorage.setItem('ngo_requests', JSON.stringify(requests));
  // Add to donor's donation list and update status
  updateDonorStatus(req.receiptCode, 'ACCEPTED');
  addNotifLog(`✅ Accepted donation from ${req.donorName} (${req.foodDesc}, ${req.quantityKg}kg)`, 'accepted');
  showToast('Donation accepted! Donor has been notified. 📧', 'success');
  updateStats(); renderOverviewPending(); renderRequests('ALL');
}

function openReject(id) {
  rejectTargetId = id;
  document.getElementById('rejectModal').classList.add('active');
  document.getElementById('rejectReason').value = '';
}

async function confirmReject() {
  if (!rejectTargetId) return;
  const reason = document.getElementById('rejectReason').value || 'Capacity issue';
  const req = requests.find(r => r.id === rejectTargetId);
  if (!req) return;
  try { await API.donation.updateStatus(rejectTargetId, 'REJECTED', reason); } catch {}
  req.status = 'REJECTED'; req.rejectReason = reason;
  localStorage.setItem('ngo_requests', JSON.stringify(requests));
  updateDonorStatus(req.receiptCode, 'REJECTED');
  addNotifLog(`❌ Rejected donation from ${req.donorName} — Reason: ${reason}`, 'rejected');
  closeModal();
  showToast('Request rejected. Donor has been notified. 📧', 'info');
  updateStats(); renderOverviewPending(); renderRequests('ALL');
  rejectTargetId = null;
}

function closeModal() { document.getElementById('rejectModal').classList.remove('active'); }

function updateDonorStatus(receiptCode, status) {
  // Update in all donor storages
  ['mess_donations', 'party_donations', 'ind_donations'].forEach(key => {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const item = list.find(d => d.receiptCode === receiptCode);
    if (item) { item.status = status; localStorage.setItem(key, JSON.stringify(list)); }
  });
}

function addNotifLog(message, type) {
  notifLog.unshift({ id: Date.now(), message, type, sentAt: new Date().toLocaleString('en-IN') });
  localStorage.setItem('ngo_notifs', JSON.stringify(notifLog));
  renderNotifLog();
}

function renderNotifLog() {
  const el = document.getElementById('notifLogList');
  if (!el) return;
  if (notifLog.length === 0) { el.innerHTML = '<div class="empty-state"><div class="empty-icon">🔔</div><h4>No notifications yet</h4></div>'; return; }
  el.innerHTML = notifLog.map(n => `
    <div style="background:white;border-radius:var(--radius-sm);padding:14px 16px;border:1px solid var(--border);border-left:4px solid ${n.type==='accepted'?'var(--success)':'var(--danger)'}">
      <p style="font-size:0.875rem;color:var(--text-dark)">${n.message}</p>
      <span style="font-size:0.75rem;color:var(--text-light)">${n.sentAt}</span>
    </div>`).join('');
}

// ---- PROFILE ----
function loadProfile() {
  if (!ngoProfile) {
    ngoProfile = { name: user?.name || 'My NGO', location: 'Bhopal, MP', accepts: 'All cooked food', email: user?.email || '', phone: '', rating: 4.8 };
  }
  document.getElementById('profileName').textContent = ngoProfile.name;
  document.getElementById('profileLocation').textContent = ngoProfile.location;
  document.getElementById('profileAccepts').textContent = ngoProfile.accepts;
  document.getElementById('profileEmail').textContent = ngoProfile.email;
  document.getElementById('profileRating').textContent = '★'.repeat(Math.round(ngoProfile.rating || 5)) + ` (${ngoProfile.rating})`;
  
  document.getElementById('editNgoName').value = ngoProfile.name;
  document.getElementById('editLocation').value = ngoProfile.location;
  document.getElementById('editAccepts').value = ngoProfile.accepts;
  document.getElementById('editEmail').value = ngoProfile.email;
  document.getElementById('editPhone').value = ngoProfile.phone || '';
}

document.getElementById('profileForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  ngoProfile = {
    ...ngoProfile,
    name: document.getElementById('editNgoName').value,
    location: document.getElementById('editLocation').value,
    accepts: document.getElementById('editAccepts').value,
    email: document.getElementById('editEmail').value,
    phone: document.getElementById('editPhone').value,
  };
  try { await API.ngo.updateProfile(user?.id, ngoProfile); } catch {}
  localStorage.setItem('ngo_profile', JSON.stringify(ngoProfile));
  loadProfile();
  showToast('Profile updated! ✅', 'success');
});
