import { ProjectSubmission, EvaluationResult } from "../types";

// Use environment variable with fallback for development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 60000; // 60 seconds

/**
 * Custom error class for API errors with status codes
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public type: string = "api_error"
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Validate submission before sending to API
 */
function validateSubmission(submission: ProjectSubmission): void {
  if (!submission.title || submission.title.trim().length < 3) {
    throw new ApiError("Project title must be at least 3 characters", 400, "validation_error");
  }
  if (!submission.description || submission.description.trim().length < 20) {
    throw new ApiError("Project description must be at least 20 characters", 400, "validation_error");
  }
  if (submission.title.length > 200) {
    throw new ApiError("Project title must be less than 200 characters", 400, "validation_error");
  }
  if (submission.description.length > 5000) {
    throw new ApiError("Project description must be less than 5000 characters", 400, "validation_error");
  }
}

/**
 * Evaluate a hackathon project submission
 * @param submission - The project details to evaluate
 * @returns Evaluation results from AI judges
 * @throws ApiError on validation or API errors
 */
export const evaluateSubmission = async (
  submission: ProjectSubmission
): Promise<EvaluationResult> => {
  // Validate before sending
  validateSubmission(submission);

  try {
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/analyze`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: submission.title.trim(),
          description: submission.description.trim(),
          targetAudience: submission.targetAudience?.trim() || "",
          techStack: submission.techStack?.trim() || "",
        }),
      },
      REQUEST_TIMEOUT
    );

    // Handle different error status codes
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Extract error message from various formats
      let errorMessage = "An error occurred";
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        // Pydantic validation error format: [{msg: "...", ...}]
        errorMessage = errorData.detail[0].msg?.replace("Value error, ", "") || errorData.detail[0].message || "Validation error";
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
      
      if (response.status === 429) {
        throw new ApiError(
          errorMessage || "Rate limit exceeded. Please wait before trying again.",
          429,
          "rate_limit"
        );
      }
      
      if (response.status === 400 || response.status === 422) {
        throw new ApiError(
          errorMessage || "Invalid submission data",
          400,
          "validation_error"
        );
      }
      
      throw new ApiError(
        errorMessage || "Failed to evaluate submission",
        response.status,
        "api_error"
      );
    }

    const result = await response.json();
    
    // Check for soft errors (evaluation completed but with issues)
    if (result.error) {
      console.warn("Evaluation completed with warnings:", result.error);
    }
    
    return result as EvaluationResult;
  } catch (error) {
    // Handle abort/timeout
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError(
        "Request timed out. The AI evaluation is taking longer than expected. Please try again.",
        408,
        "timeout"
      );
    }
    
    // Re-throw ApiErrors as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new ApiError(
        "Unable to connect to the evaluation server. Please check your connection.",
        503,
        "network_error"
      );
    }
    
    console.error("Backend Evaluation Error:", error);
    throw new ApiError(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      "unknown_error"
    );
  }
};

/**
 * Check if the backend API is healthy
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await fetchWithTimeout(
      `${BACKEND_URL}/health`,
      { method: "GET" },
      5000
    );
    return response.ok;
  } catch {
    return false;
  }
};
