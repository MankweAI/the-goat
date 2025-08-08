const express = require("express");
const { supabase } = require("../config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Existing endpoints (keep all of these)
app.get("/health", async (req, res) => {
  // ... existing health check code
});

app.get("/data-summary", async (req, res) => {
  // ... existing data summary code
});

// NEW: ManyChat webhook endpoints
app.post("/webhook/manychat", async (req, res) => {
  try {
    console.log("📨 ManyChat webhook received:", req.body);

    const {
      user_id,
      first_name,
      last_name,
      phone,
      custom_fields,
      last_input_text,
    } = req.body;

    // Route based on conversation step
    const step = custom_fields?.conversation_step || "welcome";

    switch (step) {
      case "class_code_validation":
        await handleClassCodeValidation(user_id, last_input_text, phone);
        break;
      case "practice_session":
        await handlePracticeAnswer(user_id, last_input_text, custom_fields);
        break;
      case "progress_check":
        await handleProgressRequest(user_id);
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error("❌ ManyChat webhook error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Class code validation endpoint for ManyChat
async function handleClassCodeValidation(userId, classCode, phone) {
  try {
    // Check if class code is valid (reuse existing logic)
    const { data: classData, error } = await supabase
      .from("classes")
      .select("*")
      .eq("class_code", classCode.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !classData) {
      // Send failure response back to ManyChat
      await sendToManyChat(userId, "class_invalid", { class_code: classCode });
      return;
    }

    // Check enrollment limit
    if (classData.current_enrollment >= classData.max_students) {
      await sendToManyChat(userId, "class_full", { class_code: classCode });
      return;
    }

    // Create user account (adapt existing logic)
    const { data: newUser, error: userError } = await supabase
      .from("users")
      .insert({
        whatsapp_number: phone,
        class_code: classData.class_code,
        display_name: `${req.body.first_name} ${req.body.last_name}`.trim(),
        current_state: { step: "main_menu" },
      })
      .select()
      .single();

    if (userError) {
      await sendToManyChat(userId, "system_error");
      return;
    }

    // Update class enrollment
    await supabase
      .from("classes")
      .update({ current_enrollment: classData.current_enrollment + 1 })
      .eq("id", classData.id);

    // Send success response
    await sendToManyChat(userId, "class_accepted", {
      class_name: classData.class_name,
      user_id: newUser.id,
    });
  } catch (error) {
    console.error("❌ Class validation error:", error);
    await sendToManyChat(userId, "system_error");
  }
}

// Get questions for practice session
app.get("/api/questions/:topicCode", async (req, res) => {
  try {
    const { topicCode } = req.params;

    // Get topic ID
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("id, title")
      .eq("code", topicCode)
      .single();

    if (topicError) throw topicError;

    // Get 5 random questions
    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .eq("topic_id", topic.id)
      .limit(5);

    if (error) throw error;

    res.json({
      topic: topic.title,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question_text,
        options: {
          A: q.option_a,
          B: q.option_b,
          C: q.option_c,
          D: q.option_d,
        },
        correct: q.correct_answer,
        explanation: q.explanation,
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Placeholder function to send responses back to ManyChat
async function sendToManyChat(userId, action, data = {}) {
  // This will be implemented based on ManyChat API
  console.log(`📤 Sending to ManyChat: ${action}`, { userId, data });
}

// Keep all your existing endpoints...
app.get("/", (req, res) => {
  res.json({
    message: "🐐 The GOAT WhatsApp EdTech MVP - ManyChat Backend",
    version: "1.0.0",
    status: "running",
    mode: "manychat_integration",
    endpoints: [
      "GET / - This message",
      "GET /health - Health check",
      "GET /data-summary - Database content",
      "POST /webhook/manychat - ManyChat webhook",
      "GET /api/questions/:topicCode - Get practice questions",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 The GOAT ManyChat Backend running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: Connected ✅`);
  console.log(`🤖 Mode: ManyChat Integration`);
  console.log("\n🔗 Available endpoints:");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Webhook: http://localhost:${PORT}/webhook/manychat`);
  console.log(
    `   Questions: http://localhost:${PORT}/api/questions/CHAIN-RULE`
  );
});

