'use client';

import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import { useRef, useEffect } from 'react';

export function useUploader() {
  const uppyRef = useRef<Uppy | null>(null);

  if (!uppyRef.current) {
    uppyRef.current = new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 50 * 1024 * 1024,
      },
    });

    uppyRef.current.use(XHRUpload, {
      method: 'PUT',
      headers: (file) => ({
        'Content-Type': file.type,
      }),
    });
  }

  useEffect(() => {
    return () => {
      uppyRef.current?.close();
    };
  }, []);

  return uppyRef.current!;
}
