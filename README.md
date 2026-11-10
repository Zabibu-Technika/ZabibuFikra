# ZabibuFikra — Fikra web and product hub

The Fikra model-family site, plus the public product hub linking Weaver, Zabibu Arif, and
Fikra.

## What is here

- `index.html`, `style.css`, `assets/` — the public hub linking Weaver, Zabibu Arif, and Fikra.
- `sites/fikra/` — the Fikra model-family site, deployed at
  <https://zabibufikra.vercel.app>. It sells the released Zabibu Fikra Model 2 – 4B,
  keeps Model 1 available, and teases the Fikra Edge Runtime.
- `sites/fikra/chat/` — the live demo at <https://zabibufikra.vercel.app/chat/>.
  Desktop and mobile both talk to Zabibu Fikra Model 2 – 4B through a public
  ZeroGPU Space (`zabibutechnikaacc/fikra-model-2-demo`). The model runs on the
  Space, not on the visitor's device. The same chat is embedded on the main page
  at `#chat`.
- `sites/fikra/run/` — the beginner offline guide at
  <https://zabibufikra.vercel.app/run/>. Windows, macOS, Linux, Android, and
  iPhone/iPad tabs, tick-off checklists, direct GGUF download links, offline
  testing, and troubleshooting.
- Brand assets live in `sites/fikra/assets/`: `brand-dark.png`, `brand-light.png`,
  `fikra-heart.svg`, and `fikra-heart-paper.svg`. The palette is red `#e8402a`,
  ink, paper, and grey.
- `sites/fikra/api/space.js` — the Vercel function that proxies `/api/space/*`
  to the Space with the `HF_TOKEN` environment variable. `api/warm.js` keeps the
  Space awake with a daily Vercel cron. Set `HF_TOKEN` in the Vercel project
  before deploying.

The product sites live with their products, not here:

| Product | Repository | Site |
|---|---|---|
| Weaver | <https://github.com/Zabibu-Technika/ZabibuWeaver> | `site/` → <https://zabibuweaver.vercel.app> |
| Zabibu Arif · Arif Agent | <https://github.com/Zabibu-Technika/ArifAgent> | `site/` → <https://arifagent.vercel.app> |
| Fikra | this repository | `sites/fikra/` → <https://zabibufikra.vercel.app> |

`zabibu.vercel.app` is the company site and is deployed separately from this repository.

## Deploy

Fikra:

```bash
cd sites/fikra
vercel --prod --yes --project zabibufikra
```

The hub is plain HTML/CSS with no build step. Serve the repository root, or deploy it as a
static project with root `.`.
