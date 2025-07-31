import { OAuth2Client } from "google-auth-library";

let client: OAuth2Client;

export const getClient = () => {
  if (client) {
    return client;
  }
  client = new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
  });
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return client;
};
