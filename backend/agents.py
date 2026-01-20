"""
AI Agents for JudgeLens - Multi-Model Fallback
Uses ModelManager for Gemini -> OpenAI -> Groq fallback
Enhanced with timeouts, input sanitization, and proper error handling.
"""

import os
import asyncio
import json
from dotenv import load_dotenv
from .models import ProjectSubmission, EvaluationResult, CategoryScore, Suggestion
from .model_manager import model_manager
import logging
import sys

# Configure logging
logging.basicConfig(level=logging.INFO, stream=sys.stdout)
logger = logging.getLogger(__name__)

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

# Configuration
AGENT_TIMEOUT_SECONDS = 10  # Timeout for each agent (reduced for speed)
MAX_RETRIES = 1


def clean_json_response(text: str) -> str:
    """Remove markdown code blocks from AI response."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def safe_json_parse(text: str, default: dict) -> dict:
    """Safely parse JSON with fallback to default."""
    try:
        cleaned = clean_json_response(text)
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parse error: {e}. Raw text: {text[:200]}...")
        return default


async def with_timeout(coro, timeout: float, default):
    """Execute coroutine with timeout and return default on failure."""
    try:
        return await asyncio.wait_for(coro, timeout=timeout)
    except asyncio.TimeoutError:
        logger.warning(f"Agent timed out after {timeout}s")
        return default
    except Exception as e:
        logger.error(f"Agent error: {e}")
        return default


class JudgeAgent:
    """Evaluates the project based on rubric and assigns scores."""
    
    DEFAULT_RESPONSE = {
        "overallScore": 50, 
        "categories": [
            {"name": "Innovation", "score": 50, "feedback": "Evaluation unavailable"},
            {"name": "Technical Complexity", "score": 50, "feedback": "Evaluation unavailable"},
            {"name": "UI/UX", "score": 50, "feedback": "Evaluation unavailable"},
            {"name": "Practicality", "score": 50, "feedback": "Evaluation unavailable"}
        ],
        "error": "Evaluation timed out or failed"
    }
    
    async def evaluate(self, submission: ProjectSubmission) -> dict:
        safe_content = submission.get_safe_prompt_content()
        
        prompt = f"""Hackathon judge: Evaluate "{safe_content['title']}" ({safe_content['techStack']}).
Description: {safe_content['description'][:500]}

Score 0-100 for each category. Be specific to this project.

Return JSON only:
{{"overallScore": <0-100>, "categories": [
  {{"name": "Innovation", "score": <0-100>, "feedback": "<1 sentence>"}},
  {{"name": "Technical Complexity", "score": <0-100>, "feedback": "<1 sentence>"}},
  {{"name": "UI/UX", "score": <0-100>, "feedback": "<1 sentence>"}},
  {{"name": "Practicality", "score": <0-100>, "feedback": "<1 sentence>"}}
]}}"""

        try:
            response = await model_manager.generate(prompt)
            logger.info(f"Judge response received ({len(response)} chars)")
            result = safe_json_parse(response, self.DEFAULT_RESPONSE)
            
            # Validate required fields
            if "overallScore" not in result:
                result["overallScore"] = 50
            if "categories" not in result or not result["categories"]:
                result["categories"] = self.DEFAULT_RESPONSE["categories"]
                
            return result
        except Exception as e:
            logger.error(f"Judge Error: {e}")
            return {**self.DEFAULT_RESPONSE, "error": str(e)}


class SkepticAgent:
    """Finds flaws and provides a cynical critique."""
    
    DEFAULT_RESPONSE = {
        "prediction": "Unknown",
        "probability": 0.5,
        "critique": "Unable to generate critique at this time.",
        "judgePersona": "The Silent Judge"
    }
    
    async def critique(self, submission: ProjectSubmission) -> dict:
        safe_content = submission.get_safe_prompt_content()
        
        prompt = f"""VC critic: Analyze "{safe_content['title']}" ({safe_content['techStack']}).
Description: {safe_content['description'][:500]}

Predict if it would win a hackathon. Be specific.

Return JSON only:
{{"prediction": "Acceptance" or "Rejection", "probability": <0.0-1.0>, "critique": "<2-3 sentences with specific feedback>", "judgePersona": "<creative judge name>"}}"""

        try:
            response = await model_manager.generate(prompt)
            result = safe_json_parse(response, self.DEFAULT_RESPONSE)
            
            # Validate and normalize prediction
            prediction = result.get("prediction", "Unknown")
            if prediction not in ["Acceptance", "Rejection"]:
                result["prediction"] = "Unknown"
            
            # Ensure probability is in valid range
            prob = result.get("probability", 0.5)
            result["probability"] = max(0.0, min(1.0, float(prob)))
            
            return result
        except Exception as e:
            logger.error(f"Skeptic Error: {e}")
            return {**self.DEFAULT_RESPONSE, "critique": f"Analysis failed: {str(e)}"}


class MentorAgent:
    """Provides actionable improvement suggestions."""
    
    DEFAULT_RESPONSE = {
        "suggestions": [
            {"area": "Documentation", "advice": "Add comprehensive documentation", "difficulty": "Low"},
            {"area": "Testing", "advice": "Implement automated tests", "difficulty": "Medium"},
            {"area": "Features", "advice": "Consider adding more unique features", "difficulty": "High"}
        ]
    }
    
    async def suggest(self, submission: ProjectSubmission) -> dict:
        safe_content = submission.get_safe_prompt_content()
        
        prompt = f"""Hackathon mentor: Give 3 improvements for "{safe_content['title']}" ({safe_content['techStack']}).
