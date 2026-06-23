// app.js - Спільний файл конфігурації та логіки
const firebaseConfig = {
    apiKey: "AIzaSyAz5vZlnI7XwGhSXlKkX3DNAL13ECNegNk",
    authDomain: "svarog-team.firebaseapp.com",
    projectId: "svarog-team",
    storageBucket: "svarog-team.firebasestorage.app",
    messagingSenderId: "311449325528",
    appId: "1:311449325528:web:b254c6aed4fea56fe96cad",
    measurementId: "G-56T1VN72PF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ініціалізація чату (використовується на всіх сторінках)
async function sendUserChatMessage() {
    const input = document.getElementById('user-chat-input');
    const text = input.value.trim();
    if (!text) return;
    const msgObject = { sender: 'user', text: text, type: 'text', time: Date.now() };
    input.value = "";
    try {
        await db.collection("chats").doc(localStorage.getItem('userChatSessionId') || 'temp').set({
            messages: firebase.firestore.FieldValue.arrayUnion(msgObject)
        }, { merge: true });
    } catch(e) { console.error(e); }
}

function setLanguage(lang) {
    localStorage.setItem('selectedLang', lang);
    // Тут додайте вашу логіку перемикання тексту, якщо вона є
}00
