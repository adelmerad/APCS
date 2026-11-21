from pydantic import BaseModel
from typing import List, Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    message_id: Optional[str] = None
    sender: Literal["human", "agent"]
    message: str
    index: Optional[int] = None
    created_at: Optional[str] = None


class GenerateRequest(BaseModel):
    # No user_id here: the user is identified by the token in the
    # Authorization header, which the backend checks itself.
    chat_id: str
    message: str
    messages: List[ChatMessage] = []


class GenerateResponse(BaseModel):
    message: str


class Timeslot(BaseModel):
    date: str
    hour_start: str


class Booking(BaseModel):
    booking_id: str
    timeslot: Timeslot
    status: str


class ScheduleSlot(BaseModel):
    hour_start: str
    max_capacity: int
    booked_capacity: int
    late_capacity: int


class PortSchedule(BaseModel):
    date: str
    schedule: List[ScheduleSlot]
