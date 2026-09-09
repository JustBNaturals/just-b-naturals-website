CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  stock_count INTEGER CHECK (stock_count IS NULL OR stock_count >= 0),
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  availability_status TEXT NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available', 'preorder', 'unavailable')),
  available_date TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS restock_notifications (
  product_id TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notified_at TEXT,
  PRIMARY KEY (product_id, email)
);

INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('matcha-lavender-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('rosemary-sage-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lemon-rosemary-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('ember-ash-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('sweater-weather-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('coconut-lavender-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('whisper-citrus-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('charcoal-blush-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cedar-eucalyptus-loofah-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lemongrass-lavender-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('ylang-ylang-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('honey-oat-comfort-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('chocolate-pumpkin-pie-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('unscented-loofah-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('mint-eucalyptus-spa-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('spiced-banana-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cedar-lemon-soap', NULL, 800, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('mango-butter', NULL, 2500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('vanilla-infused-tallow', NULL, 2500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('unscented-tallow', NULL, 2500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-calm', NULL, 1500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-relieved', NULL, 1500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cycle-harmony', NULL, 1500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lavender-bloom-scrub', NULL, 2000, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('harvest-spa-scrub', NULL, 2000, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('vanilla-scrub', NULL, 2000, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-rested-room-spray', NULL, 1500, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('solid-dish-soap', NULL, 2000, 1);

