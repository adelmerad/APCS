import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import SlotManagement from './pages/SlotManagement';
import CreateBooking from './pages/CreateBooking';
import ReschedulePage from './pages/ReschedulePage';
import FleetManagement from './pages/FleetManagement';
import AIAssistant from './pages/AIAssistant';
import Operations from './pages/Operations';
import Logs from './pages/Logs';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
          {/* Protected Routes with Main Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute path="/dashboard">
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute path="/bookings">
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="slots"
              element={
                <ProtectedRoute path="/slots">
                  <SlotManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="create-booking"
              element={
                <ProtectedRoute path="/create-booking">
                  <CreateBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="reschedule"
              element={
                <ProtectedRoute path="/reschedule">
                  <ReschedulePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="fleet"
              element={
                <ProtectedRoute path="/fleet">
                  <FleetManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai-assistant"
              element={
                <ProtectedRoute path="/ai-assistant">
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="operations"
              element={
                <ProtectedRoute path="/operations">
                  <Operations />
                </ProtectedRoute>
              }
            />
            <Route
              path="logs"
              element={
                <ProtectedRoute path="/logs">
                  <Logs />
                </ProtectedRoute>
              }
            />
            <Route
              path="notifications"
              element={
                <ProtectedRoute path="/notifications">
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="users"
              element={
                <ProtectedRoute path="/users">
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                <ProtectedRoute path="/settings">
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
