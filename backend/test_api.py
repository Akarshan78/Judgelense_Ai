"""
API Test Script for JudgeLens AI Backend

Run with: python -m backend.test_api
Or: pytest backend/test_api.py -v
"""

import json
import sys

# For direct script execution
try:
    import requests
    HAS_REQUESTS = True
except ImportError:
    HAS_REQUESTS = False

# Configuration
BASE_URL = "http://127.0.0.1:8000"


def test_health_endpoint():
    """Test the health check endpoint."""
    if not HAS_REQUESTS:
        print("requests library not installed, skipping")
        return
    
    response = requests.get(f"{BASE_URL}/health", timeout=5)
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    print(f"✓ Health check passed: {data}")


def test_analyze_endpoint_valid():
    """Test the analyze endpoint with valid data."""
    if not HAS_REQUESTS:
        print("requests library not installed, skipping")
        return
    
    payload = {
        "title": "AI-Powered Code Review Assistant",
        "description": "A sophisticated tool that uses large language models to analyze pull requests, identify potential bugs, security vulnerabilities, and code style issues. It integrates with GitHub and provides inline comments with suggested fixes.",
        "techStack": "Python, FastAPI, OpenAI GPT-4, GitHub API, Redis"
    }
    
    response = requests.post(
        f"{BASE_URL}/analyze",
        json=payload,
        timeout=120  # AI analysis can take time
    )
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Analysis successful!")
        print(f"  Overall Score: {result.get('overallScore')}")
        print(f"  Prediction: {result.get('prediction')}")
        print(f"  Judge Persona: {result.get('judgePersona')}")
        print(f"  Categories: {len(result.get('categories', []))}")
        print(f"  Suggestions: {len(result.get('suggestions', []))}")
        return result
    else:
        print(f"✗ Analysis failed: {response.status_code}")
        print(f"  {response.text}")
        return None


def test_analyze_endpoint_invalid_short_title():
    """Test validation with too short title."""
    if not HAS_REQUESTS:
        print("requests library not installed, skipping")
        return
    
    payload = {
        "title": "AB",  # Too short (min 3)
        "description": "A valid description that meets the minimum length requirement.",
        "techStack": "React"
    }
    
    response = requests.post(f"{BASE_URL}/analyze", json=payload, timeout=10)
    
    # Should fail validation
    assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    print("✓ Short title validation works correctly")


def test_analyze_endpoint_invalid_short_description():
    """Test validation with too short description."""
    if not HAS_REQUESTS:
        print("requests library not installed, skipping")
        return
    
    payload = {
        "title": "Valid Title",
        "description": "Too short",  # Too short (min 20)
        "techStack": "React"
    }
    
    response = requests.post(f"{BASE_URL}/analyze", json=payload, timeout=10)
    
    # Should fail validation
    assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
    print("✓ Short description validation works correctly")


def test_rate_limiting():
    """Test rate limiting by making rapid requests."""
    if not HAS_REQUESTS:
        print("requests library not installed, skipping")
        return
    
    print("Testing rate limiting (this may take a moment)...")
    
    payload = {
        "title": "Rate Limit Test Project",
        "description": "Testing the rate limiting functionality of the API endpoint.",
        "techStack": "Python"
    }
    
    rate_limited = False
    for i in range(15):  # Try to exceed the rate limit
        response = requests.post(f"{BASE_URL}/analyze", json=payload, timeout=5)
        if response.status_code == 429:
            rate_limited = True
            print(f"✓ Rate limited after {i + 1} requests")
            break
    
    if not rate_limited:
        print("⚠ Rate limiting not triggered (may need more requests or different config)")


def run_all_tests():
    """Run all tests."""
    print("=" * 50)
    print("JudgeLens AI API Tests")
    print("=" * 50)
    print(f"Target: {BASE_URL}")
    print()
    
    tests = [
        ("Health Check", test_health_endpoint),
        ("Valid Analysis", test_analyze_endpoint_valid),
        ("Invalid Short Title", test_analyze_endpoint_invalid_short_title),
        ("Invalid Short Description", test_analyze_endpoint_invalid_short_description),
    ]
    
    for name, test_func in tests:
        print(f"\n[TEST] {name}")
        print("-" * 30)
        try:
            test_func()
        except AssertionError as e:
            print(f"✗ Assertion failed: {e}")
        except Exception as e:
            print(f"✗ Error: {e}")
    
    print("\n" + "=" * 50)
    print("Tests completed!")


if __name__ == "__main__":
    if not HAS_REQUESTS:
        print("Error: 'requests' library is required.")
        print("Install with: pip install requests")
        sys.exit(1)
    
    run_all_tests()
