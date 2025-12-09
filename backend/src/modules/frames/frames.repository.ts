import db from "../../db/database"

export const FramesRepository = {
    async addFrame(session_id: string, frame_index: number, timestamp_ms: number, frame_url: string) {
       const results = await db.query("INSERT INTO frames (session_id, frame_index, timestamp_ms, frame_url, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",[session_id, frame_index, timestamp_ms, frame_url])
       return results.rows[0]
    }
}