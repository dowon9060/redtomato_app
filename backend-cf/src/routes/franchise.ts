import { Hono } from "hono";
import type { Env } from "../lib/types";

const franchise = new Hono<{ Bindings: Env }>();

franchise.post("/inquiries", async (c) => {
  const body = await c.req.json<{
    name?: string;
    phone?: string;
    region?: string;
    message?: string;
  }>();
  const name = (body.name ?? "").trim();
  const phone = (body.phone ?? "").replace(/\D/g, "");
  const region = (body.region ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!name || phone.length < 10) {
    return c.json({ error: "이름과 연락처를 입력해 주세요." }, 400);
  }

  await c.env.DB.prepare(
    "INSERT INTO franchise_inquiries (name, phone, region, message) VALUES (?, ?, ?, ?)"
  )
    .bind(name, phone, region, message)
    .run();

  return c.json({
    ok: true,
    message: "입점 문의가 접수됐어요. 담당자가 연락드릴게요.",
  });
});

export default franchise;
