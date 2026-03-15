// ===== MESS.JS — Mess Owner Dashboard Logic =====

// Guard page access
if (!requireAuth('MESS')) { /* redirect handled */ }

const user = Auth.getUser();
let wasteLogs = JSON.parse(localStorage.getItem('mess_waste') || '[]');
let menuLogs = JSON.parse(localStorage.getItem('mess_menus') || '[]');
let donations = JSON.parse(localStorage.getItem('mess_donations') || '[]');
let ngos = JSON.parse(localStorage.getItem('ngos') || '[]');

// ---- SEED DEMO DATA IF EMPTY ----
function seedDemoData() {
  if (wasteLogs.length === 0) {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    days.forEach((d, i) => {
      const dt = new Date(today); dt.setDate(today.getDate() - (6 - i));
      wasteLogs.push({
        id: i + 1, date: dt.toISOString().split('T')[0],
        mealType: ['BREAKFAST','LUNCH','DINNER'][i % 3],
        foodItem: ['Rice', 'Dal', 'Roti', 'Paneer', 'Khichdi', 'Poha', 'Rajma'][i],
        cookedKg: [30, 45, 40, 35, 50, 28, 42][i],
        wastedKg: [5, 12, 7, 3, 18, 4, 9][i],
        notes: ''
      });
    });
    localStorage.setItem('mess_waste', JSON.stringify(wasteLogs));
  }
  if (menuLogs.length === 0) {
    menuLogs.push({ id: 1, date: new Date().toISOString().split('T')[0], mealType: 'LUNCH', menuItems: [{ itemName: 'Rice', qtyKg: 20 }, { itemName: 'Dal', qtyKg: 10 }, { itemName: 'Paneer', qtyKg: 8 }, { itemName: 'Roti', qtyKg: 10 }], servings: 120 });
    localStorage.setItem('mess_menus', JSON.stringify(menuLogs));
  }
  if (ngos.length === 0) {
    ngos = [
      { id: 1, name: 'Hope Foundation', location: 'Bhopal, MP', accepts: 'Cooked meals, packaged food', rating: 4.8, contactEmail: 'hope@ngo.org', emoji: '🌟' },
      { id: 2, name: 'Roti Bank India', location: 'Indore, MP', accepts: 'Rotis, Rice, Dal', rating: 4.6, contactEmail: 'roti@bank.org', emoji: '💛' },
      { id: 3, name: 'Annapurna Trust', location: 'Bhopal, MP', accepts: 'All cooked food', rating: 4.9, contactEmail: 'ann@trust.org', emoji: '🏆' },
      { id: 4, name: 'Feed India Society', location: 'Jabalpur, MP', accepts: 'Dry rations, cooked', rating: 4.3, contactEmail: 'feed@india.org', emoji: '🤝' },
    ];
    localStorage.setItem('ngos', JSON.stringify(ngos));
  }
}

