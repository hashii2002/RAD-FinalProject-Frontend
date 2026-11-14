import {BrowserRouter, Routes, Route, Navigate,} from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardHome from "./components/dashboard/DashboardHome";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import PetManagement from "./pages/admin/PetManagement";
import PetOrders from "./pages/admin/PetOrders";
import TrainingPrograms from "./pages/admin/TrainingPrograms";
import TrainingBookings from "./pages/admin/TrainingBookings";
import UserManagement from "./pages/admin/UserManagement";
import PaymentManagement from "./pages/admin/PaymentManagement";
import Reports from "./pages/admin/Reports";
import MyProfile from "./pages/admin/MyProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================== Admin Routes ===========================*/}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardHome role="ADMIN" />
            </ProtectedRoute>
          }
        />
        {/* Admin Pet Management Route */}
        <Route
          path="/admin/pets"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PetManagement />
            </ProtectedRoute>
          }
        />
        {/* Admin Pet Orders Route */}
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PetOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/programs"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TrainingPrograms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <TrainingBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MyProfile />
            </ProtectedRoute>
          }
        />

        {/*===================== Trainer Routes ============================ */}
        <Route
          path="/trainer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["TRAINER"]}>
              <TrainerDashboard/>
            </ProtectedRoute>
          }
        />

        {/* ========================== Customer Routes ============================ */}
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default Route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


