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
    return AnswerResponse(answer=answer, sources=sources)
