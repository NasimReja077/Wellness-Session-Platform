import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { ApiError } from './ApiError.js';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadOnCloudinary = async (localFilePath, folder = 'wellness-platform') => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
      folder: folder,
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    // File has been uploaded successfully
    // Remove the locally saved temporary file
    fs.unlinkSync(localFilePath);
    return response;

  } catch (error) {
    // Remove the locally saved temporary file as the upload operation failed
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new ApiError(500, 'Failed to upload image to cloud storage');
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;
    
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return null;
  }
};

export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  // Extract public ID from Cloudinary URL
  const urlParts = cloudinaryUrl.split('/');
  const fileWithExtension = urlParts[urlParts.length - 1];
  const publicId = fileWithExtension.split('.')[0];
  
  // Include folder path if present
  const folderIndex = urlParts.indexOf('wellness-platform');
  if (folderIndex !== -1) {
    const folderPath = urlParts.slice(folderIndex, -1).join('/');
    return `${folderPath}/${publicId}`;
  }
  
  return publicId;
};