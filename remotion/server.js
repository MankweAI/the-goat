// FILE: remotion/server.js
// -------------------------------------------------
// NEW - This is a standalone Node.js server dedicated to rendering videos
// with Remotion. It listens for requests from our Next.js API.
// -------------------------------------------------
import { bundle } from "@remotion/bundler";
import { renderMedia } from "@remotion/renderer";
import express from "express";
import path from "path";
import os from "os";

const app = express();
const port = 8000;

app.use(express.json());

app.post("/render", async (req, res) => {
  try {
    const { script, contentType } = req.body;

    if (contentType !== "topic_teaser") {
      return res
        .status(400)
        .json({ error: "Only 'Topic Teaser' is supported for now." });
    }

    const compositionId = "TopicTeaser";
    const entry = "./remotion/index.js";
    const bundled = await bundle({
      entryPoint: path.resolve(entry),
      webpackOverride: (config) => config,
    });

    const outputLocation = path.join(os.tmpdir(), `video-${Date.now()}.mp4`);

    await renderMedia({
      compositionId: compositionId,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputLocation,
      inputProps: { script: script },
    });

    // In a real app, you would upload `outputLocation` to cloud storage
    // and return the public URL.
    res.json({
      message: "Video rendered successfully!",
      // videoUrl: "https://your-storage.com/video.mp4"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to render video." });
  }
});

app.listen(port, () => {
  console.log(`Remotion rendering server is listening on port ${port}`);
});
