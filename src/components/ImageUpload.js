import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageUpload = ({ images = [], onImagesChange, existingImages = [] }) => {
  const [previewImages, setPreviewImages] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  
  useEffect(() => {
    if (existingImages.length > 0) {
      const formattedExisting = existingImages.map(img => ({
        id: img.publicId || Math.random().toString(36).substr(2, 9),
        url: img.url,
        isExisting: true,
        publicId: img.publicId
      }));
      setPreviewImages(formattedExisting);
    }
  }, [existingImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: true,
    onDrop: (acceptedFiles) => {
      const newImages = acceptedFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        url: URL.createObjectURL(file),
        file,
        isNew: true
      }));
      
      const updatedImages = [...previewImages, ...newImages];
      setPreviewImages(updatedImages);
      onImagesChange(updatedImages);
    }
  });

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null) return;
    
    const items = Array.from(previewImages);
    const draggedItemContent = items[draggedItem];
    items.splice(draggedItem, 1);
    items.splice(index, 0, draggedItemContent);
    
    setPreviewImages(items);
    setDraggedItem(index);
    onImagesChange(items);
  };

  const removeImage = (index, e) => {
    e.stopPropagation();
    const newImages = [...previewImages];
    const removedImage = newImages[index];
    
    if (removedImage.isExisting) {
      if (!window.confirm('Are you sure you want to remove this image?')) {
        return;
      }
    }
    
    if (removedImage.isNew) {
      URL.revokeObjectURL(removedImage.url);
    }
    
    newImages.splice(index, 1);
    setPreviewImages(newImages);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone for File Upload */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary-100 bg-primary-100/10' 
            : 'border-text-200 hover:border-primary-100'
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-3xl text-text-200">
            <svg 
              className="mx-auto h-12 w-12"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
          </div>
          <p className="text-text-100">
            {isDragActive 
              ? 'Drop your images here...' 
              : 'Drag & drop images here, or click to select'
            }
          </p>
          <p className="text-sm text-text-200">
            Supports PNG, JPG, JPEG, WEBP
          </p>
        </div>
      </div>

      {/* Image Previews with Drag and Drop Reordering */}
      {previewImages.length > 0 && (
        <div className="flex flex-wrap gap-4 min-h-[8rem] p-2 rounded-lg">
          {previewImages.map((image, index) => (
            <div
              key={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              className={`
                relative group cursor-move
                ${draggedItem === index ? 'opacity-50' : 'opacity-100'}
              `}
            >
              <div className={`
                relative w-32 h-32 rounded-lg overflow-hidden
                border-2 ${image.isExisting ? 'border-primary-100' : 'border-text-200'}
                transition-all duration-200
              `}>
                <img
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover pointer-events-none select-none"
                />
                <div className="
                  absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                  transition-opacity duration-200 flex items-center justify-center
                ">
                  <button
                    onClick={(e) => removeImage(index, e)}
                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white
                      transform transition-transform duration-200 hover:scale-110"
                    title="Remove image"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {index === 0 && (
                <div className="
                  absolute -top-2 -left-2 px-2 py-1
                  bg-primary-100 text-text-100 text-xs
                  rounded-md shadow-sm pointer-events-none select-none
                ">
                  Main
                </div>
              )}
              {image.isNew && (
                <div className="
                  absolute -top-2 -right-2 px-2 py-1
                  bg-green-500 text-white text-xs
                  rounded-md shadow-sm pointer-events-none select-none
                ">
                  New
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 