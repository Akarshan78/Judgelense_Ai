"""
Rate Limiter for JudgeLens API
Implements a sliding window rate limiter to prevent API abuse.
"""

import time
from collections import defaultdict
from threading import Lock
from typing import Dict, List


class RateLimiter:
    """
    Sliding window rate limiter.
    Tracks requests per client IP and enforces limits.
    """
    
    def __init__(self, requests_per_minute: int = 10):
        self.requests_per_minute = requests_per_minute
        self.window_size = 60  # 1 minute in seconds
        self._requests: Dict[str, List[float]] = defaultdict(list)
        self._lock = Lock()
    
    def is_allowed(self, client_id: str) -> bool:
        """
        Check if a request from the given client is allowed.
        
        Args:
            client_id: Unique identifier for the client (e.g., IP address)
            
        Returns:
            True if request is allowed, False if rate limited
        """
        current_time = time.time()
        window_start = current_time - self.window_size
        
        with self._lock:
            # Clean up old requests outside the window
            self._requests[client_id] = [
                req_time for req_time in self._requests[client_id]
                if req_time > window_start
            ]
            
            # Check if under limit
            if len(self._requests[client_id]) < self.requests_per_minute:
                self._requests[client_id].append(current_time)
                return True
            
            return False
    
    def get_remaining(self, client_id: str) -> int:
        """Get remaining requests allowed for client."""
        current_time = time.time()
        window_start = current_time - self.window_size
        
        with self._lock:
            active_requests = [
                req_time for req_time in self._requests[client_id]
                if req_time > window_start
            ]
            return max(0, self.requests_per_minute - len(active_requests))
    
    def get_reset_time(self, client_id: str) -> float:
        """Get seconds until rate limit resets for client."""
        if client_id not in self._requests or not self._requests[client_id]:
            return 0
        
        oldest_request = min(self._requests[client_id])
        reset_time = oldest_request + self.window_size - time.time()
        return max(0, reset_time)
    
    def cleanup(self) -> None:
        """Remove stale entries to prevent memory growth."""
        current_time = time.time()
        window_start = current_time - self.window_size
        
        with self._lock:
            stale_clients = [
                client_id for client_id, requests in self._requests.items()
                if not requests or max(requests) < window_start
            ]
            for client_id in stale_clients:
                del self._requests[client_id]
