# Sentivio: Technical Architecture & Product Walkthrough

## What the product currently does

Sentivio accepts an MP4 or MOV (up to 200 MB), samples facial-expression frames from it, classifies each sampled frame with Gemini, turns the sequence into contiguous emotion phases, and presents a dashboard with phase metrics, charts, and an AI-written summary. It is designed around emotion insight rather than identity recognition.

The main runtime pieces are:

```text
Next.js client  ->  Express API / PostgreSQL / Supabase Storage
                         |                  ^
                         v                  |
                    BullMQ + Redis  ->  dedicated worker
                                             |
                         FFmpeg -> Gemini Vision -> Groq summary
```

## Backend architecture

The backend is a TypeScript/Express application with a light module/repository layout rather than a framework-heavy layered architecture.

- `src/api/` contains the HTTP routes and controllers: upload URL creation and session upload/status/results endpoints.
- `src/modules/` holds feature logic. `uploads` creates and verifies storage uploads; `sessions` owns session lifecycle and queue dispatch; `videos` owns download, FFmpeg extraction, frame inference, phase aggregation, and summary generation.
- `src/modules/*/*.repository.ts` contains the PostgreSQL queries for sessions, frames, emotions, phases, and summaries.
- `src/jobs/` defines the BullMQ queue, queue event logging, and the independently run video-processing worker.
- `src/config/` configures Supabase, Redis, Gemini, Groq, and environment loading; `src/db/database.ts` creates the `pg` pool against `SUPABASE_DB_URL`.

Express exposes the API below `/api`, validates the two write payloads with Zod, and applies CORS for the local frontend origin. The web server and worker are intentionally separate processes (`npm run dev` / `npm run worker:dev`), so long video/AI work does not run in an HTTP request.

### Video-processing lifecycle

```text
1. Browser asks for signed URL
2. Browser PUTs video directly to Supabase Storage (videos)
3. Browser confirms upload -> session saved + BullMQ job queued
4. Worker downloads -> FFmpeg samples frames -> Gemini classifies frames
5. PostgreSQL persists frame/emotion timeline -> phases -> Groq summary
6. Session progress/status becomes done -> dashboard fetches results
```

1. **Create upload session.** `POST /api/upload-url` validates the name, MIME type, extension (`mp4`/`mov`), and 200 MB limit. `UploadsService` first inserts a `sessions` row with `status = uploading`; it then creates a unique object path and a signed upload URL for the Supabase `videos` bucket.
2. **Direct storage upload.** The client uses Uppy XHR upload to `PUT` the file directly to that signed Supabase URL. The API never receives the video bytes.
3. **Confirm and dispatch.** After Uppy reports success, the client calls `POST /api/sessions/:id/uploaded`. `SessionsService` verifies the object exists in `videos`, stores its public URL, changes the session to `uploaded` with `progress = 0`, and adds `{ filePath, session_id }` to the `video-processing` BullMQ queue. Jobs have five attempts and a five-second backoff.
4. **Worker receives the job.** `processVideo.worker.ts` runs a BullMQ `Worker` for that queue using the shared Redis connection. Its configured concurrency is `1`, appropriate for the locally shared `tmp` workspace and resource-intensive FFmpeg/AI work. QueueEvents and worker handlers log waiting, active, progress, completion, stalled, and failed activity.
5. **Download and extract.** `VideoService.downloadVideo` streams the object from Supabase `videos` into `tmp/<session>-video.mp4`. `extractFrames` clears and recreates `tmp/frames/<session>`, spawns `ffmpeg`, and writes JPEGs as `frame_0001.jpg`, etc. Its `fps=0.5` setting samples one image every two seconds; the application assigns 1-based frame indices and timestamps spaced 2,000 ms apart.
6. **Analyze and persist frame results.** `analyzeFrames` loads existing `frames` and the persisted session emotion timeline first. For an already saved emotion, it reuses that result, which makes retries able to reconstruct the full timeline. Otherwise it uploads the JPEG to the Supabase `frames` bucket, upserts its metadata in `frames`, sends the image as base64 inline data to Gemini `gemini-3.1-flash-lite`, parses the JSON emotion/confidence response, and inserts the emotion through `addEmotionIfMissing`. That repository method returns the existing first emotion for the frame when present, avoiding duplicate frame analysis results on retries.
7. **Build phases.** `smoothAndAggregateEmotions` applies a small temporal correction: a low-confidence (< 0.6) middle frame is replaced if matching previous/next emotions surround it. It then groups consecutive equal emotions into phases. Each phase stores its frame span, average confidence (three decimals), and `stable` when it contains at least five sampled frames; otherwise it is `volatile`. Before inserting the rebuilt phases, the worker deletes existing session phases.
8. **Generate the narrative.** `generateSummary` formats the phase timeline into the configured prompt and asks Groq's `openai/gpt-oss-20b` for a concise, neutral facial-expression summary. `replaceSummary` removes the prior session summary and inserts the new one.
9. **Finish/clean up.** The worker marks the session `done`, writes progress 100, and reports BullMQ progress. In `finally`, it removes local `tmp` artifacts only; the original video and stored frame JPEGs remain in Supabase. A Groq payment/quota HTTP 402 is converted to an unrecoverable BullMQ error; other errors are eligible for the configured retries.

