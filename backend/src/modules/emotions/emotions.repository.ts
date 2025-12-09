import db from "../../db/database"

export const EmotionsRepository = {
    async addEmotion(emotion_name: string, emotion_score: number, frame_id: string) {
       const results = await db.query("INSERT INTO emotions (emotion_name, emotion_score, created_at) VALUES ($1, $2, NOW()) WHERE frame_id=$3 RETURNING *",[emotion_name, emotion_score, frame_id])
       return results.rows[0]
    }
}