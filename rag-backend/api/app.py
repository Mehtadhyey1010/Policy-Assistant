from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

from pipelines.rag_pipeline import ask_question

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

from indexer.build_index import run_indexing_pipeline

UPLOAD_DIR = "data/raw"


@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        return {"error": "Only PDF files allowed"}

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 🔁 Rebuild index after upload
    run_indexing_pipeline()

    return {
        "message": "PDF uploaded and indexed successfully",
        "filename": file.filename
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.app:app", host="127.0.0.1", port=8000)