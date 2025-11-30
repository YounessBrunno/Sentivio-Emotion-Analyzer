import  db  from "../../db/database"

export const SessionsRepository = {
    async createSession(video_url : string, status: string) {
      const result = await db.query("INSERT INTO sessions (video_url, status) VALUES ($1, $2) RETURNING *",[video_url, status])
      return result.rows[0]
    }
}