"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useLocalGallery } from '../hooks/useLocalGallery';
import { getUserSession } from '../utils/userSession';

const AIImageGenerator = dynamic(() => import("../components/ai_image_generator"), { ssr: false });
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false });
const UserInfo = dynamic(() => import("../components/user-info"), { ssr: false });
const GenerationLimitIndicator = dynamic(() => import("../components/generation-limit-indicator"), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Use local gallery hook for user-specific galleries
  const {
    images: generatedImages,
    stats,
    isLoading: galleryLoading,
    error: galleryError,
    storageInfo,
    addImage,
    removeImage,
    clearGallery,
    refreshGallery,
    exportData,
    importData,
    getUserId,
    formatStorageSize
  } = useLocalGallery();

  // Display user session info on component mount
  useEffect(() => {
    const session = getUserSession();
    console.log('User session:', {
      userId: session.userId,
      createdAt: session.createdAt,
      fingerprint: session.browserFingerprint
    });
  }, []);

  // Handle gallery export/import functions
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-800 to-gray-100 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200/40 via-slate-800/20 to-gray-200/40 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-purple-700/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>

        {/* Left Panel - Controls */}
        <div className="relative z-10 w-1/2 p-8 flex flex-col justify-center">
          <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-700/40 h-full flex flex-col">
            <h1 className="text-3xl font-bold mb-4 text-white text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              AI Image Generator
            </h1>
            <p className="text-gray-200 text-center mb-6 text-sm">
              Transform your ideas into stunning visuals with AI
            </p>

            {/* User Info Section */}
            <UserInfo />
            
            {/* Generation Limit Indicator */}
            <GenerationLimitIndicator />

            <div className="flex-1 flex flex-col space-y-4">
              {/* Image Upload Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-600/40 border-dashed rounded-xl cursor-pointer bg-slate-700/30 hover:bg-slate-800/40 transition-colors">
                    <div className="flex flex-col items-center justify-center">
                      <svg className="w-6 h-6 mb-2 text-purple-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                      </svg>
                      <p className="text-xs text-purple-300">
                        <span className="font-semibold">Upload image</span> to modify
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            setUploadedImage(e.target?.result as string);
                            setIsEditing(true);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>

                {uploadedImage && (
                  <div className="p-3 bg-slate-700/40 rounded-xl border border-slate-600/30">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">Original</h3>
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setIsEditing(false);
                        }}
                        className="px-2 py-1 text-xs bg-red-700/30 text-red-200 rounded hover:bg-red-800/40 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-full h-20 object-cover rounded-lg border border-slate-600/30"
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <input
                  className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/40 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent backdrop-blur-sm text-sm"
                  type="text"
                  placeholder={isEditing ? "Describe modifications..." : "Describe your image..."}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                />
              </div>

              <AIImageGenerator
                prompt={prompt}
                uploadedImage={uploadedImage}
                isEditing={isEditing}
                onGenerate={(url, filename, imageData) => {
                  setImageUrl(url);
                  // Image is already added to gallery in AIImageGenerator component
                  // No need to add it again here to avoid double-counting
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Generated Image */}
        <div className="relative z-10 w-1/2 p-8 flex flex-col justify-center">
          <div className="bg-slate-700/80 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-slate-600/40 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-white text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent w-full">
              Generated Image
            </h2>

            {imageUrl ? (
              <div className="flex-1 flex flex-col">
                <div className="flex-1 flex items-center justify-center mb-4">
                  <img
                    src={imageUrl}
                    alt="AI Generated"
                    className="max-w-full max-h-full rounded-lg shadow-lg border border-slate-600/30 object-contain"
                  />
                </div>

                {/* Download and Share Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = imageUrl;
                      link.download = `ai-generated-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex-1 px-4 py-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'AI Generated Image',
                          text: 'Check out this AI-generated image!',
                          url: imageUrl
                        });
                      } else {
                        navigator.clipboard.writeText(imageUrl);
                        alert('Image URL copied to clipboard!');
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    Share
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-lg font-medium">Your generated image will appear here</p>
                  <p className="text-sm opacity-75">Enter a prompt and click generate to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      {generatedImages.length > 0 && (
        <div className="relative z-10 w-full p-8">
          <div className="bg-gradient-to-br from-slate-200/40 via-slate-800/20 to-gray-200/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-600/30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-100/40 via-slate-800/20 to-gray-100/40"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(100,100,150,0.15),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(150,100,150,0.10),transparent_50%)]"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Your Personal Gallery
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    User ID: {getUserId().slice(0, 12)}... • Storage: {formatStorageSize(stats.storageSize)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {/* <button
                    onClick={handleExportGallery}
                    className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2 text-sm"
                    title="Export Gallery"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export</span>
                  </button> */}
                  {/* <button
                    onClick={handleImportGallery}
                    className="px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2 text-sm"
                    title="Import Gallery"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Import</span>
                  </button> */}
                  <button
                    onClick={() => {
                      generatedImages.forEach((image, index) => {
                        setTimeout(() => {
                          const link = document.createElement('a');
                          link.href = image.url;
                          link.download = `${image.filename || `ai-image-${image.id}.png`}`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }, index * 100);
                      });
                      alert(`Downloading ${generatedImages.length} images...`);
                    }}
                    className="px-3 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center space-x-2 text-sm"
                    title="Download All Images"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download All</span>
                  </button>
                </div>
              </div>

              <div className="relative min-h-[600px]">
                {/* Creative Stacked Layout */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 relative">
                  {generatedImages.map((image, index) => {
                    // Create different patterns based on index
                    const patterns = [
                      { rotation: -3, scale: 1.05, zIndex: index },
                      { rotation: 2, scale: 0.95, zIndex: index + 10 },
                      { rotation: -1, scale: 1.1, zIndex: index + 5 },
                      { rotation: 4, scale: 0.9, zIndex: index + 15 },
                      { rotation: -2, scale: 1.02, zIndex: index + 8 },
                      { rotation: 1, scale: 0.98, zIndex: index + 12 },
                      { rotation: -4, scale: 1.08, zIndex: index + 3 },
                      { rotation: 3, scale: 0.92, zIndex: index + 18 },
                    ];

                    const pattern = patterns[index % patterns.length];

                    return (
                      <div
                        key={image.id}
                        className="group relative transform transition-all duration-500 hover:scale-110 hover:rotate-0 hover:z-50"
                        style={{
                          transform: `rotate(${pattern.rotation}deg) scale(${pattern.scale})`,
                          zIndex: pattern.zIndex,
                        }}
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden rounded-lg shadow-2xl border-2 border-slate-600/30 hover:border-slate-400/40 transition-all duration-300">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Always Visible Action Buttons - Top Right */}
                          <div className="absolute top-2 right-2 flex space-x-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = image.url;
                                link.download = `${image.filename || `ai-image-${image.id}.png`}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="p-2 bg-green-500/90 rounded-lg hover:bg-green-600/90 transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110"
                              title="Download Image"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'AI Generated Image',
                                    text: `Check out this AI-generated image: "${image.prompt}"`,
                                    url: image.url
                                  }).catch((error) => {
                                    console.log('Share failed:', error);
                                    // Fallback to copying URL
                                    navigator.clipboard.writeText(image.url);
                                    alert('Image URL copied to clipboard!');
                                  });
                                } else {
                                  navigator.clipboard.writeText(image.url).then(() => {
                                    alert('Image URL copied to clipboard!');
                                  }).catch(() => {
                                    // Fallback for older browsers
                                    const textArea = document.createElement('textarea');
                                    textArea.value = image.url;
                                    document.body.appendChild(textArea);
                                    textArea.select();
                                    document.execCommand('copy');
                                    document.body.removeChild(textArea);
                                    alert('Image URL copied to clipboard!');
                                  });
                                }
                              }}
                              className="p-2 bg-blue-500/90 rounded-lg hover:bg-blue-600/90 transition-all duration-200 backdrop-blur-sm shadow-lg hover:scale-110"
                              title="Share Image"
                            >
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                              </svg>
                            </button>
                          </div>

                          {/* Hover Overlay with Enhanced Info */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-800/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              {/* Status Badge */}
                              <div className="flex justify-center mb-2">
                                {image.isEdited ? (
                                  <span className="px-3 py-1 text-xs bg-purple-600/90 text-white rounded-full backdrop-blur-sm font-medium">
                                    ✨ Edited
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs bg-green-600/90 text-white rounded-full backdrop-blur-sm font-medium">
                                    🎨 Generated
                                  </span>
                                )}
                              </div>

                              {/* Prompt Preview */}
                              {/* <div className="text-center mb-3">
                                <p className="text-xs text-gray-200 line-clamp-2 px-2">
                                  "{image.prompt}"
                                </p>
                              </div> */}

                              {/* Enhanced Action Buttons */}
                              {/* <div className="flex justify-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const link = document.createElement('a');
                                    link.href = image.url;
                                    link.download = `${image.filename || `ai-image-${image.id}.png`}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                  }}
                                  className="px-3 py-2 bg-green-600/90 rounded-lg hover:bg-green-700/90 transition-colors backdrop-blur-sm flex items-center space-x-1"
                                  title="Download Image"
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-xs text-white font-medium">Download</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (navigator.share) {
                                      navigator.share({
                                        title: 'AI Generated Image',
                                        text: `Check out this AI-generated image: "${image.prompt}"`,
                                        url: image.url
                                      }).catch((error) => {
                                        console.log('Share failed:', error);
                                        navigator.clipboard.writeText(image.url);
                                        alert('Image URL copied to clipboard!');
                                      });
                                    } else {
                                      navigator.clipboard.writeText(image.url).then(() => {
                                        alert('Image URL copied to clipboard!');
                                      }).catch(() => {
                                        const textArea = document.createElement('textarea');
                                        textArea.value = image.url;
                                        document.body.appendChild(textArea);
                                        textArea.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(textArea);
                                        alert('Image URL copied to clipboard!');
                                      });
                                    }
                                  }}
                                  className="px-3 py-2 bg-blue-600/90 rounded-lg hover:bg-blue-700/90 transition-colors backdrop-blur-sm flex items-center space-x-1"
                                  title="Share Image"
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                  </svg>
                                  <span className="text-xs text-white font-medium">Share</span>
                                </button>
                              </div> */}
                            </div>
                          </div>

                          {/* Subtle Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-700/10 to-pink-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Floating Info Badge */}
                        <div className="absolute -top-2 -right-2 bg-slate-800/10 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs text-white">#{index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-purple-700/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-700/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-slate-800/10 rounded-full blur-xl"></div>
                </div>
              </div>

              {/* Gallery Actions */}
              {generatedImages.length > 0 && (
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={refreshGallery}
                    className="px-4 py-2 bg-blue-700/30 text-blue-200 rounded-xl hover:bg-blue-800/50 transition-colors flex items-center space-x-2"
                    title="Refresh Gallery"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to clear all ${generatedImages.length} images from your gallery? This action cannot be undone.`)) {
                        const success = clearGallery();
                        if (success) {
                          alert('Gallery cleared successfully!');
                        } else {
                          alert('Failed to clear gallery');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-red-700/30 text-red-200 rounded-xl hover:bg-red-800/50 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Clear Gallery</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
