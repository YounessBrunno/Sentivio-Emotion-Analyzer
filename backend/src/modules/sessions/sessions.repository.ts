import  db  from "../../db/database"

export const SessionsRepository = {
    async createSession(video_url : string | null, status: string, progress: number = 0) {
      const result = await db.query("INSERT INTO sessions (video_url, status, progress, created_at) VALUES ($1, $2, $3,NOW()) RETURNING *",[video_url, status, progress])
      return result.rows[0]
    },
    async checkSessionExistence(session_id: string) {
      const { rows } = await db.query("SELECT EXISTS (SELECT 1 FROM session WHERE id = $1);",[session_id]);
      return rows[0].exists
    },

    async updateSession(video_url: string, status: string, progress: number = 0, session_id: string) {
      const result = await db.query(
        `UPDATE sessions 
        SET video_url = $1, status = $2, progress = $3 updated_at = NOW() 
        WHERE id = $4 
        RETURNING *`,
        [video_url, status, progress, session_id]
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

    async updateSessionProgress(progress: number = 0, session_id: string,) {
      const result = await db.query(
        `UPDATE sessions 
        SET progress = $1, updated_at = NOW() 
        WHERE id = $2 
        RETURNING *`,
        [progress, session_id]
       );
      return result.rows[0];
    },

    async getSession(session_id: string) {
      const result = await db.query(
        `SELECT status, video_url, created_at, updated_at
        FROM sessions
        WHERE id = $1`,
        [session_id]
      );
      return result.rows[0] || null;
    }
    ,
    async getResults(session_id: string) {
       const results = await db.query(`
          SELECT S.summary_text, EP.phase_index, EP.dominant_emotion, EP.start_frame, EP.end_frame, EP.average_confidence
          FROM summaries S JOIN emotion_phases EP 
          ON S.session_id = EP.session_id 
          WHERE S.session_id = $1
          ORDER BY EP.phase_index ASC
       `,[session_id])

       
       return results.rows.length === 0 ? null : results.rows;

    },
}