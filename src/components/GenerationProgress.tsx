'use client';

interface GenerationProgressProps {
  step?: string;
  progress?: number;
  currentStep?: number;
  isGenerating?: boolean;
}

export function GenerationProgress({ step, progress, currentStep }: GenerationProgressProps) {
  const steps = [
    'Analyzing topic...',
    'Generating learning objectives...',
    'Creating workbook outline...',
    'Drafting sections...',
    'Creating exercises...',
    'Generating solutions...',
    'Identifying misconceptions...',
    'Validating content...',
    'Assembling workbook...',
    'Complete!'
  ];

  // Determine current progress based on available props
  let currentStepIndex: number;
  let actualProgress: number;
  let currentStepText: string;

  if (currentStep !== undefined) {
    // Using currentStep prop (newer pattern)
    currentStepIndex = Math.min(currentStep - 1, steps.length - 1);
    actualProgress = (currentStepIndex / (steps.length - 1)) * 100;
    currentStepText = steps[Math.max(0, currentStepIndex)] || 'Starting...';
  } else {
    // Using step/progress props (legacy pattern)
    currentStepIndex = step ? steps.findIndex(s => step.includes(s.split('.')[0])) : 0;
    actualProgress = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : (progress || 0);
    currentStepText = step || 'Starting...';
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800">Generating Workbook</h3>
        <span className="text-sm text-gray-600">{Math.round(actualProgress)}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${actualProgress}%` }}
        />
      </div>

      {/* Current Step */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Current Step:</p>
        <p className="text-gray-600">{currentStepText}</p>
      </div>

      {/* Step List */}
      <div className="space-y-2">
        {steps.map((stepText, index) => {
          const isCompleted = index < currentStepIndex || actualProgress >= 100;
          const isCurrent = index === currentStepIndex && actualProgress < 100;

          return (
            <div 
              key={index}
              className={`flex items-center text-sm ${
                isCompleted 
                  ? 'text-green-600' 
                  : isCurrent 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                isCompleted 
                  ? 'bg-green-600 text-white' 
                  : isCurrent 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300'
              }`}>
                {isCompleted ? '✓' : isCurrent ? '•' : '•'}
              </div>
              {stepText}
            </div>
          );
        })}
      </div>

      {/* Time Estimate */}
      {actualProgress < 100 && actualProgress > 0 && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Estimated time remaining: {Math.max(1, Math.round((100 - actualProgress) / 10))} minute(s)
        </div>
      )}
    </div>
  );
}