import {
  useCallback,
  useState,
} from 'react';

import { useDropzone } from 'react-dropzone';

interface UseFileUploadOptions {
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  onDrop?: (files: File[]) => void;
}

export const useFileUpload = ({
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
  },
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024, // 10MB
  onDrop,
}: UseFileUploadOptions = {}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
        setError(null);
        onDrop?.(acceptedFiles);
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    maxFiles,
    maxSize,
    onDrop: onDropCallback,
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0].errors[0];
      setError(error.message);
    },
  });

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  return {
    file,
    error,
    isDragActive,
    getRootProps,
    getInputProps,
    clearFile,
  };
}; 