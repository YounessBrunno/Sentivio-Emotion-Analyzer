export type EmotionPhase = {
  phase_index: number;
  dominant_emotion: string;
  start_frame: number;
  end_frame: number;
  average_confidence: number;
};

export type SessionResults = {
  summary: string;
  phases: EmotionPhase[];
};

export type SessionStatus = {
  session_id: string;
  status: string;
  progress: number;
};
