"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { getUserSession } from '../utils/userSession';
import { useUserGenerationLimit } from '../hooks/useUserGenerationLimit';
import { addImageToLocalGallery } from '../utils/localGallery';

type Props = {
  prompt: string | undefined;
  width?: number;
  height?: number;
  uploadedImage?: string | null;
  isEditing?: boolean;
  onGenerate: (url: string, filename?: string, imageData?: any) => void;
};

export default function AIImageGenerator({ prompt, uploadedImage, isEditing, onGenerate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { limitInfo, canGenerate, incrementCount } = useUserGenerationLimit();
  const handleGenerate = async () => {
    if (!prompt) return;
    
    // Check generation limit before making request
    if (!canGenerate) {
      setError(`You've reached your limit of ${limitInfo.max} free images. Please contact info@technioz.com for additional access.`);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const session = getUserSession();
      
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          uploadedImage,
          isEditing,
          userId: session.userId
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Show server-sent error message
        setError(data.error || "Something went wrong.");
        return;
      }
      if (data.image) {
        // Increment local generation count
        incrementCount();
        
        // Save to local gallery
        const imageData = {
          id: data.id,
          url: data.image,
          filename: data.filename,
          prompt: data.prompt,
          timestamp: new Date(data.timestamp),
          isEdited: data.isEdited || isEditing || false
        };
        
        addImageToLocalGallery(imageData);
        
        // Pass complete image data to parent
        onGenerate(data.image, data.filename, imageData);
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-2">
      <button 
        onClick={handleGenerate} 
        disabled={loading || !prompt || !canGenerate}
        className={`w-full px-4 py-2 text-white rounded flex items-center justify-center transition-colors ${
          !canGenerate ? 'bg-red-500 hover:bg-red-600' : 
          loading || !prompt ? 'bg-gray-400 cursor-not-allowed' : 
          'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            {isEditing ? "Modifying..." : "Generating..."}
          </>
        ) : !canGenerate ? (
          `Limit Reached (${limitInfo.current}/${limitInfo.max})`
        ) : (
          `${isEditing ? "Modify Image" : "Generate Image"} (${limitInfo.remaining} left)`
        )}
      </button>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
