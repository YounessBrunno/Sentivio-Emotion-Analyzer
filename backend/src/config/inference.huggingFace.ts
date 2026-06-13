// stoped using Hugging face for Emotion analysis but i will keep this file a s reference for future use if needed
// and it will also be used for summary generation of the emotion analysis results.
// now i will be using Gemini vision API from google for the inference of the videos and images


import { InferenceClient } from "@huggingface/inference";


export  const hf = new InferenceClient(process.env.HF_TOKEN);

