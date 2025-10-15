ALTER TABLE reservation
  DROP COLUMN primary_contact,
  DROP COLUMN people,
  DROP COLUMN ticket_made,
  DROP COLUMN conflicts,
  ADD COLUMN rrule TEXT,
  ADD COLUMN rdates timestamp without time zone[],
  ADD COLUMN exdates timestamp without time zone[],
  ADD COLUMN gcal_eventid TEXT;
