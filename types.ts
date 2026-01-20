
/**
 * Project submission data from the user
 */
export interface ProjectSubmission {
  /** Project title (3-200 characters) */
  title: string;
  /** Detailed project description (20-5000 characters) */
  description: string;
  /** Target audience for the project (optional, max 300 characters) */
  targetAudience: string;
  /** Technologies used (optional, max 500 characters) */
  techStack: string;
}

/**
 * Score for a specific evaluation category
 */
export interface ScoreCategory {
  /** Category name (e.g., "Innovation", "Technical Complexity") */
  name: string;
  /** Score from 0-100 */
  score: number;
  /** Specific feedback for this category */
  feedback: string;
}

/**
 * Improvement suggestion from the mentor agent
 */
export interface Suggestion {
  /** Area of improvement */
  area: string;
  /** Specific actionable advice */
  advice: string;
  /** Implementation difficulty level */
  difficulty: 'Low' | 'Medium' | 'High';
}

/**
 * Prediction outcome type
 */
export type PredictionOutcome = 'Acceptance' | 'Rejection' | 'Unknown';

/**
 * Complete evaluation result from all AI agents
 */
export interface EvaluationResult {
  /** Overall score from 0-100 */
  overallScore: number;
  /** Predicted hackathon outcome */
  prediction: PredictionOutcome;
  /** Confidence probability from 0-1 */
  probability: number;
  /** Critical analysis from the skeptic agent */
  critique: string;
  /** Scores for each evaluation category */
  categories: ScoreCategory[];
  /** Improvement suggestions from mentor agent */
  suggestions: Suggestion[];
  /** Comparison to similar successful projects */
  benchmarkComparison?: string;
  /** Judge persona name */
  judgePersona: string;
  /** Error message if evaluation had issues */
  error?: string;
}

/**
 * Application state machine status
 */
export enum AppStatus {
  /** Initial state, ready for submission */
  IDLE = 'IDLE',
  /** Currently evaluating a submission */
  EVALUATING = 'EVALUATING',
  /** Evaluation complete, showing results */
  RESULTS = 'RESULTS',
  /** An error occurred */
  ERROR = 'ERROR'
}

/**
 * Validation constraints for submissions
 */
export const VALIDATION_LIMITS = {
  title: { min: 3, max: 200 },
  description: { min: 20, max: 5000 },
  targetAudience: { max: 300 },
  techStack: { max: 500 }
} as const;
