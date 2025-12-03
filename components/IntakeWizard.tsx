import React, { useState } from 'react';
import { UserProfile } from '../types';
import { ChevronRight, ChevronLeft, UploadCloud, CheckCircle } from './Icons';

interface IntakeWizardProps {
  onComplete: (data: UserProfile) => void;
  onCancel: () => void;
  initialData?: UserProfile | null;
}

const STEPS = ['Resume', 'Current Role', 'Pivot Goal', 'Skills', 'Style'];

export const IntakeWizard: React.FC<IntakeWizardProps> = ({ onComplete, onCancel, initialData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<UserProfile>(initialData || {
    resumeText: '',
    currentRole: '',
    targetRole: '',
    targetIndustry: '',
    topSkills: [],
    learningStyle: 'Mixed',
  });
  const [tempSkill, setTempSkill] = useState('');

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  const updateField = (field: keyof UserProfile, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleResumeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isBinary = file.type.includes('pdf') || file.type.includes('image');
      const reader = new FileReader();

      if (isBinary) {
        reader.onload = (event) => {
          const result = event.target?.result as string;
          const base64Data = result.split(',')[1];
          setFormData(prev => ({
            ...prev,
            resumeData: {
              mimeType: file.type,
              data: base64Data
            },
            resumeFileName: file.name,
            resumeText: ''
          }));
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setFormData(prev => ({
            ...prev,
            resumeText: text,
            resumeData: undefined,
            resumeFileName: file.name
          }));
        };
        reader.readAsText(file);
      }
    }
  };

  const removeFile = () => {
    setFormData(prev => ({
        ...prev,
        resumeFileName: undefined,
        resumeData: undefined,
        resumeText: ''
    }));
  };

  const addSkill = () => {
    if (tempSkill.trim()) {
      updateField('topSkills', [...formData.topSkills, tempSkill.trim()]);
      setTempSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    updateField('topSkills', formData.topSkills.filter(s => s !== skillToRemove));
  };

  // --- Step Components ---

  const StepResume = () => (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-slate-900">Let's start with your background</h2>
        <p className="text-slate-500 text-lg">Upload your resume to help us analyze your transferable skills.</p>
      </div>
      
      {!formData.resumeFileName ? (
        <div className="space-y-6">
            <div className="group relative border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all bg-slate-50 cursor-pointer">
                <input 
                type="file" 
                id="resume-upload" 
                accept=".txt,.md,.pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                onChange={handleResumeFile}
                />
                <div className="flex flex-col items-center pointer-events-none">
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud />
                    </div>
                    <span className="text-lg font-bold text-slate-700 mb-1">Click to upload Resume</span>
                    <span className="text-sm text-slate-400">PDF, JPG, or TXT supported</span>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
                    <span className="bg-white px-4 text-slate-400">Or paste text</span>
                </div>
            </div>

            <textarea
                className="w-full h-40 p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none resize-none text-sm text-slate-700 shadow-sm transition-all"
                placeholder="Paste your resume content here..."
                value={formData.resumeText}
                onChange={(e) => updateField('resumeText', e.target.value)}
            />
        </div>
      ) : (
        <div className="p-8 bg-blue-50/50 border border-blue-200 rounded-2xl flex items-center justify-between animate-fade-in shadow-sm">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl text-blue-600 shadow-sm border border-blue-100">
                   <UploadCloud /> 
                </div>
                <div>
                    <div className="font-bold text-slate-800 text-lg">{formData.resumeFileName}</div>
                    <div className="text-sm text-slate-500 flex items-center gap-1">
                        <CheckCircle /> Upload Complete
                    </div>
                </div>
            </div>
            <button 
                onClick={removeFile}
                className="text-sm text-red-500 hover:text-red-700 font-bold px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
                Change
            </button>
        </div>
      )}
    </div>
  );

  const StepRole = () => (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-slate-900">Current Status</h2>
        <p className="text-slate-500 text-lg">What is your current or most recent job title?</p>
      </div>
      <div className="max-w-md mx-auto">
        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Current Role</label>
        <input
            type="text"
            className="w-full p-5 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-lg shadow-sm transition-all placeholder:text-slate-300"
            placeholder="e.g. Marketing Manager"
            value={formData.currentRole}
            onChange={(e) => updateField('currentRole', e.target.value)}
            autoFocus
        />
      </div>
    </div>
  );

  const StepTarget = () => (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-slate-900">The Destination</h2>
        <p className="text-slate-500 text-lg">Where do you want to take your career next?</p>
      </div>
      
      <div className="space-y-6 max-w-md mx-auto">
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Target Role</label>
            <input
                type="text"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all"
                placeholder="e.g. Product Manager"
                value={formData.targetRole}
                onChange={(e) => updateField('targetRole', e.target.value)}
                autoFocus
            />
        </div>
        <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Target Industry (Optional)</label>
            <input
                type="text"
                className="w-full p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm transition-all"
                placeholder="e.g. Fintech, HealthTech"
                value={formData.targetIndustry}
                onChange={(e) => updateField('targetIndustry', e.target.value)}
            />
        </div>
      </div>
    </div>
  );

  const StepSkills = () => (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-slate-900">Your Toolkit</h2>
        <p className="text-slate-500 text-lg">What are your superpowers? Add 3-5 key skills.</p>
      </div>

      <div className="max-w-lg mx-auto">
        <div className="flex gap-3 mb-6">
            <input
                type="text"
                className="flex-1 p-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none shadow-sm"
                placeholder="Type a skill & press Enter"
                value={tempSkill}
                onChange={(e) => setTempSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                autoFocus
            />
            <button 
                onClick={addSkill}
                className="px-6 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-bold shadow-md transition-all active:scale-95"
            >
                Add
            </button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[120px] content-start p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
            {formData.topSkills.map((skill, idx) => (
                <span key={idx} className="animate-fade-in inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-700 text-sm font-medium border border-slate-200 shadow-sm group hover:border-blue-300 transition-colors">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="ml-2 text-slate-400 hover:text-red-500 transition-colors">×</button>
                </span>
            ))}
            {formData.topSkills.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-sm">
                    Skills will appear here...
                </div>
            )}
        </div>
      </div>
    </div>
  );

  const StepStyle = () => (
    <div className="space-y-8 animate-slide-in">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-bold font-display text-slate-900">Learning Style</h2>
        <p className="text-slate-500 text-lg">How do you prefer to digest new information?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {[
            { id: 'Visual', label: 'Visual', desc: 'Videos & Charts' },
            { id: 'Hands-on', label: 'Hands-on', desc: 'Projects & Labs' },
            { id: 'Reading', label: 'Reading', desc: 'Articles & Books' },
            { id: 'Mixed', label: 'Mixed', desc: 'A bit of everything' }
        ].map((item) => (
            <button
                key={item.id}
                onClick={() => updateField('learningStyle', item.id)}
                className={`p-6 rounded-2xl border-2 text-left transition-all duration-200 group relative overflow-hidden ${
                    formData.learningStyle === item.id
                    ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md ring-2 ring-blue-200 ring-offset-2' 
                    : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm text-slate-600'
                }`}
            >
                <span className="font-bold text-lg block mb-1">{item.label}</span>
                <span className={`text-xs ${formData.learningStyle === item.id ? 'text-blue-600' : 'text-slate-400'}`}>{item.desc}</span>
                {formData.learningStyle === item.id && (
                    <div className="absolute top-4 right-4 text-blue-500"><CheckCircle /></div>
                )}
            </button>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
        case 0: return <StepResume />;
        case 1: return <StepRole />;
        case 2: return <StepTarget />;
        case 3: return <StepSkills />;
        case 4: return <StepStyle />;
        default: return <StepResume />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative">
       {/* Background */}
       <div className="absolute inset-0 bg-slate-50/50"></div>
       <div className="absolute top-0 left-0 w-full h-2 bg-slate-200 z-10">
            <div 
                className="bg-blue-600 h-full transition-all duration-500 ease-out" 
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            />
       </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative z-20 border border-slate-100 min-h-[600px] flex flex-col">
        <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-bold">
                    {currentStep + 1}
                </span>
                <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                    / {STEPS.length} {STEPS[currentStep]}
                </span>
            </div>
            
            <button onClick={onCancel} className="text-xs font-medium text-slate-400 hover:text-slate-600">
                Cancel
            </button>
        </div>

        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
            {renderStep()}
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <button 
                onClick={handleBack}
                disabled={currentStep === 0 && !initialData} // Enable back on step 0 if we can cancel/go back to dashboard
                className={`flex items-center px-6 py-3 rounded-xl font-bold transition-colors ${
                    currentStep === 0 && !initialData
                    ? 'text-slate-300 cursor-not-allowed' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
            >
                <ChevronLeft /> <span className="ml-2">Back</span>
            </button>
            <button 
                onClick={handleNext}
                className="flex items-center bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all transform hover:-translate-y-0.5 font-bold"
            >
                <span>{currentStep === STEPS.length - 1 ? 'Generate Roadmap' : 'Continue'}</span>
                {currentStep !== STEPS.length - 1 && <div className="ml-2"><ChevronRight /></div>}
            </button>
        </div>
      </div>
    </div>
  );
};