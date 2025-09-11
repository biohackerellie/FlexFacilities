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

CREATE TABLE IF NOT EXISTS facility (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    building TEXT NOT NULL,
    address TEXT NOT NULL,
    image_path TEXT,
    capacity BIGINT,
    created_at timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(3) with time zone,
    google_calendar_id TEXT NOT NULL
);



CREATE TABLE IF NOT EXISTS category (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DOUBLE PRECISION NOT NULL,
    facility_id BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    facility_id BIGINT NOT NULL,
    building TEXT NOT NULL,
    user_id TEXT NOT NULL,
    CONSTRAINT fk_facility_id FOREIGN KEY (facility_id) REFERENCES facility (id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
);


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
    primary_contact TEXT,
    door_access boolean,
    doors_details TEXT,
    name TEXT,
    people TEXT,
    tech_details TEXT,
    tech_support boolean,
    phone TEXT,
    category_id BIGINT NOT NULL,
    total_hours double precision,
    in_person boolean DEFAULT false NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    payment_url TEXT,
    payment_link_id TEXT,
    ticket_made boolean DEFAULT false NOT NULL,
    conflicts boolean DEFAULT false NOT NULL,
    insurance_link TEXT,
    cost_override numeric(15,4), 
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_facility_id FOREIGN KEY (facility_id) REFERENCES facility (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES category (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS insurance_files (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    file_path TEXT,
    file_name TEXT,
    reservation_id BIGINT NOT NULL,
    varified boolean DEFAULT false NOT NULL,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservation_date (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    approved reservation_date_approved DEFAULT 'pending'::reservation_date_approved NOT NULL,
    gcal_eventid TEXT,
    local_start timestamp without time zone,
    local_end timestamp without time zone,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
  );


  CREATE TABLE IF NOT EXISTS reservation_fees (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    additional_fees numeric(15,4),
    fees_type TEXT,
    reservation_id bigint NOT NULL,
    CONSTRAINT fk_reservation_id FOREIGN KEY (reservation_id) REFERENCES reservation (id) ON UPDATE CASCADE ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS verification_token (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL,
    expires timestamp(3) with time zone
  );


  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT NOT NULL PRIMARY KEY,
    session_token TEXT NOT NULL,
    user_id TEXT NOT NULL,
    expires timestamp(3) with time zone,
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users (id)
  );





CREATE INDEX idx_30095_Category_facilityId_fkey ON category (facility_id);

CREATE INDEX idx_30115_InsuranceFiles_reservationId_fkey ON insurance_files (reservation_id);



CREATE INDEX idx_30126_Reservation_categoryId_fkey ON reservation (category_id);



CREATE INDEX idx_30126_Reservation_facilityId_fkey ON reservation (facility_id);



CREATE UNIQUE INDEX idx_30126_Reservation_paymentLinkID_key ON reservation (payment_link_id);



CREATE INDEX idx_30126_Reservation_userId_fkey ON reservation (user_id);



CREATE INDEX idx_30139_ReservationDate_reservationId_fkey ON reservation_date  (reservation_id);



CREATE INDEX idx_30147_ReservationFees_reservationId_fkey ON reservation_fees (reservation_id);



CREATE UNIQUE INDEX idx_30151_Session_sessionToken_key ON sessions  (session_token);



CREATE INDEX idx_30151_Session_userId_fkey ON sessions (user_id);



CREATE UNIQUE INDEX idx_30156_User_email_key ON users (email);



CREATE UNIQUE INDEX idx_30165_VerificationToken_identifier_token_key ON verification_token (identifier, token);



CREATE UNIQUE INDEX idx_30165_VerificationToken_token_key ON verification_token (token);

