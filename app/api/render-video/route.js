// FILE: app/api/render-video/route.js
// PURPOSE: Enhanced video rendering with actual 2D animation generation
// REPLACES: Current mock implementation with real video creation

import { NextResponse } from "next/server";
import { ScriptProcessor } from "../../lib/animation/ScriptProcessor.js";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

export async function POST(request) {
  try {
    const startTime = Date.now();
    const { script, contentType, topic } = await request.json();

    if (!script || !contentType || !topic) {
      return NextResponse.json(
        { error: "Script, content type, and topic are required" },
        { status: 400 }
      );
    }

    console.log("🎬 Video generation started:", {
      topic,
      contentType,
      sceneCount: script.scenes?.length || 0,
      timestamp: new Date().toISOString(),
    });

    // Initialize script processor and 2D engine
    const processor = new ScriptProcessor();

    // Process the script into animation sequences
    const animationEngine = await processor.processScript(script, topic);

    // Generate all animation frames
    console.log("🎨 Generating 2D animation frames...");
    const frames = await processor.generateVideoFrames();

    console.log(`✅ Generated ${frames.length} frames`);

    // Create unique video ID and directories
    const videoId = `${contentType}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const tempDir = path.join(process.cwd(), "temp", videoId);
    const outputDir = path.join(process.cwd(), "public", "downloads");

    // Ensure directories exist
    await mkdir(tempDir, { recursive: true });
    await mkdir(outputDir, { recursive: true });

    // Save frames as individual PNG files
    console.log("💾 Saving frames to disk...");
    for (let i = 0; i < frames.length; i++) {
      const framePath = path.join(
        tempDir,
        `frame_${String(i).padStart(6, "0")}.png`
      );
      await writeFile(framePath, frames[i]);

      if (i % 30 === 0) {
        console.log(`💾 Saved frame ${i}/${frames.length}`);
      }
    }

    // Generate MP4 using FFmpeg
    console.log("🎞️ Encoding video with FFmpeg...");
    const outputPath = path.join(outputDir, `${videoId}.mp4`);
    const fps = 30;

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(path.join(tempDir, "frame_%06d.png"))
        .inputOptions([
          "-framerate",
          fps.toString(),
          "-pattern_type",
          "sequence",
        ])
        .outputOptions([
          "-c:v",
          "libx264", // H.264 codec
          "-pix_fmt",
          "yuv420p", // Compatible pixel format
          "-r",
          fps.toString(), // Output framerate
          "-crf",
          "23", // Good quality/size balance
          "-preset",
          "medium", // Encoding speed vs compression
          "-movflags",
          "+faststart", // Optimize for web playback
        ])
        .output(outputPath)
        .on("start", (commandLine) => {
          console.log("🎬 FFmpeg started:", commandLine);
        })
        .on("progress", (progress) => {
          console.log(
            `🎞️ Encoding progress: ${Math.round(progress.percent || 0)}%`
          );
        })
        .on("end", () => {
          console.log("✅ Video encoding completed");
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ FFmpeg error:", err);
          reject(err);
        })
        .run();
    });

    // Clean up temporary files
    console.log("🧹 Cleaning up temporary files...");
    await fs.promises.rm(tempDir, { recursive: true, force: true });

    const processingTime = Date.now() - startTime;
    const duration = Math.round((frames.length / fps) * 10) / 10; // Duration in seconds

    // Track the video creation event
    try {
      await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        }/api/track-event`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName: "video_generated",
            properties: {
              topic,
              content_type: contentType,
              video_id: videoId,
              duration_seconds: duration,
              frame_count: frames.length,
              processing_time_ms: processingTime,
              created_at: new Date().toISOString(),
            },
          }),
        }
      );
    } catch (trackingError) {
      console.error("Failed to track video creation:", trackingError);
    }

    console.log(
      `✅ Video generated successfully: ${videoId} (${processingTime}ms)`
    );

    return NextResponse.json({
      success: true,
      message: "Video created successfully!",
      videoId,
      topic,
      contentType,
      downloadUrl: `/downloads/${videoId}.mp4`,
      duration: `${duration}s`,
      frameCount: frames.length,
      processingTime: `${processingTime}ms`,
      script,
      metadata: {
        resolution: "1080x1920",
        fps: fps,
        codec: "H.264",
        format: "MP4",
      },
    });
  } catch (error) {
    console.error("❌ Video generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create video",
        details: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
