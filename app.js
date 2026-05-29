// ATH-LINK v2 — Full App (Auth · Teams · Payment Flow)

/* ══════════════════════════════════════════════════════
   AUTH — localStorage-based
   ══════════════════════════════════════════════════════ */
let currentUser = null;

function initAuth() {
  try {
    const uid = localStorage.getItem('athlink_uid');
    if (uid) {
      const users = JSON.parse(localStorage.getItem('athlink_users') || '[]');
      currentUser = users.find(u => u.id === uid) || null;
    }
  } catch(e) { currentUser = null; }
}

function getAllUsers() {
  return JSON.parse(localStorage.getItem('athlink_users') || '[]');
}

function registerUser(name, email, phone, password, role='player', turfId=null) {
  const users = getAllUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase()))
    return { error: 'This email is already registered. Please log in.' };
  const user = { id: 'u_' + Date.now(), name, email, phone, password, role, turfId, joinedAt: Date.now() };
  users.push(user);
  localStorage.setItem('athlink_users', JSON.stringify(users));
  currentUser = user;
  localStorage.setItem('athlink_uid', user.id);
  return { user };
}

function loginUser(email, password) {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) return { error: 'Incorrect email or password.' };
  currentUser = user;
  localStorage.setItem('athlink_uid', user.id);
  return { user };
}

function logoutUser() {
  currentUser = null;
  localStorage.removeItem('athlink_uid');
  closeDropdown();
  navigate('home');
  showToast('👋 Logged out successfully.');
}

/* ══════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════ */
const state = {
  page: 'home',
  cityId: null, turfId: null, sport: null, date: null, slot: null,
  sportFilter: 'all',
  booking: null,
  paymentMethod: 'upi',
  payStep: 'input',      // 'input'|'processing'|'otp'|'otp_verify'|'bankportal'|'approved'
  payOtp: '',
  selectedBank: null,
  selectedUpiApp: null,
  showDropdown: false,
  showNotifPanel: false,
};

/* ══════════════════════════════════════════════════════
   ROUTER
   ══════════════════════════════════════════════════════ */
