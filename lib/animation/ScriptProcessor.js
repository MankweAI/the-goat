// FILE: app/lib/animation/ScriptProcessor.js
// PURPOSE: Convert beat-based scripts into 2D animation sequences

import { Canvas2DEngine } from "./Canvas2DEngine.js";
import { selectEducationalAssets, animationTemplates } from "./CAPSAssets.js";

export class ScriptProcessor {
  constructor() {
    this.engine = new Canvas2DEngine();
    this.assets = null;
  }

  // Convert TikTok script to animation sequence
  async processScript(script, topic) {
    console.log("🎬 Processing script for topic:", topic);

    // Select appropriate educational assets
    this.assets = selectEducationalAssets(topic);
    console.log(
      "📚 Selected assets:",
      this.assets.subject,
      this.assets.category
    );

    // Clear any existing scenes
    this.engine.scenes = [];
    this.engine.currentFrame = 0;

    // Process each script scene
    if (script.scenes) {
      for (const scene of script.scenes) {
        await this.addSceneToEngine(scene, topic);
      }
    }

    return this.engine;
  }

  async addSceneToEngine(scriptScene, topic) {
    const sceneConfig = {
      id: `scene_${scriptScene.beat}_${Date.now()}`,
      duration: scriptScene.duration || 3,
      beat: scriptScene.beat || "setup",
      text: this.optimizeTextForMobile(scriptScene.text || ""),
      subject: this.assets.subject,
      category: this.assets.category,
      primaryColor: this.assets.primaryColor,

      // Enhanced scene data
      sfx: scriptScene.sfx || "none",
      camera: scriptScene.camera || "hold",

      // CAPS-specific content
      educationalElements: this.selectEducationalElements(
        scriptScene.beat,
        topic
      ),
      visualStyle: this.assets.visualTheme,

      // Animation configuration
      animations: this.getAnimationsForBeat(scriptScene.beat),
      particles: this.getParticlesForBeat(scriptScene.beat),

      // Subject-specific data
      ...this.getSubjectSpecificData(scriptScene.beat, topic),
    };

    this.engine.addScene(sceneConfig);
    return sceneConfig;
  }

  optimizeTextForMobile(text) {
    if (!text) return "";

    // Ensure text fits mobile screen (max ~14 words as per your prompt)
    const words = text.split(" ");
    if (words.length > 14) {
      return words.slice(0, 14).join(" ") + "...";
    }

    return text;
  }

  selectEducationalElements(beat, topic) {
    const elements = [];

    switch (beat) {
      case "setup":
        elements.push("topic_introduction", "subject_icon");
        if (this.assets.subject === "mathematics") {
          elements.push("equation_preview");
        } else if (this.assets.subject === "physical_sciences") {
          elements.push("concept_diagram");
        } else if (this.assets.subject === "life_sciences") {
          elements.push("biological_illustration");
        }
        break;

      case "problem":
        elements.push("challenge_highlight", "question_mark");
        if (topic.toLowerCase().includes("equation")) {
          elements.push("complex_equation");
        } else if (topic.toLowerCase().includes("force")) {
          elements.push("force_diagram");
        } else if (topic.toLowerCase().includes("cell")) {
          elements.push("cell_structure");
        }
        break;

      case "confusion":
        elements.push("scattered_elements", "question_marks", "visual_chaos");
        break;

      case "insight":
        elements.push("lightbulb", "key_concept", "clarity_effect");
        break;

      case "solve":
        elements.push("step_by_step", "progress_indicator", "solution_path");
        break;

      case "aha":
        elements.push(
          "success_checkmark",
          "celebration_particles",
          "result_highlight"
        );
        break;

      case "wrap":
        elements.push("summary_box", "key_points", "final_equation");
        break;
    }

    return elements;
  }

