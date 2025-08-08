# The GOAT - Database Schema Documentation

## Overview
This document outlines the complete database schema for The GOAT WhatsApp EdTech MVP, designed for Supabase (PostgreSQL).

## Tables Structure

### 1. users
Stores user information and authentication data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique user identifier |
| whatsapp_number | VARCHAR(20) | UNIQUE, NOT NULL | User's WhatsApp number |
| class_code | VARCHAR(20) | NOT NULL | Class code used for onboarding |
| display_name | VARCHAR(100) | | Optional user display name |
| onboarded_at | TIMESTAMP | DEFAULT NOW() | When user completed onboarding |
| last_active | TIMESTAMP | DEFAULT NOW() | Last interaction timestamp |
| daily_reminder_enabled | BOOLEAN | DEFAULT TRUE | Whether user wants daily reminders |
| current_state | JSONB | DEFAULT '{}' | Current conversation state |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### 2. classes
Manages class information and enrollment limits.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique class identifier |
| class_code | VARCHAR(20) | UNIQUE, NOT NULL | Class access code |
| class_name | VARCHAR(100) | NOT NULL | Human-readable class name |
| grade_level | INTEGER | NOT NULL | Grade level (e.g., 12) |
| subject | VARCHAR(50) | NOT NULL | Subject (e.g., 'Mathematics') |
| max_students | INTEGER | DEFAULT 40 | Maximum enrollment |
| current_enrollment | INTEGER | DEFAULT 0 | Current student count |
| is_active | BOOLEAN | DEFAULT TRUE | Whether class accepts new enrollments |
| teacher_contact | VARCHAR(100) | | Teacher contact information |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### 3. topics
Hierarchical structure for educational content organization.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique topic identifier |
| parent_id | UUID | REFERENCES topics(id) | Parent topic (NULL for top-level) |
| code | VARCHAR(20) | UNIQUE, NOT NULL | Short topic code |
| title | VARCHAR(200) | NOT NULL | Topic display title |
| description | TEXT | | Detailed topic description |
| subject | VARCHAR(50) | NOT NULL | Subject area |
| paper_number | INTEGER | | Exam paper number (1 or 2) |
| level | INTEGER | NOT NULL | Hierarchy level (1=subject, 2=paper, 3=topic, 4=subtopic) |
| sort_order | INTEGER | DEFAULT 0 | Display order within parent |
| is_active | BOOLEAN | DEFAULT TRUE | Whether topic is available |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### 4. questions
MCQ questions with metadata and difficulty tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique question identifier |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Associated topic |
| question_text | TEXT | NOT NULL | The question content |
| option_a | TEXT | NOT NULL | Choice A |
| option_b | TEXT | NOT NULL | Choice B |
| option_c | TEXT | NOT NULL | Choice C |
| option_d | TEXT | NOT NULL | Choice D |
| correct_answer | CHAR(1) | CHECK (correct_answer IN ('A','B','C','D')) | Correct option |
| explanation | TEXT | | Explanation for correct answer |
| difficulty | VARCHAR(10) | CHECK (difficulty IN ('easy','medium','hard')) | Difficulty level |
| image_url | TEXT | | Optional question image (<50KB) |
| created_by | VARCHAR(100) | | Content creator |
| times_asked | INTEGER | DEFAULT 0 | Usage tracking |
| success_rate | DECIMAL(5,2) | DEFAULT 0.0 | Success percentage |
| is_active | BOOLEAN | DEFAULT TRUE | Whether question is in rotation |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### 5. user_progress
Tracks individual user progress through topics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique progress record |
| user_id | UUID | REFERENCES users(id), NOT NULL | User reference |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Topic reference |
| status | VARCHAR(20) | DEFAULT 'not_started' | Progress status |
| lessons_completed | INTEGER | DEFAULT 0 | Number of lessons finished |
| examples_viewed | INTEGER | DEFAULT 0 | Worked examples seen |
| questions_attempted | INTEGER | DEFAULT 0 | Total questions attempted |
| questions_correct | INTEGER | DEFAULT 0 | Correct answers |
| last_session_score | INTEGER | DEFAULT 0 | Most recent practice score |
| best_score | INTEGER | DEFAULT 0 | Best practice session score |
| current_streak | INTEGER | DEFAULT 0 | Current daily streak |
| longest_streak | INTEGER | DEFAULT 0 | Best streak achieved |
| last_practice_at | TIMESTAMP | | Last practice session |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update time |

