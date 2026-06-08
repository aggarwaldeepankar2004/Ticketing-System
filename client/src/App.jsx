import { Route, Routes } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import TicketDetailsPage from './pages/tickets/TicketDetailsPage.jsx';
import TicketsPage from './pages/tickets/TicketsPage.jsx';
import UsersPage from './pages/users/UsersPage.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import RoleRedirect from './routes/RoleRedirect.jsx';

const App = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'Support Agent']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
        </Route>
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/" element={<RoleRedirect />} />
    </Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
