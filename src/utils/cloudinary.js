import { API_BASE_URL } from '../config/api';

const uploadToCloudinary = async (file) => {
  try {
    console.log('Starting upload to backend:', {
      fileName: file.name,
      fileSize: file.size
    });

    // Convert file to base64
    const reader = new FileReader();
    const fileBase64 = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file: fileBase64
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Upload failed:', data);
      throw new Error(data.message || 'Upload failed');
    }

    console.log('Upload successful:', {
      fileName: file.name,
      url: data.url
    });

    return {
      url: data.url,
      publicId: data.publicId
    };
  } catch (error) {
    console.error('Error uploading file:', {
      error: error.message,
      fileName: file.name,
      fileSize: file.size
    });
    throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
  }
};

export const uploadMultipleImages = async (files) => {
  try {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    console.log('Starting upload of multiple images:', {
      count: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    });

    // Upload images sequentially to avoid overwhelming the server
    const results = [];
    for (const file of files) {
      try {
        const result = await uploadToCloudinary(file);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw error; // Re-throw to stop the process
      }
    }

    console.log('Successfully uploaded all images:', {
      count: results.length,
      urls: results.map(r => r.url)
    });

    return results;
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

const cloudinaryUtils = {
  uploadToCloudinary,
  uploadMultipleImages
};

export default cloudinaryUtils; 