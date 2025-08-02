"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  prompt: string | undefined;
  width?: number;
  height?: number;
  uploadedImage?: string | null;
  isEditing?: boolean;
  onGenerate: (url: string, filename?: string) => void;
};

export default function AIImageGenerator({ prompt, uploadedImage, isEditing, onGenerate }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleGenerate = async () => {
    if (!prompt) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt,
          uploadedImage,
          isEditing 
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        // Show server-sent error message
        setError(data.error || "Something went wrong.");
        return;
      }
      if (data.image) {
        onGenerate(data.image, data.filename);
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
        disabled={loading || !prompt}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin mr-2 h-4 w-4" />
            {isEditing ? "Modifying..." : "Generating..."}
          </>
        ) : (
          isEditing ? "Modify Image" : "Generate Image"
        )}
      </button>

      {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
    </div>
  );
}
