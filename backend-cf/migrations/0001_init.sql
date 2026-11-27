PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '11:00 – 23:00',
  holiday TEXT NOT NULL DEFAULT '연중무휴',
  lat REAL,
  lng REAL,
  is_open INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_groups (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES menu_groups(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL DEFAULT '',
  badge TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS menu_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  size TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_options (
  id TEXT PRIMARY KEY,
  menu_id TEXT NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  is_required INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'none',
  link_value TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('menu', 'store')),
  target_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  store_id INTEGER NOT NULL REFERENCES stores(id),
  status TEXT NOT NULL CHECK (
    status IN (
      'ordered',
      'accepted',
      'cooking',
      'ready',
      'picked_up',
      'cancelled'
    )
  ) DEFAULT 'ordered',
  total_price INTEGER NOT NULL,
  request_note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_id TEXT NOT NULL,
  menu_name TEXT NOT NULL,
  size TEXT NOT NULL DEFAULT '',
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  options_json TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS order_status_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS franchise_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_menus_group ON menus(group_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
