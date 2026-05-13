# Setup Instructions

## Prerequisites
- Node.js v18+
- npm or yarn
- OpenAI API key

## Installation

1. **Get OpenAI API Key**
   - Visit https://platform.openai.com/api-keys
   - Create a new secret key and copy it

2. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Configure Backend**
   - Create `backend/.env` file
   - Add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_key_here
   PORT=5000
   ```

4. **Run Servers**
   - Backend: `cd backend && node server.js`
   - Frontend: `cd frontend && npm run dev`
   - Open http://localhost:5173

## File Support
- Text input
- URL extraction
- PDF files
- Word documents (.docx)

## Troubleshooting
- Verify OpenAI API key in `.env`
- Check ports 5000 and 5173 are available
- Ensure Node.js version 18+
