# Content Repurposing Engine

## Problem Statement
Creating quality content for multiple platforms is time-consuming. Marketers and content creators need a way to efficiently repurpose a single piece of content across LinkedIn, Twitter, Blog, and YouTube formats without manual rewriting.

## Solution Overview
An AI-powered content repurposing tool that takes any input (text, URL, or file) and generates platform-specific versions optimized for each channel. Uses OpenAI's GPT-4 Turbo to understand context and adapt tone, length, and format automatically.

## Architecture Diagram
```
┌─────────────────┐
│  User Input     │
│  (Text/URL/File)│
└────────┬────────┘
         │
         v
┌─────────────────────────┐
│  Content Extraction     │
│  & Processing           │
└────────┬────────────────┘
         │
         v
┌──────────────────────────────┐
│  OpenAI GPT-4 Turbo          │
│  Content Generation          │
└────────┬─────────────────────┘
         │
         v
┌────────────────────────────────────┐
│  Platform-Specific Outputs         │
│  - LinkedIn Post                   │
│  - Tweet                           │
│  - Blog Article                    │
│  - YouTube Description             │
└────────────────────────────────────┘
```

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4 Turbo API
- **Content Processing**: cheerio (URL scraping), pdf-parse, mammoth (DOCX)
- **Styling**: CSS3 with light/dark mode support

## How to Run Your Project

### Prerequisites
- Node.js v18+
- npm or yarn
- OpenAI API key

### Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. Create `.env` file in backend folder:
```
OPENAI_API_KEY=your_key_here
PORT=5000
```

4. Start backend (from `/backend`):
```bash
node server.js
```

5. Start frontend (from `/frontend`):
```bash
npm run dev
```

6. Open `http://localhost:5173` in your browser

## API Keys / Usage Notes
- **OpenAI API Key**: Required for content generation. Get it from [OpenAI Platform](https://platform.openai.com/api-keys)
- **Environment Variable**: Store as `OPENAI_API_KEY` in `.env` (never commit to git)
- **Rate Limits**: Standard OpenAI API limits apply

## Sample Inputs & Outputs

**Input (Text):**
```
Apple just announced their new M4 chip with breakthrough AI capabilities that promise to revolutionize mobile computing. The chip delivers 4x performance improvements over the previous generation.
```

**Generated Outputs:**
- **LinkedIn**: Professional post highlighting innovation and business impact
- **Twitter**: Concise, engaging post with relevant hashtags (280 chars)
- **Blog**: Full article with context, technical details, and industry implications
- **YouTube**: SEO-optimized description with timestamps and engagement hooks

## Video Demo Link
https://drive.google.com/file/d/1D7m6FjeVNtm2QNYjF9H7e4al2ZbQI2-p/view?usp=sharing
