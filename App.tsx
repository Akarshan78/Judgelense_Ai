
import React, { useState } from 'react';
import { AppStatus, ProjectSubmission, EvaluationResult } from './types';
import { evaluateSubmission } from './services/geminiService';
import SubmissionForm from './components/SubmissionForm';
import EvaluationResults from './components/EvaluationResults';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [submission, setSubmission] = useState<ProjectSubmission | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPrivacy, setShowPrivacy] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  // Feature details content
  const featureDetails = {
    'Deep Analysis': {
      icon: 'fa-microscope',
      color: 'indigo',
      title: 'Deep Analysis',
      subtitle: 'Comprehensive Project Evaluation',
      description: 'Our AI-powered deep analysis engine examines every aspect of your hackathon project to provide actionable insights.',
      features: [
        { icon: 'fa-code', title: 'Code Structure Analysis', desc: 'Evaluates your architecture decisions, code organization, and technical patterns.' },
        { icon: 'fa-lightbulb', title: 'Originality Assessment', desc: 'Compares your idea against thousands of existing projects to measure innovation.' },
        { icon: 'fa-layer-group', title: 'Stack Viability', desc: 'Analyzes your technology choices for scalability, performance, and market fit.' },
        { icon: 'fa-chart-bar', title: 'Scoring Breakdown', desc: 'Provides detailed scores across Innovation, Technical Complexity, UI/UX, and Practicality.' }
      ],
      stats: [
        { value: '50+', label: 'Evaluation Criteria' },
        { value: '10K+', label: 'Projects Analyzed' },
        { value: '95%', label: 'Accuracy Rate' }
      ]
    },
    'Predictive Odds': {
      icon: 'fa-chart-pie',
      color: 'purple',
      title: 'Predictive Odds',
      subtitle: 'AI-Powered Win Probability',
      description: 'Leverage machine learning trained on thousands of hackathon results to understand your chances of winning.',
      features: [
        { icon: 'fa-database', title: 'Historical Data', desc: 'Trained on 10,000+ winning projects from major hackathons worldwide.' },
        { icon: 'fa-brain', title: 'Pattern Recognition', desc: 'Identifies winning patterns and compares your project against success markers.' },
        { icon: 'fa-percentage', title: 'Probability Score', desc: 'Calculates your acceptance/rejection probability with confidence intervals.' },
        { icon: 'fa-scale-balanced', title: 'Judge Simulation', desc: 'Simulates how real hackathon judges would evaluate your submission.' }
      ],
      stats: [
        { value: '94%', label: 'Prediction Accuracy' },
        { value: '500+', label: 'Hackathons Analyzed' },
        { value: '4', label: 'AI Judge Personas' }
      ]
    },
    'Iterative Fixes': {
      icon: 'fa-wand-magic-sparkles',
      color: 'pink',
      title: 'Iterative Fixes',
      subtitle: 'Actionable Improvement Roadmap',
      description: 'Get personalized, prioritized recommendations to transform your project from good to competition-winning.',
      features: [
        { icon: 'fa-list-check', title: 'Prioritized Suggestions', desc: 'Ranked improvements based on impact and implementation difficulty.' },
        { icon: 'fa-clock', title: 'Time Estimates', desc: 'Each fix includes realistic time estimates (Low: 1-2hrs, Medium: 4-8hrs, High: 1-2 days).' },
        { icon: 'fa-road', title: 'Implementation Guide', desc: 'Step-by-step guidance on how to implement each improvement.' },
        { icon: 'fa-arrows-rotate', title: 'Re-evaluation', desc: 'Submit again after fixes to see your improved score and new suggestions.' }
      ],
      stats: [
        { value: '3', label: 'Key Suggestions' },
        { value: '85%', label: 'Score Improvement Avg' },
        { value: '∞', label: 'Re-submissions' }
      ]
    }
  };

  const handleSubmission = async (data: ProjectSubmission) => {
    setSubmission(data);
    setStatus(AppStatus.EVALUATING);
    setError(null);
    
    try {
      const result = await evaluateSubmission(data);
      setEvaluation(result);
      setStatus(AppStatus.RESULTS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred during evaluation.');
      setStatus(AppStatus.ERROR);
    }
  };

  const handleReset = () => {
    setStatus(AppStatus.IDLE);
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full -z-20 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[80%] h-[80%] bg-indigo-500/10 blur-[130px] rounded-full animate-drift"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[70%] h-[70%] bg-purple-500/10 blur-[130px] rounded-full animate-drift" style={{ animationDelay: '-8s' }}></div>
        <div className="absolute top-[25%] right-[15%] w-[40%] h-[40%] bg-blue-400/10 blur-[110px] rounded-full animate-pulse"></div>
      </div>

      {/* Premium Navbar with glow */}
      <nav className="sticky top-4 z-50 mx-4 md:mx-10">
        <div className="relative glass-strong px-8 py-4 rounded-2xl flex items-center justify-center border border-white/5 shadow-[0_0_50px_rgba(16,185,129,0.08)]">
          <div className="max-w-7xl w-full flex justify-center items-center">
            <div className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.location.reload()}>
              {/* Logo */}
              <div className="relative w-10 h-10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-[2px] bg-zinc-900 rounded-md flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400 group-hover:text-emerald-300 transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight leading-none text-white">JudgeLens</span>
                <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-[0.2em]">AI Evaluation Engine</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 relative">
        {status === AppStatus.IDLE && (
          <div className="max-w-4xl mx-auto space-y-20 py-24">
            {/* Hero Section */}
            <div className="text-center space-y-8 animate-in py-8">
              {/* Badge */}
              <div className="flex justify-center">
                <div className="inline-flex items-center px-4 py-2 bg-zinc-900/80 rounded-full text-[10px] font-medium uppercase tracking-[0.1em] text-zinc-400 border border-zinc-800">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                  Engine trained on 10,000+ winning projects
                </div>
              </div>
              
              {/* Main Heading */}
              <div className="py-4">
                <h1>
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1]">
                    <span className="text-white">Get Pre-Judged</span>
                  </span>
                  <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] mt-2">
                    <span className="text-zinc-400">By The </span>
                    <span className="text-emerald-400">Pros.</span>
                  </span>
                </h1>
              </div>
              
              {/* Subtitle */}
              <div className="max-w-2xl mx-auto px-4">
                <p className="text-lg md:text-xl text-zinc-400 leading-relaxed">
                  The first predictive analytics engine for hackathon teams.
                </p>
                <p className="text-base md:text-lg text-zinc-500 leading-relaxed mt-2">
                  Evaluate your proposal, find technical gaps, and refine your pitch before the submission deadline.
                </p>
              </div>
              
              {/* Stats Row */}
              <div className="flex justify-center gap-10 md:gap-16 pt-6">
                {[
                  { value: '10K+', label: 'Projects Analyzed' },
                  { value: '94%', label: 'Accuracy Rate' },
                  { value: '<5s', label: 'Analysis Time' }
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-emerald-400">{stat.value}</div>
                    <div className="text-[9px] md:text-[10px] font-medium text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Form Container with breathing glow */}
            <div className="relative group">
              {/* Outer glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 rounded-[28px] blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500 animate-[pulse_4s_ease-in-out_infinite]"></div>
              <div className="relative glass-strong p-1 rounded-3xl">
                <div className="bg-zinc-900/80 p-8 md:p-10 rounded-[22px] border border-zinc-800 hover:border-emerald-500/20 transition-colors duration-500">
                  <SubmissionForm 
                    onSubmit={handleSubmission} 
                    isLoading={false} 
                    initialData={submission || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Feature Cards with glow effects */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-10 stagger-children">
              {[
                { icon: 'fa-microscope', title: 'Deep Analysis', desc: 'Analyzing code structure, originality, and stack viability.', color: 'emerald' },
                { icon: 'fa-chart-pie', title: 'Predictive Odds', desc: 'Statistical probability of winning based on previous rubric data.', color: 'teal' },
                { icon: 'fa-wand-magic-sparkles', title: 'Iterative Fixes', desc: 'Real-time suggestions to maximize your final project score.', color: 'cyan' }
              ].map((feature, i) => (
                <div key={i} className="group relative">
                  {/* Hover glow effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r from-${feature.color}-500/0 via-${feature.color}-500/20 to-${feature.color}-500/0 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500`}></div>
                  <div className="relative glass p-6 rounded-2xl border border-zinc-800 group-hover:border-emerald-500/30 transition-all duration-300 h-full flex flex-col group-hover:shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                    {/* Icon with glow */}
                    <div className="relative w-12 h-12 mb-5">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative w-full h-full bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors duration-300">
                        <i className={`fas ${feature.icon} text-xl group-hover:scale-110 transition-transform duration-300`}></i>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-50 transition-colors duration-300">{feature.title}</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed flex-grow group-hover:text-zinc-400 transition-colors duration-300">{feature.desc}</p>
                    
                    {/* Learn More Button */}
                    <button 
                      onClick={() => setActiveFeature(feature.title)}
                      className="mt-5 flex items-center text-emerald-400 hover:text-emerald-300 transition-all duration-300 text-sm group/btn"
                    >
                      <span className="font-medium mr-2">Learn more</span>
                      <i className="fas fa-arrow-right text-xs group-hover/btn:translate-x-1 transition-transform duration-300"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {status === AppStatus.EVALUATING && (
          <div className="flex flex-col items-center justify-center py-32 space-y-10 animate-in">
            {/* Enhanced Processing Animation */}
            <div className="relative">
              {/* Outer pulsing rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-40 h-40 rounded-full border border-emerald-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-emerald-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite_0.5s]"></div>
              </div>
              
              {/* Main spinner container */}
              <div className="relative w-28 h-28">
                {/* Rotating gradient ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 animate-[spin_1.5s_linear_infinite] p-[3px]">
                  <div className="w-full h-full bg-zinc-900 rounded-full"></div>
                </div>
                
                {/* Secondary spinning ring */}
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-emerald-400/50 border-r-teal-400/30 animate-[spin_1s_linear_infinite_reverse]"></div>
                
                {/* Center icon with glow */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full animate-pulse"></div>
                    <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
                      <i className="fas fa-brain text-emerald-400 text-2xl animate-pulse"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-2 left-1/2 w-2 h-2 bg-emerald-400 rounded-full animate-[float-up_2s_ease-in-out_infinite]"></div>
              <div className="absolute -bottom-2 left-1/4 w-1.5 h-1.5 bg-teal-400 rounded-full animate-[float-up_2s_ease-in-out_infinite_0.5s]"></div>
              <div className="absolute top-1/4 -right-2 w-1.5 h-1.5 bg-emerald-300 rounded-full animate-[float-up_2s_ease-in-out_infinite_1s]"></div>
            </div>
            
            {/* Loading Text with typewriter effect */}
            <div className="text-center space-y-5">
              <h2 className="text-3xl font-bold text-white">
                <span className="bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
                  Analyzing Your Project
                </span>
                <span className="inline-flex ml-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-0.5 animate-[bounce_1s_ease-in-out_infinite]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-0.5 animate-[bounce_1s_ease-in-out_infinite_0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mx-0.5 animate-[bounce_1s_ease-in-out_infinite_0.4s]"></span>
                </span>
              </h2>
              
              {/* Agent status indicators */}
              <div className="flex flex-wrap justify-center gap-3 max-w-md mx-auto">
                {[
                  { icon: 'fa-gavel', label: 'Judge', delay: '0s' },
                  { icon: 'fa-eye', label: 'Skeptic', delay: '0.3s' },
                  { icon: 'fa-lightbulb', label: 'Mentor', delay: '0.6s' },
                  { icon: 'fa-chart-line', label: 'Benchmark', delay: '0.9s' }
                ].map((agent, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full border border-zinc-700/50 animate-[fade-slide-in_0.5s_ease-out_forwards] opacity-0"
                    style={{ animationDelay: agent.delay }}
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <i className={`fas ${agent.icon} text-emerald-400 text-[10px]`}></i>
                    </div>
                    <span className="text-xs text-zinc-400">{agent.label}</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Progress bar with shimmer */}
              <div className="w-72 mx-auto mt-6">
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-full animate-[shimmer-progress_2s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_ease-in-out_infinite]"></div>
                </div>
                <p className="text-zinc-600 text-xs mt-3 flex items-center justify-center gap-2">
                  <i className="fas fa-clock text-zinc-700"></i>
                  Estimated time: 3-5 seconds
                </p>
              </div>
            </div>
          </div>
        )}

        {status === AppStatus.RESULTS && evaluation && (
          <div className="py-12">
            <EvaluationResults result={evaluation} onReset={handleReset} />
          </div>
        )}

        {status === AppStatus.ERROR && (
          <div className="max-w-lg mx-auto py-32 text-center space-y-6 glass p-8 rounded-2xl border border-red-500/20">
            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-white">Something went wrong</h2>
              <p className="text-zinc-500 text-sm">{error || "The analysis couldn't be completed. Please try again."}</p>
            </div>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </main>

      {/* Feature Details Modal */}
      {activeFeature && featureDetails[activeFeature as keyof typeof featureDetails] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-3xl relative">
            {/* Close button */}
            <button 
              onClick={() => setActiveFeature(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all z-10"
            >
              <i className="fas fa-times"></i>
            </button>

            {/* Header with gradient */}
            <div className={`relative p-8 pb-6 border-b border-white/10 bg-gradient-to-r from-${featureDetails[activeFeature as keyof typeof featureDetails].color}-500/10 to-transparent`}>
              <div className="flex items-start space-x-6">
                {/* Icon */}
                <div className={`w-20 h-20 bg-gradient-to-br from-${featureDetails[activeFeature as keyof typeof featureDetails].color}-500/30 to-${featureDetails[activeFeature as keyof typeof featureDetails].color}-600/10 rounded-2xl flex items-center justify-center border border-${featureDetails[activeFeature as keyof typeof featureDetails].color}-500/30 shadow-lg`}>
                  <i className={`fas ${featureDetails[activeFeature as keyof typeof featureDetails].icon} text-${featureDetails[activeFeature as keyof typeof featureDetails].color}-400 text-3xl`}></i>
                </div>
                
                <div className="flex-1">
                  <p className={`text-${featureDetails[activeFeature as keyof typeof featureDetails].color}-400 text-xs font-bold uppercase tracking-widest mb-2`}>Feature Overview</p>
                  <h2 className="text-3xl font-black text-white mb-2">{featureDetails[activeFeature as keyof typeof featureDetails].title}</h2>
                  <p className="text-slate-400 text-lg">{featureDetails[activeFeature as keyof typeof featureDetails].subtitle}</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <p className="text-slate-300 text-lg leading-relaxed">
                {featureDetails[activeFeature as keyof typeof featureDetails].description}
              </p>
              
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4">
                {featureDetails[activeFeature as keyof typeof featureDetails].stats.map((stat, i) => (
                  <div key={i} className="glass p-4 rounded-2xl text-center">
                    <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-${featureDetails[activeFeature as keyof typeof featureDetails].color}-400 to-purple-400`}>{stat.value}</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Features Grid */}
              <div>
                <h3 className="text-lg font-black text-white mb-4 flex items-center">
                  <i className="fas fa-sparkles text-indigo-400 mr-3"></i>
                  Key Capabilities
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featureDetails[activeFeature as keyof typeof featureDetails].features.map((item, i) => (
                    <div key={i} className="glass p-5 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 bg-${featureDetails[activeFeature as keyof typeof featureDetails].color}-500/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <i className={`fas ${item.icon} text-${featureDetails[activeFeature as keyof typeof featureDetails].color}-400`}></i>
                        </div>
                        <div>
                          <h4 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{item.title}</h4>
                          <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center pt-4">
                <button 
                  onClick={() => setActiveFeature(null)}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl font-bold text-white transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/25"
                >
                  <i className="fas fa-rocket mr-2"></i>
                  Try It Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl p-8 relative">
            <button 
              onClick={() => setShowPrivacy(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Privacy Policy</h2>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p><strong className="text-white">Last Updated:</strong> January 2026</p>
              
              <h3 className="text-lg font-bold text-white mt-6">1. Information We Collect</h3>
              <p>JudgeLens AI collects project submission data including project titles, descriptions, target audiences, and technology stacks solely for the purpose of providing AI-powered evaluation services.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">2. How We Use Your Information</h3>
              <p>Your submission data is processed by our AI evaluation engine to generate scores, critiques, and improvement suggestions. We may temporarily cache results to improve performance but do not permanently store your project details.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">3. Data Security</h3>
              <p>We implement industry-standard security measures including encryption in transit, rate limiting, and input sanitization to protect your data from unauthorized access.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">4. Third-Party Services</h3>
              <p>We use third-party AI services (Google Gemini, OpenAI, Groq) to process evaluations. Your data is subject to their respective privacy policies during processing.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">5. Your Rights</h3>
              <p>You have the right to request deletion of any cached data associated with your submissions. Contact us for any privacy-related inquiries.</p>
              
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-3xl p-8 relative">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-all"
            >
              <i className="fas fa-times"></i>
            </button>
            <h2 className="text-2xl font-black text-white mb-6">Terms of Service</h2>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
              <p><strong className="text-white">Effective Date:</strong> January 2026</p>
              
              <h3 className="text-lg font-bold text-white mt-6">1. Acceptance of Terms</h3>
              <p>By using JudgeLens AI, you agree to these Terms of Service. If you do not agree, please do not use our service.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">2. Service Description</h3>
              <p>JudgeLens AI provides AI-powered hackathon project evaluation services. Our evaluations are generated by artificial intelligence and should be used as guidance only, not as definitive judgments.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">3. User Responsibilities</h3>
              <p>Users agree to: (a) provide accurate project information, (b) not submit malicious or harmful content, (c) not attempt to manipulate or abuse the AI system, (d) respect rate limits and fair usage policies.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">4. Intellectual Property</h3>
              <p>You retain all rights to your submitted project ideas and descriptions. JudgeLens AI does not claim ownership of your content. Our evaluation outputs are provided under a limited license for your personal use.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">5. Disclaimer of Warranties</h3>
              <p>JudgeLens AI is provided "as is" without warranties of any kind. AI-generated evaluations may not reflect actual hackathon judge opinions or outcomes.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">6. Limitation of Liability</h3>
              <p>JudgeLens AI shall not be liable for any damages arising from the use of our service, including but not limited to hackathon results or business decisions based on our evaluations.</p>
              
              <h3 className="text-lg font-bold text-white mt-6">7. Changes to Terms</h3>
              <p>We reserve the right to modify these terms at any time. Continued use after changes constitutes acceptance of the new terms.</p>
            </div>
          </div>
        </div>
      )}

      <footer className="mt-32 border-t border-zinc-800/50">
        <div className="py-12 px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
              {/* Logo & Branding */}
              <div className="flex flex-col items-center md:items-start space-y-2">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.location.reload()}>
                  <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-base font-semibold text-white">JudgeLens AI</span>
                </div>
                <p className="text-zinc-600 text-[10px] uppercase tracking-wider">v1.0.0</p>
              </div>
              
              {/* Navigation & Copyright */}
              <div className="flex flex-col items-center space-y-3">
                <div className="flex space-x-6 text-sm text-zinc-500">
                  <button onClick={() => setShowPrivacy(true)} className="hover:text-emerald-400 transition-colors">Privacy</button>
                  <button onClick={() => setShowTerms(true)} className="hover:text-emerald-400 transition-colors">Terms</button>
                </div>
                <p className="text-zinc-600 text-xs">&copy; {new Date().getFullYear()} JudgeLens AI</p>
              </div>

              {/* Made with love */}
              <div className="flex items-center space-x-1 text-zinc-500 text-sm">
                <span>Made with</span>
                <i className="fas fa-heart text-red-400 text-xs"></i>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
