import db from "../../db/database"

export const EmotionsRepository = {
    async addEmotion(emotion_name: string, emotion_score: number, frame_id: string) {
       const results = await db.query("INSERT INTO emotions (emotion_name, emotion_score, created_at) VALUES ($1, $2, NOW()) WHERE frame_id=$3 RETURNING *",[emotion_name, emotion_score, frame_id])
       return results.rows[0]
    },
    async addEmotionPhases(phase_index: number, dominant_emotion: string, start_frame: number, end_frame: number, average_confidence: number, stability: "stable" | "volatile", algorithm_version: string, session_id: string) {
       const results = await db.query("INSERT INTO emotion_phases (phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) WHERE session_id=$8 RETURNING *",[phase_index, dominant_emotion, start_frame, end_frame, average_confidence, stability, algorithm_version, session_id])
       return results.rows[0]
    },
    
}