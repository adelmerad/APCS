<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Config;
use App\Models\Log;
use App\Models\Timeslot;
use Dotenv\Validator;
use Illuminate\Container\Attributes\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    public function getBookingById($id, Request $request)
    {
        // Check admin role
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $booking = Booking::with('timeslot')->find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json([
            'booking_id' => $booking->id,
            'truck_number' => $booking->truck_number,
            'timeslot' => [
                'date' => $booking->timeslot->date,
                'hour_start' => $booking->timeslot->hour_start,
            ],
            'status' => $booking->status,
        ]);
    }

    public function getBookingsByDateAndHour($date, $hour, Request $request)
    {
        // Check carrier role
        if ($request->user()->role !== 'transiter' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $user = $request->user();

        $timeslot = Timeslot::where('date', $date)
            ->where('hour_start', $hour)
            ->first();

        if (!$timeslot) {
            return response()->json([
                'error' => 'Timeslot not found',
            ]);
        }

        $bookings = Booking::where('user_id', $user->id)
            ->where('timeslot_id', $timeslot->id)
            ->with('timeslot')
            ->get()
            ->map(function ($booking) {
                return [
                    'booking_id' => $booking->id,
                    'truck_number' => $booking->truck_number,
                    'timeslot' => [
                        'date' => $booking->timeslot->date,
                        'hour_start' => $booking->timeslot->hour_start,
                    ],
                    'status' => $booking->status,
                ];
            });

        return response()->json($bookings);
    }

    public function createBooking(Request $request)
    {
        // Check carrier role
        if ($request->user()->role !== 'transiter' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'truck_number' => 'required|string',
            'timeslot.date' => 'required|date',
            'timeslot.hour_start' => 'required|string',
        ]);

        $config = Config::first();

        // Find or create timeslot
        $timeslot = Timeslot::firstOrCreate(
            [
                'date' => $request->timeslot['date'],
                'hour_start' => $request->timeslot['hour_start'],
            ],
            [
                'capacity' => $config->capacity,
                'late_capacity' => $config->late_capacity,
            ]
        );

        // Check capacity and insert in one transaction. The slot row is locked,
        // so two carriers cannot both take the last place at the same moment.
        $booking = DB::transaction(function () use ($request, $timeslot) {
            if (!$this->hasRoom($timeslot)) {
                return null;
            }

            return Booking::create([
                'user_id' => $request->user()->id,
                'truck_number' => $request->truck_number,
                'timeslot_id' => $timeslot->id,
                'status' => 'pending',
            ]);
        });

        if (!$booking) {
            return response()->json(['error' => 'Timeslot is full'], 400);
        }

        // Log the action
        Log::create([
            'code' => 'NEW_BOOKING',
            'message' => "New booking created: {$booking->id} for truck {$booking->truck_number}",
        ]);

        return response()->json([
            'booking_id' => $booking->id,
            'message' => 'Booking created successfully',
        ], 201);
    }

    public function updateBookingStatus(Request $request, $id)
    {
        // Check carrier role
        if ($request->user()->role !== 'transiter' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => 'required|in:pending,in,out',
        ]);


        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Check if user owns the booking
        if ($booking->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $oldStatus = $booking->status;
        $booking->status = $request->status;
        $booking->save();

        // Log the action
        Log::create([
            'code' => 'MODIFIED_BOOKING',
            'message' => "Booking {$booking->id} status changed from {$oldStatus} to {$request->status}",
        ]);

        return response()->json([
            'message' => 'Booking status updated successfully',
            'booking_id' => $booking->id,
            'status' => $booking->status,
        ]);
    }

    public function rescheduleBooking(Request $request, $id)
    {
        // Check carrier role
        if ($request->user()->role !== 'transiter' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'timeslot.date' => 'required|date',
            'timeslot.hour_start' => 'required|string',
        ]);


        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Check if user owns the booking
        if ($booking->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Find new timeslot
        $newTimeslot = Timeslot::where('date', $request->timeslot['date'])
            ->where('hour_start', $request->timeslot['hour_start'])
            ->first();

        if (!$newTimeslot) {
            $newTimeslot = Timeslot::create([
                'date' => $request->timeslot['date'],
                'hour_start' => $request->timeslot['hour_start'],
                'capacity' => Config::first()->capacity,
                'late_capacity' => Config::first()->late_capacity,
            ]);
        }

        $oldTimeslotId = $booking->timeslot_id;

        // Same check-then-write as createBooking, under a lock on the new slot
        $moved = DB::transaction(function () use ($booking, $newTimeslot) {
            if (!$this->hasRoom($newTimeslot)) {
                return false;
            }
            $booking->timeslot_id = $newTimeslot->id;
            $booking->save();
            return true;
        });

        if (!$moved) {
            return response()->json(['error' => 'New timeslot is full'], 400);
        }

        // Log the action
        Log::create([
            'code' => 'MODIFIED_BOOKING',
            'message' => "Booking {$booking->id} rescheduled from timeslot {$oldTimeslotId} to {$newTimeslot->id}",
        ]);

        return response()->json([
            'message' => 'Booking rescheduled successfully',
            'booking_id' => $booking->id,
        ]);
    }

    public function deleteBooking($id, Request $request)
    {
        // Check carrier role
        if ($request->user()->role !== 'transiter' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Check if user owns the booking
        if ($booking->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Log the action before deleting
        Log::create([
            'code' => 'DELETED_BOOKING',
            'message' => "Booking {$booking->id} for truck {$booking->truck_number} deleted",
        ]);

        $booking->delete();

        return response()->json([
            'message' => 'Booking deleted successfully',
        ]);
    }

    /**
     * Must be called inside a transaction: locks the slot row, then counts its
     * active bookings (pending or in; "out" frees the place).
     */
    private function hasRoom(Timeslot $timeslot): bool
    {
        $slot = Timeslot::whereKey($timeslot->id)->lockForUpdate()->first();

        $active = Booking::where('timeslot_id', $slot->id)
            ->whereIn('status', ['pending', 'in'])
            ->count();

        return $active < $slot->capacity;
    }
}
