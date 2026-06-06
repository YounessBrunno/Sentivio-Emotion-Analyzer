// stoped using Hugging face but i will keep this file a s reference for future use if needed
// now i will be using Gemini vision API from google for the inference of the videos and images

import { InferenceClient } from "@huggingface/inference";


export const hf = new InferenceClient(process.env.HF_TOKEN);

