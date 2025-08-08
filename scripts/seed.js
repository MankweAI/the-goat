const { supabaseAdmin } = require("../config/database");
require("dotenv").config();

const seedData = {
  // 1. Classes data
  classes: [
    {
      class_code: "M12-ALPHA-2025",
      class_name: "Grade 12 Mathematics Alpha Class",
      grade_level: 12,
      subject: "Mathematics",
      max_students: 40,
      current_enrollment: 0,
      is_active: true,
      teacher_contact: "Mrs. Molefe - molefe@school.edu.za",
    },
  ],

  // 2. Topics hierarchy (subject → paper → topic → subtopic)
  topics: [
    // Level 1: Subject
    {
      code: "MATH",
      title: "Mathematics",
      description: "Grade 12 Mathematics curriculum",
      subject: "Mathematics",
      paper_number: null,
      level: 1,
      sort_order: 1,
      parent_id: null,
    },

    // Level 2: Papers
    {
      code: "MATH-P1",
      title: "Paper 1",
      description: "Algebra, Functions, Calculus",
      subject: "Mathematics",
      paper_number: 1,
      level: 2,
      sort_order: 1,
      parent_code: "MATH",
    },
    {
      code: "MATH-P2",
      title: "Paper 2",
      description: "Geometry, Trigonometry, Statistics",
      subject: "Mathematics",
      paper_number: 2,
      level: 2,
      sort_order: 2,
      parent_code: "MATH",
    },

    // Level 3: Topics
    {
      code: "CALCULUS",
      title: "Calculus",
      description: "Differential and Integral Calculus",
      subject: "Mathematics",
      paper_number: 1,
      level: 3,
      sort_order: 1,
      parent_code: "MATH-P1",
    },

    // Level 4: Subtopics
    {
      code: "CHAIN-RULE",
      title: "Chain Rule",
      description: "Differentiation using the chain rule",
      subject: "Mathematics",
      paper_number: 1,
      level: 4,
      sort_order: 1,
      parent_code: "CALCULUS",
    },
    {
      code: "PRODUCT-RULE",
      title: "Product Rule",
      description: "Differentiation using the product rule",
      subject: "Mathematics",
      paper_number: 1,
      level: 4,
      sort_order: 2,
      parent_code: "CALCULUS",
    },
  ],

  // 3. Sample lessons for Chain Rule
  lessons: [
    {
      topic_code: "CHAIN-RULE",
      title: "Introduction to Chain Rule",
      content: `# The GOAT Way: Chain Rule

## Step 1: Understanding Composite Functions
A composite function is when you have a function inside another function.
Example: f(x) = (3x² + 2)⁵

## Step 2: The Chain Rule Formula
If y = f(g(x)), then dy/dx = f'(g(x)) × g'(x)

In simple terms:
**Derivative = Outside derivative × Inside derivative**

## Step 3: Identify Outside and Inside
For f(x) = (3x² + 2)⁵:
- Outside function: u⁵ (where u = 3x² + 2)
- Inside function: 3x² + 2

Ready for worked examples? Reply 'examples' or go to menu with 'menu'.`,
      step_number: 1,
      estimated_duration: 5,
    },
  ],

  // 4. Sample worked examples
  worked_examples: [
    {
      topic_code: "CHAIN-RULE",
      title: "Basic Chain Rule Example",
      problem_statement: "Differentiate y = (3x² + 2)⁵",
      solution_steps: `**Step 1:** Identify the functions
- Outside: u⁵ where u = (3x² + 2)
- Inside: u = 3x² + 2

**Step 2:** Find derivatives
- Outside derivative: 5u⁴ = 5(3x² + 2)⁴
- Inside derivative: 6x

**Step 3:** Apply chain rule
dy/dx = 5(3x² + 2)⁴ × 6x = 30x(3x² + 2)⁴

**Answer:** dy/dx = 30x(3x² + 2)⁴`,
      difficulty: "medium",
    },
    {
      topic_code: "CHAIN-RULE",
      title: "Chain Rule with Square Root",
      problem_statement: "Differentiate y = √(x² + 4)",
      solution_steps: `**Step 1:** Rewrite using power notation
y = (x² + 4)^(1/2)

**Step 2:** Identify functions
- Outside: u^(1/2) where u = x² + 4
- Inside: u = x² + 4

**Step 3:** Find derivatives
- Outside derivative: (1/2)u^(-1/2) = 1/(2√u)
- Inside derivative: 2x

**Step 4:** Apply chain rule
dy/dx = 1/(2√(x² + 4)) × 2x = x/√(x² + 4)

**Answer:** dy/dx = x/√(x² + 4)`,
      difficulty: "easy",
    },
  ],

  // 5. Sample MCQ questions for Chain Rule
  questions: [
    {
      topic_code: "CHAIN-RULE",
      question_text: "Find dy/dx if y = (2x + 1)³",
      option_a: "6(2x + 1)²",
      option_b: "3(2x + 1)²",
      option_c: "2(2x + 1)²",
      option_d: "(2x + 1)²",
      correct_answer: "A",
      explanation:
        "Using chain rule: outside derivative = 3(2x + 1)², inside derivative = 2. Result: 3(2x + 1)² × 2 = 6(2x + 1)²",
      difficulty: "easy",
    },
    {
      topic_code: "CHAIN-RULE",
      question_text: "Differentiate f(x) = (x² - 3x + 2)⁴",
      option_a: "4(x² - 3x + 2)³",
      option_b: "(2x - 3)(x² - 3x + 2)³",
      option_c: "4(2x - 3)(x² - 3x + 2)³",
      option_d: "4x² - 12x + 8",
      correct_answer: "C",
      explanation:
        "Chain rule: outside = 4(x² - 3x + 2)³, inside = 2x - 3. Result: 4(x² - 3x + 2)³ × (2x - 3)",
      difficulty: "medium",
    },
    {
      topic_code: "CHAIN-RULE",
      question_text: "Find the derivative of y = √(4x + 1)",
      option_a: "2/√(4x + 1)",
      option_b: "4/√(4x + 1)",
      option_c: "1/(2√(4x + 1))",
      option_d: "2/(√(4x + 1))",
      correct_answer: "A",
      explanation:
        "Rewrite as (4x + 1)^(1/2). Chain rule: (1/2)(4x + 1)^(-1/2) × 4 = 2/√(4x + 1)",
      difficulty: "medium",
    },
    {
      topic_code: "CHAIN-RULE",
      question_text: "What is dy/dx for y = (sin x)²?",
      option_a: "2 sin x",
      option_b: "2 sin x cos x",
      option_c: "cos² x",
      option_d: "sin 2x",
      correct_answer: "B",
      explanation:
        "Chain rule: outside = 2(sin x), inside = cos x. Result: 2 sin x × cos x = 2 sin x cos x",
      difficulty: "hard",
    },
    {
      topic_code: "CHAIN-RULE",
      question_text: "Differentiate g(x) = 1/(3x + 2)²",
      option_a: "-6/(3x + 2)³",
      option_b: "-2/(3x + 2)³",
      option_c: "6/(3x + 2)³",
      option_d: "-1/(3x + 2)³",
      correct_answer: "A",
      explanation:
        "Rewrite as (3x + 2)^(-2). Chain rule: -2(3x + 2)^(-3) × 3 = -6/(3x + 2)³",
      difficulty: "hard",
    },
  ],
};

