const express = require("express");
const path = require("path");
const session = require("express-session");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

require("dotenv").config();

const app = express();
const port = 3000;

// Google OAuth Client
const clientt = new OAuth2Client(
  "190022392096-5vl5tfqup2d8tdtgof9m68phhc8qh77u.apps.googleusercontent.com"
);

// Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  "https://askitindia.github.io",
  "https://shreynik00.github.io",  // ✅ Add this
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

// ✅ Google Login with Supabase
app.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await clientt.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const user = {
      google_id: payload.sub,
      username: payload.name,
      email: payload.email,
    };

    const { data: existingUsers, error: checkError } = await supabase
      .from("Login")
      .select("*")
      .eq("google_id", user.google_id);

    if (checkError) throw checkError;

    if (!existingUsers.length) {
      const { error: insertError } = await supabase
        .from("Login")
        .insert([user]);
      if (insertError) throw insertError;
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
