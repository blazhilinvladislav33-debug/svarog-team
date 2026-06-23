// app.js - Спільний файл ініціалізації Firebase та логіки
const firebaseConfig = {
    apiKey: "AIzaSyAz5vZlnI7XwGhSXlKkX3DNAL13ECNegNk",
    authDomain: "svarog-team.firebaseapp.com",
    projectId: "svarog-team",
    storageBucket: "svarog-team.firebasestorage.app",
    messagingSenderId: "311449325528",
    appId: "1:311449325528:web:b254c6aed4fea56fe96cad",
    measurementId: "G-56T1VN72PF"
};

// Ініціалізація Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// --- ЛОГІКА МОВИ ---
function setLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    document.querySelectorAll('[data-lang="ua"]').forEach(el => el.style.display = lang === 'ua' ? (el.tagName === 'SPAN' ? 'inline' : 'block') : 'none');
    document.querySelectorAll('[data-lang="en"]').forEach(el => el.style.display = lang === 'en' ? (el.tagName === 'SPAN' ? 'inline' : 'block') : 'none');
    document.querySelectorAll('.lang-btn').forEach(btn => { btn.classList.toggle('active', btn.innerText.toLowerCase() === lang); });
}

// --- ЛОГІКА ЧАТУ ---
let userChatSessionId = localStorage.getItem('userChatSessionId');
let unsubscribeUserChat = null;

function initUserChat() {
    if (!userChatSessionId) {
        userChatSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userChatSessionId', userChatSessionId);
    }
    startRealtimeChatListener();
}

window.openUserChat = function(e) {
    if(e) e.preventDefault();
    const navMenu = document.getElementById('nav-menu');
    const menuButton = document.getElementById('menu-button');
    if(navMenu) navMenu.classList.remove('active');
    if(menuButton) menuButton.classList.remove('open');
    
    const chatWindow = document.getElementById('user-chat-window');
    if(chatWindow) chatWindow.style.display = 'flex';
    renderUserChat();
}

function startRealtimeChatListener() {
    if (unsubscribeUserChat) unsubscribeUserChat();
    unsubscribeUserChat = db.collection("chats").doc(userChatSessionId).onSnapshot(doc => {
        let myChat = doc.exists ? doc.data() : { messages: [], status: 'active' };
        renderUserChat(myChat);
    }, err => console.error("Помилка чату:", err));
}

function renderUserChat(myChatData) {
    const messagesBox = document.getElementById('user-chat-messages');
    const inputBlock = document.getElementById('user-chat-input-block');
    if (!messagesBox || !inputBlock) return;

    const lang = localStorage.getItem('selectedLang') || 'ua';
    let myChat = myChatData || { messages: [], status: 'active' };

    if (localStorage.getItem('clearChatTime_' + userChatSessionId)) {
        const clearTime = parseInt(localStorage.getItem('clearChatTime_' + userChatSessionId));
        if (Date.now() > clearTime) {
            localStorage.removeItem('clearChatTime_' + userChatSessionId);
            localStorage.removeItem('userChatSessionId');
            userChatSessionId = 'session_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userChatSessionId', userChatSessionId);
            messagesBox.innerHTML = "";
            inputBlock.style.display = 'flex';
            startRealtimeChatListener();
            return;
        }
    }

    messagesBox.innerHTML = "";
    myChat.messages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender}`;
        if(msg.type === 'image') {
            bubble.innerHTML = `<img src="${msg.text}" onclick="window.open().document.write('<img src=\'${msg.text}\'>')">`;
        } else { 
            bubble.innerText = msg.text; 
        }
        messagesBox.appendChild(bubble);
    });

    if (myChat.status === 'closed') {
        inputBlock.style.display = 'none';
        const sysMsg = document.createElement('div');
        sysMsg.className = 'chat-bubble system';
        sysMsg.innerText = lang === 'ua' ? 'Адміністратор завершив сесію. Чат автоматично очиститься через 5 хвилин.' : 'Administrator has closed the session. Chat will automatically clear in 5 minutes.';
        messagesBox.appendChild(sysMsg);
        if (!localStorage.getItem('clearChatTime_' + userChatSessionId)) {
            localStorage.setItem('clearChatTime_' + userChatSessionId, Date.now() + 5 * 60 * 1000);
        }
    } else { 
        inputBlock.style.display = 'flex'; 
    }
    
    messagesBox.scrollTop = messagesBox.scrollHeight;
}

window.sendUserChatMessage = async function() {
    const input = document.getElementById('user-chat-input');
    if(!input) return;
    const text = input.value.trim();
    if (!text) return;

    const msgObject = { sender: 'user', text: text, type: 'text', time: Date.now() };
    input.value = "";

    try {
        await db.collection("chats").doc(userChatSessionId).set({
            id: userChatSessionId, status: 'active', adminStatus: 'processing', lastUpdate: Date.now(),
            messages: firebase.firestore.FieldValue.arrayUnion(msgObject)
        }, { merge: true });
    } catch(e) { console.error(e); }
}

window.sendUserChatPhoto = function(input) {
    alert(localStorage.getItem('selectedLang') === 'en' ? "Photo transfer is in development." : "Надсилання фото знаходиться в розробці.");
}

document.addEventListener('keydown', function(e) { 
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'user-chat-input') {
        window.sendUserChatMessage(); 
    }
});

window.addEventListener('DOMContentLoaded', () => { 
    setLanguage(localStorage.getItem('selectedLang') || 'ua'); 
    if(document.getElementById('user-chat-window')) {
        initUserChat(); 
    }
});
