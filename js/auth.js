// ===== AUTH.JS — Login & Signup Logic =====

// ---- LOGIN ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    btn.innerHTML = '<span class="spinner"></span> Logging in...';
    btn.disabled = true;

    try {
      const res = await API.auth.login({ email, password });
      Auth.save(res.token, res.user);
      showToast('Login successful! Redirecting...', 'success');
      setTimeout(() => redirectToDashboard(res.user.role), 800);
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
      btn.innerHTML = 'Login to Dashboard';
      btn.disabled = false;
    }
  });
}

// ---- SIGNUP ----
let selectedRole = '';

function selectRole(el) {
  document.querySelectorAll('.role-option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
  selectedRole = el.getAttribute('data-role');
  document.getElementById('selectedRole').value = selectedRole;

  // Show/hide role-specific fields
  document.getElementById('messFields').style.display = selectedRole === 'MESS' ? 'block' : 'none';
  document.getElementById('ngoFields').style.display = selectedRole === 'NGO' ? 'block' : 'none';
  document.getElementById('partyFields').style.display = selectedRole === 'PARTY' ? 'block' : 'none';
}

// Pre-select role from URL param
window.addEventListener('DOMContentLoaded', () => {
  const preRole = new URLSearchParams(window.location.search).get('role')
    || sessionStorage.getItem('selectedRole');
  if (preRole) {
    const el = document.querySelector(`.role-option[data-role="${preRole}"]`);
    if (el) selectRole(el);
    sessionStorage.removeItem('selectedRole');
  }
});

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('signupBtn');

    if (!selectedRole) {
      showToast('Please select your role', 'warning');
      return;
    }

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!firstName || !email || !password) {
      showToast('Please fill all required fields', 'warning');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning');
      return;
    }

    const body = {
      name: `${firstName} ${lastName}`.trim(),
      email,
      password,
      role: selectedRole,
    };

    // Collect role-specific fields
    if (selectedRole === 'MESS') {
      body.messName = document.getElementById('messName')?.value;
      body.location = document.getElementById('messLocation')?.value;
    } else if (selectedRole === 'NGO') {
      body.ngoName = document.getElementById('ngoName')?.value;
      body.location = document.getElementById('ngoLocation')?.value;
      body.accepts = document.getElementById('ngoAccepts')?.value;
      body.contactPhone = document.getElementById('ngoContact')?.value;
    } else if (selectedRole === 'PARTY') {
      body.orgName = document.getElementById('orgName')?.value;
    }

    btn.innerHTML = '<span class="spinner"></span> Creating Account...';
    btn.disabled = true;

    try {
      const res = await API.auth.register(body);
      Auth.save(res.token, res.user);
      showToast('Account created! Welcome to FoodConnect 🎉', 'success');
      setTimeout(() => redirectToDashboard(res.user.role), 900);
    } catch (err) {
      showToast(err.message || 'Registration failed. Try again.', 'error');
      btn.innerHTML = 'Create Account →';
      btn.disabled = false;
    }
  });
}

// ---- TOGGLE PASSWORD VISIBILITY ----
function togglePassword() {
  const pwd = document.getElementById('password');
  const btn = document.getElementById('togglePwd');
  if (pwd) {
    pwd.type = pwd.type === 'password' ? 'text' : 'password';
    btn.textContent = pwd.type === 'password' ? '👁' : '🙈';
  }
}

// ---- DEMO FILL ----
function fillDemo(email, password) {
  const emailEl = document.getElementById('email');
  const passEl = document.getElementById('password');
  if (emailEl) emailEl.value = email;
  if (passEl) passEl.value = password;
  showToast(`Demo: ${email}`, 'info');
}
