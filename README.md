# SinLearn Web (SinhalaLearn)

![Next.js](https://img.shields.io/badge/Next.js-16.x-black)
![React](https://img.shields.io/badge/React-19.x-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC)
![MUI](https://img.shields.io/badge/MUI-7.x-007FFF)
![i18n](https://img.shields.io/badge/i18n-i18next-informational)

Web frontend for **SinhalaLearn**, an **AI-powered Sinhala educational assistant** with two primary experiences:

- **Learning chat** for conversational help
- **Evaluation chat** for answer-sheet evaluation workflows (rubrics, syllabus/question paper uploads, processing, results, analytics, history)

This repository is the **Next.js App Router** client. It communicates with a separate backend API.

## Table of Contents

- [Overview](#overview)
- [Screens / Routes](#screens--routes)
- [Key Capabilities](#key-capabilities)
- [Evaluation Workflow](#evaluation-workflow)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Dependencies (Versions)](#dependencies-versions)
- [API Integration](#api-integration)
- [Client Persistence](#client-persistence)
- [Internationalization](#internationalization)
- [Authentication](#authentication)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

## Overview

SinLearn Web provides a modern, responsive UI for SinhalaLearn. The home route redirects to sign-in and the app runs primarily under the chat experience.

## Screens / Routes

The app uses the Next.js **App Router** with these primary screens:

- `/` → redirects to `/auth/sign-in`
- `/auth` → combined auth screen (sign-in/sign-up UI controlled by route)
- `/auth/sign-in` → sign-in tab
- `/auth/sign-up` → sign-up tab
- `/chat` → chat home (learning/evaluation experiences)
- `/chat/[chatId]` → a specific chat session
- `/settings` → settings screen (language, appearance, profile, notifications, privacy)
- `*` (unknown route) → custom 404 screen

### Route protection

All non-`/auth/*` routes are protected by a client-side auth gate:

- If there is no valid access token (or it is expired), the app redirects to `/auth/sign-in`.
- API calls attempt token refresh automatically via `POST /api/v1/auth/refresh`.

## Key Capabilities

- **Auth flows**: sign up, sign in, sign out
- **Chat sessions**: create, rename, delete, and list chat sessions
- **Modes**:
	- **Learning** mode (chat-based learning support)
	- **Evaluation** mode (document-driven evaluation)
- **Evaluation workflow UI**:
	- Upload rubric/syllabus/question paper/answer sheets
	- Trigger backend processing
	- Enter marks and start evaluation
	- View results, analytics, and local history
- **File uploads**: PDF/DOC/DOCX/PNG/JPG/JPEG supported in the evaluation flow
- **Voice interactions** (UI support): recording and voice Q&A requests (backend-dependent)
- **UI/UX**: dark/light theme support, toasts, responsive sidebar panels

## Evaluation Workflow

The **Evaluation** mode is a guided, document-driven flow implemented in the chat UI:

1. **Create / open an evaluation chat session**
2. **Attach configuration inputs**
	- Rubric (create/select and attach to the session)
	- Syllabus
	- Question paper / question structure
	- Answer sheets (one or more files)
3. **Process documents** (backend-driven OCR/extraction)
4. **Enter marks** and confirm allocations
5. **Start evaluation**
	- Either via a standard request or a streaming endpoint that emits progress text
6. **View results**
	- Results screen supports per-question breakdown and bilingual feedback display when provided by backend
7. **Analytics & history**
	- The UI maintains a lightweight client-side evaluation history per session

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **UI**: TailwindCSS + MUI
- **Icons**: lucide-react
- **i18n**: i18next + react-i18next, JSON resources served from `public/locales`

## Project Structure

```text
.
├─ public/
│  └─ locales/
│     ├─ en/
│     └─ si/
├─ src/
│  ├─ app/                   # Next.js routes (App Router)
│  │  ├─ auth/               # Sign-in / sign-up pages
│  │  ├─ chat/               # Chat entry route and layouts
│  │  └─ settings/           # User settings pages
│  ├─ components/
│  │  ├─ chat/               # Learning/evaluation UI components
│  │  ├─ header/             # Header, language/theme toggles
│  │  ├─ layout/             # Sidebar/navbar
│  │  └─ ui/                 # Shared UI primitives (buttons, inputs, modals, toasts)
│  ├─ lib/
│  │  ├─ api/                # API client + endpoint wrappers
│  │  ├─ models/             # Shared types/models
│  │  ├─ localStore.ts       # Token/theme/local persistence
│  │  └─ i18n.ts             # i18n initialization
│  ├─ hooks/                 # React hooks (chat initialization, etc.)
│  └─ types/                 # Shared TS types
└─ package.json
```

## Configuration

### Environment variables

Create a `.env.local` in the project root:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

- `NEXT_PUBLIC_API_URL` is the base URL used by the client API wrapper (defaults to `http://localhost:8000` if not set).

## Local Development

### Prerequisites

- Node.js (LTS recommended; Next.js 16 typically requires Node 18+)
- npm (or your preferred package manager)

### Install

```bash
npm ci
```

If you don't have `package-lock.json` (or you're not using lockfiles), use:

```bash
npm install
```

### Run (dev)

```bash
npm run dev
```

Open `http://localhost:3000`.

### Lint

```bash
npm run lint
```

## Dependencies (Versions)

This project uses the following direct dependencies (from `package.json`).

### Runtime dependencies

```text
next@16.0.7
react@19.2.1
react-dom@19.2.1

@mui/material@^7.3.6
@mui/icons-material@^7.3.6
@emotion/react@^11.14.0
@emotion/styled@^11.14.1

tailwindcss@^4 (configured via PostCSS)

i18next@^25.6.3
react-i18next@^16.3.5
i18next-http-backend@^3.0.2
i18next-browser-languagedetector@^8.2.0
next-i18next@^15.4.2

date-fns@^4.1.0
clsx@^2.1.1
lucide-react@^0.555.0
focus-trap-react@^11.0.4
react-transliterate@^1.1.9
```

### Dev dependencies

```text
typescript@^5
eslint@^9
eslint-config-next@16.0.7

tailwindcss@^4
@tailwindcss/postcss@^4

@types/node@^20
@types/react@^19
@types/react-dom@^19

babel-plugin-react-compiler@1.0.0
baseline-browser-mapping@^2.9.2
```

## API Integration

This web client talks to a separate backend. All URLs are built from `NEXT_PUBLIC_API_URL`.

### Auth

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `POST /api/v1/auth/signout`
- `POST /api/v1/auth/refresh`

### Chat sessions & messages

- `POST /api/v1/chat/sessions` (create session)
- `GET /api/v1/chat/sessions` (list sessions)
- `PUT /api/v1/chat/sessions/:id` (rename / attach rubric id)
- `DELETE /api/v1/chat/sessions/:id` (delete session)
- `GET /api/v1/messages/sessions/:sessionId` (load messages)
- `POST /api/v1/messages/sessions/:sessionId` (post message)
- `POST /api/v1/messages/:messageId/generate` (generate assistant response)

### Voice (optional, backend-dependent)

- `POST /api/v1/voice/qa?top_k=...` (voice question answering)

### Resources (uploads, processing, view/download)

- `POST /api/v1/resources/upload` (general upload; used by evaluation flow)
- `POST /api/v1/resources/upload-only/batch` (upload-only batch)
- `POST /api/v1/resources/process/batch` (process uploaded resources)
- `POST /api/v1/messages/:messageId/attachments/process` (process message attachments)
- `GET /api/v1/resources/:resourceId/view` (inline preview)
- `GET /api/v1/resources/:resourceId/download` (download)
- `DELETE /api/v1/resources/:resourceId` (delete)
- `DELETE /api/v1/chat/sessions/:sessionId/resources/:resourceId` (detach resource from a session)

### Evaluation

- `POST /api/v1/rubrics/?chat_session_id=...` (create rubric)
- `GET /api/v1/rubrics/:rubricId` (fetch rubric)
- `DELETE /api/v1/chat/sessions/:chatSessionId/rubric` (remove rubric from session)
- `GET /api/v1/chat/sessions/:sessionId/resources` (list session resources)
- `GET /api/v1/evaluation/sessions/:chatSessionId/paper-config` (OCR-derived paper config)
- `POST /api/v1/evaluation/sessions/:chatSessionId/paper-config/confirm` (confirm config)
- `GET /api/v1/evaluation/sessions/:chatSessionId/questions` (question structure)
- `POST /api/v1/evaluation/process-documents/stream` (process documents with text response)
- `POST /api/v1/evaluation/start` (start evaluation)
- `POST /api/v1/evaluation/start/stream` (start evaluation with streamed progress)
- `GET /api/v1/evaluation/answers/:answerDocumentId/result` (fetch evaluation result)

## Client Persistence

The client stores lightweight state in `localStorage` to keep UX consistent across reloads:

- `sinlearn_auth` (access/refresh tokens + expiry tracking)
- `sinlearn_user` (basic user metadata)
- `sinlearn_lang` (selected language)
- `sinlearn_theme` (selected theme)
- `sinlearn_settings` (notification/privacy toggles)
- `sinlearn_selected_chat_type` (learning vs evaluation)
- `sinlearn_selected_rubric`, `sinlearn_custom_rubrics` (rubric selection/authoring)

Evaluation history is also persisted per session via a key shaped like:

- `sinlearn.evaluationHistory.v1.<sessionId>`

## Internationalization

- Supported languages: **English (`en`)** and **Sinhala (`si`)**
- Translation files live in:
	- `public/locales/en/*.json`
	- `public/locales/si/*.json`
- The runtime i18n loader fetches JSON from `/locales/{{lng}}/{{ns}}.json`.

## Authentication

The client uses bearer tokens for authenticated API calls and automatically attempts to refresh expired access tokens using the refresh endpoint.

Backend endpoints expected by the client include:

- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/signin`
- `POST /api/v1/auth/signout`
- `POST /api/v1/auth/refresh`

## Build & Deployment

```bash
npm run build
npm run start
```

Deployment requires `NEXT_PUBLIC_API_URL` to point to the reachable backend API.

## Troubleshooting

- **Blank UI / stuck loading**: confirm the backend is reachable at `NEXT_PUBLIC_API_URL`.
- **CORS errors**: enable CORS on the backend for your web origin (e.g., `http://localhost:3000`).
- **Immediate redirect to sign-in**: access token is missing/expired; verify `/api/v1/auth/refresh` works and returns updated tokens.
- **Uploads failing**: ensure the backend supports `multipart/form-data` for the relevant upload endpoints.

## Notes

- This repo is the web client only. Evaluation processing (OCR/analysis/scoring) is performed by the backend services.
