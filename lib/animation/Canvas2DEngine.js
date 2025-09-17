// FILE: app/lib/animation/Canvas2DEngine.js
// PURPOSE: Server-side 2D animation engine for generating video frames
// REPLACES: ThreeStageVanilla.jsx with performance-optimized 2D system

import { createCanvas, loadImage } from "canvas";

export class Canvas2DEngine {
  constructor(width = 1080, height = 1920, fps = 30) {
    this.width = width;
    this.height = height;
    this.fps = fps;
    this.canvas = createCanvas(width, height);
    this.ctx = this.canvas.getContext("2d");

    // Animation state
    this.currentFrame = 0;
    this.scenes = [];
    this.assets = new Map();
    this.particles = [];

    // Setup canvas defaults
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.imageSmoothingEnabled = true;
  }

  // Add scene with beat-based animation
  addScene(sceneConfig) {
    const scene = {
      id: sceneConfig.id || `scene_${this.scenes.length}`,
      duration: sceneConfig.duration || 3,
      beat: sceneConfig.beat || "setup",
      text: sceneConfig.text || "",
      startFrame: this.currentFrame,
      endFrame: this.currentFrame + sceneConfig.duration * this.fps,
      animations: sceneConfig.animations || [],
      particles: sceneConfig.particles || [],
      ...sceneConfig,
    };

    this.scenes.push(scene);
    this.currentFrame = scene.endFrame;
    return scene;
  }

  // Generate single frame for given time
  renderFrame(frameNumber) {
    const timeSeconds = frameNumber / this.fps;

    // Clear canvas with gradient background
    this.clearFrame();

    // Find active scene
    const scene = this.getActiveScene(frameNumber);
    if (!scene) return this.canvas.toBuffer("image/png");

    // Calculate scene progress (0-1)
    const sceneProgress =
      (frameNumber - scene.startFrame) / (scene.endFrame - scene.startFrame);

    // Render scene-specific content
    this.renderScene(scene, sceneProgress, timeSeconds);

    // Render particles
    this.renderParticles(timeSeconds);

    // Render text overlay
    this.renderTextOverlay(scene, sceneProgress);

    return this.canvas.toBuffer("image/png");
  }

