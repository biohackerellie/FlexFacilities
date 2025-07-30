import type { AdapterAccount } from "next-auth/adapters";
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  bigserial,
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgSchema,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const key_status = pgEnum("key_status", [
  "default",
  "valid",
  "invalid",
  "expired",
]);
export const key_type = pgEnum("key_type", [
  "aead-ietf",
  "aead-det",
  "hmacsha512",
  "hmacsha256",
  "auth",
  "shorthash",
  "generichash",
  "kdf",
  "secretbox",
  "secretstream",
  "stream_xchacha20",
]);
export const factor_type = pgEnum("factor_type", ["totp", "webauthn"]);
export const factor_status = pgEnum("factor_status", [
  "unverified",
  "verified",
]);
export const aal_level = pgEnum("aal_level", ["aal1", "aal2", "aal3"]);
export const code_challenge_method = pgEnum("code_challenge_method", [
  "s256",
  "plain",
]);
export const Reservation_approved = pgEnum("Reservation_approved", [
  "pending",
  "approved",
  "denied",
  "canceled",
]);
export const ReservationDate_approved = pgEnum("ReservationDate_approved", [
  "pending",
  "approved",
  "denied",
  "canceled",
]);
export const User_role = pgEnum("User_role", [
  "CAL_ADMIN",
  "ADMIN_ADMIN",
  "GR_ADMIN",
  "LHS_ADMIN",
  "LMS_ADMIN",
  "WE_ADMIN",
  "SO_ADMIN",
  "SUP_ADMIN",
  "USER",
]);

export type UserRole =
  | "CAL_ADMIN"
  | "ADMIN_ADMIN"
  | "GR_ADMIN"
  | "LHS_ADMIN"
  | "LMS_ADMIN"
  | "WE_ADMIN"
  | "SO_ADMIN"
  | "SUP_ADMIN"
  | "USER";

