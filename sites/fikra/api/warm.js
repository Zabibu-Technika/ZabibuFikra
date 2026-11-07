export const config = { maxDuration: 30 };

const SPACE = "https://zabibutechnikaacc-fikra-model-2-demo.hf.space";

export default async function handler(req, res) {
  try {
    const upstream = await fetch(`${SPACE}/config`, {
      headers: { authorization: `Bearer ${process.env.HF_TOKEN}` },
    });
    res.status(200).json({ ok: upstream.ok, status: upstream.status });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
}
