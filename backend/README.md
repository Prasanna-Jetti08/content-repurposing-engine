# Content Repurposing Engine Backend

## Setup

1. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=5000
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `POST /api/repurpose` - Repurpose content
  - Accepts: FormData with `text`, `url`, or `file`
  - Returns: JSON with repurposed content

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key
- `PORT` - Server port (default: 5000)