export const facilities_db = pgSchema("facilities_db");
export const pgTable = pgTableCreator((name) => `facilities_db_${name}`);
export const ReservationFees = facilities_db.table(
  "ReservationFees",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    additionalFees: doublePrecision("additionalFees"),
    feesType: varchar("feesType", { length: 191 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reservationId: bigint("reservationId", { mode: "number" })
      .notNull()
      .references(() => Reservation.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      idx_30147_ReservationFees_reservationId_fkey: index(
        "idx_30147_ReservationFees_reservationId_fkey",
      ).on(table.reservationId),
    };
  },
);

export const ReservationFeesSchema = createSelectSchema(ReservationFees);
export const ReserVationFeesArray = z.array(ReservationFeesSchema);
export type ReservationFeesType = z.infer<typeof ReservationFeesSchema>;
export const CreateReservationFeesSchema = createInsertSchema(ReservationFees, {
  additionalFees: z.number(),
  feesType: z.string().max(191),
  reservationId: z.number(),
}).omit({
  id: true,
});

export const ReservationFeesRelations = relations(
  ReservationFees,
  ({ one, many }) => ({
    Reservation: one(Reservation, {
      fields: [ReservationFees.reservationId],
      references: [Reservation.id],
    }),
  }),
);

export const Session = facilities_db.table(
  "session",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    sessionToken: varchar("sessionToken", { length: 191 }).notNull(),
    userId: varchar("userId", { length: 191 })
      .notNull()
      .references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" }),
    expires: timestamp("expires", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => {
    return {
      idx_30151_Session_userId_fkey: index("idx_30151_Session_userId_fkey").on(
        table.userId,
      ),
      idx_30151_Session_sessionToken_key: uniqueIndex(
        "idx_30151_Session_sessionToken_key",
      ).on(table.sessionToken),
    };
  },
);

export const SessionRelations = relations(Session, ({ one }) => ({
  User: one(User, {
    fields: [Session.userId],
    references: [User.id],
  }),
}));

export const Category = facilities_db.table(
  "Category",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    description: text("description").notNull(),
    price: doublePrecision("price").notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    facilityId: bigint("facilityId", { mode: "number" })
      .notNull()
      .references(() => Facility.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
  },
  (table) => {
    return {
      idx_30095_Category_facilityId_fkey: index(
        "idx_30095_Category_facilityId_fkey",
      ).on(table.facilityId),
    };
  },
);

export const CategorySchema = createSelectSchema(Category);
export const CategoryArray = z.array(CategorySchema);
export type CategoryType = z.infer<typeof CategorySchema>;

export const categoryRelations = relations(Category, ({ one, many }) => ({
  Facility: one(Facility, {
    fields: [Category.facilityId],
    references: [Facility.id],
  }),
  Reservation: many(Reservation),
}));

export const Events = facilities_db.table(
  "Events",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    calendarId: varchar("calendarId", { length: 191 }),
    title: varchar("title", { length: 191 }),
    start: timestamp("start", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
    end: timestamp("end", { precision: 3, withTimezone: true, mode: "string" }),
    location: varchar("location", { length: 191 }),
    recurringEventId: varchar("recurringEventId", { length: 191 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    facilityId: bigint("facilityId", { mode: "number" }).references(
      () => Facility.id,
      { onDelete: "cascade", onUpdate: "cascade" },
    ),
    placeholder: boolean("placeholder").default(false),
  },
  (table) => {
    return {
      idx_30101_Events_id_key: uniqueIndex("idx_30101_Events_id_key").on(
        table.id,
      ),
      idx_30101_Events_facilityId_fkey: index(
        "idx_30101_Events_facilityId_fkey",
      ).on(table.facilityId),
    };
  },
);

export const EventsSchema = createSelectSchema(Events);
export const EventsArray = z.array(EventsSchema);
export type EventsType = z.infer<typeof EventsSchema>;
export const CreateEventsSchema = createInsertSchema(Events, {
  calendarId: z.string().max(191),
  title: z.string().max(191),
  start: z.string(),
  end: z.string(),
  location: z.string().max(191),
  recurringEventId: z.string().max(191),
  facilityId: z.number(),
  placeholder: z.boolean(),
}).omit({
  id: true,
});

export const eventsRelations = relations(Events, ({ one, many }) => ({
  Facility: one(Facility, {
    fields: [Events.facilityId],
    references: [Facility.id],
  }),
}));

export const InsuranceFiles = facilities_db.table(
  "InsuranceFiles",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    path: varchar("path", { length: 191 }),
    fileName: varchar("fileName", { length: 191 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reservationId: bigint("reservationId", { mode: "number" })
      .notNull()
      .references(() => Reservation.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    varified: boolean("varified").default(false).notNull(),
  },
  (table) => {
    return {
      idx_30115_InsuranceFiles_reservationId_fkey: index(
        "idx_30115_InsuranceFiles_reservationId_fkey",
      ).on(table.reservationId),
    };
  },
);

export const InsuranceFilesSchema = createSelectSchema(InsuranceFiles);
export const InsuranceFilesArray = z.array(InsuranceFilesSchema);
export type InsuranceFilesType = z.infer<typeof InsuranceFilesSchema>;
export const CreateInsuranceFilesSchema = createInsertSchema(InsuranceFiles, {
  path: z.string().max(191),
  fileName: z.string().max(191),
  reservationId: z.number(),
  varified: z.boolean(),
}).omit({
  id: true,
});

export const accounts = facilities_db.table(
  "account",
  {
    id: varchar("id", { length: 191 }).primaryKey().notNull(),
    userId: varchar("userId", { length: 191 })
      .notNull()
      .references(() => User.id, { onDelete: "cascade", onUpdate: "cascade" }),
    type: varchar("type", { length: 191 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 191 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 191 }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 191 }),
    scope: varchar("scope", { length: 191 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 191 }),
    ext_expires_in: integer("ext_expires_in"),
  },
  (account) => {
    return {
      idx_30089_Account_userId_fkey: index("idx_30089_Account_userId_fkey").on(
        account.userId,
      ),
      idx_30089_Account_provider_providerAccountId_key: uniqueIndex(
        "idx_30089_Account_provider_providerAccountId_key",
      ).on(account.provider, account.providerAccountId),
    };
  },
);

export const AccountRelations = relations(accounts, ({ one }) => ({
  User: one(User, {
    fields: [accounts.userId],
    references: [User.id],
  }),
}));
export const EmailNotifications = facilities_db.table("EmailNotifications", {
  id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
  email: varchar("email", { length: 191 }).notNull(),
  HsEmails: boolean("HsEmails").default(false).notNull(),
  MsEmails: boolean("MsEmails").default(false).notNull(),
  GrEmails: boolean("GrEmails").default(false).notNull(),
  WeEmails: boolean("WeEmails").default(false).notNull(),
  SoEmails: boolean("SoEmails").default(false).notNull(),
  StEmails: boolean("StEmails").default(false).notNull(),
  AdminEmails: boolean("AdminEmails").default(false).notNull(),
});

export const EmailNotificationsSchema = createSelectSchema(EmailNotifications);
export const EmailNotificationsArray = z.array(EmailNotificationsSchema);
export type EmailNotificationsType = z.infer<typeof EmailNotificationsSchema>;
export const UpdateEmailNotificationsSchema = createInsertSchema(
  EmailNotifications,
  {
    id: z.number().min(1),
    email: z.string().max(191).optional,
    HsEmails: z.boolean().optional,
    MsEmails: z.boolean().optional,
    GrEmails: z.boolean().optional,
    WeEmails: z.boolean().optional,
    SoEmails: z.boolean().optional,
    StEmails: z.boolean().optional,
  },
);
export const CreateEmailNotificationsSchema = createInsertSchema(
  EmailNotifications,
  {
    email: z.string().max(191),
    HsEmails: z.boolean().optional,
    MsEmails: z.boolean().optional,
    GrEmails: z.boolean().optional,
    WeEmails: z.boolean().optional,
    SoEmails: z.boolean().optional,
    StEmails: z.boolean().optional,
  },
).omit({
  id: true,
});
export const CreateEmailNotificationsArray = z.array(
  CreateEmailNotificationsSchema,
);

export const Reservation = facilities_db.table(
  "Reservation",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    userId: varchar("userId", { length: 191 })
      .notNull()
      .references(() => User.id, { onDelete: "restrict", onUpdate: "cascade" }),
    eventName: varchar("eventName", { length: 191 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    facilityId: bigint("facilityId", { mode: "number" })
      .notNull()
      .references(() => Facility.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    approved: Reservation_approved("approved").default("pending").notNull(),
    createdAt: timestamp("createdAt", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updatedAt", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
    details: varchar("details", { length: 2000 }),
    fees: doublePrecision("fees"),
    insurance: boolean("insurance").notNull(),
    primaryContact: varchar("primaryContact", { length: 191 }),
    doorAccess: boolean("doorAccess"),
    doorsDetails: varchar("doorsDetails", { length: 191 }),
    name: varchar("name", { length: 191 }),
    people: varchar("people", { length: 191 }),
    techDetails: varchar("techDetails", { length: 191 }),
    techSupport: boolean("techSupport"),
    phone: varchar("phone", { length: 191 }),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    categoryId: bigint("categoryId", { mode: "number" })
      .notNull()
      .references(() => Category.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    totalHours: doublePrecision("totalHours"),
    inPerson: boolean("inPerson").default(false).notNull(),
    paid: boolean("paid").default(false).notNull(),
    paymentUrl: varchar("paymentUrl", { length: 191 }),
    paymentLinkID: varchar("paymentLinkID", { length: 191 }),
    ticketMade: boolean("ticketMade").default(false).notNull(),
    conflicts: boolean("conflicts").default(false).notNull(),
    insuranceLink: varchar("insuranceLink", { length: 191 }),
    costOverride: doublePrecision("costOverride"),
  },
  (table) => {
    return {
      idx_30126_Reservation_userId_fkey: index(
        "idx_30126_Reservation_userId_fkey",
      ).on(table.userId),
      idx_30126_Reservation_paymentLinkID_key: uniqueIndex(
        "idx_30126_Reservation_paymentLinkID_key",
      ).on(table.paymentLinkID),
      idx_30126_Reservation_facilityId_fkey: index(
        "idx_30126_Reservation_facilityId_fkey",
      ).on(table.facilityId),
      idx_30126_Reservation_categoryId_fkey: index(
        "idx_30126_Reservation_categoryId_fkey",
      ).on(table.categoryId),
    };
  },
);

export const ReservationSchema = createSelectSchema(Reservation);
export const ReservationArray = z.array(ReservationSchema);
export type ReservationType = z.infer<typeof ReservationSchema>;
export const CreateReservationSchema = createInsertSchema(Reservation, {
  userId: z.string().max(191),
  eventName: z.string().max(191),
  facilityId: z.number(),
  details: z.string().max(2000),
  fees: z.number(),
  insurance: z.boolean(),
  doorAccess: z.boolean(),
  doorsDetails: z.string().max(191),
  name: z.string().max(191),
  techDetails: z.string().max(191),
  techSupport: z.boolean(),
  phone: z.string().max(191),
  categoryId: z.number(),
}).omit({
  id: true,
  createdAt: true,
  approved: true,
  primaryContact: true,
  people: true,
  totalHours: true,
  inPerson: true,
  paid: true,
  paymentUrl: true,
  paymentLinkID: true,
  ticketMade: true,
  conflicts: true,
  insuranceLink: true,
  costOverride: true,
});

export const reservationRelations = relations(Reservation, ({ one, many }) => ({
  Facility: one(Facility, {
    fields: [Reservation.facilityId],
    references: [Facility.id],
  }),
  Category: one(Category, {
    fields: [Reservation.categoryId],
    references: [Category.id],
  }),
  ReservationDate: many(ReservationDate),
  User: one(User, {
    fields: [Reservation.userId],
    references: [User.id],
  }),
  ReservationFees: many(ReservationFees),
}));

export const ReservationDate = facilities_db.table(
  "ReservationDate",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    startDate: varchar("startDate", { length: 191 }).notNull(),
    endDate: varchar("endDate", { length: 191 }).notNull(),
    startTime: varchar("startTime", { length: 191 }).notNull(),
    endTime: varchar("endTime", { length: 191 }).notNull(),
    // You can use { mode: "bigint" } if numbers are exceeding js number limitations
    reservationId: bigint("reservationId", { mode: "number" })
      .notNull()
      .references(() => Reservation.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    approved: ReservationDate_approved("approved").default("pending").notNull(),
    gcal_eventid: varchar("gcal_eventid").references(() => Events.id, {
      onUpdate: "cascade",
    }),
  },
  (table) => {
    return {
      idx_30139_ReservationDate_reservationId_fkey: index(
        "idx_30139_ReservationDate_reservationId_fkey",
      ).on(table.reservationId),
    };
  },
);

export const ReservationDateSchema = createSelectSchema(ReservationDate);
export const ReservationDateArray = z.array(ReservationDateSchema);
export type ReservationDateType = z.infer<typeof ReservationDateSchema>;
export const CreateReservationDateSchema = createInsertSchema(ReservationDate, {
  startDate: z.string().max(191),
  endDate: z.string().max(191),
  startTime: z.string().max(191),
  endTime: z.string().max(191),
  reservationId: z.number(),
}).omit({
  id: true,
  approved: true,
  gcal_eventid: true,
});
export const CreateReservationDateArray = z.array(CreateReservationDateSchema);

export const reservationDateRelations = relations(
  ReservationDate,
  ({ one, many }) => ({
    Reservation: one(Reservation, {
      fields: [ReservationDate.reservationId],
      references: [Reservation.id],
    }),
  }),
);

export const Facility = facilities_db.table(
  "Facility",
  {
    id: bigserial("id", { mode: "number" }).primaryKey().notNull(),
    name: varchar("name", { length: 191 }).notNull(),
    building: varchar("building", { length: 191 }).notNull(),
    address: varchar("address", { length: 191 }).notNull(),
    imagePath: varchar("imagePath", { length: 191 }),
    capacity: integer("capacity"),
    createdAt: timestamp("createdAt", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    updatedAt: timestamp("updatedAt", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
    googleCalendarId: varchar("googleCalendarId", { length: 191 }).notNull(),
  },
  (table) => {
    return {
      idx_30107_Facility_name_key: uniqueIndex(
        "idx_30107_Facility_name_key",
      ).on(table.name),
      idx_30107_Facility_calendarId_key: uniqueIndex(
        "idx_30107_Facility_calendarId_key",
      ).on(table.googleCalendarId),
    };
  },
);

export const FacilitySchema = createSelectSchema(Facility);
export const FacilityArray = z.array(FacilitySchema);
export const insertFacilitySchema = createInsertSchema(Facility, {
  name: z.string().max(191),
  building: z.string().max(191),
  address: z.string().max(191),
  imagePath: z.string().max(191),
  capacity: z.number().max(2000).min(0),
  googleCalendarId: z.string().max(191),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateFacilitySchema = insertFacilitySchema.extend({
  category1: z.number().nullable(),
  category2: z.number().nullable(),
  category3: z.number().nullable(),
});

export type FacilityType = z.infer<typeof FacilitySchema>;

export const facilityRelations = relations(Facility, ({ one, many }) => ({
  Category: many(Category),
  Events: many(Events),
  Reservation: many(Reservation),
}));

export const User = facilities_db.table(
  "user",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .notNull()
      .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 191 }).notNull(),
    image: varchar("image", { length: 191 }),
    email: varchar("email", { length: 191 }).notNull(),
    emailVerified: timestamp("emailVerified", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
    password: varchar("password", { length: 191 }),
    provider: varchar("provider", { length: 191 }),
    externalUser: boolean("externalUser").default(false).notNull(),

    role: User_role("role").default("USER").notNull(),
    createdAt: timestamp("createdAt", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }).defaultNow(),
    tos: boolean("tos").default(false).notNull(),
  },
  (table) => {
    return {
      idx_30156_User_email_key: uniqueIndex("idx_30156_User_email_key").on(
        table.email,
      ),
    };
  },
);
export const CreateUserSchema = createInsertSchema(User);
export type CreateUserType = z.infer<typeof CreateUserSchema>;
export const UserSchema = createSelectSchema(User);
export const UserArray = z.array(UserSchema);
export type UserType = z.infer<typeof UserSchema>;

export const UserRelations = relations(User, ({ one, many }) => ({
  Reservation: many(Reservation),
  Account: one(accounts, {
    fields: [User.id],
    references: [accounts.userId],
  }),
  Session: one(Session, {
    fields: [User.id],
    references: [Session.userId],
  }),
}));

export const VerificationToken = facilities_db.table(
  "VerificationToken",
  {
    identifier: varchar("identifier", { length: 191 }).notNull(),
    token: varchar("token", { length: 191 }).notNull(),
    expires: timestamp("expires", {
      precision: 3,
      withTimezone: true,
      mode: "string",
    }),
  },
  (table) => {
    return {
      idx_30165_VerificationToken_identifier_token_key: uniqueIndex(
        "idx_30165_VerificationToken_identifier_token_key",
      ).on(table.identifier, table.token),
      idx_30165_VerificationToken_token_key: uniqueIndex(
        "idx_30165_VerificationToken_token_key",
      ).on(table.token),
    };
  },
);

export const _prisma_migrations = facilities_db.table("_prisma_migrations", {
  id: varchar("id", { length: 36 }).primaryKey().notNull(),
  checksum: varchar("checksum", { length: 64 }).notNull(),
  finished_at: timestamp("finished_at", {
    precision: 3,
    withTimezone: true,
    mode: "string",
  }),
  migration_name: varchar("migration_name", { length: 255 }).notNull(),
  logs: text("logs"),
  rolled_back_at: timestamp("rolled_back_at", {
    precision: 3,
    withTimezone: true,
    mode: "string",
  }),
  started_at: timestamp("started_at", {
    precision: 3,
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
  applied_steps_count: integer("applied_steps_count").default(0).notNull(),
});
