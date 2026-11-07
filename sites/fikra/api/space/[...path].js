export const config = { runtime: "edge" };

const SPACE = "https://zabibutechnikaacc-fikra-model-2-demo.hf.space";

export default async function handler(request, context) {
  const url = new URL(request.url);
  const raw = context.params.path;
  const parts = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const target = new URL(`${SPACE}/${parts.join("/")}`);
  target.search = url.search;

  const headers = new Headers(request.headers);
  for (const name of [
    "host",
    "origin",
    "referer",
    "authorization",
    "cookie",
    "x-forwarded-for",
    "x-real-ip",
  ]) {
    headers.delete(name);
  }
  headers.set("authorization", `Bearer ${process.env.HF_TOKEN}`);

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (!["GET", "HEAD"].includes(request.method)) {
    init.body = await request.arrayBuffer();
  }

  let upstream;
  try {
    upstream = await fetch(target, init);
  } catch (err) {
    return new Response(`Upstream error: ${err.message}`, { status: 502 });
  }

  // The Gradio client sends every queue request to config.root.
  // Keep it on this proxy so the HF token is never exposed to the browser.
  if (target.pathname === "/config") {
    const text = await upstream.text();
    try {
      const json = JSON.parse(text);
      json.root = `${url.origin}/api/space`;
      return new Response(JSON.stringify(json), {
        status: upstream.status,
        headers: {
          "content-type": "application/json",
          "cache-control": "no-store",
        },
      });
    } catch {
      return new Response(text, {
        status: upstream.status,
        headers: { "content-type": "application/json" },
      });
    }
  }

  const out = new Headers(upstream.headers);
  out.delete("content-encoding");
  out.delete("content-length");
  out.set("cache-control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
