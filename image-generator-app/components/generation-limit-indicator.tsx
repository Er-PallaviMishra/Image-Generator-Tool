"use client";

import { useUserGenerationLimit } from '../hooks/useUserGenerationLimit';

export default function GenerationLimitIndicator() {
  const { limitInfo, canGenerate, remaining, isLoading } = useUserGenerationLimit();

  if (isLoading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-3 border border-slate-600/30">
        <div className="animate-pulse flex items-center space-x-2">
          <div className="w-4 h-4 bg-slate-600 rounded-full"></div>
          <div className="w-24 h-4 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-lg p-3 border border-slate-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            canGenerate ? 'bg-green-400' : 'bg-red-400'
          }`}></div>
          <span className="text-sm font-medium text-white">
            Generation Limit
          </span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-bold ${
            canGenerate ? 'text-green-300' : 'text-red-300'
          }`}>
            {remaining} / {limitInfo.max}
          </span>
          <p className="text-xs text-gray-400">remaining</p>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mt-2">
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full transition-all duration-300 ${
              canGenerate ? 'bg-gradient-to-r from-green-400 to-blue-400' : 'bg-gradient-to-r from-orange-400 to-red-400'
            }`}
            style={{ width: `${((limitInfo.max - remaining) / limitInfo.max) * 100}%` }}
          />
        </div>
      </div>

      {/* Limit status */}
      {!canGenerate && (
        <p className="text-xs text-gray-500 mt-1">
          Limit reached - contact info@technioz.com for more access
        </p>
      )}
    </div>
  );
}
