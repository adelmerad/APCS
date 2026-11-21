<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Timeslot;
use Illuminate\Http\Request;

/**
 * Endpoints used by the AI assistant's tools.
 *
 * The assistant calls them with the user's own Sanctum token (it acts on
 * behalf of the user), so the user is always $request->user(). They never
 * accept a user_id in the body: the assistant can see exactly what the user
 * could see in the app, and nothing more.
 */
class InternalToolsController extends Controller
{
    public function getBookingStatus(Request $request)
    {
        $request->validate([
            'booking_id' => 'required',
        ]);

        $booking = Booking::with('timeslot')
            ->where('id', $request->booking_id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($this->bookingJson($booking));
    }

    public function getUserBookings(Request $request)
    {
        $request->validate([
            'date' => 'nullable|date',
            'hour' => 'nullable|string',
        ]);

        $query = Booking::with('timeslot')
            ->where('user_id', $request->user()->id);

        if ($request->filled('date')) {
            $query->whereHas('timeslot', function ($q) use ($request) {
                $q->whereDate('date', $request->date);
            });
        }

        if ($request->filled('hour')) {
            $query->whereHas('timeslot', function ($q) use ($request) {
                $q->where('hour_start', $request->hour);
            });
        }

        $bookings = $query->get()->map(fn ($booking) => $this->bookingJson($booking));

        return response()->json($bookings);
    }

    public function getPortSchedule(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $timeslots = Timeslot::whereDate('date', $request->date)
            ->orderBy('hour_start')
            ->get();

        $schedule = $timeslots->map(function ($slot) {
            return [
                'hour_start' => $slot->hour_start,
                'max_capacity' => $slot->capacity,
                'booked_capacity' => $this->activeBookings($slot),
                'late_capacity' => $slot->late_capacity,
            ];
        });

        return response()->json([
            'date' => $request->date,
            'schedule' => $schedule,
        ]);
    }

    /**
     * POST /api/internal/tools/available-slots
     * Gets available time slots for booking
     */
    public function getAvailableSlots(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
        ]);

        $availableSlots = Timeslot::whereDate('date', $request->date)
            ->orderBy('hour_start')
            ->get()
            ->map(function ($slot) {
                return [
                    'hour_start' => $slot->hour_start,
                    'max_capacity' => $slot->capacity,
                    'available_capacity' => $slot->capacity - $this->activeBookings($slot),
                ];
            })
            ->filter(fn ($slot) => $slot['available_capacity'] > 0);

        return response()->json([
            'date' => $request->date,
            'available_slots' => $availableSlots->values(),
        ]);
    }

    private function activeBookings(Timeslot $slot): int
    {
        return Booking::where('timeslot_id', $slot->id)
            ->whereIn('status', ['pending', 'in'])
            ->count();
    }

    private function bookingJson(Booking $booking): array
    {
        return [
            'booking_id' => (string) $booking->id,
            'timeslot' => [
                'date' => $booking->timeslot->date->format('Y-m-d'),
                'hour_start' => $booking->timeslot->hour_start,
            ],
            'status' => $booking->status,
        ];
    }
}
