import  db  from "../../db/database"

export const SessionsRepository = {
    async createSession(video_url : string | null, status: string) {
      const result = await db.query("INSERT INTO sessions (video_url, status, created_at) VALUES ($1, $2, NOW()) RETURNING *",[video_url, status])
      return result.rows[0]
    },
    async updateSessionVideoUrl(session_id: string, video_url: string) {
      const result = await db.query(
        `UPDATE sessions 
        SET video_url = $1, status = 'uploaded', updated_at = NOW() 
        WHERE id = $2 
        RETURNING *`,
        [video_url, session_id]
       );
      return result.rows[0];
    },
    async updateSessionStatus(session_id: string, status: string) {
      const result = await db.query(
        `UPDATE sessions 
        SET status = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *`,
        [status, session_id]
       );
      return result.rows[0];
    },
}