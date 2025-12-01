-- Consolidated initial migration reflecting all schema changes
-- This migration combines migrations 0001-0008 into a single file

-- Create ENUM types
CREATE TYPE reservation_date_approved AS ENUM (
    'pending',
    'approved',
    'denied',
    'canceled'
);

CREATE TYPE reservation_approved AS ENUM (
    'pending',
    'approved',
    'denied',
    'canceled'
);

CREATE TYPE user_role AS ENUM (
    'USER',
    'ADMIN',
    'STAFF',
    'GUEST'
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT NOT NULL PRIMARY KEY,
    name TEXT NOT NULL,
    image TEXT,
    email TEXT NOT NULL,
    email_verified timestamp(3) with time zone,
    password TEXT,
    provider TEXT,
    external_user boolean DEFAULT false NOT NULL,
    role user_role DEFAULT 'USER'::user_role NOT NULL,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    tos boolean DEFAULT false NOT NULL
);

-- Building table (created in migration 0002, coords added in 0007)
CREATE TABLE IF NOT EXISTS building (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    google_calendar_id TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

-- Facility table (building/address columns removed in 0004, building_id added in 0002)
CREATE TABLE IF NOT EXISTS facility (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    image_path TEXT,
    capacity BIGINT,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) with time zone,
    google_calendar_id TEXT NOT NULL,
    building_id BIGINT,
    CONSTRAINT fk_building_id FOREIGN KEY (building_id) REFERENCES building (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Pricing table for stripe integration
-- Based off of prices api, but includes product
-- each facility has at least 3 prices, one being free for staff so not on stripe
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT NOT NULL PRIMARY KEY, -- either price id from stripe or generated uuid. distinguishable by price_ prefix
  product_id TEXT NOT NULL, -- product id from stripe
  price DOUBLE PRECISION NOT NULL,
  category_id BIGINT NOT NULL, -- pricing category
  unit_label TEXT DEFAULT 'hour'::text NOT NULL,
);
-- Category table
CREATE TABLE IF NOT EXISTS category (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    facility_id BIGINT NOT NULL
);

-- Notifications table (modified in 0002 to reference building instead of facility)
CREATE TABLE IF NOT EXISTS notifications (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    building_id BIGINT NOT NULL,
    user_id TEXT NOT NULL,
    CONSTRAINT fk_building_id FOREIGN KEY (building_id) REFERENCES building (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Reservation table (modified in 0003 and 0008)
-- Removed: primary_contact, people, ticket_made, conflicts, payment_url
-- Added: rrule, rdates, exdates, gcal_eventid
CREATE TABLE IF NOT EXISTS reservation (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    facility_id BIGINT NOT NULL,
    approved reservation_approved DEFAULT 'pending'::reservation_approved NOT NULL,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) with time zone,
    details TEXT,
    fees numeric(15,4),
    insurance boolean NOT NULL,
    door_access boolean,
    doors_details TEXT,
    name TEXT,
    tech_details TEXT,
    tech_support boolean,
    phone TEXT,
    category_id BIGINT NOT NULL,
    total_hours double precision,
    in_person boolean DEFAULT false NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    payment_link_id TEXT,
    insurance_link TEXT,
    cost_override numeric(15,4),
    rrule TEXT,
    rdates timestamp without time zone[],
    exdates timestamp without time zone[],
    gcal_eventid TEXT,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_facility_id FOREIGN KEY (facility_id) REFERENCES facility (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Insurance files table
CREATE TABLE IF NOT EXISTS insurance_files (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_path TEXT,
    file_name TEXT,
    reservation_id BIGINT NOT NULL,
    varified boolean DEFAULT false NOT NULL,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Reservation date table
CREATE TABLE IF NOT EXISTS reservation_date (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    approved reservation_date_approved DEFAULT 'pending'::reservation_date_approved NOT NULL,
    gcal_eventid TEXT,
    local_start timestamp without time zone,
    local_end timestamp without time zone,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Reservation fees table
CREATE TABLE IF NOT EXISTS reservation_fees (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    additional_fees numeric(15,4),
    fees_type TEXT,
    reservation_id bigint NOT NULL,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Verification token table
CREATE TABLE IF NOT EXISTS verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires timestamp(3) with time zone
);

-- Sessions table (modified in 0002)
-- Removed: session_token, expires
-- Added: refresh_token, provider, created_at, expires_at
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    refresh_token TEXT,
    provider TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT (now()),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 day'),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE
);

-- Branding table (created in 0005, extended in 0006)
CREATE TABLE IF NOT EXISTS branding (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    organization_name TEXT NOT NULL,
    organization_logo_path TEXT NOT NULL,
    organization_primary_color TEXT,
    organization_secondary_color TEXT,
    organization_url TEXT,
    organization_description TEXT,
    organization_email TEXT
);

-- Create indexes
CREATE INDEX idx_30095_Category_facilityId_fkey ON category (facility_id);
CREATE INDEX idx_30115_InsuranceFiles_reservationId_fkey ON insurance_files (reservation_id);
CREATE INDEX idx_30126_Reservation_categoryId_fkey ON reservation (category_id);
CREATE INDEX idx_30126_Reservation_facilityId_fkey ON reservation (facility_id);
CREATE UNIQUE INDEX idx_30126_Reservation_paymentLinkID_key ON reservation (payment_link_id);
CREATE INDEX idx_30126_Reservation_userId_fkey ON reservation (user_id);
CREATE INDEX idx_30139_ReservationDate_reservationId_fkey ON reservation_date (reservation_id);
CREATE INDEX idx_30147_ReservationFees_reservationId_fkey ON reservation_fees (reservation_id);
CREATE INDEX idx_30151_Session_userId_fkey ON sessions (user_id);
CREATE UNIQUE INDEX idx_30156_User_email_key ON users (email);
CREATE UNIQUE INDEX idx_30165_VerificationToken_identifier_token_key ON verification_token (identifier, token);
CREATE UNIQUE INDEX idx_30165_VerificationToken_token_key ON verification_token (token);
CREATE INDEX idx_facility_building_idfk ON facility (building_id);
