<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# JudgeLens AI

An AI-powered hackathon project evaluation platform that simulates professional judges to evaluate project submissions, providing probability scores, critical critiques, and actionable improvements.

## Features

- 🤖 **Multi-Agent AI System**: Four specialized AI personas (Judge, Skeptic, Mentor, Benchmark) evaluate projects in parallel
- 🔄 **Multi-Model Fallback**: Resilient AI layer with automatic failover (Gemini → OpenAI → Groq)
- 📊 **Visual Analytics**: Radar charts and score breakdowns for each evaluation category
- 🛡️ **Security**: Rate limiting, input sanitization, and secure API key handling
- ⚡ **Performance**: Response caching and parallel agent execution
- 🎨 **Modern UI**: Glassmorphism design with animated backgrounds

## Architecture

```
├── Frontend (React + TypeScript + Vite)
│   ├── components/     # UI components
│   ├── services/       # API client
│   └── types.ts        # TypeScript definitions
│
└── Backend (Python + FastAPI)
    ├── agents.py       # AI agent implementations
    ├── model_manager.py # Multi-model fallback system
    ├── cache.py        # Response caching
    └── rate_limiter.py # Rate limiting
```

## Prerequisites

- **Node.js** >= 18.x
- **Python** >= 3.10
- API Keys for at least one of:
  - Google Gemini API
  - OpenAI API
  - Groq API

## Quick Start

### 1. Clone and Install

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

**Backend** (`backend/.env`):
```bash
cp backend/.env.example backend/.env
# Edit backend/.env and add your API keys
```

**Frontend** (`.env.local`):
```bash
cp .env.example .env.local
# Edit .env.local if you need to change the backend URL
```

### 3. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/analyze` | POST | Evaluate a project submission |

### Example Request

```bash
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Code Review Bot",
    "description": "An AI-powered tool that reviews pull requests and suggests improvements...",
    "techStack": "Python, FastAPI, OpenAI, GitHub API"
  }'
```

## Configuration

### Rate Limiting

Configure in `backend/.env`:
```
RATE_LIMIT_PER_MINUTE=10
```

### CORS Origins

Configure allowed origins in `backend/.env`:
```
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## Security Notes

⚠️ **Important**: Never commit API keys to version control!

- `.env` files are in `.gitignore`
- Use `.env.example` files as templates
- Rotate any keys that may have been exposed

## Development

```bash
# Run frontend in dev mode
npm run dev

# Run backend with auto-reload
uvicorn backend.main:app --reload

# Build for production
npm run build
```

## License

MIT
