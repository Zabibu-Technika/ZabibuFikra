/* Fikra — assets page copy buttons */

async function copyText(text, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1500);
  } catch (err) {
    window.prompt("Copy this text", text);
  }
}

document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", () => {
    copyText(button.dataset.copy || "", button);
  });
});

document.querySelectorAll("[data-copy-target]").forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.querySelector(button.dataset.copyTarget || "");
    if (target) copyText(target.textContent.trim(), button);
  });
});
