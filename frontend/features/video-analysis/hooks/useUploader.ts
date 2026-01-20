'use client';

import { useEffect, useRef } from 'react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';

type UploadMeta = {
  uploadUrl: string;
  sessionId: string;
  filePath: string;
};

export function useUploader() {
  const uppyRef = useRef<Uppy<UploadMeta> | null>(null);

  if (!uppyRef.current) {
    const uppy = new Uppy<UploadMeta>({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 200 * 1024 * 1024, 
      },
    });
    
    uppy.use(XHRUpload, {
      method: 'PUT',
      endpoint: (file) => file.meta.uploadUrl,
      headers: (file) => ({
        'Content-Type': file.type,
      }),
    });

    // 1️⃣ Get presigned URL when file is added
    uppy.on('file-added', async (file) => {
      const res = await fetch('http://localhost:4000/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          size: file.size,
        }),
      });

      const { uploadUrl, sessionId, filePath } = await res.json();

      uppy.setFileMeta(file.id, {
        uploadUrl,
        sessionId,
        filePath,
      });
    });

    // Mark upload completed
    uppy.on('upload-success', async (file) => {
      if (!file || Array.isArray(file)) return;
    
      const { sessionId, filePath } = file.meta;
    
      await fetch('http://localhost:4000/api/uploaded', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, filePath }),
      });
    });
    

    uppyRef.current = uppy;
  }

  useEffect(() => {
    return () => {
      uppyRef.current?.destroy();
    };
  }, []);

  return uppyRef.current!;
}
