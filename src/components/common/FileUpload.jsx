import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { compressImage, formatFileSize } from '../../utils/imageCompressor';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Loader2, 
  FileCheck,
  ShieldCheck 
} from 'lucide-react';

export default function FileUpload({
  id,
  label,
  description,
  value,
  onChange,
  error,
  required = false,
  isWaived = false,
  waivedReason = 'Verified via NSDL e-KYC',
  accept = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'application/pdf': ['.pdf'],
  },
  maxSizeBytes = 5242880, // 5MB
}) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState(null);

  const onDrop = async (acceptedFiles, fileRejections) => {
    setCompressionError(null);

    if (fileRejections && fileRejections.length > 0) {
      setCompressionError('File exceeds maximum size of 5MB or invalid file type.');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const result = await compressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.75,
      });

      onChange({
        name: file.name,
        size: result.compressedSize,
        type: file.type,
        dataUrl: result.dataUrl,
        originalSize: result.originalSize,
        compressedSize: result.compressedSize,
        compressionRatio: result.compressionRatio,
        isPdf: result.isPdf,
      });
    } catch {
      setCompressionError('Error compressing file. Please try another image or PDF.');
    } finally {
      setIsCompressing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSizeBytes,
    multiple: false,
    disabled: isWaived || isCompressing,
  });

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  // If document is waived by KYC cross-step rule
  if (isWaived) {
    return (
      <div className="flex flex-col w-full">
        <label className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
          <span>{label}</span>
        </label>
        <div className="bg-emerald-50/70 border border-emerald-300/80 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#27AE60]" />
            <div>
              <span className="font-bold text-xs text-emerald-950 block">Physical Document Waived</span>
              <span className="text-xs text-emerald-700">{waivedReason}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-300">
            Waived
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* Label & Requirement */}
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          <span>{label}</span>
          {required && <span className="text-[#E74C3C] text-sm">*</span>}
        </label>
        <span className="text-xs text-slate-400">JPG, PNG, PDF up to 5MB</span>
      </div>

      {description && (
        <p className="text-xs text-slate-500 mb-2">{description}</p>
      )}

      {/* Uploaded File Preview Card */}
      {value && value.dataUrl ? (
        <div className="border border-slate-200 bg-white rounded-xl p-3.5 flex items-center justify-between shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            {value.isPdf ? (
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
            ) : (
              <img
                src={value.dataUrl}
                alt="Upload preview"
                className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
              />
            )}

            <div className="min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate block">
                {value.name}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-500">
                  {formatFileSize(value.compressedSize || value.size)}
                </span>
                {value.compressionRatio > 0 && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    {value.compressionRatio}% compressed
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <FileCheck className="w-3 h-3" /> Ready
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
            title="Remove file"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Dropzone Upload Area */
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
            isDragActive
              ? 'border-[#1F4E79] bg-blue-50/50'
              : error || compressionError
              ? 'border-[#E74C3C] bg-red-50/20'
              : 'border-slate-300 hover:border-[#1F4E79] bg-slate-50/40 hover:bg-slate-50'
          }`}
        >
          <input {...getInputProps()} id={id} />

          {isCompressing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#1F4E79] animate-spin" />
              <span className="text-xs font-semibold text-[#1F4E79]">
                Compressing image with HTML5 Canvas...
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1F4E79] flex items-center justify-center">
                <UploadCloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-700 block">
                  Click to upload or drag and drop
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">
                  Files &gt; 1MB are automatically compressed client-side
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Messages */}
      {(error || compressionError) && (
        <span className="text-xs text-[#E74C3C] font-medium mt-1.5 flex items-center gap-1">
          {error || compressionError}
        </span>
      )}
    </div>
  );
}