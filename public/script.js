const socket = io();
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const chatContainer = document.getElementById("chat-container");
const loginScreen = document.getElementById("login-screen");
const usernameInput = document.getElementById("username-input");
const joinBtn = document.getElementById("join-btn");

let username = "";
let lastSender = null; // last message sender
let lastMessageElement = null; // last message bubble element

// Login process
joinBtn.addEventListener("click", () => {
  const name = usernameInput.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }
  username = name;
  socket.emit("new user", username);
  loginScreen.classList.add("hidden");
  chatContainer.classList.remove("hidden");
});

// Send message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = input.value.trim();
  if (!msg) return;

  const msgData = {
    user: username,
    text: msg,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  addMessage(msgData, true);
  socket.emit("chat message", msgData);
  input.value = "";
});

// Receive message
socket.on("chat message", (data) => {
  if (data.user !== username) {
    addMessage(data, false);
  }
});

// Notify join
socket.on("user joined", (user) => {
  const notice = document.createElement("li");
  notice.classList.add("notice");
  notice.textContent = `${user} joined the chat`;
  messages.appendChild(notice);
  messages.scrollTop = messages.scrollHeight;
  lastSender = null;
});

// Notify leave
socket.on("user left", (user) => {
  const notice = document.createElement("li");
  notice.classList.add("notice");
  notice.textContent = `${user} left the chat`;
  messages.appendChild(notice);
  messages.scrollTop = messages.scrollHeight;
  lastSender = null;
});

function addMessage(data, self) {
  // if same user continues, remove timestamp from previous bubble
  if (lastSender === data.user && lastMessageElement) {
    const oldTime = lastMessageElement.querySelector(".timestamp");
    if (oldTime) oldTime.remove();
  }

  const li = document.createElement("li");
  li.classList.add("message-container", self ? "self" : "other");

  // Only show name if sender changed
  const showName = data.user !== lastSender;
  if (showName) {
    const nameTag = document.createElement("div");
    nameTag.classList.add("username");
    nameTag.textContent = data.user;
    li.appendChild(nameTag);
  }

  const msgBubble = document.createElement("div");
  msgBubble.classList.add("message-bubble");
  msgBubble.textContent = data.text;

  const timeTag = document.createElement("div");
  timeTag.classList.add("timestamp");
  timeTag.textContent = data.time;

  li.appendChild(msgBubble);
  li.appendChild(timeTag);

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;

  lastSender = data.user;
  lastMessageElement = li; // save current as last
}
