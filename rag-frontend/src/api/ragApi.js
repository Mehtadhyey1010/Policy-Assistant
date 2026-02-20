const BACKEND_URL = "http://localhost:8000";

export async function askQuestion(question) {
  const res = await fetch(`${BACKEND_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    throw new Error("Backend error");
  }

  return await res.json();
}

export async function uploadPdf(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/upload-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("PDF upload failed");
  }

  return await response.json();
}
