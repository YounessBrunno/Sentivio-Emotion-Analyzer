import db from "../../db/database"

export const FramesRepository = {
    async addFrame(session_id: string, frame_index: number, timestamp_ms: number, frame_url: string) {
       const results = await db.query(
        "INSERT INTO frames (session_id, frame_index, timestamp_ms, frame_url, created_at) VALUES ($1, $2, $3, $4, NOW()) ON CONFLICT (session_id, frame_index) DO UPDATE SET frame_url = EXCLUDED.frame_url RETURNING *",[session_id, frame_index, timestamp_ms, frame_url])
       return results.rows[0]
    },
    async getFramesBySessionId(session_id: string) {
        const results = await db.query("SELECT * FROM frames WHERE session_id = $1 ORDER BY frame_index ASC", [session_id])
        return results.rows
    }
    
}