### 6. question_attempts
Individual question attempt history.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique attempt identifier |
| user_id | UUID | REFERENCES users(id), NOT NULL | User reference |
| question_id | UUID | REFERENCES questions(id), NOT NULL | Question reference |
| session_id | UUID | NOT NULL | Practice session identifier |
| selected_answer | CHAR(1) | CHECK (selected_answer IN ('A','B','C','D')) | User's choice |
| is_correct | BOOLEAN | NOT NULL | Whether answer was correct |
| time_taken_seconds | INTEGER | | Time spent on question |
| attempted_at | TIMESTAMP | DEFAULT NOW() | When attempt was made |

### 7. practice_sessions
Groups question attempts into practice sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique session identifier |
| user_id | UUID | REFERENCES users(id), NOT NULL | User reference |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Topic practiced |
| questions_count | INTEGER | NOT NULL | Total questions in session |
| correct_count | INTEGER | NOT NULL | Correct answers |
| score_percentage | DECIMAL(5,2) | NOT NULL | Session score |
| completed_at | TIMESTAMP | DEFAULT NOW() | Session completion time |
| can_retry_at | TIMESTAMP | | When retry is allowed (24h cooldown) |

### 8. challenges
Peer-to-peer challenge system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique challenge identifier |
| challenger_id | UUID | REFERENCES users(id), NOT NULL | User who sent challenge |
| challenged_id | UUID | REFERENCES users(id) | User who received challenge |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Challenge topic |
| challenger_score | INTEGER | NOT NULL | Challenger's score |
| challenged_score | INTEGER | | Challenged user's score |
| status | VARCHAR(20) | DEFAULT 'pending' | Challenge status |
| challenge_link | TEXT | NOT NULL | WhatsApp wa.me link |
| expires_at | TIMESTAMP | NOT NULL | Challenge expiration |
| created_at | TIMESTAMP | DEFAULT NOW() | Challenge creation time |
| completed_at | TIMESTAMP | | When challenge was completed |

### 9. lessons
Structured lesson content for "The GOAT way".

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique lesson identifier |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Associated topic |
| title | VARCHAR(200) | NOT NULL | Lesson title |
| content | TEXT | NOT NULL | Lesson content (markdown) |
| step_number | INTEGER | NOT NULL | Lesson sequence |
| estimated_duration | INTEGER | | Estimated time in minutes |
| image_url | TEXT | | Optional lesson image |
| is_active | BOOLEAN | DEFAULT TRUE | Whether lesson is available |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

### 10. worked_examples
Step-by-step worked examples for topics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique example identifier |
| topic_id | UUID | REFERENCES topics(id), NOT NULL | Associated topic |
| title | VARCHAR(200) | NOT NULL | Example title |
| problem_statement | TEXT | NOT NULL | The problem to solve |
| solution_steps | TEXT | NOT NULL | Step-by-step solution |
| difficulty | VARCHAR(10) | CHECK (difficulty IN ('easy','medium','hard')) | Example difficulty |
| image_url | TEXT | | Optional example image |
| times_viewed | INTEGER | DEFAULT 0 | Usage tracking |
| is_active | BOOLEAN | DEFAULT TRUE | Whether example is available |
| created_at | TIMESTAMP | DEFAULT NOW() | Record creation time |

## Indexes
```sql
-- Performance indexes
CREATE INDEX idx_users_whatsapp_number ON users(whatsapp_number);
CREATE INDEX idx_users_class_code ON users(class_code);
CREATE INDEX idx_users_last_active ON users(last_active);
CREATE INDEX idx_questions_topic_difficulty ON questions(topic_id, difficulty);
CREATE INDEX idx_user_progress_user_topic ON user_progress(user_id, topic_id);
CREATE INDEX idx_question_attempts_user_session ON question_attempts(user_id, session_id);
CREATE INDEX idx_practice_sessions_user_date ON practice_sessions(user_id, completed_at);
CREATE INDEX idx_challenges_status_expires ON challenges(status, expires_at);
```

## Relationships
- Users belong to classes via class_code
- Topics have hierarchical parent-child relationships
- Questions belong to topics
- User progress tracks progress per topic per user
- Question attempts are grouped into practice sessions
- Challenges link users and topics
- Lessons and worked examples belong to topics