  clearFrame() {
    // Clean gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#f8fafc");
    gradient.addColorStop(1, "#e2e8f0");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  getActiveScene(frameNumber) {
    return this.scenes.find(
      (scene) => frameNumber >= scene.startFrame && frameNumber < scene.endFrame
    );
  }

  renderScene(scene, progress, time) {
    // Beat-specific visual themes
    switch (scene.beat) {
      case "setup":
        this.renderSetupBeat(scene, progress);
        break;
      case "problem":
        this.renderProblemBeat(scene, progress);
        break;
      case "confusion":
        this.renderConfusionBeat(scene, progress);
        break;
      case "insight":
        this.renderInsightBeat(scene, progress);
        break;
      case "solve":
        this.renderSolveBeat(scene, progress);
        break;
      case "aha":
        this.renderAhaBeat(scene, progress);
        break;
      case "wrap":
        this.renderWrapBeat(scene, progress);
        break;
    }
  }

  // Beat-specific rendering methods
  renderSetupBeat(scene, progress) {
    // Clean introduction with topic elements
    this.ctx.save();

    // Gentle fade-in animation
    const alpha = this.easeInOut(Math.min(progress * 2, 1));
    this.ctx.globalAlpha = alpha;

    // Draw central focus element
    this.drawEducationalIcon(
      scene.subject,
      this.width / 2,
      this.height / 2 - 100,
      alpha
    );

    this.ctx.restore();
  }

  renderProblemBeat(scene, progress) {
    // Visual tension - highlighting the challenge
    this.ctx.save();

    // Subtle shake effect for emphasis
    const shakeX = Math.sin(progress * Math.PI * 8) * 5 * (1 - progress);
    const shakeY = Math.cos(progress * Math.PI * 6) * 3 * (1 - progress);

    this.ctx.translate(shakeX, shakeY);

    // Highlight effect
    this.drawHighlightRing(this.width / 2, this.height / 2, progress);

    this.ctx.restore();
  }

  renderConfusionBeat(scene, progress) {
    // Scattered elements, question marks
    this.ctx.save();

    // Multiple question marks appearing
    const questionMarks = ["?", "??", "???"];
    questionMarks.forEach((mark, i) => {
      const angle = progress * Math.PI * 2 + (i * Math.PI * 2) / 3;
      const radius = 150 + Math.sin(progress * Math.PI * 4) * 20;
      const x = this.width / 2 + Math.cos(angle) * radius;
      const y = this.height / 2 + Math.sin(angle) * radius;

      this.ctx.globalAlpha = 0.7;
      this.ctx.font = "bold 60px Arial";
      this.ctx.fillStyle = "#ef4444";
      this.ctx.fillText(mark, x, y);
    });

    this.ctx.restore();
  }

  renderInsightBeat(scene, progress) {
    // "Lightbulb moment" with radial highlight
    this.ctx.save();

    // Radial light effect
    const gradient = this.ctx.createRadialGradient(
      this.width / 2,
      this.height / 2 - 100,
      0,
      this.width / 2,
      this.height / 2 - 100,
      200 * progress
    );
    gradient.addColorStop(0, "rgba(34, 197, 94, 0.3)");
    gradient.addColorStop(1, "rgba(34, 197, 94, 0)");

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Lightbulb icon
    if (progress > 0.3) {
      this.drawLightbulb(this.width / 2, this.height / 2 - 100, progress - 0.3);
    }

    this.ctx.restore();
  }

  renderSolveBeat(scene, progress) {
    // Step-by-step process animation
    this.ctx.save();

    const steps = scene.steps || ["Step 1", "Step 2", "Step 3"];
    const currentStep = Math.floor(progress * steps.length);

    // Progress bar
    this.drawProgressBar(50, this.height - 200, this.width - 100, 20, progress);

    // Animated steps
    for (let i = 0; i <= currentStep && i < steps.length; i++) {
      const stepAlpha = i === currentStep ? progress * steps.length - i : 1;
      this.drawStep(i, steps[i], stepAlpha);
    }

    this.ctx.restore();
  }

  renderAhaBeat(scene, progress) {
    // Celebration effects, checkmarks, positive feedback
    this.ctx.save();

    // Success particles
    this.addSuccessParticles(progress);

    // Large checkmark animation
    if (progress > 0.2) {
      this.drawAnimatedCheckmark(
        this.width / 2,
        this.height / 2,
        progress - 0.2
      );
    }

    // Celebration colors
    const colors = ["#10b981", "#06b6d4", "#8b5cf6"];
    colors.forEach((color, i) => {
      this.ctx.globalAlpha = 0.3 * progress;
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      const radius = 100 + progress * 50;
      this.ctx.arc(
        this.width / 2 + Math.cos((i * Math.PI * 2) / 3) * radius,
        this.height / 2 + Math.sin((i * Math.PI * 2) / 3) * radius,
        20,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });

    this.ctx.restore();
  }

  renderWrapBeat(scene, progress) {
    // Clean summary with key points highlighted
    this.ctx.save();

    // Summary box with gentle animation
    const boxY = this.height / 2 - 150 + (1 - this.easeOut(progress)) * 50;
    const alpha = this.easeOut(progress);

    this.ctx.globalAlpha = alpha;
    this.drawSummaryBox(this.width / 2, boxY, 600, 300);

    this.ctx.restore();
  }

  // Utility drawing methods
  drawEducationalIcon(subject, x, y, alpha = 1) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    // Subject-specific icons
    const icons = {
      mathematics: "📊",
      science: "🔬",
      history: "📚",
      language: "📝",
    };

    const icon = icons[subject] || "🎓";
    this.ctx.font = "bold 120px Arial";
    this.ctx.fillText(icon, x, y);

    this.ctx.restore();
  }

  drawHighlightRing(x, y, progress) {
    this.ctx.save();

    const radius = 100 + progress * 50;
    const lineWidth = 8;

    this.ctx.strokeStyle = "#f59e0b";
    this.ctx.lineWidth = lineWidth;
    this.ctx.globalAlpha = 0.8 * (1 - progress * 0.5);

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2 * progress);
    this.ctx.stroke();

    this.ctx.restore();
  }

