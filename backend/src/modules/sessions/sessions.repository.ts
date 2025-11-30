import  db  from "../../db/database"

export const SessionsRepository = {
    async createSession(video_url : string | null, status: string) {
      const result = await db.query("INSERT INTO sessions (video_url, status, created_at) VALUES ($1, $2, NOW()) RETURNING *",[video_url, status])
      return result.rows[0]
    }
}