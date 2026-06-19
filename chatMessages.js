let selectedContact = null;

// ===== Select Contact =====
function selectContact(contact, user) {
    selectedContact = contact;
    const chatWith = document.getElementById("chatWith");
    const chatBox = document.getElementById("chatBox");
    const messagesDiv = document.getElementById("messages");

    chatWith.style.display = "none";
    chatBox.style.display = "flex";

    messagesDiv.innerHTML = `<p>Chatting with ${contact.name}</p>`;

    const saved = JSON.parse(localStorage.getItem("chatMessages") || "{}");
    const msgs = saved[contact.name] || [];
    msgs.forEach(m => appendMessage(m.sender, m.text, m.time, user));

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== Append Message =====
function appendMessage(sender, text, time, user) {
    const messagesDiv = document.getElementById("messages");
    const msgDiv = document.createElement("div");
    msgDiv.className = "message " + (sender === user ? "user" : "contact");

    const timestamp = time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    msgDiv.innerHTML = `${sender}: ${text} ${timestamp}`;

    // Add delete button
    const delBtn = document.createElement("span");
    delBtn.textContent = " ×";
    delBtn.style.cursor = "pointer";
    delBtn.style.color = "red";
    delBtn.onclick = () => deleteMessage(sender, text, time, msgDiv, user);
    msgDiv.appendChild(delBtn);

    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// ===== Send Message =====
function sendMessage(user) {
    const input = document.getElementById("messageInput");
    const msg = input.value.trim();
    if (!msg || !selectedContact) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    appendMessage(user, msg, time, user);

    const saved = JSON.parse(localStorage.getItem("chatMessages") || "{}");
    if (!saved[selectedContact.name]) saved[selectedContact.name] = [];
    saved[selectedContact.name].push({ sender: user, text: msg, time });
    localStorage.setItem("chatMessages", JSON.stringify(saved));

    input.value = "";

    // Random auto-reply
    setTimeout(() => {
        const replies = ["Hello!", "How are you?", "What's up?", "Nice to hear from you!"];
        const replyText = replies[Math.floor(Math.random() * replies.length)];
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        appendMessage(selectedContact.name, replyText, replyTime, user);
        saved[selectedContact.name].push({ sender: selectedContact.name, text: replyText, time: replyTime });
        localStorage.setItem("chatMessages", JSON.stringify(saved));
    }, 800);
}

// ===== Delete Message =====
function deleteMessage(sender, text, time, element, user) {
    if (!confirm("Delete this message?")) return;

    const saved = JSON.parse(localStorage.getItem("chatMessages") || "{}");
    const msgs = saved[selectedContact.name] || [];
    const index = msgs.findIndex(m => m.sender === sender && m.text === text && m.time === time);
    if (index > -1) {
        msgs.splice(index, 1);
        saved[selectedContact.name] = msgs;
        localStorage.setItem("chatMessages", JSON.stringify(saved));
        element.remove();
    }
}