async function insertSeedData() {
  try {
    console.log("🌱 Starting database seeding...");

    // 1. Insert classes
    console.log("📚 Inserting classes...");
    const { data: classData, error: classError } = await supabaseAdmin
      .from("classes")
      .insert(seedData.classes)
      .select();

    if (classError) throw classError;
    console.log(`✅ Inserted ${classData.length} classes`);

    // 2. Insert topics with parent-child relationships
    console.log("📖 Inserting topics hierarchy...");

    // First insert root topics (no parent)
    const rootTopics = seedData.topics.filter((t) => !t.parent_code);
    const { data: rootData, error: rootError } = await supabaseAdmin
      .from("topics")
      .insert(rootTopics.map(({ parent_code, ...topic }) => topic))
      .select();

    if (rootError) throw rootError;

    // Build topic ID mapping
    const topicMapping = {};
    rootData.forEach((topic) => {
      topicMapping[topic.code] = topic.id;
    });

    // Insert child topics level by level
    for (let level = 2; level <= 4; level++) {
      const levelTopics = seedData.topics.filter((t) => t.level === level);

      if (levelTopics.length > 0) {
        const topicsWithParentIds = levelTopics.map(
          ({ parent_code, ...topic }) => ({
            ...topic,
            parent_id: topicMapping[parent_code],
          })
        );

        const { data: levelData, error: levelError } = await supabaseAdmin
          .from("topics")
          .insert(topicsWithParentIds)
          .select();

        if (levelError) throw levelError;

        // Update mapping with new IDs
        levelData.forEach((topic) => {
          topicMapping[topic.code] = topic.id;
        });
      }
    }

    console.log(`✅ Inserted ${Object.keys(topicMapping).length} topics`);

    // 3. Insert lessons
    console.log("📝 Inserting lessons...");
    const lessonsWithTopicIds = seedData.lessons.map(
      ({ topic_code, ...lesson }) => ({
        ...lesson,
        topic_id: topicMapping[topic_code],
      })
    );

    const { data: lessonData, error: lessonError } = await supabaseAdmin
      .from("lessons")
      .insert(lessonsWithTopicIds)
      .select();

    if (lessonError) throw lessonError;
    console.log(`✅ Inserted ${lessonData.length} lessons`);

    // 4. Insert worked examples
    console.log("💡 Inserting worked examples...");
    const examplesWithTopicIds = seedData.worked_examples.map(
      ({ topic_code, ...example }) => ({
        ...example,
        topic_id: topicMapping[topic_code],
      })
    );

    const { data: exampleData, error: exampleError } = await supabaseAdmin
      .from("worked_examples")
      .insert(examplesWithTopicIds)
      .select();

    if (exampleError) throw exampleError;
    console.log(`✅ Inserted ${exampleData.length} worked examples`);

    // 5. Insert questions
    console.log("❓ Inserting questions...");
    const questionsWithTopicIds = seedData.questions.map(
      ({ topic_code, ...question }) => ({
        ...question,
        topic_id: topicMapping[topic_code],
        created_by: "DithetoAI",
      })
    );

    const { data: questionData, error: questionError } = await supabaseAdmin
      .from("questions")
      .insert(questionsWithTopicIds)
      .select();

    if (questionError) throw questionError;
    console.log(`✅ Inserted ${questionData.length} questions`);

    // 6. Summary
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("📊 Summary:");
    console.log(`   Classes: ${classData.length}`);
    console.log(`   Topics: ${Object.keys(topicMapping).length}`);
    console.log(`   Lessons: ${lessonData.length}`);
    console.log(`   Examples: ${exampleData.length}`);
    console.log(`   Questions: ${questionData.length}`);
    console.log("\n💡 Ready for testing with sample data!");

    return {
      success: true,
      counts: {
        classes: classData.length,
        topics: Object.keys(topicMapping).length,
        lessons: lessonData.length,
        examples: exampleData.length,
        questions: questionData.length,
      },
    };
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    console.error("📋 Error details:", error);
    return { success: false, error: error.message };
  }
}

// Run seeding if called directly
if (require.main === module) {
  insertSeedData();
}

module.exports = { insertSeedData, seedData };

