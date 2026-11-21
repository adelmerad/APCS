import httpx
from typing import List, Optional
from config import get_settings
from models import Booking, PortSchedule

settings = get_settings()
base_url = settings.api_base_url


def _headers(token: str) -> dict:
    """Act on behalf of the user: we forward the user's own token, so the
    backend identifies the user itself and applies its normal ownership checks.
    The user is never a tool argument."""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }


async def get_booking_status(booking_id: str, token: str) -> Booking:
    """Get the status of one of the current user's bookings"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/api/internal/tools/booking-status",
            json={"booking_id": booking_id},
            headers=_headers(token),
        )
        response.raise_for_status()
        return Booking(**response.json())


async def get_user_bookings(
    date: str, hour: Optional[str], token: str
) -> List[Booking]:
    """Get the current user's bookings for a date (and optionally an hour)"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/api/internal/tools/user-bookings",
            json={"date": date, "hour": hour},
            headers=_headers(token),
        )
        response.raise_for_status()
        data = response.json()
        return [Booking(**booking) for booking in data]


async def get_port_schedule(date: str, token: str) -> PortSchedule:
    """Get the port schedule (capacity per hour) for a date"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{base_url}/api/internal/tools/port-schedule",
            json={"date": date},
            headers=_headers(token),
        )
        response.raise_for_status()
        return PortSchedule(**response.json())
