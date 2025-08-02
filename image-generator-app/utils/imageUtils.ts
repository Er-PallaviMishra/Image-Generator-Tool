import fs from 'fs';
import path from 'path';

export const saveImageToPublic = async (base64Data: string, filename: string): Promise<string> => {
  try {
    // Remove the data:image/png;base64, prefix
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to buffer
    const imageBuffer = Buffer.from(base64Image, 'base64');
    
    // Create public/images directory if it doesn't exist
    const imagesDir = path.join(process.cwd(), 'public', 'images');
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true });
    }
    
    // Save the image
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, imageBuffer);
    
    // Return the public URL
    return `/images/${filename}`;
  } catch (error) {
    console.error('Error saving image:', error);
    throw new Error('Failed to save image');
  }
};

export const deleteImageFromPublic = async (filename: string): Promise<void> => {
  try {
    const filePath = path.join(process.cwd(), 'public', 'images', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}; 