  getAnimationsForBeat(beat) {
    const animations = [];

    switch (beat) {
      case "setup":
        animations.push({ type: "fade_in", duration: 1.0 });
        animations.push({ type: "gentle_zoom", duration: 2.0 });
        break;

      case "problem":
        animations.push({ type: "highlight_pulse", duration: 1.5 });
        animations.push({ type: "subtle_shake", duration: 0.5 });
        break;

      case "confusion":
        animations.push({ type: "scatter_elements", duration: 2.0 });
        animations.push({ type: "question_mark_spawn", duration: 1.0 });
        break;

      case "insight":
        animations.push({ type: "radial_light", duration: 1.5 });
        animations.push({ type: "lightbulb_appear", duration: 1.0 });
        break;

      case "solve":
        animations.push({ type: "step_progression", duration: 3.0 });
        animations.push({ type: "progress_bar", duration: 2.5 });
        break;

      case "aha":
        animations.push({ type: "success_burst", duration: 1.0 });
        animations.push({ type: "checkmark_draw", duration: 1.5 });
        break;

      case "wrap":
        animations.push({ type: "summary_slide_in", duration: 2.0 });
        animations.push({ type: "key_points_appear", duration: 2.0 });
        break;
    }

    return animations;
  }

  getParticlesForBeat(beat) {
    const particles = [];

    switch (beat) {
      case "insight":
        particles.push({
          type: "sparkle",
          count: 15,
          color: "#fbbf24",
          lifetime: 2.0,
          behavior: "radial_burst",
        });
        break;

      case "aha":
        particles.push({
          type: "confetti",
          count: 25,
          colors: ["#10b981", "#06b6d4", "#8b5cf6"],
          lifetime: 3.0,
          behavior: "celebration_fall",
        });
        break;

      case "solve":
        particles.push({
          type: "progress_dots",
          count: 5,
          color: "#3b82f6",
          lifetime: 1.0,
          behavior: "sequential_appear",
        });
        break;
    }

    return particles;
  }

  getSubjectSpecificData(beat, topic) {
    const data = {};

    // Mathematics-specific data
    if (this.assets.subject === "mathematics") {
      if (topic.toLowerCase().includes("equation")) {
        data.equation = this.generateSampleEquation(topic);
        data.steps = ["Isolate variable", "Simplify", "Check answer"];
      } else if (topic.toLowerCase().includes("graph")) {
        data.graphType = "linear";
        data.coordinates = [
          [0, 0],
          [1, 2],
          [2, 4],
        ];
      }
    }

    // Physics-specific data
    else if (
      this.assets.subject === "physical_sciences" &&
      this.assets.category === "physics"
    ) {
      if (topic.toLowerCase().includes("force")) {
        data.forces = [
          { name: "Weight", magnitude: 100, direction: "down" },
          { name: "Normal", magnitude: 100, direction: "up" },
        ];
      } else if (topic.toLowerCase().includes("wave")) {
        data.waveProperties = {
          frequency: "50 Hz",
          wavelength: "2 m",
          amplitude: "0.5 m",
        };
      }
    }

    // Biology-specific data
    else if (this.assets.subject === "life_sciences") {
      if (topic.toLowerCase().includes("photosynthesis")) {
        data.process = {
          reactants: ["6CO₂", "6H₂O", "Light Energy"],
          products: ["C₆H₁₂O₆", "6O₂"],
          location: "Chloroplasts",
        };
      } else if (topic.toLowerCase().includes("cell")) {
        data.organelles = ["Nucleus", "Mitochondria", "Ribosomes"];
      }
    }

    return data;
  }

  generateSampleEquation(topic) {
    const equations = [
      "2x + 5 = 15",
      "y = mx + c",
      "ax² + bx + c = 0",
      "sin²θ + cos²θ = 1",
      "E = mc²",
    ];

    // Select equation based on topic complexity
    if (topic.toLowerCase().includes("quadratic")) {
      return "ax² + bx + c = 0";
    } else if (topic.toLowerCase().includes("linear")) {
      return "y = mx + c";
    } else {
      return equations[0]; // Default simple equation
    }
  }

  // Generate frames for the processed script
  async generateVideoFrames() {
    console.log("🎬 Starting frame generation...");
    return await this.engine.generateFrames();
  }
}