function navigate(page, params = {}) {
  Object.assign(state, { page }, params);
  if (page !== 'payment') state.payStep = 'input';
  closeDropdown();
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ══════════════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════════════ */
function render() {
  const app = document.getElementById('app');
  switch (state.page) {
    case 'home':           app.innerHTML = renderHome();          break;
    case 'city':           app.innerHTML = renderCity();          break;
    case 'turf':           app.innerHTML = renderTurf();          break;
    case 'booking':        app.innerHTML = renderBooking();       break;
    case 'payment':        app.innerHTML = renderPayment();       break;
    case 'confirm':        app.innerHTML = renderConfirm();       break;
    case 'teams':          app.innerHTML = renderTeams();         break;
    case 'profile':        app.innerHTML = renderProfile();       break;
    case 'host-dashboard': app.innerHTML = renderHostDashboard(); break;
  }
  renderNav();
  bindEvents();
}

/* ══════════════════════════════════════════════════════
   NAVBAR
   ══════════════════════════════════════════════════════ */
function renderNav() {
  const pendingCount = getPendingRequestCount();
  const isHost = currentUser?.role === 'host';
  const navEl = document.getElementById('nav-dynamic');
  if (!navEl) return;

  if (currentUser) {
    navEl.innerHTML = `
      ${isHost ? `<button class="btn-ghost" style="color:var(--orange);border-color:rgba(255,152,0,.4)" onclick="navigate('host-dashboard')">🏟️ Dashboard</button>` : ''}
      <div style="position:relative">
        <div class="nav-user" id="nav-user-btn" onclick="toggleDropdown()">
          <div class="nav-avatar">${currentUser.name[0].toUpperCase()}</div>
          <span class="nav-user-name">${currentUser.name.split(' ')[0]}</span>
          ${pendingCount > 0 ? `<span class="nav-notif-badge">${pendingCount}</span>` : ''}
        </div>
        <div class="profile-dropdown" id="profile-dropdown" style="display:none">
          <div class="dropdown-item">
            <span>${isHost ? '🏟️' : '👤'}</span>
            <div><div style="font-weight:700;color:var(--text)">${currentUser.name}</div>
            <div style="font-size:11px;color:var(--text3)">${currentUser.email}</div>
            <div style="margin-top:3px">${isHost ? '<span class="host-badge">🏟️ Turf Host</span>' : ''}</div></div>
          </div>
          <div class="dropdown-divider"></div>
          ${pendingCount > 0 ? `
          <div class="dropdown-item" onclick="navigate('teams');closeDropdown()">
            <span>🔔</span> ${pendingCount} Join Request${pendingCount>1?'s':''} Pending
          </div>` : ''}
          ${isHost ? `<div class="dropdown-item" onclick="navigate('host-dashboard');closeDropdown()"><span>🏟️</span> Host Dashboard</div>` : ''}
          <div class="dropdown-item" onclick="navigate('profile');closeDropdown()">
            <span>📋</span> My Profile
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item danger" onclick="logoutUser()">
            <span>🚪</span> Logout
          </div>
        </div>
      </div>`;
  } else {
    navEl.innerHTML = `
      <button class="btn-ghost" onclick="openLoginModal()">Login</button>
      <button class="btn-primary" onclick="openRegisterModal()">Sign Up</button>`;
  }
}

function toggleDropdown() {
  const dd = document.getElementById('profile-dropdown');
  if (dd) dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
}
function closeDropdown() {
  const dd = document.getElementById('profile-dropdown');
  if (dd) dd.style.display = 'none';
}

function getPendingRequestCount() {
  if (!currentUser) return 0;
  return getTeams().reduce((count, team) => {
    if (team.creatorId === currentUser.id)
      count += (team.joinRequests || []).filter(r => r.status === 'pending').length;
    return count;
  }, 0);
}

/* ══════════════════════════════════════════════════════
   AUTH MODALS
   ══════════════════════════════════════════════════════ */
function openLoginModal() {
  showModal(`
    <div class="modal-header">
      <div class="modal-title">👋 Welcome Back</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <p style="color:var(--text2);font-size:13px;margin-bottom:22px">Log in to book turfs and join teams.</p>
    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Email Address</label>
        <input class="form-input" id="li-email" type="email" placeholder="you@example.com" />
      </div>
      <div class="form-group full">
        <label class="form-label">Password</label>
        <input class="form-input" id="li-pass" type="password" placeholder="Your password" />
      </div>
    </div>
    <div id="auth-error" style="color:var(--red);font-size:13px;margin-top:12px;display:none"></div>
    <button class="btn-primary" style="width:100%;padding:13px;margin-top:20px;font-size:14px" onclick="submitLogin()">
      Login →
    </button>
    <div class="auth-toggle">Don't have an account? <a onclick="openRegisterModal()">Sign up free</a></div>
  `);
}

function submitLogin() {
  const email = document.getElementById('li-email')?.value.trim();
  const pass  = document.getElementById('li-pass')?.value;
  if (!email || !pass) return showAuthError('Please fill in all fields.');
  const result = loginUser(email, pass);
  if (result.error) return showAuthError(result.error);
  closeModal();
  showToast(`🎉 Welcome back, ${currentUser.name.split(' ')[0]}!`);
  render();
}

function openRegisterModal() {
  showModal(`
    <div class="modal-header">
      <div class="modal-title">🚀 Create Account</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <p style="color:var(--text2);font-size:13px;margin-bottom:18px">Join Ath-Link to book turfs and play with teams.</p>

    <div class="form-group" style="margin-bottom:16px">
      <label class="form-label">I am a…</label>
      <div class="role-options">
        <div class="role-option active" id="role-player" onclick="selectRegRole('player')">
          <span class="role-icon">🏃</span>Player
        </div>
        <div class="role-option" id="role-host" onclick="selectRegRole('host')">
          <span class="role-icon">🏟️</span>Turf Host
        </div>
      </div>
    </div>

    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Full Name *</label>
        <input class="form-input" id="reg-name" placeholder="Your full name" />
      </div>
      <div class="form-group full">
        <label class="form-label">Email Address *</label>
        <input class="form-input" id="reg-email" type="email" placeholder="you@example.com" />
      </div>
      <div class="form-group full">
        <label class="form-label">Phone Number *</label>
        <input class="form-input" id="reg-phone" type="tel" placeholder="+91 XXXXX XXXXX" />
      </div>
      <div class="form-group full">
        <label class="form-label">Password *</label>
        <input class="form-input" id="reg-pass" type="password" placeholder="Min 6 characters" />
      </div>
      <!-- Host-only fields -->
      <div class="form-group full" id="host-fields" style="display:none">
        <label class="form-label">Select Your Turf</label>
        <select class="form-input" id="reg-turf" style="background:var(--bg)">
          <option value="">-- Select the turf you manage --</option>
          ${TURFS.map(t=>`<option value="${t.id}">${t.name} — ${getCityById(t.cityId)?.name}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="auth-error" style="color:var(--red);font-size:13px;margin-top:12px;display:none"></div>
    <button class="btn-primary" style="width:100%;padding:13px;margin-top:20px;font-size:14px" onclick="submitRegister()">
      Create Account 🎉
    </button>
    <div class="auth-toggle">Already have an account? <a onclick="openLoginModal()">Log in</a></div>
  `);
}

function submitRegister() {
  const name   = document.getElementById('reg-name')?.value.trim();
  const email  = document.getElementById('reg-email')?.value.trim();
  const phone  = document.getElementById('reg-phone')?.value.trim();
  const pass   = document.getElementById('reg-pass')?.value;
  const roleEl = document.querySelector('.role-option.active');
  const role   = roleEl?.id === 'role-host' ? 'host' : 'player';
  const turfId = document.getElementById('reg-turf')?.value || null;
  if (!name || !email || !phone || !pass) return showAuthError('Please fill in all fields.');
  if (pass.length < 6) return showAuthError('Password must be at least 6 characters.');
  const result = registerUser(name, email, phone, pass, role, turfId);
  if (result.error) return showAuthError(result.error);
  closeModal();
  const welcome = role === 'host'
    ? `🏟️ Welcome, Host ${name.split(' ')[0]}! Your dashboard is ready.`
    : `🎉 Welcome to Ath-Link, ${name.split(' ')[0]}!`;
  showToast(welcome);
  if (role === 'host') navigate('host-dashboard');
  else render();
}

function showAuthError(msg) {
  const el = document.getElementById('auth-error');
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function selectRegRole(role) {
  document.getElementById('role-player')?.classList.toggle('active', role==='player');
  document.getElementById('role-host')?.classList.toggle('active', role==='host');
  const hf = document.getElementById('host-fields');
  if (hf) hf.style.display = role==='host' ? 'block' : 'none';
}

/* ══════════════════════════════════════════════════════
   HOME
   ══════════════════════════════════════════════════════ */
function renderHome() {
  const teams = getTeams().slice(0, 3);
  return `<div class="page">
    <section class="hero">
      <div class="hero-grid"></div>
      <div class="hero-orb hero-orb-1"></div>
      <div class="hero-orb hero-orb-2"></div>
      <div class="hero-orb hero-orb-3"></div>
      <div class="hero-content">
        <div class="hero-badge"><span class="live-dot"></span>India's #1 Turf Booking Platform</div>
        <h1>Book Your Game,<br><em>Own Your Play</em></h1>
        <p>Find premium sports turfs in your city, book a slot in seconds, pay via UPI or card, and find teammates to complete your squad.</p>
        <div class="hero-search">
          <input id="city-search" placeholder="Search a city…" oninput="filterCities()" />
          <button onclick="filterCities()">Search</button>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="num">17+</div><div class="lbl">Turfs Listed</div></div>
          <div class="hero-stat"><div class="num">9</div><div class="lbl">Cities</div></div>
          <div class="hero-stat"><div class="num">6</div><div class="lbl">Sports</div></div>
          <div class="hero-stat"><div class="num">–</div><div class="lbl">Bookings</div></div>
        </div>
      </div>
    </section>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Choose Your <span>City</span></h2>
      </div>
      <div class="cities-grid" id="cities-grid">${renderCityCards(CITIES)}</div>
    </div>

    <div class="section" style="padding-top:0">
      <div class="section-header">
        <h2 class="section-title">Open <span>Teams</span></h2>
        <span class="section-sub" onclick="navigate('teams')">View all →</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:16px">
        ${teams.map(t => renderTeamPageCard(t)).join('')}
      </div>
    </div>
  </div>`;
}

function renderCityCards(list) {
  return list.map(c => `
    <div class="city-card" onclick="navigate('city',{cityId:'${c.id}'})">
      <div class="city-card-bg" style="background:${c.gradient}">
        <span class="city-emoji">${getCityEmoji(c.id)}</span>
      </div>
      <div class="city-card-body">
        <div class="city-name">${c.name}</div>
        <div class="city-state">${c.state}</div>
        <span class="city-count">${c.turfCount} Turfs</span>
      </div>
    </div>`).join('');
}

function filterCities() {
  const q = (document.getElementById('city-search')?.value || '').toLowerCase();
  const grid = document.getElementById('cities-grid');
  if (grid) grid.innerHTML = renderCityCards(CITIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)));
}

/* ══════════════════════════════════════════════════════
   CITY PAGE
   ══════════════════════════════════════════════════════ */
function renderCity() {
  const city = getCityById(state.cityId);
  if (!city) return '<p>City not found</p>';
  let turfs = getTurfsByCity(state.cityId);
  if (state.sportFilter !== 'all') turfs = turfs.filter(t => t.sports.includes(state.sportFilter));
  const sportFilters = ['all', ...new Set(getTurfsByCity(state.cityId).flatMap(t => t.sports))];

  return `<div class="page">
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <a onclick="navigate('home')">Home</a><span>›</span><span>${city.name}</span>
        </div>
        <h2>${city.name} Turfs</h2>
        <p class="sub">${city.turfCount} turfs · ${city.tagline}</p>
        <div class="filter-bar">
          ${sportFilters.map(s => `
            <button class="filter-chip ${state.sportFilter===s?'active':''}" onclick="setSportFilter('${s}')">
              ${s==='all'?'🏆 All Sports':SPORTS_MAP[s]?.icon+' '+SPORTS_MAP[s]?.name}
            </button>`).join('')}
          <select class="filter-sort" onchange="sortTurfs(this.value)">
            <option value="rating">⭐ Best Rated</option>
            <option value="price_asc">💰 Price: Low→High</option>
            <option value="price_desc">💰 Price: High→Low</option>
          </select>
        </div>
      </div>
    </div>
    <div class="section" style="padding-top:28px">
      <div class="turfs-grid" id="turfs-grid">
        ${turfs.length ? turfs.map(t => renderTurfCard(t)).join('') : `
          <div class="empty" style="grid-column:1/-1">
            <div class="e-icon">🏟️</div><p>No turfs for this sport. Try another filter.</p>
          </div>`}
      </div>
    </div>
  </div>`;
}

function setSportFilter(s) { state.sportFilter = s; navigate('city', { cityId: state.cityId }); }

function sortTurfs(val) {
  let turfs = getTurfsByCity(state.cityId);
  if (state.sportFilter !== 'all') turfs = turfs.filter(t => t.sports.includes(state.sportFilter));
  if (val === 'rating') turfs.sort((a,b) => b.rating-a.rating);
  if (val === 'price_asc') turfs.sort((a,b) => Math.min(...Object.values(a.pricing))-Math.min(...Object.values(b.pricing)));
  if (val === 'price_desc') turfs.sort((a,b) => Math.min(...Object.values(b.pricing))-Math.min(...Object.values(a.pricing)));
  const grid = document.getElementById('turfs-grid');
  if (grid) { grid.innerHTML = turfs.map(t => renderTurfCard(t)).join(''); bindEvents(); }
}

function renderTurfCard(t) {
  const minPrice = Math.min(...Object.values(t.pricing));
  return `<div class="turf-card" onclick="openTurf('${t.id}')">
    <div class="turf-card-hero" style="background:${t.gradient}">
      <div class="turf-rating">⭐ ${t.rating}</div>
      <div class="turf-sports">
        ${t.sports.map(s => `<span class="sport-badge">${SPORTS_MAP[s]?.icon} ${SPORTS_MAP[s]?.name}</span>`).join('')}
      </div>
    </div>
    <div class="turf-card-body">
      <div class="turf-name">${t.name}</div>
      <div class="turf-addr">📍 ${t.address}</div>
      <div class="turf-amenities-preview">
        ${t.amenities.slice(0,4).map(a => `<span class="amenity-chip">${AMENITIES_MAP[a]?.icon} ${AMENITIES_MAP[a]?.name}</span>`).join('')}
        ${t.amenities.length>4?`<span class="amenity-chip">+${t.amenities.length-4}</span>`:''}
      </div>
      <div class="turf-footer">
        <div class="turf-price"><span class="amount">₹${minPrice}</span><span class="unit">/hr</span></div>
        <button class="btn-book" onclick="event.stopPropagation();openTurf('${t.id}')">View & Book</button>
      </div>
    </div>
  </div>`;
}

function openTurf(id) {
  const turf = getTurfById(id);
  state.sport = turf?.sports[0] || null;
  state.date = todayStr();
  state.slot = null;
  navigate('turf', { turfId: id });
}

/* ══════════════════════════════════════════════════════
   TURF DETAIL
   ══════════════════════════════════════════════════════ */
function renderTurf() {
  const turf = getTurfById(state.turfId);
  if (!turf) return '<p>Turf not found</p>';
  const city = getCityById(turf.cityId);
  if (!state.sport) state.sport = turf.sports[0];
  if (!state.date)  state.date  = todayStr();
  const slots = generateSlots(turf, state.date);
  const price = turf.pricing[state.sport] || 0;
  const fee   = Math.round(price * 0.05);
  const teams = getOpenTeamsByTurf(turf.id);
  const dates = Array.from({length:7},(_,i) => { const d=new Date(); d.setDate(d.getDate()+i); return d.toISOString().split('T')[0]; });

  return `<div class="page">
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <a onclick="navigate('home')">Home</a><span>›</span>
          <a onclick="navigate('city',{cityId:'${turf.cityId}'})">${city?.name}</a><span>›</span>
          <span>${turf.name}</span>
        </div>
      </div>
    </div>
    <div class="turf-detail">
      <div class="turf-detail-grid">

        <!-- LEFT COLUMN -->
        <div>
          <div class="turf-hero-banner" style="background:${turf.gradient}">
            <div class="turf-detail-rating">⭐ ${turf.rating} <span style="font-size:11px;opacity:.7">(${turf.reviewCount})</span></div>
            <div class="turf-hero-info">
              <div class="turf-detail-name">${turf.name}</div>
              <div class="turf-detail-addr">📍 ${turf.address}</div>
            </div>
          </div>

          <!-- About -->
          <div class="section-card">
            <div class="section-card-title">About this Turf</div>
            <p style="color:var(--text2);font-size:14px;line-height:1.8">${turf.description}</p>
            <div style="display:flex;gap:16px;margin-top:14px;flex-wrap:wrap">
              <span style="font-size:12px;color:var(--text3)">⏰ Open ${String(turf.openHour).padStart(2,'0')}:00 – ${String(turf.closeHour).padStart(2,'0')}:00</span>
              <span style="font-size:12px;color:var(--text3)">📞 Enquire at venue</span>
            </div>
          </div>

          <!-- Sport Selector -->
          <div class="section-card">
            <div class="section-card-title">Select Sport</div>
            <div class="sport-tabs">
              ${turf.sports.map(s => `
                <div class="sport-tab ${state.sport===s?'active':''}" onclick="selectSport('${s}')">
                  <span>${SPORTS_MAP[s]?.icon}</span>
                  ${SPORTS_MAP[s]?.name}
                  <span style="font-size:11px;opacity:.8">₹${turf.pricing[s]}/hr</span>
                </div>`).join('')}
            </div>
          </div>

          <!-- Amenities -->
          <div class="section-card">
            <div class="section-card-title">Amenities</div>
            <div class="amenities-grid">
              ${turf.amenities.map(a => `
                <div class="amenity-item">
                  <span class="a-icon">${AMENITIES_MAP[a]?.icon}</span>${AMENITIES_MAP[a]?.name}
                </div>`).join('')}
            </div>
          </div>

          <!-- Slot Picker -->
          <div class="section-card">
            <div class="section-card-title">Available Slots</div>
            <div class="date-tabs">
              ${dates.map(d => {
                const dt = new Date(d+'T00:00:00');
                const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dt.getDay()];
                return `<div class="date-tab ${state.date===d?'active':''}" onclick="selectDate('${d}')">
                  <div class="d-day">${d===todayStr()?'Today':day}</div>
                  <div class="d-date">${dt.getDate()}</div>
                </div>`;
              }).join('')}
            </div>
            <div class="slots-grid">
              ${slots.map(s => `
                <div class="slot-item ${s.available?(state.slot===s.time?'selected':'available'):'booked'}"
                  onclick="${s.available?`selectSlot('${s.time}')`:``}">
                  ${s.time}${s.isPeak&&s.available?`<span class="slot-peak">PEAK</span>`:''}
                </div>`).join('')}
            </div>
            <div class="slot-legend">
              <span><span class="dot" style="background:var(--green)"></span>Available</span>
              <span><span class="dot" style="background:var(--text3)"></span>Booked</span>
              <span><span class="dot" style="background:var(--blue)"></span>Selected</span>
            </div>
          </div>

          <!-- Teams Section -->
          <div class="section-card">
            <div class="section-card-title">Teams Looking for Players</div>
            ${teams.length ? `<div class="team-list">${teams.map(t => renderTeamCard(t)).join('')}</div>` :
              `<div class="empty" style="padding:24px"><div class="e-icon">👥</div><p>No open teams for this turf yet.</p></div>`}
            <button class="btn-create-team" onclick="openCreateTeamModal('${turf.id}')">
              ➕ Create a Team & Find Players
            </button>
          </div>
        </div>

        <!-- RIGHT COLUMN — BOOKING SIDEBAR -->
        <div class="booking-sidebar">
          <div class="booking-card">
            <h3>Book a Slot</h3>
            ${state.slot ? `
              <div class="price-row"><span class="label">Sport</span><span class="value">${SPORTS_MAP[state.sport]?.icon} ${SPORTS_MAP[state.sport]?.name}</span></div>
              <div class="price-row"><span class="label">Date</span><span class="value">${formatDate(state.date)}</span></div>
              <div class="price-row"><span class="label">Slot</span><span class="value">${state.slot} – ${addHour(state.slot)}</span></div>
              <div class="divider"></div>
              <div class="price-row"><span class="label">Turf Charges</span><span class="value">₹${price}</span></div>
              <div class="price-row"><span class="label">Booking Fee (5%)</span><span class="value">₹${fee}</span></div>
              <div class="price-row total">
                <span class="label">Total</span><span class="value">₹${price+fee}</span>
              </div>` : `
              <div style="text-align:center;padding:20px;color:var(--text3)">
                <div style="font-size:36px;margin-bottom:8px">📅</div>
                <p style="font-size:13px">Select a date and available slot to see pricing.</p>
              </div>`}
            <button class="btn-book-full" ${!state.slot?'disabled':''} onclick="proceedToBooking('${turf.id}')">
              ${state.slot?'🎯 Book Now':'Select a Slot First'}
            </button>
          </div>

          <div class="booking-card" style="background:linear-gradient(135deg,rgba(233,30,99,.07),rgba(33,150,243,.07));border-color:rgba(233,30,99,.2)">
            <div style="font-size:13px;color:var(--text2);line-height:1.7">
              <strong style="color:var(--text);font-size:14px">👥 Want to play with others?</strong><br><br>
              Create a team and invite players, or join an existing open team for this turf!
            </div>
            <button class="btn-create-team" style="margin-top:12px" onclick="navigate('teams')">
              Browse All Teams →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function renderTeamCard(t) {
  const pct = Math.min(100, Math.round((t.currentPlayers/t.totalPlayersNeeded)*100));
  const needed = t.totalPlayersNeeded - t.currentPlayers;
  const sport  = SPORTS_MAP[t.sport];
  const isMyTeam = currentUser && t.creatorId === currentUser.id;
  const pendingReqs = (t.joinRequests||[]).filter(r=>r.status==='pending').length;

  return `<div class="team-card">
    <div class="team-card-header">
      <div class="team-avatar">${t.avatar}</div>
      <div class="team-meta">
        <div class="team-name">${t.teamName}</div>
        <div class="team-info">${sport?.icon} ${sport?.name} · ${formatDate(t.slotDate)} · ${t.slotTime}</div>
      </div>
    </div>
    <p class="team-desc">${t.description}</p>
    <div class="team-progress">
      <div class="team-progress-label">
        <span>${t.currentPlayers}/${t.totalPlayersNeeded} players</span>
        <span style="color:${needed>0?'var(--orange)':'var(--green)'}">${needed>0?`${needed} needed`:'✓ Full'}</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div class="team-footer">
      <div class="team-members">
        ${t.members.slice(0,4).map(m=>`<div class="member-dot">${m[0].toUpperCase()}</div>`).join('')}
      </div>
      ${t.members.length>4?`<span class="members-more">+${t.members.length-4}</span>`:''}
      ${isMyTeam
        ? `<button class="btn-manage-requests" onclick="openManageRequests('${t.id}')">
             Manage Requests${pendingReqs>0?` (${pendingReqs})`:''}
           </button>`
        : needed>0
          ? `<button class="btn-join" onclick="joinTeam('${t.id}')">Join Team</button>`
          : `<span style="margin-left:auto;font-size:11px;color:var(--text3)">Team Full</span>`}
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════
   BOOKING PAGE
   ══════════════════════════════════════════════════════ */
function proceedToBooking(turfId) {
  if (!state.slot) return showToast('❌ Please select a slot first.');
  if (!currentUser) {
    showToast('🔐 Please log in to book a turf.');
    return openLoginModal();
  }
  const turf = getTurfById(turfId);
  const price = turf.pricing[state.sport];
  const fee   = Math.round(price * 0.05);
  state.booking = { turfId, turfName:turf.name, sport:state.sport, date:state.date, slot:state.slot, price, fee, total:price+fee };
  navigate('booking');
}

function renderBooking() {
  const b = state.booking;
  if (!b) return '<p>No booking in progress.</p>';
  return `<div class="page">
    <div class="booking-page">
      <div class="steps">
        <div class="step active"><div class="step-circle">1</div><div class="step-label">Your Details</div></div>
        <div class="step"><div class="step-circle">2</div><div class="step-label">Payment</div></div>
        <div class="step"><div class="step-circle">3</div><div class="step-label">Confirmation</div></div>
      </div>

      <div class="booking-summary-bar">
        <div class="s-item"><span>Turf</span><strong>${b.turfName}</strong></div>
        <div class="s-item"><span>Sport</span><strong>${SPORTS_MAP[b.sport]?.icon} ${SPORTS_MAP[b.sport]?.name}</strong></div>
        <div class="s-item"><span>Date</span><strong>${formatDate(b.date)}</strong></div>
        <div class="s-item"><span>Slot</span><strong>${b.slot} – ${addHour(b.slot)}</strong></div>
        <div class="s-item" style="margin-left:auto"><span>Total</span><strong style="color:var(--green);font-size:17px">₹${b.total}</strong></div>
      </div>

      <div class="section-card">
        <div class="section-card-title">Your Details</div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">Full Name *</label>
            <input class="form-input" id="b-name" value="${currentUser?.name||''}" placeholder="Your name" />
          </div>
          <div class="form-group">
            <label class="form-label">Phone Number *</label>
            <input class="form-input" id="b-phone" value="${currentUser?.phone||''}" placeholder="+91 XXXXX XXXXX" type="tel" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-input" id="b-email" value="${currentUser?.email||''}" placeholder="your@email.com" type="email" />
          </div>
          <div class="form-group">
            <label class="form-label">No. of Players</label>
            <input class="form-input" id="b-players" placeholder="e.g. 11" type="number" min="1" max="22" />
          </div>
          <div class="form-group full">
            <label class="form-label">Special Requests</label>
            <input class="form-input" id="b-notes" placeholder="Equipment rental, coaching, etc." />
          </div>
        </div>
      </div>

      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button class="btn-ghost" onclick="navigate('turf',{turfId:'${b.turfId}'})">← Back</button>
        <button class="btn-primary" style="padding:12px 30px" onclick="goToPayment()">Continue to Payment →</button>
      </div>
    </div>
  </div>`;
}

function goToPayment() {
  const name  = document.getElementById('b-name')?.value.trim();
  const phone = document.getElementById('b-phone')?.value.trim();
  if (!name||!phone) return showToast('❌ Name and phone are required.');
  state.booking.name  = name;
  state.booking.phone = phone;
  state.booking.email = document.getElementById('b-email')?.value.trim()||'';
  state.payStep = 'input';
  navigate('payment');
}

/* ══════════════════════════════════════════════════════
   PAYMENT — Full Prototype Flow
   ══════════════════════════════════════════════════════ */
function renderPayment() {
  const b = state.booking;
  const stepsHtml = `
    <div class="steps" style="max-width:500px;margin:0 auto 32px">
      <div class="step done"><div class="step-circle">✓</div><div class="step-label">Details</div></div>
      <div class="step active"><div class="step-circle">2</div><div class="step-label">Payment</div></div>
      <div class="step"><div class="step-circle">3</div><div class="step-label">Confirmation</div></div>
    </div>`;

  // Show full-screen step screens (processing/otp/bank/approved)
  if (state.payStep !== 'input') {
    return `<div class="page"><div class="payment-page">${stepsHtml}
      <div class="section-card">${renderPayStep()}</div>
    </div></div>`;
  }

  return `<div class="page"><div class="payment-page">
    ${stepsHtml}

    <div class="section-card" style="margin-bottom:20px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:1px">Amount to Pay</div>
          <div style="font-family:'Outfit',sans-serif;font-size:2.2rem;font-weight:900;color:var(--green)">₹${b.total}</div>
        </div>
        <div style="text-align:right;font-size:12px;color:var(--text2)">
          <div>${b.turfName}</div>
          <div>${formatDate(b.date)} · ${b.slot}</div>
          <div style="color:var(--text3)">${SPORTS_MAP[b.sport]?.icon} ${SPORTS_MAP[b.sport]?.name}</div>
        </div>
      </div>
    </div>

    <div class="payment-tabs">
      <div class="payment-tab ${state.paymentMethod==='upi'?'active':''}" onclick="setPayMethod('upi')">📱 UPI</div>
      <div class="payment-tab ${state.paymentMethod==='card'?'active':''}" onclick="setPayMethod('card')">💳 Card</div>
      <div class="payment-tab ${state.paymentMethod==='netbanking'?'active':''}" onclick="setPayMethod('netbanking')">🏦 Net Banking</div>
    </div>

    <div class="section-card">
      ${state.paymentMethod==='upi'       ? renderUPI()        : ''}
      ${state.paymentMethod==='card'      ? renderCard()       : ''}
      ${state.paymentMethod==='netbanking'? renderNetBanking() : ''}
    </div>
  </div></div>`;
}

/* ── UPI ── */
function renderUPI() {
  return `<div class="upi-section">
    <p style="color:var(--text2);font-size:13px;margin-bottom:18px">Scan with any UPI app to pay ₹${state.booking.total}</p>
    <div class="qr-box">${generateQRSvg()}</div>
    <div class="upi-apps">
      ${[['GPay','💚','linear-gradient(135deg,#4285F4,#34A853)'],
         ['PhonePe','💜','linear-gradient(135deg,#5f259f,#8a2be2)'],
         ['Paytm','💙','linear-gradient(135deg,#00BAF2,#0057A8)'],
         ['BHIM','🔶','linear-gradient(135deg,#FF6600,#ff9900)']
        ].map(([name,emoji,bg]) => `
        <div class="upi-app" onclick="startUPIFlow('${name}')">
          <div class="upi-app-icon" style="background:${bg}">${emoji}</div>
          <span class="upi-app-name">${name}</span>
        </div>`).join('')}
    </div>
    <div style="display:flex;align-items:center;gap:10px;margin:14px 0;max-width:380px;margin-left:auto;margin-right:auto">
      <div style="flex:1;height:1px;background:var(--border)"></div>
      <span style="font-size:11px;color:var(--text3)">or enter UPI ID</span>
      <div style="flex:1;height:1px;background:var(--border)"></div>
    </div>
    <div style="display:flex;gap:10px;max-width:380px;margin:0 auto">
      <input class="form-input" id="upi-id" placeholder="yourname@upi" style="flex:1" />
      <button class="btn-primary" onclick="startUPIFlow('UPI')">Verify & Pay</button>
    </div>
    <button class="pay-btn" onclick="startUPIFlow('UPI')">Pay ₹${state.booking.total} via UPI</button>
  </div>`;
}

function startUPIFlow(appName) {
  state.selectedUpiApp = appName;
  state.payStep = 'processing';
  render();
  setTimeout(() => { state.payStep = 'upi_waiting'; render(); }, 2500);
  setTimeout(() => { state.payStep = 'approved'; render(); }, 6000);
}

/* ── CARD ── */
function renderCard() {
  return `
    <div class="card-visual">
      <div class="card-chip">💳</div>
      <div class="card-num" id="cd-num">•••• •••• •••• ••••</div>
      <div class="card-bottom">
        <div class="card-field"><div class="label">Cardholder</div><div class="val" id="cd-name">YOUR NAME</div></div>
        <div class="card-field"><div class="label">Expires</div><div class="val" id="cd-exp">MM/YY</div></div>
      </div>
    </div>
    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Card Number</label>
        <input class="form-input" id="cn" placeholder="1234 5678 9012 3456" maxlength="19" oninput="fmtCard(this)" />
      </div>
      <div class="form-group full">
        <label class="form-label">Cardholder Name</label>
        <input class="form-input" id="cname" placeholder="Name on card"
          oninput="document.getElementById('cd-name').textContent=this.value||'YOUR NAME'" />
      </div>
      <div class="form-group">
        <label class="form-label">Expiry</label>
        <input class="form-input" id="cexp" placeholder="MM/YY" maxlength="5" oninput="fmtExp(this)" />
      </div>
      <div class="form-group">
        <label class="form-label">CVV</label>
        <input class="form-input" id="ccvv" placeholder="•••" type="password" maxlength="3" />
      </div>
    </div>
    <button class="pay-btn" onclick="startCardFlow()">Pay ₹${state.booking.total} Securely</button>`;
}

function startCardFlow() {
  const num = document.getElementById('cn')?.value.replace(/\s/g,'');
  const exp = document.getElementById('cexp')?.value;
  const cvv = document.getElementById('ccvv')?.value;
  const name= document.getElementById('cname')?.value;
  if (!num||num.length<16||!exp||!cvv||!name) return showToast('❌ Please fill in all card details.');
  state.payStep = 'processing';
  render();
  setTimeout(() => { state.payStep = 'otp'; render(); }, 2500);
}

/* ── NET BANKING ── */
function renderNetBanking() {
  const banks = [
    {name:'State Bank of India',icon:'🏦',code:'sbi'},
    {name:'HDFC Bank',icon:'🏛️',code:'hdfc'},
    {name:'ICICI Bank',icon:'🏧',code:'icici'},
    {name:'Axis Bank',icon:'🔵',code:'axis'},
    {name:'Kotak Bank',icon:'🟠',code:'kotak'},
    {name:'Punjab National Bank',icon:'🟡',code:'pnb'},
    {name:'Bank of Baroda',icon:'🔴',code:'bob'},
    {name:'Union Bank',icon:'🟤',code:'union'},
  ];
  return `
    <div class="section-card-title">Select Your Bank</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:8px;margin-bottom:20px">
      ${banks.map(b => `
        <div class="amenity-item" style="cursor:pointer" id="bank-${b.code}"
          onclick="selectBank('${b.code}','${b.name}')">
          <span style="font-size:20px">${b.icon}</span>
          <span style="font-size:12px">${b.name}</span>
        </div>`).join('')}
    </div>
    <div class="form-group" style="margin-bottom:18px">
      <label class="form-label">Other Banks</label>
      <select class="form-input" style="background:var(--bg3)" onchange="selectBank(this.value,this.options[this.selectedIndex].text)">
        <option value="">-- Select --</option>
        <option value="yes">Yes Bank</option>
        <option value="indusind">IndusInd Bank</option>
        <option value="federal">Federal Bank</option>
        <option value="canara">Canara Bank</option>
      </select>
    </div>
    <button class="pay-btn" onclick="startNetBankingFlow()">Pay ₹${state.booking.total} via Net Banking</button>`;
}

function selectBank(code, name) {
  document.querySelectorAll('[id^="bank-"]').forEach(el => {
    el.style.borderColor='var(--border)'; el.style.background='var(--glass)';
  });
  const el = document.getElementById('bank-'+code);
  if (el) { el.style.borderColor='var(--blue)'; el.style.background='var(--glass2)'; }
  state.selectedBank = name || code;
}

function startNetBankingFlow() {
  if (!state.selectedBank) return showToast('❌ Please select a bank first.');
  state.payStep = 'bankportal';
  render();
}

/* ── PAY STEP SCREENS ── */
function renderPayStep() {
  switch(state.payStep) {
    case 'processing':
      return `<div class="pay-step-screen">
        <div class="pay-spinner"></div>
        <div class="pay-step-title">Processing…</div>
        <p class="pay-step-sub">
          ${state.paymentMethod==='upi'?`Connecting to ${state.selectedUpiApp||'UPI'}…`:
            state.paymentMethod==='card'?'Securely connecting to your bank…':
            `Redirecting to ${state.selectedBank||'bank'} portal…`}
        </p>
        <div class="pay-progress-dots">
          <div class="pay-dot active"></div>
          <div class="pay-dot"></div>
          <div class="pay-dot"></div>
        </div>
      </div>`;

    case 'upi_waiting':
      return `<div class="pay-step-screen">
        <div class="pay-step-icon">📱</div>
        <div class="pay-step-title">Check Your Phone</div>
        <p class="pay-step-sub">
          A payment request of <strong style="color:var(--green)">₹${state.booking.total}</strong> has been sent to <strong>${state.selectedUpiApp||'your UPI app'}</strong>.<br><br>
          Open the app and approve the payment.
        </p>
        <div class="pay-progress-dots">
          <div class="pay-dot active"></div>
          <div class="pay-dot active"></div>
          <div class="pay-dot"></div>
        </div>
        <p style="font-size:11px;color:var(--text3);margin-top:16px">Auto-verifying… please wait</p>
      </div>`;

    case 'otp':
      return `<div class="pay-step-screen">
        <div class="pay-step-icon">🔐</div>
        <div class="pay-step-title">Verify with OTP</div>
        <p class="pay-step-sub">Enter the 6-digit OTP sent to your registered mobile number.</p>
        <div class="otp-inputs">
          ${[0,1,2,3,4,5].map(i => `
            <input class="otp-box" id="otp${i}" maxlength="1" type="tel"
              oninput="otpInput(this,${i})" onkeydown="otpBack(this,${i},event)" />`).join('')}
        </div>
        <button class="pay-btn" style="max-width:340px" onclick="verifyOTP()">Verify & Pay ₹${state.booking.total}</button>
        <p style="font-size:12px;color:var(--text3);margin-top:16px">
          Didn't receive? <span style="color:var(--blue-l);cursor:pointer" onclick="showToast('📲 OTP resent!')">Resend OTP</span>
        </p>
      </div>`;

    case 'otp_verify':
      return `<div class="pay-step-screen">
        <div class="pay-spinner"></div>
        <div class="pay-step-title">Verifying OTP…</div>
        <p class="pay-step-sub">Authenticating with your bank's 3D Secure system.</p>
        <div class="pay-progress-dots">
          <div class="pay-dot active"></div>
          <div class="pay-dot active"></div>
          <div class="pay-dot"></div>
        </div>
      </div>`;

    case 'bankportal':
      return `<div>
        <div class="bank-portal">
          <div class="bank-portal-header">
            <span style="font-size:20px">🏦</span>
            <span class="bank-logo-text">${state.selectedBank}</span>
            <span class="bank-secure">🔒 Secure Portal</span>
          </div>
          <div class="bank-portal-body">
            <p style="font-size:13px;color:var(--text3);margin-bottom:20px">
              Secure Net Banking Portal · SSL Encrypted
            </p>
            <div class="form-grid">
              <div class="form-group full">
                <label class="form-label">Customer ID / User ID</label>
                <input class="form-input" placeholder="Enter your Customer ID" />
              </div>
              <div class="form-group full">
                <label class="form-label">Password</label>
                <input class="form-input" type="password" placeholder="Login password" />
              </div>
            </div>
            <div style="background:rgba(0,230,118,.06);border:1px solid rgba(0,230,118,.2);border-radius:var(--r);padding:12px 14px;margin:16px 0;font-size:12px;color:var(--text2)">
              💳 Payment of <strong style="color:var(--green)">₹${state.booking.total}</strong> to Ath-Link Pvt. Ltd.
            </div>
            <button class="pay-btn" onclick="startBankConfirm()">Confirm Payment</button>
          </div>
        </div>
      </div>`;

    case 'bankconfirm':
      return `<div class="pay-step-screen">
        <div class="pay-spinner"></div>
        <div class="pay-step-title">Processing Payment…</div>
        <p class="pay-step-sub">Your bank is processing the transaction. Please do not close this page.</p>
        <div class="pay-progress-dots">
          <div class="pay-dot active"></div>
          <div class="pay-dot active"></div>
          <div class="pay-dot active"></div>
        </div>
      </div>`;

    case 'approved':
      return `<div class="pay-step-screen">
        <div class="pay-success-icon">✅</div>
        <div class="pay-step-title" style="color:var(--green)">Payment Successful!</div>
        <p class="pay-step-sub">
          ₹${state.booking.total} paid successfully.<br>
          Your booking is confirmed!
        </p>
        <button class="pay-btn" style="max-width:300px;margin-top:28px" onclick="finishBooking()">
          View Booking Confirmation →
        </button>
      </div>`;

    default: return '';
  }
}

function otpInput(el, idx) {
  el.value = el.value.replace(/\D/g,'');
  if (el.value && idx < 5) {
    const next = document.getElementById(`otp${idx+1}`);
    if (next) next.focus();
  }
}
function otpBack(el, idx, e) {
  if (e.key==='Backspace' && !el.value && idx>0) {
    const prev = document.getElementById(`otp${idx-1}`);
    if (prev) { prev.value=''; prev.focus(); }
  }
}
function verifyOTP() {
  const otp = [0,1,2,3,4,5].map(i=>document.getElementById(`otp${i}`)?.value||'').join('');
  if (otp.length<6) return showToast('❌ Enter all 6 digits of the OTP.');
  state.payStep = 'otp_verify';
  render();
  setTimeout(() => { state.payStep = 'approved'; render(); }, 2000);
}

function startBankConfirm() {
  state.payStep = 'bankconfirm';
  render();
  setTimeout(() => { state.payStep = 'approved'; render(); }, 2500);
}

function finishBooking() {
  state.booking.bookingId = 'ATH' + Math.random().toString(36).substr(2,8).toUpperCase();
  navigate('confirm');
}

/* ══════════════════════════════════════════════════════
   CONFIRMATION
   ══════════════════════════════════════════════════════ */
function renderConfirm() {
  const b = state.booking;
  return `<div class="page">
    <div class="confirm-page">
      <div class="steps" style="max-width:400px;margin:0 auto 40px">
        <div class="step done"><div class="step-circle">✓</div><div class="step-label">Details</div></div>
        <div class="step done"><div class="step-circle">✓</div><div class="step-label">Payment</div></div>
        <div class="step active"><div class="step-circle">3</div><div class="step-label">Confirmation</div></div>
      </div>
      <div class="confirm-icon">🎉</div>
      <h2 class="confirm-title">Booking <span class="text-grad">Confirmed!</span></h2>
      <p class="confirm-sub">Your turf slot is reserved. See you on the field! 🏆</p>
      <div class="confirm-card">
        <div class="confirm-row"><span class="label">Booking ID</span><span class="val booking-id">${b.bookingId}</span></div>
        <div class="confirm-row"><span class="label">Turf</span><span class="val">${b.turfName}</span></div>
        <div class="confirm-row"><span class="label">Sport</span><span class="val">${SPORTS_MAP[b.sport]?.icon} ${SPORTS_MAP[b.sport]?.name}</span></div>
        <div class="confirm-row"><span class="label">Date</span><span class="val">${formatDate(b.date)}</span></div>
        <div class="confirm-row"><span class="label">Time</span><span class="val">${b.slot} – ${addHour(b.slot)}</span></div>
        <div class="confirm-row"><span class="label">Name</span><span class="val">${b.name}</span></div>
        <div class="confirm-row"><span class="label">Phone</span><span class="val">${b.phone}</span></div>
        <div class="confirm-row"><span class="label">Amount Paid</span><span class="val" style="color:var(--green)">₹${b.total}</span></div>
        <div class="confirm-row"><span class="label">Payment Via</span><span class="val">${payMethodLabel()}</span></div>
      </div>
      <div class="confirm-actions">
        <button class="btn-outline" onclick="showToast('📲 Sharing…')">Share</button>
        <button class="btn-outline" onclick="showToast('⬇️ Downloading receipt…')">Download</button>
        <button class="btn-primary" style="flex:2;padding:12px" onclick="navigate('home')">Back to Home</button>
      </div>
    </div>
  </div>`;
}

function payMethodLabel() {
  if (state.paymentMethod==='upi') return state.selectedUpiApp ? state.selectedUpiApp : 'UPI';
  if (state.paymentMethod==='card') return 'Debit / Credit Card';
  return state.selectedBank || 'Net Banking';
}

/* ══════════════════════════════════════════════════════
   TEAMS PAGE
   ══════════════════════════════════════════════════════ */
function renderTeams() {
  const sf = state.sportFilter || 'all';
  let teams = getTeams();
  if (sf !== 'all') teams = teams.filter(t => t.sport === sf);
  const sportFilters = ['all','football','cricket','badminton','tennis','basketball','volleyball'];

  return `<div class="page">
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb">
          <a onclick="navigate('home')">Home</a><span>›</span><span>Find Teams</span>
        </div>
        <h2>Open <span class="text-grad2">Teams</span></h2>
        <p class="sub">Join a team, or create your own and find players!</p>
        <div class="filter-bar">
          ${sportFilters.map(s => `
            <button class="filter-chip ${sf===s?'active':''}" onclick="setTeamSportFilter('${s}')">
              ${s==='all'?'🏆 All':SPORTS_MAP[s]?.icon+' '+SPORTS_MAP[s]?.name}
            </button>`).join('')}
        </div>
      </div>
    </div>
    <div class="teams-page" style="padding-top:24px">
      ${teams.length
        ? `<div class="teams-page-grid">${teams.map(t => renderTeamPageCard(t)).join('')}</div>`
        : `<div class="empty"><div class="e-icon">👥</div><p>No open teams for this sport. Create one!</p></div>`}
    </div>
    <button class="fab" title="Create Team" onclick="openCreateTeamModal(null)">+</button>
  </div>`;
}

function renderTeamPageCard(t) {
  const sport  = SPORTS_MAP[t.sport];
  const pct    = Math.min(100, Math.round((t.currentPlayers/t.totalPlayersNeeded)*100));
  const needed = t.totalPlayersNeeded - t.currentPlayers;
  const isMyTeam = currentUser && t.creatorId === currentUser.id;
  const pendingReqs = (t.joinRequests||[]).filter(r=>r.status==='pending').length;

  return `<div class="team-page-card">
    <div class="team-sport-badge" style="background:rgba(255,255,255,.07);color:${sport?.color}">
      ${sport?.icon} ${sport?.name}
    </div>
    <div class="team-card-name">${t.teamName}</div>
    <div class="team-card-turf">🏟️ ${t.turfName}</div>
    <div class="team-card-time">📅 ${formatDate(t.slotDate)} · ⏰ ${t.slotTime}</div>
    <p style="font-size:12px;color:var(--text2);margin-bottom:14px;line-height:1.6">${t.description}</p>
    <div class="team-progress">
      <div class="team-progress-label">
        <span>${t.currentPlayers}/${t.totalPlayersNeeded} players</span>
        <span style="color:${needed>0?'var(--orange)':'var(--green)'}">
          ${needed>0?`${needed} more needed`:'✓ Full Team'}
        </span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:14px">
      <div style="font-size:11px;color:var(--text3)">By ${t.createdBy}</div>
      ${isMyTeam
        ? `<button class="btn-manage-requests" onclick="openManageRequests('${t.id}')">
            Manage Requests${pendingReqs>0?` <span style="background:var(--pink);color:#fff;border-radius:100px;padding:1px 6px;font-size:10px">${pendingReqs}</span>`:''}
           </button>`
        : needed>0
          ? `<button class="btn-join-lg" onclick="joinTeam('${t.id}')">Request to Join</button>`
          : `<span style="font-size:11px;color:var(--text3);font-style:italic">Team Full</span>`}
    </div>
  </div>`;
}

function setTeamSportFilter(s) { state.sportFilter = s; navigate('teams'); }

/* ══════════════════════════════════════════════════════
   TEAM — CREATE
   ══════════════════════════════════════════════════════ */
function openCreateTeamModal(turfId) {
  if (!currentUser) {
    showToast('🔐 Please log in to create a team.');
    return openLoginModal();
  }
  const turfsOpts = TURFS.map(t =>
    `<option value="${t.id}" ${t.id===turfId?'selected':''}>${t.name} — ${getCityById(t.cityId)?.name}</option>`).join('');
  const sportOpts = Object.entries(SPORTS_MAP).map(([k,v]) =>
    `<option value="${k}">${v.icon} ${v.name}</option>`).join('');

  showModal(`
    <div class="modal-header">
      <div class="modal-title">➕ Create a Team</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="form-grid">
      <div class="form-group full">
        <label class="form-label">Team Name *</label>
        <input class="form-input" id="ct-name" placeholder="e.g. Weekend Warriors" />
      </div>
      <div class="form-group">
        <label class="form-label">Sport *</label>
        <select class="form-input" id="ct-sport" style="background:var(--bg)">${sportOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Total Players Needed</label>
        <input class="form-input" id="ct-total" type="number" value="11" min="2" max="22" />
      </div>
      <div class="form-group full">
        <label class="form-label">Turf</label>
        <select class="form-input" id="ct-turf" style="background:var(--bg)">${turfsOpts}</select>
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="ct-date" type="date" value="${todayStr()}" min="${todayStr()}" />
      </div>
      <div class="form-group">
        <label class="form-label">Time Slot</label>
        <select class="form-input" id="ct-slot" style="background:var(--bg)">
          ${Array.from({length:18},(_,i)=>i+5).map(h=>`<option>${String(h).padStart(2,'0')}:00</option>`).join('')}
        </select>
      </div>
      <div class="form-group full">
        <label class="form-label">Contact Number</label>
        <input class="form-input" id="ct-contact" placeholder="+91 XXXXX XXXXX" type="tel" value="${currentUser?.phone||''}" />
      </div>
      <div class="form-group full">
        <label class="form-label">Description</label>
        <input class="form-input" id="ct-desc" placeholder="Tell players what to expect…" />
      </div>
    </div>
    <div style="display:flex;gap:10px;margin-top:22px">
      <button class="btn-ghost" onclick="closeModal()" style="flex:1">Cancel</button>
      <button class="btn-primary" onclick="submitCreateTeam()" style="flex:2;padding:12px">Create Team 🏆</button>
    </div>
  `);
}

function submitCreateTeam() {
  const name = document.getElementById('ct-name')?.value.trim();
  if (!name) return showToast('❌ Enter a team name.');
  const turfId = document.getElementById('ct-turf')?.value;
  const turf   = getTurfById(turfId);
  const newTeam = {
    id: 'team_' + Date.now(),
    turfId, turfName: turf?.name || '', cityId: turf?.cityId || '',
    sport: document.getElementById('ct-sport')?.value,
    slotDate: document.getElementById('ct-date')?.value,
    slotTime: document.getElementById('ct-slot')?.value,
    teamName: name,
    createdBy: currentUser.name,
    creatorId: currentUser.id,
    avatar: currentUser.name[0].toUpperCase(),
    totalPlayersNeeded: parseInt(document.getElementById('ct-total')?.value)||11,
    currentPlayers: 1,
    members: [currentUser.name],
    contact: document.getElementById('ct-contact')?.value||'',
    description: document.getElementById('ct-desc')?.value||'Looking for players!',
    joinRequests: [],
  };
  const teams = getTeams();
  teams.unshift(newTeam);
  saveTeams(teams);
  closeModal();
  showToast('🎉 Team created! Players can now find and request to join.');
  setTimeout(() => render(), 300);
}

/* ══════════════════════════════════════════════════════
   TEAM — JOIN REQUEST (sends to host)
   ══════════════════════════════════════════════════════ */
function joinTeam(teamId) {
  if (!currentUser) {
    showToast('🔐 Please log in to join a team.');
    return openLoginModal();
  }
  const teams = getTeams();
  const team  = teams.find(t => t.id === teamId);
  if (!team) return;
  if (team.creatorId === currentUser.id) return showToast('❌ You created this team!');
  const alreadyReq = (team.joinRequests||[]).find(r => r.userId === currentUser.id);
  if (alreadyReq) return showToast('⏳ You already sent a request. Wait for the host to respond.');

  showModal(`
    <div class="modal-header">
      <div class="modal-title">🙋 Request to Join</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;margin-bottom:20px;font-size:13px;color:var(--text2);line-height:1.8">
      <strong style="color:var(--text)">${SPORTS_MAP[team.sport]?.icon} ${team.teamName}</strong><br>
      🏟️ ${team.turfName}<br>
      📅 ${formatDate(team.slotDate)} · ⏰ ${team.slotTime}<br>
      👥 ${team.totalPlayersNeeded - team.currentPlayers} spots available
    </div>
    <p style="font-size:13px;color:var(--text2);margin-bottom:18px">
      Your request will be sent to the team host <strong>${team.createdBy}</strong> for approval.
    </p>
    <div class="form-group" style="margin-bottom:14px">
      <label class="form-label">Message to Host (optional)</label>
      <input class="form-input" id="join-msg" placeholder="Hi! I'd love to join your team." />
    </div>
    <div style="display:flex;gap:10px">
      <button class="btn-ghost" onclick="closeModal()" style="flex:1">Cancel</button>
      <button class="btn-primary" onclick="submitJoinRequest('${teamId}')" style="flex:2;padding:12px">Send Request ⚡</button>
    </div>
  `);
}

function submitJoinRequest(teamId) {
  const teams = getTeams();
  const team  = teams.find(t => t.id === teamId);
  if (!team) return;
  const msg = document.getElementById('join-msg')?.value.trim();
  team.joinRequests = team.joinRequests || [];
  team.joinRequests.push({
    userId: currentUser.id,
    name:   currentUser.name,
    phone:  currentUser.phone || '',
    email:  currentUser.email,
    msg:    msg || '',
    status: 'pending',
    at:     Date.now(),
  });
  saveTeams(teams);
  closeModal();
  showToast(`✅ Request sent to ${team.createdBy}! You'll be notified when accepted.`);
  render();
}

/* ══════════════════════════════════════════════════════
   TEAM — MANAGE REQUESTS (host view)
   ══════════════════════════════════════════════════════ */
function openManageRequests(teamId) {
  const teams = getTeams();
  const team  = teams.find(t => t.id === teamId);
  if (!team) return;
  const pending = (team.joinRequests||[]).filter(r => r.status === 'pending');

  showModal(`
    <div class="modal-header">
      <div class="modal-title">🔔 Join Requests — ${team.teamName}</div>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <p style="font-size:13px;color:var(--text3);margin-bottom:18px">
      ${pending.length} pending request${pending.length!==1?'s':''} · Team ${team.currentPlayers}/${team.totalPlayersNeeded}
    </p>
    ${pending.length === 0
      ? `<div class="empty" style="padding:24px"><div class="e-icon">✅</div><p>No pending requests right now.</p></div>`
      : pending.map(r => `
        <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;margin-bottom:10px">
          <div style="font-weight:700;font-size:14px;margin-bottom:2px">${r.name}</div>
          <div style="font-size:11px;color:var(--text3);margin-bottom:6px">📞 ${r.phone} · ${r.email}</div>
          ${r.msg?`<div style="font-size:12px;color:var(--text2);margin-bottom:10px;font-style:italic">"${r.msg}"</div>`:''}
          <div class="notif-actions">
            <button class="btn-accept" onclick="resolveRequest('${teamId}','${r.userId}','accepted')">✓ Accept</button>
            <button class="btn-reject" onclick="resolveRequest('${teamId}','${r.userId}','rejected')">✕ Reject</button>
          </div>
        </div>`).join('')}
    <button class="btn-ghost" onclick="closeModal()" style="width:100%;margin-top:8px">Close</button>
  `);
}

function resolveRequest(teamId, userId, status) {
  const teams = getTeams();
  const team  = teams.find(t => t.id === teamId);
  if (!team) return;
  const req = (team.joinRequests||[]).find(r => r.userId === userId);
  if (!req) return;
  req.status = status;
  if (status === 'accepted') {
    team.members.push(req.name);
    team.currentPlayers = Math.min(team.currentPlayers + 1, team.totalPlayersNeeded);
    showToast(`✅ ${req.name} added to ${team.teamName}!`);
  } else {
    showToast(`❌ Request from ${req.name} rejected.`);
  }
  saveTeams(teams);
  // Refresh the modal
  openManageRequests(teamId);
  render();
}

/* ══════════════════════════════════════════════════════
   HOST DASHBOARD
   ══════════════════════════════════════════════════════ */
function renderHostDashboard() {
  if (!currentUser || currentUser.role !== 'host') {
    navigate('home'); return '';
  }
  // Get turf this host manages
  const myTurf   = currentUser.turfId ? getTurfById(currentUser.turfId) : null;
  const myTurfs  = myTurf ? [myTurf] : TURFS.filter(t => t.cityId === 'bangalore').slice(0,1);
  const allTeams = getTeams();
  const turfTeams = myTurfs.flatMap(t => allTeams.filter(tm => tm.turfId === t.id));
  const pendingReqs = turfTeams.reduce((n, t) => n + (t.joinRequests||[]).filter(r=>r.status==='pending').length, 0);

  // Demo bookings for this host's turf
  const demoBookings = [
    { id:'BK001', name:'—', slot:'—', sport:'—', status:'pending',   amount:'—' },
    { id:'BK002', name:'—', slot:'—', sport:'—', status:'confirmed', amount:'—' },
    { id:'BK003', name:'—', slot:'—', sport:'—', status:'pending',   amount:'—' },
  ];

  return `<div class="page">
    <div class="page-header">
      <div class="page-header-inner">
        <div class="breadcrumb"><a onclick="navigate('home')">Home</a><span>›</span><span>Host Dashboard</span></div>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <h2>Host Dashboard</h2>
          <span class="host-badge">🏟️ Turf Host</span>
        </div>
        <p class="sub">Welcome back, ${currentUser.name}! Manage your turf, bookings & teams.</p>
      </div>
    </div>

    <div class="host-dashboard">

      <!-- Stats -->
      <div class="host-stats-grid">
        <div class="host-stat-card">
          <div class="host-stat-num">${myTurfs.length}</div>
          <div class="host-stat-label">Turfs Managed</div>
        </div>
        <div class="host-stat-card">
          <div class="host-stat-num">–</div>
          <div class="host-stat-label">Today's Bookings</div>
        </div>
        <div class="host-stat-card">
          <div class="host-stat-num">–</div>
          <div class="host-stat-label">Total Revenue</div>
        </div>
        <div class="host-stat-card">
          <div class="host-stat-num orange">${pendingReqs || '–'}</div>
          <div class="host-stat-label">Pending Requests</div>
        </div>
        <div class="host-stat-card">
          <div class="host-stat-num">${turfTeams.length}</div>
          <div class="host-stat-label">Active Teams</div>
        </div>
      </div>

      <!-- My Turf(s) -->
      <div class="section-card-title" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:18px;margin-bottom:16px;display:flex;align-items:center;gap:10px">
        <span style="width:4px;height:20px;background:var(--grad);border-radius:2px;display:block"></span>Your Turfs
      </div>
      ${myTurfs.map(turf => {
        const turf_teams = allTeams.filter(t => t.turfId === turf.id);
        const turf_pending = turf_teams.reduce((n,t)=>n+(t.joinRequests||[]).filter(r=>r.status==='pending').length, 0);
        return `
        <div class="host-turf-card">
          <div class="host-turf-header">
            <div class="host-turf-banner" style="background:${turf.gradient}">🏟️</div>
            <div style="flex:1">
              <div style="font-family:'Outfit',sans-serif;font-weight:700;font-size:18px">${turf.name}</div>
              <div style="font-size:12px;color:var(--text3);margin-top:2px">📍 ${turf.address}</div>
              <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
                ${turf.sports.map(s=>`<span class="sport-badge" style="background:rgba(255,255,255,.1)">${SPORTS_MAP[s]?.icon} ${SPORTS_MAP[s]?.name}</span>`).join('')}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-size:12px;color:var(--text3)">Rating</div>
              <div style="font-size:20px;font-weight:800;color:#FFD600">⭐ ${turf.rating}</div>
              <div style="font-size:11px;color:var(--text3);margin-top:2px">${turf.reviewCount} reviews</div>
            </div>
          </div>
          <div class="host-turf-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

              <!-- Pricing table -->
              <div>
                <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text2)">💰 Pricing</div>
                ${turf.sports.map(s=>`
                  <div class="booking-row" style="padding:8px 0">
                    <span>${SPORTS_MAP[s]?.icon} ${SPORTS_MAP[s]?.name}</span>
                    <span style="margin-left:auto;font-weight:700">₹${turf.pricing[s]}/hr</span>
                  </div>`).join('')}
              </div>

              <!-- Amenities -->
              <div>
                <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text2)">✅ Amenities (${turf.amenities.length})</div>
                <div style="display:flex;gap:6px;flex-wrap:wrap">
                  ${turf.amenities.slice(0,5).map(a=>`<span class="amenity-chip">${AMENITIES_MAP[a]?.icon} ${AMENITIES_MAP[a]?.name}</span>`).join('')}
                  ${turf.amenities.length>5?`<span class="amenity-chip">+${turf.amenities.length-5}</span>`:''}
                </div>
              </div>
            </div>

            <!-- Active Teams -->
            <div style="margin-top:20px">
              <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text2)">
                👥 Teams at this Turf
                ${turf_pending>0?`<span style="background:var(--pink);color:#fff;border-radius:100px;padding:1px 8px;font-size:11px;margin-left:8px">${turf_pending} pending</span>`:''}
              </div>
              ${turf_teams.length ? turf_teams.map(team => {
                const sp = SPORTS_MAP[team.sport];
                const pr = (team.joinRequests||[]).filter(r=>r.status==='pending').length;
                return `<div class="booking-row">
                  <span>${sp?.icon}</span>
                  <span><strong>${team.teamName}</strong><br><span style="font-size:11px;color:var(--text3)">${formatDate(team.slotDate)} · ${team.slotTime}</span></span>
                  <span style="font-size:12px;color:var(--text2);margin-left:8px">${team.currentPlayers}/${team.totalPlayersNeeded} players</span>
                  ${pr>0
                    ? `<button class="btn-manage-requests" onclick="openManageRequests('${team.id}')" style="padding:5px 12px;font-size:11px">${pr} Request${pr>1?'s':''}</button>`
                    : `<span class="booking-status" style="background:rgba(0,230,118,.1);color:var(--green)">Active</span>`}
                </div>`;
              }).join('')
              : `<div style="font-size:13px;color:var(--text3);padding:12px 0">No teams formed for this turf yet.</div>`}
            </div>

            <!-- Recent Bookings -->
            <div style="margin-top:20px">
              <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text2)">📋 Recent Bookings</div>
              <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--r2);padding:14px 18px;font-size:12px;color:var(--text3);text-align:center">
                No bookings recorded yet. Bookings will appear here once players complete payment.
              </div>
            </div>
          </div>
        </div>`;
      }).join('')}

      <!-- Manage Teams Button -->
      <div style="display:flex;gap:12px;margin-top:8px">
        <button class="btn-primary" style="padding:12px 24px" onclick="navigate('teams')">👥 View All Teams</button>
        <button class="btn-ghost" style="padding:12px 24px" onclick="navigate('home')">🏠 Back to Home</button>
      </div>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════
   PROFILE PAGE
   ══════════════════════════════════════════════════════ */
function renderProfile() {
  if (!currentUser) return navigate('home'), '';
  const myTeams = getTeams().filter(t => t.creatorId === currentUser.id);
  const pendingCount = getPendingRequestCount();

  return `<div class="page">
    <div class="profile-page">
      <div class="profile-hero">
        <div class="profile-hero-avatar">${currentUser.name[0].toUpperCase()}</div>
        <div>
          <div class="profile-hero-name">${currentUser.name}</div>
          <div class="profile-hero-email">${currentUser.email}</div>
          <div style="font-size:11px;color:var(--text3);margin-top:4px">📞 ${currentUser.phone}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px;margin-bottom:24px">
        <div class="section-card" style="text-align:center;padding:20px">
          <div style="font-family:'Outfit',sans-serif;font-size:2rem;font-weight:900" class="text-grad">–</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">Bookings Made</div>
        </div>
        <div class="section-card" style="text-align:center;padding:20px">
          <div style="font-family:'Outfit',sans-serif;font-size:2rem;font-weight:900;background:var(--grad2);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${myTeams.length}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">Teams Created</div>
        </div>
        <div class="section-card" style="text-align:center;padding:20px">
          <div style="font-family:'Outfit',sans-serif;font-size:2rem;font-weight:900;color:${pendingCount>0?'var(--orange)':'var(--green)'}">
            ${pendingCount||'–'}
          </div>
          <div style="font-size:12px;color:var(--text3);margin-top:4px">Pending Requests</div>
        </div>
      </div>

      ${myTeams.length ? `
        <div class="section-card">
          <div class="section-card-title">My Teams</div>
          <div class="team-list">${myTeams.map(t => renderTeamCard(t)).join('')}</div>
        </div>` : ''}

      <button class="btn-outline" style="width:100%;padding:12px;margin-top:8px;color:var(--red);border-color:rgba(255,23,68,.3)"
        onclick="logoutUser()">🚪 Logout</button>
    </div>
  </div>`;
}

/* ══════════════════════════════════════════════════════
   MODAL HELPERS
   ══════════════════════════════════════════════════════ */
function showModal(html) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = `<div class="modal">${html}</div>`;
  overlay.classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('hidden');
}

/* ══════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════ */
function selectSport(s) { state.sport=s; state.slot=null; navigate('turf',{turfId:state.turfId}); }
function selectDate(d)  { state.date=d;  state.slot=null; navigate('turf',{turfId:state.turfId}); }
function selectSlot(t)  { state.slot=t;  navigate('turf',{turfId:state.turfId}); }
function setPayMethod(m){ state.paymentMethod=m; state.payStep='input'; navigate('payment'); }

function todayStr() { return new Date().toISOString().split('T')[0]; }

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str+'T00:00:00');
  return d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
}

function addHour(t) {
  if (!t) return '';
  const [h,m] = t.split(':').map(Number);
  return String(h+1).padStart(2,'0')+':'+String(m).padStart(2,'0');
}

function fmtCard(el) {
  let v = el.value.replace(/\D/g,'').slice(0,16);
  v = v.match(/.{1,4}/g)?.join(' ')||v;
  el.value = v;
  const disp = document.getElementById('cd-num');
  if (disp) disp.textContent = v||'•••• •••• •••• ••••';
}
function fmtExp(el) {
  let v = el.value.replace(/\D/g,'');
  if (v.length>=2) v = v.slice(0,2)+'/'+v.slice(2,4);
  el.value = v;
  const disp = document.getElementById('cd-exp');
  if (disp) disp.textContent = v||'MM/YY';
}

function getCityEmoji(id) {
  const m={bangalore:'🌿',mumbai:'🌊',delhi:'🏛️',hyderabad:'💎',chennai:'🌴',pune:'🏔️',kolkata:'⚽',ahmedabad:'🦁',indore:'👑'};
  return m[id]||'🏙️';
}

function generateQRSvg() {
  const size=176, cell=8, cols=size/cell;
  let r='';
  const seed = 42137;
  for(let row=0;row<cols;row++) for(let col=0;col<cols;col++){
    const v=(row*cols+col+seed)*1664525+1013904223;
    const filled=(v&1)||(row<3&&col<3)||(row<3&&col>cols-4)||(row>cols-4&&col<3);
    if(filled) r+=`<rect x="${col*cell}" y="${row*cell}" width="${cell-1}" height="${cell-1}" fill="#000"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">${r}</svg>`;
}

function showToast(msg, ms=3200) {
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.remove('hidden');
  clearTimeout(window._tt);
  window._tt=setTimeout(()=>t.classList.add('hidden'),ms);
}

/* ══════════════════════════════════════════════════════
   BIND EVENTS
   ══════════════════════════════════════════════════════ */
function bindEvents() {
  // Close dropdown/modal on outside click
  document.addEventListener('click', e => {
    const dd = document.getElementById('profile-dropdown');
    const nb = document.getElementById('nav-user-btn');
    if (dd && nb && !nb.contains(e.target) && !dd.contains(e.target))
      dd.style.display = 'none';
  }, { once: true });

  document.getElementById('modal-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') closeModal();
  });
}

/* ══════════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  initAuth();
  render();
  // Navbar scroll effect
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    if (nb) nb.style.background = window.scrollY > 40
      ? 'rgba(12,15,30,0.98)'
      : 'rgba(12,15,30,0.88)';
  });
});
