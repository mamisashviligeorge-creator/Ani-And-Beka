import { getStore } from "@netlify/blobs";

export default async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const type = req.headers.get("content-type") || "";
  if (!type.startsWith("image/")) return new Response("Only images", { status: 415 });
  const buf = await req.arrayBuffer();
  if (buf.byteLength === 0 || buf.byteLength > 5.8 * 1024 * 1024)
    return new Response("Bad size", { status: 413 });
  const key = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.jpg`;
  await getStore("wedding-photos").set(key, buf, { metadata: { type } });
  return Response.json({ ok: true });
};

export const config = { path: "/api/upload" };
