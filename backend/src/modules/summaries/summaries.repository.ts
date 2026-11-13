import db from "../../db/database"

export const SummariesRepository = {
    async replaceSummary(session_id: string, summary_text: string) {
       const results = await db.query(
        `WITH removed AS (
            DELETE FROM summaries WHERE session_id = $1
         )
         INSERT INTO summaries (session_id, summary_text, created_at)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [session_id, summary_text]
       );
       return results.rows[0]
    }
}
