'use client';

import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import XHRUpload from "@uppy/xhr-upload";

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
        allowedFileTypes: ["video/*", "video/mp4", "video/mov", ".mp4", ".mov"],
        maxFileSize: 200 * 1024 * 1024,
      },
    });

    uppy.on('file-added', async (file) => {
      if (!file.meta.uploadUrl) {
        const res = await fetch('http://localhost:4000/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            size: file.size,
          }),
        });

        if (!res.ok) {
          uppy.removeFile(file.id);
          uppy.emit('upload-error', file, new Error('Failed to get upload URL'));
          return;
        }

        const { uploadUrl, sessionId, filePath } = await res.json();

        uppy.setFileMeta(file.id, {
          uploadUrl,
          sessionId,
          filePath,
        });
      }
    });

    uppy.use(XHRUpload, {
      bundle: false,
      method: 'put',
      endpoint: (file): string => {
        const singleFile = Array.isArray(file) ? file[0] : file;
        return (singleFile?.meta?.uploadUrl as string) || '';
      },
      fieldName: 'file',
      headers: (file) => {
        const singleFile = Array.isArray(file) ? file[0] : file;
        return {'Content-Type': singleFile?.type || 'application/octet-stream',};
      },
      getResponseData(response) {
        const singleFile = Array.isArray(response) ? response[0] : response;
        const uploadUrl = singleFile?.meta?.uploadUrl || '';
        
        return {
          url: uploadUrl,
        };
      },
    });

    uppy.on('upload-success', async (file) => {
      if (!file) return;

      await fetch(`http://localhost:4000/sessions/${file.meta.sessionId}/uploaded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: file.meta.filePath }),
      });
    });

    uppyRef.current = uppy;
  }

  useEffect(() => {
    return () => {
      uppyRef.current?.destroy();
      uppyRef.current = null;
    };
  }, []);

  return uppyRef.current!;
}