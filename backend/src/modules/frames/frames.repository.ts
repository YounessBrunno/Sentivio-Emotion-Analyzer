import db from "../../db/database"

export const FramesRepository = {
    async addFrame(timestamp: number, frame_url: string, session_id: string) {
       const results = await db.query("INSERT INTO frames (timestamp, frame_url, created_at) VALUES ($1, $2, NOW()) WHERE session_id=$3 RETURNING *",[timestamp, frame_url, session_id])
       return results.rows[0]
    }
}