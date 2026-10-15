import { getStore } from "@netlify/blobs";

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async (req) => {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const admin = Netlify.env.get("ADMIN_KEY");
  if (!admin || key !== admin) return new Response("Forbidden", { status: 403 });

  const store = getStore("wedding-photos");
  const file = url.searchParams.get("file");
  if (file) {
    const data = await store.get(file, { type: "arrayBuffer" });
    if (!data) return new Response("Not found", { status: 404 });
    const headers = { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=3600" };
    if (url.searchParams.get("dl")) headers["Content-Disposition"] = `attachment; filename="${file}"`;
    return new Response(data, { headers });
  }

  const { blobs } = await store.list();
  const names = blobs.map((b) => b.key).sort().reverse();
  const q = "key=" + encodeURIComponent(key);
  const items = names.map((n) =>
    `<figure><a href="/admin?${q}&file=${encodeURIComponent(n)}" target="_blank"><img loading="lazy" src="/admin?${q}&file=${encodeURIComponent(n)}"></a>` +
    `<a class="d" href="/admin?${q}&file=${encodeURIComponent(n)}&dl=1">ჩამოტვირთვა</a></figure>`).join("");
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ფოტოები</title>
<style>body{font-family:system-ui,sans-serif;background:#faf8f3;color:#3c2828;margin:0;padding:20px}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}
figure{margin:0}img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:8px;display:block}
.d{display:block;text-align:center;font-size:13px;color:#96784a;padding:4px}</style>
<h2>სულ: ${names.length} ფოტო</h2><div class="g">${items}</div>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } });
};

export const config = { path: "/admin" };