// ---- HELPERS ----
function fmtDate(isoStr) {
  if (!isoStr) return '—';
  const [y, m, d] = isoStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${parseInt(d)} ${months[parseInt(m)-1]} ${y}`;
}

const mealOrder = { BREAKFAST: 1, LUNCH: 2, SNACKS: 3, DINNER: 4 };
const mealEmoji = { BREAKFAST: '🌅', LUNCH: '☀️', SNACKS: '🫖', DINNER: '🌙' };

// ---- FOOD CHIP SELECTOR ----
const foodOptions = {
  BREAKFAST: ['Poha','Upma','Idli','Dosa','Bread','Omelette','Paratha','Alu Puri','Sabudana Khichdi','Sheera','Chai','Milk','Juice','Banana','Sprouts'],
  LUNCH:     ['Rice','Dal','Roti','Chapati','Rajma','Chhole','Paneer Sabzi','Aloo Sabzi','Mixed Veg','Palak','Kadhi','Jeera Rice','Pulao','Salad','Papad','Raita','Pickle','Sweet/Kheer'],
  DINNER:    ['Rice','Dal','Roti','Chapati','Dal Makhani','Paneer','Aloo Sabzi','Mix Veg','Rajma','Palak','Kadhi','Dal Tadka','Salad','Papad','Raita','Pickle','Kheer','Halwa'],
  SNACKS:    ['Chai','Coffee','Biscuits','Samosa','Bread Pakoda','Poha','Chivda','Namkeen','Fruit','Lassi','Juice','Peanuts','Roasted Chana']
};

let selectedChips = new Set();

function updateFoodChips(meal) {
  selectedChips.clear();
  const box = document.getElementById('chipSelector');
  const selBox = document.getElementById('selectedItemsBox');
  if (!box) return;
  if (!meal || !foodOptions[meal]) {
    box.innerHTML = '<span style="color:var(--text-light);font-size:0.82rem;padding:6px 0">Select a meal type first...</span>';
    if (selBox) selBox.style.display = 'none';
    return;
  }
  box.innerHTML = foodOptions[meal].map(item => `
    <span class="food-chip" onclick="toggleChip(this, '${item}')" style="
      display:inline-flex;align-items:center;padding:6px 14px;
      background:white;border:1.5px solid var(--border);border-radius:50px;
      font-size:0.8rem;font-weight:500;cursor:pointer;color:var(--text-mid);
      transition:all 0.15s;user-select:none;
    ">${item}</span>
  `).join('');
  if (selBox) selBox.style.display = 'none';
  updateSelectedDisplay();
}

function toggleChip(el, item) {
  if (selectedChips.has(item)) {
    selectedChips.delete(item);
    el.style.background = 'white';
    el.style.borderColor = 'var(--border)';
    el.style.color = 'var(--text-mid)';
    el.style.fontWeight = '500';
  } else {
    selectedChips.add(item);
    el.style.background = 'linear-gradient(135deg,#1a6ee8,#60aeff)';
    el.style.borderColor = '#1a6ee8';
    el.style.color = 'white';
    el.style.fontWeight = '600';
  }
  updateSelectedDisplay();
}

function addCustomItem() {
  const input = document.getElementById('customItemInput');
  const val = input?.value.trim();
  if (!val) { showToast('Type an item name first', 'warning'); return; }
  selectedChips.add(val);
  input.value = '';
  updateSelectedDisplay();
  showToast(`"${val}" added!`, 'success');
}

function updateSelectedDisplay() {
  const listEl = document.getElementById('selectedItemsList');
  const box = document.getElementById('selectedItemsBox');
  if (!listEl || !box) return;
  if (selectedChips.size === 0) { box.style.display = 'none'; return; }
  box.style.display = 'block';
  listEl.innerHTML = [...selectedChips].map(item => `
    <div style="display:flex;align-items:center;gap:8px;background:#f8fafc;padding:6px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:4px;flex:1;min-width:200px">
      <span style="flex:1;font-size:0.85rem;font-weight:600;color:var(--text-dark)">${item}</span>
      <input type="number" class="item-qty-input" data-item="${item}" placeholder="Kg" min="0.1" step="0.1" style="width:70px;padding:4px 8px;border:1px solid var(--border);border-radius:4px;font-size:0.8rem" required>
      <span onclick="removeSelectedChip('${item}')" style="cursor:pointer;font-size:1.1rem;color:#ef4444;font-weight:700;margin-left:4px">×</span>
    </div>
  `).join('');
}

function removeSelectedChip(item) {
  selectedChips.delete(item);
  // Deselect chip in the grid too if it exists
  document.querySelectorAll('.food-chip').forEach(el => {
    if (el.textContent.trim() === item) {
      el.style.background = 'white';
      el.style.borderColor = 'var(--border)';
      el.style.color = 'var(--text-mid)';
      el.style.fontWeight = '500';
    }
  });
  updateSelectedDisplay();
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  seedDemoData();
  updateUI();
  setDefaultDates();
  loadNGOs();
  computeAnalytics();
  renderDailyReport(new Date().toISOString().split('T')[0]);
  renderHistory();
  loadNotifications();
});

function updateUI() {
  const name = user?.name || 'Mess Owner';
  document.getElementById('sidebarName').textContent = name;
  document.getElementById('navUserName').textContent = name;
  document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'short', day:'numeric' });
  document.getElementById('statMenus').textContent = menuLogs.length;
  const weekWaste = wasteLogs.slice(-7).reduce((s, r) => s + r.wastedKg, 0);
  document.getElementById('statWaste').textContent = weekWaste.toFixed(1) + ' kg';
  document.getElementById('statDonations').textContent = donations.length;
  document.getElementById('statNGOs').textContent = ngos.length;

  // Overview chart — sort by date before slicing
  const sorted7 = [...wasteLogs].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  initOverviewChart(
    sorted7.map(r => fmtDate(r.date).slice(0,6)),
    sorted7.map(r => r.wastedKg)
  );
  wasteTableRender();
  menuTableRender();
}

function setDefaultDates() {
  const today = new Date().toISOString().split('T')[0];
  ['menuDate', 'wasteDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = today;
  });
}

// ---- SECTION NAV ----
function showSection(name, el) {
  document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
  const sec = document.getElementById('sec-' + name);
  if (sec) sec.style.display = 'block';
  document.querySelectorAll('.sidebar-nav a').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');

  if (name === 'analytics') computeAnalytics();
  if (name === 'ngo') loadNGOs();
  if (name === 'history') renderHistory();
}

// ---- MENU FORM ----
document.getElementById('menuForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('menuSubmitBtn');

  const mealType = document.getElementById('mealType').value;
  if (!mealType) { showToast('Please select a meal type', 'warning'); return; }
  if (selectedChips.size === 0) { showToast('Please select at least one food item', 'warning'); return; }

  const menuItems = [];
  document.querySelectorAll('.item-qty-input').forEach(input => {
    menuItems.push({
      itemName: input.dataset.item,
      qtyKg: parseFloat(input.value) || 0
    });
  });

  const entry = {
    id: Date.now(),
    date: document.getElementById('menuDate').value,
    mealType,
    menuItems,
    servings: parseInt(document.getElementById('menuServings').value)
  };
  btn.innerHTML = '<span class="spinner"></span>';
  btn.disabled = true;

  try { await API.mess.addMenu({ ...entry, userId: user?.id }); } catch {}

  menuLogs.push(entry);
  localStorage.setItem('mess_menus', JSON.stringify(menuLogs));
  document.getElementById('menuForm').reset();
  selectedChips.clear();
  updateFoodChips('');
  setDefaultDates();
  menuTableRender();
  updateUI();
  showToast('Menu entry saved! ✅', 'success');
  btn.innerHTML = '✅ Save Menu Entry';
  btn.disabled = false;
});

function menuTableRender() {
  const tbody = document.getElementById('menuTableBody');
  if (!tbody) return;
  if (menuLogs.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-light)">No menus logged yet</td></tr>'; return; }
  const sorted = [...menuLogs].sort((a, b) => b.date.localeCompare(a.date) || (mealOrder[a.mealType]||9) - (mealOrder[b.mealType]||9));
  tbody.innerHTML = sorted.map(r => {
    const itemBadges = (r.menuItems || []).map(i => 
      `<span style="display:inline-block;background:#e8f0fe;color:#1a6ee8;padding:2px 8px;border-radius:50px;font-size:0.72rem;font-weight:600;margin:2px">${i.itemName} (${i.qtyKg}kg)</span>`
    ).join('');
    const totalQty = (r.menuItems || []).reduce((sum, item) => sum + item.qtyKg, 0);
    return `<tr>
      <td>${fmtDate(r.date)}</td>
      <td><span class="badge badge-primary">${mealEmoji[r.mealType]||''} ${r.mealType}</span></td>
      <td style="max-width:260px">${itemBadges}</td>
      <td>${r.servings}</td>
      <td>${totalQty.toFixed(1)} kg</td>
    </tr>`;
  }).join('');
}

// ---- WASTE FORM ----
document.getElementById('wasteCooked')?.addEventListener('input', updateWastePercent);
document.getElementById('wasteWasted')?.addEventListener('input', updateWastePercent);
function updateWastePercent() {
  const cooked = parseFloat(document.getElementById('wasteCooked').value) || 0;
  const wasted = parseFloat(document.getElementById('wasteWasted').value) || 0;
  const pct = cooked > 0 ? ((wasted / cooked) * 100).toFixed(1) : 0;
  const box = document.getElementById('wastePercent');
  const val = document.getElementById('wastePercentVal');
  if (cooked > 0) { box.style.display = 'block'; val.textContent = pct + '% (' + (pct > 20 ? '⚠️ High' : pct > 10 ? '⚠️ Moderate' : '✅ Good') + ')'; }
}

document.getElementById('wasteForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('wasteSubmitBtn');
  const cooked = parseFloat(document.getElementById('wasteCooked').value);
  const wasted = parseFloat(document.getElementById('wasteWasted').value);
  if (wasted > cooked) { showToast('Wasted cannot exceed cooked quantity', 'warning'); return; }

  const entry = {
    id: Date.now(),
    date: document.getElementById('wasteDate').value,
    mealType: document.getElementById('wasteMealType').value,
    foodItem: document.getElementById('wasteItem').value,
    cookedKg: cooked, wastedKg: wasted,
    notes: document.getElementById('wasteNotes').value,
    hasLeftover: wasted > 0
  };
  btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
  try { await API.mess.logWaste({ ...entry, userId: user?.id }); } catch {}

  wasteLogs.push(entry);
  localStorage.setItem('mess_waste', JSON.stringify(wasteLogs));
  document.getElementById('wasteForm').reset();
  setDefaultDates();
  document.getElementById('wastePercent').style.display = 'none';
  wasteTableRender();
  updateUI();
  showToast('Waste log saved! 📝', 'success');
  btn.innerHTML = '📝 Save Waste Log'; btn.disabled = false;
});

function wasteTableRender() {
  const tbody = document.getElementById('wasteTableBody');
  if (!tbody) return;
  if (wasteLogs.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-light)">No waste records yet</td></tr>'; return; }
  const sorted = [...wasteLogs].sort((a, b) => b.date.localeCompare(a.date) || (mealOrder[a.mealType]||9) - (mealOrder[b.mealType]||9));
  tbody.innerHTML = sorted.map(r => {
    const pct = r.cookedKg > 0 ? ((r.wastedKg / r.cookedKg) * 100).toFixed(1) : 0;
    const badge = pct > 20 ? 'badge-danger' : pct > 10 ? 'badge-warning' : 'badge-success';
    return `<tr>
      <td>${fmtDate(r.date)}</td>
      <td><span class="badge badge-primary">${mealEmoji[r.mealType]||''} ${r.mealType || '—'}</span></td>
      <td>${r.foodItem}</td>
      <td>${r.cookedKg} kg</td>
      <td>${r.wastedKg} kg</td>
      <td><span class="badge ${badge}">${pct}%</span></td>
      <td>${r.wastedKg > 2 ? '<span class="badge badge-warning">Surplus</span>' : '<span class="badge badge-success">Minimal</span>'}</td>
    </tr>`;
  }).join('');
}

// ---- ANALYTICS ----
function computeAnalytics() {
  const last7 = wasteLogs.slice(-7);
  if (last7.length === 0) return;
  const totalW = last7.reduce((s, r) => s + r.wastedKg, 0);
  const avgW = totalW / last7.length;
  const best = last7.reduce((min, r) => r.wastedKg < min.wastedKg ? r : min, last7[0]);
  const worst = last7.reduce((max, r) => r.wastedKg > max.wastedKg ? r : max, last7[0]);

  const avgEl = document.getElementById('avgWaste');
  const totEl = document.getElementById('totalWaste');
  const bestEl = document.getElementById('bestDay');
  const worstEl = document.getElementById('worstDay');
  if (avgEl) avgEl.textContent = avgW.toFixed(1) + ' kg';
  if (totEl) totEl.textContent = totalW.toFixed(1) + ' kg';
  if (bestEl) bestEl.textContent = best.date.slice(5);
  if (worstEl) worstEl.textContent = worst.date.slice(5);

  initWeeklyWasteChart(
    last7.map(r => r.date.slice(5)),
    last7.map(r => r.cookedKg),
    last7.map(r => r.wastedKg)
  );

  // Meal type chart
  const mealMap = {};
  wasteLogs.forEach(r => { mealMap[r.mealType] = (mealMap[r.mealType] || 0) + r.wastedKg; });
  initMealTypeChart(Object.keys(mealMap), Object.values(mealMap));
}

// ---- LOAD NGOs ----
async function loadNGOs() {
  try { const res = await API.ngo.getAll(); ngos = res; localStorage.setItem('ngos', JSON.stringify(ngos)); } catch {}
  updateUI(); renderNGOGrid();
  const sel = document.getElementById('donNGO');
  if (sel) {
    sel.innerHTML = '<option value="">Select NGO</option>' + ngos.map(n => `<option value="${n.id}">${n.emoji || '🏥'} ${n.name} — ${n.location}</option>`).join('');
  }
}

function renderNGOGrid() {
  const grid = document.getElementById('ngoGrid');
  if (!grid) return;
  if (ngos.length === 0) { grid.innerHTML = '<div class="empty-state"><div class="empty-icon">🏥</div><p>No NGOs available</p></div>'; return; }
  grid.innerHTML = ngos.map(n => `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div class="ngo-avatar">${n.emoji || '🏥'}</div>
        <div>
          <div class="ngo-name">${n.name}</div>
          <div class="ngo-location">📍 ${n.location}</div>
        </div>
      </div>
      <div class="ngo-meta">
        <span class="badge badge-ngo">Verified ✓</span>
        <span class="star-rating">${'★'.repeat(Math.round(n.rating))} <span style="color:var(--text-light)">(${n.rating})</span></span>
      </div>
      <p class="ngo-accepts">🍽️ Accepts: ${n.accepts}</p>
      <button class="btn btn-primary btn-sm btn-block" onclick="prefillDonation(${n.id})">🤝 Donate to this NGO</button>
    </div>`).join('');
}

function prefillDonation(ngoId) {
  showSection('ngo', document.querySelector('[onclick*=ngo]'));
  const sel = document.getElementById('donNGO');
  if (sel) sel.value = ngoId;
}

// ---- DONATION FORM ----
document.getElementById('donationForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('donSubmitBtn');
  const ngoId = parseInt(document.getElementById('donNGO').value);
  const ngo = ngos.find(n => n.id === ngoId);
  const entry = {
    id: Date.now(),
    receiptCode: 'FC-' + Date.now().toString().slice(-6),
    ngoId, ngoName: ngo?.name || 'NGO',
    foodDesc: document.getElementById('donFoodDesc').value,
    quantityKg: parseFloat(document.getElementById('donQuantity').value),
    note: document.getElementById('donNote').value,
    status: 'PENDING',
    date: new Date().toISOString().split('T')[0],
  };
  btn.innerHTML = '<span class="spinner"></span>'; btn.disabled = true;
  try { await API.donation.submit({ ...entry, donorId: user?.id }); } catch {}
  donations.push(entry);
  localStorage.setItem('mess_donations', JSON.stringify(donations));
  document.getElementById('donationForm').reset();
  showToast(`Donation request sent to ${ngo?.name}! 🎉`, 'success');
  updateUI(); renderHistory();
  btn.innerHTML = '🤝 Send Donation Request'; btn.disabled = false;
});

// ---- HISTORY ----
function renderHistory() {
  const tbody = document.getElementById('historyTableBody');
  if (!tbody) return;
  if (donations.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">📋</div><h4>No donations yet</h4><p>Connect with an NGO to start donating</p></div></td></tr>`;
    return;
  }
  const sorted = [...donations].sort((a, b) => b.date.localeCompare(a.date));
  tbody.innerHTML = sorted.map(d => {
    const badge = d.status === 'ACCEPTED' ? 'badge-success' : d.status === 'REJECTED' ? 'badge-danger' : 'badge-pending';
    return `<tr>
      <td><code style="font-size:0.78rem;background:var(--bg);padding:3px 8px;border-radius:4px">${d.receiptCode}</code></td>
      <td>${d.ngoName}</td>
      <td>${d.foodDesc}</td>
      <td>${d.quantityKg} kg</td>
      <td>${fmtDate(d.date)}</td>
      <td><span class="badge ${badge}">${d.status}</span></td>
    </tr>`;
  }).join('');
}

