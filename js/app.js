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

// API base URL
const API_BASE = 'http://localhost:5000/api';

// Mock data for demo (fallback if API fails)
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

async function loadUserData() {
    try {
        const response = await fetch(`${API_BASE}/user/${userData.id}`);
        if (response.ok) {
            const data = await response.json();
            userData = { ...userData, ...data };
        } else {
            // Fallback to localStorage
            let saved = localStorage.getItem('cowrieRushUser');
            if (saved) {
                userData = { ...userData, ...JSON.parse(saved) };
            }
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to localStorage
        let saved = localStorage.getItem('cowrieRushUser');
        if (saved) {
            userData = { ...userData, ...JSON.parse(saved) };
        }
    }
    updateUI();
    updateStatusBar();
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
    switch (page) {
        case 'home':
            document.getElementById('total-cwry').textContent = userData.totalCwry;
            updateStatusBar();
            const homeDiv = document.getElementById('home');
            homeDiv.innerHTML = `
                <h2>Home</h2>
                <div class="welcome-message">
                    <p>👋 Welcome, @${userData.username}!</p>
                    <p>⏰ Tap the $CWRY button every 24 hours to grow your coin balance. It's simple, consistent, and rewarding.</p>
                    <p>👥 Build your squad, complete missions, and boost your earnings! For every friend you invite, you both earn 500 $CWRY tokens.</p>
                    <p>🌟 $COWRY is more than a token—it's a movement. Designed to reward the culture, connect communities, and fuel the future of decentralized wealth.</p>
                    <p>This is your first step into the world of ChainRaiders.</p>
                    <p>Let's raid the blockchain—together. ⚔️💰</p>
                </div>
                <div class="home-buttons">
                    <button class="home-btn" onclick="startGame()">Start ⚔️</button>
                    <button class="home-btn" onclick="joinChannel()">Join Channel</button>
                </div>
                <div class="balance-display">
                    <p>Total CWRY: <span id="total-cwry">${userData.totalCwry}</span></p>
                    <button id="claim-btn" onclick="dailyTap()" disabled>Tap for CWRY</button>
                </div>
                <div id="status-bar"></div>
            `;
            updateStatusBar();
            break;
        case 'earn':
            const earnDiv = document.getElementById('earn');
            earnDiv.innerHTML = `
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
            `;
            updateTasks();
            break;
        case 'leaderboard':
            const lbDiv = document.getElementById('leaderboard');
            lbDiv.innerHTML = `
                <h2>Leaderboard</h2>
                <p>Your Rank: #${getUserRank()}</p>
                <div id="leaderboard-list">
                    ${leaderboard.slice(0, 100).map((player, index) => `
                        <div class="leaderboard-item">
                            <span>${index + 1 === 1 ? '🏆' : index + 1 === 2 ? '🥈' : index + 1 === 3 ? '🥉' : '#' + (index + 1)} ${player.username}</span>
                            <span>${player.totalCwry} CWRY</span>
                        </div>
                    `).join('')}
                </div>
            `;
            break;
        case 'frens':
            const frensDiv = document.getElementById('frens');
            const referralLink = `https://t.me/cowrierushbot?start=${userData.id}`;
            frensDiv.innerHTML = `
                <h2>Frens</h2>
                <div id="referral-link">
                    <p>Your Referral Link:</p>
                    <input type="text" id="referral-input" value="${referralLink}" readonly>
                    <button onclick="copyReferralLink()">Copy Link</button>
                </div>
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
            `;
            break;
        case 'wallet':
            // Update existing spans instead of overwriting innerHTML
            document.getElementById('cwry-balance').textContent = calculateCwryBalance();
            document.getElementById('usdt-balance').textContent = userData.usdtBalance;
            document.getElementById('ton-balance').textContent = userData.tonBalance || 'Not Connected';
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

async function completeTask(taskId) {
    try {
        const response = await fetch(`${API_BASE}/tasks/complete/${userData.id}/${taskId}`, {
            method: 'POST'
        });
        const data = await response.json();
        if (response.ok) {
            userData.tasks[taskId] = true;
            userData.totalCwry = data.reward;
            saveUserData();
            updateTasks();
            updateStatusBar();
            alert(`Task completed! Earned ${data.reward} CWRY`);
        } else {
            alert(data.error || 'Task completion failed');
        }
    } catch (error) {
        console.error('Error completing task:', error);
        alert('Error completing task');
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
            const btn = taskEl.querySelector('.claim-btn');
            btn.textContent = '✓ Completed';
            btn.disabled = true;
            btn.style.backgroundColor = '#4CAF50'; // Green color for completed
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

function calculateCwryBalance() {
    // CWRY balance = referral earnings + claimed task earnings
    const referralEarnings = calculateReferralEarnings();
    const taskEarnings = Object.keys(userData.tasks).reduce((sum, taskId) => {
        switch (taskId) {
            case 'tg1':
            case 'tg2':
                return sum + 100;
            case 'ref5':
                return sum + 50;
            case 'ref20':
                return sum + 100;
            default:
                return sum;
        }
    }, 0);
    return referralEarnings + taskEarnings;
}

function showWallet() {
    navigate('wallet');
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

function copyReferralLink() {
    const input = document.getElementById('referral-input');
    input.select();
    input.setSelectionRange(0, 99999); // For mobile devices
    navigator.clipboard.writeText(input.value).then(() => {
        alert('Referral link copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy link. Please copy manually.');
    });
}

function startGame() {
    // Navigate to earn page or start game logic
    navigate('earn');
}

function joinChannel() {
    window.open('https://t.me/cowrierush', '_blank');
}

function dailyTap() {
    const lastTap = localStorage.getItem('lastTap');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    if (!lastTap || (now - lastTap) >= twentyFourHours) {
        userData.totalCwry += 100; // Daily reward
        localStorage.setItem('lastTap', now);
        saveUserData();
        document.getElementById('total-cwry').textContent = userData.totalCwry;
        updateStatusBar();
        alert('Daily tap claimed! +100 CWRY');
    } else {
        const timeLeft = twentyFourHours - (now - lastTap);
        const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
        alert(`Daily tap available in ${hoursLeft} hours!`);
    }
}
