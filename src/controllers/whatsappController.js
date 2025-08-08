const { supabase } = require("../../config/database");

class WhatsAppController {
  constructor() {
    this.activeUsers = new Map(); // Store user conversation states
  }

  // Main message handler
  async handleMessage(messageInfo) {
    try {
      const { from, text } = messageInfo;

      // Get or create user session
      const userSession = await this.getUserSession(from);

      // Route message based on user state
      await this.routeMessage(userSession, text, from);
    } catch (error) {
      console.error("❌ WhatsApp controller error:", error);
    }
  }

  async getUserSession(whatsappNumber) {
    try {
      // Check if user exists in database
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("whatsapp_number", whatsappNumber)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (user) {
        // Update last active
        await supabase
          .from("users")
          .update({ last_active: new Date().toISOString() })
          .eq("id", user.id);

        return {
          user: user,
          state: user.current_state || {},
          isNewUser: false,
        };
      }

      // New user - needs onboarding
      return {
        user: null,
        state: { step: "onboarding_start" },
        isNewUser: true,
        whatsappNumber: whatsappNumber,
      };
    } catch (error) {
      console.error("❌ Error getting user session:", error);
      return {
        user: null,
        state: { step: "error" },
        isNewUser: true,
        whatsappNumber: whatsappNumber,
      };
    }
  }

  async routeMessage(userSession, message, from) {
    const { user, state, isNewUser } = userSession;
    const lowerMessage = message.toLowerCase().trim();

    try {
      if (isNewUser || !user) {
        await this.handleOnboarding(from, lowerMessage, state);
      } else {
        await this.handleAuthenticatedUser(from, lowerMessage, user, state);
      }
    } catch (error) {
      console.error("❌ Error routing message:", error);
      await this.sendErrorMessage(from);
    }
  }

  async handleOnboarding(from, message, state) {
    if (state.step === "onboarding_start") {
      // Send welcome message and ask for class code
      await this.sendWelcomeMessage(from);
      return;
    }

    if (state.step === "awaiting_class_code" || !state.step) {
      await this.validateClassCode(from, message);
      return;
    }
  }

  async handleAuthenticatedUser(from, message, user, state) {
    // Handle messages from authenticated users
    if (message === "menu") {
      await this.sendMainMenu(from);
      return;
    }

    if (message === "help") {
      await this.sendHelp(from);
      return;
    }

    // Default response for authenticated users
    await this.sendMainMenu(from);
  }

  async sendWelcomeMessage(from) {
    const welcomeText = `👋 Bona! Welcome to The GOAT!

🐐 I'm here to help you master Grade 12 Mathematics through:
• The GOAT way lessons
• Worked examples  
• Practice questions
• Progress tracking

To get started, please enter your class code:`;

    return await this.sendMessage(from, welcomeText);
  }

  async validateClassCode(from, classCode) {
    try {
      // Check if class code is valid
      const { data: classData, error } = await supabase
        .from("classes")
        .select("*")
        .eq("class_code", classCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (error || !classData) {
        await this.sendMessage(
          from,
          `❌ Invalid class code "${classCode}". Please check with your teacher and try again.`
        );
        return;
      }

      // Check enrollment limit
      if (classData.current_enrollment >= classData.max_students) {
        await this.sendMessage(
          from,
          `⚠️ Class "${classCode}" is full. Contact your teacher for assistance.`
        );
        return;
      }

      // Create user account
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          whatsapp_number: from,
          class_code: classData.class_code,
          current_state: { step: "onboarded" },
        })
        .select()
        .single();

      if (userError) {
        throw userError;
      }

      // Update class enrollment
      await supabase
        .from("classes")
        .update({
          current_enrollment: classData.current_enrollment + 1,
        })
        .eq("id", classData.id);

      // Send success message
      await this.sendMessage(
        from,
        `✅ Welcome to ${classData.class_name}!

You're now enrolled and ready to learn. Type 'menu' to get started!`
      );

      // Send main menu after short delay
      setTimeout(async () => {
        await this.sendMainMenu(from);
      }, 3000);
    } catch (error) {
      console.error("❌ Error validating class code:", error);
      await this.sendMessage(
        from,
        `⚠️ There was an error processing your class code. Please try again.`
      );
    }
  }

  async sendMainMenu(from) {
    const menuText = `📚 *The GOAT Main Menu*

Choose an option:

1️⃣ The GOAT way (lessons)
2️⃣ Worked Examples  
3️⃣ Practice Questions
4️⃣ Progress
5️⃣ Challenge a Friend

Reply with a number (1-5) or type 'help' for assistance.`;

    return await this.sendMessage(from, menuText);
  }

  async sendHelp(from) {
    const helpText = `🔧 *Help & Commands*

*Quick Commands:*
• 'menu' - Show main menu
• 'help' - Show this help

*How to navigate:*
• Use numbers to select options
• Follow the prompts for each section
• Type 'menu' anytime to return to main menu

*Need more help?*
Contact your teacher or class admin.`;

    return await this.sendMessage(from, helpText);
  }

  async sendErrorMessage(from) {
    const errorText = `⚠️ Something went wrong. Please try again or type 'help' for assistance.`;
    return await this.sendMessage(from, errorText);
  }

  // This will be set by the WhatsApp service
  setMessageSender(sendFunction) {
    this.sendMessage = sendFunction;
  }
}

module.exports = WhatsAppController;

