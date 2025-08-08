const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
} = require("@whiskeysockets/baileys");
const QRCode = require("qrcode-terminal");
const pino = require("pino");
const fs = require("fs");
const path = require("path");
const whatsappConfig = require("../../config/whatsapp");

class WhatsAppService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.qrGenerated = false;
    this.authState = null;
    this.messageHandlers = [];

    // Create session directory if it doesn't exist
    if (!fs.existsSync(whatsappConfig.sessionPath)) {
      fs.mkdirSync(whatsappConfig.sessionPath, { recursive: true });
    }
  }

  async initialize() {
    try {
      console.log("🔄 Initializing WhatsApp connection...");

      // Setup authentication state
      const { state, saveCreds } = await useMultiFileAuthState(
        whatsappConfig.sessionPath
      );
      this.authState = { state, saveCreds };

      // Create socket with configuration
      this.socket = makeWASocket({
        auth: state,
        logger: pino({ level: whatsappConfig.logLevel }),
        printQRInTerminal: false, // We'll handle QR display ourselves
        browser: ["The GOAT EdTech", "Chrome", "1.0.0"],
        connectTimeoutMs: 60000,
        defaultQueryTimeoutMs: 60000,
        keepAliveIntervalMs: 30000,
        generateHighQualityLinkPreview: true,
      });

      this.setupEventHandlers();

      console.log("✅ WhatsApp service initialized");
      return true;
    } catch (error) {
      console.error("❌ WhatsApp initialization failed:", error);
      return false;
    }
  }

  setupEventHandlers() {
    // Connection state updates
    // Replace the connection.update handler with this improved version:
    this.socket.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;

      console.log("📡 Connection update:", { connection, isNewLogin });

      if (qr) {
        console.log("\n" + "=".repeat(50));
        console.log("📱 NEW QR CODE GENERATED");
        console.log("📱 Open WhatsApp > Menu > Linked Devices > Link Device");
        console.log("📱 Scan the QR code below:");
        console.log("=".repeat(50));

        QRCode.generate(qr, { small: true });

        console.log("=".repeat(50));
        console.log("⏰ QR Code expires in 20 seconds");
        console.log("🔄 New QR will generate automatically if this expires");
        console.log("=".repeat(50) + "\n");

        this.qrGenerated = true;

        // Reset QR flag after 20 seconds to allow new QR generation
        setTimeout(() => {
          this.qrGenerated = false;
        }, 20000);
      }

      if (connection === "close") {
        this.isConnected = false;
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log("🔌 Connection closed");
        console.log("📊 Status code:", statusCode);
        console.log("🔄 Should reconnect:", shouldReconnect);

        if (shouldReconnect) {
          console.log("⏳ Reconnecting in 5 seconds...");
          setTimeout(() => this.initialize(), 5000);
        } else {
          console.log("👋 Logged out - manual restart required");
        }
      } else if (connection === "open") {
        this.isConnected = true;
        this.qrGenerated = false;
        console.log("✅ WhatsApp connected successfully!");
        console.log(`📱 Bot number: ${this.socket.user?.id || "Unknown"}`);
        console.log("🎉 Ready to receive messages!");
      } else if (connection === "connecting") {
        console.log("🔄 Connecting to WhatsApp...");
      }
    });

    // Save credentials when updated
    this.socket.ev.on("creds.update", this.authState.saveCreds);

    // Handle incoming messages
    this.socket.ev.on("messages.upsert", async (messageUpdate) => {
      try {
        const messages = messageUpdate.messages || [];

        for (const message of messages) {
          // Skip if message is from bot itself or is a status update
          if (
            message.key.fromMe ||
            message.key.remoteJid === "status@broadcast"
          ) {
            continue;
          }

          await this.handleIncomingMessage(message);
        }
      } catch (error) {
        console.error("❌ Error handling message:", error);
      }
    });
  }

  async handleIncomingMessage(message) {
    try {
      // Extract message details
      const messageInfo = this.extractMessageInfo(message);

      if (!messageInfo.text) {
        // Handle non-text messages
        await this.sendMessage(
          messageInfo.from,
          "I can only respond to text messages. Please send text only."
        );
        return;
      }

      console.log(`📨 Message from ${messageInfo.from}: ${messageInfo.text}`);

      // Call all registered message handlers
      for (const handler of this.messageHandlers) {
        try {
          await handler(messageInfo);
        } catch (error) {
          console.error("❌ Message handler error:", error);
        }
      }
    } catch (error) {
      console.error("❌ Error processing message:", error);
    }
  }

  extractMessageInfo(message) {
    const messageType = Object.keys(message.message || {})[0];
    let text = "";

    // Extract text based on message type
    if (messageType === "conversation") {
      text = message.message.conversation;
    } else if (messageType === "extendedTextMessage") {
      text = message.message.extendedTextMessage.text;
    } else if (
      messageType === "imageMessage" &&
      message.message.imageMessage.caption
    ) {
      text = message.message.imageMessage.caption;
    }

    return {
      id: message.key.id,
      from: message.key.remoteJid,
      text: text.trim(),
      timestamp: message.messageTimestamp,
      messageType: messageType,
      isGroup: message.key.remoteJid.endsWith("@g.us"),
      participant: message.key.participant || message.key.remoteJid,
    };
  }

  async sendMessage(to, text, options = {}) {
    try {
      if (!this.isConnected) {
        console.log("⚠️ WhatsApp not connected, queuing message");
        return false;
      }

      // Add typing indicator
      if (options.typing !== false) {
        await this.socket.sendPresenceUpdate("composing", to);
        await this.delay(whatsappConfig.typingDuration);
        await this.socket.sendPresenceUpdate("paused", to);
      }

      // Add random delay to appear natural
      const delayTime = this.getRandomDelay();
      await this.delay(delayTime);

      // Send the message
      const result = await this.socket.sendMessage(to, { text });

      console.log(
        `📤 Sent to ${to}: ${text.substring(0, 50)}${
          text.length > 50 ? "..." : ""
        }`
      );
      return result;
    } catch (error) {
      console.error("❌ Failed to send message:", error);
      return false;
    }
  }

  async sendImage(to, imagePath, caption = "") {
    try {
      if (!this.isConnected) {
        console.log("⚠️ WhatsApp not connected, cannot send image");
        return false;
      }

      const imageBuffer = fs.readFileSync(imagePath);

      // Check file size
      if (imageBuffer.length > whatsappConfig.maxImageSize) {
        console.log(`⚠️ Image too large: ${imageBuffer.length} bytes`);
        return false;
      }

      const result = await this.socket.sendMessage(to, {
        image: imageBuffer,
        caption: caption,
      });

      console.log(`📷 Sent image to ${to}: ${caption}`);
      return result;
    } catch (error) {
      console.error("❌ Failed to send image:", error);
      return false;
    }
  }

  // Register message handler functions
  addMessageHandler(handler) {
    this.messageHandlers.push(handler);
  }

  // Remove message handler
  removeMessageHandler(handler) {
    const index = this.messageHandlers.indexOf(handler);
    if (index > -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  // Utility functions
  getRandomDelay() {
    const min = whatsappConfig.messageDelay.min;
    const max = whatsappConfig.messageDelay.max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Get connection status
  getStatus() {
    return {
      connected: this.isConnected,
      phoneNumber: this.socket?.user?.id || null,
      sessionExists: fs.existsSync(
        path.join(whatsappConfig.sessionPath, "creds.json")
      ),
    };
  }

  // Graceful shutdown
  async disconnect() {
    try {
      if (this.socket) {
        await this.socket.logout();
        this.socket = null;
        this.isConnected = false;
        console.log("✅ WhatsApp disconnected gracefully");
      }
    } catch (error) {
      console.error("❌ Error during disconnect:", error);
    }
  }
}

module.exports = WhatsAppService;
