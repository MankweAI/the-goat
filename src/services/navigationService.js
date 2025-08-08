const { supabase } = require("../../config/database");

class NavigationService {
  constructor() {
    this.navigationHistory = new Map(); // Store user navigation history
  }

  // Get main menu options
  getMainMenuOptions() {
    return [
      { id: "1", code: "lessons", title: "The GOAT way (lessons)" },
      { id: "2", code: "examples", title: "Worked Examples" },
      { id: "3", code: "practice", title: "Practice Questions" },
      { id: "4", code: "progress", title: "Progress" },
      { id: "5", code: "challenge", title: "Challenge a Friend" },
    ];
  }

  // Get subject/paper options
  async getSubjectOptions() {
    try {
      const { data: papers, error } = await supabase
        .from("topics")
        .select("id, code, title, paper_number")
        .eq("level", 2)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;

      return papers.map((paper, index) => ({
        id: (index + 1).toString(),
        code: paper.code,
        title: paper.title,
        paper_number: paper.paper_number,
      }));
    } catch (error) {
      console.error("❌ Error getting subjects:", error);
      return [];
    }
  }

  // Get topics for a specific paper
  async getTopicsForPaper(paperCode) {
    try {
      // First get the paper
      const { data: paper, error: paperError } = await supabase
        .from("topics")
        .select("id")
        .eq("code", paperCode)
        .single();

      if (paperError) throw paperError;

      // Get topics under this paper
      const { data: topics, error } = await supabase
        .from("topics")
        .select("id, code, title, description")
        .eq("parent_id", paper.id)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;

      return topics.map((topic, index) => ({
        id: (index + 1).toString(),
        code: topic.code,
        title: topic.title,
        description: topic.description,
      }));
    } catch (error) {
      console.error("❌ Error getting topics:", error);
      return [];
    }
  }

  // Get subtopics for a specific topic
  async getSubtopicsForTopic(topicCode) {
    try {
      // First get the topic
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("code", topicCode)
        .single();

      if (topicError) throw topicError;

      // Get subtopics under this topic
      const { data: subtopics, error } = await supabase
        .from("topics")
        .select("id, code, title, description")
        .eq("parent_id", topic.id)
        .eq("is_active", true)
        .order("sort_order");

      if (error) throw error;

      return subtopics.map((subtopic, index) => ({
        id: (index + 1).toString(),
        code: subtopic.code,
        title: subtopic.title,
        description: subtopic.description,
      }));
    } catch (error) {
      console.error("❌ Error getting subtopics:", error);
      return [];
    }
  }

  // Update user navigation state
  async updateUserState(userId, newState) {
    try {
      const { error } = await supabase
        .from("users")
        .update({
          current_state: newState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("❌ Error updating user state:", error);
      return false;
    }
  }

  // Get user's navigation history
  getUserHistory(whatsappNumber) {
    return this.navigationHistory.get(whatsappNumber) || [];
  }

  // Add to user's navigation history
  addToHistory(whatsappNumber, step) {
    const history = this.getUserHistory(whatsappNumber);
    history.push({
      step: step,
      timestamp: new Date(),
    });

    // Keep only last 10 steps
    if (history.length > 10) {
      history.shift();
    }

    this.navigationHistory.set(whatsappNumber, history);
  }

  // Get previous step for "back" navigation
  getPreviousStep(whatsappNumber) {
    const history = this.getUserHistory(whatsappNumber);
    if (history.length < 2) return null;

    // Return second-to-last step
    return history[history.length - 2].step;
  }

  // Validate user input against available options
  validateInput(input, options) {
    const normalizedInput = input.toString().trim();

    // Check if input is a valid option number
    const optionIndex = parseInt(normalizedInput) - 1;
    if (optionIndex >= 0 && optionIndex < options.length) {
      return {
        valid: true,
        selectedOption: options[optionIndex],
        index: optionIndex,
      };
    }

    // Check if input matches option code
    const matchingOption = options.find(
      (opt) => opt.code.toLowerCase() === normalizedInput.toLowerCase()
    );

    if (matchingOption) {
      return {
        valid: true,
        selectedOption: matchingOption,
        index: options.indexOf(matchingOption),
      };
    }

    return {
      valid: false,
      selectedOption: null,
      index: -1,
    };
  }

  // Build navigation breadcrumb
  buildBreadcrumb(currentStep, userState) {
    const breadcrumbs = [];

    if (userState.currentPaper) {
      breadcrumbs.push(userState.currentPaper);
    }

    if (userState.currentTopic) {
      breadcrumbs.push(userState.currentTopic);
    }

    if (userState.currentSubtopic) {
      breadcrumbs.push(userState.currentSubtopic);
    }

    return breadcrumbs.length > 0 ? breadcrumbs.join(" → ") : "Main Menu";
  }

  // Check if user can access content (progress-based)
  async canAccessContent(userId, contentType, contentId) {
    try {
      // For MVP, allow access to all content
      // Future enhancement: implement prerequisite checking
      return true;
    } catch (error) {
      console.error("❌ Error checking content access:", error);
      return false;
    }
  }

  // Get personalized recommendations
  async getRecommendations(userId) {
    try {
      // Get user's progress and suggest next steps
      const { data: progress, error } = await supabase
        .from("user_progress")
        .select(
          `
          *,
          topics:topic_id (
            code,
            title
          )
        `
        )
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const recommendations = [];

      if (!progress || progress.length === 0) {
        // New user - recommend starting with basics
        recommendations.push({
          type: "lesson",
          title: "Start with Chain Rule basics",
          action: "Go to Chain Rule lessons",
          topicCode: "CHAIN-RULE",
        });
      } else {
        // Recommend based on recent activity
        const recentTopics = progress.slice(0, 3);

        recentTopics.forEach((p) => {
          if (
            p.questions_attempted > 0 &&
            p.questions_correct / p.questions_attempted < 0.7
          ) {
            recommendations.push({
              type: "lesson",
              title: `Review ${p.topics.title}`,
              action: `Strengthen ${p.topics.title} concepts`,
              topicCode: p.topics.code,
            });
          }
        });
      }

      return recommendations;
    } catch (error) {
      console.error("❌ Error getting recommendations:", error);
      return [];
    }
  }
}

module.exports = NavigationService;

