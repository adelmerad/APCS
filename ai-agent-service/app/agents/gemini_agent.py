from datetime import date
from google import genai
from google.genai import types
from typing import List, Dict, Any
from models import ChatMessage
from agents.base import AgentInterface
from config import get_settings
from tools import get_booking_status, get_port_schedule, get_user_bookings

# Tool schemas shown to the model. They only contain what the user is allowed
# to choose (a booking number, a date, an hour). The user's identity is NOT a
# parameter: it comes from the authenticated request, never from the model.
TOOL_DECLARATIONS = types.Tool(
    function_declarations=[
        types.FunctionDeclaration(
            name="get_booking_status",
            description="Get the status, date and hour of one of the current user's bookings.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "booking_id": types.Schema(
                        type="STRING", description="The booking number"
                    )
                },
                required=["booking_id"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_my_bookings",
            description="List the current user's bookings for a date, optionally for one hour.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "date": types.Schema(type="STRING", description="YYYY-MM-DD"),
                    "hour": types.Schema(
                        type="STRING", description="HH (00-23), optional"
                    ),
                },
                required=["date"],
            ),
        ),
        types.FunctionDeclaration(
            name="get_port_schedule",
            description="Get the port capacity and bookings per hour for a date.",
            parameters=types.Schema(
                type="OBJECT",
                properties={
                    "date": types.Schema(type="STRING", description="YYYY-MM-DD")
                },
                required=["date"],
            ),
        ),
    ]
)

# A question like "move my booking to a free slot tomorrow" needs several tool
# rounds (read the booking, read the schedule, then answer).
MAX_TOOL_ROUNDS = 5


class GeminiAgent(AgentInterface):
    """Gemini AI agent implementation with native function calling"""

    def __init__(self, client=None):
        self.settings = get_settings()
        self.client = client or genai.Client(api_key=self.settings.gemini_api_key)
        self.system_prompt = self._load_system_prompt()
        self.model = "gemini-2.0-flash-lite"

    def _config(self) -> types.GenerateContentConfig:
        # The system prompt goes in its dedicated field, on every call
        # (including the first message of a conversation).
        return types.GenerateContentConfig(
            system_instruction=f"{self.system_prompt}\n\nToday's date is {date.today().isoformat()}.",
            tools=[TOOL_DECLARATIONS],
            automatic_function_calling=types.AutomaticFunctionCallingConfig(
                disable=True
            ),
        )

    async def generate(
        self,
        message: str,
        chat_history: List[ChatMessage],
        token: str,
    ) -> str:
        """Generate response using Gemini with native function calling"""
        try:
            contents = self._build_chat_history(chat_history)
            contents.append(
                types.Content(role="user", parts=[types.Part(text=message)])
            )
            config = self._config()

            for _ in range(MAX_TOOL_ROUNDS):
                response = await self.client.aio.models.generate_content(
                    model=self.model, contents=contents, config=config
                )

                # Add the model's response (text or function call) to history
                model_content = response.candidates[0].content
                contents.append(model_content)

                function_calls = [
                    p.function_call for p in model_content.parts if p.function_call
                ]

                if not function_calls:
                    return response.text

                tool_responses = []
                for fc in function_calls:
                    result = await self._execute_function(
                        fc.name, dict(fc.args or {}), token
                    )
                    tool_responses.append(
                        types.Part(
                            function_response=types.FunctionResponse(
                                name=fc.name, response={"result": result}
                            )
                        )
                    )

                # Send function results back in the next round
                contents.append(types.Content(role="user", parts=tool_responses))

            return "I'm sorry, I reached my maximum reasoning limit for this request."

        except Exception as e:
            raise Exception(f"Error whilst generating the response {str(e)}")

    def _build_chat_history(self, chat_history: List[ChatMessage]) -> List[types.Content]:
        """Build Gemini chat history format (last 10 messages)"""
        history = []
        for msg in chat_history[-10:]:
            role = "user" if msg.sender == "human" else "model"
            history.append(
                types.Content(role=role, parts=[types.Part(text=msg.message)])
            )
        return history

    async def _execute_function(
        self, function_name: str, args: Dict[str, Any], token: str
    ) -> Dict[str, Any]:
        """Execute a function call on behalf of the user and return the result.
        Any identity the model may have written in args is ignored."""

        try:
            if function_name == "get_booking_status":
                booking = await get_booking_status(
                    booking_id=str(args["booking_id"]), token=token
                )
                return {
                    "booking_id": booking.booking_id,
                    "status": booking.status,
                    "date": booking.timeslot.date,
                    "hour": booking.timeslot.hour_start,
                }

            elif function_name == "get_my_bookings":
                bookings = await get_user_bookings(
                    date=args["date"], hour=args.get("hour"), token=token
                )
                return {
                    "bookings": [
                        {
                            "booking_id": b.booking_id,
                            "status": b.status,
                            "date": b.timeslot.date,
                            "hour": b.timeslot.hour_start,
                        }
                        for b in bookings
                    ]
                }

            elif function_name == "get_port_schedule":
                schedule = await get_port_schedule(date=args["date"], token=token)
                return {
                    "date": schedule.date,
                    "slots": [
                        {
                            "hour": slot.hour_start,
                            "max_capacity": slot.max_capacity,
                            "booked_capacity": slot.booked_capacity,
                            "available": slot.max_capacity - slot.booked_capacity,
                        }
                        for slot in schedule.schedule
                    ],
                }

            else:
                return {"error": f"Unknown function: {function_name}"}

        except Exception as e:
            return {"error": str(e)}
