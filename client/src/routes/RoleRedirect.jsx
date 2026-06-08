import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const dashboardRoles = ['Admin', 'Manager', 'Support Agent'];

const RoleRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={dashboardRoles.includes(user?.role) ? '/dashboard' : '/tickets'} replace />;
};

export default RoleRedirect;
