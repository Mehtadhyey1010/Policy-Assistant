from loaders.pdf_loader import load_all_pdfs
from preprocessing.chunker import chunk_documents
from vectorstore.faiss_store import build_faiss_index, save_faiss_index


def run_indexing_pipeline():
    print("Starting RAG indexing pipeline...")

    # Step 1: Load PDFs
    documents = load_all_pdfs()

    # Step 2: Chunk documents
    chunks = chunk_documents(documents)

    # Step 3: Build FAISS index
    db = build_faiss_index(chunks)

    # Step 4: Save index
    save_faiss_index(db)

    print("RAG indexing pipeline completed successfully!")


if __name__ == "__main__":
    run_indexing_pipeline()
