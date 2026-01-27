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
        allowedFileTypes: ["video/*", "video/mp4", "video/mov", ".mp4", ".mov"],
        maxFileSize: 200 * 1024 * 1024,
      },
    });

    uppy.on('file-added', async (file) => {
      try {
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
          throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, sessionId, filePath } = await res.json();

        uppy.setFileMeta(file.id, {
          uploadUrl,
          sessionId,
          filePath,
        });

        // Auto-upload après avoir les métadonnées
        setTimeout(() => uppy.upload(), 150);
      } catch (error) {
        console.error('Error getting upload URL:', error);
        uppy.removeFile(file.id);
      }
    });

    
    uppy.use(AwsS3, {
      shouldUseMultipart: false,
      async getUploadParameters(file) {
        return {
          method: 'PUT',
          url: file.meta.uploadUrl as string,
          headers: {
            'Content-Type': file.type || 'video/mp4',
          },
        };
      },
    });

    // ✅ Utilise 'complete' au lieu de 'upload-success'
    uppy.on('complete', async (result) => {
      if ((result.failed?.length ?? 0) > 0) {
        console.error('Upload failed:', result.failed);
        return;
      }
      
      const file = result.successful?.[0];
      if (!file?.meta?.sessionId) {
        console.error('Upload complete but sessionId is missing');
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/sessions/${file.meta.sessionId}/uploaded`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: file.meta.filePath }),
        });

        if (!res.ok) {
          console.error('Failed to notify backend:', await res.text());
        } else {
          console.log('✅ Backend notified successfully');
        }
      } catch (error) {
        console.error('Error notifying backend:', error);
      }
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