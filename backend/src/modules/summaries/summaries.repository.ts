import db from "../../db/database"

export const SummariesRepository = {
    async addSummary(session_id: string, summary_text: string) {
       const results = await db.query("INSERT INTO summaries (session_id, summary_text, created_at) VALUES ($1, $2, NOW()) RETURNING *",[session_id, summary_text])
       return results.rows[0]
    }
}