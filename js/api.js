// ===== API.JS — Centralized API Utility =====
// All Spring Boot REST API calls go through here.
// BASE URL — change this when you deploy Spring Boot
const API_BASE = 'http://localhost:8080/api';

// ---- Token Helpers ----
const Auth = {
  getToken: () => localStorage.getItem('fc_token'),
  getUser: () => JSON.parse(localStorage.getItem('fc_user') || 'null'),
  save: (token, user) => {
    localStorage.setItem('fc_token', token);
    localStorage.setItem('fc_user', JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
    localStorage.removeItem('fc_role');
  },
  isLoggedIn: () => !!localStorage.getItem('fc_token'),
  getRole: () => {
    const user = JSON.parse(localStorage.getItem('fc_user') || 'null');
    return user ? user.role : null;
  }
};

// ---- Core Fetch Wrapper ----
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (res.status === 401) {
      Auth.clear();
      window.location.href = 'login.html';
      return;
    }
    const contentType = res.headers.get('content-type');
    const data = contentType && contentType.includes('application/json')
      ? await res.json()
      : await res.text();
    if (!res.ok) throw new Error(data.message || data || 'Something went wrong');
    return data;
  } catch (err) {
    throw err;
  }
}

// ---- API Methods ----
const API = {
  // Auth
  auth: {
    register: (body) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  },

  // Mess
  mess: {
    addMenu: (body) => apiFetch('/mess/menu', { method: 'POST', body: JSON.stringify(body) }),
    getMenus: (userId) => apiFetch(`/mess/menu/${userId}`),
    logWaste: (body) => apiFetch('/mess/waste', { method: 'POST', body: JSON.stringify(body) }),
    getWasteLogs: (userId) => apiFetch(`/mess/waste/${userId}`),
  },

  // Analytics
  analytics: {
    weeklyWaste: (userId) => apiFetch(`/analytics/weekly/${userId}`),
  },

  // NGO
  ngo: {
    getAll: () => apiFetch('/ngo/all'),
    getById: (id) => apiFetch(`/ngo/${id}`),
    updateProfile: (id, body) => apiFetch(`/ngo/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    getRequests: (ngoId) => apiFetch(`/ngo/${ngoId}/requests`),
  },

  // Donations
  donation: {
    submit: (body) => apiFetch('/donation/request', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, status, reason) => apiFetch(`/donation/${id}/status`, {
      method: 'PUT', body: JSON.stringify({ status, reason })
    }),
    getHistory: (userId) => apiFetch(`/donation/history/${userId}`),
  },

  // Party / Estimator
  party: {
    estimate: (body) => apiFetch('/party/estimate', { method: 'POST', body: JSON.stringify(body) }),
    getEstimates: (userId) => apiFetch(`/party/estimates/${userId}`),
  },

  // Notifications
  notifications: {
    getAll: (userId) => apiFetch(`/notifications/${userId}`),
    markRead: (id) => apiFetch(`/notifications/${id}/read`, { method: 'PUT' }),
  },
};

// ---- Role-based Redirect ----
function redirectToDashboard(role) {
  const routes = {
    MESS: 'mess-dashboard.html',
    PARTY: 'party-dashboard.html',
    INDIVIDUAL: 'individual-dashboard.html',
    NGO: 'ngo-dashboard.html',
  };
  window.location.href = routes[role] || 'index.html';
}

// ---- Guard Pages (call at top of each dashboard) ----
function requireAuth(expectedRole) {
  if (!Auth.isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  const role = Auth.getRole();
  if (expectedRole && role !== expectedRole) {
    redirectToDashboard(role);
    return false;
  }
  return true;
}

// ---- Logout ----
function logout() {
  Auth.clear();
  window.location.href = 'index.html';
}
