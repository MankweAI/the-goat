const express = require("express");
const { supabase } = require("../config/database");
const WhatsAppService = require("./services/whatsappService");
const WhatsAppController = require("./controllers/whatsappController");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
const whatsappService = new WhatsAppService();
const whatsappController = new WhatsAppController();

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("health_check")
      .select("status, created_at")
      .limit(1);

    if (error) throw error;

    const whatsappStatus = whatsappService.getStatus();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      whatsapp: whatsappStatus,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Health check error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// WhatsApp status endpoint
app.get("/whatsapp-status", (req, res) => {
  const status = whatsappService.getStatus();
  res.json({
    status: "whatsapp_status",
    timestamp: new Date().toISOString(),
    ...status,
  });
});

// Database data summary
app.get("/data-summary", async (req, res) => {
  try {
    const tables = [
      "classes",
      "topics",
      "questions",
      "lessons",
      "worked_examples",
      "users",
    ];
    const counts = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true });

      if (error) {
        counts[table] = { count: 0, error: error.message };
      } else {
        counts[table] = { count: count || 0 };
      }
    }

    res.json({
      status: "data_summary",
      timestamp: new Date().toISOString(),
      tables: counts,
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
    whatsapp: whatsappService.getStatus(),
    endpoints: [
      "GET / - This message",
      "GET /health - Health check with WhatsApp status",
      "GET /whatsapp-status - WhatsApp connection status",
      "GET /data-summary - Database content summary",
    ],
  });
});

// Initialize WhatsApp service
async function initializeServices() {
  try {
    console.log("🚀 Starting The GOAT services...");

    // Connect WhatsApp controller to service
    whatsappController.setMessageSender((to, text) =>
      whatsappService.sendMessage(to, text)
    );

    // Register message handler
    whatsappService.addMessageHandler((messageInfo) =>
      whatsappController.handleMessage(messageInfo)
    );

    // Initialize WhatsApp
    const whatsappReady = await whatsappService.initialize();

    if (whatsappReady) {
      console.log("✅ WhatsApp service ready");
    } else {
      console.log("⚠️ WhatsApp service failed to initialize");
    }
  } catch (error) {
    console.error("❌ Error initializing services:", error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 The GOAT server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🗄️  Database: ${
      process.env.SUPABASE_URL ? "Connected ✅" : "Not configured ❌"
    }`
  );
  console.log("\n🔗 Available endpoints:");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   WhatsApp: http://localhost:${PORT}/whatsapp-status`);
  console.log(`   Data: http://localhost:${PORT}/data-summary`);

  // Initialize services after server starts
  await initializeServices();
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await whatsappService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await whatsappService.disconnect();
  process.exit(0);
});
