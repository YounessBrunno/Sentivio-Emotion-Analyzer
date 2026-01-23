'use client';

import { useEffect, useRef } from "react";
import Uppy from "@uppy/core";
import AwsS3 from "@uppy/aws-s3";

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
        allowedFileTypes: ["video/*", "video/mp4", "video/mov", ".mp4", ".mov"
          
        ],
        maxFileSize: 200 * 1024 * 1024,
      },
    });

    uppy.use(AwsS3, {
      shouldUseMultipart: false,
      async getUploadParameters(file) {
        const res = await fetch('http://localhost:4000/api/upload-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            size: file.size,
          }),
        });

        if (!res.ok) throw new Error('Failed to get upload URL');
        

        const { uploadUrl, sessionId, filePath } = await res.json();

        uppy.setFileMeta(file.id, {
          uploadUrl,
          sessionId,
          filePath,
        });

        return {
          method: 'PUT',
          url: uploadUrl,
          headers: {
            'Content-Type': file.type,
          },
        };
      },
    });

    uppy.on('upload-success', async (file) => {
      if (!file) return;

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
      uppyRef.current = null;
    };
  }, []);

  return uppyRef.current!;
}
