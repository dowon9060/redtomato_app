import { Hono } from "hono";
import { requireAuth, type Variables } from "../lib/auth";
import { mapMenu } from "../lib/menuMapper";
import type { Env } from "../lib/types";

const favorites = new Hono<{ Bindings: Env; Variables: Variables }>();

favorites.use("*", requireAuth);

favorites.get("/", async (c) => {
  const user = c.get("user");
  const type = c.req.query("type");

  const storeRows = await c.env.DB.prepare(
    `SELECT s.* FROM favorites f
     JOIN stores s ON CAST(s.id AS TEXT) = f.target_id
     WHERE f.user_id = ? AND f.target_type = 'store'
     ORDER BY f.created_at DESC`
  )
    .bind(user.id)
    .all();

  const mappedStores = (storeRows.results ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    phone: s.phone,
    hours: s.hours,
    holiday: s.holiday,
    isOpen: Boolean(s.is_open),
    liked: true,
  }));

  if (type === "store") {
    return c.json({ stores: mappedStores });
  }

  const menuFavs = await c.env.DB.prepare(
    `SELECT m.*, g.label as group_label, g.category as category
     FROM favorites f
     JOIN menus m ON m.id = f.target_id
     JOIN menu_groups g ON g.id = m.group_id
     WHERE f.user_id = ? AND f.target_type = 'menu'
     ORDER BY f.created_at DESC`
  )
    .bind(user.id)
    .all();

  const menuIds = (menuFavs.results ?? []).map((m) => (m as { id: string }).id);
  let prices: unknown[] = [];
  let options: unknown[] = [];
  if (menuIds.length) {
    const placeholders = menuIds.map(() => "?").join(",");
    prices =
      (
        await c.env.DB.prepare(
          `SELECT menu_id, size, price FROM menu_prices WHERE menu_id IN (${placeholders})`
        )
          .bind(...menuIds)
          .all()
      ).results ?? [];
    options =
      (
        await c.env.DB.prepare(
          `SELECT id, menu_id, name, price, is_required, sort_order FROM menu_options WHERE menu_id IN (${placeholders})`
        )
          .bind(...menuIds)
          .all()
      ).results ?? [];
  }

  const mappedMenus = (menuFavs.results ?? []).map((m) =>
    mapMenu(m as never, prices as never, options as never, true)
  );

  if (type === "menu") {
    return c.json({ menus: mappedMenus });
  }

  return c.json({ stores: mappedStores, menus: mappedMenus });
});

favorites.post("/toggle", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ targetType?: string; targetId?: string }>();
  const targetType = body.targetType;
  const targetId = String(body.targetId ?? "");
  if (!targetId || (targetType !== "menu" && targetType !== "store")) {
    return c.json({ error: "찜 대상이 올바르지 않아요." }, 400);
  }

  const existing = await c.env.DB.prepare(
    "SELECT id FROM favorites WHERE user_id = ? AND target_type = ? AND target_id = ?"
  )
    .bind(user.id, targetType, targetId)
    .first();

  if (existing) {
    await c.env.DB.prepare("DELETE FROM favorites WHERE id = ?")
      .bind(existing.id)
      .run();
    return c.json({ liked: false });
  }

  await c.env.DB.prepare(
    "INSERT INTO favorites (user_id, target_type, target_id) VALUES (?, ?, ?)"
  )
    .bind(user.id, targetType, targetId)
    .run();
  return c.json({ liked: true });
});

export default favorites;
