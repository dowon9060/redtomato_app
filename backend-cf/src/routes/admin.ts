import { Hono } from "hono";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  type Env,
  type OrderStatus,
} from "../lib/types";

const admin = new Hono<{ Bindings: Env }>();

/** 간단한 관리자 키 (헤더 X-Admin-Key). 운영 시 시크릿으로 교체. */
function assertAdmin(c: { req: { header: (n: string) => string | undefined }; env: Env }) {
  const key = c.req.header("X-Admin-Key");
  return key === "redtomato-admin-dev" || key === c.env.JWT_SECRET;
}

admin.get("/orders", async (c) => {
  if (!assertAdmin(c)) return c.json({ error: "권한이 없어요." }, 403);
  const status = c.req.query("status");
  const query = status
    ? c.env.DB.prepare(
        `SELECT o.*, s.name as store_name, u.nickname as user_nickname, u.phone as user_phone
         FROM orders o
         JOIN stores s ON s.id = o.store_id
         JOIN users u ON u.id = o.user_id
         WHERE o.status = ?
         ORDER BY o.created_at DESC`
      ).bind(status)
    : c.env.DB.prepare(
        `SELECT o.*, s.name as store_name, u.nickname as user_nickname, u.phone as user_phone
         FROM orders o
         JOIN stores s ON s.id = o.store_id
         JOIN users u ON u.id = o.user_id
         ORDER BY o.created_at DESC
         LIMIT 100`
      );
  const rows = await query.all();
  return c.json({
    orders: (rows.results ?? []).map((o) => ({
      id: o.id,
      storeName: o.store_name,
      userNickname: o.user_nickname,
      userPhone: o.user_phone,
      status: o.status,
      statusLabel: ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status,
      totalPrice: o.total_price,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
    })),
  });
});

admin.patch("/orders/:id/status", async (c) => {
  if (!assertAdmin(c)) return c.json({ error: "권한이 없어요." }, 403);
  const body = await c.req.json<{ status?: OrderStatus; note?: string }>();
  const next = body.status;
  if (!next || !ORDER_STATUS_LABEL[next]) {
    return c.json({ error: "주문 상태가 올바르지 않아요." }, 400);
  }

  const order = await c.env.DB.prepare("SELECT * FROM orders WHERE id = ?")
    .bind(c.req.param("id"))
    .first<{ id: string; status: OrderStatus }>();
  if (!order) return c.json({ error: "주문을 찾을 수 없어요." }, 404);

  if (next !== "cancelled") {
    const curIdx = ORDER_STATUS_FLOW.indexOf(order.status);
    const nextIdx = ORDER_STATUS_FLOW.indexOf(next);
    if (nextIdx < 0 || nextIdx < curIdx) {
      return c.json({ error: "이전 단계로는 되돌릴 수 없어요." }, 400);
    }
  }

  await c.env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(next, order.id)
    .run();
  await c.env.DB.prepare(
    "INSERT INTO order_status_logs (order_id, status, note) VALUES (?, ?, ?)"
  )
    .bind(order.id, next, body.note ?? ORDER_STATUS_LABEL[next])
    .run();

  return c.json({
    ok: true,
    status: next,
    statusLabel: ORDER_STATUS_LABEL[next],
  });
});

admin.get("/franchise-inquiries", async (c) => {
  if (!assertAdmin(c)) return c.json({ error: "권한이 없어요." }, 403);
  const rows = await c.env.DB.prepare(
    "SELECT * FROM franchise_inquiries ORDER BY created_at DESC LIMIT 100"
  ).all();
  return c.json({ inquiries: rows.results ?? [] });
});

export default admin;
