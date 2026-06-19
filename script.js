// ================= SOCKET =================
const socket = io("http://10.30.212.57:5000");

socket.on("connect", () => {
    console.log("✅ Connected:", socket.id);
});

// ================= USER =================
const user = localStorage.getItem("chatUser");
if (!user) location.href = "login.html";

document.getElementById("welcomeUser").innerText = "Welcome " + user;

// register user
socket.emit("newuser", user);

// ================= DATA =================
let contacts = JSON.parse(localStorage.getItem("contacts")) || [];
let chats = JSON.parse(localStorage.getItem("chats")) || {};
let selectedContact = null;

// ================= RENDER CONTACTS =================
function renderContacts() {
    const box = document.getElementById("contactList");
    box.innerHTML = "";

    contacts.forEach(c => {
        const div = document.createElement("div");
        div.className = "contact";

        // highlight selected
        if (selectedContact && selectedContact.id === c.id) {
            div.style.background = "#d4f8e8";
            div.style.fontWeight = "bold";
        }

        // last message preview
        const msgs = chats[c.id] || [];
        const lastMsg = msgs.length ? msgs[msgs.length - 1].text : "No messages yet";

        div.innerHTML = `<b>${c.name}</b><br><small>${lastMsg}</small>`;

        div.onclick = () => selectContact(c);

        box.appendChild(div);
    });
}

// ================= SELECT CONTACT =================
function selectContact(c) {
    selectedContact = c;

    document.getElementById("chatHeader").innerText = c.name;

    renderContacts();
    loadMessages();
}

// ================= LOAD MESSAGES =================
function loadMessages() {
    const box = document.getElementById("messages");
    box.innerHTML = "";

    if (!selectedContact) return;

    const msgs = chats[selectedContact.id] || [];

    msgs.forEach(m => {
        const div = document.createElement("div");
        div.className = "message " + (m.sender === user ? "user" : "contact-msg");
        div.innerText = m.text;
        box.appendChild(div);
    });

    box.scrollTop = box.scrollHeight;
}

// ================= SEND MESSAGE =================
function sendMessage() {
    const input = document.getElementById("messageInput");
    const text = input.value.trim();

    if (!text) return;
    if (!selectedContact) return alert("Select contact");

    socket.emit("privateMessage", {
        to: selectedContact.name,
        from: user,
        message: text
    });

    if (!chats[selectedContact.id]) chats[selectedContact.id] = [];

    chats[selectedContact.id].push({
        sender: user,
        text: text
    });

    localStorage.setItem("chats", JSON.stringify(chats));

    input.value = "";
    loadMessages();
    renderContacts();
}

// ================= RECEIVE MESSAGE =================
socket.on("privateMessage", (data) => {

    let contact = contacts.find(c => c.name === data.from);

    if (!contact) {
        contact = { id: data.from, name: data.from };
        contacts.push(contact);
    }

    if (!chats[data.from]) chats[data.from] = [];

    chats[data.from].push({
        sender: data.from,
        text: data.message
    });

    localStorage.setItem("contacts", JSON.stringify(contacts));
    localStorage.setItem("chats", JSON.stringify(chats));

    renderContacts();

    if (selectedContact && selectedContact.id === data.from) {
        loadMessages();
    }
});

// ================= ADD CONTACT =================
function addContact() {
    const name = document.getElementById("contactName").value.trim();
    const number = document.getElementById("contactNumber").value.trim();

    if (!name || !number) return alert("Enter details");

    if (contacts.find(c => c.id === name)) return alert("Already exists");

    const newContact = { id: name, name: name, phone: number };

    contacts.push(newContact);

    localStorage.setItem("contacts", JSON.stringify(contacts));

    renderContacts();
    selectContact(newContact); // auto select
    closeModal();
}

// ================= MODAL =================
function openModal() {
    document.getElementById("modal").style.display = "block";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// ================= LOGOUT =================
function logout() {
    localStorage.removeItem("chatUser");
    location.href = "login.html";
}

// ================= INIT =================
renderContacts();

document.getElementById("messageInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});