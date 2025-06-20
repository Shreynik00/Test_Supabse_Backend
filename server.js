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
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'https://shreynik00.github.io',  // Allow your GitHub Pages site
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allow specific HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'],  // Allow specific headers
    credentials: true  // Allow credentials if needed
}));

// Route: Accept Google login data directly (unsafe)
app.post("/google-login", async (req, res) => {
  const { email, username, googleId } = req.body;

  if (!email || !username || !googleId) {
    return res.status(400).json({ success: false, message: "Missing fields" });
  }

  try {
    const { error } = await supabase.from("users").upsert({
      email,
      username,
      google_id: googleId,
    });

    if (error) throw error;

    res.json({ success: true, message: "User saved", user: { email, username } });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
