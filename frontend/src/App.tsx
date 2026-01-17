import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PilgrimsPage from './pages/PilgrimsPage';
import CreatePilgrimPage from './pages/CreatePilgrimPage';
import PilgrimDetailPage from './pages/PilgrimDetailPage';
import PilgrimEditPage from './pages/PilgrimEditPage';
import PaymentsPage from './pages/PaymentsPage';
import PaymentCreatePage from './pages/PaymentCreatePage';
import PaymentDetailPage from './pages/PaymentDetailPage';
import ExpensesPage from './pages/ExpensesPage';
import ExpenseCreatePage from './pages/ExpenseCreatePage';
import ExpenseDetailPage from './pages/ExpenseDetailPage';
import TreasuryPage from './pages/TreasuryPage';
import UsersPage from './pages/UsersPage';
import CreateUserPage from './pages/CreateUserPage';
import UserDetailPage from './pages/UserDetailPage';
import UserEditPage from './pages/UserEditPage';
import RolesPage from './pages/RolesPage';
import CreateRolePage from './pages/CreateRolePage';
import RoleEditPage from './pages/RoleEditPage';
import AgencySettingsPage from './pages/AgencySettingsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import TicketsPage from './pages/TicketsPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';
import './index.css';

console.log('App.tsx chargé');

function App() {
  const { token, getCurrentUser } = useAuthStore();

  useEffect(() => {
    console.log('App useEffect, token:', token);
    if (token) {
      getCurrentUser();
    }
  }, [token]);

  console.log('App render');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pilgrims"
          element={
            <ProtectedRoute>
              <Layout>
                <PilgrimsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pilgrims/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreatePilgrimPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pilgrims/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PilgrimDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/pilgrims/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <PilgrimEditPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments/create"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentCreatePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <PaymentDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpensesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/create"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpenseCreatePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ExpenseDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/treasury"
          element={
            <ProtectedRoute>
              <Layout>
                <TreasuryPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes Utilisateurs et Rôles (Admin uniquement) */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UsersPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateUserPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <UserDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <UserEditPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles"
          element={
            <ProtectedRoute>
              <Layout>
                <RolesPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles/create"
          element={
            <ProtectedRoute>
              <Layout>
                <CreateRolePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/roles/:id/edit"
          element={
            <ProtectedRoute>
              <Layout>
                <RoleEditPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes Reçus et Paramètres Agence */}
        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <Layout>
                <ReceiptsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/agency-settings"
          element={
            <ProtectedRoute>
              <Layout>
                <AgencySettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Routes Billetterie */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <Layout>
                <TicketsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/create"
          element={
            <ProtectedRoute>
              <Layout>
                <TicketCreatePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/tickets/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <TicketDetailPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
