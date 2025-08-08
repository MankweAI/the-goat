const express = require("express");
const { supabase } = require("../config/database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

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

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      environment: process.env.NODE_ENV,
      test_query: data ? "success" : "no_data",
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

// Database data summary
app.get("/data-summary", async (req, res) => {
  try {
    const tables = [
      "classes",
      "topics",
      "questions",
      "lessons",
      "worked_examples",
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

// Get topics hierarchy
app.get("/topics", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("topics")
      .select("*")
      .order("level", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) throw error;

    // Organize by hierarchy
    const hierarchy = {};
    data.forEach((topic) => {
      if (!hierarchy[topic.level]) {
        hierarchy[topic.level] = [];
      }
      hierarchy[topic.level].push({
        code: topic.code,
        title: topic.title,
        parent_id: topic.parent_id,
        level: topic.level,
      });
    });

    res.json({
      status: "topics_loaded",
      total_topics: data.length,
      hierarchy: hierarchy,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Get sample questions for a topic
app.get("/questions/:topicCode", async (req, res) => {
  try {
    const { topicCode } = req.params;

    // First get topic ID
    const { data: topicData, error: topicError } = await supabase
      .from("topics")
      .select("id, title")
      .eq("code", topicCode)
      .single();

    if (topicError) throw topicError;

    // Get questions for this topic
    const { data: questions, error: questionError } = await supabase
      .from("questions")
      .select("*")
      .eq("topic_id", topicData.id);

    if (questionError) throw questionError;

    res.json({
      status: "questions_loaded",
      topic: topicData.title,
      total_questions: questions.length,
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
        difficulty: q.difficulty,
      })),
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Test class access
app.get("/test-class/:classCode", async (req, res) => {
  try {
    const { classCode } = req.params;

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("class_code", classCode)
      .single();

    if (error) {
      return res.status(404).json({
        status: "class_not_found",
        class_code: classCode,
        message: "Invalid class code",
      });
    }

    res.json({
      status: "class_found",
      class: {
        code: data.class_code,
        name: data.class_name,
        subject: data.subject,
        enrollment: `${data.current_enrollment}/${data.max_students}`,
        active: data.is_active,
      },
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
      "GET /health - Health check",
      "GET /data-summary - Database content summary",
      "GET /topics - Topics hierarchy",
      "GET /questions/:topicCode - Questions for specific topic",
      "GET /test-class/:classCode - Test class code validation",
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 The GOAT server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV}`);
  console.log(
    `🗄️  Database: ${
      process.env.SUPABASE_URL ? "Connected ✅" : "Not configured ❌"
    }`
  );
  console.log("\n🔗 Available endpoints:");
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Data: http://localhost:${PORT}/data-summary`);
  console.log(`   Topics: http://localhost:${PORT}/topics`);
  console.log(`   Questions: http://localhost:${PORT}/questions/CHAIN-RULE`);
  console.log(
    `   Class test: http://localhost:${PORT}/test-class/M12-ALPHA-2025`
  );
});
