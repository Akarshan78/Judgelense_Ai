
import React, { useState, useMemo } from 'react';
import { ProjectSubmission, VALIDATION_LIMITS } from '../types';

interface Props {
  onSubmit: (submission: ProjectSubmission) => void;
  isLoading: boolean;
  initialData?: ProjectSubmission;
}

interface ValidationState {
  title: string | null;
  description: string | null;
  targetAudience: string | null;
  techStack: string | null;
}

const SubmissionForm: React.FC<Props> = ({ onSubmit, isLoading, initialData }) => {
  const [formData, setFormData] = useState<ProjectSubmission>(initialData || {
    title: '',
    description: '',
    targetAudience: '',
    techStack: ''
  });
  
  const [touched, setTouched] = useState({
    title: false,
    description: false,
    targetAudience: false,
    techStack: false
  });

  // Real-time validation
  const validation = useMemo((): ValidationState => {
    const errors: ValidationState = {
      title: null,
      description: null,
      targetAudience: null,
      techStack: null
    };

    // Title validation
    if (formData.title.length > 0 && formData.title.length < VALIDATION_LIMITS.title.min) {
      errors.title = `Title must be at least ${VALIDATION_LIMITS.title.min} characters`;
    } else if (formData.title.length > VALIDATION_LIMITS.title.max) {
      errors.title = `Title must be less than ${VALIDATION_LIMITS.title.max} characters`;
    }

    // Description validation
    if (formData.description.length > 0 && formData.description.length < VALIDATION_LIMITS.description.min) {
      errors.description = `Description must be at least ${VALIDATION_LIMITS.description.min} characters`;
    } else if (formData.description.length > VALIDATION_LIMITS.description.max) {
      errors.description = `Description must be less than ${VALIDATION_LIMITS.description.max} characters`;
    }

    // Target audience validation
    if (formData.targetAudience.length > VALIDATION_LIMITS.targetAudience.max) {
      errors.targetAudience = `Target audience must be less than ${VALIDATION_LIMITS.targetAudience.max} characters`;
    }

    // Tech stack validation
    if (formData.techStack.length > VALIDATION_LIMITS.techStack.max) {
      errors.techStack = `Tech stack must be less than ${VALIDATION_LIMITS.techStack.max} characters`;
    }

    return errors;
  }, [formData]);

  const isValid = useMemo(() => {
    return (
      formData.title.length >= VALIDATION_LIMITS.title.min &&
      formData.title.length <= VALIDATION_LIMITS.title.max &&
      formData.description.length >= VALIDATION_LIMITS.description.min &&
      formData.description.length <= VALIDATION_LIMITS.description.max &&
      formData.targetAudience.length <= VALIDATION_LIMITS.targetAudience.max &&
      formData.techStack.length <= VALIDATION_LIMITS.techStack.max
    );
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ title: true, description: true, targetAudience: true, techStack: true });
    
    if (!isValid) return;
    onSubmit(formData);
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const getInputClassName = (field: keyof ValidationState, base: string) => {
    const hasError = touched[field] && validation[field];
    return `${base} ${hasError ? 'border-red-500/50 focus:border-red-500/50' : ''}`;
  };

  const getCharCountColor = (current: number, min: number, max: number) => {
    if (current > max) return 'text-red-400';
    if (current < min) return 'text-amber-400';
    return 'text-emerald-400';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-3xl mx-auto">
      {/* Title Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-300">Project Title</label>
          <span className={`text-xs ${getCharCountColor(formData.title.length, VALIDATION_LIMITS.title.min, VALIDATION_LIMITS.title.max)}`}>
            {formData.title.length}/{VALIDATION_LIMITS.title.max}
          </span>
        </div>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          onBlur={() => handleBlur('title')}
          placeholder="e.g. AI Code Review Assistant"
          className={getInputClassName('title', "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 focus:outline-none text-white placeholder:text-zinc-600 transition-colors")}
          required
        />
        {touched.title && validation.title && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <i className="fas fa-exclamation-circle"></i>
            {validation.title}
          </p>
        )}
      </div>

      {/* Description Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-300">Description</label>
          <span className={`text-xs ${getCharCountColor(formData.description.length, VALIDATION_LIMITS.description.min, VALIDATION_LIMITS.description.max)}`}>
            {formData.description.length}/{VALIDATION_LIMITS.description.max}
          </span>
        </div>
        <textarea
          rows={5}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          onBlur={() => handleBlur('description')}
          placeholder="Describe your project, its features, and what problem it solves..."
          className={getInputClassName('description', "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 focus:outline-none text-white resize-none placeholder:text-zinc-600 transition-colors")}
          required
        />
        {touched.description && validation.description && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <i className="fas fa-exclamation-circle"></i>
            {validation.description}
          </p>
        )}
        {formData.description.length > 0 && formData.description.length < VALIDATION_LIMITS.description.min && (
          <p className="text-xs text-zinc-500">
            {VALIDATION_LIMITS.description.min - formData.description.length} more characters needed
          </p>
        )}
      </div>

      {/* Target Audience Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-300">Target Audience</label>
          <span className="text-xs text-zinc-600">Optional</span>
        </div>
        <input
          type="text"
          value={formData.targetAudience}
          onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
          onBlur={() => handleBlur('targetAudience')}
          placeholder="e.g. Developers, Students, Enterprise teams..."
          className={getInputClassName('targetAudience', "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 focus:outline-none text-white placeholder:text-zinc-600 transition-colors")}
        />
        {touched.targetAudience && validation.targetAudience && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <i className="fas fa-exclamation-circle"></i>
            {validation.targetAudience}
          </p>
        )}
      </div>

      {/* Tech Stack Field */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-zinc-300">Tech Stack</label>
          <span className="text-xs text-zinc-600">Optional</span>
        </div>
        <input
          type="text"
          value={formData.techStack}
          onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
          onBlur={() => handleBlur('techStack')}
          placeholder="React, Python, TensorFlow, PostgreSQL..."
          className={getInputClassName('techStack', "w-full px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-800 focus:border-emerald-500/50 focus:outline-none text-white placeholder:text-zinc-600 transition-colors")}
        />
        {touched.techStack && validation.techStack && (
          <p className="text-xs text-red-400 flex items-center gap-1">
            <i className="fas fa-exclamation-circle"></i>
            {validation.techStack}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className={`group relative w-full py-4 px-8 rounded-xl font-semibold text-base text-white transition-all duration-300 overflow-hidden ${
          (isLoading || !isValid) 
            ? 'bg-zinc-700 cursor-not-allowed opacity-50' 
            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md'
        }`}
      >
        {/* Shimmer effect on hover */}
        {!isLoading && isValid && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        )}
        
        <div className="relative flex items-center justify-center space-x-2">
          {isLoading ? (
            <>
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 border-2 border-white/30 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
              </div>
              <span className="animate-pulse">Analyzing...</span>
            </>
          ) : (
            <>
              <span>Start Evaluation</span>
              <i className="fas fa-arrow-right text-sm transition-transform duration-300 group-hover:translate-x-1"></i>
            </>
          )}
        </div>
      </button>
      
      {/* Footer text */}
      <div className="flex items-center justify-center space-x-2 pt-2 text-zinc-600 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <span>Secure</span>
        </div>
        <span>•</span>
        <span>v1.0</span>
      </div>
    </form>
  );
};

export default SubmissionForm;
