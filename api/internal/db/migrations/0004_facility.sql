ALTER TABLE facility
  DROP COLUMN IF EXISTS building,
  DROP COLUMN IF EXISTS address;

CREATE INDEX IF NOT EXISTS idx_facility_building_idfk ON facility (building_id);