Description: {safe_content['description'][:500]}

Return JSON only:
{{"suggestions": [
  {{"area": "<specific area>", "advice": "<1-2 sentences>", "difficulty": "Low"}},
  {{"area": "<specific area>", "advice": "<1-2 sentences>", "difficulty": "Medium"}},
  {{"area": "<specific area>", "advice": "<1-2 sentences>", "difficulty": "High"}}
]}}"""

        try:
            response = await model_manager.generate(prompt)
            result = safe_json_parse(response, self.DEFAULT_RESPONSE)
            
            # Validate suggestions
            suggestions = result.get("suggestions", [])
            valid_difficulties = {"Low", "Medium", "High"}
            
            for suggestion in suggestions:
                if suggestion.get("difficulty") not in valid_difficulties:
                    suggestion["difficulty"] = "Medium"
            
            if not suggestions:
                result["suggestions"] = self.DEFAULT_RESPONSE["suggestions"]
                
            return result
        except Exception as e:
            logger.error(f"Mentor Error: {e}")
            return self.DEFAULT_RESPONSE


class BenchmarkAgent:
    """Compares the project against winning hackathon projects."""
    
    DEFAULT_RESPONSE = "Benchmark comparison unavailable at this time."
    
    async def compare(self, submission: ProjectSubmission) -> str:
        safe_content = submission.get_safe_prompt_content()
        
        prompt = f"""Compare "{safe_content['title']}" to similar successful projects or startups.
Description: {safe_content['description'][:300]}

Write 2-3 sentences naming a specific comparable project and key differentiator. Plain text only."""

        try:
            response = await model_manager.generate(prompt)
            logger.info(f"Benchmark response received ({len(response)} chars)")
            
            # Clean up response - remove any accidental markdown
            cleaned = response.strip()
            if cleaned.startswith('"') and cleaned.endswith('"'):
                cleaned = cleaned[1:-1]
            
            return cleaned if cleaned else self.DEFAULT_RESPONSE
        except Exception as e:
            logger.error(f"Benchmark Error: {e}")
            return f"{self.DEFAULT_RESPONSE} Error: {str(e)}"


class Orchestrator:
    """Orchestrates all agents with multi-model fallback and timeouts."""
    
    def __init__(self):
        self.judge = JudgeAgent()
        self.skeptic = SkepticAgent()
        self.mentor = MentorAgent()
        self.benchmark = BenchmarkAgent()

    async def run_analysis(self, submission: ProjectSubmission) -> EvaluationResult:
        """
        Run full analysis pipeline using ModelManager for fallback.
        All agents run in PARALLEL with individual timeouts for faster response.
        """
        logger.info(f"Starting analysis for: {submission.title[:50]}...")
        
        # Run ALL agents in parallel with timeouts
        judge_task = with_timeout(
            self.judge.evaluate(submission),
            AGENT_TIMEOUT_SECONDS,
            JudgeAgent.DEFAULT_RESPONSE
        )
        skeptic_task = with_timeout(
            self.skeptic.critique(submission),
            AGENT_TIMEOUT_SECONDS,
            SkepticAgent.DEFAULT_RESPONSE
        )
        mentor_task = with_timeout(
            self.mentor.suggest(submission),
            AGENT_TIMEOUT_SECONDS,
            MentorAgent.DEFAULT_RESPONSE
        )
        benchmark_task = with_timeout(
            self.benchmark.compare(submission),
            AGENT_TIMEOUT_SECONDS,
            BenchmarkAgent.DEFAULT_RESPONSE
        )
        
        # Wait for all to complete
        judge_res, skeptic_res, mentor_res, benchmark_res = await asyncio.gather(
            judge_task, skeptic_task, mentor_task, benchmark_task
        )
        
        logger.info("All agents completed, aggregating results...")

        # Aggregate results with validation
        return EvaluationResult(
            overallScore=min(100, max(0, judge_res.get('overallScore', 50))),
            categories=judge_res.get('categories', JudgeAgent.DEFAULT_RESPONSE["categories"]),
            prediction=skeptic_res.get('prediction', 'Unknown'),
            probability=skeptic_res.get('probability', 0.5),
            critique=skeptic_res.get('critique', 'No critique generated.'),
            judgePersona=skeptic_res.get('judgePersona', 'The Silent Judge'),
            suggestions=mentor_res.get('suggestions', MentorAgent.DEFAULT_RESPONSE["suggestions"]),
            benchmarkComparison=benchmark_res,
            error=judge_res.get('error')
        )
