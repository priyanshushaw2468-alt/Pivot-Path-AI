import React, { useState, useEffect } from 'react';
import { AppScreen, UserProfile, RoadmapData } from './types';
import { generateCareerRoadmap } from './services/geminiService';
import { IntakeWizard } from './components/IntakeWizard';
import { 
    ChevronRight, 
    ChevronLeft,
    CheckCircle, 
    AlertCircle, 
    Download, 
    Share2, 
    Clock, 
    BookOpen,
    Target,
    FileSearch
} from './components/Icons';

// --- Sample Data ---

const SAMPLE_PROFILE: UserProfile = {
  resumeText: "Sample Resume",
  currentRole: "Marketing Coordinator",
  targetRole: "UX Designer",
  targetIndustry: "SaaS / Tech",
  topSkills: ["Graphic Design", "Social Media Management", "Content Creation", "Empathy"],
  learningStyle: "Visual"
};

const SAMPLE_ROADMAP: RoadmapData = {
  summary: "This roadmap bridges the gap between Marketing and UX Design by leveraging your existing visual skills and user empathy, while building technical proficiency in prototyping and formal user research methodologies.",
  currentAnalysis: "Your background in Marketing provides a strong foundation in understanding user personas, brand consistency, and storytelling—critical soft skills for UX.",
  gapAnalysis: [
    "User Research Methodologies",
    "Wireframing & Prototyping (Figma)",
    "Information Architecture",
    "Usability Testing"
  ],
  estimatedTotalTime: "4-5 Months",
  atsAnalysis: {
    score: 42,
    matchLevel: "Low",
    missingKeywords: ["Figma", "User Flows", "Prototyping", "Usability Testing", "Wireframing", "HCI"],
    formattingIssues: ["Resume is creative but not ATS-friendly (graphics parsed incorrectly)", "Missing standard 'Skills' section header"],
    tips: [
      "Replace the skill bars/graphs with a standard text list.",
      "Add a 'Projects' section highlighting specific UX case studies, even if they are conceptual.",
      "Incorporate standard UX terminology (e.g., 'User-Centered Design') into your experience descriptions."
    ]
  },
  timeline: [
    {
      title: "Foundations of UX & Design Thinking",
      duration: "Month 1",
      description: "Master the core principles of User Experience design, focusing on the 'why' before the 'how'.",
      keyActions: [
        "Complete Google UX Design Certificate Course 1 & 2",
        "Read 'The Design of Everyday Things' by Don Norman",
        "Practice analyzing apps you use daily for usability issues"
      ],
      resources: [
        { title: "Google UX Design Certificate", type: "Course", provider: "Coursera", url: "#" },
        { title: "The Design of Everyday Things", type: "Book", provider: "Don Norman", url: "#" }
      ]
    },
    {
      title: "Technical Tooling (Figma)",
      duration: "Month 2-3",
      description: "Get hands-on with industry standard tools to translate concepts into visuals.",
      keyActions: [
        "Recreate 3 popular app interfaces in Figma (Pixel perfect copy)",
        "Learn auto-layout, components, and prototyping features",
        "Participate in daily UI challenges"
      ],
      resources: [
        { title: "Figma 101 Crash Course", type: "Course", provider: "YouTube", url: "#" },
        { title: "Refactoring UI", type: "Book", provider: "Adam Wathan", url: "#" }
      ]
    },
     {
      title: "Portfolio & Case Studies",
      duration: "Month 4-5",
      description: "Apply your skills to create 2-3 comprehensive case studies that solve real problems.",
      keyActions: [
        "Conduct a personal project from research to high-fidelity prototype",
        "Document your process: Problem, Research, Solution, Testing",
        "Build a portfolio website using a simple builder"
      ],
      resources: [
        { title: "Portfolio Inspiration", type: "Article", provider: "Bestfolios", url: "#" },
        { title: "Webflow for Designers", type: "Tool", provider: "Webflow", url: "#" }
      ]
    }
  ]
};

// --- Helper Components ---

