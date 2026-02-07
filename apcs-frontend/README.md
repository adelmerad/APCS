# APCS - Algerian Port Community System

A modern, professional frontend application for managing port operations, bookings, and logistics.

## Features

- **Dashboard** - Real-time operational overview with KPIs and charts
- **Bookings Management** - Full lifecycle booking control with QR codes
- **Slot & Capacity Management** - Terminal flow control with heatmap visualization
- **Create Booking** - Step-by-step booking creation flow
- **Fleet Management** - Manage trucks and drivers
- **AI Logistics Assistant** - Conversational self-service interface
- **Operational Dashboard** - Live port control and monitoring
- **Traceability & Logs** - Complete audit trail
- **Notifications** - Real-time alerts and updates
- **Users & Roles** - Access control management
- **Settings** - User preferences and configuration

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons
- **Recharts** - Data visualization

## Installation

```bash
cd apcs-frontend
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Create a production build:

```bash
npm run build
```

## Project Structure

```
apcs-frontend/
├── src/
│   ├── components/       # Reusable components (Sidebar, Header)
│   ├── layouts/          # Layout components (MainLayout)
│   ├── pages/            # Page components
│   ├── App.jsx           # Main app with routing
│   ├── main.jsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind configuration
└── vite.config.js        # Vite configuration
```

## User Roles

- **Admin** - Full system control
- **Operator** - Terminal operations and validation
- **Carrier** - Booking creation and fleet management

---

© 2026 APCS - Algerian Port Community System
