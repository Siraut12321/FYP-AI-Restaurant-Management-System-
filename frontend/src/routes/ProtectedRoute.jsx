import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Spinner from '../components/Loading/Spinner';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Spinner />;
  if (!user) return <Navigate to='/login' replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to='/' replace />;

  return <Outlet />;
}

export default ProtectedRoute;
