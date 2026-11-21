<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\QrCode;
use App\Models\Log;
use App\Models\Timeslot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class GateController extends Controller
{
    /**
     * GET /api/gate/qr/:bookingId
     * Requires Carrier auth
     * Returns the QR Code String for that booking
     */
    public function getQrCode($bookingId)
    {
        // Check carrier role
        if (Auth::user()->role !== 'transiter' && Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $booking = Booking::find($bookingId);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Check if user owns the booking
        if ($booking->user_id !== Auth::user()->id && Auth::user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if QR code already exists
        $qrCode = QrCode::where('booking_id', $bookingId)->first();

        if (!$qrCode) {
            // Generate new QR code
            $qrString = 'apk_' . Str::random(40);

            $qrCode = QrCode::create([
                'booking_id' => $bookingId,
                'qr' => $qrString,
            ]);

            // Log QR generation
            Log::create([
                'code' => 'QR_GENERATED',
                'message' => "QR Code generated for booking {$bookingId}",
            ]);
        }

        return response()->json([
            'qr' => $qrCode->qr,
        ]);
    }

    /**
     * POST /api/gate/scan
     * Requires Operator auth
     * Scans QR code and processes arrival with late slot logic
     */
    public function scanQrCode(Request $request)
    {
        // Check operator role
        if ($request->user()->role !== 'operator' && $request->user()->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'qr' => 'required|string',
        ]);

        // One transaction with the QR row locked: two scans of the same code
        // at the same moment cannot both let the truck in.
        return DB::transaction(fn () => $this->processScan($request->qr));
    }

    /**
     * Check a QR code and register the arrival. The code is consumed
     * (used_at is set) only when the truck is actually let in.
     */
    private function processScan(string $qr)
    {
        $qrCode = QrCode::where('qr', $qr)->lockForUpdate()->first();

        if (!$qrCode) {
            return response()->json(['error' => 'Invalid QR code'], 404);
        }

        if ($qrCode->used_at) {
            return response()->json([
                'error' => 'QR code already used',
                'message' => "This QR code was already scanned at {$qrCode->used_at}",
            ], 409);
        }

        $booking = Booking::with('timeslot')->find($qrCode->booking_id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        if ($booking->status !== 'pending') {
            return response()->json([
                'error' => 'Booking is not waiting for arrival',
                'message' => "Current status: {$booking->status}",
            ], 409);
        }

        $currentTime = Carbon::now();
        $bookingTimeslot = $booking->timeslot;

        // Parse the booking timeslot date and hour correctly
        // Extract just the date portion and combine with hour_start
        $dateOnly = Carbon::parse($bookingTimeslot->date)->format('Y-m-d');
        $bookingDateTime = Carbon::parse($dateOnly . ' ' . $bookingTimeslot->hour_start . ':00:00');
        $bookingEndTime = $bookingDateTime->copy()->addHour(); // 1-hour window (e.g., 8:00 to 9:00)

        // Check if truck is early (before the timeslot starts)
        if ($currentTime->lessThan($bookingDateTime)) {
            return response()->json([
                'error' => 'Truck arrived too early',
                'message' => "Booking timeslot starts at {$bookingDateTime->format('Y-m-d H:i')}. Current time: {$currentTime->format('Y-m-d H:i')}",
            ], 400);
        }

        // Check if truck is on time (within the 1-hour window)
        $isOnTime = $currentTime->between($bookingDateTime, $bookingEndTime);

        // Check if truck is late (after the 1-hour window)
        $isLate = $currentTime->greaterThanOrEqualTo($bookingEndTime);

        if ($isOnTime) {
            // Truck is on time - normal check-in
            $booking->status = 'in';
            $booking->save();
            $qrCode->update(['used_at' => $currentTime]);

            Log::create([
                'code' => 'CARRIER_ARRIVED',
                'message' => "Truck {$booking->truck_number} arrived ON TIME at terminal for booking {$booking->id}",
            ]);

            return response()->json([
                'message' => 'Carrier arrival registered successfully (On Time)',
                'booking_id' => $booking->id,
                'truck_number' => $booking->truck_number,
                'status' => $booking->status,
                'arrival_type' => 'on_time',
            ]);
        }

        if ($isLate) {
            // Truck is late - need to find available late slot
            $result = $this->handleLateArrival($booking, $currentTime);

            if (isset($result['error'])) {
                return response()->json($result, 409);
            }

            $qrCode->update(['used_at' => $currentTime]);

            return response()->json($result);
        }
    }

    /**
     * Handle late arrival by checking late slot availability
     */
    private function handleLateArrival($booking, $currentTime)
    {
        $originalTimeslot = $booking->timeslot;

        // Count regular (on-time) bookings in original timeslot
        $regularBookingsInOriginal = Booking::where('timeslot_id', $originalTimeslot->id)
            ->where('status', 'in')
            ->count();

        // Calculate how many late slots are used
        // Late slots start being used when bookings exceed the regular capacity
        $lateSlotsUsed = max(0, $regularBookingsInOriginal - $originalTimeslot->capacity);

        if ($lateSlotsUsed < $originalTimeslot->late_capacity) {
            // Late capacity available in original timeslot
            $booking->status = 'in';
            $booking->save();

            Log::create([
                'code' => 'CARRIER_ARRIVED',
                'message' => "Truck {$booking->truck_number} arrived LATE but accommodated in original timeslot late capacity for booking {$booking->id}",
            ]);

            return [
                'message' => 'Carrier arrival registered (Late - Original Slot)',
                'booking_id' => $booking->id,
                'truck_number' => $booking->truck_number,
                'status' => $booking->status,
                'arrival_type' => 'late_original_slot',
                'timeslot_id' => $originalTimeslot->id,
            ];
        }

        // No late capacity in original slot - check subsequent timeslots
        $nextAvailableSlot = $this->findNextAvailableLateSlot($originalTimeslot, $currentTime);

        if ($nextAvailableSlot) {
            // Move booking to the new timeslot
            $oldTimeslotId = $booking->timeslot_id;
            $booking->timeslot_id = $nextAvailableSlot->id;
            $booking->status = 'in';
            $booking->save();

            Log::create([
                'code' => 'MODIFIED_BOOKING',
                'message' => "Truck {$booking->truck_number} arrived LATE. Booking {$booking->id} moved from timeslot {$oldTimeslotId} to {$nextAvailableSlot->id} (late slot)",
            ]);

            Log::create([
                'code' => 'CARRIER_ARRIVED',
                'message' => "Truck {$booking->truck_number} arrived LATE and accommodated in timeslot {$nextAvailableSlot->id} late capacity",
            ]);

            return [
                'message' => 'Carrier arrival registered (Late - Rescheduled to Next Available Slot)',
                'booking_id' => $booking->id,
                'truck_number' => $booking->truck_number,
                'status' => $booking->status,
                'arrival_type' => 'late_rescheduled',
                'original_timeslot_id' => $oldTimeslotId,
                'new_timeslot_id' => $nextAvailableSlot->id,
                'new_timeslot' => [
                    'date' => $nextAvailableSlot->date,
                    'hour_start' => $nextAvailableSlot->hour_start,
                ],
            ];
        }

        // No available late slots found
        Log::create([
            'code' => 'NEW_INCIDENT',
            'message' => "Truck {$booking->truck_number} arrived LATE for booking {$booking->id} but NO late capacity available in any timeslot",
        ]);

        return [
            'error' => 'No late capacity available',
            'message' => 'Truck arrived late and no late slots are available in current or subsequent timeslots',
            'booking_id' => $booking->id,
            'truck_number' => $booking->truck_number,
            'suggested_action' => 'Contact terminal administrator',
        ];
    }

    /**
     * Find the next available timeslot with late capacity
     */
    private function findNextAvailableLateSlot($originalTimeslot, $currentTime)
    {
        // Get all timeslots on the same day or later, starting from the original timeslot
        $timeslots = Timeslot::where('date', '>=', $originalTimeslot->date)
            ->where(function ($query) use ($originalTimeslot) {
                $query->where('date', '>', $originalTimeslot->date)
                    ->orWhere(function ($q) use ($originalTimeslot) {
                        $q->where('date', '=', $originalTimeslot->date)
                            ->where('hour_start', '>', $originalTimeslot->hour_start);
                    });
            })
            ->orderBy('date')
            ->orderBy('hour_start')
            ->get();

        foreach ($timeslots as $slot) {
            // Count current bookings in this slot
            $currentBookings = Booking::where('timeslot_id', $slot->id)
                ->where('status', 'in')
                ->count();

            // Check if late capacity is available
            // Late slots are available when: currentBookings < (capacity + late_capacity)
            if ($currentBookings < ($slot->capacity + $slot->late_capacity)) {
                return $slot;
            }
        }

        return null;
    }
    /**
     * POST /api/gate/complete
     * Marks shipment as completed and frees up the slot
     */
    public function completeShipment(Request $request)
    {
        // Check operator role
        if ($request->user()->role !== 'operator') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::with('timeslot')->find($request->booking_id);

        // Check if booking is currently 'in' status
        if ($booking->status !== 'in') {
            return response()->json([
                'error' => 'Invalid operation',
                'message' => "Booking must be in 'in' status to complete. Current status: {$booking->status}",
            ], 400);
        }

        // Get current occupancy before completing
        $currentOccupancy = Booking::where('timeslot_id', $booking->timeslot_id)
            ->where('status', 'in')
            ->count();

        // Change status to 'out' - this frees up the slot
        $booking->status = 'out';
        $booking->save();

        // Calculate new occupancy (should be currentOccupancy - 1)
        $newOccupancy = Booking::where('timeslot_id', $booking->timeslot_id)
            ->where('status', 'in')
            ->count();

        // Log shipment completion
        Log::create([
            'code' => 'SHIPMENT_CONSUMED',
            'message' => "Truck {$booking->truck_number} completed shipment for booking {$booking->id}. Slot freed. Occupancy: {$currentOccupancy} -> {$newOccupancy}",
        ]);

        return response()->json([
            'message' => 'Shipment marked as completed and slot freed',
            'booking_id' => $booking->id,
            'truck_number' => $booking->truck_number,
            'status' => $booking->status,
            'timeslot_freed' => true,
            'timeslot_info' => [
                'timeslot_id' => $booking->timeslot->id,
                'date' => $booking->timeslot->date,
                'hour_start' => $booking->timeslot->hour_start,
                'previous_occupancy' => $currentOccupancy,
                'current_occupancy' => $newOccupancy,
                'capacity' => $booking->timeslot->capacity,
                'late_capacity' => $booking->timeslot->late_capacity,
                'total_capacity' => $booking->timeslot->capacity + $booking->timeslot->late_capacity,
            ],
        ]);
    }
}