### Progress tracking

Progress is persisted in PostgreSQL, rather than derived in the browser or pushed over a socket. The worker writes both BullMQ job progress and `sessions.progress` at these checkpoints: 5 (session validated), 15 (video downloaded), 35 (frames extracted), 70 (frame timeline ready), 80 (phases written), 90 (summary written), and 100 (done).

`GET /api/sessions/:id/status` returns `{ session_id, status, progress }` from the session row. The frontend's `useSessionAnalysis` hook polls that endpoint every two seconds while the status is not `done`, updating `ProcessingOverlay` with the returned percentage. Once it observes `done`, it makes one `GET /api/sessions/:id/results` request and stops polling.

There is no WebSocket/SSE channel and no separate job-status API: the session row is the UI-facing source of truth. The worker does not explicitly set a failed session status, so a terminal job failure is logged by BullMQ while the persisted session retains its last saved state/progress.

### Data and storage responsibilities

| System | What it stores / does |
| --- | --- |
| PostgreSQL in Supabase | `sessions` lifecycle/progress and video URL; `frames` sampled-frame metadata/URL; `emotions` per-frame name and score; `emotion_phases` aggregated timeline; `summaries` final narrative. |
| Supabase Storage | Original uploads in `videos`; sampled JPEGs in `frames`. Signed upload URLs let the browser upload directly; the worker downloads through the service-role client. |
| Redis | BullMQ's queue/job state and event transport between the API producer and the worker consumer. |

The results API joins `summaries` to `emotion_phases` and returns only the summary plus ordered phase data. The raw per-frame emotion records are durable in the database and drive aggregation, but are not currently exposed to the dashboard.

## Frontend architecture and flow

The frontend is a Next.js App Router project organized around feature folders.

- `app/(home)` is the landing page; its primary action goes to `/upload`.
- `app/upload` renders the upload page and `features/video-analysis/components/UploadForm`.
- `app/dashboard` provides the shell and `DashboardContent`, which reads the `session` query parameter.
- `features/video-analysis/` groups the Uppy upload hook, session polling hook, API result types, and analysis UI components.
- `shared/ui/` contains reusable primitives; dashboard layout components provide the top bar and sidebar.

**Upload flow:** `UploadForm` adds the chosen file to Uppy. `useUploader` asks the backend for the signed URL/session/path, configures Uppy XHR to PUT to Supabase, then confirms upload with the backend and navigates to `/dashboard?session=<id>`.

**Results flow:** `DashboardContent` calls `useSessionAnalysis(sessionId)`. Before completion it renders the full-screen `ProcessingOverlay`; after the hook fetches results it renders:

- `EmotionMetrics`: dominant emotion by total phase frame span, phase count, and mean phase confidence.
- `EmotionsGraph`: a confidence-over-phases line chart and a phase-duration (frame-count) bar chart.
- `PhaseList`: ordered dominant emotion, frame range, and confidence for every phase.
- `SummaryCard`: the stored Groq-generated session narrative.

The frontend uses native `fetch` for backend calls, Uppy only for the direct upload, and Chart.js/react-chartjs-2 for result visualisation. The polling hook reads `NEXT_PUBLIC_API_URL` with a fallback of `http://localhost:4000`; the Express server itself defaults to port 5000 unless `PORT` is set, so local configuration must align those ports.

## Implemented product features

- MP4/MOV upload with browser-side Uppy restrictions and matching backend validation (200 MB maximum).
- A persisted analysis session and visible staged progress during background processing.
- Video sampling every two seconds and Gemini-based facial-expression emotion classification for each sampled frame.
- Per-frame emotion name and confidence persistence.
- Smoothed, contiguous emotion phases with confidence, frame ranges, and stability classification.
- A phase-oriented dashboard with summary metrics, confidence/duration charts, phase timeline, and an AI-generated narrative summary.

## Suggested recording order

1. Introduce Sentivio as a video-based facial-expression/emotion timeline tool, focused on emotion rather than identity.
2. Show the landing page, upload entry point, and final dashboard features.
3. Upload an MP4/MOV and point out the direct signed upload to Supabase Storage.
4. Follow the confirmation request into session creation and the BullMQ/Redis dispatch.
5. Open the worker and trace download, FFmpeg's one-frame-per-two-seconds extraction, Gemini inference, and frame/emotion persistence.
6. Explain the database-backed progress checkpoints and the dashboard's two-second status polling.
7. Return to the finished dashboard: metrics, confidence and duration charts, ordered phases, and the Groq summary.
8. Recap the separation of Next.js UI, Express API/PostgreSQL/Supabase Storage, Redis/BullMQ, and the dedicated worker.
