/* ============================================================
   Fikra Model 2 — live chat
   One module, mounted on [data-chat] containers. Works on the
   standalone chat page and the embedded chat section.
   ============================================================ */

const SPACE_ID = "zabibutechnikaacc/fikra-model-2-demo";
const SPACE_URL = "https://huggingface.co/spaces/zabibutechnikaacc/fikra-model-2-demo";
const GREETING =
  "Habari. I am Fikra Model 2 — a 4B on-device model built by Zabibu Technika in Nairobi. Ask me anything in English or Swahili.";

const finePointer = window.matchMedia("(pointer: fine)").matches;
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const isLocal = ["localhost", "127.0.0.1"].includes(window.location.hostname);

function resolveSpaceSrc(configured) {
  if (!configured) return SPACE_ID;
  if (configured.startsWith("/")) {
    // Local static servers do not host /api/space, so use the Space directly.
    return isLocal ? SPACE_ID : `${window.location.origin}${configured}`;
  }
  return configured;
}

function mountChat(root) {
  const log = root.querySelector("[data-chat-log]");
  const form = root.querySelector("[data-chat-form]");
  const input = root.querySelector("[data-chat-input]");
  const sendBtn = root.querySelector("[data-chat-send]");
  const statusEl = root.querySelector("[data-chat-status]");
  const suggestions = root.querySelector("[data-chat-suggestions]");
  const clearBtn = root.querySelector("[data-chat-clear]");

  if (!log || !form || !input || !sendBtn || !statusEl) return;

  const runHref = root.dataset.runHref || "../#run";
  const limitsHref = root.dataset.limitsHref || "#limits";
  const spaceSrc = resolveSpaceSrc(root.dataset.spaceSrc);

  let history = [];
  let client = null;
  let busy = false;

  function setStatus(text, state = "idle") {
    statusEl.textContent = text;
    statusEl.dataset.state = state;
  }

  function scrollLog() {
    requestAnimationFrame(() => {
      log.scrollTop = log.scrollHeight;
    });
  }

  function addMessage(role, text, { error = false } = {}) {
    const row = document.createElement("div");
    row.className = `msg msg-${role}`;

    const meta = document.createElement("span");
    meta.className = "msg-meta";
    meta.textContent = role === "user" ? "You" : "Fikra 4B";

    const bubble = document.createElement("div");
    bubble.className = error ? "bubble error" : "bubble";
    bubble.textContent = text;

    row.append(meta, bubble);
    log.append(row);
    scrollLog();
    return row;
  }

  function addTyping() {
    const row = document.createElement("div");
    row.className = "msg msg-bot";

    const meta = document.createElement("span");
    meta.className = "msg-meta";
    meta.textContent = "Fikra 4B";

    const bubble = document.createElement("div");
    bubble.className = "bubble typing";
    bubble.setAttribute("aria-label", "Fikra is typing");
    for (let i = 0; i < 3; i += 1) bubble.append(document.createElement("span"));

    row.append(meta, bubble);
    log.append(row);
    scrollLog();
    return row;
  }

  function removeFallback() {
    const existing = root.querySelector(".chat-fallback");
    if (existing) existing.remove();
  }

  function showFallback() {
    if (root.querySelector(".chat-fallback")) return;

    const box = document.createElement("div");
    box.className = "chat-fallback";

    const p = document.createElement("p");
    const strong = document.createElement("strong");
    strong.textContent = "Live demo paused. ";
    p.append(
      strong,
      document.createTextNode("The shared GPU quota is exhausted. Run Fikra locally instead.")
    );

    const actions = document.createElement("div");
    actions.className = "chat-fallback-actions";

    const links = [
      [runHref, "Run it locally", "btn btn-blue btn-sm"],
      [
        "https://huggingface.co/zabibutechnika/Fikra-Model-2-4B-GGUF",
        "Download GGUF",
        "btn btn-outline-dark btn-sm",
      ],
      [limitsHref, "Read the limits", "btn btn-outline-dark btn-sm"],
    ];

    for (const [href, label, className] of links) {
      const a = document.createElement("a");
      a.href = href;
      a.className = className;
      a.textContent = label;
      actions.append(a);
    }

    box.append(p, actions);
    statusEl.before(box);
    scrollLog();
  }

  function resetChat() {
    history = [];
    log.innerHTML = "";
    removeFallback();
    addMessage("bot", GREETING);
    setStatus(
      "Connects on your first message. The first reply can take up to two minutes while the Space wakes."
    );
  }

  function resizeInput() {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
  }

  async function ensureClient() {
    if (client) return client;

    setStatus("Connecting to the Fikra runtime…", "busy");
    const mod = await import(
      "https://cdn.jsdelivr.net/npm/@gradio/client@2.7.2/dist/index.min.js"
    );
    const Client = mod.Client || (mod.default && mod.default.Client) || mod.default;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        client = await Client.connect(spaceSrc);
        return client;
      } catch (err) {
        if (attempt === 3) throw err;
        setStatus(`Waking the model… retry ${attempt + 1} of 3`, "busy");
        await delay(4000);
      }
    }

    return client;
  }

  function friendlyError(err) {
    const text = String((err && err.message) || err || "");
    if (/quota|exceeded|limit/i.test(text)) {
      return "Daily GPU quota reached. Try again tomorrow, or run Fikra locally with llama.cpp.";
    }
    if (/timeout|timed out/i.test(text)) {
      return "The demo runtime timed out. It may still be waking up — wait a moment and try again.";
    }
    if (/connect|network|fetch|failed|503|starting|sleep/i.test(text)) {
      return "The demo runtime is waking up or unreachable. Wait a moment and try again.";
    }
    return "Something went wrong reaching the demo runtime. Try again, or run Fikra locally.";
  }

  async function send(text) {
    const trimmed = String(text || "").trim();
    if (!trimmed || busy) return;

    busy = true;
    sendBtn.disabled = true;
    input.value = "";
    resizeInput();

    removeFallback();
    addMessage("user", trimmed);

    const prior = history.slice();
    history.push({ role: "user", content: trimmed });

    const typing = addTyping();
    setStatus("Fikra is thinking…", "busy");

    try {
      const app = await ensureClient();
      setStatus("Generating on ZeroGPU…", "busy");

      const result = await app.predict("/chat", [trimmed, prior]);
      let reply = Array.isArray(result && result.data)
        ? result.data[0]
        : result && result.data;

      if (reply == null) reply = "";
      reply = String(reply).trim();

      typing.remove();
      if (!reply) {
        addMessage("bot", "I didn't catch that — could you rephrase?", { error: true });
        history.pop();
      } else {
        addMessage("bot", reply);
        history.push({ role: "assistant", content: reply });
        setStatus("Ready. This demo does not store your prompts.");
      }
    } catch (err) {
      typing.remove();
      history.pop();
      const message = friendlyError(err);
      addMessage("bot", message, { error: true });
      setStatus(message, "error");
      if (/quota|exceeded|limit/i.test(String((err && err.message) || err || ""))) {
        showFallback();
      }
    } finally {
      busy = false;
      sendBtn.disabled = false;
      if (finePointer) input.focus();
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send(input.value);
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  input.addEventListener("input", resizeInput);

  if (suggestions) {
    suggestions.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (button) send(button.textContent || "");
    });
  }

  if (clearBtn) clearBtn.addEventListener("click", resetChat);

  if (!log.querySelector(".msg")) addMessage("bot", GREETING);
  setStatus(
    "Connects on your first message. The first reply can take up to two minutes while the Space wakes."
  );

  return { reset: resetChat, send };
}

document.querySelectorAll("[data-chat]").forEach(mountChat);

/* Exposed for debugging in the console. */
window.fikra = { SPACE_ID, SPACE_URL };
