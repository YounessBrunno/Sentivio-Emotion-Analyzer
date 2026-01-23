'use client';

import { useEffect, useRef } from 'react';
import Uppy, { UppyFile } from '@uppy/core';
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

    // 🔹 Upload plugin (PUT → Supabase)
    uppy.use(XHRUpload, {
      method: 'PUT',
      endpoint: (file) => {
        if (!file || Array.isArray(file)) {
          throw new Error('Invalid file');
        }
        return file.meta.uploadUrl;
      },
      headers: (file) => {
        if (!file || Array.isArray(file)) return {};
        return {
          'Content-Type': file.type,
        };
      },
    });

    // 🔹 BLOCKING STEP: get presigned URL BEFORE upload
    uppy.onBeforeUpload = async (files) => {
      const fileEntries = Object.entries(files);
      if (fileEntries.length === 0) return false;

      const [, file] = fileEntries[0] as [string, UppyFile<UploadMeta>];

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

      return files; // ✅ allow upload to proceed
    };

    // 🔹 Notify backend after successful PUT
    uppy.on('upload-success', async (file) => {
      if (!file || Array.isArray(file)) return;

      await fetch('http://localhost:4000/api/uploaded', {
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
      uppyRef.current?.destroy();
    };
  }, []);

  return uppyRef.current!;
}
