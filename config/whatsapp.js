require("dotenv").config();

const whatsappConfig = {
  // Session configuration
  sessionName: process.env.WHATSAPP_SESSION_NAME || "the-goat-session",

  // Message configuration
  messageDelay: {
    min: parseInt(process.env.MESSAGE_DELAY_MIN) || 2000,
    max: parseInt(process.env.MESSAGE_DELAY_MAX) || 5000,
  },

  // Bot behavior
  maxRetries: 3,
  typingDuration: 2000,

  // File constraints
  maxImageSize: 50 * 1024, // 50KB

  // Session storage
  sessionPath: "./session",

  // Logging
  logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
};

module.exports = whatsappConfig;

