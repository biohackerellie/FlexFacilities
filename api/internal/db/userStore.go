package db

const upsertUserQuery = `
INSERT INTO users (
    id, email, name, image, external_user, role, email_verified, provider
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (id)
DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    image = EXCLUDED.image,
    provider = EXCLUDED.provider,
    email_verified = EXCLUDED.email_verified,
    external_user = EXCLUDED.external_user,
    role = EXCLUDED.role;
`
