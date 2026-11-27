import { Hono } from "hono";
import { mapMenu } from "../lib/menuMapper";
import type { Env } from "../lib/types";
import { verifyToken } from "../lib/auth";

const catalog = new Hono<{ Bindings: Env }>();

async function likedSet(db: D1Database, userId: string | null, type: "menu" | "store") {
  if (!userId) return new Set<string>();
  const rows = await db
    .prepare(
      "SELECT target_id FROM favorites WHERE user_id = ? AND target_type = ?"
    )
    .bind(userId, type)
    .all<{ target_id: string }>();
  return new Set((rows.results ?? []).map((r) => r.target_id));
}

async function optionalUserId(c: { req: { header: (n: string) => string | undefined }; env: Env }) {
  const header = c.req.header("Authorization");
  if (!header?.startsWith("Bearer ")) return null;
  const verified = await verifyToken(c.env.JWT_SECRET, header.slice(7));
  return verified?.sub ?? null;
}

catalog.get("/banners", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id, title, subtitle, image_key, link_type, link_value FROM banners WHERE is_active = 1 ORDER BY sort_order ASC"
  ).all();
  return c.json({
    banners: (rows.results ?? []).map((b) => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      imageKey: b.image_key,
      linkType: b.link_type,
      linkValue: b.link_value,
    })),
  });
});

catalog.get("/stores", async (c) => {
  const userId = await optionalUserId(c);
  const liked = await likedSet(c.env.DB, userId, "store");
  const rows = await c.env.DB.prepare(
    "SELECT * FROM stores ORDER BY sort_order ASC, id ASC"
  ).all();
  return c.json({
    stores: (rows.results ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      phone: s.phone,
      hours: s.hours,
      holiday: s.holiday,
      lat: s.lat,
      lng: s.lng,
      isOpen: Boolean(s.is_open),
      liked: liked.has(String(s.id)),
    })),
  });
});

catalog.get("/stores/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const store = await c.env.DB.prepare("SELECT * FROM stores WHERE id = ?")
    .bind(id)
    .first();
  if (!store) return c.json({ error: "지점을 찾을 수 없어요." }, 404);
  const userId = await optionalUserId(c);
  const liked = await likedSet(c.env.DB, userId, "store");
  return c.json({
    store: {
      id: store.id,
      name: store.name,
      address: store.address,
      phone: store.phone,
      hours: store.hours,
      holiday: store.holiday,
      lat: store.lat,
      lng: store.lng,
      isOpen: Boolean(store.is_open),
      liked: liked.has(String(store.id)),
    },
  });
});

catalog.get("/menu-groups", async (c) => {
  const rows = await c.env.DB.prepare(
    "SELECT id, label, category FROM menu_groups ORDER BY sort_order ASC"
  ).all();
  return c.json({
    groups: (rows.results ?? []).map((g) => ({
      id: g.id,
      label: g.label,
      category: g.category,
    })),
  });
});

catalog.get("/menus", async (c) => {
  const groupId = c.req.query("groupId");
  const userId = await optionalUserId(c);
  const liked = await likedSet(c.env.DB, userId, "menu");

  const menusQuery = groupId
    ? c.env.DB.prepare(
        `SELECT m.*, g.label as group_label, g.category as category
         FROM menus m JOIN menu_groups g ON g.id = m.group_id
         WHERE m.group_id = ? AND m.is_available = 1
         ORDER BY m.sort_order ASC`
      ).bind(groupId)
    : c.env.DB.prepare(
        `SELECT m.*, g.label as group_label, g.category as category
         FROM menus m JOIN menu_groups g ON g.id = m.group_id
         WHERE m.is_available = 1
         ORDER BY g.sort_order ASC, m.sort_order ASC`
      );

  const menus = await menusQuery.all();
  const prices = await c.env.DB.prepare("SELECT menu_id, size, price FROM menu_prices").all();
  const options = await c.env.DB.prepare(
    "SELECT id, menu_id, name, price, is_required, sort_order FROM menu_options"
  ).all();

  return c.json({
    menus: (menus.results ?? []).map((m) =>
      mapMenu(
        m as never,
        (prices.results ?? []) as never,
        (options.results ?? []) as never,
        liked.has(String((m as { id: string }).id))
      )
    ),
  });
});

catalog.get("/menus/:id", async (c) => {
  const id = c.req.param("id");
  const menu = await c.env.DB.prepare(
    `SELECT m.*, g.label as group_label, g.category as category
     FROM menus m JOIN menu_groups g ON g.id = m.group_id
     WHERE m.id = ?`
  )
    .bind(id)
    .first();
  if (!menu) return c.json({ error: "메뉴를 찾을 수 없어요." }, 404);
  const prices = await c.env.DB.prepare(
    "SELECT menu_id, size, price FROM menu_prices WHERE menu_id = ?"
  )
    .bind(id)
    .all();
  const options = await c.env.DB.prepare(
    "SELECT id, menu_id, name, price, is_required, sort_order FROM menu_options WHERE menu_id = ? ORDER BY sort_order ASC"
  )
    .bind(id)
    .all();
  const userId = await optionalUserId(c);
  const liked = await likedSet(c.env.DB, userId, "menu");
  return c.json({
    menu: mapMenu(
      menu as never,
      (prices.results ?? []) as never,
      (options.results ?? []) as never,
      liked.has(id)
    ),
  });
});

export default catalog;
