require("dotenv").config(); // <-- Add this line at the top

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const { OAuth2Client } = require("google-auth-library");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

app.use(express.json());
const corsOptions = {
  origin: "https://shreynik00.github.io",  // your GitHub Pages origin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));


app.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    const googleId = payload.sub;

    // Upsert user into Supabase
    const { error } = await supabase.from("users").upsert({
      email,
      username: name,
      google_id: googleId,
    });

    if (error) throw error;

    res.json({ success: true, message: "User saved", user: { email, name } });
  } catch (error) {
    console.error("Google login failed:", error);
    res.status(401).json({ success: false, message: "Login failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
