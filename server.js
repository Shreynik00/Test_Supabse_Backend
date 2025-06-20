require("dotenv").config();

const express = require("express");
const { createClient } = require("@supabase/supabase-js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(express.json());

// CORS for GitHub Pages
const corsOptions = {
  origin: "https://shreynik00.github.io", // GitHub Pages origin
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));

// Route: Accept Google login data directly (unsafe)
app.post("/google-login", async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    // Save to Supabase
    const { error } = await supabase.from("users").upsert({
      email,
      username: name,
      google_id: googleId,
    });

    if (error) throw error;

    res.json({ success: true, message: "User saved", user: { email, name } });
  } catch (error) {
    console.error("Supabase upsert error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
