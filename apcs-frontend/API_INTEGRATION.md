# APCS Frontend-Backend API Integration Guide

## Overview
This document maps the frontend UI actions to the backend API endpoints according to the APCS API Architecture.

## API Base URL
```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3000/api';
```

---

## 1. CARRIER APIs

### 🔐 Authentication
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Login | `/api/auth/login` | POST | Login.jsx |
| Logout | `/api/auth/logout` | POST | Header.jsx |
| Get Profile | `/api/user/profile` | GET | Settings.jsx |

### 📦 Bookings (Carrier)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| View My Bookings | `/api/user/bookings` | GET | Bookings.jsx |
| View by Date/Hour | `/api/booking/:date/:hour` | GET | Bookings.jsx |
| **Create Booking** | `/api/booking` | POST | CreateBooking.jsx |
| Update Status | `/api/booking/:id/status` | PUT | Bookings.jsx |
| Reschedule | `/api/booking/:id/reschedule` | PUT | Bookings.jsx |
| Delete Booking | `/api/booking/:id` | DELETE | Bookings.jsx |

### 🚪 Terminal Access (Carrier)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| **Get QR Code** | `/api/terminal/qr/:bookingId` | GET | Bookings.jsx |
| Download QR | `/api/terminal/qr/:bookingId` | GET | CreateBooking.jsx |

### 📋 Reports (Carrier)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Report Incident | `/api/report` | POST | Bookings.jsx |

### 🤖 AI Assistant (Carrier)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Get Chat History | `/api/ai/chat` | GET | AIAssistant.jsx |
| **Send Query** | `/api/ai/generate` | POST | AIAssistant.jsx |

---

## 2. OPERATOR APIs

### 📦 Bookings (Operator)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| View Booking | `/api/booking/:id` | GET | Bookings.jsx |
| **Validate Booking** | `/api/booking/:id/validate` | PUT | Bookings.jsx |
| Confirm/Reject | `/api/booking/:id/validate` | PUT | Operations.jsx |

### 🚪 Terminal Operations (Operator)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| **Scan QR Code** | `/api/terminal/scan` | POST | Operations.jsx |
| Get Queue Status | `/api/terminal/:terminalId/status` | GET | Operations.jsx |
| **Mark Complete** | `/api/terminal/:terminalId/done` | PUT | Operations.jsx |

### 🔧 Admin View (Limited - Operator)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| View Schedule | `/api/admin/:terminalId/:date` | GET | Operations.jsx |

### 📋 Reports (Operator)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Create Report | `/api/report` | POST | Operations.jsx |

### 🤖 AI Assistant (Operator)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Query Congestion | `/api/ai/generate` | POST | AIAssistant.jsx |

---

## 3. ADMIN APIs

### ⚙️ Configuration
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Set Terminal Capacity | `/api/admin/config/:terminalId` | POST | SlotManagement.jsx |
| Configure Late Slots | `/api/admin/config/late` | POST | SlotManagement.jsx |

### 📅 Scheduling & Capacity
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| View Schedule | `/api/admin/schedule` | GET | Dashboard.jsx |
| View Date Range | `/api/admin/schedule/:start/:end` | GET | SlotManagement.jsx |
| Check Availability | `/api/admin/:terminalId/:date/available` | GET | SlotManagement.jsx |

### 📊 Analytics
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Schedule Analytics | `/api/admin/data/schedule/:date` | GET | Dashboard.jsx |
| Container Analytics | `/api/admin/data/containers/:date` | GET | Dashboard.jsx |
| Capacity Analytics | `/api/admin/data/capacity/:date` | GET | Dashboard.jsx |
| Logs Analytics | `/api/admin/data/logs/:date` | GET | Logs.jsx |

### 📦 Bookings (Admin - Read Only)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| View Booking | `/api/booking/:id` | GET | Bookings.jsx |

### 📋 Reports (Admin)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Get Reports | `/api/report/:date` | GET | Logs.jsx |
| **Solve Incident** | `/api/report/solve` | POST | Logs.jsx |

### 👥 Users & Roles (Admin)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| List Users | `/api/admin/users` | GET | Users.jsx |
| Create User | `/api/admin/users` | POST | Users.jsx |
| Update User | `/api/admin/users/:id` | PUT | Users.jsx |
| Assign Role | `/api/admin/users/:id/role` | PUT | Users.jsx |
| Enable/Disable | `/api/admin/users/:id/status` | PUT | Users.jsx |

