const { supabaseAdmin } = require("../config/database");
require("dotenv").config();

const migrationSQL = `
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables in dependency order

-- 1. Classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_code VARCHAR(20) UNIQUE NOT NULL,
  class_name VARCHAR(100) NOT NULL,
  grade_level INTEGER NOT NULL,
  subject VARCHAR(50) NOT NULL,
  max_students INTEGER DEFAULT 40,
  current_enrollment INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  teacher_contact VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  whatsapp_number VARCHAR(20) UNIQUE NOT NULL,
  class_code VARCHAR(20) NOT NULL REFERENCES classes(class_code),
  display_name VARCHAR(100),
  onboarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  daily_reminder_enabled BOOLEAN DEFAULT TRUE,
  current_state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Topics table (hierarchical)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES topics(id),
  code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  subject VARCHAR(50) NOT NULL,
  paper_number INTEGER,
  level INTEGER NOT NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A','B','C','D')) NOT NULL,
  explanation TEXT,
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')) NOT NULL,
  image_url TEXT,
  created_by VARCHAR(100),
  times_asked INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. User Progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  topic_id UUID REFERENCES topics(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started',
  lessons_completed INTEGER DEFAULT 0,
  examples_viewed INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  last_session_score INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_practice_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 6. Practice Sessions table
CREATE TABLE IF NOT EXISTS practice_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  topic_id UUID REFERENCES topics(id) NOT NULL,
  questions_count INTEGER NOT NULL,
  correct_count INTEGER NOT NULL,
  score_percentage DECIMAL(5,2) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  can_retry_at TIMESTAMP WITH TIME ZONE
);

-- 7. Question Attempts table
CREATE TABLE IF NOT EXISTS question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  question_id UUID REFERENCES questions(id) NOT NULL,
  session_id UUID REFERENCES practice_sessions(id) NOT NULL,
  selected_answer CHAR(1) CHECK (selected_answer IN ('A','B','C','D')) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_id UUID REFERENCES users(id) NOT NULL,
  challenged_id UUID REFERENCES users(id),
  topic_id UUID REFERENCES topics(id) NOT NULL,
  challenger_score INTEGER NOT NULL,
  challenged_score INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  challenge_link TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 9. Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  estimated_duration INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Worked Examples table
CREATE TABLE IF NOT EXISTS worked_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) NOT NULL,
  title VARCHAR(200) NOT NULL,
  problem_statement TEXT NOT NULL,
  solution_steps TEXT NOT NULL,
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')) NOT NULL,
  image_url TEXT,
  times_viewed INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_users_whatsapp_number ON users(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_users_class_code ON users(class_code);
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
CREATE INDEX IF NOT EXISTS idx_questions_topic_difficulty ON questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_topic ON user_progress(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_user_session ON question_attempts(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_date ON practice_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_challenges_status_expires ON challenges(status, expires_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function runMigration() {
  try {
    console.log("🔄 Starting database migration...");

    const { error } = await supabaseAdmin.rpc("exec", {
      sql: migrationSQL,
    });

    if (error) {
      // If RPC doesn't work, try direct SQL execution
      const lines = migrationSQL.split(";").filter((line) => line.trim());

      for (const line of lines) {
        if (line.trim()) {
          const { error: queryError } = await supabaseAdmin
            .from("information_schema.tables")
            .select("*")
            .limit(0); // This is just to test connection

          if (queryError) {
            console.error("❌ Connection error:", queryError.message);
            return;
          }
        }
      }

      console.log(
        "⚠️  RPC not available, will run SQL manually in Supabase dashboard"
      );
      console.log("📋 Copy the SQL below and run it in Supabase SQL Editor:");
      console.log("\n" + "=".repeat(50));
      console.log(migrationSQL);
      console.log("=".repeat(50) + "\n");
    } else {
      console.log("✅ Database migration completed successfully!");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    console.log("\n📋 Manual SQL for Supabase Dashboard:");
    console.log("\n" + "=".repeat(50));
    console.log(migrationSQL);
    console.log("=".repeat(50) + "\n");
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration, migrationSQL };

