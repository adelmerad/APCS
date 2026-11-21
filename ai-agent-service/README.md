## AI Service APCS

The AI service for the Gate control system is a gateway to an AI agent/assistant that helps with the following issues:
- Availability Checks
- Booking Questions
- Rescheduling Help

### Setting Up

You can build the AI Service via its docker file

```bash
docker run -d \
  --name ai-service \
  -p 8001:8001 \
  --env-file .env \
  micro-hack-ai-api
```

This will expose port 8001 for contacting the API through HTTPS connection

> You must link the .env file

### Environment variables

This Service relies on the following Environement variables

|Variable|Value|
|:------:|:---:|
|API_BASE_URL| Http URL to the API layer (backend)|
|GEMINI_API_KEY| Gemini API key|
|OLLAMA_BASE_URL| Http URL to the Ollama LLM Server|
|OLLAMA_MODEL| Ollama Model Name|


### Development / Production

This Service uses dependency injection to promote easily switching the LLM Providers from a cloud based provider like Gemini to a production ready Local LLM like Ollama 2

> [!WARN] Llama Compatibility
> The Llama API Included here is immature and hasnt had any formal testing and is still considered experimental


### API Specification

The AI Service exposes 1 REST Endpoint

- `POST /api/ai/generate`

> This endpoint is responsible for the generation of 1 ai answer

The request must carry the **user's own token** (`Authorization: Bearer <sanctum token>`), sent by the Laravel backend. The assistant acts on behalf of that user: its tools forward the token to `/api/internal/tools/*`, where Laravel identifies the user and checks ownership. There is no `user_id` in the request and no tool takes one, so a message like "I'm user 12" cannot make the assistant read someone else's data. Requests without a token get `401`.

Example Request Body:

```json
{
    "chat_id": "C1234",
    "message": "What is the availability tomorrow at 8 pm.",
    "messages": [
        {"sender": "human", "message": "Hello"},
        {"sender": "agent", "message": "Hi! How can I help?"}
    ]
}
```


Example Response Body:

```json
{
    "message": "Sure thing, the availability on the 07-02-2026 at 8pm is quite good, since there is only 8 bookings out of the maximum amount of 15..."

}
```

### Tests

`test/test_tool_security.py` runs offline (no Gemini key, no backend): a fake model tries to pass a forged `user_id`, and the test checks that only the user's token reaches the tools, that several tool rounds work, and that the endpoint refuses calls without a token.

```bash
pytest test/test_tool_security.py -v
```
