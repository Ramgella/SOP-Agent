````md
<h1 align="center">📄 SOP Agent</h1>
<h3 align="center">AI-Powered SOP Document Question Answering using RAG</h3>

<p align="center">
  Upload SOP PDFs • Ask Questions • Get Citation-Based Answers
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge">
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge">
  <img src="https://img.shields.io/badge/LLM-Groq-orange?style=for-the-badge">
</p>

---

## 🚀 Overview

**SOP Agent** is a full-stack **RAG (Retrieval-Augmented Generation)** application built as a final-year engineering project.

Users can:
- Register / Login securely
- Upload SOP PDF documents
- Ask questions about uploaded SOPs
- Receive AI-generated answers with **page citations**

If information is unavailable in uploaded documents, the AI responds:

> I don't know. The information is not available in the uploaded SOP documents.

---

## ✨ Features

✅ Secure User Authentication  
✅ SOP PDF Upload & Processing  
✅ Automatic PDF Text Extraction  
✅ Smart Chunking & Embedding  
✅ Vector Similarity Search  
✅ AI-Powered Question Answering  
✅ Page Number Citations  
✅ Multi-document Support  

---

## 🧠 RAG Pipeline

```text
PDF Upload
   ↓
Text Extraction
   ↓
Chunking
   ↓
Embeddings Generation
   ↓
Vector Search
   ↓
Groq LLM Response
````

### Workflow

1. User uploads SOP PDF
2. Text is extracted page-wise
3. Content split into overlapping chunks
4. Embeddings generated locally
5. Relevant chunks retrieved using cosine similarity
6. Groq LLM generates grounded answer
7. Citations returned with page numbers

---

## 🛠 Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Frontend       | React + Vite + Tailwind CSS          |
| Backend        | Node.js + Express.js                 |
| Database       | MongoDB Atlas                        |
| Authentication | JWT                                  |
| LLM            | Groq API (`llama-3.1-8b-instant`)    |
| Embeddings     | Transformers.js (`all-MiniLM-L6-v2`) |

---

## 📁 Project Structure

```bash
sop-agent/
│
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── services/
│
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── api/
        └── context/
```

---

## 🗄 Database Schema

### Users

| Field    | Type   |
| -------- | ------ |
| name     | String |
| email    | String |
| password | String |

### Documents

| Field        | Type   |
| ------------ | ------ |
| originalName | String |
| filePath     | String |
| totalPages   | Number |
| totalChunks  | Number |
| status       | String |

### Chunks

| Field      | Type   |
| ---------- | ------ |
| text       | String |
| pageNumber | Number |
| embedding  | Array  |

---

## 🔌 API Endpoints

| Method | Route                   | Description     |
| ------ | ----------------------- | --------------- |
| POST   | `/api/auth/register`    | Register user   |
| POST   | `/api/auth/login`       | Login user      |
| GET    | `/api/auth/me`          | User profile    |
| GET    | `/api/documents`        | Get documents   |
| POST   | `/api/documents/upload` | Upload PDF      |
| DELETE | `/api/documents/:id`    | Delete document |
| POST   | `/api/chat/ask`         | Ask question    |

---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/sop-agent.git
cd sop-agent
```

---

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set environment variables:

```env
MONGO_URI=your_mongodb_uri
GROQ_API_KEY=your_groq_key
JWT_SECRET=your_secret
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```bash
http://localhost:5173
```

---

## 📷 Application Screenshots

Add screenshots here:

```md
![Login Page](assets/login.png)
![Dashboard](assets/dashboard.png)
![Chat Interface](assets/chat.png)
```

---

## 💡 Why Local Embeddings?

Groq provides fast inference for LLMs but does not support embeddings.

To keep this project:

* 100% free
* No second API key
* Fast enough for college demo

Embeddings are generated locally using **Transformers.js**.

---

## 🔮 Future Improvements

* OCR support for scanned PDFs
* Chat history persistence
* Document filtering
* Streaming responses
* Native MongoDB Vector Search
* Admin analytics dashboard

---

## 👨‍💻 Contributors

* Ram Gella
* Yashashwini KC
* Venkatesh Kalapati
* Pavani Palapati

---

## 📜 License

This project is developed for academic and educational purposes.

---

<p align="center">
⭐ If you like this project, consider starring the repository!
</p>
```
