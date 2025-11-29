export interface Session {
    id: string;
    videoUrl: string;
    status : 'uploading' | 'uploaded' | 'processing' | 'done' | 'failed';
    created_at: Date;
    updated_at: Date;
}