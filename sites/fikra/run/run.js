/* Fikra — run-it-locally guide */

const STORAGE_KEY = "fikra-run-progress-v1";

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch (err) {
    return {};
  }
}

function saveProgress(value) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (err) {
    /* private mode or storage disabled */
  }
}

const progress = readProgress();
const tabs = [...document.querySelectorAll('[role="tab"][data-os]')];
const panels = [...document.querySelectorAll("[data-os-panel]")];

function activate(os, focus = false) {
  tabs.forEach((tab) => {
    const active = tab.dataset.os === os;
    tab.setAttribute("aria-selected", active ? "true" : "false");
    tab.tabIndex = active ? 0 : -1;
    if (active && focus) tab.focus();
  });

  panels.forEach((panel) => {
    panel.hidden = panel.dataset.osPanel !== os;
  });
}

function detectOS() {
  const ua = navigator.userAgent;
  if (/Android/i.test(ua)) return "android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return navigator.maxTouchPoints > 1 ? "ios" : "macos";
  }
  if (/Windows/i.test(ua)) return "windows";
  if (/Linux/i.test(ua)) return "linux";
  return "windows";
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activate(tab.dataset.os));

  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    let next = index;
    if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;

    activate(tabs[next].dataset.os, true);
  });
});

function updatePanel(panel) {
  if (!panel) return;

  const boxes = [...panel.querySelectorAll("[data-step]")];
  const done = boxes.filter((box) => box.checked).length;
  const percent = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
  const bar = panel.querySelector("[data-bar]");
  const count = panel.querySelector("[data-count]");

  if (bar) bar.style.width = `${percent}%`;
  if (count) count.textContent = `${done} of ${boxes.length} steps`;
}

document.querySelectorAll("[data-step]").forEach((box) => {
  if (progress[box.dataset.step]) box.checked = true;

  box.addEventListener("change", () => {
    progress[box.dataset.step] = box.checked;
    saveProgress(progress);
    updatePanel(box.closest("[data-os-panel]"));
  });
});

panels.forEach(updatePanel);

document.querySelectorAll("[data-reset]").forEach((button) => {
  button.addEventListener("click", () => {
    const panel = button.closest("[data-os-panel]");
    if (!panel) return;

    panel.querySelectorAll("[data-step]").forEach((box) => {
      box.checked = false;
      delete progress[box.dataset.step];
    });

    saveProgress(progress);
    updatePanel(panel);
  });
});

const copyButton = document.getElementById("copy-run-link");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const url = "https://zabibufikra.vercel.app/run/";
    try {
      await navigator.clipboard.writeText(url);
      copyButton.textContent = "Copied";
    } catch (err) {
      window.prompt("Copy this link", url);
    }
  });
}

activate(detectOS());