// ---- DAILY REPORT ----
function renderDailyReport(date) {
  // Set the date picker value
  const picker = document.getElementById('reportDate');
  if (picker) picker.value = date;

  const grid = document.getElementById('dailyReportGrid');
  const summary = document.getElementById('dailyReportSummary');
  if (!grid || !summary) return;

  const meals = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];
  const mealLabels = { BREAKFAST: 'Breakfast', LUNCH: 'Lunch', SNACKS: 'Snacks', DINNER: 'Dinner' };
  const mealColors = { BREAKFAST: '#f59e0b', LUNCH: '#3b82f6', SNACKS: '#8b5cf6', DINNER: '#1a6ee8' };

  let totalCooked = 0, totalWasted = 0;
  let hasAnyData = false;

  grid.innerHTML = meals.map(meal => {
    const menuEntry = menuLogs.find(m => m.date === date && m.mealType === meal);
    const wasteEntry = wasteLogs.find(w => w.date === date && w.mealType === meal);

    if (!menuEntry && !wasteEntry) {
      return `<div style="background:var(--bg);border-radius:14px;padding:18px;border:2px dashed var(--border);text-align:center;color:var(--text-light)">
        <div style="font-size:1.8rem;margin-bottom:8px">${mealEmoji[meal]}</div>
        <div style="font-weight:700;font-size:0.9rem;color:var(--text-mid)">${mealLabels[meal]}</div>
        <div style="font-size:0.78rem;margin-top:8px">Not logged</div>
      </div>`;
    }

    hasAnyData = true;
    
    // Calculate total cooked/wasted for this meal
    let mealCooked = 0;
    let mealWasted = 0;
    
    // Build per-item rows
    let itemRows = '';
    const menuItems = menuEntry?.menuItems || [];
    const wasteForMeal = wasteLogs.filter(w => w.date === date && w.mealType === meal);
    
    // Get all unique items from both menu and waste logs
    const allItems = new Set([...menuItems.map(m => m.itemName), ...wasteForMeal.map(w => w.foodItem)]);
    
    allItems.forEach(itemName => {
      const mnItem = menuItems.find(m => m.itemName === itemName);
      const wsItem = wasteForMeal.find(w => w.foodItem === itemName);
      
      const cooked = mnItem ? mnItem.qtyKg : (wsItem ? wsItem.cookedKg : 0);
      const wasted = wsItem ? wsItem.wastedKg : 0;
      
      mealCooked += cooked;
      mealWasted += wasted;
      
      const pct = cooked > 0 ? ((wasted / cooked) * 100).toFixed(1) : 0;
      const pctColor = pct > 20 ? '#ef4444' : pct > 10 ? '#f59e0b' : '#10b981';
      
      itemRows += `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border);font-size:0.8rem">
          <div style="font-weight:600;color:var(--text-dark)">${itemName}</div>
          <div style="display:flex;gap:12px;text-align:right">
            <span style="color:#3b82f6;width:40px">${cooked}kg</span>
            <span style="color:${pctColor};width:40px">${wasted}kg</span>
          </div>
        </div>`;
    });
    
    totalCooked += mealCooked;
    totalWasted += mealWasted;
    const mealPct = mealCooked > 0 ? ((mealWasted / mealCooked) * 100).toFixed(1) : 0;
    const mealPctColor = mealPct > 20 ? '#ef4444' : mealPct > 10 ? '#f59e0b' : '#10b981';

    return `<div style="background:white;border-radius:14px;padding:18px;border:2px solid ${mealColors[meal]}22;box-shadow:0 2px 12px rgba(0,0,0,0.06)">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <span style="font-size:1.5rem">${mealEmoji[meal]}</span>
        <span style="font-weight:700;font-size:0.95rem;color:${mealColors[meal]}">${mealLabels[meal]}</span>
      </div>
      ${menuEntry ? `<div style="font-size:0.78rem;color:var(--text-mid);margin-bottom:12px">👥 Servings: <strong>${menuEntry.servings}</strong></div>` : ''}
      
      <!-- Detailed Item Breakdown -->
      <div style="background:var(--bg);border-radius:8px;padding:10px;margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;padding-bottom:6px;border-bottom:2px solid var(--border);font-size:0.7rem;font-weight:700;color:var(--text-light);text-transform:uppercase">
          <span>Item</span>
          <div style="display:flex;gap:12px">
            <span style="width:40px;text-align:right">Cook</span>
            <span style="width:40px;text-align:right">Waste</span>
          </div>
        </div>
        ${itemRows || '<div style="text-align:center;padding:10px;font-size:0.75rem;color:var(--text-light)">No items logged</div>'}
      </div>
      
      <!-- Meal Summary -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:8px;border-top:1px dashed var(--border)">
        <div style="font-size:0.75rem;color:var(--text-light)">Meal Total:</div>
        <div style="font-size:0.85rem;font-weight:700">
          <span style="color:#3b82f6">${mealCooked.toFixed(1)}kg</span> / 
          <span style="color:${mealPctColor}">${mealWasted.toFixed(1)}kg</span>
        </div>
      </div>
    </div>`;
  }).join('');

  if (hasAnyData) {
    const totalPct = totalCooked > 0 ? ((totalWasted / totalCooked) * 100).toFixed(1) : 0;
    const summaryColor = totalPct > 20 ? '#ef4444' : totalPct > 10 ? '#f59e0b' : '#10b981';
    summary.innerHTML = `
      <div style="background:var(--bg);border-radius:12px;padding:16px 20px;display:flex;flex-wrap:wrap;gap:20px;align-items:center;justify-content:space-between">
        <div style="font-weight:700;font-size:0.9rem;color:var(--text-dark)">📊 Day Summary — ${fmtDate(date)}</div>
        <div style="display:flex;gap:24px;flex-wrap:wrap">
          <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:#3b82f6">${totalCooked.toFixed(1)} kg</div><div style="font-size:0.72rem;color:var(--text-light)">Total Cooked</div></div>
          <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:${summaryColor}">${totalWasted.toFixed(1)} kg</div><div style="font-size:0.72rem;color:var(--text-light)">Total Wasted</div></div>
          <div style="text-align:center"><div style="font-size:1.1rem;font-weight:700;color:${summaryColor}">${totalPct}%</div><div style="font-size:0.72rem;color:var(--text-light)">Waste Rate</div></div>
        </div>
      </div>`;
  } else {
    summary.innerHTML = `<div style="text-align:center;padding:16px;color:var(--text-light);font-size:0.85rem">No data logged for <strong>${fmtDate(date)}</strong>. Go to <strong>Menu Entry</strong> or <strong>Waste Log</strong> to add today's data.</div>`;
  }
}

// ---- NOTIFICATIONS ----
async function loadNotifications() {
  try { const notifs = await API.notifications.getAll(user?.id); renderNotifications(notifs); } catch {}
}

function renderNotifications(notifs = []) {
  const list = document.getElementById('notifList');
  const countEl = document.getElementById('notifCount');
  if (!list) return;
  const unread = notifs.filter(n => !n.isRead);
  if (countEl) countEl.textContent = unread.length;
  if (notifs.length === 0) { list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-light);font-size:0.85rem">No notifications</div>'; return; }
  list.innerHTML = notifs.map(n => `
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);${!n.isRead ? 'background:var(--bg)' : ''}">
      <p style="font-size:0.82rem;color:var(--text-dark)">${n.message}</p>
      <span style="font-size:0.72rem;color:var(--text-light)">${n.sentAt || ''}</span>
    </div>`).join('');
}

function toggleNotifPanel() {
  const p = document.getElementById('notifPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}
