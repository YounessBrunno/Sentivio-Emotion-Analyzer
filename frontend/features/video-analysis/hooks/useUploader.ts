'use client';

import { useEffect, useRef } from 'react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';

export function useUploader() {
  const uppyRef = useRef<Uppy | null>(null);

  if (!uppyRef.current) {
    const uppy = new Uppy({
      autoProceed: false,
      restrictions: {
        maxNumberOfFiles: 1,
        maxFileSize: 200 * 1024 * 1024, // 200MB
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

    // 2️⃣ Mark upload completed
    uppy.on('upload-success', async (file) => {
      await fetch('http://localhost:4000/api/upload-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: file.meta.sessionId,
          filePath: file.meta.filePath,
        }),
      });
    });

    uppyRef.current = uppy;
  }

  useEffect(() => {
    return () => {
      uppyRef.current?.close();
    };
  }, []);

  return uppyRef.current!;
}
