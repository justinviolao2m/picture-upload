'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { sanitizeFileName } from '@/lib/utils/fileUtils';

interface FilePreview {
  id: number;
  file: File;
  url: string;
}

interface FileUploadProps {
  leadId: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ leadId }) => {
  const [filePreviews, setFilePreviews] = useState<FilePreview[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);

  const compressImage = async (file: File) => {
    const options = {
      useWebWorker: true,
      initialQuality: 0.9, // Set initial quality
    };

    try {
      if (file.size > 10 * 1024 * 1024) { // Compress only if the file is larger than 10MB
        const compressedFile = await imageCompression(file, options);
        return compressedFile;
      }
      return file;
    } catch (error) {
      console.error('Error compressing image:', error);
      return file;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newPreviews = await Promise.all(
      acceptedFiles.map(async (file, index) => {
        const compressedFile = await compressImage(file);
        return {
          id: filePreviews.length + index,
          file: compressedFile,
          url: URL.createObjectURL(compressedFile),
        };
      })
    );
    setFilePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  }, [filePreviews.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const removeFile = useCallback((id: number) => {
    setFilePreviews((prevPreviews) => prevPreviews.filter((preview) => preview.id !== id));
  }, []);

  const clearAllFiles = () => {
    setFilePreviews([]);
  };

  const gridColsClass = () => {
    const length = filePreviews.length;
    if (length === 1) return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1';
    if (length === 2) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2';
    if (length === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const uploadFilesToS3 = async () => {
    if (uploading) return;

    if (!leadId) {
      alert('ID is missing');
      return;
    }
    
    setUploading(true);
    try {
      await Promise.all(filePreviews.map(async (preview) => {
        const { file } = preview;
        const response = await axios.post('/api/s3-presigned-url', {
          fileName: sanitizeFileName(file.name),
          fileType: file.type,
          leadId,
        });

        const { uploadUrl } = response.data;

        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });
      }));
      alert('All files uploaded successfully!');
      clearAllFiles();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="w-full max-w-2xl p-2 sm:p-4 bg-blue-400 m-auto rounded-lg cursor-pointer">
        <div
          {...getRootProps()}
          className={`p-1 sm:p-5 rounded-lg ${isDragActive ? 'bg-gray-100' : ''}`}
        >
          <input {...getInputProps()} aria-describedby="file-upload-description" />
          <div className="flex flex-col w-full text-center">
            <div id="file-upload-description" className="text-white uppercase block sm:hidden">
              Tap here to Upload Pictures
            </div>
            <div id="file-upload-description" className="text-white uppercase hidden sm:block">
              Click or Drag and Drop Here to Upload Pictures
            </div>
          </div>
        </div>
      </div>
      {filePreviews.length > 0 && (
        <div className={`grid gap-4 mt-6 md:mt-3 max-h-[55.5vh] bg-gray-50 rounded-md p-3 overflow-y-auto justify-items-center ${gridColsClass()}`}>
          {filePreviews.map((preview) => (
            <div key={preview.url} className="relative w-full max-w-xs">
              <img src={preview.url} alt="preview" className="w-full h-40 object-contain rounded-lg shadow-md" />
              <button
                onClick={() => removeFile(preview.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-300 w-5 h-5 p-0 leading-none pb-0.5"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      {filePreviews.length > 0 && (
        <div className="flex justify-center mt-3 flex-col sm:flex-row">
          <button
            onClick={uploadFilesToS3}
            className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 flex justify-center items-center"
            disabled={uploading}
          >
            <svg className="text-white w-5 sm:w-5 h-5 sm:h-5 mb-0 mr-1" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M64 48c-8.726 0-16 7.274-16 16v384c0 8.726 7.274 16 16 16h215v-16H64V64h63.375v97.53c0 3.924 3.443 7.095 7.72 7.095h169.81c4.277 0 7.72-3.17 7.72-7.094V64h69.22c.428.318.8.548 1.467 1.094 2.05 1.675 4.962 4.264 8.375 7.406 6.827 6.283 15.65 14.837 24.313 23.5 8.663 8.663 17.217 17.486 23.5 24.313 3.142 3.413 5.73 6.324 7.406 8.374.546.668.776 1.04 1.094 1.47V330.25l16 16V128c0-2.68-.657-3.402-1.03-4.156-.375-.754-.725-1.294-1.095-1.844-.74-1.1-1.575-2.19-2.594-3.438-2.036-2.492-4.768-5.55-8.03-9.093-6.524-7.09-15.155-16-23.938-24.782-8.782-8.783-17.692-17.414-24.78-23.938-3.545-3.262-6.6-5.994-9.094-8.03-1.247-1.02-2.337-1.855-3.438-2.595-.55-.37-1.09-.72-1.844-1.094-.754-.373-1.477-1.03-4.156-1.03H64zm87.72 16h48.56c4.277 0 7.72 4.425 7.72 9.938v70.124c0 5.513-3.443 9.938-7.72 9.938h-48.56c-4.277 0-7.72-4.425-7.72-9.938V73.938c0-5.512 3.443-9.937 7.72-9.937zM114 212c-4.432 0-8 3.568-8 8v184c0 4.432 3.568 8 8 8h165v-28h-76.72l15.345-15.375 128-128L352 234.28l6.375 6.345L406 288.25V220c0-4.432-3.568-8-8-8H114zm238 47.75L245.75 366H297v128h110V366h51.25L352 259.75zM448 384v64h-23v16h23c8.726 0 16-7.274 16-16v-64h-16z"></path>
            </svg>
            {uploading ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={clearAllFiles}
            className="ml-0 sm:ml-4 mt-3 sm:mt-0 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 flex justify-center items-center"
            disabled={uploading}
          >
            <svg className="text-white w-5 sm:w-5 h-5 sm:h-5 mb-0 mr-1" stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
              <path d="M401.4 224h-214l83-79.4c11.9-12.5 11.9-32.7 0-45.2s-31.2-12.5-43.2 0L89 233.4c-6 5.8-9 13.7-9 22.4v.4c0 8.7 3 16.6 9 22.4l138.1 134c12 12.5 31.3 12.5 43.2 0 11.9-12.5 11.9-32.7 0-45.2l-83-79.4h214c16.9 0 30.6-14.3 30.6-32 .1-18-13.6-32-30.5-32z"></path>
            </svg>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
