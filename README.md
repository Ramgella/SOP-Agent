# SOP Agent

A full-stack RAG (Retrieval-Augmented Generation) application for a final-year college project. Users register/log in, upload SOP PDF documents, and ask questions that are answered **only** from the content of those documents, with page-number citations. If the answer isn't in the uploaded SOPs, the AI replies:ee
ww
> I don't know. The information is not available in the uploaded SOP documents.ssww
eeee
---ee

## 1. Tech Stack

| Layer       | Technology                                              |
|-------------|----------------------------------------------------------|
| Frontend    | React + Vite + Tailwind CSS + Axios + React Router        |
| Backend     | Node.js + Express.js                                      |
| Database    | MongoDB Atlas (Mongoose)                                  |
| LLM         | Groq API (free tier) — `llama-3.1-8b-instant`              |
| Embeddings  | Transformers.js (`Xenova/all-MiniLM-L6-v2`), runs locally  |

**Why local embeddings?** Groq is a fast inference API for chat/completion models — it does **not** offer an embeddings endpoint. To keep the project 100% free and avoid a second API key, embeddings are generated locally with Transformers.js (a JS port of Hugging Face Transformers that runs ONNX models on CPU). It downloads a small (~30MB) model once and caches it; after that it works fully offline.

---

## 2. Folder Structure

```
sop-agent/
├── backend/
│   ├── server.js                  # entry point
│   ├── atlas-vector-index.json    # optional Atlas Vector Search index definition
│   ├── .env.example
│   └── src/
│       ├── app.js                 # Express app + route mounting
│       ├── config/db.js           # MongoDB connection
│       ├── models/                # User, Document, Chunk (Mongoose schemas)
│       ├── middleware/             # auth (JWT), upload (multer), errorHandler
│       ├── controllers/            # auth, document, chat logic
│       ├── routes/                 # /api/auth, /api/documents, /api/chat
│       ├── services/
│       │   ├── pdfService.js       # extract text per PDF page
│       │   ├── chunkService.js     # split page text into overlapping chunks
│       │   ├── embeddingService.js # generate embeddings (Transformers.js)
│       │   ├── vectorSearchService.js # retrieve top-K relevant chunks
│       │   └── groqService.js      # call Groq chat completion, grounded prompt
│       └── utils/
└── frontend/
    └── src/
        ├── api/axios.js            # axios instance + auth token interceptor
        ├── context/AuthContext.jsx # login/register/logout state
        ├── components/             # Sidebar, ChatMessage, UploadModal, etc.
        └── pages/                  # Login, Register, Chat, Documents
```

---

## 3. Database Schema (MongoDB)

**users**
| Field     | Type     | Notes              |
|-----------|----------|--------------------|
| name      | String   |                    |
| email     | String   | unique             |
| password  | String   | bcrypt hashed      |

**documents** (PDF metadata)
| Field          | Type     | Notes                                |
|----------------|----------|---------------------------------------|
| user           | ObjectId | ref User                              |
| originalName   | String   | uploaded file name                    |
| storedFileName | String   | name on disk                          |
| filePath       | String   |                                        |
| fileSize       | Number   | bytes                                  |
| totalPages     | Number   |                                        |
| totalChunks    | Number   |                                        |
| status         | String   | `processing` \| `ready` \| `failed`   |
| errorMessage   | String   | populated if status is `failed`        |

**chunks** (text + embeddings used for retrieval)
| Field      | Type      | Notes                              |
|------------|-----------|--------------------------------------|
| document   | ObjectId  | ref Document                       |
| user       | ObjectId  | ref User (lets us scope search per user) |
| text       | String    | chunk content (~1000 chars)          |
| pageNumber | Number    | source page, used for citations      |
| chunkIndex | Number    | order within the document            |
| embedding  | [Number]  | 384-dimensional vector               |

---

## 4. API Design

All routes except register/login require `Authorization: Bearer <token>`.

