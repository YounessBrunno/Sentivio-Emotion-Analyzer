import db from "../../db/database"

export const EmotionsRepository = {
    async getEmotionTimeline(session_id: string) {
       const results = await db.query(
        `SELECT f.id AS "frameId", f.frame_index AS "frameIndex",
                e.emotion_name AS emotion, e.emotion_score AS confidence
         FROM frames f
         JOIN LATERAL (
            SELECT emotion_name, emotion_score
            FROM emotions
            WHERE frame_id = f.id
            ORDER BY created_at ASC
            LIMIT 1
         ) e ON true
         WHERE f.session_id = $1
         ORDER BY f.frame_index ASC`,
        [session_id]
       );
       return results.rows;
    },
    async addEmotionIfMissing(frame_id:string ,emotion_name: string, emotion_score: number) {
       const results = await db.query(
        `WITH existing AS (
            SELECT id, emotion_name, emotion_score
            FROM emotions
            WHERE frame_id = $1
            ORDER BY created_at ASC
            LIMIT 1
         ), inserted AS (
            INSERT INTO emotions (frame_id, emotion_name, emotion_score, created_at)
            SELECT $1, $2, $3, NOW()
            WHERE NOT EXISTS (SELECT 1 FROM existing)
            RETURNING id, emotion_name, emotion_score
         )
         SELECT * FROM inserted
         UNION ALL
         SELECT * FROM existing
         LIMIT 1`,
        [frame_id, emotion_name, emotion_score]
       );
       return results.rows[0]
    },
    async deleteEmotionPhasesBySessionId(session_id: string) {
       await db.query("DELETE FROM emotion_phases WHERE session_id = $1", [session_id]);
    },
    async addEmotionPhases(session_id: string, phase_index: number, dominant_emotion: string, start_frame: number, end_frame: number, average_confidence: number, stability: "stable" | "volatile", algorithm_version: string) {
       const results = await db.query("INSERT INTO emotion_phases (session_id, phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *",[session_id, phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version])
       return results.rows[0]
    },
    
}
