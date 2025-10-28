// Telegram Web App
let tg = window.Telegram.WebApp;
let user = tg.initDataUnsafe?.user;
let userData = {
    id: user?.id || 1,
    username: user?.username || 'Player',
    name: user?.first_name + ' ' + (user?.last_name || '') || 'Anonymous',
    totalCwry: 0,
    usdtBalance: 0,
    tonBalance: 0,
    referrals: [],
    tasks: {},
    isPremium: user?.is_premium || false
};

// Mock data for demo
let leaderboard = [
    { username: 'TopPlayer1', totalCwry: 150000 },
    { username: 'TopPlayer2', totalCwry: 140000 },
    { username: 'TopPlayer3', totalCwry: 130000 },
    // Add more for demo
];

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        loadUserData();
        navigate('home');
    }, 2000);
});

function loadUserData() {
    // Load from localStorage for demo
    let saved = localStorage.getItem('cowrieRushUser');
    if (saved) {
        userData = { ...userData, ...JSON.parse(saved) };
    }
    updateUI();
}

function saveUserData() {
    localStorage.setItem('cowrieRushUser', JSON.stringify(userData));
}

function updateUI() {
    document.getElementById('user-name').textContent = userData.name;
    // Update other elements as needed
}

function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    document.querySelectorAll('nav button').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`nav button[onclick="navigate('${page}')"]`).classList.add('active');
    loadPage(page);
}

function loadPage(page) {
    const content = document.getElementById('content');
    switch (page) {
        case 'home':
            content.innerHTML = `
                <div id="home" class="page active">
                    <h2>Home</h2>
                    <p>Total CWRY: <span id="total-cwry">${userData.totalCwry}</span></p>
                    <div id="status-bar">
                        <button id="claim-btn" onclick="claimCwry()" disabled>Claim</button>
                    </div>
                </div>
            `;
            updateStatusBar();
            break;
        case 'earn':
            content.innerHTML = `
                <div id="earn" class="page active">
                    <h2>Earn</h2>
                    <div class="task" id="task1">
                        <div>Join Telegram Channel 1</div>
                        <button class="claim-btn" onclick="completeTask('tg1')">Claim 100 CWRY</button>
                    </div>
                    <div class="task" id="task2">
                        <div>Join Telegram Channel 2</div>
                        <button class="claim-btn" onclick="completeTask('tg2')">Claim 100 CWRY</button>
                    </div>
                    <div class="task" id="task3">
                        <div>Refer 5 Frens</div>
                        <button class="claim-btn" onclick="completeTask('ref5')">Claim 50 CWRY</button>
                    </div>
                    <div class="task" id="task4">
                        <div>Refer 20 Frens</div>
                        <button class="claim-btn" onclick="completeTask('ref20')">Claim 100 CWRY</button>
                    </div>
                    <div class="task" id="task5">
                        <div>Follow on X</div>
                        <button class="claim-btn" onclick="startTimer('x', 10)">Start</button>
                    </div>
                    <div class="task" id="task6">
                        <div>Subscribe to YouTube</div>
                        <button class="claim-btn" onclick="redirectYouTube()">Go to YouTube</button>
                    </div>
                </div>
            `;
            updateTasks();
            break;
        case 'leaderboard':
            content.innerHTML = `
                <div id="leaderboard" class="page active">
                    <h2>Leaderboard</h2>
                    <p>Your Rank: #${getUserRank()}</p>
                    <div id="leaderboard-list">
                        ${leaderboard.slice(0, 100).map((player, index) => `
                            <div class="leaderboard-item">
                                <span>${index + 1 === 1 ? '🥇' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : '#' + (index + 1)} ${player.username}</span>
                                <span>${player.totalCwry} CWRY</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
        case 'frens':
            content.innerHTML = `
                <div id="frens" class="page active">
                    <h2>Frens</h2>
                    <div id="frens-info">
                        <p>You get ${userData.isPremium ? '5%' : '3%'} of all referrals' total balance.</p>
                        <p>Total Earnings from Referrals: ${calculateReferralEarnings()} CWRY</p>
                    </div>
                    <div id="referrals-list">
                        ${userData.referrals.map(ref => `
                            <div class="referral">
                                <span>${ref.name}</span>
                                <span>${ref.totalCwry} CWRY</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            break;
    }
}

