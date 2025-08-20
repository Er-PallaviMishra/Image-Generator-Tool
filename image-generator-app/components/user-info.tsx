"use client";

import { useState, useEffect } from 'react';
import { useLocalGallery } from '../hooks/useLocalGallery';
import { getUserSession, clearUserSession } from '../utils/userSession';

export default function UserInfo() {
  const [showDetails, setShowDetails] = useState(false);
  const {
    stats,
    storageInfo,
    formatStorageSize,
    getUserId,
    exportData,
    importData,
    clearGallery
  } = useLocalGallery();

  const handleResetUser = () => {
    if (confirm("Are you sure you want to reset your user session? This will clear your current gallery and create a new user ID. This action cannot be undone.")) {
      clearGallery();
      clearUserSession();
      window.location.reload();
    }
  };

  const handleExportGallery = () => {
    try {
      const data = exportData();
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-gallery-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Gallery exported successfully!');
      }
    } catch (error) {
      console.error('Error exporting gallery:', error);
      alert('Failed to export gallery');
    }
  };

  const handleImportGallery = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = e.target?.result as string;
            const success = importData(data);
            if (success) {
              alert('Gallery imported successfully!');
            } else {
              alert('Failed to import gallery');
            }
          } catch (error) {
            console.error('Error importing gallery:', error);
            alert('Invalid gallery file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const session = getUserSession();
  const storageUsagePercent = (stats.storageSize / (5 * 1024 * 1024)) * 100; // 5MB limit

  return (
    <div className="bg-slate-800/80 backdrop-blur-lg rounded-xl p-4 border border-slate-600/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-white font-medium text-sm">User {getUserId().slice(0, 8)}...</p>
            <p className="text-gray-400 text-xs">{stats.totalImages} images • {formatStorageSize(stats.storageSize)}</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className={`w-4 h-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 space-y-4 border-t border-slate-600/30 pt-4">
          {/* Storage Info */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Storage Usage</span>
              <span className="text-white">{storageUsagePercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(storageUsagePercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatStorageSize(storageInfo.spaceLeft)} remaining
            </p>
          </div>

          {/* Gallery Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-400">{stats.generatedImages}</p>
              <p className="text-xs text-gray-400">Generated</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-400">{stats.editedImages}</p>
              <p className="text-xs text-gray-400">Edited</p>
            </div>
          </div>

          {/* Session Info */}
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Session Created</p>
            <p className="text-sm text-white">{new Date(session.createdAt).toLocaleDateString()}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {session.userId}</p>
          </div>

          {/* Actions */}
          {/* <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportGallery}
              className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center justify-center space-x-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export</span>
            </button>
            
            <button
              onClick={handleImportGallery}
              className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm flex items-center justify-center space-x-1"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Import</span>
            </button>
          </div> */}

          {/* <button
            onClick={handleResetUser}
            className="w-full px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center justify-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Reset User Session</span>
          </button> */}
        </div>
      )}
    </div>
  );
}
