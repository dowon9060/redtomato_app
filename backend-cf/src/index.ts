import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Env } from "./lib/types";
import auth from "./routes/auth";
import catalog from "./routes/catalog";
import favorites from "./routes/favorites";
import orders from "./routes/orders";
import franchise from "./routes/franchise";
import admin from "./routes/admin";

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "X-Admin-Key"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
  })
);

app.get("/", (c) =>
  c.json({
    name: c.env.APP_NAME,
    ok: true,
  })
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", auth);
app.route("/", catalog);
app.route("/favorites", favorites);
app.route("/orders", orders);
app.route("/franchise", franchise);
app.route("/admin", admin);

app.notFound((c) => c.json({ error: "요청한 경로를 찾을 수 없어요." }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "잠시 후 다시 시도해 주세요." }, 500);
});

export default app;
