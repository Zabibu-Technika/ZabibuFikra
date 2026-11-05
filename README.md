# ZabibuFikra — Fikra web and product hub

The Fikra model-family site, plus the public product hub linking Weaver, Zabibu Arif, and
Fikra.

## What is here

- `index.html`, `style.css`, `assets/` — the public hub linking Weaver, Zabibu Arif, and Fikra.
- `sites/fikra/` — the Fikra model-family site, deployed at
  <https://zabibufikra.vercel.app>. It sells the model that exists — Zabibu Fikra Model 1 –
  2B — and teases Fikra Model 2 and the Fikra Edge Runtime.

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
