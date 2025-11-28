import React, { useRef } from 'react';
import { UploadedImage } from '../types';

interface ImageUploaderProps {
  label: string;
  image: UploadedImage | null;
  onImageChange: (image: UploadedImage | null) => void;
  optional?: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ label, image, onImageChange, optional = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange({
          file,
          previewUrl: URL.createObjectURL(file),
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) fileInputRef.current.value = '';
    onImageChange(null);
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300 flex justify-between">
        {label}
        {optional && <span className="text-gray-500 text-xs uppercase tracking-wider">Optional</span>}
      </label>
      
      <div 
        onClick={triggerUpload}
        className={`
          relative h-40 w-full rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${image 
            ? 'border-brand-500 bg-gray-800' 
            : 'border-gray-600 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-500'
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
        {image ? (
          <div className="relative h-full w-full group">
            <img 
              src={image.previewUrl} 
              alt="Preview" 
              className="h-full w-full object-contain p-2" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button 
                onClick={handleRemove}
                className="bg-red-500/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-transform hover:scale-105"
              >
                Remove
              </button>
              <button 
                className="ml-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm transition-transform hover:scale-105"
              >
                Change
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Click to Upload</span>
          </div>
        )}
      </div>
    </div>
  );
};
