import React, { useState, useRef, useEffect } from "react";

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const DocumentIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setErrorMessage("Please select a valid PDF file.");
      setTimeout(() => setErrorMessage(""), 4000);
      return;
    }

    setErrorMessage("");
    setSelectedFile(file);
    setIsUploading(true);
    setUploadStatus("Uploading...");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/upload-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      setUploadStatus("✅ Upload success");
      setTimeout(() => setUploadStatus(""), 4000);
    } catch (err) {
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadStatus("");
      setErrorMessage("Upload failed. Please try again.");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadStatus("");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || isUploading) return;

    const query = input;
    const userMsg = { role: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });

      if (!response.ok) throw new Error("Backend error");
      const data = await response.json();

      const botMsg = {
        role: "assistant",
        text: data.answer || "No answer found.",
        sources: data.sources || [],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "⚠️ Error fetching response. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-start pt-32 relative font-sans selection:bg-white/20 p-4">

      {/* Navbar when chat active */}
      {hasMessages && (
        <header className="fixed top-0 left-0 w-full flex items-center justify-between p-4 border-b border-white/10 bg-[#0f0f0f]/90 backdrop-blur-md z-10">
          <h1 className="text-xl font-medium tracking-tight text-white">Policy Assistant</h1>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex flex-col items-center w-full max-w-2xl mx-auto overflow-y-auto ${hasMessages ? 'flex-1 justify-start pt-20 mb-32' : 'justify-start'} transition-all duration-300 w-full`}>

        {/* Greeting Stack */}
        {!hasMessages && (
          <div className="flex flex-col items-center text-center mb-12 w-full animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-3 text-center">POLICY ASSISTANT</h1>
            <p className="text-base text-gray-400 mb-8 text-center">Your intelligent policy assistant</p>
            <h2 className="text-2xl md:text-3xl font-medium text-white mb-8 mt-16 text-center">Where should we start?</h2>
          </div>
        )}

        {/* Chat Thread */}
        {hasMessages && (
          <div className="w-full flex flex-col gap-6 pb-6 mt-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} `}>
                {msg.role === 'user' ? (
                  <div className="bg-[#1e1e1e] text-white px-5 py-3 rounded-2xl max-w-[85%] text-[15px] leading-relaxed break-words border border-white/5">
                    {msg.text}
                  </div>
                ) : (
                  <div className="text-white pt-2 pb-4 w-full text-[15px] leading-relaxed break-words max-w-[95%]">
                    <p>{msg.text}</p>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {msg.sources.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                            <DocumentIcon />
                            <span>{s.filename} (p. {s.page})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex w-full justify-start text-white pt-2 pb-4 text-[15px]">
                <span className="animate-pulse text-gray-400">Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      {/* Input box container */}
      <div className={`w-full max-w-2xl ${hasMessages ? 'fixed bottom-6 left-1/2 -translate-x-1/2 z-20 px-4' : 'mt-8'}`}>
        <div className="relative w-full flex flex-col">
          <form onSubmit={handleSubmit} className="relative flex items-center w-full shadow-2xl bg-[#1e1e1e]/80 rounded-2xl border border-white/10 backdrop-blur-xl transition-all duration-300 focus-within:border-white/25 focus-within:bg-[#252525]/90 min-h-[56px] md:min-h-[64px]">
            {/* Hidden file input */}
            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Plus icon / Trigger File Upload */}
            <button
              type="button"
              onClick={handleTriggerUpload}
              className="ml-3 text-gray-400 hover:text-white transition-colors duration-200 p-2 flex-shrink-0 rounded-full hover:bg-white/10"
              aria-label="Upload PDF"
              title="Upload PDF documentation"
            >
              <PlusIcon />
            </button>

            {/* Selected File Box inside Input area (Pill Style) */}
            {selectedFile && (
              <div className="flex items-center gap-2 bg-[#2a2a2a] hover:bg-[#333333] transition-colors px-3 py-1.5 rounded-full text-sm text-white max-w-[140px] md:max-w-[200px] ml-2 border border-white/5 shadow-sm">
                <div className="flex items-center justify-center bg-[#e53e3e] text-white text-[10px] font-bold rounded-sm px-1.5 py-0.5 tracking-wider">
                  PDF
                </div>
                <span className="truncate text-[13px]">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={removeFile}
                  className="hover:text-red-400 ml-1 text-gray-400 focus:outline-none flex-shrink-0"
                  aria-label="Remove attached file"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            {/* Text Input field */}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedFile ? "Ask questions about this document..." : "Upload a PDF or ask anything..."}
              disabled={loading || isUploading}
              className="flex-1 bg-transparent text-white py-4 md:py-[18px] px-3 text-[15px] md:text-[16px] 
                         outline-none placeholder:text-gray-500 disabled:opacity-50 min-w-0"
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={!input.trim() || loading || isUploading}
              className="mr-3 p-2 bg-white text-black rounded-full shadow-sm outline-none
                         hover:bg-gray-200 focus:bg-gray-200 transition-all duration-200 
                         disabled:opacity-0 disabled:scale-95 disabled:pointer-events-none transform scale-100 flex-shrink-0"
              aria-label="Send message"
            >
              <ArrowRightIcon />
            </button>
          </form>

          {/* Upload Status text under the input box */}
          <div className="min-h-[24px] mt-2 px-2 text-[13px] font-medium transition-opacity duration-300 text-center">
            {isUploading && <span className="text-gray-400 animate-pulse">{uploadStatus}</span>}
            {!isUploading && !errorMessage && uploadStatus && <span className="text-gray-400">{uploadStatus}</span>}
            {errorMessage && <span className="text-red-400">{errorMessage}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
