import db from "../../db/database"

export const EmotionsRepository = {
    async addEmotion(frame_id:string ,emotion_name: string, emotion_score: number) {
       const results = await db.query("INSERT INTO emotions (frame_id, emotion_name, emotion_score, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *",[frame_id, emotion_name, emotion_score])
       return results.rows[0]
    },
    async addEmotionPhases(session_id: string, phase_index: number, dominant_emotion: string, start_frame: number, end_frame: number, average_confidence: number, stability: "stable" | "volatile", algorithm_version: string) {
       const results = await db.query("INSERT INTO emotion_phases (session_id, phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *",[session_id, phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version])
       return results.rows[0]
    },
    
}