const Gauge: React.FC<{ score: number }> = ({ score }) => {
    const radius = 30;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    let colorClass = 'text-red-500';
    if (score >= 50) colorClass = 'text-amber-500';
    if (score >= 80) colorClass = 'text-green-500';

    return (
        <div className="relative flex items-center justify-center">
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset: 0 }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="text-slate-100"
                />
                <circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={colorClass}
                />
            </svg>
            <span className={`absolute text-sm font-bold ${colorClass}`}>{score}</span>
        </div>
    );
};

// --- Screen Components ---

const HomeScreen: React.FC<{ onStart: () => void; onViewSample: () => void }> = ({ onStart, onViewSample }) => (
  <div className="min-h-screen flex flex-col relative overflow-hidden">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-100/50 rounded-full blur-3xl -z-10 opacity-60 mix-blend-multiply filter pointer-events-none"></div>
    <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl -z-10 opacity-50 mix-blend-multiply filter pointer-events-none"></div>

    <header className="p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="font-display font-bold text-2xl tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-serif shadow-lg shadow-blue-500/20">P</div>
            PivotPath AI
        </div>
        <nav className="hidden sm:flex gap-8 text-sm font-medium text-slate-600">
            <button className="hover:text-blue-600 transition-colors">How it works</button>
            <button className="hover:text-blue-600 transition-colors">Pricing</button>
            <button className="text-blue-600">Login</button>
        </nav>
    </header>

    <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto pb-20 mt-10 md:mt-0">
        <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                AI-Powered Career Coach
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-[1.1]">
                Pivot your career with <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">intelligent precision.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                Don't just guess your next move. Upload your resume and let our AI build a data-driven bridge to your dream role.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button 
                    onClick={onStart}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
                >
                    Build My Roadmap
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        <ChevronRight />
                    </span>
                </button>
                <button 
                    onClick={onViewSample}
                    className="px-8 py-4 text-lg font-medium text-slate-600 hover:text-slate-900 transition-colors bg-white/50 hover:bg-white rounded-full border border-transparent hover:border-slate-200 hover:shadow-sm"
                >
                    View Sample
                </button>
            </div>
        </div>

        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl animate-fade-in delay-200">
            {[
                { icon: <Target className="text-blue-600" />, title: 'Identify Skill Gaps', text: 'See exactly what you are missing for your target role.' },
                { icon: <BookOpen className="text-purple-600" />, title: 'Curated Resources', text: 'Get specific courses, books, and projects to fill those gaps.' },
                { icon: <Clock className="text-amber-600" />, title: 'Realistic Timeline', text: 'A week-by-week plan tailored to your learning style.' }
            ].map((item, i) => (
                <div key={i} className="p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-white rounded-xl mb-4 flex items-center justify-center shadow-sm border border-slate-100">
                        {item.icon}
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2 font-display">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                </div>
            ))}
        </div>
    </main>

    <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
            <span>© 2024 PivotPath AI.</span>
            <span className="mt-2 md:mt-0 flex gap-4">
                <a href="#" className="hover:text-slate-600">Privacy</a>
                <a href="#" className="hover:text-slate-600">Terms</a>
            </span>
        </div>
    </footer>
  </div>
);

const ProcessingScreen: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const messages = [
        "Scanning resume...", 
        "Analyzing skill gaps...", 
        "Checking ATS compatibility...", 
        "Generating milestones...",
        "Curating resources...",
        "Finalizing roadmap..."
    ];
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % messages.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-10">
                <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center animate-pulse">
                             <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                         </div>
                    </div>
                </div>
                
                <div className="space-y-2 h-16">
                    <h2 className="text-2xl font-display font-bold text-slate-900 transition-opacity duration-300">
                        {messages[msgIndex]}
                    </h2>
                    <p className="text-slate-500">Please wait while we engineer your career path.</p>
                </div>

                <button onClick={onCancel} className="text-sm text-slate-400 hover:text-slate-600 font-medium underline transition-colors">
                    Cancel & Go Back
                </button>
            </div>
        </div>
    );
};

const ErrorScreen: React.FC<{ message: string; onRetry: () => void; onBack: () => void }> = ({ message, onRetry, onBack }) => (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-red-100 max-w-md text-center w-full">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Generation Failed</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">{message}</p>
            <div className="space-y-3">
                <button 
                    onClick={onRetry}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-medium shadow-lg shadow-slate-200"
                >
                    Try Again
                </button>
                <button 
                    onClick={onBack}
                    className="w-full bg-white text-slate-600 py-3 rounded-xl hover:bg-slate-50 border border-slate-200 transition-colors font-medium"
                >
                    Back to Start
                </button>
            </div>
        </div>
    </div>
);

