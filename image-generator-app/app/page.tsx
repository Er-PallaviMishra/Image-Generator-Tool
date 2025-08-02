"use client"
import Image from "next/image";
import { useState } from "react";
import dynamic from "next/dynamic";

const AIImageGenerator = dynamic(() => import("../components/ai_image_generator"), { ssr: false });
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      
      {/* Left Panel - Controls */}
      <div className="relative z-10 w-1/2 p-8 flex flex-col justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 h-full flex flex-col">
          <h1 className="text-3xl font-bold mb-4 text-white text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI Image Generator
          </h1>
          <p className="text-gray-300 text-center mb-6 text-sm">
            Transform your ideas into stunning visuals with AI
          </p>
          
          <div className="flex-1 flex flex-col space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-white/20 border-dashed rounded-xl cursor-pointer bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center justify-center">
                    <svg className="w-6 h-6 mb-2 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="text-xs text-gray-400">
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
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold text-sm">Original</h3>
                    <button
                      onClick={() => {
                        setUploadedImage(null);
                        setIsEditing(false);
                      }}
                      className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <img 
                    src={uploadedImage} 
                    alt="Uploaded" 
                    className="w-full h-20 object-cover rounded-lg border border-white/10" 
                  />
                </div>
              )}
            </div>

            <div className="relative">
              <input
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm text-sm"
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
              onGenerate={setImageUrl}
            />
          </div>
        </div>
      </div>

      {/* Right Panel - Generated Image */}
      <div className="relative z-10 w-1/2 p-8 flex flex-col justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 h-full flex flex-col">
          <h2 className="text-2xl font-bold mb-6 text-white text-center bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent w-full">
            Generated Image
          </h2>
          
          {imageUrl ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 flex items-center justify-center mb-4">
                <img 
                  src={imageUrl} 
                  alt="AI Generated" 
                  className="max-w-full max-h-full rounded-lg shadow-lg border border-white/10 object-contain" 
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
  );
}
