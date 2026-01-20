from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .models import ProjectSubmission, EvaluationResult, ValidationError
from .agents import Orchestrator
from .rate_limiter import RateLimiter
from .cache import ResponseCache
import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="JudgeLens AI Backend",
    description="AI-powered hackathon project evaluation API",
    version="1.0.0"
)

# CORS Configuration - Read from environment or use secure defaults
def get_cors_origins() -> list[str]:
    """Get allowed CORS origins from environment variable."""
    origins_str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return [origin.strip() for origin in origins_str.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# Initialize components
orchestrator = Orchestrator()
rate_limiter = RateLimiter(
    requests_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "10"))
)
response_cache = ResponseCache(max_size=100, ttl_seconds=3600)


@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Handle validation errors with proper response."""
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc), "type": "validation_error"}
    )


@app.post("/analyze", response_model=EvaluationResult)
async def analyze_project(submission: ProjectSubmission, request: Request):
    """
    Analyze a hackathon project submission.
    
    Returns evaluation scores, critique, and improvement suggestions
    from multiple AI judge personas.
    """
    # Get client IP for rate limiting
    client_ip = request.client.host if request.client else "unknown"
    
    # Check rate limit
    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=429, 
            detail="Rate limit exceeded. Please wait before making another request."
        )
    
    # Check for API key
    if not os.getenv("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY") == "your_gemini_api_key_here":
        raise HTTPException(
            status_code=500, 
            detail="API keys not configured. Please set valid API keys in backend/.env"
        )
    
    # Check cache first
    cache_key = submission.get_cache_key()
    cached_result = response_cache.get(cache_key)
    if cached_result:
        logger.info(f"Cache hit for submission: {submission.title[:30]}...")
        return cached_result
    
    try:
        logger.info(f"Processing submission: {submission.title[:50]}...")
        result = await orchestrator.run_analysis(submission)
        
        # Cache successful results (only if no error)
        if not result.error:
            response_cache.set(cache_key, result)
        
        return result
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "JudgeLens AI Backend Running",
        "version": "2.0.0",
        "features": ["multi-model-fallback", "rate-limiting", "caching"]
    }


@app.get("/health")
def health_check():
    """Detailed health check for monitoring."""
    api_key_status = "configured" if os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_gemini_api_key_here" else "missing"
    return {
        "status": "healthy",
        "api_keys": api_key_status,
        "cache_size": response_cache.size(),
        "rate_limit": f"{rate_limiter.requests_per_minute}/min"
    }