const ResultsDashboard: React.FC<{ 
    data: RoadmapData; 
    profile: UserProfile; 
    onExport: () => void;
    onEdit: () => void;
}> = ({ data, profile, onExport, onEdit }) => {
    
    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Top Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onEdit}
                        className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Back to inputs"
                    >
                        <ChevronLeft />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-serif text-sm">P</div>
                        <span className="font-display font-bold text-slate-800 hidden sm:inline">PivotPath AI</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={onExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                        <Download /> <span className="hidden sm:inline">Export</span>
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-slate-900/10">
                        <span>Save Roadmap</span>
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Col: Sidebar (Sticky on Desktop) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        
                        {/* Summary Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                            
                            <div className="relative">
                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-md mb-3">
                                    Target Role
                                </div>
                                <h2 className="text-2xl font-display font-bold text-slate-900 mb-1">{profile.targetRole}</h2>
                                <div className="text-sm font-medium text-slate-400 mb-5">{profile.targetIndustry}</div>
                                
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                    {data.summary}
                                </p>

                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100">
                                        <Clock />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Estimated Time</div>
                                        <div className="text-sm font-bold text-slate-900">{data.estimatedTotalTime}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ATS Scanner Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 font-display font-bold text-slate-800">
                                    <FileSearch className="text-blue-500" /> 
                                    <span>ATS Score</span>
                                </div>
                                <Gauge score={data.atsAnalysis.score} />
                            </div>
                            
                            <div className="space-y-5">
                                {data.atsAnalysis.missingKeywords.length > 0 && (
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Missing Keywords</div>
                                        <div className="flex flex-wrap gap-2">
                                            {data.atsAnalysis.missingKeywords.slice(0, 5).map((kw, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-md border border-red-100 font-medium">
                                                    {kw}
                                                </span>
                                            ))}
                                            {data.atsAnalysis.missingKeywords.length > 5 && (
                                                <span className="px-2 py-1 text-slate-400 text-xs">+ {data.atsAnalysis.missingKeywords.length - 5} more</span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide">Optimization Tips</div>
                                    {data.atsAnalysis.tips.slice(0, 3).map((tip, i) => (
                                        <div key={i} className="flex gap-3 items-start text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <div className="mt-1 min-w-[16px]"><CheckCircle /></div>
                                            <span className="leading-snug">{tip}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Gap Analysis */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/60">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Skill Gap Analysis</div>
                            <ul className="space-y-0 divide-y divide-slate-100">
                                {data.gapAnalysis.map((gap, i) => (
                                    <li key={i} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 text-sm text-slate-700">
                                        <div className="w-1.5 h-1.5 mt-2 rounded-full bg-amber-400 shrink-0" />
                                        {gap}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Right Col: Timeline */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Target /></div>
                                Your Strategic Roadmap
                            </h3>
                        </div>

                        <div className="relative ml-3 md:ml-4 space-y-12 before:absolute before:left-[19px] md:before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                            {data.timeline.map((milestone, idx) => (
                                <div key={idx} className="relative pl-12 md:pl-16 animate-fade-in" style={{ animationDelay: `${idx * 100}ms` }}>
                                    {/* Number/Dot */}
                                    <div className="absolute left-0 md:left-2 top-0 w-10 h-10 md:w-14 md:h-14 rounded-full bg-white border-4 border-blue-50 text-blue-600 font-bold flex items-center justify-center shadow-sm z-10 text-sm md:text-base">
                                        {idx + 1}
                                    </div>
                                    
                                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200 hover:border-blue-200 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                                            <h4 className="text-lg font-bold text-slate-900 font-display">{milestone.title}</h4>
                                            <span className="text-xs font-bold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full uppercase tracking-wide w-fit shadow-sm">
                                                {milestone.duration}
                                            </span>
                                        </div>
                                        
                                        <p className="text-slate-600 mb-5 text-sm leading-relaxed">{milestone.description}</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Actions */}
                                            <div>
                                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <span className="w-1 h-1 bg-slate-400 rounded-full"></span> Priorities
                                                </div>
                                                <ul className="space-y-2">
                                                    {milestone.keyActions.map((action, actionIdx) => (
                                                        <li key={actionIdx} className="text-sm text-slate-700 flex items-start gap-2.5">
                                                            <div className="w-4 h-4 mt-0.5 text-blue-500 shrink-0">
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                                            </div>
                                                            <span className="leading-snug">{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Resources */}
                                            <div className="bg-white rounded-xl border border-slate-200 p-4">
                                                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <BookOpen className="w-3 h-3" /> Resources
                                                </div>
                                                <div className="space-y-3">
                                                    {milestone.resources.map((res, rIdx) => (
                                                        <a 
                                                            key={rIdx} 
                                                            href={res.url || "#"} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all">
                                                                {res.type[0]}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">{res.title}</div>
                                                                <div className="text-xs text-slate-400 truncate">{res.provider || res.type}</div>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExportScreen: React.FC<{ 
    onBack: () => void 
}> = ({ onBack }) => (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl max-w-lg w-full text-center space-y-8 animate-fade-in relative z-10 border border-slate-100">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm transform rotate-3">
                <CheckCircle />
            </div>
            
            <div>
                <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Roadmap Ready!</h2>
                <p className="text-slate-500">Your strategic career plan has been generated.</p>
            </div>
            
            <div className="grid gap-4">
                <button className="flex items-center justify-center gap-4 p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-blue-300 hover:shadow-md transition-all group bg-white">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Download />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-slate-800 text-lg">Download PDF</div>
                        <div className="text-xs text-slate-400">High-quality format for printing</div>
                    </div>
                </button>
                
                <button className="flex items-center justify-center gap-4 p-5 border border-slate-200 rounded-2xl hover:bg-slate-50 hover:border-purple-300 hover:shadow-md transition-all group bg-white">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Share2 />
                    </div>
                    <div className="text-left flex-1">
                        <div className="font-bold text-slate-800 text-lg">Share Link</div>
                        <div className="text-xs text-slate-400">Public link for mentors & friends</div>
                    </div>
                </button>
            </div>

            <div className="pt-8 border-t border-slate-100">
                <button onClick={onBack} className="text-slate-400 hover:text-slate-700 text-sm font-medium transition-colors">
                    Back to Dashboard
                </button>
            </div>
        </div>
    </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleStart = () => setScreen('wizard');

  const handleWizardComplete = async (data: UserProfile) => {
    setUserData(data);
    setScreen('processing');
    try {
        const result = await generateCareerRoadmap(data);
        setRoadmap(result);
        setScreen('results');
    } catch (err) {
        setErrorMsg("We couldn't generate your roadmap. Please check your connection or try entering more detailed info.");
        setScreen('error');
    }
  };

  const handleRetry = () => {
    if (userData) {
        handleWizardComplete(userData);
    } else {
        setScreen('wizard');
    }
  };

  const handleViewSample = () => {
    setUserData(SAMPLE_PROFILE);
    setRoadmap(SAMPLE_ROADMAP);
    setScreen('results');
  };

  return (
    <>
        {screen === 'home' && <HomeScreen onStart={handleStart} onViewSample={handleViewSample} />}
        {screen === 'wizard' && (
            <IntakeWizard 
                onComplete={handleWizardComplete} 
                onCancel={() => setScreen('home')}
                initialData={userData} 
            />
        )}
        {screen === 'processing' && <ProcessingScreen onCancel={() => setScreen('wizard')} />}
        {screen === 'results' && userData && roadmap && (
            <ResultsDashboard 
                data={roadmap} 
                profile={userData} 
                onExport={() => setScreen('export')}
                onEdit={() => setScreen('wizard')} 
            />
        )}
        {screen === 'export' && <ExportScreen onBack={() => setScreen('results')} />}
        {screen === 'error' && (
            <ErrorScreen 
                message={errorMsg} 
                onRetry={handleRetry} 
                onBack={() => setScreen('home')}
            />
        )}
    </>
  );
};

export default App;