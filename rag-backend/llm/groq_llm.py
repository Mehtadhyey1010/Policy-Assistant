from groq import Groq
from config.settings import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def get_groq_response(context: str, question: str):
    """
    Generate answer from Groq LLM using retrieved context.
    """

    prompt = f"""
        You are a helpful AI assistant.
        Answer the question ONLY using the context below.
        If the answer is not in the context, say "I don't know".

        Context:
            {context}

        Question:
            {question}
        """

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.2
    )

    return response.choices[0].message.content
