const express = require("express");
const { supabase } = require("../config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Enhanced health check with actual database query
app.get("/health", async (req, res) => {
  try {
    // Test actual database connection
    const { data, error } = await supabase
      .from("health_check")
      .select("status, created_at")
      .limit(1);

    if (error) {
      throw error;
    }

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      supabase_url: process.env.SUPABASE_URL ? "configured" : "missing",
      test_query: data ? "success" : "no_data",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
      database: "disconnected",
    });
  }
});

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "🐐 The GOAT WhatsApp EdTech MVP",
    version: "1.0.0",
    status: "running",
    endpoints: [
      "GET / - This message",
      "GET /health - Health check with database test",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 The GOAT server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🗄️  Database URL: ${
      process.env.SUPABASE_URL ? "Configured ✅" : "Not configured ❌"
    }`
  );
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Main page: http://localhost:${PORT}/`);
});

