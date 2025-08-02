"use client"
import Image from "next/image";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AIImageGenerator = dynamic(() => import("../components/ai_image_generator"), { ssr: false });
const Navbar = dynamic(() => import("../components/navbar"), { ssr: false });

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    url: string;
    filename: string;
    prompt: string;
    timestamp: Date;
    isEdited: boolean;
  }>>([]);

  // Load saved images on component mount
  useEffect(() => {
    const loadSavedImages = async () => {
      try {
        console.log('Loading saved images...');
        const response = await fetch('/api/gallery');
        const data = await response.json();
        console.log('Gallery API response:', data);
        if (data.images && Array.isArray(data.images)) {
          console.log('Setting images:', data.images.length, 'images found');
          setGeneratedImages(data.images);
        } else {
          console.log('No images found or invalid data format');
        }
      } catch (error) {
        console.error('Error loading saved images:', error);
      }
    };

    loadSavedImages();
  }, []);

  // Add sync function
  const syncGallery = async () => {
    try {
      console.log('Syncing gallery...');
      const response = await fetch('/api/sync-gallery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Sync result:', data);

      if (data.success) {
        // Reload the gallery
        const galleryResponse = await fetch('/api/gallery');
        const galleryData = await galleryResponse.json();
        if (galleryData.images) {
          setGeneratedImages(galleryData.images);
        }
        alert(`Sync completed! Added ${data.addedImages.length} missing images.`);
      } else {
        alert('Sync failed: ' + data.error);
      }
    } catch (error) {
      console.error('Error syncing gallery:', error);
      alert('Error syncing gallery');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex flex-1 relative">
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
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
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
                onGenerate={(url, filename) => {
                  setImageUrl(url);
                  // Add to gallery
                  const newImage = {
                    id: Date.now().toString(),
                    url: url,
                    filename: filename || `ai-generated-${Date.now()}.png`,
                    prompt: prompt,
                    timestamp: new Date(),
                    isEdited: isEditing
                  };
                  setGeneratedImages(prev => [newImage, ...prev]);
                }}
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

      {/* Gallery Section */}
      {generatedImages.length > 0 && (
        <div className="relative z-10 w-full p-8">
          <div className="bg-gradient-to-br from-white/20 via-pink-50/30 to-purple-50/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/30 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 via-purple-100/20 to-pink-100/20"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.2),transparent_50%)]"></div>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Generated Images Gallery
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={syncGallery}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Sync Gallery</span>
                  </button>
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
                    className="px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Download All</span>
                  </button>
                  <div className="flex items-center space-x-2 text-gray-300 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <span>{generatedImages.length} images generated</span>
                  </div>
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
                        <div className="relative aspect-square overflow-hidden rounded-lg shadow-2xl border-2 border-white/20 hover:border-white/40 transition-all duration-300">
                          <img
                            src={image.url}
                            alt={image.prompt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              {/* Status Badge */}
                              <div className="flex justify-center mb-2">
                                {image.isEdited ? (
                                  <span className="px-2 py-1 text-xs bg-blue-500/80 text-white rounded-full backdrop-blur-sm">
                                    Edited
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs bg-green-500/80 text-white rounded-full backdrop-blur-sm">
                                    Generated
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-center space-x-2">
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
                                  className="p-2 bg-green-500/80 rounded-lg hover:bg-green-500/90 transition-colors backdrop-blur-sm"
                                  title="Download Image"
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                      });
                                    } else {
                                      navigator.clipboard.writeText(image.url);
                                      alert('Image URL copied to clipboard!');
                                    }
                                  }}
                                  className="p-2 bg-blue-500/80 rounded-lg hover:bg-blue-500/90 transition-colors backdrop-blur-sm"
                                  title="Share Image"
                                >
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Subtle Glow Effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>

                        {/* Floating Info Badge */}
                        <div className="absolute -top-2 -right-2 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-xs text-white">#{index + 1}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute top-10 left-10 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-20 right-20 w-32 h-32 bg-pink-500/10 rounded-full blur-xl"></div>
                  <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl"></div>
                </div>
              </div>

              {/* Clear Gallery Button */}
              {generatedImages.length > 0 && (
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={async () => {
                      setGeneratedImages([]);
                      // Clear saved data
                      try {
                        await fetch('/api/gallery', { method: 'DELETE' });
                      } catch (error) {
                        console.error('Error clearing gallery:', error);
                      }
                    }}
                    className="px-6 py-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 transition-colors flex items-center space-x-2"
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
