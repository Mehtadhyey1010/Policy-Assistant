import os
from langchain_community.document_loaders import PyPDFLoader
from config.settings import RAW_DATA_DIR

class ChatSession:
    """
    Manages chat session state and loaded documents.
    Prevents reloading of previously loaded files.
    """
    def __init__(self):
        self.loaded_documents = []  # All documents loaded in this session
        self.loaded_files = set()   # Track which files have been loaded
        
    def add_documents(self, new_documents, file_name):
        """Add new documents to the session."""
        self.loaded_documents.extend(new_documents)
        self.loaded_files.add(file_name)
        print(f"✓ Added: {file_name} | Total files in chat: {len(self.loaded_files)}")
        
    def has_file_loaded(self, file_name):
        """Check if file already loaded in this session."""
        return file_name in self.loaded_files
    
    def get_all_documents(self):
        """Get all accumulated documents from session."""
        return self.loaded_documents
    
    def reset_session(self):
        """Clear session for new chat."""
        self.loaded_documents = []
        self.loaded_files = set()
        print("Chat session cleared.")

# Global session management
_current_session = ChatSession()

def load_single_pdf(file_path: str):
    """
    Load a single PDF file and return LangChain Documents.
    Each page becomes a Document with metadata.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"PDF file not found: {file_path}")
    
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    print(f"Loaded {len(documents)} pages from {os.path.basename(file_path)}")
    return documents

def load_uploaded_file(file_name: str, session=None):
    """
    Load a specific uploaded PDF file.
    Keeps track of loaded files in current chat session.
    
    Args:
        file_name: Name of the uploaded PDF file
        session: ChatSession object (creates new if None)
    
    Returns:
        List of new documents added
    """
    if session is None:
        session = _current_session
    
    file_path = os.path.join(RAW_DATA_DIR, file_name)
    
    # Check if already loaded in this session
    if session.has_file_loaded(file_name):
        print(f"⚠ File '{file_name}' already loaded in this chat. Skipping...")
        return []
    
    # Load the file
    try:
        documents = load_single_pdf(file_path)
        session.add_documents(documents, file_name)
        return documents
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        return []

def load_multiple_uploaded_files(file_names: list, session=None):
    """
    Load multiple uploaded PDF files.
    Only loads files not previously loaded in session.
    
    Args:
        file_names: List of PDF file names to load
        session: ChatSession object (creates new if None)
    
    Returns:
        All accumulated documents in session
    """
    if session is None:
        session = _current_session
    
    print(f"📂 Processing {len(file_names)} file(s)...\n")
    
    for file_name in file_names:
        load_uploaded_file(file_name, session)
    
    total_pages = len(session.get_all_documents())
    print(f"\n📊 Total pages in chat: {total_pages}")
    return session.get_all_documents()

def get_current_session():
    """Get current chat session."""
    return _current_session

def create_new_session():
    """Create a new chat session (clears previous files)."""
    global _current_session
    _current_session = ChatSession()
    print("✨ New chat session started.")
    return _current_session

# Legacy function for backward compatibility
def load_all_pdfs():
    """
    Load all PDF files from the raw data directory.
    (Legacy function - use load_multiple_uploaded_files for new chat sessions)
    """
    all_documents = []
    for filename in os.listdir(RAW_DATA_DIR):
        if filename.lower().endswith(".pdf"):
            file_path = os.path.join(RAW_DATA_DIR, filename)
            print(f"Loading PDF: {filename}")
            docs = load_single_pdf(file_path)
            all_documents.extend(docs)
    print(f"Total pages loaded: {len(all_documents)}")
    return all_documents
