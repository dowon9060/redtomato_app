import { Hono } from "hono";
import { createToken, requireAuth, type Variables } from "../lib/auth";
import type { Env } from "../lib/types";

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

auth.post("/login", async (c) => {
  const body = await c.req.json<{
    phone?: string;
    name?: string;
    nickname?: string;
  }>();
  const phone = (body.phone ?? "").replace(/\D/g, "");
  const name = (body.name ?? "").trim();
  const nickname = (body.nickname ?? "").trim();

  if (phone.length < 10 || !name || !nickname) {
    return c.json(
      { error: "이름, 닉네임, 연락처를 모두 입력해 주세요." },
      400
    );
  }

  const existing = await c.env.DB.prepare(
    "SELECT id, phone, name, nickname, points FROM users WHERE phone = ?"
  )
    .bind(phone)
    .first<{
      id: string;
      phone: string;
      name: string;
      nickname: string;
      points: number;
    }>();

  let user = existing;
  if (!user) {
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO users (id, phone, name, nickname, points) VALUES (?, ?, ?, ?, 0)"
    )
      .bind(id, phone, name, nickname)
      .run();
    user = { id, phone, name, nickname, points: 0 };
  } else {
    await c.env.DB.prepare(
      "UPDATE users SET name = ?, nickname = ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(name, nickname, user.id)
      .run();
    user = { ...user, name, nickname };
  }

  const token = await createToken(c.env.JWT_SECRET, user.id);
  return c.json({ token, user });
});

auth.get("/me", requireAuth, async (c) => {
  return c.json({ user: c.get("user") });
});

auth.patch("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ name?: string; nickname?: string; phone?: string }>();
  const name = (body.name ?? user.name).trim();
  const nickname = (body.nickname ?? user.nickname).trim();
  const phone = (body.phone ?? user.phone).replace(/\D/g, "");
  if (!name || !nickname || phone.length < 10) {
    return c.json({ error: "프로필 정보가 올바르지 않아요." }, 400);
  }
  await c.env.DB.prepare(
    "UPDATE users SET name = ?, nickname = ?, phone = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(name, nickname, phone, user.id)
    .run();
  return c.json({
    user: { ...user, name, nickname, phone },
  });
});

export default auth;