| Method | Route                  | Body                                  | Description                                  |
|--------|-------------------------|----------------------------------------|-----------------------------------------------|
| POST   | `/api/auth/register`    | `{ name, email, password }`            | Create account, returns `{ token, user }`     |
| POST   | `/api/auth/login`       | `{ email, password }`                  | Returns `{ token, user }`                     |
| GET    | `/api/auth/me`          | —                                       | Current user profile                          |
| GET    | `/api/documents`        | —                                       | List the logged-in user's documents           |
| POST   | `/api/documents/upload` | `multipart/form-data`, field `file`    | Upload + process a PDF (extract → chunk → embed → store) |
| DELETE | `/api/documents/:id`    | —                                       | Delete a document, its file, and its chunks   |
| POST   | `/api/chat/ask`         | `{ question, documentIds? }`           | Returns `{ answer, sources: [{documentId, documentName, pageNumber}] }` |

---

## 5. Setup Instructions

### 5.1 MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free **M0** cluster.
2. Under **Database Access**, create a database user with a username/password.
3. Under **Network Access**, add your current IP (or `0.0.0.0/0` for development).
4. Click **Connect → Drivers**, copy the connection string, and paste it into `backend/.env` as `MONGO_URI`.

> Vector search runs as plain in-memory cosine similarity by default — **no extra Atlas setup is required to get the app working.** Section 5.4 below explains how to switch to native Atlas Vector Search for a more advanced demo.

### 5.2 Groq API key

1. Go to [console.groq.com](https://console.groq.com), sign up, and create an API key under **API Keys**.
2. Paste it into `backend/.env` as `GROQ_API_KEY`.

### 5.3 Run the backend

```bash
cd backend
cp .env.example .env
# edit .env: set MONGO_URI, GROQ_API_KEY, JWT_SECRET
npm install
npm run dev
```

The first request that touches the embedding model will download it (~30MB, one time). The server pre-loads it on startup so this happens before your first upload, not during it.

### 5.4 Run the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`, register a new account, and start uploading SOP PDFs.

### 5.5 (Optional) Switch on native MongoDB Atlas Vector Search

By default the backend retrieves relevant chunks by computing cosine similarity in Node — this works immediately with zero Atlas configuration and is fine for a typical college-project dataset. If you want to demonstrate Atlas's native `$vectorSearch` instead:

1. In Atlas, open your cluster → **Search** tab → **Create Search Index** → **JSON Editor**.
2. Select database `sop-agent`, collection `chunks`, and paste the contents of `backend/atlas-vector-index.json`.
3. Wait for the index status to become **Active** (usually under a minute).
4. In `backend/.env`, set `USE_ATLAS_VECTOR_SEARCH=true`.
5. Restart the backend.

If the index isn't ready yet or anything goes wrong, the backend automatically falls back to the in-memory cosine similarity method, so the app never breaks.

---

## 6. How a question gets answered (RAG pipeline)

1. PDF is uploaded → text extracted page-by-page → split into ~1000-character overlapping chunks → each chunk embedded (384-dim vector) → chunks + embeddings saved to MongoDB.
2. User asks a question → the question itself is embedded with the same model.
3. The top 5 most similar chunks (by cosine similarity) are retrieved for that user.
4. Those chunks are inserted into a strict system prompt sent to Groq (`llama-3.1-8b-instant`) instructing it to answer **only** from the supplied excerpts, and to say it doesn't know otherwise.
5. The page numbers and document names of the chunks actually used are returned alongside the answer as citations.

---

## 7. Notes & Possible Extensions (not built, by design)

This project intentionally stays within final-year-project scope: no Docker, no admin panel, no analytics dashboard, no multi-tenant enterprise features. Natural next steps if you want to extend it for a viva/demo: persisting chat history per user, streaming Groq responses token-by-token, restricting Q&A to a specific selected document via the `documentIds` field already supported by the API, and OCR fallback for scanned (image-only) PDFs.
