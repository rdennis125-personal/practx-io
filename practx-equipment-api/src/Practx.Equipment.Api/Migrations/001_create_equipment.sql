CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    location TEXT NULL,
    manufacturer TEXT NULL,
    model TEXT NULL,
    installed_date TEXT NULL,
    status TEXT NOT NULL,
    next_service_date TEXT NULL,
    monitoring_telemetry INTEGER NOT NULL DEFAULT 0,
    monitoring_maintenance INTEGER NOT NULL DEFAULT 0,
    monitoring_safety INTEGER NOT NULL DEFAULT 0,
    spend_ytd REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment (status);
CREATE INDEX IF NOT EXISTS idx_equipment_next_service ON equipment (next_service_date);
CREATE INDEX IF NOT EXISTS idx_equipment_spend_ytd ON equipment (spend_ytd);
