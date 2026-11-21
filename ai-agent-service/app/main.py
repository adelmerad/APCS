from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from agents.gemini_agent import GeminiAgent
from models import GenerateRequest, GenerateResponse, ChatMessage

app = FastAPI(
    title="AI Agent Service",
    description="AI Agent service for port booking system",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

agent = GeminiAgent()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "AI Agent Service"}


def bearer_token(authorization: Optional[str]) -> str:
    """The caller must send the user's own token. The tools forward it to the
    backend, which identifies the user and checks ownership itself."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization[7:].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    return token


@app.post("/api/ai/generate", response_model=GenerateResponse)
async def generate(
    request: GenerateRequest,
    authorization: Optional[str] = Header(None),
):
    """
    Generate AI response for a user message

    Args:
        request: chat_id, the new message and the previous messages
        authorization: "Bearer <user token>"

    Returns:
        GenerateResponse with the AI's message
    """
    token = bearer_token(authorization)

    # The backend sends the conversation, which already ends with the
    # message it just saved: don't send it to the model twice.
    chat_history: List[ChatMessage] = list(request.messages)
    if (
        chat_history
        and chat_history[-1].sender == "human"
        and chat_history[-1].message == request.message
    ):
        chat_history.pop()

    try:
        response_message = await agent.generate(
            message=request.message,
            chat_history=chat_history,
            token=token,
        )
        return GenerateResponse(message=response_message)

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating response: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
