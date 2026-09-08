CREATE TABLE IF NOT EXISTS inventory (
  product_id TEXT PRIMARY KEY,
  stock_count INTEGER CHECK (stock_count IS NULL OR stock_count >= 0),
  price_cents INTEGER CHECK (price_cents IS NULL OR price_cents >= 0),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('matcha-lavender-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('rosemary-sage-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lemon-rosemary-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('ember-ash-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('sweater-weather-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('coconut-lavender-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('whisper-citrus-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('charcoal-blush-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cedar-eucalyptus-loofah-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lemongrass-lavender-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('ylang-ylang-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('honey-oat-comfort-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('chocolate-pumpkin-pie-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('unscented-loofah-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('mint-eucalyptus-spa-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('spiced-banana-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cedar-lemon-soap', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('mango-butter', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('vanilla-infused-tallow', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('unscented-tallow', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-calm', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-relieved', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('cycle-harmony', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('lavender-bloom-scrub', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('harvest-spa-scrub', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('vanilla-scrub', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('just-b-rested-room-spray', NULL, NULL, 1);
INSERT OR IGNORE INTO inventory (product_id, stock_count, price_cents, is_active) VALUES ('solid-dish-soap', NULL, NULL, 1);
