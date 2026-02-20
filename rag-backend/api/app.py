from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# Lazy import to avoid torch DLL issues on Windows
ask_question = None
summarize_documents = None

def load_pipelines():
    """Load pipelines on first use to avoid import errors"""
    global ask_question, summarize_documents
    if ask_question is None:
        from pipelines.rag_pipeline import ask_question as aq
        from pipelines.summarization_pipeline import summarize_documents as sd
        ask_question = aq
        summarize_documents = sd

app = FastAPI(title="RAG Backend API")

# 🔓 Allow React frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request & Response Schemas ----------

class QuestionRequest(BaseModel):
    question: str


class AnswerResponse(BaseModel):
    answer: str
    sources: list


# ---------- API ENDPOINT ----------

@app.post("/ask", response_model=AnswerResponse)
def ask_rag(request: QuestionRequest):
    load_pipelines()
    answer, sources = ask_question(request.question)
    return {
        "answer": answer,
        "sources": sources
    }


@app.get("/")
def health_check():
    return {"status": "RAG backend running"}

from fastapi import UploadFile, File
import shutil
import os

# Lazy import for indexing pipeline
run_indexing_pipeline = None

UPLOAD_DIR = "data/raw"


def load_indexing():
    """Load indexing pipeline on first use"""
    global run_indexing_pipeline
    if run_indexing_pipeline is None:
        from indexer.build_index import run_indexing_pipeline as rip
        run_indexing_pipeline = rip


@app.post("/upload-document")
async def upload_document(file: UploadFile = File(...)):
    if not (file.filename.endswith(".pdf") or file.filename.endswith(".txt")):
        return {"error": "Only PDF and TXT files allowed"}

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔁 Rebuild index after upload
    load_indexing()
    run_indexing_pipeline()

    return {
        "message": "Document uploaded and indexed successfully",
        "filename": file.filename
    }

class SummaryResponse(BaseModel):
    summary: str

@app.get("/summarize", response_model=SummaryResponse)
def summarize():
    load_pipelines()
    summary = summarize_documents()
    return {"summary": summary}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="127.0.0.1", port=8000)