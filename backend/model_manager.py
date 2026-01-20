"""
Model Manager - Handles fallback between multiple AI models
Fallback order: Gemini -> OpenAI -> Groq
"""

import os
import logging
from typing import Optional
from abc import ABC, abstractmethod
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '.env'))

logger = logging.getLogger(__name__)


class BaseModelClient(ABC):
    """Abstract base class for AI model clients"""
    
    @abstractmethod
    async def generate(self, prompt: str) -> str:
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        pass


class GeminiClient(BaseModelClient):
    """Google Gemini API client"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.client = None
        self.model_name = "gemini-2.0-flash"
        
        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Gemini client: {e}")
    
    def is_available(self) -> bool:
        return self.client is not None and self.api_key is not None
    
    async def generate(self, prompt: str) -> str:
        if not self.is_available():
            raise Exception("Gemini client not available")
        
        response = await self.client.aio.models.generate_content(
            model=self.model_name,
            contents=[prompt]
        )
        return response.text


class OpenAIClient(BaseModelClient):
    """OpenAI GPT API client"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.client = None
        self.model_name = "gpt-4o-mini"  # Cost-effective model
        
        if self.api_key:
            try:
                from openai import AsyncOpenAI
                self.client = AsyncOpenAI(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize OpenAI client: {e}")
    
    def is_available(self) -> bool:
        return self.client is not None and self.api_key is not None
    
    async def generate(self, prompt: str) -> str:
        if not self.is_available():
            raise Exception("OpenAI client not available")
        
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content


class GroqClient(BaseModelClient):
    """Groq API client (fast inference with Llama/Mixtral)"""
    
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = None
        self.model_name = "llama-3.1-8b-instant"  # Ultra-fast inference
        
        if self.api_key:
            try:
                from groq import AsyncGroq
                self.client = AsyncGroq(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize Groq client: {e}")
    
    def is_available(self) -> bool:
        return self.client is not None and self.api_key is not None
    
    async def generate(self, prompt: str) -> str:
        if not self.is_available():
            raise Exception("Groq client not available")
        
        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content


class ModelManager:
    """
    Manages multiple AI models with automatic fallback.
    Order: Gemini -> OpenAI -> Groq
    """
    
    def __init__(self):
        # Groq first for fastest inference, then Gemini, then OpenAI
        self.clients = [
            ("Groq", GroqClient()),
            ("Gemini", GeminiClient()),
            ("OpenAI", OpenAIClient()),
        ]
        self.current_index = 0
        self._log_available_models()
    
    def _log_available_models(self):
        available = [name for name, client in self.clients if client.is_available()]
        logger.info(f"Available AI models: {available}")
        if not available:
            logger.error("No AI models available! Please check API keys in .env")
    
    def get_current_model_name(self) -> str:
        if self.current_index < len(self.clients):
            return self.clients[self.current_index][0]
        return "None"
    
    def rotate_model(self) -> bool:
        """Switch to next available model. Returns False if all exhausted."""
        self.current_index += 1
        while self.current_index < len(self.clients):
            if self.clients[self.current_index][1].is_available():
                logger.info(f"Rotated to model: {self.get_current_model_name()}")
                return True
            self.current_index += 1
        return False
    
    def reset(self):
        """Reset to first available model"""
        self.current_index = 0
        while self.current_index < len(self.clients):
            if self.clients[self.current_index][1].is_available():
                return
            self.current_index += 1
    
    async def generate(self, prompt: str, retries_per_model: int = 1) -> str:
        """
        Generate content with automatic model fallback.
        Tries each model with retries before moving to next.
        Uses local index to support concurrent calls.
        """
        errors = []
        
        # Use LOCAL index for thread-safety in concurrent calls
        current_idx = 0
        
        # Find first available model
        while current_idx < len(self.clients):
            if self.clients[current_idx][1].is_available():
                break
            current_idx += 1
        
        while current_idx < len(self.clients):
            model_name, client = self.clients[current_idx]
            
            if not client.is_available():
                current_idx += 1
                continue
            
            for attempt in range(retries_per_model):
                try:
                    logger.info(f"Trying {model_name} (attempt {attempt + 1})")
                    result = await client.generate(prompt)
                    return result
                    
                except Exception as e:
                    error_str = str(e)
                    errors.append(f"{model_name}: {error_str[:100]}")
                    
                    # Check if it's a rate limit or auth error - move to next model
                    if any(x in error_str.lower() for x in ["429", "rate", "exhausted", "invalid", "api_key"]):
                        logger.warning(f"{model_name} failed, switching to next model...")
                        break  # Move to next model immediately
                    
                    if attempt < retries_per_model - 1:
                        logger.warning(f"{model_name} error (attempt {attempt + 1}): {e}")
                        import asyncio
                        await asyncio.sleep(0.2)  # Brief delay before retry
            
            # Try next model
            current_idx += 1
            while current_idx < len(self.clients):
                if self.clients[current_idx][1].is_available():
                    logger.info(f"Switching to: {self.clients[current_idx][0]}")
                    break
                current_idx += 1
        
        raise Exception(f"All models failed. Errors: {'; '.join(errors)}")


# Singleton instance for use across the application
model_manager = ModelManager()