### 🤖 AI Supervision (Admin)
| UI Action | Endpoint | Method | Page |
|-----------|----------|--------|------|
| Monitor AI Usage | `/api/admin/ai/usage` | GET | Dashboard.jsx |
| Review AI Logs | `/api/admin/ai/logs` | GET | Logs.jsx |

---

## Key UI-to-API Mappings

### Create Booking Flow (Carrier)
**Page:** `CreateBooking.jsx`

**Steps:**
1. **Step 1:** Select terminal & date → No API call (local state)
2. **Step 2:** Check availability → `GET /api/admin/:terminalId/:date/available`
3. **Step 3:** Enter details → No API call (form state)
4. **Step 4:** Submit → `POST /api/booking`
5. **Confirmation:** Get QR → `GET /api/terminal/qr/:bookingId`

### Validate Booking Flow (Operator)
**Page:** `Bookings.jsx` or `Operations.jsx`

**Actions:**
- View pending bookings → `GET /api/booking/:id`
- **Confirm** → `PUT /api/booking/:id/validate` with `{ status: 'CONFIRMED' }`
- **Reject** → `PUT /api/booking/:id/validate` with `{ status: 'REJECTED', reason: '...' }`

### Gate Scan Flow (Operator)
**Page:** `Operations.jsx`

**Actions:**
1. Truck arrives with QR code
2. Operator scans → `POST /api/terminal/scan` with `{ qrCode, terminalId }`
3. View queue → `GET /api/terminal/:terminalId/status`
4. Mark complete → `PUT /api/terminal/:terminalId/done` with `{ bookingId }`

### AI Assistant Flow (All Roles)
**Page:** `AIAssistant.jsx`

**Actions:**
1. Load chat history → `GET /api/ai/chat`
2. **Send message** → `POST /api/ai/generate` with `{ query: "..." }`
3. Display response → Filtered by role

### Slot Management Flow (Admin)
**Page:** `SlotManagement.jsx`

**Actions:**
1. View schedule → `GET /api/admin/schedule/:date`
2. **Set capacity** → `POST /api/admin/config/:terminalId` with `{ capacity, date }`
3. **Emergency override** → `POST /api/admin/config/late` with `{ terminalId, extraSlots, duration }`

---

## Button Labels → API Endpoints

| Button Label | API Endpoint | Role |
|--------------|--------------|------|
| "Sign In" | `POST /api/auth/login` | All |
| "Create Booking" | `POST /api/booking` | Carrier |
| "Download QR Code" | `GET /api/terminal/qr/:bookingId` | Carrier |
| "Validate" | `PUT /api/booking/:id/validate` | Operator |
| "Scan QR" | `POST /api/terminal/scan` | Operator |
| "Mark Complete" | `PUT /api/terminal/:terminalId/done` | Operator |
| "Save Changes" (Slots) | `POST /api/admin/config/:terminalId` | Admin |
| "Apply Override" | `POST /api/admin/config/late` | Admin |
| "Solve" (Incident) | `POST /api/report/solve` | Admin |
| "Send" (AI) | `POST /api/ai/generate` | All |

---

## Request/Response Examples

### Carrier: Create Booking
```javascript
// POST /api/booking
{
  "terminalId": "terminal-a",
  "date": "2024-02-06",
  "timeSlot": "09:00-10:00",
  "truckPlate": "TRK-123",
  "driverName": "Ahmed Benali",
  "driverPhone": "+213555123456",
  "cargoType": "Container"
}
```

### Operator: Validate Booking
```javascript
// PUT /api/booking/:id/validate
{
  "status": "CONFIRMED", // or "REJECTED"
  "reason": "Approved for terminal access" // optional
}
```

### Operator: Scan QR
```javascript
// POST /api/terminal/scan
{
  "qrCode": "B-2024-001-QR",
  "terminalId": "terminal-a",
  "action": "ENTRY" // or "EXIT"
}
```

### Admin: Set Capacity
```javascript
// POST /api/admin/config/:terminalId
{
  "date": "2024-02-06",
  "slots": [
    { "hour": "08:00-09:00", "maxTrucks": 10 },
    { "hour": "09:00-10:00", "maxTrucks": 10 }
  ]
}
```

### All: AI Query
```javascript
// POST /api/ai/generate
{
  "query": "What is the status of booking B-2024-001?",
  "context": {
    "role": "carrier", // filtered response
    "userId": "user-123"
  }
}
```

---

## Environment Configuration

Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

---

## Next Steps

1. ✅ UI is designed with correct button labels
2. ✅ Pages map to API endpoints
3. ⏳ Implement API service layer (`src/services/`)
4. ⏳ Add loading states and error handling
5. ⏳ Connect to actual backend when available

**Frontend is ready to integrate with the backend API!**
