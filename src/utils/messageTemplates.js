const messageTemplates = {
  // Welcome & Onboarding
  welcome: {
    text: `👋 Bona! Welcome to The GOAT!

🐐 I'm here to help you master Grade 12 Mathematics through:
• The GOAT way lessons
• Worked examples  
• Practice questions
• Progress tracking

To get started, please enter your class code:`,
    variations: [
      `🌟 Hey there! Welcome to The GOAT Mathematics!

Ready to become the GOAT at Grade 12 Maths? I'll help you with:
✨ Step-by-step lessons
✨ Worked examples
✨ Practice questions  
✨ Track your progress

What's your class code?`,
      `👋 Sawubona! The GOAT is here to help!

Let's master Grade 12 Mathematics together with:
🎯 Interactive lessons
🎯 Clear examples
🎯 Practice sessions
🎯 Progress tracking

Please share your class code to begin:`,
    ],
  },

  // Class validation
  classAccepted: {
    text: (className) => `✅ Welcome to ${className}!

You're now enrolled and ready to learn. Type 'menu' to get started!`,
    variations: [
      (className) => `🎉 Awesome! You're now part of ${className}!

Ready to start your learning journey? Type 'menu' to explore!`,
      (className) => `🚀 Great! You've joined ${className} successfully!

Let's begin mastering mathematics! Send 'menu' to start.`,
    ],
  },

  classInvalid: {
    text: (code) =>
      `❌ Invalid class code "${code}". Please check with your teacher and try again.`,
    variations: [
      (code) =>
        `🤔 Hmm, "${code}" doesn't seem right. Double-check with your teacher?`,
      (code) =>
        `⚠️ Class code "${code}" not found. Make sure it's correct and try again.`,
    ],
  },

  classFull: {
    text: (code) =>
      `⚠️ Class "${code}" is full. Contact your teacher for assistance.`,
    variations: [
      (code) =>
        `😔 Sorry, class "${code}" has reached maximum capacity. Speak to your teacher.`,
    ],
  },

  // Main Menu
  mainMenu: {
    text: `📚 *The GOAT Main Menu*

Choose an option:

1️⃣ The GOAT way (lessons)
2️⃣ Worked Examples  
3️⃣ Practice Questions
4️⃣ Progress
5️⃣ Challenge a Friend

Reply with a number (1-5) or type 'help' for assistance.`,
    variations: [
      `🐐 *Main Menu - Let's Learn!*

What would you like to do?

1️⃣ Learn The GOAT way
2️⃣ See Worked Examples  
3️⃣ Practice Questions
4️⃣ Check Progress
5️⃣ Challenge Friends

Choose 1-5 or say 'help'!`,
      `📖 *Your Learning Hub*

Pick your adventure:

1️⃣ Lessons (The GOAT way)
2️⃣ Examples  
3️⃣ Practice
4️⃣ Progress
5️⃣ Challenges

Number (1-5) or 'help' for guidance.`,
    ],
  },

  // Subject Navigation
  subjectMenu: {
    text: `📊 *Choose Subject*

1️⃣ Mathematics Paper 1
2️⃣ Mathematics Paper 2

Reply with 1 or 2, or 'menu' to go back.`,
    variations: [
      `📐 *Select Paper*

Which paper are you working on?

1️⃣ Paper 1 (Algebra, Functions, Calculus)
2️⃣ Paper 2 (Geometry, Trigonometry, Statistics)

Choose 1 or 2!`,
    ],
  },

  // Topic Selection
  topicMenu: (topics) => ({
    text: `📖 *Choose Topic*

${topics.map((topic, index) => `${index + 1}️⃣ ${topic.title}`).join("\n")}

Reply with a number or 'back' to return.`,
    variations: [
      `🎯 *Pick a Topic*

${topics.map((topic, index) => `${index + 1}️⃣ ${topic.title}`).join("\n")}

What interests you today?`,
    ],
  }),

  // Help Messages
  help: {
    text: `🔧 *Help & Commands*

*Quick Commands:*
• 'menu' - Show main menu
• 'back' - Go to previous screen
• 'help' - Show this help

*How to navigate:*
• Use numbers to select options
• Follow the prompts for each section
• Type 'menu' anytime to return to main menu

*Need more help?*
Contact your teacher or class admin.`,
    variations: [
      `🆘 *Need Help?*

*Essential Commands:*
• 'menu' - Main menu
• 'back' - Previous page
• 'help' - This help

*Navigation Tips:*
• Numbers select options
• Follow instructions
• 'menu' returns home

Questions? Ask your teacher!`,
    ],
  },

  // Error Messages
  invalidInput: {
    text: `🤔 I didn't understand that. Please choose from the available options or type 'help'.`,
    variations: [
      `❓ Not sure what you mean. Try selecting a number from the options above!`,
      `🔄 Let's try again. Pick a number from the menu or type 'help' for guidance.`,
    ],
  },

  systemError: {
    text: `⚠️ Something went wrong. Please try again or type 'help' for assistance.`,
    variations: [
      `😅 Oops! Technical hiccup. Give it another try or say 'help'.`,
      `🛠️ System glitch detected. Please retry or type 'help'.`,
    ],
  },

  // Lesson Messages
  lessonStart: (title) => ({
    text: `📚 *Starting: ${title}*

Welcome to The GOAT way! This lesson will guide you step-by-step.

Ready to begin? Reply 'yes' to start or 'menu' to go back.`,
    variations: [
      `🎓 *Let's Learn: ${title}*

The GOAT way makes math simple! 

Ready for step-by-step learning? Say 'yes' or 'menu' to return.`,
    ],
  }),

  // Practice Messages
  practiceStart: (topicTitle) => ({
    text: `🎯 *Practice: ${topicTitle}*

Get ready for 5 questions! Each question locks after you answer.

You can retry after 24 hours or review lessons first.

Ready? Reply 'start' or 'menu' to go back.`,
    variations: [
      `💪 *Practice Time: ${topicTitle}*

5 questions coming up! Remember:
• One attempt per question
• 24-hour retry cooldown
• Review lessons anytime

Ready? Say 'start'!`,
    ],
  }),

  questionPrompt: (questionNum, total, question, options) => ({
    text: `❓ *Question ${questionNum}/${total}*

${question}

A) ${options.A}
B) ${options.B}
C) ${options.C}
D) ${options.D}

Reply A, B, C, or D:`,
    variations: [
      `🤔 *Q${questionNum}/${total}*

${question}

A) ${options.A}
B) ${options.B}
C) ${options.C}
D) ${options.D}

Your answer (A-D)?`,
    ],
  }),

  correctAnswer: (explanation) => ({
    text: `✅ Sharp! Correct answer!

${explanation ? `💡 ${explanation}` : ""}

Type 'next' to continue.`,
    variations: [
      `🎉 Excellent! You got it right!

${explanation ? `🧠 ${explanation}` : ""}

Ready for 'next'?`,
      `⭐ Perfect! Well done!

${explanation ? `📖 ${explanation}` : ""}

Say 'next' to proceed.`,
    ],
  }),

  wrongAnswer: (correctAnswer, explanation) => ({
    text: `❌ Almost! The correct answer is ${correctAnswer}.

${explanation ? `💡 ${explanation}` : ""}

Type 'next' to continue.`,
    variations: [
      `🔄 Not quite! Answer: ${correctAnswer}

${explanation ? `🧠 ${explanation}` : ""}

Ready for 'next'?`,
    ],
  }),

  practiceComplete: (score, total) => ({
    text: `🏁 *Practice Complete!*

Your score: ${score}/${total} (${Math.round((score / total) * 100)}%)

What's next?
1️⃣ Try another topic
2️⃣ Review lessons
3️⃣ Main menu
4️⃣ Challenge a friend

Choose 1-4:`,
    variations: [
      `🎊 *Session Finished!*

Score: ${score}/${total} (${Math.round((score / total) * 100)}%)

Options:
1️⃣ New topic
2️⃣ Study lessons  
3️⃣ Main menu
4️⃣ Send challenge

Pick 1-4!`,
    ],
  }),

  // Challenge Messages
  challengeCreate: (score, topic, link) => ({
    text: `🎯 *Challenge Created!*

Share this message with your classmates:

"I scored ${score}/5 on ${topic} with The GOAT! Can you beat me? Try: ${link}"

(Only works for your class)`,
    variations: [
      `⚡ *Challenge Ready!*

Send this to your class friends:

"Got ${score}/5 on ${topic} with The GOAT! Your turn to try: ${link}"

Class-only challenge!`,
    ],
  }),
};

// Utility function to get random variation
function getRandomMessage(template, ...args) {
  if (typeof template === "function") {
    return template(...args);
  }

  const variations = template.variations || [];
  if (variations.length === 0) {
    return typeof template.text === "function"
      ? template.text(...args)
      : template.text;
  }

  const allOptions = [template.text, ...variations];
  const selected = allOptions[Math.floor(Math.random() * allOptions.length)];

  return typeof selected === "function" ? selected(...args) : selected;
}

module.exports = {
  messageTemplates,
  getRandomMessage,
};


