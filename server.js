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
    origin: 'https://shreynik00.github.io',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Route: Accept Google login data directly (unsafe)
app.post("/google-login", async (req, res) => {
  try {
    const { email, username, googleId } = req.body;

    if (!email || !username || !googleId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("users")
      .upsert({ email, username, google_id: googleId }, { onConflict: ['email'] });

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ success: false, message: "Database error", error: error.message });
    }

    res.json({ success: true, message: "User saved", user: data });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ success: false, message: "Unexpected server error", error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
