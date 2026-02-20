# 🧠 DocuMind AI

DocuMind AI is a full-stack **RAG (Retrieval-Augmented Generation)** application that allows users to upload PDFs and ask intelligent questions grounded in the document content.

---

## 🚀 Features

- 📄 Upload and index PDF documents
- 🔍 Semantic search using FAISS
- 🤖 LLM-powered answers (Groq / LLM abstraction)
- 🧠 LangChain-based RAG pipeline
- ⚡ FastAPI backend
- 🎨 React + Vite frontend (dark UI)

---

## 🏗 Tech Stack

### Backend
- Python 3.12
- FastAPI
- LangChain
- FAISS
- HuggingFace Embeddings
- Groq LLM
- Pydantic v2

### Frontend
- React
- Vite
- CSS (custom dark theme)

---

## 📂 Project Structure

rag-backend/ → FastAPI + RAG pipeline
rag-frontend/ → React UI


---

## ⚙️ Setup Instructions

### 1️ Backend

```bash
cd rag-backend
conda activate documind
pip install -r requirements.txt
python -m api.app

### 2 Frontend

cd rag-frontend
npm install
npm run dev


🧪 Example Workflow

Upload a PDF
Wait for indexing
Ask questions in natural language
Receive grounded answers with sources

🧠 Authors

Kashyap
Computer Engineer | AI & Data Science

Manan
Computer Engineer | Full Stack

Kaushal 
Computer Engineer | AI & Data Science
