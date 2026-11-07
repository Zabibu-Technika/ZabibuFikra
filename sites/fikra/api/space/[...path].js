export const config = { maxDuration: 60 };

const SPACE = "https://zabibutechnikaacc-fikra-model-2-demo.hf.space";

export default async function handler(req, res) {
  try {
    const raw = req.query.path ?? req.query["...path"];
    const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const target = new URL(`${SPACE}/${parts.join("/")}`);
    const incoming = new URL(req.url, `https://${req.headers.host}`);
    target.search = incoming.search;

    const headers = { ...req.headers };
    for (const name of [
      "host",
      "origin",
      "referer",
      "authorization",
      "cookie",
      "x-forwarded-for",
      "x-real-ip",
      "content-length",
    ]) {
      delete headers[name];
    }
    headers.authorization = `Bearer ${process.env.HF_TOKEN}`;

    const init = {
      method: req.method,
      headers,
      redirect: "manual",
    };

    if (!["GET", "HEAD"].includes(req.method)) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      init.body = Buffer.concat(chunks);
    }

    const upstream = await fetch(target, init);

    // Keep the Gradio client on this proxy so the HF token stays server-side.
    if (target.pathname === "/config") {
      const text = await upstream.text();
      try {
        const json = JSON.parse(text);
        json.root = `https://${req.headers.host}/api/space`;
        res.status(upstream.status);
        res.setHeader("content-type", "application/json");
        res.setHeader("cache-control", "no-store");
        res.send(JSON.stringify(json));
        return;
      } catch {
        res.status(upstream.status);
        res.setHeader("content-type", "application/json");
        res.send(text);
        return;
      }
    }

    res.status(upstream.status);
    upstream.headers.forEach((value, name) => {
      if (!["content-encoding", "content-length"].includes(name)) {
        res.setHeader(name, value);
      }
    });
    res.setHeader("cache-control", "no-store");

    if (upstream.body) {
      for await (const chunk of upstream.body) {
        res.write(chunk);
      }
    }
    res.end();
  } catch (err) {
    res.status(502).send(`Upstream error: ${err && err.message ? err.message : err}`);
  }
}
