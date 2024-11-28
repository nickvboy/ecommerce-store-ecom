import { useState } from 'react';

function ImageUploader({ productId, onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image to upload.');
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images', selectedFiles[i]);
    }

    try {
      setUploading(true);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
      }

      onUploadSuccess(data.images);
      setSelectedFiles([]);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-2">Upload Images</h3>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="mb-2"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleUpload}
        disabled={uploading}
        className="px-4 py-2 bg-primary-100 text-white rounded-lg hover:bg-primary-200 disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
}

export default ImageUploader; 