function updateStatusBar() {
    const progress = Math.min(userData.totalCwry / 100000, 1);
    const bar = document.getElementById('status-bar');
    bar.style.background = `conic-gradient(#ff6b35 0% ${progress * 100}%, #333 ${progress * 100}% 100%)`;
    const claimBtn = document.getElementById('claim-btn');
    if (userData.totalCwry >= 100000) {
        claimBtn.disabled = false;
    }
}

function claimCwry() {
    if (userData.totalCwry >= 100000) {
        userData.totalCwry -= 100000;
        // Add to some balance or reward
        saveUserData();
        updateStatusBar();
        alert('Claimed!');
    }
}

function completeTask(taskId) {
    if (!userData.tasks[taskId]) {
        userData.tasks[taskId] = true;
        let reward = 0;
        switch (taskId) {
            case 'tg1':
            case 'tg2':
                reward = 100;
                break;
            case 'ref5':
                reward = 50;
                break;
            case 'ref20':
                reward = 100;
                break;
        }
        userData.totalCwry += reward;
        saveUserData();
        updateTasks();
        updateStatusBar();
        alert(`Task completed! Earned ${reward} CWRY`);
    }
}

function startTimer(taskId, seconds) {
    const btn = document.querySelector(`#task${taskId === 'x' ? 5 : 6} .claim-btn`);
    btn.disabled = true;
    btn.textContent = `Wait ${seconds}s`;
    let timeLeft = seconds;
    const timer = setInterval(() => {
        timeLeft--;
        btn.textContent = `Wait ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timer);
            btn.textContent = 'Claim';
            btn.onclick = () => completeTask(taskId);
        }
    }, 1000);
}

function redirectYouTube() {
    window.open('https://youtube.com/channel', '_blank');
    startTimer('yt', 30);
}

function updateTasks() {
    Object.keys(userData.tasks).forEach(task => {
        const taskEl = document.getElementById(`task${task.slice(-1)}`);
        if (taskEl) {
            taskEl.classList.add('completed');
            taskEl.querySelector('.claim-btn').style.display = 'none';
        }
    });
}

function getUserRank() {
    // Mock rank
    return Math.floor(Math.random() * 1000) + 1;
}

function calculateReferralEarnings() {
    return userData.referrals.reduce((sum, ref) => sum + (ref.totalCwry * (userData.isPremium ? 0.05 : 0.03)), 0);
}

function showWallet() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <div id="wallet" class="page active">
            <h2>Wallet</h2>
            <div class="balance">CWRY Balance: ${userData.totalCwry}</div>
            <div class="balance">USDT Balance: ${userData.usdtBalance}</div>
            <div class="balance" id="ton-balance">TON Balance: ${userData.tonBalance || 'Not Connected'}</div>
            <button class="connect-btn" onclick="connectWallet()">Connect TON Wallet</button>
        </div>
    `;
}

function connectWallet() {
    // Mock connection
    userData.tonBalance = 100; // Mock
    saveUserData();
    document.getElementById('ton-balance').textContent = `TON Balance: ${userData.tonBalance}`;
    alert('Wallet connected!');
}

function showUserStats() {
    const modal = document.createElement('div');
    modal.id = 'user-stats';
    modal.innerHTML = `
        <div class="stats-content">
            <span class="close-btn" onclick="closeModal()">×</span>
            <h3>Your Stats</h3>
            <p>Username: ${userData.username}</p>
            <p>Global Rank: #${getUserRank()}</p>
            <p>Total CWRY: ${userData.totalCwry}</p>
            <h4>Referrals:</h4>
            <ul>
                ${userData.referrals.map(ref => `<li>${ref.name} - ${ref.totalCwry} CWRY</li>`).join('')}
            </ul>
        </div>
    `;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('user-stats').remove();
}
