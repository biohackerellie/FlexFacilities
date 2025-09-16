ALTER TABLE facility
  DROP COLUMN building,
  DROP COLUMN address;

CREATE INDEX IF NOT EXISTS idx_facility_building_idfk ON facility (building_id);
