// Techxy AI frontend: shows the chat and sends messages to our backend.
const app = document.querySelector(".app");
const messagesEl = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");

let history = []; // the conversation so far: { role: "user" | "assistant", content: "..." }

function addMessage(text, kind) {
  const div = document.createElement("div");
  div.className = "msg " + kind;
  div.textContent = text; // textContent keeps it safe from injected HTML
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return div;
}

async function sendMessage(text) {
  app.classList.add("chatting");
  addMessage(text, "user");
  history.push({ role: "user", content: text });

  const thinking = addMessage("Thinking…", "bot thinking");
  sendBtn.disabled = true;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong.");
    thinking.className = "msg bot";
    thinking.textContent = data.reply;
    history.push({ role: "assistant", content: data.reply });
  } catch (err) {
    thinking.className = "msg bot error";
    thinking.textContent = err.message;
    history.pop(); // remove the failed question so the next try works
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text || sendBtn.disabled) return;
  input.value = "";
  sendMessage(text);
});

document.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    input.value = chip.dataset.prompt;
    input.focus();
  });
});

document.getElementById("newChat").addEventListener("click", () => {
  history = [];
  messagesEl.innerHTML = "";
  app.classList.remove("chatting");
  input.focus();
});