  drawLightbulb(x, y, progress) {
    this.ctx.save();

    // Simple lightbulb shape
    this.ctx.fillStyle = "#fbbf24";
    this.ctx.globalAlpha = this.easeOut(progress);

    this.ctx.beginPath();
    this.ctx.arc(x, y, 40 * progress, 0, Math.PI * 2);
    this.ctx.fill();

    // Light rays
    if (progress > 0.5) {
      this.ctx.strokeStyle = "#fbbf24";
      this.ctx.lineWidth = 3;
      this.ctx.globalAlpha = 0.7;

      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const rayLength = 30 + (progress - 0.5) * 40;

        this.ctx.beginPath();
        this.ctx.moveTo(x + Math.cos(angle) * 50, y + Math.sin(angle) * 50);
        this.ctx.lineTo(
          x + Math.cos(angle) * (50 + rayLength),
          y + Math.sin(angle) * (50 + rayLength)
        );
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  drawProgressBar(x, y, width, height, progress) {
    this.ctx.save();

    // Background
    this.ctx.fillStyle = "#e5e7eb";
    this.ctx.fillRect(x, y, width, height);

    // Progress
    this.ctx.fillStyle = "#10b981";
    this.ctx.fillRect(x, y, width * progress, height);

    this.ctx.restore();
  }

  drawStep(index, text, alpha) {
    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    const y = 300 + index * 100;
    const x = this.width / 2;

    // Step circle
    this.ctx.fillStyle = "#3b82f6";
    this.ctx.beginPath();
    this.ctx.arc(x - 200, y, 25, 0, Math.PI * 2);
    this.ctx.fill();

    // Step number
    this.ctx.fillStyle = "white";
    this.ctx.font = "bold 24px Arial";
    this.ctx.fillText((index + 1).toString(), x - 200, y);

    // Step text
    this.ctx.fillStyle = "#374151";
    this.ctx.font = "32px Arial";
    this.ctx.textAlign = "left";
    this.ctx.fillText(text, x - 150, y);
    this.ctx.textAlign = "center";

    this.ctx.restore();
  }

  drawAnimatedCheckmark(x, y, progress) {
    this.ctx.save();

    // Animated checkmark path
    this.ctx.strokeStyle = "#10b981";
    this.ctx.lineWidth = 12;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    const size = 60;
    const checkProgress = this.easeOut(Math.min(progress * 2, 1));

    this.ctx.beginPath();
    this.ctx.moveTo(x - size * 0.3, y);

    if (checkProgress > 0.5) {
      this.ctx.lineTo(x - size * 0.1, y + size * 0.3);

      if (checkProgress > 0.8) {
        this.ctx.lineTo(
          x -
            size * 0.1 +
            (x + size * 0.4 - (x - size * 0.1)) * ((checkProgress - 0.8) / 0.2),
          y +
            size * 0.3 +
            (y - size * 0.2 - (y + size * 0.3)) * ((checkProgress - 0.8) / 0.2)
        );
      }
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  drawSummaryBox(x, y, width, height) {
    this.ctx.save();

    // Box background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    this.ctx.strokeStyle = "#d1d5db";
    this.ctx.lineWidth = 2;

    const radius = 20;
    this.roundedRect(x - width / 2, y - height / 2, width, height, radius);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.restore();
  }

  addSuccessParticles(progress) {
    if (progress > 0.5) {
      // Add floating particles
      for (let i = 0; i < 10; i++) {
        const particle = {
          x: this.width / 2 + (Math.random() - 0.5) * 400,
          y: this.height / 2 + (Math.random() - 0.5) * 400,
          size: Math.random() * 8 + 4,
          color: ["#10b981", "#06b6d4", "#8b5cf6"][
            Math.floor(Math.random() * 3)
          ],
          alpha: (progress - 0.5) * 2,
        };

        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }

  renderParticles(time) {
    // Render any ongoing particle effects
    this.particles = this.particles.filter((particle) => {
      particle.life -= 1 / this.fps;
      if (particle.life <= 0) return false;

      // Update particle position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.5; // gravity

      // Render particle
      this.ctx.save();
      this.ctx.globalAlpha = particle.life / particle.maxLife;
      this.ctx.fillStyle = particle.color;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();

      return true;
    });
  }

  renderTextOverlay(scene, progress) {
    if (!scene.text) return;

    this.ctx.save();

    // Text background
    const textY = this.height - 150;
    const maxWidth = this.width - 60;

    // Measure text
    this.ctx.font = "38px Arial";
    const metrics = this.ctx.measureText(scene.text);
    const textWidth = Math.min(metrics.width, maxWidth);
    const textHeight = 60;

    // Background with fade-in
    const alpha = this.easeInOut(Math.min(progress * 2, 1));
    this.ctx.globalAlpha = alpha * 0.9;
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    this.ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    this.ctx.lineWidth = 1;

    this.roundedRect(
      this.width / 2 - textWidth / 2 - 20,
      textY - textHeight / 2 - 10,
      textWidth + 40,
      textHeight + 20,
      15
    );
    this.ctx.fill();
    this.ctx.stroke();

    // Text
    this.ctx.globalAlpha = alpha;
    this.ctx.fillStyle = "#1f2937";
    this.ctx.font = "bold 36px Arial";
    this.ctx.textAlign = "center";
    this.ctx.fillText(scene.text, this.width / 2, textY, maxWidth);

    this.ctx.restore();
  }

  // Easing functions
  easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  easeIn(t) {
    return t * t * t;
  }

  // Utility for rounded rectangles
  roundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  // Generate all frames for the animation
  async generateFrames() {
    const frames = [];
    const totalFrames = this.scenes.reduce(
      (total, scene) => Math.max(total, scene.endFrame),
      0
    );

    console.log(`🎬 Generating ${totalFrames} frames at ${this.fps}fps`);

    for (let frame = 0; frame < totalFrames; frame++) {
      const frameBuffer = this.renderFrame(frame);
      frames.push(frameBuffer);

      if (frame % 30 === 0) {
        console.log(
          `📹 Generated frame ${frame}/${totalFrames} (${Math.round(
            (frame / totalFrames) * 100
          )}%)`
        );
      }
    }

    return frames;
  }
}
