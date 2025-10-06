CREATE TABLE IF NOT EXISTS branding (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_name TEXT NOT NULL,
    organization_logo_path TEXT NOT NULL,
    organization_primary_color TEXT,
    organization_secondary_color TEXT
)
