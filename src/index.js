const express = require("express");
const { supabase } = require("../config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Enhanced health check with schema verification
app.get("/health", async (req, res) => {
  try {
    // Test connection with our new tables
    const { data, error } = await supabase.from("classes").select("*").limit(1);

    if (error && !error.message.includes("no rows")) {
      throw error;
    }

    // Count total tables
    const { data: tables, error: tableError } = await supabase.rpc("exec", {
      sql: `
        SELECT COUNT(*) as table_count 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      `,
    });

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      schema_test: "passed",
      tables_accessible: error ? "some_restrictions" : "full_access",
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
      database: "connection_failed",
    });
  }
});

// New endpoint to check database schema
app.get("/schema", async (req, res) => {
  try {
    // Get table list
    const tables = [
      "classes",
      "users",
      "topics",
      "questions",
      "user_progress",
      "practice_sessions",
      "question_attempts",
      "challenges",
      "lessons",
      "worked_examples",
    ];

    const tableStatus = {};

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*", { count: "exact", head: true });

        tableStatus[table] = {
          exists: !error,
          accessible: !error,
          error: error?.message || null,
        };
      } catch (err) {
        tableStatus[table] = {
          exists: false,
          accessible: false,
          error: err.message,
        };
      }
    }

    res.json({
      status: "schema_check",
      timestamp: new Date().toISOString(),
      tables: tableStatus,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
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
      "GET /schema - Database schema verification",
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
  console.log(`🔗 Schema check: http://localhost:${PORT}/schema`);
});
