// FILE: data-pipeline/processPaper.js
// -------------------------------------------------
// MODIFIED - Added robust logging and checks to debug the text extraction process.
// - The script will now log the length and a snippet of the extracted text.
// - It will exit gracefully if the extracted text is empty, preventing silent failures.
// -------------------------------------------------

import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import PDFParser from "pdf2json";
import "dotenv/config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(filePath) {
  const pdfParser = new PDFParser(this, 1);
  return new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF Parsing Error:", errData.parserError);
      reject(new Error("Failed to process PDF file."));
    });
    pdfParser.on("pdfParser_dataReady", () => {
      const rawText = pdfParser.getRawTextContent();
      const cleanedText = rawText
        .replace(/(\r\n|\n|\r)/gm, "\n")
        .replace(/\s\s+/g, " ");
      resolve(cleanedText);
    });
    pdfParser.loadPDF(filePath);
  });
}

async function parseQuestionsFromText(text) {
  // ... (This function remains the same)
  const systemPrompt = `
        You are a data extraction bot specializing in South African CAPS exam papers. Your task is to analyze this text and deconstruct it into a structured JSON format.
        CRITICAL RULES:
        1. Your primary goal is to find and extract the questions.
        2. You MUST ignore all irrelevant text such as headers, footers, page numbers, instructions, and cover pages.
        3. Identify every single question and sub-question (e.g., 1.1, 1.1.1, 1.2, 2.1).
        4. For each question, extract three pieces of data: "question_number", "question_text", and "marks".
        5. The "marks" value must be a number, often found in parentheses at the end of a question, like (3).
        6. Output a single JSON object with one key, "questions", which is an array of these question objects.
        7. If you cannot find any questions, return an empty array for the "questions" key.
        EXAMPLE:
        Input Text: "GRADE 10 Page 2 of 12 QUESTION 1 1.1 Solve for x: 1.1.1 3x = 9 (2) 1.1.2 x^2 - 4 = 0 (3) END OF PAPER"
        Expected Output:
        { "questions": [ { "question_number": "1.1.1", "question_text": "Solve for x: 3x = 9", "marks": 2 }, { "question_number": "1.1.2", "question_text": "Solve for x: x^2 - 4 = 0", "marks": 3 } ] }
    `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the text extracted from the exam paper:\n\n${text}`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const result = completion.choices[0].message.content;
    return JSON.parse(result);
  } catch (error) {
    console.error("Error parsing questions with OpenAI:", error);
    throw new Error("AI parsing failed.");
  }
}

async function main() {
  const args = process.argv.slice(2).reduce((acc, arg) => {
    const [key, value] = arg.split("=");
    acc[key.replace("--", "")] = value;
    return acc;
  }, {});

  if (!args.pdf) {
    console.error("Please provide a PDF file name using --pdf=<filename>");
    return;
  }

  const sourceDir = path.join(process.cwd(), "source_papers");
  const outputDir = path.join(process.cwd(), "output");
  const pdfPath = path.join(sourceDir, args.pdf);

  console.log(`Starting processing for: ${args.pdf}`);

  try {
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    console.log("Step 1/3: Extracting text from PDF...");
    const extractedText = await extractTextFromPDF(pdfPath);

    // --- NEW DEBUGGING LOGS ---
    if (!extractedText || extractedText.trim() === "") {
      console.error(
        "\n[Error] Text extraction resulted in empty content. The PDF might be an image-only file or corrupted."
      );
      console.log("Pipeline stopped.");
      return; // Exit the script
    }

    console.log(
      `...Text extracted successfully. Total characters: ${extractedText.length}`
    );
    console.log(`--- Start of Text Snippet ---`);
    console.log(extractedText.substring(0, 400)); // Log the first 400 characters
    console.log(`--- End of Text Snippet ---`);

    // Write the full text to a debug file
    await fs.writeFile(
      path.join(outputDir, "extracted_text.txt"),
      extractedText
    );

    console.log("\nStep 2/3: Parsing questions with AI...");
    const parsedData = await parseQuestionsFromText(extractedText);
    console.log(
      `...AI parsing complete. Found ${parsedData.questions.length} questions.`
    );

    const manifest = {
      paper_id: args.pdf.replace(".pdf", ""),
      questions: parsedData.questions.map((q) => ({ ...q, visual_assets: [] })),
    };

    const outputPath = path.join(outputDir, "manifest.json");
    await fs.writeFile(outputPath, JSON.stringify(manifest, null, 2));
    console.log(
      `Step 3/3: Successfully created manifest.json at ${outputPath}`
    );
    console.log("\nSprint 1 Complete.");
  } catch (error) {
    console.error("\nPipeline failed:", error.message);
  }
}

main();
