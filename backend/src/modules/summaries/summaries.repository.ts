import db from "../../db/database"

export const SummariesRepository = {
    async addSummary(summary_text: string, session_id: string) {
       const results = await db.query("INSERT INTO summaries (summary_text, created_at) VALUES ($1, NOW()) WHERE session_id=$2 RETURNING *",[summary_text, session_id])
       return results.rows[0]
    }
}