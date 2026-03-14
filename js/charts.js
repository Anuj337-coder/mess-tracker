// ===== CHARTS.JS — Chart.js wrapper =====

let overviewChart = null;
let weeklyChart = null;
let mealTypeChart = null;

function initOverviewChart(labels, wasteData) {
  const ctx = document.getElementById('overviewChart');
  if (!ctx) return;
  if (overviewChart) overviewChart.destroy();
  overviewChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Waste (kg)',
        data: wasteData,
        backgroundColor: wasteData.map(v => v > 15 ? 'rgba(239,68,68,0.7)' : v > 8 ? 'rgba(245,158,11,0.7)' : 'rgba(16,185,129,0.7)'),
        borderColor: wasteData.map(v => v > 15 ? '#ef4444' : v > 8 ? '#f59e0b' : '#10b981'),
        borderWidth: 2,
        borderRadius: 8,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` ${ctx.raw} kg wasted` } } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Poppins', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
      }
    }
  });
}

function initWeeklyWasteChart(labels, cookedData, wastedData) {
  const ctx = document.getElementById('weeklyWasteChart');
  if (!ctx) return;
  if (weeklyChart) weeklyChart.destroy();
  weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Cooked (kg)',
          data: cookedData,
          backgroundColor: 'rgba(26,110,232,0.15)',
          borderColor: '#1a6ee8',
          borderWidth: 2,
          borderRadius: 8,
        },
        {
          label: 'Wasted (kg)',
          data: wastedData,
          backgroundColor: 'rgba(239,68,68,0.65)',
          borderColor: '#ef4444',
          borderWidth: 2,
          borderRadius: 8,
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'Poppins', size: 12 }, usePointStyle: true } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} kg` } }
      },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Poppins', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
      }
    }
  });
}

function initMealTypeChart(labels, data) {
  const ctx = document.getElementById('mealTypeChart');
  if (!ctx) return;
  if (mealTypeChart) mealTypeChart.destroy();
  mealTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: ['#60aeff', '#1a6ee8', '#0fd4cf', '#8b5cf6'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      cutout: '65%',
      plugins: {
        legend: { position: 'bottom', labels: { font: { family: 'Poppins', size: 12 }, padding: 14, usePointStyle: true } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw} kg` } }
      }
    }
  });
}

// Party estimator — bar chart
let partyChart = null;
function initPartyChart(labels, data) {
  const ctx = document.getElementById('partyEstimateChart');
  if (!ctx) return;
  if (partyChart) partyChart.destroy();
  partyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Quantity (kg)',
        data,
        backgroundColor: ['rgba(26,110,232,0.7)', 'rgba(96,174,255,0.7)', 'rgba(15,212,207,0.7)', 'rgba(139,92,246,0.7)', 'rgba(16,185,129,0.7)', 'rgba(245,158,11,0.7)'],
        borderRadius: 10,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { family: 'Poppins', size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { family: 'Poppins', size: 11 } } }
      }
    }
  });
}
