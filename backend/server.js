import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads
const upload = multer({ 
  dest: path.join(__dirname, "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper functions for content extraction
async function extractTextFromPDF(filePath) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(fileBuffer);
    return data.text;
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error.message}`);
  }
}

function extractTextFromTXT(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch (error) {
    throw new Error(`Failed to read TXT: ${error.message}`);
  }
}

async function extractTextFromURL(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Remove script, style, and meta elements
    $("script").remove();
    $("style").remove();
    $("meta").remove();
    $("nav").remove();
    $("footer").remove();

    // Try to extract from common article containers first
    let text = "";
    const articleSelectors = [
      "article",
      "[role='main']",
      ".article-content",
      ".post-content",
      ".entry-content",
      ".content",
      "main",
    ];

    for (const selector of articleSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        text = element.text().trim();
        if (text.length > 100) break;
      }
    }

    // Fallback: extract all paragraphs if article not found
    if (text.length < 100) {
      const paragraphs = [];
      $("p").each((_, elem) => {
        const p = $(elem).text().trim();
        if (p.length > 10) {
          paragraphs.push(p);
        }
      });
      text = paragraphs.join(" ");
    }

    // Fallback: extract from h1, h2, h3 and p tags
    if (text.length < 100) {
      const headings = [];
      $("h1, h2, h3").each((_, elem) => {
        const h = $(elem).text().trim();
        if (h.length > 3) headings.push(h);
      });
      text = headings.join(" ") + " " + text;
    }

    // Fallback: get body text
    if (text.length < 100) {
      text = $("body").text().trim();
    }

    // Clean up whitespace
    const cleanText = text.replace(/\s+/g, " ").trim();

    if (cleanText.length < 50) {
      throw new Error(
        `Extracted content is too short (${cleanText.length} chars). The webpage may not have readable article content.`
      );
    }

    return cleanText;
  } catch (error) {
    throw new Error(`Failed to fetch or parse URL: ${error.message}`);
  }
}

// Repurposing prompts
const repurposingPrompts = {
  linkedin_post: `You are a LinkedIn content expert. Convert the following content into a professional LinkedIn post (max 300 words). Make it engaging, include relevant emojis, and add a call-to-action. Format: Just the post content, no additional explanation.`,

  twitter_thread: `You are a Twitter/X expert. Convert the following content into an engaging Twitter thread (5-7 tweets). Each tweet should be under 280 characters. Return as a JSON array of strings. Format: ["tweet1", "tweet2", "tweet3", ...]`,

  short_blog: `You are a professional copywriter. Convert the following content into a short blog post (500-700 words). Make it well-structured with an engaging headline, introduction, main points, and conclusion. Use markdown formatting.`,

  youtube_script: `You are a YouTube content creator. Convert the following content into a YouTube video script (800-1000 words). Include: hook, main content broken into segments, transitions, and a call-to-action. Format as a readable script.`,
};

async function generateRepurposes(content) {
  try {
    const results = {};

    // Generate LinkedIn Post
    const linkedinResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: repurposingPrompts.linkedin_post,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });
    results.linkedin_post = linkedinResponse.choices[0].message.content;

    // Generate Twitter Thread
    const twitterResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: repurposingPrompts.twitter_thread,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    let twitterContent = twitterResponse.choices[0].message.content;
    try {
      // Try to parse as JSON array
      const jsonMatch = twitterContent.match(/\[.*\]/s);
      if (jsonMatch) {
        results.twitter_thread = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: split by newlines
        results.twitter_thread = twitterContent.split("\n").filter((t) => t.trim());
      }
    } catch {
      results.twitter_thread = [twitterContent];
    }

    // Generate Short Blog
    const blogResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: repurposingPrompts.short_blog,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });
    results.short_blog = blogResponse.choices[0].message.content;

    // Generate YouTube Script (optional, as it's longer)
    const youtubeResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: repurposingPrompts.youtube_script,
        },
        {
          role: "user",
          content: content,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    results.youtube_script = youtubeResponse.choices[0].message.content;

    return results;
  } catch (error) {
    throw new Error(`Failed to generate repurposes: ${error.message}`);
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Content Repurposing Engine API", version: "1.0.0" });
});

app.post("/repurpose", upload.single("file"), async (req, res) => {
  try {
    let content = "";

    // Extract content based on input type
    if (req.file) {
      const filePath = req.file.path;
      const fileExt = path.extname(req.file.originalname).toLowerCase();

      if (fileExt === ".pdf") {
        content = await extractTextFromPDF(filePath);
      } else if (fileExt === ".docx") {
        content = await extractTextFromDOCX(filePath);
      } else if (fileExt === ".txt") {
        content = extractTextFromTXT(filePath);
      } else if (fileExt === ".pptx" || fileExt === ".ppt") {
        throw new Error("PPTX/PPT parsing not yet implemented. Please use PDF or DOCX.");
      } else {
        throw new Error(`Unsupported file type: ${fileExt}`);
      }

      // Clean up uploaded file
      fs.unlink(filePath, () => {});
    } else if (req.body.url) {
      content = await extractTextFromURL(req.body.url);
    } else if (req.body.text) {
      content = req.body.text;
    } else {
      return res.status(400).json({ error: "No content provided" });
    }

    // Validate content length
    if (content.length < 50) {
      return res.status(400).json({ error: "Content is too short. Please provide at least 50 characters." });
    }

    // Generate repurposes
    const repurposes = await generateRepurposes(content);

    res.json(repurposes);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Content Repurposing Engine API running on http://localhost:${PORT}`);
  console.log(`📝 API Key status: ${process.env.OPENAI_API_KEY ? "✅ Loaded" : "❌ Missing"}`);
});
