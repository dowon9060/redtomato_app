import { Hono } from "hono";
import { requireAuth, type Variables } from "../lib/auth";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABEL,
  type Env,
  type OrderStatus,
} from "../lib/types";

const orders = new Hono<{ Bindings: Env; Variables: Variables }>();

type OrderItemInput = {
  menuId: string;
  menuName: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  options?: Array<{ id: string; name: string; price: number }>;
};

function mapOrder(
  order: Record<string, unknown>,
  items: Array<Record<string, unknown>>,
  storeName?: string
) {
  const status = order.status as OrderStatus;
  return {
    id: order.id,
    storeId: order.store_id,
    storeName: storeName ?? null,
    status,
    statusLabel: ORDER_STATUS_LABEL[status] ?? status,
    statusFlow: ORDER_STATUS_FLOW.map((s) => ({
      key: s,
      label: ORDER_STATUS_LABEL[s],
      done:
        ORDER_STATUS_FLOW.indexOf(s) <=
        ORDER_STATUS_FLOW.indexOf(status as (typeof ORDER_STATUS_FLOW)[number]),
      current: s === status,
    })),
    totalPrice: order.total_price,
    requestNote: order.request_note,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: items.map((it) => ({
      id: it.id,
      menuId: it.menu_id,
      menuName: it.menu_name,
      size: it.size,
      unitPrice: it.unit_price,
      quantity: it.quantity,
      options: JSON.parse(String(it.options_json || "[]")),
    })),
  };
}

orders.use("*", requireAuth);

orders.get("/", async (c) => {
  const user = c.get("user");
  const rows = await c.env.DB.prepare(
    `SELECT o.*, s.name as store_name
     FROM orders o JOIN stores s ON s.id = o.store_id
     WHERE o.user_id = ?
     ORDER BY o.created_at DESC`
  )
    .bind(user.id)
    .all();

  const result = [];
  for (const order of rows.results ?? []) {
    const items = await c.env.DB.prepare(
      "SELECT * FROM order_items WHERE order_id = ?"
    )
      .bind(order.id)
      .all();
    result.push(
      mapOrder(
        order as Record<string, unknown>,
        (items.results ?? []) as Array<Record<string, unknown>>,
        String(order.store_name)
      )
    );
  }
  return c.json({ orders: result });
});

orders.get("/:id", async (c) => {
  const user = c.get("user");
  const order = await c.env.DB.prepare(
    `SELECT o.*, s.name as store_name
     FROM orders o JOIN stores s ON s.id = o.store_id
     WHERE o.id = ? AND o.user_id = ?`
  )
    .bind(c.req.param("id"), user.id)
    .first();
  if (!order) return c.json({ error: "주문을 찾을 수 없어요." }, 404);
  const items = await c.env.DB.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  )
    .bind(order.id)
    .all();
  return c.json({
    order: mapOrder(
      order as Record<string, unknown>,
      (items.results ?? []) as Array<Record<string, unknown>>,
      String(order.store_name)
    ),
  });
});

orders.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    storeId?: number;
    items?: OrderItemInput[];
    requestNote?: string;
  }>();

  const storeId = Number(body.storeId);
  const items = body.items ?? [];
  if (!storeId || items.length === 0) {
    return c.json({ error: "주문할 메뉴와 지점을 확인해 주세요." }, 400);
  }

  const store = await c.env.DB.prepare("SELECT id, name, is_open FROM stores WHERE id = ?")
    .bind(storeId)
    .first<{ id: number; name: string; is_open: number }>();
  if (!store) return c.json({ error: "지점을 찾을 수 없어요." }, 404);
  if (!store.is_open) {
    return c.json({ error: "지금은 영업 중이 아닌 지점이에요." }, 400);
  }

  let total = 0;
  for (const item of items) {
    if (!item.menuId || !item.menuName || item.quantity < 1) {
      return c.json({ error: "주문 항목이 올바르지 않아요." }, 400);
    }
    const optionSum = (item.options ?? []).reduce((sum, o) => sum + (o.price || 0), 0);
    total += (item.unitPrice + optionSum) * item.quantity;
  }

  const orderId = crypto.randomUUID();
  await c.env.DB.prepare(
    `INSERT INTO orders (id, user_id, store_id, status, total_price, request_note)
     VALUES (?, ?, ?, 'ordered', ?, ?)`
  )
    .bind(orderId, user.id, storeId, total, body.requestNote ?? "")
    .run();

  await c.env.DB.prepare(
    "INSERT INTO order_status_logs (order_id, status, note) VALUES (?, 'ordered', '포장 주문이 접수됐어요.')"
  )
    .bind(orderId)
    .run();

  for (const item of items) {
    await c.env.DB.prepare(
      `INSERT INTO order_items (order_id, menu_id, menu_name, size, unit_price, quantity, options_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        orderId,
        item.menuId,
        item.menuName,
        item.size ?? "",
        item.unitPrice,
        item.quantity,
        JSON.stringify(item.options ?? [])
      )
      .run();
  }

  // 포인트 적립 (결제 금액의 1%)
  const earned = Math.floor(total * 0.01);
  if (earned > 0) {
    await c.env.DB.prepare(
      "UPDATE users SET points = points + ?, updated_at = datetime('now') WHERE id = ?"
    )
      .bind(earned, user.id)
      .run();
  }

  const created = await c.env.DB.prepare(
    `SELECT o.*, s.name as store_name FROM orders o JOIN stores s ON s.id = o.store_id WHERE o.id = ?`
  )
    .bind(orderId)
    .first();
  const createdItems = await c.env.DB.prepare(
    "SELECT * FROM order_items WHERE order_id = ?"
  )
    .bind(orderId)
    .all();

  return c.json(
    {
      order: mapOrder(
        created as Record<string, unknown>,
        (createdItems.results ?? []) as Array<Record<string, unknown>>,
        store.name
      ),
      earnedPoints: earned,
    },
    201
  );
});

export default orders;
