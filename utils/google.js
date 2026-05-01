const { google } = require("googleapis");

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const redirectUri =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`;

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

const getGoogleAuthUrl = (role, action) => {
  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: ["openid", "email", "profile"],
    state: JSON.stringify({ role, action }),
  });
};

const getGoogleUser = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  const ticket = await oauth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: clientId,
  });
  const payload = ticket.getPayload();
  return {
    email: payload.email,
    name: payload.name || `${payload.given_name || ""} ${payload.family_name || ""}`.trim(),
    firstName: payload.given_name || "",
    lastName: payload.family_name || "",
    googleId: payload.sub,
  };
};

module.exports = {
  getGoogleAuthUrl,
  getGoogleUser,
};
